const Booking = require("./booking.model");

class BookingRepository {
  async create(data) {
    return await Booking.create(data);
  }

  async findById(id) {
    return await Booking.findById(id);
  }
}

module.exports = BookingRepository;
