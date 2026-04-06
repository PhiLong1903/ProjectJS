const zod_1 = require("zod");
exports.labLookupSchema = zod_1.z.object({
    patientCode: zod_1.z.string().min(3).max(30),
    phoneNumber: zod_1.z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
});
exports.labResultBodySchema = zod_1.z.object({
    patientCode: zod_1.z.string().min(3).max(30),
    testCode: zod_1.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã xét nghiệm chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    testName: zod_1.z.string().min(2).max(255),
    resultSummary: zod_1.z.string().max(500).optional(),
    resultDetail: zod_1.z.string().max(5000).optional(),
    conclusion: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.enum(["PENDING", "COMPLETED"]),
    performedAt: zod_1.z.string().datetime().optional(),
});
exports.labResultUpdateSchema = zod_1.z.object({
    testCode: zod_1.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã xét nghiệm chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    testName: zod_1.z.string().min(2).max(255),
    resultSummary: zod_1.z.string().max(500).optional(),
    resultDetail: zod_1.z.string().max(5000).optional(),
    conclusion: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.enum(["PENDING", "COMPLETED"]),
    performedAt: zod_1.z.string().datetime().optional(),
});
