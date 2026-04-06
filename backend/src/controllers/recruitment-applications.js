const { StatusCodes } = require("http-status-codes");
const { sendSuccess } = require("../utils/api-response");
const { getPaginationParams, toPaginationMeta } = require("../utils/pagination");
const {
  createRecruitmentApplicationService,
  getRecruitmentApplicationsAdmin,
  getRecruitmentApplicationCvFileService,
  updateRecruitmentApplicationStatusService,
} = require("../service/recruitment-applications.service");
const { handleControllerError } = require("../utils/controller-error");

const createRecruitmentApplicationController = async (req, res, next) => {
  try {
    const data = await createRecruitmentApplicationService(req.body, req.file);
    return sendSuccess(res, StatusCodes.CREATED, "Nop ho so ung tuyen thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "recruitment-applications");
  }
};

const listRecruitmentApplicationsAdminController = async (req, res, next) => {
  try {
    const { page, pageSize, offset } = getPaginationParams(req);
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const safeStatus =
      status === "PENDING" || status === "REVIEWING" || status === "ACCEPTED" || status === "REJECTED"
        ? status
        : undefined;
    const result = await getRecruitmentApplicationsAdmin(pageSize, offset, keyword, safeStatus);
    return sendSuccess(
      res,
      StatusCodes.OK,
      "Lay danh sach ho so ung tuyen thanh cong",
      result.rows,
      toPaginationMeta(page, pageSize, result.total)
    );
  } catch (error) {
    return handleControllerError(res, error, "recruitment-applications");
  }
};

const updateRecruitmentApplicationStatusController = async (req, res, next) => {
  try {
    const data = await updateRecruitmentApplicationStatusService(req.params.applicationId, req.body, req.user?.id);
    return sendSuccess(res, StatusCodes.OK, "Cap nhat trang thai ho so ung tuyen thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "recruitment-applications");
  }
};

const downloadRecruitmentApplicationCvController = async (req, res, next) => {
  try {
    const file = await getRecruitmentApplicationCvFileService(req.params.applicationId);
    res.setHeader("Content-Type", file.mimeType);

    return res.download(file.absolutePath, file.downloadName, (error) => {
      if (error && !res.headersSent) {
        next(error);
      }
    });
  } catch (error) {
    return handleControllerError(res, error, "recruitment-applications");
  }
};

module.exports = {
  createRecruitmentApplicationController,
  listRecruitmentApplicationsAdminController,
  downloadRecruitmentApplicationCvController,
  updateRecruitmentApplicationStatusController,
};
