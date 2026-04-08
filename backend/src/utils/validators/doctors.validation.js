const zod = require("zod");
exports.doctorBodySchema = zod.z.object({
    doctorCode: zod.z
        .string()
        .min(3)
        .max(20)
        .regex(/^[A-Z0-9-]+$/, "Mã bác sĩ chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    fullName: zod.z.string().min(2).max(120),
    specialty: zod.z.string().max(255).optional(),
    departmentId: zod.z.string().uuid("departmentId không hợp lệ"),
    experienceYears: zod.z.number().int().min(0).max(60).optional(),
    description: zod.z.string().max(2000).optional(),
    avatarUrl: zod.z.string().url().optional(),
    isActive: zod.z.boolean().optional(),
});
exports.doctorSlotBodySchema = zod.z.object({
    doctorId: zod.z.string().uuid("doctorId không hợp lệ"),
    slotDate: zod.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "slotDate phải theo định dạng YYYY-MM-DD"),
    startTime: zod.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "startTime phải theo định dạng HH:mm"),
    endTime: zod.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "endTime phải theo định dạng HH:mm"),
});
