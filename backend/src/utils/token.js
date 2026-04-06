const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const signAccessToken = (payload) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
};
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const signRefreshToken = (payload) => {
    const expiresInSeconds = env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60;
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: expiresInSeconds,
    });
};
exports.signRefreshToken = signRefreshToken;
const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
exports.hashToken = hashToken;
const refreshTokenExpiresAt = () => {
    const ttlInMs = env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ttlInMs);
};
exports.refreshTokenExpiresAt = refreshTokenExpiresAt;
