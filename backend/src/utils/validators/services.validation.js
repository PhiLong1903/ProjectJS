const zod_1 = require("zod");
exports.serviceBodySchema = zod_1.z.object({
    serviceCode: zod_1.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã dịch vụ chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    name: zod_1.z.string().min(2).max(180),
    slug: zod_1.z
        .string()
        .min(2)
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    shortDescription: zod_1.z.string().max(300).optional(),
    description: zod_1.z.string().max(3000).optional(),
    priceFrom: zod_1.z.number().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
