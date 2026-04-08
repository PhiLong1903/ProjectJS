const zod = require("zod");
exports.contactBodySchema = zod.z.object({
    fullName: zod.z.string().min(2).max(120),
    phoneNumber: zod.z
        .string()
        .regex(/^(0|\+84)(2|3|5|7|8|9)[0-9]{7,9}$/, "Số điện thoại không hợp lệ")
        .optional(),
    email: zod.z.string().email("Email không hợp lệ").optional(),
    subject: zod.z.string().min(3).max(180),
    message: zod.z.string().min(10).max(5000),
});
