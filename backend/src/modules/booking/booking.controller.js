const logger = require("../../shared/utils/logger");

class BookingController {
  constructor(bookingService) {
    this.bookingService = bookingService;
  }

  holdSeat = async (req, res, next) => {
    try {
      const { trainId, date, classCode, requestedSeats, passengers } = req.body;
      const userId = req.user.id;

      if (!trainId || !date || !classCode || !requestedSeats || !passengers) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (typeof requestedSeats !== "number" || requestedSeats <= 0) {
        return res.status(400).json({ error: "Invalid number of seats" });
      }

      if (!Array.isArray(passengers) || passengers.length !== requestedSeats) {
        return res.status(400).json({ error: "Passenger details must match requested seats" });
      }

      const result = await this.bookingService.holdSeat(userId, {
        trainId,
        date,
        classCode,
        requestedSeats,
        passengers,
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

  confirmBooking = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await this.bookingService.confirmBooking(userId, id);

      return res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller (Confirm) Error: " + err.message);
      next(err);
    }
  };

  getBooking = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await this.bookingService.getBookingById(userId, id);

      return res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller (Get) Error: " + err.message);
      next(err);
    }
  };

  verifyPayment = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const payload = req.body;

      const result = await this.bookingService.verifyPayment(userId, payload);

      return res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller (Verify) Error: " + err.message);
      next(err);
    }
  };

  getHistory = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await this.bookingService.getHistory(userId);
      return res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller (History) Error: " + err.message);
      next(err);
    }
  };

  cancelBooking = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await this.bookingService.cancelBooking(userId, id);
      return res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      logger.error("Booking Controller (Cancel) Error: " + err.message);
      next(err);
    }
  };
}

module.exports = BookingController;
