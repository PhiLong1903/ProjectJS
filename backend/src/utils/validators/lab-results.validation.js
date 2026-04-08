const zod = require("zod");
exports.labLookupSchema = zod.z.object({
    patientCode: zod.z.string().min(3).max(30),
    phoneNumber: zod.z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
});
exports.labResultBodySchema = zod.z.object({
    patientCode: zod.z.string().min(3).max(30),
    testCode: zod.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã xét nghiệm chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    testName: zod.z.string().min(2).max(255),
    resultSummary: zod.z.string().max(500).optional(),
    resultDetail: zod.z.string().max(5000).optional(),
    conclusion: zod.z.string().max(2000).optional(),
    status: zod.z.enum(["PENDING", "COMPLETED"]),
    performedAt: zod.z.string().datetime().optional(),
});
exports.labResultUpdateSchema = zod.z.object({
    testCode: zod.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã xét nghiệm chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    testName: zod.z.string().min(2).max(255),
    resultSummary: zod.z.string().max(500).optional(),
    resultDetail: zod.z.string().max(5000).optional(),
    conclusion: zod.z.string().max(2000).optional(),
    status: zod.z.enum(["PENDING", "COMPLETED"]),
    performedAt: zod.z.string().datetime().optional(),
});
