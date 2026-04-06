const zod_1 = require("zod");
exports.doctorBodySchema = zod_1.z.object({
    doctorCode: zod_1.z
        .string()
        .min(3)
        .max(20)
        .regex(/^[A-Z0-9-]+$/, "Mã bác sĩ chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    fullName: zod_1.z.string().min(2).max(120),
    specialty: zod_1.z.string().max(255).optional(),
    departmentId: zod_1.z.string().uuid("departmentId không hợp lệ"),
    experienceYears: zod_1.z.number().int().min(0).max(60).optional(),
    description: zod_1.z.string().max(2000).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.doctorSlotBodySchema = zod_1.z.object({
    doctorId: zod_1.z.string().uuid("doctorId không hợp lệ"),
    slotDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "slotDate phải theo định dạng YYYY-MM-DD"),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "startTime phải theo định dạng HH:mm"),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "endTime phải theo định dạng HH:mm"),
});
