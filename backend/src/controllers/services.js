const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const services_service_1 = require("../service/services.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listServicesController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await services_service_1.getServices(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách dịch vụ thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.listServicesAdminController = async (_req, res, next) => {
    try {
            const data = await services_service_1.getServicesAdmin();
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách dịch vụ (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.createServiceController = async (req, res, next) => {
    try {
            const data = await services_service_1.createService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo dịch vụ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.updateServiceController = async (req, res, next) => {
    try {
            const data = await services_service_1.updateService(req.params.serviceId, req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật dịch vụ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
exports.deleteServiceController = async (req, res, next) => {
    try {
            await services_service_1.deleteService(req.params.serviceId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa dịch vụ thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "services");
    }
};
