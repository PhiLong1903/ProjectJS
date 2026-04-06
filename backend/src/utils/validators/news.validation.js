const zod_1 = require("zod");
exports.newsBodySchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(220),
    slug: zod_1.z
        .string()
        .min(3)
        .max(230)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    summary: zod_1.z.string().max(400).optional(),
    content: zod_1.z.string().min(10),
    thumbnailUrl: zod_1.z.string().url().optional(),
    isPublished: zod_1.z.boolean().optional(),
});
