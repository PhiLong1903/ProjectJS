const { Router } = require("express");
const { env } = require("../config/env");
const { createRateLimiter } = require("../middlewares/rate-limit.middleware");
const { validateBody } = require("../utils/validateHandler");
const { lookupPatientRecordController } = require("../controllers/patient-records");
const { patientRecordLookupSchema } = require("../utils/validators/patient-records.validation");

const patientRecordsRoutes = Router();

const lookupRateLimiter = createRateLimiter({
  keyPrefix: "patient-record-lookup",
  windowMs: env.LAB_LOOKUP_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.LAB_LOOKUP_RATE_LIMIT_MAX,
  message: "Ban tra cuu qua nhanh. Vui long thu lai sau.",
  keyResolver: (req) => `${req.ip}:${String(req.body?.patientCode ?? "").trim()}`,
});

patientRecordsRoutes.post(
  "/lookup",
  lookupRateLimiter,
  validateBody(patientRecordLookupSchema),
  lookupPatientRecordController
);

exports.patientRecordsRoutes = patientRecordsRoutes;
