const zod = require("zod");
exports.serviceBodySchema = zod.z.object({
    serviceCode: zod.z
        .string()
        .min(2)
        .max(50)
        .regex(/^[A-Z0-9-]+$/, "Mã dịch vụ chỉ gồm chữ in hoa, số và dấu gạch ngang"),
    name: zod.z.string().min(2).max(180),
    slug: zod.z
        .string()
        .min(2)
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    shortDescription: zod.z.string().max(300).optional(),
    description: zod.z.string().max(3000).optional(),
    priceFrom: zod.z.number().min(0).optional(),
    isActive: zod.z.boolean().optional(),
});
