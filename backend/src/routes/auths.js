const express_1 = require("express");
const env_1 = require("../config/env");
const authHandler_1 = require("../utils/authHandler");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const validateHandler_1 = require("../utils/validateHandler");
const auths_1 = require("../controllers/auths");
const auths_validation_1 = require("../utils/validators/auths.validation");
exports.authRoutes = express_1.Router();
const loginRateLimiter = rate_limit_middleware_1.createRateLimiter({
    keyPrefix: "auth-login",
    windowMs: env_1.env.LOGIN_RATE_LIMIT_WINDOW_MS,
    maxRequests: env_1.env.LOGIN_RATE_LIMIT_MAX,
    message: "Bạn thao tác đăng nhập quá nhanh. Vui lòng thử lại sau ít phút.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.email ?? "").toLowerCase().trim()}`,
});
const forgotPasswordRateLimiter = rate_limit_middleware_1.createRateLimiter({
    keyPrefix: "auth-forgot-password",
    windowMs: env_1.env.LOGIN_RATE_LIMIT_WINDOW_MS,
    maxRequests: Math.max(3, Math.floor(env_1.env.LOGIN_RATE_LIMIT_MAX / 2)),
    message: "Ban thao tac quen mat khau qua nhanh. Vui long thu lai sau it phut.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.identifier ?? "").toLowerCase().trim()}`,
});
exports.authRoutes.post("/register", validateHandler_1.validateBody(auths_validation_1.registerSchema), auths_1.registerController);
exports.authRoutes.post("/login", loginRateLimiter, validateHandler_1.validateBody(auths_validation_1.loginSchema), auths_1.loginController);
exports.authRoutes.post("/forgot-password", forgotPasswordRateLimiter, validateHandler_1.validateBody(auths_validation_1.forgotPasswordSchema), auths_1.forgotPasswordController);
exports.authRoutes.post("/reset-password/:token", validateHandler_1.validateBody(auths_validation_1.resetPasswordSchema), auths_1.resetPasswordController);
exports.authRoutes.post("/refresh", auths_1.refreshController);
exports.authRoutes.post("/logout", auths_1.logoutController);
exports.authRoutes.get("/me", authHandler_1.CheckLogin, auths_1.meController);
