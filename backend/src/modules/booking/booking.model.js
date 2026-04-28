const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainId: {
      type: String,
      required: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    pnr: {
      type: String,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    classCode: {
      type: String,
      required: true,
    },
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
      },
    ],
    totalFare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "SEAT_HELD",
        "PAYMENT_PENDING",
        "CONFIRMED",
        "RAC",
        "WAITLISTED",
        "CANCELLED",
      ],
      default: "SEAT_HELD",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
