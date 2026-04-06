const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const lab_results_service_1 = require("../service/lab-results.service");
const { handleControllerError } = require("../utils/controller-error");
exports.lookupLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service_1.lookupLabResultService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Tra cứu kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.listLabResultsAdminController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await lab_results_service_1.getLabResultsAdmin(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách kết quả cận lâm sàng (admin) thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.labResultDetailAdminController = async (req, res, next) => {
    try {
            const data = await lab_results_service_1.getLabResultDetailAdmin(req.params.labResultId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lay chi tiet ket qua can lam sang thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.createLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service_1.createLabResultService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.updateLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service_1.updateLabResultService(req.params.labResultId, req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.deleteLabResultController = async (req, res, next) => {
    try {
            await lab_results_service_1.deleteLabResultService(req.params.labResultId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa kết quả cận lâm sàng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
