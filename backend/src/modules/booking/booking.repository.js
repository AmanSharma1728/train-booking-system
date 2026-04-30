const Booking = require("./booking.model");

class BookingRepository {
  async create(data) {
    return await Booking.create(data);
  }

  async findById(id) {
    return await Booking.findById(id);
  }

  async findByUser(userId) {
    return await Booking.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findFirstInQueue(trainId, date, classCode, status) {
    return await Booking.findOne({
      trainId,
      date,
      classCode,
      status
    }).sort({ createdAt: 1 });
  }
}

module.exports = BookingRepository;
