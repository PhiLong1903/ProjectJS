const zod_1 = require("zod");
exports.doctorProfileUpdateSchema = zod_1.z.object({
    specialty: zod_1.z.string().max(255).optional(),
    experienceYears: zod_1.z.number().int().min(0).max(60).optional(),
    description: zod_1.z.string().max(2000).optional(),
    qualifications: zod_1.z.string().max(2000).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
exports.doctorAppointmentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
    reason: zod_1.z.string().max(1000).optional(),
    doctorNote: zod_1.z.string().max(2000).optional(),
    diagnosis: zod_1.z.string().max(2000).optional(),
});
exports.doctorPrescriptionSchema = zod_1.z.object({
    diagnosis: zod_1.z.string().max(2000).optional(),
    medications: zod_1.z.array(zod_1.z.object({
        medicineCode: zod_1.z.string().min(1),
        medicineName: zod_1.z.string().min(1),
        dosage: zod_1.z.string().min(1),
        frequency: zod_1.z.string().min(1),
        duration: zod_1.z.string().min(1),
        note: zod_1.z.string().max(500).optional(),
    })),
    advice: zod_1.z.string().max(2000).optional(),
});
exports.doctorSlotSchema = zod_1.z.object({
    slotDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "slotDate phải theo định dạng YYYY-MM-DD"),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "startTime phải theo định dạng HH:mm"),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "endTime phải theo định dạng HH:mm"),
});
