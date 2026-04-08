const zod = require("zod");
const roleSchema = zod.z.enum(["ADMIN", "DOCTOR", "PATIENT", "STAFF"]);
exports.adminCreateUserSchema = zod.z.object({
    fullName: zod.z.string().min(2).max(120),
    email: zod.z.string().email(),
    password: zod.z.string().min(8).max(100),
    roles: zod.z.array(roleSchema).min(1),
    patientProfile: zod.z
        .object({
        phoneNumber: zod.z
            .string()
            .regex(/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
        dateOfBirth: zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        gender: zod.z.enum(["Nam", "Nữ", "Khác"]).optional(),
        address: zod.z.string().max(255).optional(),
        healthInsuranceNumber: zod.z.string().max(30).optional(),
    })
        .optional(),
    doctorProfile: zod.z
        .object({
        doctorCode: zod.z.string().min(3).max(20),
        departmentId: zod.z.string().uuid(),
        specialty: zod.z.string().max(255).optional(),
        experienceYears: zod.z.number().int().min(0).max(60).optional(),
        qualifications: zod.z.string().max(2000).optional(),
        description: zod.z.string().max(2000).optional(),
    })
        .optional(),
});
exports.adminUpdateUserSchema = zod.z.object({
    fullName: zod.z.string().min(2).max(120).optional(),
    email: zod.z.string().email().optional(),
});
exports.adminUpdateUserStatusSchema = zod.z.object({
    isActive: zod.z.boolean(),
});
exports.adminUpdateUserRolesSchema = zod.z.object({
    roles: zod.z.array(roleSchema).min(1),
});
exports.adminDoctorAnnouncementSchema = zod.z
    .object({
    title: zod.z.string().trim().min(3).max(180),
    message: zod.z.string().trim().min(5).max(4000),
    doctorId: zod.z.string().uuid().optional(),
    sendToAllDoctors: zod.z.boolean().optional().default(false),
})
    .superRefine((value, ctx) => {
    if (!value.sendToAllDoctors && !value.doctorId) {
        ctx.addIssue({
            code: zod.z.ZodIssueCode.custom,
            message: "Can cung cap doctorId hoac bat sendToAllDoctors = true",
            path: ["doctorId"],
        });
    }
});
exports.adminSettingSchema = zod.z.object({
    key: zod.z.string().min(2).max(80),
    value: zod.z.record(zod.z.any()),
    description: zod.z.string().max(1000).optional(),
});
exports.medicineSchema = zod.z.object({
    code: zod.z.string().min(2).max(50),
    name: zod.z.string().min(2).max(255),
    unit: zod.z.string().max(50).optional(),
    description: zod.z.string().max(1000).optional(),
    isActive: zod.z.boolean().optional(),
});
exports.labTestCatalogSchema = zod.z.object({
    code: zod.z.string().min(2).max(50),
    name: zod.z.string().min(2).max(255),
    description: zod.z.string().max(1000).optional(),
    isActive: zod.z.boolean().optional(),
});
