const fs = require("fs");
const multer = require("multer");
const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");
const { ROLES } = require("../constants/roles");
const {
  createRecruitmentApplicationController,
  listRecruitmentApplicationsAdminController,
  downloadRecruitmentApplicationCvController,
  updateRecruitmentApplicationStatusController,
} = require("../controllers/recruitment-applications");
const { AppError } = require("../utils/app-error");
const { CheckLogin, CheckRole } = require("../utils/authHandler");
const { uploadHandler } = require("../utils/uploadHandler");
const { validateBody } = require("../utils/validateHandler");
const {
  recruitmentApplicationBodySchema,
  recruitmentApplicationStatusUpdateSchema,
} = require("../utils/validators/recruitment-applications.validation");

const recruitmentRoutes = Router();
const recruitmentAdminRoutes = Router();

const cvUploadMiddleware = uploadHandler.createPdfUploader("recruitment-cv").single("cvFile");

const uploadCvFile = (req, res, next) => {
  cvUploadMiddleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(
        new AppError(
          StatusCodes.BAD_REQUEST,
          `File CV vuot qua dung luong ${(uploadHandler.MAX_CV_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB`
        )
      );
      return;
    }

    next(error);
  });
};

const validateRecruitmentBody = (req, _res, next) => {
  try {
    req.body = recruitmentApplicationBodySchema.parse(req.body);
    next();
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => null);
    }
    next(error);
  }
};

recruitmentRoutes.post("/", uploadCvFile, validateRecruitmentBody, createRecruitmentApplicationController);

recruitmentAdminRoutes.use(CheckLogin, CheckRole(ROLES.ADMIN, ROLES.STAFF));
recruitmentAdminRoutes.get("/", listRecruitmentApplicationsAdminController);
recruitmentAdminRoutes.patch(
  "/:applicationId/status",
  validateBody(recruitmentApplicationStatusUpdateSchema),
  updateRecruitmentApplicationStatusController
);
recruitmentAdminRoutes.get("/:applicationId/cv", downloadRecruitmentApplicationCvController);

module.exports = {
  recruitmentRoutes,
  recruitmentAdminRoutes,
};
