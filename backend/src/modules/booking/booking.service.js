const lockService = require("../../infrastructure/redis/lock.service");
const logger = require("../../shared/utils/logger");

class BookingService {
  constructor({ bookingRepository, trainRepository }) {
    this.bookingRepository = bookingRepository;
    this.trainRepository = trainRepository;
  }

  async holdSeat(userId, bookingData) {
    const { trainId, date, classCode, requestedSeats } = bookingData;

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

    const expiryTimestamp = Date.now() + 600 * 1000; // 10 minutes from now

    return {
      hold_token: `hold:${trainId}:${date}:${classCode}:${userId}`,
      expiry_timestamp: expiryTimestamp,
    };
  }
}

module.exports = BookingService;
