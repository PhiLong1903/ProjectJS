const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const departments_service = require("../service/departments.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listDepartmentsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await departments_service.getDepartmentList(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách khoa thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.listDepartmentsAdminController = async (_req, res, next) => {
    try {
            const data = await departments_service.getDepartmentAdminList();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách khoa (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.createDepartmentController = async (req, res, next) => {
    try {
            const data = await departments_service.createDepartmentService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo khoa thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.updateDepartmentController = async (req, res, next) => {
    try {
            const data = await departments_service.updateDepartmentService(req.params.departmentId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật khoa thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.deleteDepartmentController = async (req, res, next) => {
    try {
            await departments_service.deleteDepartmentService(req.params.departmentId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa khoa thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
