const redis_1 = require("redis");
const env_1 = require("./env");
let redisClient = null;
let redisInitStarted = false;
const getRedisClient = () => {
    if (!env_1.env.REDIS_RATE_LIMIT_ENABLED || !env_1.env.REDIS_URL) {
        return null;
    }
    if (redisClient) {
        return redisClient;
    }
    redisClient = redis_1.createClient({
        url: env_1.env.REDIS_URL,
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
