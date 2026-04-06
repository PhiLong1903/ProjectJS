const zod_1 = require("zod");
exports.departmentBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(150),
    slug: zod_1.z
        .string()
        .min(2)
        .max(160)
        .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        .optional(),
    description: zod_1.z.string().max(1200).optional(),
    location: zod_1.z.string().max(255).optional(),
    phone: zod_1.z
        .string()
        .regex(/^(0|\+84)(2|3|5|7|8|9)[0-9]{7,9}$/, "Số điện thoại không hợp lệ")
        .optional(),
    isActive: zod_1.z.boolean().optional(),
});
