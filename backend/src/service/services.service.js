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
    service_code: row.service_code,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    description: row.description,
    price_from: row.price_from === null ? null : Number(row.price_from),
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
});
const listMedicalServices = async (limit, offset) => {
    const { rows, count } = await SequelizeModels_1.MedicalServiceModel.findAndCountAll({
        where: { is_active: true, is_deleted: false },
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });
    return { rows: rows.map(toRecord), total: count };
};
exports.listMedicalServices = listMedicalServices;
const listMedicalServicesAdmin = async () => {
    const rows = await SequelizeModels_1.MedicalServiceModel.findAll({
        where: { is_deleted: false },
        order: [["created_at", "DESC"]],
    });
    return rows.map(toRecord);
};
exports.listMedicalServicesAdmin = listMedicalServicesAdmin;
const findMedicalServiceById = async (serviceId) => {
    const row = await SequelizeModels_1.MedicalServiceModel.findOne({
        where: { id: serviceId, is_deleted: false },
    });
    return row ? toRecord(row) : null;
};
exports.findMedicalServiceById = findMedicalServiceById;
const isMedicalServiceSlugTaken = async (slug, exceptId) => {
    const total = await SequelizeModels_1.MedicalServiceModel.count({
        where: {
            slug,
            is_deleted: false,
            ...(exceptId ? { id: { [sequelize_1.Op.ne]: exceptId } } : {}),
        },
    });
    return total > 0;
};
exports.isMedicalServiceSlugTaken = isMedicalServiceSlugTaken;
const createMedicalService = async (input) => {
    const row = await SequelizeModels_1.MedicalServiceModel.create({
        service_code: input.serviceCode,
        name: input.name,
        slug: input.slug,
        short_description: input.shortDescription ?? null,
        description: input.description ?? null,
        price_from: input.priceFrom?.toString() ?? null,
        is_active: input.isActive ?? true,
    });
    return toRecord(row);
};
exports.createMedicalService = createMedicalService;
const updateMedicalService = async (serviceId, input) => {
    const row = await SequelizeModels_1.MedicalServiceModel.findOne({ where: { id: serviceId, is_deleted: false } });
    if (!row) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy dịch vụ");
    }
    await row.update({
        service_code: input.serviceCode,
        name: input.name,
        slug: input.slug,
        short_description: input.shortDescription ?? null,
        description: input.description ?? null,
        price_from: input.priceFrom?.toString() ?? null,
        is_active: input.isActive ?? true,
        updated_at: new Date(),
    });
    return toRecord(row);
};
exports.updateMedicalService = updateMedicalService;
const deleteMedicalService = async (serviceId) => {
    await SequelizeModels_1.MedicalServiceModel.update({
        is_deleted: true,
        is_active: false,
        updated_at: new Date(),
    }, { where: { id: serviceId } });
};
exports.deleteMedicalService = deleteMedicalService;
const getServices = (pageSize, offset) => exports.listMedicalServices(pageSize, offset);
exports.getServices = getServices;
const getServicesAdmin = () => exports.listMedicalServicesAdmin();
exports.getServicesAdmin = getServicesAdmin;
const createService = async (payload) => {
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.name, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isMedicalServiceSlugTaken(normalizedSlug);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug dịch vụ đã tồn tại");
    }
    return exports.createMedicalService({
        ...payload,
        slug: normalizedSlug,
    });
};
exports.createService = createService;
const updateService = async (serviceId, payload) => {
    const existing = await exports.findMedicalServiceById(serviceId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy dịch vụ");
    }
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.name, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isMedicalServiceSlugTaken(normalizedSlug, serviceId);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug dịch vụ đã tồn tại");
    }
    return exports.updateMedicalService(serviceId, {
        ...payload,
        slug: normalizedSlug,
    });
};
exports.updateService = updateService;
const deleteService = async (serviceId) => {
    const existing = await exports.findMedicalServiceById(serviceId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy dịch vụ");
    }
    await exports.deleteMedicalService(serviceId);
};
exports.deleteService = deleteService;
