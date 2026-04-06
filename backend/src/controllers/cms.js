const http_status_codes_1 = require("http-status-codes");
const api_response_1 = require("../utils/api-response");
const cms_service_1 = require("../service/cms.service");
const { handleControllerError } = require("../utils/controller-error");
exports.listCmsPagesController = async (_req, res, next) => {
    try {
            const data = await cms_service_1.getCmsPages();
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy danh sách trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
exports.cmsPageDetailController = async (req, res, next) => {
    try {
            const data = await cms_service_1.getCmsPageDetail(req.params.pageKey);
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Lấy nội dung trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
exports.upsertCmsPageController = async (req, res, next) => {
    try {
            const data = await cms_service_1.upsertCmsPageService({
                pageKey: req.params.pageKey,
                title: req.body.title,
                content: req.body.content,
                updatedBy: req.user?.id,
            });
            return api_response_1.sendSuccess(res, http_status_codes_1.StatusCodes.OK, "Cập nhật trang CMS thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "cms");
    }
};
