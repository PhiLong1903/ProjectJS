const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const bookings_service_1 = require("../service/bookings.service");
const { handleControllerError } = require("../utils/controller-error");
exports.createBookingController = async (req, res, next) => {
    try {
            const data = await bookings_service_1.createBooking({
                userId: req.user.id,
                roles: req.user.roles,
                departmentId: req.body.departmentId,
                doctorId: req.body.doctorId,
                slotId: req.body.slotId,
                reason: req.body.reason,
                notes: req.body.notes,
            });
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Đặt lịch khám thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.myBookingsController = async (req, res, next) => {
    try {
            const data = await bookings_service_1.getMyBookings(req.user.id);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy lịch khám của tôi thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.bookingsAdminController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await bookings_service_1.getBookingsAdmin(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách lịch khám (admin) thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.bookingDetailAdminController = async (req, res, next) => {
    try {
            const data = await bookings_service_1.getBookingDetailAdmin(req.params.bookingId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lay chi tiet lich kham thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.updateBookingStatusController = async (req, res, next) => {
    try {
            await bookings_service_1.updateBookingStatus(req.params.bookingId, req.body.status);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật trạng thái lịch khám thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
