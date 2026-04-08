const http_status_codes = require("http-status-codes");
const appointment_state = require("../utils/appointment-state");
const app_error = require("../utils/app-error");
const db = require("../config/db");
const appointmentSelect = `
  SELECT
    a.id,
    a.patient_id,
    p.patient_code,
    up.full_name AS patient_name,
    p.phone_number AS patient_phone,
    a.doctor_id,
    d.full_name AS doctor_name,
    dep.name AS department_name,
    a.slot_id,
    ds.slot_date::text,
    ds.start_time::text,
    ds.end_time::text,
    a.status,
    a.reason,
    a.notes,
    a.diagnosis,
    a.doctor_note,
    a.patient_cancel_reason,
    a.reschedule_note,
    a.doctor_response_reason,
    a.created_at::text
  FROM appointments a
  INNER JOIN patients p ON p.id = a.patient_id
  INNER JOIN users up ON up.id = p.user_id
  INNER JOIN doctors d ON d.id = a.doctor_id
  INNER JOIN departments dep ON dep.id = a.department_id
  INNER JOIN doctor_slots ds ON ds.id = a.slot_id
`;
const findDoctorByUserId = async (userId) => {
    const result = await db.query(`
      SELECT
        d.id,
        d.user_id,
        d.doctor_code,
        d.full_name,
        d.specialty,
        d.department_id,
        dp.name AS department_name,
        d.experience_years,
        d.qualifications,
        d.description,
        d.avatar_url,
        d.is_active
      FROM doctors d
      INNER JOIN departments dp ON dp.id = d.department_id
      WHERE d.user_id = $1
        AND d.is_deleted = FALSE
        AND dp.is_deleted = FALSE
      LIMIT 1
    `, [userId]);
    return result.rows[0] ?? null;
};
exports.findDoctorByUserId = findDoctorByUserId;
const updateDoctorProfileByUserId = async (userId, payload) => {
    const doctor = await exports.findDoctorByUserId(userId);
    if (!doctor) {
        return null;
    }
    const columns = [];
    const params = [doctor.id];
    if (payload.specialty !== undefined) {
        params.push(payload.specialty);
        columns.push(`specialty = $${params.length}`);
    }
    if (payload.experienceYears !== undefined) {
        params.push(payload.experienceYears);
        columns.push(`experience_years = $${params.length}`);
    }
    if (payload.qualifications !== undefined) {
        params.push(payload.qualifications);
        columns.push(`qualifications = $${params.length}`);
    }
    if (payload.description !== undefined) {
        params.push(payload.description);
        columns.push(`description = $${params.length}`);
    }
    if (payload.avatarUrl !== undefined) {
        params.push(payload.avatarUrl);
        columns.push(`avatar_url = $${params.length}`);
    }
    if (columns.length > 0) {
        await db.query(`
        UPDATE doctors
        SET ${columns.join(", ")}, updated_at = NOW()
        WHERE id = $1
      `, params);
    }
    return exports.findDoctorByUserId(userId);
};
exports.updateDoctorProfileByUserId = updateDoctorProfileByUserId;
const listDoctorAppointments = async (doctorId, input) => {
    const whereParts = ["a.doctor_id = $1", "ds.is_deleted = FALSE"];
    const params = [doctorId];
    if (input.fromDate) {
        params.push(input.fromDate);
        whereParts.push(`ds.slot_date >= $${params.length}::date`);
    }
    if (input.toDate) {
        params.push(input.toDate);
        whereParts.push(`ds.slot_date <= $${params.length}::date`);
    }
    if (input.status) {
        params.push(input.status);
        whereParts.push(`a.status = $${params.length}`);
    }
    const whereClause = whereParts.join(" AND ");
    const [rowsResult, countResult] = await Promise.all([
        db.query(`
        ${appointmentSelect}
        WHERE ${whereClause}
        ORDER BY ds.slot_date ASC, ds.start_time ASC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, input.limit, input.offset]),
        db.query(`
        SELECT COUNT(*)::text AS total
        FROM appointments a
        INNER JOIN doctor_slots ds ON ds.id = a.slot_id
        WHERE ${whereClause}
      `, params),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number(countResult.rows[0]?.total ?? 0),
    };
};
exports.listDoctorAppointments = listDoctorAppointments;
const findDoctorAppointmentById = async (doctorId, bookingId, client) => {
    const executor = client ?? db.db;
    const result = await executor.query(`
      ${appointmentSelect}
      WHERE a.doctor_id = $1
        AND a.id = $2
        AND ds.is_deleted = FALSE
      LIMIT 1
      FOR UPDATE
    `, [doctorId, bookingId]);
    return result.rows[0] ?? null;
};
exports.findDoctorAppointmentById = findDoctorAppointmentById;
const updateDoctorAppointmentStatus = async (doctorId, bookingId, payload) => {
    const client = await db.db.connect();
    try {
        await client.query("BEGIN");
        const booking = await exports.findDoctorAppointmentById(doctorId, bookingId, client);
        if (!booking) {
            await client.query("ROLLBACK");
            return null;
        }
        await client.query(`
        UPDATE appointments
        SET
          status = $2,
          doctor_response_reason = $3,
          doctor_note = COALESCE($4, doctor_note),
          diagnosis = COALESCE($5, diagnosis),
          updated_at = NOW()
        WHERE id = $1
      `, [bookingId, payload.status, payload.reason ?? null, payload.doctorNote ?? null, payload.diagnosis ?? null]);
        if (payload.status === "CANCELLED") {
            await client.query(`
          UPDATE doctor_slots
          SET is_available = TRUE,
              updated_at = NOW()
          WHERE id = $1
        `, [booking.slot_id]);
        }
        await client.query(`
        INSERT INTO notifications (user_id, title, message, type)
        SELECT p.user_id,
          'Cập nhật lịch khám',
          'Lịch khám ' || $1 || ' đã được bác sĩ cập nhật sang trạng thái ' || $2 || '.',
          'BOOKING_UPDATED'
        FROM patients p
        WHERE p.id = $3
      `, [booking.id, payload.status, booking.patient_id]);
        await client.query("COMMIT");
        return exports.findDoctorAppointmentById(doctorId, bookingId);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.updateDoctorAppointmentStatus = updateDoctorAppointmentStatus;
const upsertPrescriptionByDoctor = async (doctorId, bookingId, payload) => {
    const booking = await exports.findDoctorAppointmentById(doctorId, bookingId);
    if (!booking) {
        throw new Error("Không tìm thấy lịch khám thuộc bác sĩ hiện tại");
    }
    if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
        throw new Error("Chỉ có thể cập nhật đơn thuốc khi lịch khám đã xác nhận hoặc hoàn tất");
    }
    const result = await db.query(`
      INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, medications, advice)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
      ON CONFLICT (appointment_id)
      DO UPDATE SET
        diagnosis = EXCLUDED.diagnosis,
        medications = EXCLUDED.medications,
        advice = EXCLUDED.advice,
        updated_at = NOW()
      RETURNING
        id,
        appointment_id,
        doctor_id,
        patient_id,
        diagnosis,
        medications,
        advice,
        updated_at::text
    `, [
        bookingId,
        doctorId,
        booking.patient_id,
        payload.diagnosis ?? null,
        JSON.stringify(payload.medications),
        payload.advice ?? null,
    ]);
    await db.query(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT p.user_id,
        'Đơn thuốc mới',
        'Bác sĩ đã cập nhật đơn thuốc cho lịch khám ' || $1 || '.',
        'PRESCRIPTION_UPDATED'
      FROM patients p
      WHERE p.id = $2
    `, [bookingId, booking.patient_id]);
    return result.rows[0];
};
exports.upsertPrescriptionByDoctor = upsertPrescriptionByDoctor;
const getPatientRecordsForDoctor = async (doctorId, patientCode) => {
    const relationCheck = await db.query(`
      SELECT COUNT(*)::text AS total
      FROM appointments a
      INNER JOIN patients p ON p.id = a.patient_id
      WHERE a.doctor_id = $1
        AND p.patient_code = $2
    `, [doctorId, patientCode]);
    if (Number(relationCheck.rows[0]?.total ?? 0) === 0) {
        return null;
    }
    const patientRes = await db.query(`
      SELECT
        p.id,
        p.patient_code,
        u.full_name,
        p.phone_number,
        p.date_of_birth::text,
        p.gender,
        p.address,
        p.health_insurance_number
      FROM patients p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.patient_code = $1
      LIMIT 1
    `, [patientCode]);
    const patient = patientRes.rows[0];
    if (!patient) {
        return null;
    }
    const [appointmentsRes, labRes, prescriptionsRes] = await Promise.all([
        db.query(`
        ${appointmentSelect}
        WHERE a.patient_id = $1
          AND ds.is_deleted = FALSE
        ORDER BY ds.slot_date DESC, ds.start_time DESC
      `, [patient.id]),
        db.query(`
        SELECT
          id,
          test_code,
          test_name,
          result_summary,
          conclusion,
          performed_at::text
        FROM lab_results
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `, [patient.id]),
        db.query(`
        SELECT
          id,
          appointment_id,
          diagnosis,
          medications,
          advice,
          created_at::text
        FROM prescriptions
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `, [patient.id]),
    ]);
    return {
        patient: {
            patient_code: patient.patient_code,
            full_name: patient.full_name,
            phone_number: patient.phone_number,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            address: patient.address,
            health_insurance_number: patient.health_insurance_number,
        },
        appointments: appointmentsRes.rows,
        labResults: labRes.rows,
        prescriptions: prescriptionsRes.rows,
    };
};
exports.getPatientRecordsForDoctor = getPatientRecordsForDoctor;
const createDoctorSlotByDoctorId = async (doctorId, payload) => {
    const result = await db.query(`
      INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time)
      VALUES ($1, $2::date, $3::time, $4::time)
      RETURNING id, slot_date::text, start_time::text, end_time::text, is_available
    `, [doctorId, payload.slotDate, payload.startTime, payload.endTime]);
    return result.rows[0];
};
exports.createDoctorSlotByDoctorId = createDoctorSlotByDoctorId;
const deleteDoctorSlotByDoctorId = async (doctorId, slotId) => {
    const result = await db.query(`
      UPDATE doctor_slots
      SET is_deleted = TRUE,
          is_available = FALSE,
          updated_at = NOW()
      WHERE id = $1
        AND doctor_id = $2
        AND is_available = TRUE
        AND is_deleted = FALSE
      RETURNING id
    `, [slotId, doctorId]);
    return result.rows.length > 0;
};
exports.deleteDoctorSlotByDoctorId = deleteDoctorSlotByDoctorId;
const listDoctorNotifications = async (userId) => {
    const result = await db.query(`
      SELECT id, title, message, type, is_read, created_at::text
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [userId]);
    return result.rows;
};
exports.listDoctorNotifications = listDoctorNotifications;
const markDoctorNotificationRead = async (userId, notificationId) => {
    const result = await db.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `, [notificationId, userId]);
    return result.rows.length > 0;
};
exports.markDoctorNotificationRead = markDoctorNotificationRead;
const getDoctorOrThrow = async (userId) => {
    const doctor = await exports.findDoctorByUserId(userId);
    if (!doctor) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bác sĩ");
    }
    return doctor;
};
const getMyDoctorProfile = async (userId) => getDoctorOrThrow(userId);
exports.getMyDoctorProfile = getMyDoctorProfile;
const updateMyDoctorProfile = async (userId, payload) => {
    const profile = await exports.updateDoctorProfileByUserId(userId, payload);
    if (!profile) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bác sĩ");
    }
    return profile;
};
exports.updateMyDoctorProfile = updateMyDoctorProfile;
const getMyDoctorAppointments = async (userId, input) => {
    const doctor = await getDoctorOrThrow(userId);
    return exports.listDoctorAppointments(doctor.id, {
        fromDate: input.fromDate,
        toDate: input.toDate,
        status: input.status,
        limit: input.pageSize,
        offset: input.offset,
    });
};
exports.getMyDoctorAppointments = getMyDoctorAppointments;
const updateMyAppointmentStatus = async (userId, bookingId, payload) => {
    const doctor = await getDoctorOrThrow(userId);
    const booking = await exports.findDoctorAppointmentById(doctor.id, bookingId);
    if (!booking) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy lịch khám thuộc bác sĩ hiện tại");
    }
    const currentStatus = booking.status;
    const nextStatus = payload.status;
    if (appointment_state.isTerminalAppointmentStatus(currentStatus)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Lịch khám đã kết thúc, không thể cập nhật thêm");
    }
    if (!appointment_state.canTransitionAppointment(currentStatus, nextStatus)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, `Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`);
    }
    const updated = await exports.updateDoctorAppointmentStatus(doctor.id, bookingId, payload);
    if (!updated) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy lịch khám để cập nhật");
    }
    return updated;
};
exports.updateMyAppointmentStatus = updateMyAppointmentStatus;
const upsertMyPrescription = async (userId, bookingId, payload) => {
    const doctor = await getDoctorOrThrow(userId);
    try {
        return await exports.upsertPrescriptionByDoctor(doctor.id, bookingId, payload);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Không thể cập nhật đơn thuốc";
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
exports.upsertMyPrescription = upsertMyPrescription;
const getPatientRecordsByCode = async (userId, patientCode) => {
    const doctor = await getDoctorOrThrow(userId);
    const records = await exports.getPatientRecordsForDoctor(doctor.id, patientCode);
    if (!records) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân hoặc bác sĩ chưa có lịch khám với bệnh nhân này");
    }
    return records;
};
exports.getPatientRecordsByCode = getPatientRecordsByCode;
const createMyDoctorSlot = async (userId, payload) => {
    if (payload.startTime >= payload.endTime) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Giờ bắt đầu phải nhỏ hơn giờ kết thúc");
    }
    const doctor = await getDoctorOrThrow(userId);
    try {
        return await exports.createDoctorSlotByDoctorId(doctor.id, payload);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Không thể tạo lịch làm việc";
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
exports.createMyDoctorSlot = createMyDoctorSlot;
const deleteMyDoctorSlot = async (userId, slotId) => {
    const doctor = await getDoctorOrThrow(userId);
    const deleted = await exports.deleteDoctorSlotByDoctorId(doctor.id, slotId);
    if (!deleted) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Không thể xóa khung giờ (có thể đã được đặt hoặc không thuộc bác sĩ hiện tại)");
    }
};
exports.deleteMyDoctorSlot = deleteMyDoctorSlot;
const getMyDoctorNotifications = async (userId) => exports.listDoctorNotifications(userId);
exports.getMyDoctorNotifications = getMyDoctorNotifications;
const readMyDoctorNotification = async (userId, notificationId) => {
    const updated = await exports.markDoctorNotificationRead(userId, notificationId);
    if (!updated) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy thông báo");
    }
};
exports.readMyDoctorNotification = readMyDoctorNotification;
