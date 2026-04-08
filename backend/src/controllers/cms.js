const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const cms_service = require("../service/cms.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listCmsPagesController = async (_req, res, next) => {
    try {
            const data = await cms_service.getCmsPages();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
exports.cmsPageDetailController = async (req, res, next) => {
    try {
            const data = await cms_service.getCmsPageDetail(req.params.pageKey);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy nội dung trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
exports.upsertCmsPageController = async (req, res, next) => {
    try {
            const data = await cms_service.upsertCmsPageService({
                pageKey: req.params.pageKey,
                title: req.body.title,
                content: req.body.content,
                updatedBy: req.user?.id,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
