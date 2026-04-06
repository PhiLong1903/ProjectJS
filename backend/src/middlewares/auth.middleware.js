const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const token_1 = require("../utils/token");
const authenticate = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.split(" ")[1] : undefined;
    if (!token) {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Thiếu access token");
    }
    try {
        const payload = token_1.verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            email: payload.email,
            fullName: payload.fullName,
            roles: payload.roles,
        };
        next();
    }
    catch (_error) {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Token không hợp lệ hoặc đã hết hạn");
    }
};
exports.authenticate = authenticate;
const authorize = (...allowedRoles) => (req, res, next) => {
    const userRoles = req.user?.roles ?? [];
    if (!req.user) {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, "Bạn chưa đăng nhập");
    }
    const isAllowed = allowedRoles.some((role) => userRoles.includes(role));
    if (!isAllowed) {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.FORBIDDEN, "Bạn không có quyền truy cập tài nguyên này");
    }
    next();
};
exports.authorize = authorize;
