const { z } = require("zod");

exports.patientRecordLookupSchema = z.object({
  patientCode: z.string().min(3).max(30),
  phoneNumber: z
    .string()
    .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "So dien thoai khong hop le"),
});
