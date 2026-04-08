const zod = require("zod");
exports.newsBodySchema = zod.z.object({
    title: zod.z.string().min(5).max(220),
    slug: zod.z
        .string()
        .min(3)
        .max(230)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    summary: zod.z.string().max(400).optional(),
    content: zod.z.string().min(10),
    thumbnailUrl: zod.z.string().url().optional(),
    isPublished: zod.z.boolean().optional(),
});
