const zod_1 = require("zod");

exports.patientProfileUpdateSchema = zod_1.z.object({
  fullName: zod_1.z.string().min(2, "Ho ten toi thieu 2 ky tu").max(120).optional(),
  dateOfBirth: zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay sinh phai theo dinh dang YYYY-MM-DD")
    .optional(),
  gender: zod_1.z.enum(["Nam", "Nu", "Khac", "Nữ", "Khác"]).optional(),
  address: zod_1.z.string().max(255).optional(),
  phoneNumber: zod_1.z
    .string()
    .regex(/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/, "So dien thoai khong hop le")
    .optional(),
  healthInsuranceNumber: zod_1.z.string().max(30).optional(),
});

exports.cancelBookingSchema = zod_1.z.object({
  reason: zod_1.z.string().min(5, "Ly do huy toi thieu 5 ky tu").max(500),
});

exports.rescheduleBookingSchema = zod_1.z.object({
  newSlotId: zod_1.z.string().uuid("newSlotId khong hop le"),
  reason: zod_1.z.string().min(5, "Ly do doi lich toi thieu 5 ky tu").max(500),
});

exports.createPaymentSchema = zod_1.z.object({
  appointmentId: zod_1.z.string().uuid("appointmentId khong hop le"),
  amount: zod_1.z.number().min(0, "So tien phai >= 0"),
  method: zod_1.z.enum(["CARD", "EWALLET", "BANK_TRANSFER", "CASH", "VNPAY", "MOMO"]),
  serviceName: zod_1.z.string().min(2).max(180).optional(),
});

exports.confirmPaymentSchema = zod_1.z.object({
  gatewayTransactionCode: zod_1.z.string().min(4).max(120).optional(),
});

exports.failPaymentSchema = zod_1.z.object({
  reason: zod_1.z.string().min(2).max(500).optional(),
});

exports.createReviewSchema = zod_1.z.object({
  appointmentId: zod_1.z.string().uuid("appointmentId khong hop le"),
  rating: zod_1.z.number().int().min(1).max(5),
  comment: zod_1.z.string().max(1000).optional(),
});