const http_status_codes = require("http-status-codes");
const api_response = require("../utils/api-response");
const rss_service = require("../service/rss.service");
const { handleControllerError } = require("../utils/controller-error");
exports.getRssNewsController = async (req, res, next) => {
    try {
            const limitRaw = Number(req.query.limit ?? 6);
            const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(20, Math.floor(limitRaw))) : 6;
            const sourceQuery = typeof req.query.source === "string" ? req.query.source.trim().toLowerCase() : undefined;
            const source = rss_service.normalizeRssSource(sourceQuery);
            const data = await rss_service.getRssNews(limit, source);
            const message = data.length > 0
                ? `Lấy tin RSS thành công (${rss_service.RSS_FEED_SOURCES[source].label})`
                : `Nguồn RSS tạm thời không phản hồi (${rss_service.RSS_FEED_SOURCES[source].label})`;
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, message, data);
    }
    catch (error) {
        return handleControllerError(res, error, "rss");
    }
};
