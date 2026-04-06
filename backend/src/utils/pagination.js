const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const getPaginationParams = (req) => {
    const pageRaw = Number(req.query.page ?? DEFAULT_PAGE);
    const pageSizeRaw = Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : DEFAULT_PAGE;
    const pageSize = Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
        ? Math.min(Math.floor(pageSizeRaw), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;
    return {
        page,
        pageSize,
        offset: (page - 1) * pageSize,
    };
};
exports.getPaginationParams = getPaginationParams;
const toPaginationMeta = (page, pageSize, totalItems) => ({
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
});
exports.toPaginationMeta = toPaginationMeta;
