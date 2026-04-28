const logger = require("../../shared/utils/logger");

class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  holdSeat = async (req, res, next) => {
    try {
      const { trainId, date, classCode, requestedSeats } = req.body;
      const userId = req.user.id;

      if (!trainId || !date || !classCode || !requestedSeats) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (typeof requestedSeats !== "number" || requestedSeats <= 0) {
        return res.status(400).json({ error: "Invalid number of seats" });
      }

      const result = await this.bookingService.holdSeat(userId, {
        trainId,
        date,
        classCode,
        requestedSeats,
      });

      return res.status(201).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller Error: " + err.message);
      next(err);
    }
  };
}

module.exports = BookingController;
