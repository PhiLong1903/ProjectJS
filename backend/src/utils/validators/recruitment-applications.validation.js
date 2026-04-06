const { z } = require("zod");

const emptyToUndefined = (value) => {
  if (value === "") {
    return undefined;
  }

  return value;
};

exports.recruitmentApplicationBodySchema = z
  .object({
    fullName: z.string().min(2, "Ho ten toi thieu 2 ky tu").max(120, "Ho ten toi da 120 ky tu"),
    email: z.string().email("Email khong hop le"),
    phoneNumber: z
      .string()
      .regex(/^(0|\+84|84)(2|3|5|7|8|9)[0-9]{8,9}$/, "So dien thoai khong hop le"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngay sinh phai theo dinh dang YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    address: z.string().max(255, "Dia chi toi da 255 ky tu").optional().or(z.literal("")),
    appliedPosition: z.string().min(2, "Vi tri ung tuyen toi thieu 2 ky tu").max(180),
    yearsExperience: z
      .string()
      .regex(/^\d+$/, "So nam kinh nghiem phai la so nguyen")
      .optional()
      .or(z.literal("")),
    currentWorkplace: z.string().max(180).optional().or(z.literal("")),
    expectedSalary: z.string().max(120).optional().or(z.literal("")),
    coverLetter: z.string().max(4000, "Thu gioi thieu toi da 4000 ky tu").optional().or(z.literal("")),
  })
  .transform((input) => ({
    ...input,
    dateOfBirth: emptyToUndefined(input.dateOfBirth),
    address: emptyToUndefined(input.address),
    yearsExperience:
      input.yearsExperience === undefined || input.yearsExperience === ""
        ? undefined
        : Number.parseInt(input.yearsExperience, 10),
    currentWorkplace: emptyToUndefined(input.currentWorkplace),
    expectedSalary: emptyToUndefined(input.expectedSalary),
    coverLetter: emptyToUndefined(input.coverLetter),
  }));

exports.recruitmentApplicationStatusUpdateSchema = z
  .object({
    status: z.enum(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"]),
    feedbackMessage: z.string().max(2000, "Phan hoi toi da 2000 ky tu").optional().or(z.literal("")),
  })
  .transform((input) => ({
    status: input.status,
    feedbackMessage: emptyToUndefined(input.feedbackMessage),
  }));
