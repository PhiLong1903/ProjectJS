const redis = require("redis");
const env = require("./env");
let redisClient = null;
let redisInitStarted = false;
const getRedisClient = () => {
    if (!env.env.REDIS_RATE_LIMIT_ENABLED || !env.env.REDIS_URL) {
        return null;
    }
    if (redisClient) {
        return redisClient;
    }
    redisClient = redis.createClient({
        url: env.env.REDIS_URL,
    });
    redisClient.on("error", (error) => {
        console.error("Redis error:", error);
    });
    if (!redisInitStarted) {
        redisInitStarted = true;
        void redisClient.connect().catch((error) => {
            console.error("Redis connect failed:", error);
        });
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
