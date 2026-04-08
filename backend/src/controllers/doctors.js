const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const doctors_service = require("../service/doctors.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listDoctorsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : undefined;
            const result = await doctors_service.getDoctors(pageSize, offset, departmentId, keyword || undefined);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách bác sĩ thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.listDoctorsAdminController = async (_req, res, next) => {
    try {
            const data = await doctors_service.getDoctorsAdmin();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách bác sĩ (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.createDoctorController = async (req, res, next) => {
    try {
            const data = await doctors_service.createDoctorService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.updateDoctorController = async (req, res, next) => {
    try {
            const data = await doctors_service.updateDoctorService(req.params.doctorId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.deleteDoctorController = async (req, res, next) => {
    try {
            await doctors_service.deleteDoctorService(req.params.doctorId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa bác sĩ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.listDoctorSlotsController = async (req, res, next) => {
    try {
            const date = typeof req.query.date === "string" ? req.query.date : undefined;
            const data = await doctors_service.getDoctorSlots(req.params.doctorId, date);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy khung giờ khám thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.createDoctorSlotController = async (req, res, next) => {
    try {
            const data = await doctors_service.createDoctorSlotService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo khung giờ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
exports.deleteDoctorSlotController = async (req, res, next) => {
    try {
            await doctors_service.deleteDoctorSlotService(req.params.slotId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa khung giờ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctors");
    }
};
