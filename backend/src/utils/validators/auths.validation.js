const { z } = require("zod");

exports.registerSchema = z.object({
  fullName: z.string().min(2, "Ho ten toi thieu 2 ky tu").max(120),
  email: z.string().email("Email khong hop le"),
  password: z
    .string()
    .min(8, "Mat khau toi thieu 8 ky tu")
    .max(100)
    .regex(/[A-Z]/, "Mat khau phai co it nhat 1 chu hoa")
    .regex(/[a-z]/, "Mat khau phai co it nhat 1 chu thuong")
    .regex(/[0-9]/, "Mat khau phai co it nhat 1 chu so"),
  phoneNumber: z.string().regex(/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/, "So dien thoai khong hop le"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay sinh phai theo dinh dang YYYY-MM-DD").optional(),
  gender: z.enum(["Nam", "Nu", "Khac", "Nữ", "Khác"]).optional(),
  address: z.string().max(255).optional(),
});

exports.loginSchema = z.object({
  email: z.string().email("Email khong hop le"),
  password: z.string().min(1, "Mat khau la bat buoc"),
  role: z.enum(["ADMIN", "DOCTOR", "PATIENT", "STAFF"], {
    required_error: "Role dang nhap la bat buoc",
  }),
});

exports.forgotPasswordSchema = z.object({
  identifier: z.string().min(3, "Identifier la bat buoc").max(255, "Identifier khong hop le"),
});

exports.resetPasswordSchema = z.object({
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu").max(100),
});
