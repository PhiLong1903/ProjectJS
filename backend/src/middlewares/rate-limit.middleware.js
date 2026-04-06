const http_status_codes_1 = require("http-status-codes");
const redis_1 = require("../config/redis");
const api_response_1 = require("../utils/api-response");
const buckets = new Map();
const getDefaultKey = (req) => req.ip || "unknown-ip";
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
}, 60 * 1000).unref();
const createRateLimiter = (options) => {
    return async (req, res, next) => {
        const now = Date.now();
        const customKey = options.keyResolver?.(req) ?? getDefaultKey(req);
        const key = `${options.keyPrefix}:${customKey}`;
        const redis = redis_1.getRedisClient();
        if (redis?.isOpen) {
            try {
                const count = await redis.incr(key);
                if (count === 1) {
                    await redis.pExpire(key, options.windowMs);
                    return next();
                }
                if (count > options.maxRequests) {
                    const ttlMs = await redis.pTTL(key);
                    const retryAfterSec = Math.max(1, Math.ceil(Math.max(ttlMs, 1000) / 1000));
                    res.setHeader("Retry-After", String(retryAfterSec));
                    return api_response_1.sendError(res, http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, options.message);
                }
                return next();
            }
            catch (error) {
                console.error("Redis rate limit failed, fallback to in-memory bucket:", error);
            }
        }
        const existing = buckets.get(key);
        if (!existing || existing.resetAt <= now) {
            buckets.set(key, {
                count: 1,
                resetAt: now + options.windowMs,
            });
            return next();
        }
        if (existing.count >= options.maxRequests) {
            const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
            res.setHeader("Retry-After", String(retryAfterSec));
            return api_response_1.sendError(res, http_status_codes_1.StatusCodes.TOO_MANY_REQUESTS, options.message);
        }
        existing.count += 1;
        buckets.set(key, existing);
        return next();
    };
};
exports.createRateLimiter = createRateLimiter;
