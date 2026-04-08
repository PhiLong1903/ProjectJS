const PDFDocument = require("pdfkit");
const sequelize = require("sequelize");
const http_status_codes = require("http-status-codes");
const notification_queue_service = require("../utils/notification-queue.service");
const password = require("../utils/password");
const app_error = require("../utils/app-error");
const SequelizeModels = require("../schemas/SequelizeModels");
const sequelizeConfig = require("../config/sequelize");
const db = require("../config/db");
const getAdminOverview = async () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const dateOnly = (d) => d.toISOString().slice(0, 10);
    const today = dateOnly(startOfToday);
    const tomorrow = dateOnly(startOfTomorrow);
    const monthStart = dateOnly(startOfMonth);
    const nextMonthStart = dateOnly(startOfNextMonth);
    const [newPatientsToday, newPatientsMonth, appointmentsToday, appointmentsMonth, revenueToday, revenueMonth, totalUsers, activeDoctors,] = await Promise.all([
        SequelizeModels.PatientModel.count({
            where: {
                created_at: {
                    [sequelize.Op.gte]: startOfToday,
                    [sequelize.Op.lt]: startOfTomorrow,
                },
            },
        }),
        SequelizeModels.PatientModel.count({
            where: {
                created_at: {
                    [sequelize.Op.gte]: startOfMonth,
                    [sequelize.Op.lt]: startOfNextMonth,
                },
            },
        }),
        SequelizeModels.AppointmentModel.count({
            include: [
                {
                    model: SequelizeModels.DoctorSlotModel,
                    as: "slot",
                    required: true,
                    where: {
                        slot_date: {
                            [sequelize.Op.gte]: today,
                            [sequelize.Op.lt]: tomorrow,
                        },
                    },
                },
            ],
        }),
        SequelizeModels.AppointmentModel.count({
            include: [
                {
                    model: SequelizeModels.DoctorSlotModel,
                    as: "slot",
                    required: true,
                    where: {
                        slot_date: {
                            [sequelize.Op.gte]: monthStart,
                            [sequelize.Op.lt]: nextMonthStart,
                        },
                    },
                },
            ],
        }),
        SequelizeModels.PaymentTransactionModel.sum("amount", {
            where: {
                status: "PAID",
                paid_at: {
                    [sequelize.Op.gte]: startOfToday,
                    [sequelize.Op.lt]: startOfTomorrow,
                },
            },
        }),
        SequelizeModels.PaymentTransactionModel.sum("amount", {
            where: {
                status: "PAID",
                paid_at: {
                    [sequelize.Op.gte]: startOfMonth,
                    [sequelize.Op.lt]: startOfNextMonth,
                },
            },
        }),
        SequelizeModels.UserModel.count({
            where: {
                is_deleted: false,
            },
        }),
        SequelizeModels.DoctorModel.count({
            where: {
                is_active: true,
                is_deleted: false,
            },
            include: [
                {
                    model: SequelizeModels.UserModel,
                    as: "user",
                    required: true,
                    where: {
                        is_active: true,
                        is_deleted: false,
                    },
                },
            ],
        }),
    ]);
    return {
        new_patients_today: newPatientsToday,
        new_patients_month: newPatientsMonth,
        appointments_today: appointmentsToday,
        appointments_month: appointmentsMonth,
        revenue_today: String(revenueToday ?? 0),
        revenue_month: String(revenueMonth ?? 0),
        total_users: totalUsers,
        active_doctors: activeDoctors,
    };
};
exports.getAdminOverview = getAdminOverview;
const listAdminUsers = async (input) => {
    const userWhere = { is_deleted: false };
    if (input.keyword) {
        userWhere[sequelize.Op.or] = [
            { email: { [sequelize.Op.iLike]: `%${input.keyword}%` } },
            { full_name: { [sequelize.Op.iLike]: `%${input.keyword}%` } },
        ];
    }
    const result = await SequelizeModels.UserModel.findAndCountAll({
        where: userWhere,
        attributes: ["id", "email", "full_name", "is_active", "created_at"],
        include: [
            {
                model: SequelizeModels.UserRoleModel,
                as: "user_roles",
                required: Boolean(input.role),
                attributes: ["role_id"],
                include: [
                    {
                        model: SequelizeModels.RoleModel,
                        as: "role",
                        required: Boolean(input.role),
                        attributes: ["name"],
                        where: input.role ? { name: input.role } : undefined,
                    },
                ],
            },
            { model: SequelizeModels.PatientModel, as: "patient", required: false, attributes: ["patient_code"] },
            {
                model: SequelizeModels.DoctorModel,
                as: "doctor",
                required: false,
                attributes: ["doctor_code"],
                where: { is_deleted: false },
            },
        ],
        order: [["created_at", "DESC"]],
        offset: input.offset,
        limit: input.limit,
        distinct: true,
    });
    return {
        rows: result.rows.map((user) => {
            const plain = user.get({ plain: true });
            const roles = (plain.user_roles ?? [])
                .map((roleLink) => roleLink.role?.name)
                .filter((name) => Boolean(name));
            return {
                id: plain.id,
                email: plain.email,
                full_name: plain.full_name,
                is_active: plain.is_active,
                created_at: new Date(plain.created_at).toISOString(),
                roles,
                patient_code: plain.patient?.patient_code ?? null,
                doctor_code: plain.doctor?.doctor_code ?? null,
            };
        }),
        total: result.count,
    };
};
exports.listAdminUsers = listAdminUsers;
const findUserByEmail = async (email) => {
    const user = await SequelizeModels.UserModel.findOne({
        where: {
            email,
            is_deleted: false,
        },
        attributes: ["id"],
    });
    return user ? { id: user.id } : null;
};
exports.findUserByEmail = findUserByEmail;
const isPhoneUsed = async (phoneNumber) => {
    const total = await SequelizeModels.PatientModel.count({
        where: { phone_number: phoneNumber },
    });
    return total > 0;
};
exports.isPhoneUsed = isPhoneUsed;
const isDoctorCodeUsed = async (doctorCode) => {
    const total = await SequelizeModels.DoctorModel.count({
        where: {
            doctor_code: doctorCode,
            is_deleted: false,
        },
    });
    return total > 0;
};
exports.isDoctorCodeUsed = isDoctorCodeUsed;
const isPatientCodeUsed = async (patientCode) => {
    const total = await SequelizeModels.PatientModel.count({
        where: { patient_code: patientCode },
    });
    return total > 0;
};
exports.isPatientCodeUsed = isPatientCodeUsed;
const createAdminUser = async (payload) => {
    return sequelizeConfig.sequelize.transaction(async (transaction) => {
        const user = await SequelizeModels.UserModel.create({
            email: payload.email,
            full_name: payload.fullName,
            password_hash: payload.passwordHash,
            is_active: true,
            is_deleted: false,
        }, { transaction });
        const roleRows = await SequelizeModels.RoleModel.findAll({
            where: { name: { [sequelize.Op.in]: payload.roles } },
            attributes: ["id", "name"],
            transaction,
        });
        if (roleRows.length > 0) {
            await SequelizeModels.UserRoleModel.bulkCreate(roleRows.map((role) => ({
                user_id: user.id,
                role_id: role.id,
            })), { transaction, ignoreDuplicates: true });
        }
        if (payload.roles.includes("PATIENT") && payload.patientProfile) {
            await SequelizeModels.PatientModel.create({
                user_id: user.id,
                patient_code: payload.patientProfile.patientCode,
                phone_number: payload.patientProfile.phoneNumber,
                date_of_birth: payload.patientProfile.dateOfBirth ?? null,
                gender: payload.patientProfile.gender ?? null,
                address: payload.patientProfile.address ?? null,
                health_insurance_number: payload.patientProfile.healthInsuranceNumber ?? null,
            }, { transaction });
        }
        if (payload.roles.includes("DOCTOR") && payload.doctorProfile) {
            await SequelizeModels.DoctorModel.create({
                user_id: user.id,
                doctor_code: payload.doctorProfile.doctorCode,
                full_name: payload.fullName,
                specialty: payload.doctorProfile.specialty ?? null,
                department_id: payload.doctorProfile.departmentId,
                experience_years: payload.doctorProfile.experienceYears ?? null,
                qualifications: payload.doctorProfile.qualifications ?? null,
                description: payload.doctorProfile.description ?? null,
                is_active: true,
                is_deleted: false,
            }, { transaction });
        }
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            roles: payload.roles,
        };
    });
};
exports.createAdminUser = createAdminUser;
const findUserById = async (userId) => {
    const user = await SequelizeModels.UserModel.findOne({
        where: {
            id: userId,
            is_deleted: false,
        },
        attributes: ["id"],
    });
    return user ? { id: user.id } : null;
};
exports.findUserById = findUserById;
const updateAdminUserBasic = async (userId, payload) => {
    const updateData = {};
    if (payload.fullName !== undefined)
        updateData.full_name = payload.fullName;
    if (payload.email !== undefined)
        updateData.email = payload.email;
    if (Object.keys(updateData).length === 0) {
        return;
    }
    await SequelizeModels.UserModel.update(updateData, {
        where: {
            id: userId,
            is_deleted: false,
        },
    });
};
exports.updateAdminUserBasic = updateAdminUserBasic;
const updateAdminUserStatus = async (userId, isActive) => {
    await SequelizeModels.UserModel.update({ is_active: isActive }, {
        where: {
            id: userId,
            is_deleted: false,
        },
    });
};
exports.updateAdminUserStatus = updateAdminUserStatus;
const replaceAdminUserRoles = async (userId, roles) => {
    await sequelizeConfig.sequelize.transaction(async (transaction) => {
        await SequelizeModels.UserRoleModel.destroy({
            where: { user_id: userId },
            transaction,
        });
        const roleRows = await SequelizeModels.RoleModel.findAll({
            where: { name: { [sequelize.Op.in]: roles } },
            attributes: ["id"],
            transaction,
        });
        if (roleRows.length > 0) {
            await SequelizeModels.UserRoleModel.bulkCreate(roleRows.map((role) => ({ user_id: userId, role_id: role.id })), { transaction, ignoreDuplicates: true });
        }
    });
};
exports.replaceAdminUserRoles = replaceAdminUserRoles;
const deleteAdminUser = async (userId) => {
    await SequelizeModels.UserModel.update({
        is_deleted: true,
        is_active: false,
    }, { where: { id: userId } });
};
exports.deleteAdminUser = deleteAdminUser;
const getRevenueReport = async (input) => {
    const fromDate = input.fromDate ? new Date(`${input.fromDate}T00:00:00.000Z`) : undefined;
    const toDate = input.toDate ? new Date(`${input.toDate}T23:59:59.999Z`) : undefined;
    const paidRows = await SequelizeModels.PaymentTransactionModel.findAll({
        where: {
            status: "PAID",
            paid_at: {
                [sequelize.Op.ne]: null,
                ...(fromDate ? { [sequelize.Op.gte]: fromDate } : {}),
                ...(toDate ? { [sequelize.Op.lte]: toDate } : {}),
            },
        },
        attributes: ["amount", "paid_at"],
    });
    const bucket = new Map();
    for (const row of paidRows) {
        if (!row.paid_at)
            continue;
        const paidAt = row.paid_at;
        const period = input.groupBy === "month"
            ? `${paidAt.getUTCFullYear()}-${String(paidAt.getUTCMonth() + 1).padStart(2, "0")}`
            : paidAt.toISOString().slice(0, 10);
        const prev = bucket.get(period) ?? { totalRevenue: 0, totalTransactions: 0 };
        prev.totalRevenue += Number(row.amount ?? 0);
        prev.totalTransactions += 1;
        bucket.set(period, prev);
    }
    return Array.from(bucket.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([period, value]) => ({
        period,
        total_revenue: value.totalRevenue.toString(),
        total_transactions: value.totalTransactions.toString(),
    }));
};
exports.getRevenueReport = getRevenueReport;
const getDashboardTrends = async (input) => {
    const points = Math.max(1, Math.min(input.points, input.groupBy === "day" ? 90 : 24));
    const now = new Date();
    const daySeries = Array.from({ length: points }, (_, i) => {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (points - 1 - i)));
        return d.toISOString().slice(0, 10);
    });
    const monthSeries = Array.from({ length: points }, (_, i) => {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (points - 1 - i), 1));
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    });
    const series = input.groupBy === "day" ? daySeries : monthSeries;
    const results = [];
    for (const period of series) {
        let periodStart;
        let periodEnd;
        if (input.groupBy === "day") {
            periodStart = new Date(`${period}T00:00:00.000Z`);
            periodEnd = new Date(`${period}T23:59:59.999Z`);
        }
        else {
            const [y, m] = period.split("-").map(Number);
            periodStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
            periodEnd = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
        }
        const [newPatients, appointments, revenueRows] = await Promise.all([
            SequelizeModels.PatientModel.count({
                where: {
                    created_at: { [sequelize.Op.gte]: periodStart, [sequelize.Op.lte]: periodEnd },
                },
            }),
            SequelizeModels.AppointmentModel.count({
                include: [
                    {
                        model: SequelizeModels.DoctorSlotModel,
                        as: "slot",
                        required: true,
                        where: {
                            slot_date: {
                                [sequelize.Op.gte]: periodStart.toISOString().slice(0, 10),
                                [sequelize.Op.lte]: periodEnd.toISOString().slice(0, 10),
                            },
                        },
                    },
                ],
            }),
            SequelizeModels.PaymentTransactionModel.findAll({
                where: {
                    status: "PAID",
                    paid_at: { [sequelize.Op.gte]: periodStart, [sequelize.Op.lte]: periodEnd },
                },
                attributes: ["amount"],
            }),
        ]);
        const revenue = revenueRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
        results.push({
            period,
            new_patients: newPatients,
            appointments,
            revenue: revenue.toString(),
        });
    }
    return results;
};
exports.getDashboardTrends = getDashboardTrends;
const listSystemSettings = async () => {
    const rows = await SequelizeModels.SystemSettingModel.findAll({
        order: [["key", "ASC"]],
    });
    return rows.map((row) => {
        const plain = row.get({ plain: true });
        return {
            key: plain.key,
            value: plain.value,
            description: plain.description,
            updated_at: new Date(plain.updated_at).toISOString(),
        };
    });
};
exports.listSystemSettings = listSystemSettings;
const upsertSystemSetting = async (payload) => {
    const existing = await SequelizeModels.SystemSettingModel.findByPk(payload.key);
    const saved = existing
        ? await existing.update({
            value: payload.value,
            description: payload.description ?? null,
            updated_at: new Date(),
        })
        : await SequelizeModels.SystemSettingModel.create({
            key: payload.key,
            value: payload.value,
            description: payload.description ?? null,
            updated_at: new Date(),
        });
    const plain = saved.get({ plain: true });
    return {
        key: plain.key,
        value: plain.value,
        description: plain.description,
        updated_at: new Date(plain.updated_at).toISOString(),
    };
};
exports.upsertSystemSetting = upsertSystemSetting;
const listMedicines = async () => {
    const rows = await SequelizeModels.MedicineModel.findAll({
        where: { is_deleted: false },
        order: [["created_at", "DESC"]],
    });
    return rows.map((row) => {
        const plain = row.get({ plain: true });
        return {
            id: plain.id,
            code: plain.code,
            name: plain.name,
            unit: plain.unit,
            description: plain.description,
            is_active: plain.is_active,
            created_at: new Date(plain.created_at).toISOString(),
            updated_at: new Date(plain.updated_at).toISOString(),
        };
    });
};
exports.listMedicines = listMedicines;
const createMedicine = async (payload) => {
    const created = await SequelizeModels.MedicineModel.create({
        code: payload.code,
        name: payload.name,
        unit: payload.unit ?? null,
        description: payload.description ?? null,
        is_active: payload.isActive ?? true,
        is_deleted: false,
    });
    const plain = created.get({ plain: true });
    return {
        id: plain.id,
        code: plain.code,
        name: plain.name,
        unit: plain.unit,
        description: plain.description,
        is_active: plain.is_active,
        created_at: new Date(plain.created_at).toISOString(),
        updated_at: new Date(plain.updated_at).toISOString(),
    };
};
exports.createMedicine = createMedicine;
const updateMedicine = async (medicineId, payload) => {
    const existing = await SequelizeModels.MedicineModel.findOne({
        where: { id: medicineId, is_deleted: false },
    });
    if (!existing)
        return null;
    const updated = await existing.update({
        code: payload.code,
        name: payload.name,
        unit: payload.unit ?? null,
        description: payload.description ?? null,
        is_active: payload.isActive ?? true,
    });
    const plain = updated.get({ plain: true });
    return {
        id: plain.id,
        code: plain.code,
        name: plain.name,
        unit: plain.unit,
        description: plain.description,
        is_active: plain.is_active,
        created_at: new Date(plain.created_at).toISOString(),
        updated_at: new Date(plain.updated_at).toISOString(),
    };
};
exports.updateMedicine = updateMedicine;
const deleteMedicine = async (medicineId) => {
    const [affected] = await SequelizeModels.MedicineModel.update({ is_deleted: true, is_active: false }, { where: { id: medicineId, is_deleted: false } });
    return affected > 0;
};
exports.deleteMedicine = deleteMedicine;
const listLabTestCatalog = async () => {
    const rows = await SequelizeModels.LabTestCatalogModel.findAll({
        where: { is_deleted: false },
        order: [["created_at", "DESC"]],
    });
    return rows.map((row) => {
        const plain = row.get({ plain: true });
        return {
            id: plain.id,
            code: plain.code,
            name: plain.name,
            description: plain.description,
            is_active: plain.is_active,
            created_at: new Date(plain.created_at).toISOString(),
            updated_at: new Date(plain.updated_at).toISOString(),
        };
    });
};
exports.listLabTestCatalog = listLabTestCatalog;
const createLabTestCatalog = async (payload) => {
    const created = await SequelizeModels.LabTestCatalogModel.create({
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        is_active: payload.isActive ?? true,
        is_deleted: false,
    });
    const plain = created.get({ plain: true });
    return {
        id: plain.id,
        code: plain.code,
        name: plain.name,
        description: plain.description,
        is_active: plain.is_active,
        created_at: new Date(plain.created_at).toISOString(),
        updated_at: new Date(plain.updated_at).toISOString(),
    };
};
exports.createLabTestCatalog = createLabTestCatalog;
const updateLabTestCatalog = async (testId, payload) => {
    const existing = await SequelizeModels.LabTestCatalogModel.findOne({
        where: { id: testId, is_deleted: false },
    });
    if (!existing)
        return null;
    const updated = await existing.update({
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        is_active: payload.isActive ?? true,
    });
    const plain = updated.get({ plain: true });
    return {
        id: plain.id,
        code: plain.code,
        name: plain.name,
        description: plain.description,
        is_active: plain.is_active,
        created_at: new Date(plain.created_at).toISOString(),
        updated_at: new Date(plain.updated_at).toISOString(),
    };
};
exports.updateLabTestCatalog = updateLabTestCatalog;
const deleteLabTestCatalog = async (testId) => {
    const [affected] = await SequelizeModels.LabTestCatalogModel.update({ is_deleted: true, is_active: false }, { where: { id: testId, is_deleted: false } });
    return affected > 0;
};
exports.deleteLabTestCatalog = deleteLabTestCatalog;
const generatePatientCode = async () => {
    let code = "";
    let exists = true;
    while (exists) {
        const random = Math.floor(1000 + Math.random() * 9000);
        code = `BN${new Date().toISOString().slice(2, 10).replace(/-/g, "")}${random}`;
        exists = await exports.isPatientCodeUsed(code);
    }
    return code;
};
const getDashboardOverview = async () => exports.getAdminOverview();
exports.getDashboardOverview = getDashboardOverview;
const getDashboardTrendStats = async (input) => exports.getDashboardTrends(input);
exports.getDashboardTrendStats = getDashboardTrendStats;
const getAdminUsers = async (input) => exports.listAdminUsers({
    limit: input.pageSize,
    offset: input.offset,
    keyword: input.keyword,
    role: input.role,
});
exports.getAdminUsers = getAdminUsers;
const createUserByAdmin = async (payload) => {
    const emailUsed = await exports.findUserByEmail(payload.email);
    if (emailUsed) {
        throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Email đã tồn tại trong hệ thống");
    }
    if (payload.roles.includes("PATIENT") && !payload.patientProfile) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Thiếu thông tin hồ sơ bệnh nhân");
    }
    if (payload.roles.includes("DOCTOR") && !payload.doctorProfile) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Thiếu thông tin hồ sơ bác sĩ");
    }
    if (payload.patientProfile?.phoneNumber) {
        const phoneUsed = await exports.isPhoneUsed(payload.patientProfile.phoneNumber);
        if (phoneUsed) {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Số điện thoại đã được sử dụng");
        }
    }
    if (payload.doctorProfile?.doctorCode) {
        const doctorCodeUsed = await exports.isDoctorCodeUsed(payload.doctorProfile.doctorCode);
        if (doctorCodeUsed) {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Mã bác sĩ đã tồn tại");
        }
    }
    const passwordHash = await password.hashPassword(payload.password);
    try {
        return await exports.createAdminUser({
            fullName: payload.fullName,
            email: payload.email,
            passwordHash,
            roles: payload.roles,
            patientProfile: payload.patientProfile
                ? {
                    patientCode: await generatePatientCode(),
                    phoneNumber: payload.patientProfile.phoneNumber,
                    dateOfBirth: payload.patientProfile.dateOfBirth,
                    gender: payload.patientProfile.gender,
                    address: payload.patientProfile.address,
                    healthInsuranceNumber: payload.patientProfile.healthInsuranceNumber,
                }
                : undefined,
            doctorProfile: payload.doctorProfile,
        });
    }
    catch (error) {
        const pgCode = error?.code;
        if (pgCode === "23505") {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Dữ liệu người dùng đã tồn tại");
        }
        throw error;
    }
};
exports.createUserByAdmin = createUserByAdmin;
const updateUserByAdmin = async (userId, payload) => {
    const user = await exports.findUserById(userId);
    if (!user) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    if (payload.email) {
        const existing = await exports.findUserByEmail(payload.email);
        if (existing && existing.id !== userId) {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Email đã tồn tại trong hệ thống");
        }
    }
    await exports.updateAdminUserBasic(userId, payload);
};
exports.updateUserByAdmin = updateUserByAdmin;
const updateUserStatusByAdmin = async (userId, isActive) => {
    const user = await exports.findUserById(userId);
    if (!user) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    await exports.updateAdminUserStatus(userId, isActive);
};
exports.updateUserStatusByAdmin = updateUserStatusByAdmin;
const updateUserRolesByAdmin = async (userId, roles) => {
    const user = await exports.findUserById(userId);
    if (!user) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    await exports.replaceAdminUserRoles(userId, roles);
};
exports.updateUserRolesByAdmin = updateUserRolesByAdmin;
const deleteUserByAdmin = async (userId) => {
    const user = await exports.findUserById(userId);
    if (!user) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy người dùng");
    }
    await exports.deleteAdminUser(userId);
};
exports.deleteUserByAdmin = deleteUserByAdmin;
const getRevenueStats = async (input) => exports.getRevenueReport(input);
exports.getRevenueStats = getRevenueStats;
const toRevenueCsv = (rows) => {
    const headers = ["period", "total_revenue", "total_transactions"];
    const body = rows.map((row) => [row.period, row.total_revenue, row.total_transactions].join(","));
    return [headers.join(","), ...body].join("\n");
};
const toRevenuePdf = async (rows) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(16).text("Bao cao doanh thu", { align: "center" });
    doc.moveDown(0.8);
    doc.fontSize(10).text(`Thoi gian tao: ${new Date().toISOString()}`);
    doc.moveDown(1);
    doc.fontSize(11).text("Period", 36, doc.y, { continued: true, width: 180 });
    doc.text("Doanh thu", 220, doc.y, { continued: true, width: 150 });
    doc.text("Giao dich", 380, doc.y, { width: 100 });
    doc.moveDown(0.5);
    rows.forEach((row) => {
        doc.fontSize(10).text(row.period, 36, doc.y, { continued: true, width: 180 });
        doc.text(row.total_revenue, 220, doc.y, { continued: true, width: 150 });
        doc.text(row.total_transactions, 380, doc.y, { width: 100 });
        doc.moveDown(0.3);
    });
    doc.end();
});
const exportRevenueReport = async (input) => {
    const rows = await exports.getRevenueReport({
        fromDate: input.fromDate,
        toDate: input.toDate,
        groupBy: input.groupBy,
    });
    if (input.format === "csv") {
        return {
            contentType: "text/csv; charset=utf-8",
            filename: `revenue-report-${input.groupBy}.csv`,
            body: toRevenueCsv(rows),
        };
    }
    const pdfBuffer = await toRevenuePdf(rows);
    return {
        contentType: "application/pdf",
        filename: `revenue-report-${input.groupBy}.pdf`,
        body: pdfBuffer,
    };
};
exports.exportRevenueReport = exportRevenueReport;
const toDateOnly = (date) => date.toISOString().slice(0, 10);
const calculateGrowthPercent = (currentValue, previousValue) => {
    if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0;
    }
    return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
};
const getRangeByPeriod = (period) => {
    const now = new Date();
    if (period === "month") {
        const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        const currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
        const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
        const previousEnd = currentStart;
        return {
            period: "month",
            currentStart,
            currentEnd,
            previousStart,
            previousEnd,
        };
    }
    const dayOffset = (now.getUTCDay() + 6) % 7;
    const currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset, 0, 0, 0, 0));
    const currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset + 7, 0, 0, 0, 0));
    const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset - 7, 0, 0, 0, 0));
    const previousEnd = currentStart;
    return {
        period: "week",
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
    };
};
const getAdvancedDashboardOverview = async (period) => {
    const range = getRangeByPeriod(period);
    const currentStartDate = toDateOnly(range.currentStart);
    const currentEndDate = toDateOnly(range.currentEnd);
    const previousStartDate = toDateOnly(range.previousStart);
    const previousEndDate = toDateOnly(range.previousEnd);
    const [currentPatients, previousPatients, currentAppointments, previousAppointments, currentRevenue, previousRevenue,] = await Promise.all([
        SequelizeModels.PatientModel.count({
            where: {
                created_at: {
                    [sequelize.Op.gte]: range.currentStart,
                    [sequelize.Op.lt]: range.currentEnd,
                },
            },
        }),
        SequelizeModels.PatientModel.count({
            where: {
                created_at: {
                    [sequelize.Op.gte]: range.previousStart,
                    [sequelize.Op.lt]: range.previousEnd,
                },
            },
        }),
        SequelizeModels.AppointmentModel.count({
            include: [
                {
                    model: SequelizeModels.DoctorSlotModel,
                    as: "slot",
                    required: true,
                    where: {
                        slot_date: {
                            [sequelize.Op.gte]: currentStartDate,
                            [sequelize.Op.lt]: currentEndDate,
                        },
                    },
                },
            ],
        }),
        SequelizeModels.AppointmentModel.count({
            include: [
                {
                    model: SequelizeModels.DoctorSlotModel,
                    as: "slot",
                    required: true,
                    where: {
                        slot_date: {
                            [sequelize.Op.gte]: previousStartDate,
                            [sequelize.Op.lt]: previousEndDate,
                        },
                    },
                },
            ],
        }),
        SequelizeModels.PaymentTransactionModel.sum("amount", {
            where: {
                status: "PAID",
                paid_at: {
                    [sequelize.Op.gte]: range.currentStart,
                    [sequelize.Op.lt]: range.currentEnd,
                },
            },
        }),
        SequelizeModels.PaymentTransactionModel.sum("amount", {
            where: {
                status: "PAID",
                paid_at: {
                    [sequelize.Op.gte]: range.previousStart,
                    [sequelize.Op.lt]: range.previousEnd,
                },
            },
        }),
    ]);
    const currentRevenueValue = Number(currentRevenue ?? 0);
    const previousRevenueValue = Number(previousRevenue ?? 0);
    return {
        period: range.period,
        range: {
            from: currentStartDate,
            to: toDateOnly(new Date(range.currentEnd.getTime() - 1)),
        },
        summary: {
            new_patients: currentPatients,
            appointments: currentAppointments,
            revenue: currentRevenueValue.toString(),
        },
        growth: {
            new_patients_percent: calculateGrowthPercent(currentPatients, previousPatients),
            appointments_percent: calculateGrowthPercent(currentAppointments, previousAppointments),
            revenue_percent: calculateGrowthPercent(currentRevenueValue, previousRevenueValue),
        },
    };
};
exports.getAdvancedDashboardOverview = getAdvancedDashboardOverview;
const getTopDepartmentsByPatients = async (period, limit = 5) => {
    const range = getRangeByPeriod(period);
    const rows = await db.query(`
      SELECT
        dep.id,
        dep.name,
        COUNT(DISTINCT a.patient_id)::int AS patient_count,
        COUNT(a.id)::int AS appointment_count
      FROM appointments a
      INNER JOIN departments dep ON dep.id = a.department_id
      INNER JOIN doctor_slots ds ON ds.id = a.slot_id
      WHERE ds.slot_date >= $1::date
        AND ds.slot_date < $2::date
      GROUP BY dep.id, dep.name
      ORDER BY patient_count DESC, appointment_count DESC, dep.name ASC
      LIMIT $3
    `, [toDateOnly(range.currentStart), toDateOnly(range.currentEnd), Math.max(1, Math.min(limit, 20))]);
    return rows.rows;
};
exports.getTopDepartmentsByPatients = getTopDepartmentsByPatients;
const getRevenueByService = async (period) => {
    const range = getRangeByPeriod(period);
    const rows = await db.query(`
      SELECT
        COALESCE(service_snapshot, 'Khac') AS service_name,
        COALESCE(SUM(amount), 0)::text AS total_revenue,
        COUNT(*)::int AS total_transactions
      FROM payment_transactions
      WHERE status = 'PAID'
        AND paid_at >= $1
        AND paid_at < $2
      GROUP BY service_name
      ORDER BY SUM(amount) DESC, service_name ASC
    `, [range.currentStart.toISOString(), range.currentEnd.toISOString()]);
    return rows.rows;
};
exports.getRevenueByService = getRevenueByService;
const toAdvancedReportCsv = (overview, topDepartments, serviceRevenue) => {
    const lines = [
        "section,key,value",
        `overview,period,${overview.period}`,
        `overview,from,${overview.range.from}`,
        `overview,to,${overview.range.to}`,
        `overview,new_patients,${overview.summary.new_patients}`,
        `overview,appointments,${overview.summary.appointments}`,
        `overview,revenue,${overview.summary.revenue}`,
        `overview,new_patients_growth_percent,${overview.growth.new_patients_percent}`,
        `overview,appointments_growth_percent,${overview.growth.appointments_percent}`,
        `overview,revenue_growth_percent,${overview.growth.revenue_percent}`,
        "",
        "top_departments,department,patient_count,appointment_count",
        ...topDepartments.map((item) => `top_departments,\"${item.name}\",${item.patient_count},${item.appointment_count}`),
        "",
        "service_revenue,service,total_revenue,total_transactions",
        ...serviceRevenue.map((item) => `service_revenue,\"${item.service_name}\",${item.total_revenue},${item.total_transactions}`),
    ];
    return lines.join("\n");
};
const toAdvancedReportPdf = async (overview, topDepartments, serviceRevenue) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(16).text("Bao cao quan tri nang cao", { align: "center" });
    doc.moveDown(0.8);
    doc.fontSize(10).text(`Period: ${overview.period}`);
    doc.text(`Range: ${overview.range.from} -> ${overview.range.to}`);
    doc.moveDown(0.6);
    doc.text(`Benh nhan moi: ${overview.summary.new_patients}`);
    doc.text(`Luot kham: ${overview.summary.appointments}`);
    doc.text(`Doanh thu: ${overview.summary.revenue}`);
    doc.text(`Tang truong benh nhan: ${overview.growth.new_patients_percent}%`);
    doc.text(`Tang truong luot kham: ${overview.growth.appointments_percent}%`);
    doc.text(`Tang truong doanh thu: ${overview.growth.revenue_percent}%`);
    doc.moveDown(1);
    doc.fontSize(12).text("Top khoa dong benh nhan");
    doc.moveDown(0.3);
    topDepartments.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.name} - BN: ${item.patient_count}, Luot kham: ${item.appointment_count}`);
    });
    doc.moveDown(1);
    doc.fontSize(12).text("Doanh thu theo dich vu");
    doc.moveDown(0.3);
    serviceRevenue.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${item.service_name} - DT: ${item.total_revenue}, GD: ${item.total_transactions}`);
    });
    doc.end();
});
const exportAdvancedDashboardReport = async (input) => {
    const overview = await getAdvancedDashboardOverview(input.period);
    const topDepartments = await getTopDepartmentsByPatients(input.period, 10);
    const serviceRevenue = await getRevenueByService(input.period);
    if (input.format === "csv") {
        return {
            contentType: "text/csv; charset=utf-8",
            filename: `advanced-report-${input.period}.csv`,
            body: toAdvancedReportCsv(overview, topDepartments, serviceRevenue),
        };
    }
    const pdfBuffer = await toAdvancedReportPdf(overview, topDepartments, serviceRevenue);
    return {
        contentType: "application/pdf",
        filename: `advanced-report-${input.period}.pdf`,
        body: pdfBuffer,
    };
};
exports.exportAdvancedDashboardReport = exportAdvancedDashboardReport;
const getPaymentReconciliation = async (input) => {
    const conditions = [];
    const params = [];
    if (input.gateway) {
        params.push(input.gateway);
        conditions.push(`payment_gateway = $${params.length}`);
    }
    if (input.status) {
        params.push(input.status);
        conditions.push(`status = $${params.length}`);
    }
    if (input.fromDate) {
        params.push(`${input.fromDate}T00:00:00.000Z`);
        conditions.push(`created_at >= $${params.length}`);
    }
    if (input.toDate) {
        params.push(`${input.toDate}T23:59:59.999Z`);
        conditions.push(`created_at <= $${params.length}`);
    }
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const listResult = await db.query(`
      SELECT
        id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        status,
        gateway_order_code,
        gateway_transaction_code,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
      FROM payment_transactions
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `, [...params, input.pageSize, input.offset]);
    const countResult = await db.query(`
      SELECT COUNT(*)::int AS total
      FROM payment_transactions
      ${whereSql}
    `, params);
    const summaryResult = await db.query(`
      SELECT
        COUNT(*)::int AS total_transactions,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_transactions,
        COUNT(*) FILTER (WHERE status = 'PAID' AND reconciled_at IS NULL)::int AS paid_unreconciled_transactions,
        COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed_transactions,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0)::text AS paid_revenue
      FROM payment_transactions
      ${whereSql}
    `, params);
    return {
        rows: listResult.rows,
        total: Number(countResult.rows[0]?.total ?? 0),
        summary: summaryResult.rows[0] ?? {
            total_transactions: 0,
            pending_transactions: 0,
            paid_unreconciled_transactions: 0,
            failed_transactions: 0,
            paid_revenue: "0",
        },
    };
};
exports.getPaymentReconciliation = getPaymentReconciliation;
const reconcilePaymentTransaction = async (paymentId) => {
    const updated = await db.query(`
      UPDATE payment_transactions
      SET reconciled_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
        AND status = 'PAID'
      RETURNING
        id,
        invoice_code,
        status,
        payment_gateway,
        reconciled_at::text
    `, [paymentId]);
    if (updated.rows[0]) {
        return updated.rows[0];
    }
    const existing = await db.query(`
      SELECT id, status
      FROM payment_transactions
      WHERE id = $1
      LIMIT 1
    `, [paymentId]);
    if (!existing.rows[0]) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay giao dich thanh toan");
    }
    throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Chi giao dich da thanh toan moi duoc doi soat");
};
exports.reconcilePaymentTransaction = reconcilePaymentTransaction;
const getAdvancedDashboardOverviewByAdmin = async (period) => getAdvancedDashboardOverview(period);
exports.getAdvancedDashboardOverviewByAdmin = getAdvancedDashboardOverviewByAdmin;
const getTopDepartmentsByAdmin = async (period, limit) => getTopDepartmentsByPatients(period, limit);
exports.getTopDepartmentsByAdmin = getTopDepartmentsByAdmin;
const getRevenueByServiceByAdmin = async (period) => getRevenueByService(period);
exports.getRevenueByServiceByAdmin = getRevenueByServiceByAdmin;
const getPaymentReconciliationByAdmin = async (input) => getPaymentReconciliation(input);
exports.getPaymentReconciliationByAdmin = getPaymentReconciliationByAdmin;
const reconcilePaymentTransactionByAdmin = async (paymentId) => reconcilePaymentTransaction(paymentId);
exports.reconcilePaymentTransactionByAdmin = reconcilePaymentTransactionByAdmin;
const getSystemSettings = async () => exports.listSystemSettings();
exports.getSystemSettings = getSystemSettings;
const saveSystemSetting = async (payload) => exports.upsertSystemSetting(payload);
exports.saveSystemSetting = saveSystemSetting;
const getMedicines = async () => exports.listMedicines();
exports.getMedicines = getMedicines;
const createMedicineByAdmin = async (payload) => {
    try {
        return await exports.createMedicine(payload);
    }
    catch (error) {
        const pgCode = error?.code;
        if (pgCode === "23505") {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Mã thuốc đã tồn tại");
        }
        throw error;
    }
};
exports.createMedicineByAdmin = createMedicineByAdmin;
const updateMedicineByAdmin = async (medicineId, payload) => {
    const updated = await exports.updateMedicine(medicineId, payload);
    if (!updated) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy thuốc");
    }
    return updated;
};
exports.updateMedicineByAdmin = updateMedicineByAdmin;
const deleteMedicineByAdmin = async (medicineId) => {
    const deleted = await exports.deleteMedicine(medicineId);
    if (!deleted) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy thuốc");
    }
};
exports.deleteMedicineByAdmin = deleteMedicineByAdmin;
const getLabTestCatalogByAdmin = async () => exports.listLabTestCatalog();
exports.getLabTestCatalogByAdmin = getLabTestCatalogByAdmin;
const createLabTestCatalogByAdmin = async (payload) => {
    try {
        return await exports.createLabTestCatalog(payload);
    }
    catch (error) {
        const pgCode = error?.code;
        if (pgCode === "23505") {
            throw new app_error.AppError(http_status_codes.StatusCodes.CONFLICT, "Mã xét nghiệm đã tồn tại");
        }
        throw error;
    }
};
exports.createLabTestCatalogByAdmin = createLabTestCatalogByAdmin;
const updateLabTestCatalogByAdmin = async (testId, payload) => {
    const updated = await exports.updateLabTestCatalog(testId, payload);
    if (!updated) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy xét nghiệm");
    }
    return updated;
};
exports.updateLabTestCatalogByAdmin = updateLabTestCatalogByAdmin;
const deleteLabTestCatalogByAdmin = async (testId) => {
    const deleted = await exports.deleteLabTestCatalog(testId);
    if (!deleted) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy xét nghiệm");
    }
};
exports.deleteLabTestCatalogByAdmin = deleteLabTestCatalogByAdmin;
const listActiveDoctorsForAnnouncement = async () => {
    const result = await db.query(`
      SELECT
        d.id,
        d.user_id,
        d.full_name,
        d.doctor_code
      FROM doctors d
      INNER JOIN users u ON u.id = d.user_id
      WHERE d.is_deleted = FALSE
        AND d.is_active = TRUE
        AND d.user_id IS NOT NULL
        AND u.is_deleted = FALSE
        AND u.is_active = TRUE
      ORDER BY d.full_name ASC
    `);
    return result.rows;
};
exports.listActiveDoctorsForAnnouncement = listActiveDoctorsForAnnouncement;
const createDoctorAnnouncementByAdmin = async (payload) => {
    const title = payload.title.trim();
    const message = payload.message.trim();
    if (payload.sendToAllDoctors) {
        const doctors = await exports.listActiveDoctorsForAnnouncement();
        if (doctors.length === 0) {
            throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong co bac si hop le de gui thong bao");
        }
        const targetUserIds = doctors.map((doctor) => doctor.user_id);
        await db.query(`
          INSERT INTO notifications (user_id, title, message, type)
          SELECT UNNEST($1::uuid[]), $2, $3, 'DOCTOR_ANNOUNCEMENT'
        `, [targetUserIds, title, message]);
        return {
            send_to_all_doctors: true,
            total_recipients: doctors.length,
            doctor_ids: doctors.map((doctor) => doctor.id),
            notification_type: "DOCTOR_ANNOUNCEMENT",
        };
    }
    if (!payload.doctorId) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Thieu doctorId de gui thong bao");
    }
    const targetDoctor = await db.query(`
      SELECT
        d.id,
        d.user_id
      FROM doctors d
      INNER JOIN users u ON u.id = d.user_id
      WHERE d.id = $1
        AND d.is_deleted = FALSE
        AND d.is_active = TRUE
        AND d.user_id IS NOT NULL
        AND u.is_deleted = FALSE
        AND u.is_active = TRUE
      LIMIT 1
    `, [payload.doctorId]);
    const doctor = targetDoctor.rows[0];
    if (!doctor) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay bac si hoat dong de gui thong bao");
    }
    await db.query(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, 'DOCTOR_ANNOUNCEMENT')
    `, [doctor.user_id, title, message]);
    return {
        send_to_all_doctors: false,
        total_recipients: 1,
        doctor_ids: [doctor.id],
        notification_type: "DOCTOR_ANNOUNCEMENT",
    };
};
exports.createDoctorAnnouncementByAdmin = createDoctorAnnouncementByAdmin;
const getNotificationJobsByAdmin = async (input) => notification_queue_service.listNotificationJobs(input.pageSize, input.offset, input.status);
exports.getNotificationJobsByAdmin = getNotificationJobsByAdmin;
const processNotificationJobsByAdmin = async (batchSize) => notification_queue_service.processNotificationQueueBatch(batchSize);
exports.processNotificationJobsByAdmin = processNotificationJobsByAdmin;
