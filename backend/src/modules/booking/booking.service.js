const lockService = require("../../infrastructure/redis/lock.service");
const logger = require("../../shared/utils/logger");

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

    const expiryTimestamp = Date.now() + 60 * 1000; // 1 minute from now

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

    // 5. Transition state to PAYMENT_PENDING
    booking.status = "PAYMENT_PENDING";
    await booking.save();

    // 6. Return mock payment URL
    return {
      paymentUrl: `https://rzp.io/l/mock_payment_${booking._id}`,
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
