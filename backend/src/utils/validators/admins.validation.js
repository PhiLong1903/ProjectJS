const zod_1 = require("zod");
const roleSchema = zod_1.z.enum(["ADMIN", "DOCTOR", "PATIENT", "STAFF"]);
exports.adminCreateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(120),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    roles: zod_1.z.array(roleSchema).min(1),
    patientProfile: zod_1.z
        .object({
        phoneNumber: zod_1.z
            .string()
            .regex(/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
        dateOfBirth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        gender: zod_1.z.enum(["Nam", "Nữ", "Khác"]).optional(),
        address: zod_1.z.string().max(255).optional(),
        healthInsuranceNumber: zod_1.z.string().max(30).optional(),
    })
        .optional(),
    doctorProfile: zod_1.z
        .object({
        doctorCode: zod_1.z.string().min(3).max(20),
        departmentId: zod_1.z.string().uuid(),
        specialty: zod_1.z.string().max(255).optional(),
        experienceYears: zod_1.z.number().int().min(0).max(60).optional(),
        qualifications: zod_1.z.string().max(2000).optional(),
        description: zod_1.z.string().max(2000).optional(),
    })
        .optional(),
});
exports.adminUpdateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(120).optional(),
    email: zod_1.z.string().email().optional(),
});
exports.adminUpdateUserStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.adminUpdateUserRolesSchema = zod_1.z.object({
    roles: zod_1.z.array(roleSchema).min(1),
});
exports.adminSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(2).max(80),
    value: zod_1.z.record(zod_1.z.any()),
    description: zod_1.z.string().max(1000).optional(),
});
exports.medicineSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(255),
    unit: zod_1.z.string().max(50).optional(),
    description: zod_1.z.string().max(1000).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.labTestCatalogSchema = zod_1.z.object({
    code: zod_1.z.string().min(2).max(50),
    name: zod_1.z.string().min(2).max(255),
    description: zod_1.z.string().max(1000).optional(),
    isActive: zod_1.z.boolean().optional(),
});
