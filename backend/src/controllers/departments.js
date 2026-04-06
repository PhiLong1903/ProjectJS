const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const departments_service_1 = require("../service/departments.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listDepartmentsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await departments_service_1.getDepartmentList(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách khoa thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.listDepartmentsAdminController = async (_req, res, next) => {
    try {
            const data = await departments_service_1.getDepartmentAdminList();
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách khoa (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.createDepartmentController = async (req, res, next) => {
    try {
            const data = await departments_service_1.createDepartmentService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo khoa thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.updateDepartmentController = async (req, res, next) => {
    try {
            const data = await departments_service_1.updateDepartmentService(req.params.departmentId, req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật khoa thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
exports.deleteDepartmentController = async (req, res, next) => {
    try {
            await departments_service_1.deleteDepartmentService(req.params.departmentId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa khoa thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "departments");
    }
};
