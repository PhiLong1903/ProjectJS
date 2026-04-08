const zod = require("zod");

exports.patientProfileUpdateSchema = zod.z.object({
  fullName: zod.z.string().min(2, "Ho ten toi thieu 2 ky tu").max(120).optional(),
  dateOfBirth: zod.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay sinh phai theo dinh dang YYYY-MM-DD")
    .optional(),
  gender: zod.z.enum(["Nam", "Nu", "Khac", "Nữ", "Khác"]).optional(),
  address: zod.z.string().max(255).optional(),
  phoneNumber: zod.z
    .string()
    .regex(/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/, "So dien thoai khong hop le")
    .optional(),
  healthInsuranceNumber: zod.z.string().max(30).optional(),
});

exports.cancelBookingSchema = zod.z.object({
  reason: zod.z.string().min(5, "Ly do huy toi thieu 5 ky tu").max(500),
});

exports.rescheduleBookingSchema = zod.z.object({
  newSlotId: zod.z.string().uuid("newSlotId khong hop le"),
  reason: zod.z.string().min(5, "Ly do doi lich toi thieu 5 ky tu").max(500),
});

exports.createPaymentSchema = zod.z.object({
  appointmentId: zod.z.string().uuid("appointmentId khong hop le"),
  amount: zod.z.number().min(0, "So tien phai >= 0"),
  method: zod.z.enum(["CARD", "EWALLET", "BANK_TRANSFER", "CASH", "VNPAY", "MOMO"]),
  serviceName: zod.z.string().min(2).max(180).optional(),
});

exports.confirmPaymentSchema = zod.z.object({
  gatewayTransactionCode: zod.z.string().min(4).max(120).optional(),
});

exports.failPaymentSchema = zod.z.object({
  reason: zod.z.string().min(2).max(500).optional(),
});

exports.createReviewSchema = zod.z.object({
  appointmentId: zod.z.string().uuid("appointmentId khong hop le"),
  rating: zod.z.number().int().min(1).max(5),
  comment: zod.z.string().max(1000).optional(),
});