const { Router } = require("express");
const { ROLES } = require("../constants/roles");
const { CheckLogin, CheckRole } = require("../utils/authHandler");
const { validateBody } = require("../utils/validateHandler");
const {
  getMyProfileController,
  updateMyProfileController,
  getMyBookingsController,
  cancelMyBookingController,
  rescheduleMyBookingController,
  getMyLabResultsController,
  getMyPrescriptionsController,
  getMyPaymentsController,
  createMyPaymentController,
  confirmMyPaymentController,
  failMyPaymentController,
  downloadMyPaymentInvoicePdfController,
  getMyNotificationsController,
  readMyNotificationController,
  createMyReviewController,
} = require("../controllers/patients");
const {
  patientProfileUpdateSchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  createPaymentSchema,
  confirmPaymentSchema,
  failPaymentSchema,
  createReviewSchema,
} = require("../utils/validators/patients.validation");

exports.patientRoutes = Router();

exports.patientRoutes.use(CheckLogin, CheckRole(ROLES.PATIENT));

exports.patientRoutes.get("/profile", getMyProfileController);
exports.patientRoutes.patch("/profile", validateBody(patientProfileUpdateSchema), updateMyProfileController);

exports.patientRoutes.get("/bookings", getMyBookingsController);
exports.patientRoutes.patch("/bookings/:bookingId/cancel", validateBody(cancelBookingSchema), cancelMyBookingController);
exports.patientRoutes.patch(
  "/bookings/:bookingId/reschedule",
  validateBody(rescheduleBookingSchema),
  rescheduleMyBookingController
);

exports.patientRoutes.get("/lab-results", getMyLabResultsController);
exports.patientRoutes.get("/prescriptions", getMyPrescriptionsController);

exports.patientRoutes.get("/payments", getMyPaymentsController);
exports.patientRoutes.post("/payments", validateBody(createPaymentSchema), createMyPaymentController);
exports.patientRoutes.patch(
  "/payments/:paymentId/confirm",
  validateBody(confirmPaymentSchema),
  confirmMyPaymentController
);
exports.patientRoutes.patch("/payments/:paymentId/fail", validateBody(failPaymentSchema), failMyPaymentController);
exports.patientRoutes.get("/payments/:paymentId/invoice/pdf", downloadMyPaymentInvoicePdfController);

exports.patientRoutes.get("/notifications", getMyNotificationsController);
exports.patientRoutes.patch("/notifications/:notificationId/read", readMyNotificationController);

exports.patientRoutes.post("/reviews", validateBody(createReviewSchema), createMyReviewController);