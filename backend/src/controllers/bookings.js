const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const bookings_service = require("../service/bookings.service");
const { handleControllerError } = require("../utils/controller-error");
exports.createBookingController = async (req, res, next) => {
    try {
            const data = await bookings_service.createBooking({
                userId: req.user.id,
                roles: req.user.roles,
                departmentId: req.body.departmentId,
                doctorId: req.body.doctorId,
                slotId: req.body.slotId,
                reason: req.body.reason,
                notes: req.body.notes,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Đặt lịch khám thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.myBookingsController = async (req, res, next) => {
    try {
            const data = await bookings_service.getMyBookings(req.user.id);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy lịch khám của tôi thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.bookingsAdminController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await bookings_service.getBookingsAdmin(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách lịch khám (admin) thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.bookingDetailAdminController = async (req, res, next) => {
    try {
            const data = await bookings_service.getBookingDetailAdmin(req.params.bookingId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay chi tiet lich kham thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
exports.updateBookingStatusController = async (req, res, next) => {
    try {
            await bookings_service.updateBookingStatus(req.params.bookingId, req.body.status);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật trạng thái lịch khám thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "bookings");
    }
};
