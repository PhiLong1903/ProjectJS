const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const doctors_service_1 = require("../service/doctors.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listDoctorsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : undefined;
            const result = await doctors_service_1.getDoctors(pageSize, offset, departmentId, keyword || undefined);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách bác sĩ thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.listDoctorsAdminController = async (_req, res, next) => {
    try {
            const data = await doctors_service_1.getDoctorsAdmin();
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách bác sĩ (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.createDoctorController = async (req, res, next) => {
    try {
            const data = await doctors_service_1.createDoctorService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.updateDoctorController = async (req, res, next) => {
    try {
            const data = await doctors_service_1.updateDoctorService(req.params.doctorId, req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.deleteDoctorController = async (req, res, next) => {
    try {
            await doctors_service_1.deleteDoctorService(req.params.doctorId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa bác sĩ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.listDoctorSlotsController = async (req, res, next) => {
    try {
            const date = typeof req.query.date === "string" ? req.query.date : undefined;
            const data = await doctors_service_1.getDoctorSlots(req.params.doctorId, date);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy khung giờ khám thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.createDoctorSlotController = async (req, res, next) => {
    try {
            const data = await doctors_service_1.createDoctorSlotService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo khung giờ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.deleteDoctorSlotController = async (req, res, next) => {
    try {
            await doctors_service_1.deleteDoctorSlotService(req.params.slotId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa khung giờ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
