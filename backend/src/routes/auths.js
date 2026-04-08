const express = require("express");
const env = require("../config/env");
const authHandler = require("../utils/authHandler");
const rate_limit_middleware = require("../middlewares/rate-limit.middleware");
const validateHandler = require("../utils/validateHandler");
const auths = require("../controllers/auths");
const auths_validation = require("../utils/validators/auths.validation");
exports.authRoutes = express.Router();
const loginRateLimiter = rate_limit_middleware.createRateLimiter({
    keyPrefix: "auth-login",
    windowMs: env.env.LOGIN_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.env.LOGIN_RATE_LIMIT_MAX,
    message: "Bạn thao tác đăng nhập quá nhanh. Vui lòng thử lại sau ít phút.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.email ?? "").toLowerCase().trim()}`,
});
const forgotPasswordRateLimiter = rate_limit_middleware.createRateLimiter({
    keyPrefix: "auth-forgot-password",
    windowMs: env.env.LOGIN_RATE_LIMIT_WINDOW_MS,
    maxRequests: Math.max(3, Math.floor(env.env.LOGIN_RATE_LIMIT_MAX / 2)),
    message: "Ban thao tac quen mat khau qua nhanh. Vui long thu lai sau it phut.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.identifier ?? "").toLowerCase().trim()}`,
});
exports.authRoutes.post("/register", validateHandler.validateBody(auths_validation.registerSchema), auths.registerController);
exports.authRoutes.post("/login", loginRateLimiter, validateHandler.validateBody(auths_validation.loginSchema), auths.loginController);
exports.authRoutes.post("/forgot-password", forgotPasswordRateLimiter, validateHandler.validateBody(auths_validation.forgotPasswordSchema), auths.forgotPasswordController);
exports.authRoutes.post("/reset-password/:token", validateHandler.validateBody(auths_validation.resetPasswordSchema), auths.resetPasswordController);
exports.authRoutes.post("/refresh", auths.refreshController);
exports.authRoutes.post("/logout", auths.logoutController);
exports.authRoutes.get("/me", authHandler.CheckLogin, auths.meController);
