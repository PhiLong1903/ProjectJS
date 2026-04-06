const express_1 = require("express");
const env_1 = require("../config/env");
const roles_1 = require("../constants/roles");
const authHandler_1 = require("../utils/authHandler");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const validateHandler_1 = require("../utils/validateHandler");
const lab_results_1 = require("../controllers/lab-results");
const lab_results_validation_1 = require("../utils/validators/lab-results.validation");
exports.labResultsRoutes = express_1.Router();
exports.labResultsAdminRoutes = express_1.Router();
const lookupRateLimiter = rate_limit_middleware_1.createRateLimiter({
    keyPrefix: "lab-lookup",
    windowMs: env_1.env.LAB_LOOKUP_RATE_LIMIT_WINDOW_MS,
    maxRequests: env_1.env.LAB_LOOKUP_RATE_LIMIT_MAX,
    message: "Bạn tra cứu quá nhanh. Vui lòng thử lại sau.",
    keyResolver: (req) => `${req.ip}:${String(req.body?.patientCode ?? "").trim()}`,
});
exports.labResultsRoutes.post("/lookup", lookupRateLimiter, validateHandler_1.validateBody(lab_results_validation_1.labLookupSchema), lab_results_1.lookupLabResultController);
exports.labResultsAdminRoutes.use(authHandler_1.CheckLogin, authHandler_1.CheckRole(roles_1.ROLES.ADMIN, roles_1.ROLES.STAFF, roles_1.ROLES.DOCTOR));
exports.labResultsAdminRoutes.get("/", lab_results_1.listLabResultsAdminController);
exports.labResultsAdminRoutes.get("/:labResultId", lab_results_1.labResultDetailAdminController);
exports.labResultsAdminRoutes.post("/", validateHandler_1.validateBody(lab_results_validation_1.labResultBodySchema), lab_results_1.createLabResultController);
exports.labResultsAdminRoutes.put("/:labResultId", validateHandler_1.validateBody(lab_results_validation_1.labResultUpdateSchema), lab_results_1.updateLabResultController);
exports.labResultsAdminRoutes.delete("/:labResultId", authHandler_1.CheckRole(roles_1.ROLES.ADMIN, roles_1.ROLES.STAFF), lab_results_1.deleteLabResultController);
