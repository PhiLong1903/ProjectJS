const http_status_codes = require("http-status-codes");
const roles = require("../constants/roles");
const appointment_state = require("../utils/appointment-state");
const app_error = require("../utils/app-error");
const sequelize = require("../config/sequelize");
const SequelizeModels = require("../schemas/SequelizeModels");
const detailInclude = [
    {
        model: SequelizeModels.PatientModel,
        as: "patient",
        required: true,
        include: [{ model: SequelizeModels.UserModel, as: "user", required: true }],
    },
    { model: SequelizeModels.DoctorModel, as: "doctor", required: true },
    { model: SequelizeModels.DepartmentModel, as: "department", required: true },
    { model: SequelizeModels.DoctorSlotModel, as: "slot", required: true },
];
const toAppointmentRecord = (row) => ({
    id: row.id,
    patient_id: row.patient_id,
    patient_code: row.patient?.patient_code ?? "",
    patient_name: row.patient?.user?.full_name ?? "",
    doctor_id: row.doctor_id,
    doctor_name: row.doctor?.full_name ?? "",
    department_id: row.department_id,
    department_name: row.department?.name ?? "",
    slot_id: row.slot_id,
    slot_date: row.slot?.slot_date ?? "",
    start_time: row.slot?.start_time ?? "",
    end_time: row.slot?.end_time ?? "",
    status: row.status,
    reason: row.reason,
    notes: row.notes,
    diagnosis: row.diagnosis ?? null,
    doctor_note: row.doctor_note ?? null,
    patient_cancel_reason: row.patient_cancel_reason ?? null,
    reschedule_note: row.reschedule_note ?? null,
    doctor_response_reason: row.doctor_response_reason ?? null,
    created_at: row.created_at.toISOString(),
});
const findPatientByUserId = async (userId) => {
    const row = await SequelizeModels.PatientModel.findOne({
        attributes: ["id", "patient_code", "phone_number"],
        where: { user_id: userId },
    });
    return row
        ? {
            id: row.id,
            patient_code: row.patient_code,
            phone_number: row.phone_number,
        }
        : null;
};
exports.findPatientByUserId = findPatientByUserId;
const createAppointment = async (input) => {
    return sequelize.sequelize.transaction(async (transaction) => {
        const now = new Date();
        const slot = await SequelizeModels.DoctorSlotModel.findOne({
            where: { id: input.slotId },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!slot) {
            throw new Error("Không tìm thấy khung giờ khám");
        }
        if (!slot.is_available || slot.is_deleted) {
            throw new Error("Khung giờ đã có người đặt");
        }
        if (slot.doctor_id !== input.doctorId) {
            throw new Error("Khung giờ không thuộc bác sĩ đã chọn");
        }
        const doctor = await SequelizeModels.DoctorModel.findByPk(input.doctorId, { transaction });
        if (!doctor || doctor.is_deleted) {
            throw new Error("Bác sĩ không tồn tại");
        }
        if (doctor.department_id !== input.departmentId) {
            throw new Error("Bác sĩ không thuộc khoa đã chọn");
        }
        const appointment = await SequelizeModels.AppointmentModel.create({
            patient_id: input.patientId,
            doctor_id: input.doctorId,
            department_id: input.departmentId,
            slot_id: input.slotId,
            status: "PENDING",
            reason: input.reason ?? null,
            notes: input.notes ?? null,
            created_at: now,
            updated_at: now,
        }, { transaction });
        await slot.update({
            is_available: false,
            updated_at: new Date(),
        }, { transaction });
        const detail = await SequelizeModels.AppointmentModel.findByPk(appointment.id, {
            include: detailInclude,
            transaction,
        });
        return toAppointmentRecord(detail);
    });
};
exports.createAppointment = createAppointment;
const listAppointmentsByPatient = async (patientId) => {
    const rows = await SequelizeModels.AppointmentModel.findAll({
        where: { patient_id: patientId },
        include: detailInclude,
        order: [[{ model: SequelizeModels.DoctorSlotModel, as: "slot" }, "slot_date", "DESC"], [{ model: SequelizeModels.DoctorSlotModel, as: "slot" }, "start_time", "DESC"]],
    });
    return rows.map((row) => toAppointmentRecord(row));
};
exports.listAppointmentsByPatient = listAppointmentsByPatient;
const listAppointmentsAdmin = async (limit, offset) => {
    const { rows, count } = await SequelizeModels.AppointmentModel.findAndCountAll({
        include: detailInclude,
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });
    return {
        rows: rows.map((row) => toAppointmentRecord(row)),
        total: count,
    };
};
exports.listAppointmentsAdmin = listAppointmentsAdmin;
const findAppointmentDetailById = async (appointmentId) => {
    const row = await SequelizeModels.AppointmentModel.findByPk(appointmentId, {
        include: detailInclude,
    });
    if (!row) {
        return null;
    }
    return toAppointmentRecord(row);
};
exports.findAppointmentDetailById = findAppointmentDetailById;
const updateAppointmentStatus = async (appointmentId, status) => {
    await SequelizeModels.AppointmentModel.update({ status, updated_at: new Date() }, { where: { id: appointmentId } });
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const findAppointmentById = async (appointmentId) => {
    const row = await SequelizeModels.AppointmentModel.findByPk(appointmentId, {
        attributes: ["id", "slot_id", "status"],
    });
    return row
        ? {
            id: row.id,
            slot_id: row.slot_id,
            status: row.status,
        }
        : null;
};
exports.findAppointmentById = findAppointmentById;
const releaseSlotByAppointmentId = async (appointmentId) => {
    const row = await SequelizeModels.AppointmentModel.findByPk(appointmentId, {
        attributes: ["slot_id"],
    });
    if (!row) {
        return;
    }
    await SequelizeModels.DoctorSlotModel.update({
        is_available: true,
        updated_at: new Date(),
    }, { where: { id: row.slot_id } });
};
exports.releaseSlotByAppointmentId = releaseSlotByAppointmentId;
const createBooking = async (payload) => {
    if (!payload.roles.includes(roles.ROLES.PATIENT)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.FORBIDDEN, "Chỉ bệnh nhân mới có thể đặt lịch khám");
    }
    const patient = await exports.findPatientByUserId(payload.userId);
    if (!patient) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân");
    }
    try {
        return await exports.createAppointment({
            patientId: patient.id,
            departmentId: payload.departmentId,
            doctorId: payload.doctorId,
            slotId: payload.slotId,
            reason: payload.reason,
            notes: payload.notes,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tạo lịch khám";
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
exports.createBooking = createBooking;
const getMyBookings = async (userId) => {
    const patient = await exports.findPatientByUserId(userId);
    if (!patient) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân");
    }
    return exports.listAppointmentsByPatient(patient.id);
};
exports.getMyBookings = getMyBookings;
const getBookingsAdmin = (pageSize, offset) => exports.listAppointmentsAdmin(pageSize, offset);
exports.getBookingsAdmin = getBookingsAdmin;
const getBookingDetailAdmin = async (appointmentId) => {
    const detail = await exports.findAppointmentDetailById(appointmentId);
    if (!detail) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    return detail;
};
exports.getBookingDetailAdmin = getBookingDetailAdmin;
const updateBookingStatus = async (appointmentId, status) => {
    const appointment = await exports.findAppointmentById(appointmentId);
    if (!appointment) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy lịch khám");
    }
    const currentStatus = appointment.status;
    if (!appointment_state.canTransitionAppointment(currentStatus, status)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}`);
    }
    await exports.updateAppointmentStatus(appointmentId, status);
    if (status === "CANCELLED") {
        await exports.releaseSlotByAppointmentId(appointmentId);
    }
};
exports.updateBookingStatus = updateBookingStatus;
