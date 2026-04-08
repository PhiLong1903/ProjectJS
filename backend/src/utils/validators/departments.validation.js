const zod = require("zod");
exports.departmentBodySchema = zod.z.object({
    name: zod.z.string().min(2).max(150),
    slug: zod.z
        .string()
        .min(2)
        .max(160)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    description: zod.z.string().max(1200).optional(),
    location: zod.z.string().max(255).optional(),
    phone: zod.z
        .string()
        .regex(/^(0|\+84)(2|3|5|7|8|9)[0-9]{7,9}$/, "Số điện thoại không hợp lệ")
        .optional(),
    isActive: zod.z.boolean().optional(),
});
