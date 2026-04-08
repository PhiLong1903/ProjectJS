const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const news_service = require("../service/news.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listNewsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const result = await news_service.getPublicNews(pageSize, offset);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách tin tức thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.getNewsDetailController = async (req, res, next) => {
    try {
            const data = await news_service.getNewsDetail(req.params.slug);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy chi tiết tin tức thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.listNewsAdminController = async (_req, res, next) => {
    try {
            const data = await news_service.getAdminNews();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách tin tức (admin) thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.createNewsController = async (req, res, next) => {
    try {
            const data = await news_service.createNewsService(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo bài viết thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.updateNewsController = async (req, res, next) => {
    try {
            const data = await news_service.updateNewsService(req.params.newsId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật bài viết thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
exports.deleteNewsController = async (req, res, next) => {
    try {
            await news_service.deleteNewsService(req.params.newsId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa bài viết thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "news");
    }
};
