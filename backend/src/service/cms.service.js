const http_status_codes_1 = require("http-status-codes");
const app_error_1 = require("../utils/app-error");
const SequelizeModels_1 = require("../schemas/SequelizeModels");
const toRecord = (row) => ({
    id: row.id,
    page_key: row.page_key,
    title: row.title,
    content: row.content,
    updated_by: row.updated_by,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
});
const listCmsPages = async () => {
    const rows = await SequelizeModels_1.CmsPageModel.findAll({
        order: [["page_key", "ASC"]],
    });
    return rows.map(toRecord);
};
exports.listCmsPages = listCmsPages;
const findCmsPageByKey = async (pageKey) => {
    const row = await SequelizeModels_1.CmsPageModel.findOne({
        where: { page_key: pageKey },
    });
    return row ? toRecord(row) : null;
};
exports.findCmsPageByKey = findCmsPageByKey;
const upsertCmsPage = async (input) => {
    const existing = await SequelizeModels_1.CmsPageModel.findOne({ where: { page_key: input.pageKey } });
    if (existing) {
        await existing.update({
            title: input.title,
            content: input.content,
            updated_by: input.updatedBy ?? null,
            updated_at: new Date(),
        });
        return toRecord(existing);
    }
    const created = await SequelizeModels_1.CmsPageModel.create({
        page_key: input.pageKey,
        title: input.title,
        content: input.content,
        updated_by: input.updatedBy ?? null,
    });
    return toRecord(created);
};
exports.upsertCmsPage = upsertCmsPage;
const getCmsPages = () => exports.listCmsPages();
exports.getCmsPages = getCmsPages;
const getCmsPageDetail = async (pageKey) => {
    const page = await exports.findCmsPageByKey(pageKey);
    if (!page) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy trang CMS");
    }
    return page;
};
exports.getCmsPageDetail = getCmsPageDetail;
const upsertCmsPageService = (payload) => exports.upsertCmsPage(payload);
exports.upsertCmsPageService = upsertCmsPageService;
