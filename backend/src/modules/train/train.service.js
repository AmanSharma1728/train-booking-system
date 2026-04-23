const TrainRepository = require("./train.repository");
const { redisClient } = require("../../infrastructure/redis/redis.client");
const logger = require("../../shared/utils/logger");
class TrainService {
  constructor(TrainRepository) {
    this.trainRepository = TrainRepository;
  }

  async searchTrains(from, to, date) {
    if (!from || !to || !date) {
      throw new Error("kindly fill all fields");
    }

    if (from === to) {
      throw new Error("Source and Destination cannot be the same");
    }
    
    console.log("Redis Status:", redisClient.isOpen);
    const cacheKey = `search:${from.toUpperCase()}:${to.toUpperCase()}:${date}`;
    const TTL = 600;
    try {
     
      if (redisClient.isOpen) {
        const cachedTrains = await redisClient.get(cacheKey);
        if (cachedTrains) {
          logger.info(`Cache Hit for key: ${cacheKey}`);
          return JSON.parse(cachedTrains);
        } 
      }
    } catch (err) {
      logger.error("Redis Get Error: " + err.message);
    }

    const query = {
      src: from,
      dest: to,
    };

    if (date) {
      query.date = date;
    }
    const trains = await this.trainRepository.findByQuery(query);
    try {
      if (redisClient.isOpen && trains.length > 0) {
        await redisClient.setEx(cacheKey,TTL, JSON.stringify(trains));
      }
    } catch (saveErr) {
      console.error(" REDIS SAVE ERROR:", saveErr.message);
    }
    return trains;
  }
}

module.exports = TrainService;
