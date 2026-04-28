const express = require("express");
const router = express.Router();

const userRoutes = require("./modules/user/user.routes");
const bookingRoutes = require("./modules/booking/booking.routes");

router.use("/auth", userRoutes);
router.use("/bookings", bookingRoutes);

module.exports = router;