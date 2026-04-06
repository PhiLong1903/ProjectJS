const { StatusCodes } = require("http-status-codes");
const { sendSuccess } = require("../utils/api-response");
const { getPaginationParams, toPaginationMeta } = require("../utils/pagination");
const {
  getMyProfile,
  updateMyProfile,
  getMyBookings,
  cancelMyBooking,
  rescheduleMyBooking,
  getMyLabResults,
  getMyPrescriptions,
  getMyPayments,
  payMyAppointment,
  confirmMyOnlinePayment,
  failMyOnlinePayment,
  getMyPaymentInvoicePdf,
  getMyNotifications,
  readMyNotification,
  createMyReview,
} = require("../service/patients.service");
const { handleControllerError } = require("../utils/controller-error");

exports.getMyProfileController = async (req, res, next) => {
  try {
    const data = await getMyProfile(req.user.id);
    return sendSuccess(res, StatusCodes.OK, "Lay ho so benh nhan thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.updateMyProfileController = async (req, res, next) => {
  try {
    const data = await updateMyProfile(req.user.id, req.body);
    return sendSuccess(res, StatusCodes.OK, "Cap nhat ho so benh nhan thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.getMyBookingsController = async (req, res, next) => {
  try {
    const viewParam = typeof req.query.view === "string" ? req.query.view : "all";
    const view = ["all", "upcoming", "history"].includes(viewParam) ? viewParam : "all";
    const { page, pageSize, offset } = getPaginationParams(req);
    const result = await getMyBookings(req.user.id, view, pageSize, offset);

    return sendSuccess(
      res,
      StatusCodes.OK,
      "Lay danh sach lich kham benh nhan thanh cong",
      result.rows,
      toPaginationMeta(page, pageSize, result.total)
    );
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.cancelMyBookingController = async (req, res, next) => {
  try {
    const data = await cancelMyBooking(req.user.id, req.params.bookingId, req.body.reason);
    return sendSuccess(res, StatusCodes.OK, "Huy lich kham thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.rescheduleMyBookingController = async (req, res, next) => {
  try {
    const data = await rescheduleMyBooking(req.user.id, req.params.bookingId, req.body.newSlotId, req.body.reason);
    return sendSuccess(res, StatusCodes.OK, "Doi lich kham thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.getMyLabResultsController = async (req, res, next) => {
  try {
    const data = await getMyLabResults(req.user.id);
    return sendSuccess(res, StatusCodes.OK, "Lay ket qua can lam sang thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.getMyPrescriptionsController = async (req, res, next) => {
  try {
    const data = await getMyPrescriptions(req.user.id);
    return sendSuccess(res, StatusCodes.OK, "Lay don thuoc dien tu thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.getMyPaymentsController = async (req, res, next) => {
  try {
    const data = await getMyPayments(req.user.id);
    return sendSuccess(res, StatusCodes.OK, "Lay lich su thanh toan thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.createMyPaymentController = async (req, res, next) => {
  try {
    const data = await payMyAppointment(req.user.id, req.body);
    const message = data.status === "PENDING" ? "Khoi tao thanh toan online thanh cong" : "Thanh toan thanh cong";
    return sendSuccess(res, StatusCodes.CREATED, message, data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.confirmMyPaymentController = async (req, res, next) => {
  try {
    const data = await confirmMyOnlinePayment(req.user.id, req.params.paymentId, req.body);
    return sendSuccess(res, StatusCodes.OK, "Xac nhan thanh toan thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.failMyPaymentController = async (req, res, next) => {
  try {
    const data = await failMyOnlinePayment(req.user.id, req.params.paymentId, req.body);
    return sendSuccess(res, StatusCodes.OK, "Da cap nhat giao dich that bai", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.downloadMyPaymentInvoicePdfController = async (req, res, next) => {
  try {
    const file = await getMyPaymentInvoicePdf(req.user.id, req.params.paymentId);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    return res.status(StatusCodes.OK).send(file.body);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.getMyNotificationsController = async (req, res, next) => {
  try {
    const data = await getMyNotifications(req.user.id);
    return sendSuccess(res, StatusCodes.OK, "Lay thong bao thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.readMyNotificationController = async (req, res, next) => {
  try {
    await readMyNotification(req.user.id, req.params.notificationId);
    return sendSuccess(res, StatusCodes.OK, "Danh dau da doc thong bao thanh cong");
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};

exports.createMyReviewController = async (req, res, next) => {
  try {
    const data = await createMyReview(req.user.id, req.body);
    return sendSuccess(res, StatusCodes.CREATED, "Gui danh gia thanh cong", data);
  } catch (error) {
    return handleControllerError(res, error, "patients");
  }
};