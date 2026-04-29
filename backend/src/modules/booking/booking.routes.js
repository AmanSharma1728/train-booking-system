const express = require("express");
const router = express.Router();
const authMiddleware = require("../../shared/middlewares/auth.middleware");
const BookingController = require("./booking.controller");
const BookingService = require("./booking.service");
const BookingRepository = require("./booking.repository");
const TrainRepository = require("../train/train.repository");

const trainRepository = new TrainRepository();
const bookingRepository = new BookingRepository();
const bookingService = new BookingService({ bookingRepository, trainRepository });
const bookingController = new BookingController(bookingService);

router.post("/hold", authMiddleware, bookingController.holdSeat);
router.post("/:id/confirm", authMiddleware, bookingController.confirmBooking);
router.post("/verify", authMiddleware, bookingController.verifyPayment);
router.get("/:id", authMiddleware, bookingController.getBooking);

module.exports = router;
