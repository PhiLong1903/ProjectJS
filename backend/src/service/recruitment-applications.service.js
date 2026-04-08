const fs = require("fs");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { RecruitmentApplicationModel } = require("../schemas/SequelizeModels");
const { AppError } = require("../utils/app-error");
const { sendRecruitmentFeedbackEmail } = require("../utils/recruitment-mailer");

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

const resolveRelativePath = (absolutePath) => {
  const relativePath = path.relative(UPLOAD_ROOT, absolutePath).replace(/\\/g, "/");
  return relativePath;
};

const formatRecord = (row) => ({
  id: row.id,
  full_name: row.full_name,
  email: row.email,
  phone_number: row.phone_number,
  date_of_birth: row.date_of_birth,
  address: row.address,
  applied_position: row.applied_position,
  years_experience: row.years_experience,
  current_workplace: row.current_workplace,
  expected_salary: row.expected_salary,
  cover_letter: row.cover_letter,
  cv_original_name: row.cv_original_name,
  cv_mime_type: row.cv_mime_type,
  cv_size_bytes: row.cv_size_bytes,
  status: row.status,
  reviewed_by: row.reviewed_by,
  reviewed_at: row.reviewed_at ? row.reviewed_at.toISOString() : null,
  feedback_message: row.feedback_message,
  feedback_sent_at: row.feedback_sent_at ? row.feedback_sent_at.toISOString() : null,
  created_at: row.created_at.toISOString(),
  updated_at: row.updated_at.toISOString(),
});

const createRecruitmentApplication = async (payload, cvFile) => {
  if (!cvFile) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Vui long tai len CV dinh dang PDF");
  }

  const row = await RecruitmentApplicationModel.create({
    full_name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phone_number: payload.phoneNumber.trim(),
    date_of_birth: payload.dateOfBirth ?? null,
    address: payload.address?.trim() ?? null,
    applied_position: payload.appliedPosition.trim(),
    years_experience: payload.yearsExperience ?? null,
    current_workplace: payload.currentWorkplace?.trim() ?? null,
    expected_salary: payload.expectedSalary?.trim() ?? null,
    cover_letter: payload.coverLetter?.trim() ?? null,
    cv_original_name: cvFile.originalname,
    cv_storage_path: resolveRelativePath(cvFile.path),
    cv_mime_type: cvFile.mimetype,
    cv_size_bytes: cvFile.size,
    status: "PENDING",
  });

  return formatRecord(row);
};

const listRecruitmentApplications = async (limit, offset, keyword, status) => {
  const where = { is_deleted: false };

  const safeKeyword = keyword?.trim();
  if (safeKeyword) {
    where[Op.or] = [
      { full_name: { [Op.iLike]: `%${safeKeyword}%` } },
      { email: { [Op.iLike]: `%${safeKeyword}%` } },
      { applied_position: { [Op.iLike]: `%${safeKeyword}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const { rows, count } = await RecruitmentApplicationModel.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    rows: rows.map((row) => formatRecord(row)),
    total: count,
  };
};

const findRecruitmentApplicationById = async (applicationId) => {
  return RecruitmentApplicationModel.findOne({
    where: {
      id: applicationId,
      is_deleted: false,
    },
  });
};

const resolveCvAbsolutePath = (storagePath) => {
  const absolutePath = path.resolve(UPLOAD_ROOT, storagePath);

  if (!absolutePath.startsWith(UPLOAD_ROOT)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Duong dan CV khong hop le");
  }

  return absolutePath;
};

const getRecruitmentApplicationCvFile = async (applicationId) => {
  const row = await findRecruitmentApplicationById(applicationId);

  if (!row) {
    throw new AppError(StatusCodes.NOT_FOUND, "Khong tim thay ho so ung tuyen");
  }

  const absolutePath = resolveCvAbsolutePath(row.cv_storage_path);

  if (!fs.existsSync(absolutePath)) {
    throw new AppError(StatusCodes.NOT_FOUND, "Khong tim thay file CV");
  }

  return {
    absolutePath,
    downloadName: row.cv_original_name,
    mimeType: row.cv_mime_type,
  };
};

const updateRecruitmentApplicationStatus = async (applicationId, payload, actorUserId) => {
  const row = await findRecruitmentApplicationById(applicationId);
  if (!row) {
    throw new AppError(StatusCodes.NOT_FOUND, "Khong tim thay ho so ung tuyen");
  }

  row.status = payload.status;
  row.reviewed_by = actorUserId ?? null;
  row.reviewed_at = new Date();
  row.feedback_message = payload.feedbackMessage ?? null;
  await row.save();

  const emailResult = await sendRecruitmentFeedbackEmail({
    toEmail: row.email,
    fullName: row.full_name,
    status: payload.status,
    feedbackMessage: payload.feedbackMessage,
    subject: `Cap nhat ho so ung tuyen - ${payload.status}`,
  });

  if (emailResult?.delivered) {
    row.feedback_sent_at = new Date();
    await row.save();
  }

  return formatRecord(row);
};

const createRecruitmentApplicationService = async (payload, cvFile) => {
  try {
    return await createRecruitmentApplication(payload, cvFile);
  } catch (error) {
    if (cvFile?.path && fs.existsSync(cvFile.path)) {
      fs.unlink(cvFile.path, () => null);
    }
    throw error;
  }
};

const getRecruitmentApplicationsAdmin = (pageSize, offset, keyword, status) =>
  listRecruitmentApplications(pageSize, offset, keyword, status);

const getRecruitmentApplicationCvFileService = (applicationId) => getRecruitmentApplicationCvFile(applicationId);

const updateRecruitmentApplicationStatusService = (applicationId, payload, actorUserId) =>
  updateRecruitmentApplicationStatus(applicationId, payload, actorUserId);

exports.createRecruitmentApplication = createRecruitmentApplication;
exports.listRecruitmentApplications = listRecruitmentApplications;
exports.findRecruitmentApplicationById = findRecruitmentApplicationById;
exports.getRecruitmentApplicationCvFile = getRecruitmentApplicationCvFile;
exports.updateRecruitmentApplicationStatus = updateRecruitmentApplicationStatus;
exports.createRecruitmentApplicationService = createRecruitmentApplicationService;
exports.getRecruitmentApplicationsAdmin = getRecruitmentApplicationsAdmin;
exports.getRecruitmentApplicationCvFileService = getRecruitmentApplicationCvFileService;
exports.updateRecruitmentApplicationStatusService = updateRecruitmentApplicationStatusService;
