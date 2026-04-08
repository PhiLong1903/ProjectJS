const http_status_codes = require("http-status-codes");
const sequelize = require("sequelize");
const app_error = require("../utils/app-error");
const SequelizeModels = require("../schemas/SequelizeModels");
const toDoctorRecord = (row) => ({
    id: row.id,
    doctor_code: row.doctor_code,
    full_name: row.full_name,
    specialty: row.specialty,
    department_id: row.department_id,
    department_name: row.department?.name ?? "",
    experience_years: row.experience_years,
    description: row.description,
    avatar_url: row.avatar_url,
    is_active: row.is_active,
});
const toSlotRecord = (row) => ({
    id: row.id,
    doctor_id: row.doctor_id,
    slot_date: row.slot_date,
    start_time: row.start_time,
    end_time: row.end_time,
    is_available: row.is_available,
});
const listDoctors = async (limit, offset, departmentId, keyword) => {
    const where = {
        is_active: true,
        is_deleted: false,
        ...(departmentId ? { department_id: departmentId } : {}),
        ...(keyword
            ? {
                [sequelize.Op.or]: [
                    { full_name: { [sequelize.Op.iLike]: `%${keyword}%` } },
                    { specialty: { [sequelize.Op.iLike]: `%${keyword}%` } },
                    { description: { [sequelize.Op.iLike]: `%${keyword}%` } },
                ],
            }
            : {}),
    };
    const { rows, count } = await SequelizeModels.DoctorModel.findAndCountAll({
        where,
        include: [
            {
                model: SequelizeModels.DepartmentModel,
                as: "department",
                required: true,
                where: { is_deleted: false },
            },
        ],
        order: [["full_name", "ASC"]],
        limit,
        offset,
    });
    return {
        rows: rows.map((row) => toDoctorRecord(row)),
        total: count,
    };
};
exports.listDoctors = listDoctors;
const listDoctorsForAdmin = async () => {
    const rows = await SequelizeModels.DoctorModel.findAll({
        where: { is_deleted: false },
        include: [
            {
                model: SequelizeModels.DepartmentModel,
                as: "department",
                required: true,
                where: { is_deleted: false },
            },
        ],
        order: [["created_at", "DESC"]],
    });
    return rows.map((row) => toDoctorRecord(row));
};
exports.listDoctorsForAdmin = listDoctorsForAdmin;
const findDoctorById = async (doctorId) => {
    const row = await SequelizeModels.DoctorModel.findOne({
        where: { id: doctorId, is_deleted: false },
        include: [
            {
                model: SequelizeModels.DepartmentModel,
                as: "department",
                required: true,
                where: { is_deleted: false },
            },
        ],
    });
    return row ? toDoctorRecord(row) : null;
};
exports.findDoctorById = findDoctorById;
const isDoctorCodeTaken = async (doctorCode, exceptId) => {
    const total = await SequelizeModels.DoctorModel.count({
        where: {
            doctor_code: doctorCode,
            is_deleted: false,
            ...(exceptId ? { id: { [sequelize.Op.ne]: exceptId } } : {}),
        },
    });
    return total > 0;
};
exports.isDoctorCodeTaken = isDoctorCodeTaken;
const createDoctor = async (input) => {
    const row = await SequelizeModels.DoctorModel.create({
        doctor_code: input.doctorCode,
        full_name: input.fullName,
        specialty: input.specialty ?? null,
        department_id: input.departmentId,
        experience_years: input.experienceYears ?? null,
        description: input.description ?? null,
        avatar_url: input.avatarUrl ?? null,
        is_active: input.isActive ?? true,
    });
    const detail = await exports.findDoctorById(row.id);
    if (!detail) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    return detail;
};
exports.createDoctor = createDoctor;
const updateDoctor = async (doctorId, input) => {
    const row = await SequelizeModels.DoctorModel.findOne({ where: { id: doctorId, is_deleted: false } });
    if (!row) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    await row.update({
        doctor_code: input.doctorCode,
        full_name: input.fullName,
        specialty: input.specialty ?? null,
        department_id: input.departmentId,
        experience_years: input.experienceYears ?? null,
        description: input.description ?? null,
        avatar_url: input.avatarUrl ?? null,
        is_active: input.isActive ?? true,
        updated_at: new Date(),
    });
    const detail = await exports.findDoctorById(row.id);
    if (!detail) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    return detail;
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (doctorId) => {
    await SequelizeModels.DoctorModel.update({
        is_deleted: true,
        is_active: false,
        updated_at: new Date(),
    }, { where: { id: doctorId } });
};
exports.deleteDoctor = deleteDoctor;
const listDoctorSlotsByDate = async (doctorId, date) => {
    const rows = await SequelizeModels.DoctorSlotModel.findAll({
        where: {
            doctor_id: doctorId,
            is_deleted: false,
            ...(date ? { slot_date: date } : { slot_date: { [sequelize.Op.gte]: new Date().toISOString().slice(0, 10) } }),
        },
        order: [
            ["slot_date", "ASC"],
            ["start_time", "ASC"],
        ],
        ...(date ? {} : { limit: 100 }),
    });
    return rows.map(toSlotRecord);
};
exports.listDoctorSlotsByDate = listDoctorSlotsByDate;
const createDoctorSlot = async (input) => {
    const row = await SequelizeModels.DoctorSlotModel.create({
        doctor_id: input.doctorId,
        slot_date: input.slotDate,
        start_time: input.startTime,
        end_time: input.endTime,
    });
    return toSlotRecord(row);
};
exports.createDoctorSlot = createDoctorSlot;
const deleteDoctorSlot = async (slotId) => {
    await SequelizeModels.DoctorSlotModel.update({
        is_deleted: true,
        is_available: false,
        updated_at: new Date(),
    }, { where: { id: slotId } });
};
exports.deleteDoctorSlot = deleteDoctorSlot;
const getDoctors = (pageSize, offset, departmentId, keyword) => exports.listDoctors(pageSize, offset, departmentId, keyword);
exports.getDoctors = getDoctors;
const getDoctorsAdmin = () => exports.listDoctorsForAdmin();
exports.getDoctorsAdmin = getDoctorsAdmin;
const createDoctorService = async (payload) => {
    const codeTaken = await exports.isDoctorCodeTaken(payload.doctorCode);
    if (codeTaken) {
        throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Mã bác sĩ đã tồn tại");
    }
    return exports.createDoctor(payload);
};
exports.createDoctorService = createDoctorService;
const updateDoctorService = async (doctorId, payload) => {
    const existing = await exports.findDoctorById(doctorId);
    if (!existing) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    const codeTaken = await exports.isDoctorCodeTaken(payload.doctorCode, doctorId);
    if (codeTaken) {
        throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Mã bác sĩ đã tồn tại");
    }
    return exports.updateDoctor(doctorId, payload);
};
exports.updateDoctorService = updateDoctorService;
const deleteDoctorService = async (doctorId) => {
    const existing = await exports.findDoctorById(doctorId);
    if (!existing) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    await exports.deleteDoctor(doctorId);
};
exports.deleteDoctorService = deleteDoctorService;
const getDoctorSlots = async (doctorId, date) => {
    const existing = await exports.findDoctorById(doctorId);
    if (!existing) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    return exports.listDoctorSlotsByDate(doctorId, date);
};
exports.getDoctorSlots = getDoctorSlots;
const createDoctorSlotService = async (payload) => {
    const existing = await exports.findDoctorById(payload.doctorId);
    if (!existing) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy bác sĩ");
    }
    if (payload.startTime >= payload.endTime) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
    }
    return exports.createDoctorSlot(payload);
};
exports.createDoctorSlotService = createDoctorSlotService;
const deleteDoctorSlotService = async (slotId) => {
    await exports.deleteDoctorSlot(slotId);
};
exports.deleteDoctorSlotService = deleteDoctorSlotService;
