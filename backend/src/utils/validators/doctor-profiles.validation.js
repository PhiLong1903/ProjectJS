const zod = require("zod");
exports.doctorProfileUpdateSchema = zod.z.object({
    specialty: zod.z.string().max(255).optional(),
    experienceYears: zod.z.number().int().min(0).max(60).optional(),
    description: zod.z.string().max(2000).optional(),
    qualifications: zod.z.string().max(2000).optional(),
    avatarUrl: zod.z.string().url().optional(),
});
exports.doctorAppointmentStatusSchema = zod.z.object({
    status: zod.z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
    reason: zod.z.string().max(1000).optional(),
    doctorNote: zod.z.string().max(2000).optional(),
    diagnosis: zod.z.string().max(2000).optional(),
});
exports.doctorPrescriptionSchema = zod.z.object({
    diagnosis: zod.z.string().max(2000).optional(),
    medications: zod.z.array(zod.z.object({
        medicineCode: zod.z.string().min(1),
        medicineName: zod.z.string().min(1),
        dosage: zod.z.string().min(1),
        frequency: zod.z.string().min(1),
        duration: zod.z.string().min(1),
        note: zod.z.string().max(500).optional(),
    })),
    advice: zod.z.string().max(2000).optional(),
});
exports.doctorSlotSchema = zod.z.object({
    slotDate: zod.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "slotDate phải theo định dạng YYYY-MM-DD"),
    startTime: zod.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "startTime phải theo định dạng HH:mm"),
    endTime: zod.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "endTime phải theo định dạng HH:mm"),
});
