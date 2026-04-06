const zod_1 = require("zod");
exports.contactBodySchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(120),
    phoneNumber: zod_1.z
        .string()
        .regex(/^(0|\+84)(2|3|5|7|8|9)[0-9]{7,9}$/, "Số điện thoại không hợp lệ")
        .optional(),
    email: zod_1.z.string().email("Email không hợp lệ").optional(),
    subject: zod_1.z.string().min(3).max(180),
    message: zod_1.z.string().min(10).max(5000),
});
