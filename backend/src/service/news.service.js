var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_codes_1 = require("http-status-codes");
const slugify_1 = __importDefault(require("slugify"));
const sequelize_1 = require("sequelize");
const app_error_1 = require("../utils/app-error");
const SequelizeModels_1 = require("../schemas/SequelizeModels");
const toRecord = (row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    thumbnail_url: row.thumbnail_url,
    is_published: row.is_published,
    published_at: row.published_at ? row.published_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
});
const listPublishedNews = async (limit, offset) => {
    const { rows, count } = await SequelizeModels_1.NewsArticleModel.findAndCountAll({
        where: { is_published: true, is_deleted: false },
        order: [
            ["published_at", "DESC"],
            ["created_at", "DESC"],
        ],
        limit,
        offset,
    });
    return {
        rows: rows.map(toRecord),
        total: count,
    };
};
exports.listPublishedNews = listPublishedNews;
const listNewsAdmin = async () => {
    const rows = await SequelizeModels_1.NewsArticleModel.findAll({
        where: { is_deleted: false },
        order: [["created_at", "DESC"]],
    });
    return rows.map(toRecord);
};
exports.listNewsAdmin = listNewsAdmin;
const findNewsBySlug = async (slug) => {
    const row = await SequelizeModels_1.NewsArticleModel.findOne({
        where: { slug, is_deleted: false },
    });
    return row ? toRecord(row) : null;
};
exports.findNewsBySlug = findNewsBySlug;
const findNewsById = async (newsId) => {
    const row = await SequelizeModels_1.NewsArticleModel.findOne({
        where: { id: newsId, is_deleted: false },
    });
    return row ? toRecord(row) : null;
};
exports.findNewsById = findNewsById;
const isNewsSlugTaken = async (slug, exceptId) => {
    const total = await SequelizeModels_1.NewsArticleModel.count({
        where: {
            slug,
            is_deleted: false,
            ...(exceptId ? { id: { [sequelize_1.Op.ne]: exceptId } } : {}),
        },
    });
    return total > 0;
};
exports.isNewsSlugTaken = isNewsSlugTaken;
const createNews = async (input) => {
    const isPublished = input.isPublished ?? false;
    const row = await SequelizeModels_1.NewsArticleModel.create({
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        content: input.content,
        thumbnail_url: input.thumbnailUrl ?? null,
        is_published: isPublished,
        published_at: isPublished ? new Date() : null,
    });
    return toRecord(row);
};
exports.createNews = createNews;
const updateNews = async (newsId, input) => {
    const row = await SequelizeModels_1.NewsArticleModel.findOne({ where: { id: newsId, is_deleted: false } });
    if (!row) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy bài viết");
    }
    const nextPublished = input.isPublished ?? false;
    const publishedAt = nextPublished
        ? (row.published_at ?? new Date())
        : null;
    await row.update({
        title: input.title,
        slug: input.slug,
        summary: input.summary ?? null,
        content: input.content,
        thumbnail_url: input.thumbnailUrl ?? null,
        is_published: nextPublished,
        published_at: publishedAt,
        updated_at: new Date(),
    });
    return toRecord(row);
};
exports.updateNews = updateNews;
const deleteNews = async (newsId) => {
    await SequelizeModels_1.NewsArticleModel.update({
        is_deleted: true,
        is_published: false,
        updated_at: new Date(),
    }, { where: { id: newsId } });
};
exports.deleteNews = deleteNews;
const getPublicNews = (pageSize, offset) => exports.listPublishedNews(pageSize, offset);
exports.getPublicNews = getPublicNews;
const getNewsDetail = async (slug) => {
    const news = await exports.findNewsBySlug(slug);
    if (!news || !news.is_published) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy bài viết");
    }
    return news;
};
exports.getNewsDetail = getNewsDetail;
const getAdminNews = () => exports.listNewsAdmin();
exports.getAdminNews = getAdminNews;
const createNewsService = async (payload) => {
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.title, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isNewsSlugTaken(normalizedSlug);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug bài viết đã tồn tại");
    }
    return exports.createNews({
        ...payload,
        slug: normalizedSlug,
    });
};
exports.createNewsService = createNewsService;
const updateNewsService = async (newsId, payload) => {
    const existing = await exports.findNewsById(newsId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy bài viết");
    }
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.title, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isNewsSlugTaken(normalizedSlug, newsId);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug bài viết đã tồn tại");
    }
    return exports.updateNews(newsId, {
        ...payload,
        slug: normalizedSlug,
    });
};
exports.updateNewsService = updateNewsService;
const deleteNewsService = async (newsId) => {
    const existing = await exports.findNewsById(newsId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy bài viết");
    }
    await exports.deleteNews(newsId);
};
exports.deleteNewsService = deleteNewsService;
