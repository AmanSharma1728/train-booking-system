const { createClient } = require("redis");
const logger = require("../../shared/utils/logger");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis error: " + err.message);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error("Redis connection failed, retrying...");
    setTimeout(connectRedis, 5000);
  }
};

module.exports = { redisClient, connectRedis };