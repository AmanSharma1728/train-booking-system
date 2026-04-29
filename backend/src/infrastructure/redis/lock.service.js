const { redisClient } = require("./redis.client");
const logger = require("../../shared/utils/logger");

class LockService {
  /**
   * Acquires a temporary seat hold lock using an atomic Lua script.
   * @param {string} trainId
   * @param {string} date
   * @param {string} classCode
   * @param {string} userId
   * @param {number} requestedSeats
   * @param {number} totalCapacity
   * @returns {Promise<boolean>}
   */
  async acquireHold(trainId, date, classCode, userId, requestedSeats, totalCapacity) {
    if (!redisClient.isOpen) {
      logger.error("Redis is not open. Cannot acquire hold.");
      throw new Error("Redis unavailable");
    }

    const pattern = `hold:${trainId}:${date}:${classCode}:*`;
    const newKey = `hold:${trainId}:${date}:${classCode}:${userId}`;
    const ttl = 120; // 2 minutes

    const luaScript = `
      local keys = redis.call('KEYS', ARGV[1])
      local currentHolds = 0
      for i, key in ipairs(keys) do
          local val = redis.call('GET', key)
          if val then
              currentHolds = currentHolds + tonumber(val)
          end
      end

      if (currentHolds + tonumber(ARGV[2])) <= tonumber(ARGV[3]) then
          redis.call('SETEX', ARGV[4], tonumber(ARGV[5]), ARGV[2])
          return 1
      else
          return 0
      end
    `;

    try {
      const result = await redisClient.eval(luaScript, {
        arguments: [pattern, requestedSeats.toString(), totalCapacity.toString(), newKey, ttl.toString()],
      });

      return result === 1;
    } catch (err) {
      logger.error("Error executing Redis Lua script: " + err.message);
      return false;
    }
  }

  async isHoldValid(holdKey) {
    if (!redisClient.isOpen) {
      logger.error("Redis is not open. Cannot verify hold.");
      return false;
    }
    const val = await redisClient.get(holdKey);
    return val !== null;
  }
}

module.exports = new LockService();
