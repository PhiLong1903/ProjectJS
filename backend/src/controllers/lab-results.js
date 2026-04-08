const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const lab_results_service = require("../service/lab-results.service");
const { handleControllerError } = require("../utils/controller-error");
exports.lookupLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service.lookupLabResultService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Tra cứu kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.listLabResultsAdminController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await lab_results_service.getLabResultsAdmin(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách kết quả cận lâm sàng (admin) thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.labResultDetailAdminController = async (req, res, next) => {
    try {
            const data = await lab_results_service.getLabResultDetailAdmin(req.params.labResultId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay chi tiet ket qua can lam sang thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.createLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service.createLabResultService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.updateLabResultController = async (req, res, next) => {
    try {
            const data = await lab_results_service.updateLabResultService(req.params.labResultId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật kết quả cận lâm sàng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
exports.deleteLabResultController = async (req, res, next) => {
    try {
            await lab_results_service.deleteLabResultService(req.params.labResultId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa kết quả cận lâm sàng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "lab-results");
    }
};
