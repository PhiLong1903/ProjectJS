const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const pagination_1 = require("../utils/pagination");
const news_service_1 = require("../service/news.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listNewsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination_1.getPaginationParams(req);
            const result = await news_service_1.getPublicNews(pageSize, offset);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách tin tức thành công", result.rows, pagination_1.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.getNewsDetailController = async (req, res, next) => {
    try {
            const data = await news_service_1.getNewsDetail(req.params.slug);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy chi tiết tin tức thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.listNewsAdminController = async (_req, res, next) => {
    try {
            const data = await news_service_1.getAdminNews();
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách tin tức (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.createNewsController = async (req, res, next) => {
    try {
            const data = await news_service_1.createNewsService(req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.CREATED, "Tạo bài viết thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.updateNewsController = async (req, res, next) => {
    try {
            const data = await news_service_1.updateNewsService(req.params.newsId, req.body);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật bài viết thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.deleteNewsController = async (req, res, next) => {
    try {
            await news_service_1.deleteNewsService(req.params.newsId);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Xóa bài viết thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
