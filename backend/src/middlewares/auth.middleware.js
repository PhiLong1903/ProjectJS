const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const tokenUtils = require("../utils/token");
const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const accessToken = authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : undefined;
    if (!accessToken) {
        return api_response.sendError(res, http_status_codes.StatusCodes.UNAUTHORIZED, "Thiếu access token");
    }
    try {
        const payload = tokenUtils.verifyAccessToken(accessToken);
        req.user = {
            id: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            roles: payload.roles,
        };
        next();
    }
    catch (_error) {
        return api_response.sendError(res, http_status_codes.StatusCodes.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn");
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    if (!req.user) {
        return api_response.sendError(res, http_status_codes.StatusCodes.UNAUTHORIZED, "Bạn chưa đăng nhập");
    }
    const isAllowed = allowedRoles.some((role) => userRoles.includes(role));
    if (!isAllowed) {
        return api_response.sendError(res, http_status_codes.StatusCodes.FORBIDDEN, "Bạn không có quyền truy cập tài nguyên này");
    }
    next();
};
exports.authorize = authorize;

