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
    name: row.name,
    slug: row.slug,
    description: row.description,
    location: row.location,
    phone: row.phone,
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
});
const listDepartments = async (limit, offset) => {
    const { rows, count } = await SequelizeModels_1.DepartmentModel.findAndCountAll({
        where: { is_active: true, is_deleted: false },
        order: [["name", "ASC"]],
        limit,
        offset,
    });
    return {
        rows: rows.map(toRecord),
        total: count,
    };
};
exports.listDepartments = listDepartments;
const listDepartmentsForAdmin = async () => {
    const rows = await SequelizeModels_1.DepartmentModel.findAll({
        where: { is_deleted: false },
        order: [["created_at", "DESC"]],
    });
    return rows.map(toRecord);
};
exports.listDepartmentsForAdmin = listDepartmentsForAdmin;
const findDepartmentById = async (departmentId) => {
    const row = await SequelizeModels_1.DepartmentModel.findOne({
        where: { id: departmentId, is_deleted: false },
    });
    return row ? toRecord(row) : null;
};
exports.findDepartmentById = findDepartmentById;
const createDepartment = async (input) => {
    const row = await SequelizeModels_1.DepartmentModel.create({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        location: input.location ?? null,
        phone: input.phone ?? null,
        is_active: input.isActive ?? true,
    });
    return toRecord(row);
};
exports.createDepartment = createDepartment;
const updateDepartment = async (departmentId, input) => {
    const row = await SequelizeModels_1.DepartmentModel.findOne({ where: { id: departmentId, is_deleted: false } });
    if (!row) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy khoa");
    }
    await row.update({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        location: input.location ?? null,
        phone: input.phone ?? null,
        is_active: input.isActive ?? true,
        updated_at: new Date(),
    });
    return toRecord(row);
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (departmentId) => {
    await SequelizeModels_1.DepartmentModel.update({
        is_deleted: true,
        is_active: false,
        updated_at: new Date(),
    }, { where: { id: departmentId } });
};
exports.deleteDepartment = deleteDepartment;
const isDepartmentSlugTaken = async (slug, exceptId) => {
    const total = await SequelizeModels_1.DepartmentModel.count({
        where: {
            slug,
            is_deleted: false,
            ...(exceptId ? { id: { [sequelize_1.Op.ne]: exceptId } } : {}),
        },
    });
    return total > 0;
};
exports.isDepartmentSlugTaken = isDepartmentSlugTaken;
const getDepartmentList = (pageSize, offset) => exports.listDepartments(pageSize, offset);
exports.getDepartmentList = getDepartmentList;
const getDepartmentAdminList = () => exports.listDepartmentsForAdmin();
exports.getDepartmentAdminList = getDepartmentAdminList;
const createDepartmentService = async (payload) => {
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.name, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isDepartmentSlugTaken(normalizedSlug);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug khoa đã tồn tại");
    }
    return exports.createDepartment({
        ...payload,
        slug: normalizedSlug,
    });
};
exports.createDepartmentService = createDepartmentService;
const updateDepartmentService = async (departmentId, payload) => {
    const existing = await exports.findDepartmentById(departmentId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy khoa");
    }
    const normalizedSlug = slugify_1.default(payload.slug ?? payload.name, {
        lower: true,
        trim: true,
        strict: true,
    });
    const slugTaken = await exports.isDepartmentSlugTaken(normalizedSlug, departmentId);
    if (slugTaken) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.CONFLICT, "Slug khoa đã tồn tại");
    }
    return exports.updateDepartment(departmentId, {
        ...payload,
        slug: normalizedSlug,
    });
};
exports.updateDepartmentService = updateDepartmentService;
const deleteDepartmentService = async (departmentId) => {
    const existing = await exports.findDepartmentById(departmentId);
    if (!existing) {
        throw new app_error_1.AppError(http_status_codes_1.StatusCodes.NOT_FOUND, "Không tìm thấy khoa");
    }
    await exports.deleteDepartment(departmentId);
};
exports.deleteDepartmentService = deleteDepartmentService;
