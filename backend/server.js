require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = require("./src/app");
const connectDB = require("./src/infrastructure/database/mongo.connection");
const { connectRedis } = require("./src/infrastructure/redis/redis.client");
const logger = require("./src/shared/utils/logger");
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();