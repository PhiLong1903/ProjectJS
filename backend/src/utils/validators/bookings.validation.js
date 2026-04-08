const zod = require("zod");
exports.bookingBodySchema = zod.z.object({
    departmentId: zod.z.string().uuid("departmentId không hợp lệ"),
    doctorId: zod.z.string().uuid("doctorId không hợp lệ"),
    slotId: zod.z.string().uuid("slotId không hợp lệ"),
    reason: zod.z.string().max(1000).optional(),
    notes: zod.z.string().max(1000).optional(),
});
exports.bookingStatusSchema = zod.z.object({
    status: zod.z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});
