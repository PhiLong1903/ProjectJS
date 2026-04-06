const http_status_codes_1 = require("http-status-codes");
const zod_1 = require("zod");
const api_response_1 = require("../utils/api-response");
const app_error_1 = require("../utils/app-error");
const notFoundHandler = (_req, res) => api_response_1.sendError(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy tài nguyên");
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ", error.flatten());
    }
    if (error instanceof app_error_1.AppError) {
        return api_response_1.sendError(res, error.statusCode, error.message, error.details);
    }
    const pgCode = error?.code;
    if (pgCode === "42P01") {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Database chưa khởi tạo schema. Vui lòng chạy npm run db:init trong thư mục backend.");
    }
    if (pgCode === "3D000") {
        return api_response_1.sendError(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Database chưa tồn tại. Kiểm tra DATABASE_URL và tạo database trước khi chạy backend.");
    }
    console.error("Unhandled error:", error);
    return api_response_1.sendError(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Lỗi hệ thống, vui lòng thử lại sau");
};
exports.errorHandler = errorHandler;
