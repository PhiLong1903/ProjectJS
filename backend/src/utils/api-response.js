const sendSuccess = (res, statusCode, message, data, meta) => res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
    meta: meta ?? null,
});
exports.sendSuccess = sendSuccess;
const sendError = (res, statusCode, message, details) => res.status(statusCode).json({
    success: false,
    message,
    details: details ?? null,
});
exports.sendError = sendError;
