const http_status_codes = require("http-status-codes");
const audit_log = require("../utils/audit-log");
const api_response = require("../utils/api-response");
const pagination = require("../utils/pagination");
const admins_service = require("../service/admins.service");
const { handleControllerError } = require("../utils/controller-error");
const writeAuditLogSafe = async (input) => {
    try {
        await audit_log.writeAuditLog(input);
    }
    catch (error) {
        console.error("Audit log failed:", error);
    }
};
exports.dashboardOverviewController = async (_req, res, next) => {
    try {
            const data = await admins_service.getDashboardOverview();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy dashboard tổng quan thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.dashboardTrendsController = async (req, res, next) => {
    try {
            const groupBy = req.query.groupBy === "month" ? "month" : "day";
            const points = Number(req.query.points ?? (groupBy === "day" ? 30 : 12));
            const data = await admins_service.getDashboardTrendStats({
                groupBy,
                points: Number.isFinite(points) ? points : groupBy === "day" ? 30 : 12,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy dữ liệu xu hướng dashboard thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.listUsersController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;
            const role = typeof req.query.role === "string" ? req.query.role : undefined;
            const result = await admins_service.getAdminUsers({
                pageSize,
                offset,
                keyword,
                role,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách người dùng thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.createUserController = async (req, res, next) => {
    try {
            const data = await admins_service.createUserByAdmin(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo người dùng thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.updateUserController = async (req, res, next) => {
    try {
            await admins_service.updateUserByAdmin(req.params.userId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật người dùng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.updateUserStatusController = async (req, res, next) => {
    try {
            await admins_service.updateUserStatusByAdmin(req.params.userId, req.body.isActive);
            await writeAuditLogSafe({
                action: "ADMIN_UPDATE_USER_STATUS",
                actorUserId: req.user?.id,
                actorEmail: req.user?.email,
                actorRole: "ADMIN",
                targetType: "USER",
                targetId: req.params.userId,
                status: "SUCCESS",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: {
                    isActive: req.body.isActive,
                },
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật trạng thái người dùng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.updateUserRolesController = async (req, res, next) => {
    try {
            await admins_service.updateUserRolesByAdmin(req.params.userId, req.body.roles);
            await writeAuditLogSafe({
                action: "ADMIN_UPDATE_USER_ROLES",
                actorUserId: req.user?.id,
                actorEmail: req.user?.email,
                actorRole: "ADMIN",
                targetType: "USER",
                targetId: req.params.userId,
                status: "SUCCESS",
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                metadata: {
                    roles: req.body.roles,
                },
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật vai trò người dùng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.deleteUserController = async (req, res, next) => {
    try {
            await admins_service.deleteUserByAdmin(req.params.userId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa người dùng thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.revenueReportController = async (req, res, next) => {
    try {
            const fromDate = typeof req.query.fromDate === "string" ? req.query.fromDate : undefined;
            const toDate = typeof req.query.toDate === "string" ? req.query.toDate : undefined;
            const groupBy = req.query.groupBy === "day" ? "day" : "month";
            const data = await admins_service.getRevenueStats({ fromDate, toDate, groupBy });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy báo cáo doanh thu thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.revenueExportController = async (req, res, next) => {
    try {
            const fromDate = typeof req.query.fromDate === "string" ? req.query.fromDate : undefined;
            const toDate = typeof req.query.toDate === "string" ? req.query.toDate : undefined;
            const groupBy = req.query.groupBy === "day" ? "day" : "month";
            const format = req.query.format === "pdf" ? "pdf" : "csv";
            const exportFile = await admins_service.exportRevenueReport({
                fromDate,
                toDate,
                groupBy,
                format,
            });
            res.setHeader("Content-Type", exportFile.contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${exportFile.filename}"`);
            res.status(http_status_codes.StatusCodes.OK).send(exportFile.body);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.advancedOverviewController = async (req, res, next) => {
    try {
            const period = req.query.period === "month" ? "month" : "week";
            const data = await admins_service.getAdvancedDashboardOverviewByAdmin(period);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay tong quan quan tri nang cao thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.topDepartmentsController = async (req, res, next) => {
    try {
            const period = req.query.period === "month" ? "month" : "week";
            const limit = Number(req.query.limit ?? 5);
            const data = await admins_service.getTopDepartmentsByAdmin(period, Number.isFinite(limit) ? limit : 5);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay top khoa dong benh nhan thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.revenueByServiceController = async (req, res, next) => {
    try {
            const period = req.query.period === "month" ? "month" : "week";
            const data = await admins_service.getRevenueByServiceByAdmin(period);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay doanh thu theo dich vu thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.advancedExportController = async (req, res, next) => {
    try {
            const period = req.query.period === "month" ? "month" : "week";
            const format = req.query.format === "pdf" ? "pdf" : "csv";
            const exportFile = await admins_service.exportAdvancedDashboardReport({ period, format });
            res.setHeader("Content-Type", exportFile.contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${exportFile.filename}"`);
            res.status(http_status_codes.StatusCodes.OK).send(exportFile.body);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.paymentReconciliationController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const gateway = req.query.gateway === "VNPAY" || req.query.gateway === "MOMO" || req.query.gateway === "DIRECT"
                ? req.query.gateway
                : undefined;
            const status = req.query.status === "PENDING" || req.query.status === "PAID" || req.query.status === "FAILED" || req.query.status === "REFUNDED"
                ? req.query.status
                : undefined;
            const fromDate = typeof req.query.fromDate === "string" ? req.query.fromDate : undefined;
            const toDate = typeof req.query.toDate === "string" ? req.query.toDate : undefined;
            const result = await admins_service.getPaymentReconciliationByAdmin({
                pageSize,
                offset,
                gateway,
                status,
                fromDate,
                toDate,
            });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lay bao cao doi soat giao dich thanh cong", result.rows, {
                ...pagination.toPaginationMeta(page, pageSize, result.total),
                summary: result.summary,
            });
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.reconcilePaymentController = async (req, res, next) => {
    try {
            const data = await admins_service.reconcilePaymentTransactionByAdmin(req.params.paymentId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Doi soat giao dich thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.listNotificationJobsController = async (req, res, next) => {
    try {
            const { page, pageSize, offset } = pagination.getPaginationParams(req);
            const rawStatus = typeof req.query.status === "string" ? req.query.status : undefined;
            const status = rawStatus === "PENDING" || rawStatus === "PROCESSING" || rawStatus === "SENT" || rawStatus === "FAILED"
                ? rawStatus
                : undefined;
            const result = await admins_service.getNotificationJobsByAdmin({ pageSize, offset, status });
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh sách notification jobs thành công", result.rows, pagination.toPaginationMeta(page, pageSize, result.total));
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.processNotificationJobsController = async (req, res, next) => {
    try {
            const batchSize = typeof req.body?.batchSize === "number" ? req.body.batchSize : undefined;
            const data = await admins_service.processNotificationJobsByAdmin(batchSize);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xử lý notification queue thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.createDoctorAnnouncementController = async (req, res, next) => {
    try {
            const data = await admins_service.createDoctorAnnouncementByAdmin(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Gui thong bao cho bac si thanh cong", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.listSettingsController = async (_req, res, next) => {
    try {
            const data = await admins_service.getSystemSettings();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy cấu hình hệ thống thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.upsertSettingController = async (req, res, next) => {
    try {
            const data = await admins_service.saveSystemSetting(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lưu cấu hình hệ thống thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.listMedicinesController = async (_req, res, next) => {
    try {
            const data = await admins_service.getMedicines();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh mục thuốc thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.createMedicineController = async (req, res, next) => {
    try {
            const data = await admins_service.createMedicineByAdmin(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo thuốc thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.updateMedicineController = async (req, res, next) => {
    try {
            const data = await admins_service.updateMedicineByAdmin(req.params.medicineId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật thuốc thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.deleteMedicineController = async (req, res, next) => {
    try {
            await admins_service.deleteMedicineByAdmin(req.params.medicineId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa thuốc thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.listLabTestCatalogController = async (_req, res, next) => {
    try {
            const data = await admins_service.getLabTestCatalogByAdmin();
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Lấy danh mục xét nghiệm thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.createLabTestCatalogController = async (req, res, next) => {
    try {
            const data = await admins_service.createLabTestCatalogByAdmin(req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.CREATED, "Tạo danh mục xét nghiệm thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.updateLabTestCatalogController = async (req, res, next) => {
    try {
            const data = await admins_service.updateLabTestCatalogByAdmin(req.params.testId, req.body);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Cập nhật danh mục xét nghiệm thành công", data);
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
exports.deleteLabTestCatalogController = async (req, res, next) => {
    try {
            await admins_service.deleteLabTestCatalogByAdmin(req.params.testId);
            return api_response.sendSuccess(res, http_status_codes.StatusCodes.OK, "Xóa danh mục xét nghiệm thành công");
    }
    catch (error) {
        return handleControllerError(res, error, "admins");
    }
};
