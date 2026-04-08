const http_status_codes = require("http-status-codes");
const audit_log = require("../utils/audit-log");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const doctor_profiles_service = require("../service/doctor-profiles.service");
const { handleControllerError } = require("../utils/controller-error");
const writeAuditLogSafe = async (input) => {
    try {
        await audit_log.writeAuditLog(input);
    }
    catch (error) {
        console.error("Audit log failed:", error);
    }
};
exports.getMyDoctorProfileController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.getMyDoctorProfile(req.user.id);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy hồ sơ bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.updateMyDoctorProfileController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.updateMyDoctorProfile(req.user.id, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật hồ sơ bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.getMyDoctorAppointmentsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const fromDate = typeof req.query.fromDate === "string" ? req.query.fromDate : undefined;
            const toDate = typeof req.query.toDate === "string" ? req.query.toDate : undefined;
            const status = typeof req.query.status === "string" ? req.query.status : undefined;
            const result = await doctor_profiles_service.getMyDoctorAppointments(req.user.id, {
                fromDate,
                toDate,
                status,
                pageSize,
                offset,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy lịch khám của bác sĩ thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.updateMyAppointmentStatusController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.updateMyAppointmentStatus(req.user.id, req.params.bookingId, req.body);
            await writeAuditLogSafe({
                action: "DOCTOR_UPDATE_APPOINTMENT_STATUS",
                actorUserId: req.user?.id,
                actorEmail: req.user?.email,
                actorRole: "DOCTOR",
                targetType: "APPOINTMENT",
                targetId: req.params.bookingId,
                status: "SUCCESS",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: {
                    nextStatus: req.body.status,
                    reason: req.body.reason,
                },
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật trạng thái lịch khám thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.upsertMyPrescriptionController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.upsertMyPrescription(req.user.id, req.params.bookingId, req.body);
            await writeAuditLogSafe({
                action: "DOCTOR_UPSERT_PRESCRIPTION",
                actorUserId: req.user?.id,
                actorEmail: req.user?.email,
                actorRole: "DOCTOR",
                targetType: "APPOINTMENT",
                targetId: req.params.bookingId,
                status: "SUCCESS",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: {
                    hasDiagnosis: Boolean(req.body?.diagnosis),
                    medicationCount: Array.isArray(req.body?.medications) ? req.body.medications.length : 0,
                },
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật đơn thuốc điện tử thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.getPatientRecordsByCodeController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.getPatientRecordsByCode(req.user.id, req.params.patientCode);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy hồ sơ bệnh án bệnh nhân thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.createMyDoctorSlotController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.createMyDoctorSlot(req.user.id, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo lịch làm việc thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.deleteMyDoctorSlotController = async (req, res, next) => {
    try {
            await doctor_profiles_service.deleteMyDoctorSlot(req.user.id, req.params.slotId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa lịch làm việc thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.getMyDoctorNotificationsController = async (req, res, next) => {
    try {
            const data = await doctor_profiles_service.getMyDoctorNotifications(req.user.id);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy thông báo bác sĩ thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
exports.readMyDoctorNotificationController = async (req, res, next) => {
    try {
            await doctor_profiles_service.readMyDoctorNotification(req.user.id, req.params.notificationId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Đánh dấu đã đọc thông báo thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "doctor-profiles");
    }
};
