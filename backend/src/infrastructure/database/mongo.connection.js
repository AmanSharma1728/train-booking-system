const mongoose = require("mongoose");
const logger = require("../../shared/utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed: " + err.message);

    // Retry logic
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;