const http_status_codes = require("http-status-codes");
const env = require("../config/env");
const api_response = require("../utils/api-response");
const auths_service = require("../service/auths.service");
const { handleControllerError } = require("../utils/controller-error");
const REFRESH_COOKIE_NAME = "refresh_token";
const getCookieConfig = () => ({
    httpOnly: true,
    secure: env.env.COOKIE_SECURE,
    sameSite: (env.env.COOKIE_SECURE ? "none" : "lax"),
    maxAge: env.env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
});
exports.registerController = async (req, res, next) => {
    try {
            const result = await auths_service.register(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Đăng ký thành công. Vui lòng đăng nhập để đặt lịch.", result);
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
exports.loginController = async (req, res, next) => {
    try {
            const result = await auths_service.login(req.body, {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieConfig());
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Đăng nhập thành công", {
                user: result.user,
                accessToken: result.accessToken,
            });
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
exports.forgotPasswordController = async (req, res, next) => {
    try {
            const result = await auths_service.forgotPassword(req.body, {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, result.message);
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
exports.resetPasswordController = async (req, res, next) => {
    try {
            const result = await auths_service.resetPassword(req.params.token, req.body, {
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, result.message);
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
exports.refreshController = async (req, res, next) => {
    try {
            const token = req.cookies?.[REFRESH_COOKIE_NAME];
            const result = await auths_service.refreshAccessToken(token);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lam moi token thanh cong", result);
    }
    catch (error) {
        if (error?.statusCode === http_status_codes.StatusCodes.UNAUTHORIZED) {
            res.clearCookie(REFRESH_COOKIE_NAME, {
                ...getCookieConfig(),
                maxAge: 0,
            });
        }
        return handleControllerError(res, error, "auths");
    }
};
exports.logoutController = async (req, res, next) => {
    try {
            const token = req.cookies?.[REFRESH_COOKIE_NAME];
            if (token) {
                await auths_service.logout(token);
            }
            res.clearCookie(REFRESH_COOKIE_NAME, {
                ...getCookieConfig(),
                maxAge: 0,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Đăng xuất thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
exports.meController = async (req, res, next) => {
    try {
            const user = await auths_service.getCurrentUser(req.user.id);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy thông tin người dùng thành công", user);
    }
    catch (error) {
        return handleControllerError(res, error, "auths");
    }
};
