const lockService = require("../../infrastructure/redis/lock.service");
const logger = require("../../shared/utils/logger");
const { redisClient } = require("../../infrastructure/redis/redis.client");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

class BookingService {
  constructor({ bookingRepository, trainRepository }) {
    this.bookingRepository = bookingRepository;
    this.trainRepository = trainRepository;
  }

  async holdSeat(userId, bookingData) {
    const { trainId, date, classCode, requestedSeats, passengers } = bookingData;

    // 1. Get Train details from MongoDB
    const train = await this.trainRepository.findById(trainId);
    if (!train) {
      throw { status: 404, message: "Train not found" };
    }

    // 2. Get total available capacity for the class from MongoDB
    const classInventory = train.inventory.get(classCode);
    if (!classInventory) {
      throw { status: 400, message: "Invalid class code for this train" };
    }

    const totalCapacity = classInventory.available;

    // 3. Attempt to acquire hold in Redis
    let isHoldAcquired;
    try {
      isHoldAcquired = await lockService.acquireHold(
        trainId,
        date,
        classCode,
        userId,
        requestedSeats,
        totalCapacity
      );
    } catch (err) {
      if (err.message === "Redis unavailable") {
        throw { status: 503, message: "Service temporarily unavailable. Please try again later." };
      }
      throw err;
    }

    if (!isHoldAcquired) {
      throw { status: 409, message: "Not enough seats available" };
    }

    // 4. Calculate Fare
    const totalFare = requestedSeats * classInventory.price;

    // 5. Generate Temporary PNR
    const tmpPnr = `TMP_PNR_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 6. Create Persistent Booking in MongoDB
    const booking = await this.bookingRepository.create({
      user: userId,
      trainId,
      trainName: train.name,
      src: train.src,
      dest: train.dest,
      departure: train.departure,
      arrival: train.arrival,
      pnr: tmpPnr,
      date,
      classCode,
      passengers,
      totalFare,
      status: "SEAT_HELD",
    });

    const expiryTimestamp = Date.now() + 120 * 1000; // 2 minutes from now

    return {
      holdId: booking._id,
      totalFare: booking.totalFare,
      expiry_timestamp: expiryTimestamp,
    };
  }

  async confirmBooking(userId, holdId) {
    // 1. Find the booking
    const booking = await this.bookingRepository.findById(holdId);
    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    // 2. Verify ownership
    if (booking.user.toString() !== userId) {
      throw { status: 403, message: "Forbidden: You do not own this booking" };
    }

    // 3. Check if status is already beyond SEAT_HELD
    if (booking.status !== "SEAT_HELD") {
      throw { status: 400, message: `Booking is already in ${booking.status} state` };
    }

    // 4. Verify Redis hold still exists
    const holdKey = `hold:${booking.trainId}:${booking.date}:${booking.classCode}:${userId}`;
    const holdExists = await lockService.isHoldValid(holdKey);

    if (!holdExists) {
      throw { status: 410, message: "Seat hold has expired" };
    }

    // 5. Create real Razorpay Order
    try {
      const options = {
        amount: booking.totalFare * 100, // in paise
        currency: "INR",
        receipt: `receipt_${booking._id}`,
      };

      const order = await razorpay.orders.create(options);

      // 6. Transition state to PAYMENT_PENDING and store order ID
      booking.status = "PAYMENT_PENDING";
      booking.razorpayOrderId = order.id;
      await booking.save();

      return {
        razorpay_order_id: order.id,
        totalFare: booking.totalFare,
        holdId: booking._id,
        key_id: process.env.RAZORPAY_API_KEY,
      };
    } catch (err) {
      logger.error("Razorpay Order Creation Error: " + err.message);
      throw { status: 500, message: "Failed to initiate payment. Please try again." };
    }
  }

  async verifyPayment(userId, payload) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, holdId } = payload;

    // 1. Verify Signature (Allow mock_signature for testing/dev)
    if (razorpay_signature !== "mock_signature") {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        throw { status: 400, message: "Invalid payment signature" };
      }
    }

    // 2. Find Booking
    const booking = await this.bookingRepository.findById(holdId);
    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    if (booking.razorpayOrderId !== razorpay_order_id && razorpay_signature !== "mock_signature") {
      throw { status: 400, message: "Order ID mismatch" };
    }

    if (booking.status !== "PAYMENT_PENDING") {
      throw { status: 400, message: "Booking is not in pending payment state" };
    }

    // 3. Verify Redis hold still exists (Last second check)
    const holdKey = `hold:${booking.trainId}:${booking.date}:${booking.classCode}:${userId}`;
    const holdExists = await lockService.isHoldValid(holdKey);

    if (!holdExists) {
      throw { status: 410, message: "Seat hold expired during payment. Refund will be initiated." };
    }

    // 4. Finalize Booking
    const realPnr = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const coach = ["B1", "B2", "S1", "S2", "A1"][Math.floor(Math.random() * 5)];
    const seatNumber = Math.floor(Math.random() * 72) + 1;
    const seatInfo = `${coach}-${seatNumber}`;

    // c. Decrement Inventory in MongoDB (Now finalized)
    await this.trainRepository.decrementInventory(
      booking.trainId,
      booking.classCode,
      booking.passengers.length
    );

    // d. Update Booking Record
    booking.status = "CONFIRMED";
    booking.pnr = realPnr;
    booking.seatInfo = seatInfo;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    await booking.save();

    console.log(`[DEBUG] Booking ${booking._id} CONFIRMED. PNR: ${realPnr}`);

    // e. Invalidate Search Cache for this route/date
    if (booking.src && booking.dest && booking.date) {
      const searchCacheKey = `search:${booking.src.toUpperCase()}:${booking.dest.toUpperCase()}:${booking.date}`;
      console.log(`[DEBUG] Invalidating search cache: ${searchCacheKey}`);
      await redisClient.del(searchCacheKey);
    }

    // f. Clear specific hold in Redis
    await redisClient.del(holdKey);

    return {
      status: "CONFIRMED",
      pnr: realPnr,
      seatInfo: seatInfo,
      bookingId: booking._id,
    };
  }

  async getBookingById(userId, bookingId) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw { status: 404, message: "Booking not found" };
    }

    if (booking.user.toString() !== userId) {
      throw { status: 403, message: "Forbidden: You do not own this booking" };
    }

    return booking;
  }
}

module.exports = BookingService;
