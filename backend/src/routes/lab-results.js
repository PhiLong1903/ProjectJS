const express = require("express");
const env = require("../config/env");
const roles = require("../constants/roles");
const authHandler = require("../utils/authHandler");
const rate_limit_middleware = require("../middlewares/rate-limit.middleware");
const validateHandler = require("../utils/validateHandler");
const lab_results = require("../controllers/lab-results");
const lab_results_validation = require("../utils/validators/lab-results.validation");
exports.labResultsRoutes = express.Router();
exports.labResultsAdminRoutes = express.Router();
const lookupRateLimiter = rate_limit_middleware.createRateLimiter({
    keyPrefix: "lab-lookup",
    windowMs: env.env.LAB_LOOKUP_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.env.LAB_LOOKUP_RATE_LIMIT_MAX,
    message: "Bạn tra cứu quá nhanh. Vui lòng thử lại sau.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.patientCode ?? "").trim()}`,
});
exports.labResultsRoutes.post("/lookup", lookupRateLimiter, validateHandler.validateBody(lab_results_validation.labLookupSchema), lab_results.lookupLabResultController);
exports.labResultsAdminRoutes.use(authHandler.CheckLogin, authHandler.CheckRole(roles.ROLES.ADMIN, roles.ROLES.STAFF, roles.ROLES.DOCTOR));
exports.labResultsAdminRoutes.get("/", lab_results.listLabResultsAdminController);
exports.labResultsAdminRoutes.get("/:labResultId", lab_results.labResultDetailAdminController);
exports.labResultsAdminRoutes.post("/", validateHandler.validateBody(lab_results_validation.labResultBodySchema), lab_results.createLabResultController);
exports.labResultsAdminRoutes.put("/:labResultId", validateHandler.validateBody(lab_results_validation.labResultUpdateSchema), lab_results.updateLabResultController);
exports.labResultsAdminRoutes.delete("/:labResultId", authHandler.CheckRole(roles.ROLES.ADMIN, roles.ROLES.STAFF), lab_results.deleteLabResultController);
