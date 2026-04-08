const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const services_service = require("../service/services.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listServicesController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await services_service.getServices(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách dịch vụ thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.listServicesAdminController = async (_req, res, next) => {
    try {
            const data = await services_service.getServicesAdmin();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách dịch vụ (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.createServiceController = async (req, res, next) => {
    try {
            const data = await services_service.createService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo dịch vụ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.updateServiceController = async (req, res, next) => {
    try {
            const data = await services_service.updateService(req.params.serviceId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật dịch vụ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.deleteServiceController = async (req, res, next) => {
    try {
            await services_service.deleteService(req.params.serviceId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa dịch vụ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
