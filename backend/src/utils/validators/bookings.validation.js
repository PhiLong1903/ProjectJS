const zod_1 = require("zod");
exports.bookingBodySchema = zod_1.z.object({
    departmentId: zod_1.z.string().uuid("departmentId không hợp lệ"),
    doctorId: zod_1.z.string().uuid("doctorId không hợp lệ"),
    slotId: zod_1.z.string().uuid("slotId không hợp lệ"),
    reason: zod_1.z.string().max(1000).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.bookingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});
