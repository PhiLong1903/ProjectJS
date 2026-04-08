const http_status_codes = require("http-status-codes");
const PDFDocument = require("pdfkit");
const appointment_state = require("../utils/appointment-state");
const app_error = require("../utils/app-error");
const db = require("../config/db");
const bookingSelect = `
  SELECT
    a.id,
    a.patient_id,
    p.patient_code,
    up.full_name AS patient_name,
    a.doctor_id,
    d.full_name AS doctor_name,
    a.department_id,
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
const findPatientByUserId = async (userId) => {
    const result = await db.query(`
      SELECT id, user_id, patient_code, phone_number
      FROM patients
      WHERE user_id = $1
      LIMIT 1
    `, [userId]);
    return result.rows[0] ?? null;
};
exports.findPatientByUserId = findPatientByUserId;
const getPatientProfileByUserId = async (userId) => {
    const result = await db.query(`
      SELECT
        u.id AS user_id,
        u.email,
        u.full_name,
        p.id AS patient_id,
        p.patient_code,
        p.phone_number,
        p.date_of_birth::text,
        p.gender,
        p.address,
        p.health_insurance_number,
        p.created_at::text
      FROM users u
      INNER JOIN patients p ON p.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `, [userId]);
    return result.rows[0] ?? null;
};
exports.getPatientProfileByUserId = getPatientProfileByUserId;
const updatePatientProfileByUserId = async (userId, payload) => {
    const client = await db.db.connect();
    try {
        await client.query("BEGIN");
        const patientRes = await client.query(`
        SELECT id, phone_number
        FROM patients
        WHERE user_id = $1
        LIMIT 1
        FOR UPDATE
      `, [userId]);
        const patient = patientRes.rows[0];
        if (!patient) {
            await client.query("ROLLBACK");
            return null;
        }
        if (payload.fullName !== undefined) {
            await client.query("UPDATE users SET full_name = $2, updated_at = NOW() WHERE id = $1", [
                userId,
                payload.fullName,
            ]);
        }
        if (payload.phoneNumber !== undefined && payload.phoneNumber !== patient.phone_number) {
            const phoneCheck = await client.query("SELECT COUNT(*)::text AS total FROM patients WHERE phone_number = $1 AND id <> $2", [payload.phoneNumber, patient.id]);
            if (Number(phoneCheck.rows[0]?.total ?? 0) > 0) {
                throw new Error("Số điện thoại đã được sử dụng");
            }
        }
        const columns = [];
        const params = [patient.id];
        if (payload.dateOfBirth !== undefined) {
            params.push(payload.dateOfBirth);
            columns.push(`date_of_birth = $${params.length}::date`);
        }
        if (payload.gender !== undefined) {
            params.push(payload.gender);
            columns.push(`gender = $${params.length}`);
        }
        if (payload.address !== undefined) {
            params.push(payload.address);
            columns.push(`address = $${params.length}`);
        }
        if (payload.phoneNumber !== undefined) {
            params.push(payload.phoneNumber);
            columns.push(`phone_number = $${params.length}`);
        }
        if (payload.healthInsuranceNumber !== undefined) {
            params.push(payload.healthInsuranceNumber);
            columns.push(`health_insurance_number = $${params.length}`);
        }
        if (columns.length > 0) {
            await client.query(`UPDATE patients SET ${columns.join(", ")}, updated_at = NOW() WHERE id = $1`, params);
        }
        await client.query("COMMIT");
        return exports.getPatientProfileByUserId(userId);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.updatePatientProfileByUserId = updatePatientProfileByUserId;
const getBookingWhereClause = (view) => {
    if (view === "upcoming") {
        return `
      AND a.status IN ('PENDING', 'CONFIRMED')
      AND (
        ds.slot_date > CURRENT_DATE
        OR (ds.slot_date = CURRENT_DATE AND ds.end_time >= CURRENT_TIME)
      )
    `;
    }
    if (view === "history") {
        return `
      AND (
        a.status IN ('CANCELLED', 'COMPLETED')
        OR ds.slot_date < CURRENT_DATE
        OR (ds.slot_date = CURRENT_DATE AND ds.end_time < CURRENT_TIME)
      )
    `;
    }
    return "";
};
const getBookingOrderClause = (view) => {
    if (view === "upcoming") {
        return "ORDER BY ds.slot_date ASC, ds.start_time ASC";
    }
    return "ORDER BY ds.slot_date DESC, ds.start_time DESC";
};
const listPatientBookings = async (patientId, view, limit, offset) => {
    const whereClause = getBookingWhereClause(view);
    const orderClause = getBookingOrderClause(view);
    const [rowsResult, countResult] = await Promise.all([
        db.query(`
        ${bookingSelect}
        WHERE a.patient_id = $1
        ${whereClause}
        ${orderClause}
        LIMIT $2 OFFSET $3
      `, [patientId, limit, offset]),
        db.query(`
        SELECT COUNT(*)::text AS total
        FROM appointments a
        INNER JOIN doctor_slots ds ON ds.id = a.slot_id
        WHERE a.patient_id = $1
        ${whereClause}
      `, [patientId]),
    ]);
    return {
        rows: rowsResult.rows,
        total: Number(countResult.rows[0]?.total ?? 0),
    };
};
exports.listPatientBookings = listPatientBookings;
const findPatientBookingById = async (patientId, bookingId, client) => {
    const executor = client ?? db.db;
    const result = await executor.query(`
      ${bookingSelect}
      WHERE a.patient_id = $1
        AND a.id = $2
      LIMIT 1
      FOR UPDATE
    `, [patientId, bookingId]);
    return result.rows[0] ?? null;
};
exports.findPatientBookingById = findPatientBookingById;
const findSlotForReschedule = async (slotId, client) => {
    const result = await client.query(`
      SELECT
        ds.id,
        ds.doctor_id,
        d.department_id,
        ds.slot_date::text,
        ds.start_time::text,
        ds.end_time::text,
        ds.is_available
      FROM doctor_slots ds
      INNER JOIN doctors d ON d.id = ds.doctor_id
      WHERE ds.id = $1
      LIMIT 1
      FOR UPDATE
    `, [slotId]);
    return result.rows[0] ?? null;
};
exports.findSlotForReschedule = findSlotForReschedule;
const cancelPatientBooking = async (patientId, bookingId, reason) => {
    const client = await db.db.connect();
    try {
        await client.query("BEGIN");
        const booking = await exports.findPatientBookingById(patientId, bookingId, client);
        if (!booking) {
            await client.query("ROLLBACK");
            return null;
        }
        await client.query(`
        UPDATE appointments
        SET status = 'CANCELLED',
            patient_cancel_reason = $2,
            updated_at = NOW()
        WHERE id = $1
      `, [bookingId, reason]);
        await client.query(`
        UPDATE doctor_slots
        SET is_available = TRUE,
            updated_at = NOW()
        WHERE id = $1
      `, [booking.slot_id]);
        await client.query(`
        INSERT INTO notifications (user_id, title, message, type)
        SELECT d.user_id,
          'Bệnh nhân hủy lịch',
          'Lịch khám ' || $1 || ' đã được bệnh nhân hủy.',
          'BOOKING_CANCELLED'
        FROM doctors d
        WHERE d.id = $2
          AND d.user_id IS NOT NULL
      `, [booking.id, booking.doctor_id]);
        await client.query("COMMIT");
        return exports.findPatientBookingById(patientId, bookingId);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.cancelPatientBooking = cancelPatientBooking;
const reschedulePatientBooking = async (patientId, bookingId, newSlotId, reason) => {
    const client = await db.db.connect();
    try {
        await client.query("BEGIN");
        const booking = await exports.findPatientBookingById(patientId, bookingId, client);
        if (!booking) {
            await client.query("ROLLBACK");
            return null;
        }
        const newSlot = await exports.findSlotForReschedule(newSlotId, client);
        if (!newSlot) {
            throw new Error("Không tìm thấy khung giờ mới");
        }
        if (!newSlot.is_available) {
            throw new Error("Khung giờ mới đã có người đặt");
        }
        if (newSlot.doctor_id !== booking.doctor_id) {
            throw new Error("Chỉ được dời lịch trong cùng bác sĩ");
        }
        await client.query(`
        UPDATE doctor_slots
        SET is_available = TRUE,
            updated_at = NOW()
        WHERE id = $1
      `, [booking.slot_id]);
        await client.query(`
        UPDATE doctor_slots
        SET is_available = FALSE,
            updated_at = NOW()
        WHERE id = $1
      `, [newSlotId]);
        await client.query(`
        UPDATE appointments
        SET slot_id = $2,
            status = 'PENDING',
            reschedule_note = $3,
            doctor_response_reason = NULL,
            updated_at = NOW()
        WHERE id = $1
      `, [bookingId, newSlotId, reason]);
        await client.query(`
        INSERT INTO notifications (user_id, title, message, type)
        SELECT d.user_id,
          'Yêu cầu dời lịch',
          'Bệnh nhân đã dời lịch khám ' || $1 || '. Vui lòng kiểm tra lại.',
          'BOOKING_RESCHEDULED'
        FROM doctors d
        WHERE d.id = $2
          AND d.user_id IS NOT NULL
      `, [booking.id, booking.doctor_id]);
        await client.query("COMMIT");
        return exports.findPatientBookingById(patientId, bookingId);
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.reschedulePatientBooking = reschedulePatientBooking;
const listPatientLabResults = async (patientId) => {
    const result = await db.query(`
      SELECT
        lr.id,
        p.patient_code,
        lr.test_code,
        lr.test_name,
        lr.result_summary,
        lr.result_detail,
        lr.conclusion,
        lr.status,
        lr.performed_at::text,
        lr.created_at::text
      FROM lab_results lr
      INNER JOIN patients p ON p.id = lr.patient_id
      WHERE lr.patient_id = $1
      ORDER BY lr.created_at DESC
    `, [patientId]);
    return result.rows;
};
exports.listPatientLabResults = listPatientLabResults;
const listPatientPrescriptions = async (patientId) => {
    const result = await db.query(`
      SELECT
        pr.id,
        pr.appointment_id,
        d.full_name AS doctor_name,
        pr.diagnosis,
        pr.medications,
        pr.advice,
        pr.created_at::text
      FROM prescriptions pr
      INNER JOIN doctors d ON d.id = pr.doctor_id
      WHERE pr.patient_id = $1
      ORDER BY pr.created_at DESC
    `, [patientId]);
    return result.rows;
};
exports.listPatientPrescriptions = listPatientPrescriptions;
const ONLINE_PAYMENT_METHODS = new Set(["VNPAY", "MOMO"]);
const DIRECT_PAYMENT_METHODS = new Set(["CARD", "EWALLET", "BANK_TRANSFER", "CASH"]);
const isOnlinePaymentMethod = (method) => ONLINE_PAYMENT_METHODS.has(method);
const buildGatewayOrderCode = (method) => {
    const ts = Date.now();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${method}-${ts}-${random}`;
};
const listPatientPayments = async (patientId) => {
    const result = await db.query(`
      SELECT
        id,
        appointment_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_transaction_code,
        status,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
      FROM payment_transactions
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `, [patientId]);
    return result.rows;
};
exports.listPatientPayments = listPatientPayments;
const findPatientAppointmentForPayment = async (patientId, appointmentId) => {
    const result = await db.query(`
      SELECT id, doctor_id
      FROM appointments
      WHERE id = $1
        AND patient_id = $2
      LIMIT 1
    `, [appointmentId, patientId]);
    return result.rows[0] ?? null;
};
exports.findPatientAppointmentForPayment = findPatientAppointmentForPayment;
const hasPaidTransactionForAppointment = async (appointmentId) => {
    const result = await db.query(`
      SELECT COUNT(*)::text AS total
      FROM payment_transactions
      WHERE appointment_id = $1
        AND status = 'PAID'
    `, [appointmentId]);
    return Number(result.rows[0]?.total ?? 0) > 0;
};
exports.hasPaidTransactionForAppointment = hasPaidTransactionForAppointment;
const hasPendingTransactionForAppointment = async (appointmentId) => {
    const result = await db.query(`
      SELECT COUNT(*)::text AS total
      FROM payment_transactions
      WHERE appointment_id = $1
        AND status = 'PENDING'
    `, [appointmentId]);
    return Number(result.rows[0]?.total ?? 0) > 0;
};
exports.hasPendingTransactionForAppointment = hasPendingTransactionForAppointment;
const createPaymentTransaction = async (input) => {
    const isOnline = isOnlinePaymentMethod(input.method);
    const gateway = isOnline ? input.method : "DIRECT";
    const status = input.status ?? (isOnline ? "PENDING" : "PAID");
    const gatewayOrderCode = input.gatewayOrderCode ?? (isOnline ? buildGatewayOrderCode(input.method) : null);
    const gatewayResponse = input.gatewayResponse ?? {};
    const paidAt = status === "PAID" ? new Date() : null;
    const result = await db.query(`
      INSERT INTO payment_transactions (
        appointment_id,
        patient_id,
        invoice_code,
        amount,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_response,
        status,
        paid_at,
        service_snapshot
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
      RETURNING
        id,
        appointment_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_transaction_code,
        status,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
    `, [
        input.appointmentId,
        input.patientId,
        input.invoiceCode,
        input.amount,
        input.method,
        gateway,
        gatewayOrderCode,
        JSON.stringify(gatewayResponse),
        status,
        paidAt,
        input.serviceSnapshot ?? "Kham tong quat",
    ]);
    return result.rows[0];
};
exports.createPaymentTransaction = createPaymentTransaction;
const findPatientPaymentById = async (patientId, paymentId) => {
    const result = await db.query(`
      SELECT
        id,
        appointment_id,
        patient_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_transaction_code,
        gateway_response,
        status,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
      FROM payment_transactions
      WHERE id = $1
        AND patient_id = $2
      LIMIT 1
    `, [paymentId, patientId]);
    return result.rows[0] ?? null;
};
exports.findPatientPaymentById = findPatientPaymentById;
const completePaymentTransaction = async (paymentId, input) => {
    const result = await db.query(`
      UPDATE payment_transactions
      SET
        status = 'PAID',
        paid_at = NOW(),
        gateway_transaction_code = COALESCE($2, gateway_transaction_code),
        gateway_response = COALESCE(gateway_response, '{}'::jsonb) || $3::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        appointment_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_transaction_code,
        status,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
    `, [paymentId, input.gatewayTransactionCode ?? null, JSON.stringify(input.gatewayResponse ?? {})]);
    return result.rows[0] ?? null;
};
exports.completePaymentTransaction = completePaymentTransaction;
const failPaymentTransaction = async (paymentId, input) => {
    const result = await db.query(`
      UPDATE payment_transactions
      SET
        status = 'FAILED',
        gateway_response = COALESCE(gateway_response, '{}'::jsonb) || $2::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        appointment_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        gateway_order_code,
        gateway_transaction_code,
        status,
        paid_at::text,
        reconciled_at::text,
        service_snapshot,
        created_at::text
    `, [paymentId, JSON.stringify(input.gatewayResponse ?? {})]);
    return result.rows[0] ?? null;
};
exports.failPaymentTransaction = failPaymentTransaction;
const getInvoiceDetailByPaymentId = async (patientId, paymentId) => {
    const result = await db.query(`
      SELECT
        pt.id,
        pt.invoice_code,
        pt.amount::text,
        pt.payment_method,
        pt.payment_gateway,
        pt.status,
        pt.paid_at::text,
        pt.service_snapshot,
        pt.created_at::text,
        u.full_name AS patient_name,
        u.email AS patient_email,
        d.full_name AS doctor_name,
        dep.name AS department_name,
        ds.slot_date::text,
        ds.start_time::text,
        ds.end_time::text
      FROM payment_transactions pt
      INNER JOIN patients p ON p.id = pt.patient_id
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN appointments a ON a.id = pt.appointment_id
      LEFT JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN departments dep ON dep.id = a.department_id
      LEFT JOIN doctor_slots ds ON ds.id = a.slot_id
      WHERE pt.id = $1
        AND pt.patient_id = $2
      LIMIT 1
    `, [paymentId, patientId]);
    return result.rows[0] ?? null;
};
exports.getInvoiceDetailByPaymentId = getInvoiceDetailByPaymentId;
const buildPaymentInvoicePdf = async (invoice) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 42 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.fontSize(18).text("HOA DON THANH TOAN", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(10).text(`Ma hoa don: ${invoice.invoice_code}`);
    doc.text(`Ngay tao: ${invoice.created_at}`);
    doc.text(`Trang thai: ${invoice.status}`);
    doc.text(`Thoi gian thanh toan: ${invoice.paid_at ?? "-"}`);
    doc.moveDown(0.5);
    doc.text(`Benh nhan: ${invoice.patient_name ?? "-"}`);
    doc.text(`Email: ${invoice.patient_email ?? "-"}`);
    doc.moveDown(0.5);
    doc.text(`Khoa: ${invoice.department_name ?? "-"}`);
    doc.text(`Bac si: ${invoice.doctor_name ?? "-"}`);
    doc.text(`Dich vu: ${invoice.service_snapshot ?? "-"}`);
    doc.text(`Lich kham: ${invoice.slot_date ?? "-"} ${invoice.start_time ?? ""} ${invoice.end_time ?? ""}`);
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Tong thanh toan: ${Number(invoice.amount).toLocaleString("vi-VN")} VND`, {
        align: "right",
    });
    doc.moveDown(1);
    doc.fontSize(9).fillColor("#666").text("Hoa don mo phong cho do an mon hoc.", { align: "center" });
    doc.end();
});
exports.buildPaymentInvoicePdf = buildPaymentInvoicePdf;
const createNotificationForPatient = async (patientId, title, message, type) => {
    await db.query(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT p.user_id, $2, $3, $4
      FROM patients p
      WHERE p.id = $1
    `, [patientId, title, message, type]);
};
exports.createNotificationForPatient = createNotificationForPatient;
const listNotificationsByUserId = async (userId) => {
    const result = await db.query(`
      SELECT id, title, message, type, is_read, created_at::text
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [userId]);
    return result.rows;
};
exports.listNotificationsByUserId = listNotificationsByUserId;
const markNotificationAsRead = async (userId, notificationId) => {
    const result = await db.query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
        AND user_id = $2
      RETURNING id
    `, [notificationId, userId]);
    return result.rows.length > 0;
};
exports.markNotificationAsRead = markNotificationAsRead;
const createDoctorReview = async (input) => {
    const result = await db.query(`
      INSERT INTO doctor_reviews (appointment_id, doctor_id, patient_id, rating, comment)
      SELECT a.id, a.doctor_id, a.patient_id, $3, $4
      FROM appointments a
      WHERE a.id = $1
        AND a.patient_id = $2
      RETURNING id, rating, comment, created_at::text
    `, [input.appointmentId, input.patientId, input.rating, input.comment ?? null]);
    return result.rows[0];
};
exports.createDoctorReview = createDoctorReview;
const findReviewByAppointmentId = async (appointmentId) => {
    const result = await db.query("SELECT COUNT(*)::text AS total FROM doctor_reviews WHERE appointment_id = $1", [appointmentId]);
    return Number(result.rows[0]?.total ?? 0) > 0;
};
exports.findReviewByAppointmentId = findReviewByAppointmentId;
const findAppointmentForReview = async (patientId, appointmentId) => {
    const result = await db.query(`
      SELECT id, doctor_id, status
      FROM appointments
      WHERE id = $1
        AND patient_id = $2
      LIMIT 1
    `, [appointmentId, patientId]);
    return result.rows[0] ?? null;
};
exports.findAppointmentForReview = findAppointmentForReview;
const notifyDoctorByDoctorId = async (doctorId, title, message, type) => {
    await db.query(`
      INSERT INTO notifications (user_id, title, message, type)
      SELECT user_id, $2, $3, $4
      FROM doctors
      WHERE id = $1
        AND user_id IS NOT NULL
    `, [doctorId, title, message, type]);
};
exports.notifyDoctorByDoctorId = notifyDoctorByDoctorId;
const toAppointmentDateTime = (slotDate, startTime) => {
    const normalizedTime = startTime.slice(0, 8);
    return new Date(`${slotDate}T${normalizedTime}`);
};
const assertBeforeHours = (slotDate, startTime, minimumHours, message) => {
    const appointmentTime = toAppointmentDateTime(slotDate, startTime);
    if (Number.isNaN(appointmentTime.getTime())) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Thời gian lịch khám không hợp lệ");
    }
    const diffMs = appointmentTime.getTime() - Date.now();
    if (diffMs < minimumHours * 60 * 60 * 1000) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
const getPatientOrThrow = async (userId) => {
    const patient = await exports.findPatientByUserId(userId);
    if (!patient) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Không tìm thấy hồ sơ bệnh nhân");
    }
    return patient;
};
const buildInvoiceCode = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `INV${datePart}${random}`;
};
const buildGatewayTransactionCode = (gateway) => {
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${gateway}-TX-${Date.now()}-${random}`;
};
const buildMockCheckoutUrl = (paymentId, gateway, orderCode) => {
    return `${process.env.CLIENT_URL || 'http://localhost:5173'}/thanh-toan/${gateway.toLowerCase()}?paymentId=${paymentId}&orderCode=${orderCode}`;
};
exports.buildMockCheckoutUrl = buildMockCheckoutUrl;
const getMyProfile = async (userId) => {
    await getPatientOrThrow(userId);
    const profile = await exports.getPatientProfileByUserId(userId);
    if (!profile) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay ho so benh nhan");
    }
    return profile;
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (userId, payload) => {
    await getPatientOrThrow(userId);
    try {
        const updated = await exports.updatePatientProfileByUserId(userId, payload);
        if (!updated) {
            throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay ho so benh nhan");
        }
        return updated;
    }
    catch (error) {
        if (error instanceof app_error.AppError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : "Khong the cap nhat ho so";
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
exports.updateMyProfile = updateMyProfile;
const getMyBookings = async (userId, view, limit, offset) => {
    const patient = await getPatientOrThrow(userId);
    return exports.listPatientBookings(patient.id, view, limit, offset);
};
exports.getMyBookings = getMyBookings;
const cancelMyBooking = async (userId, bookingId, reason) => {
    const patient = await getPatientOrThrow(userId);
    const booking = await exports.findPatientBookingById(patient.id, bookingId);
    if (!booking) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    if (!(0, appointment_state.isPatientCancelableStatus)(booking.status)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Lich kham khong the huy o trang thai hien tai");
    }
    assertBeforeHours(booking.slot_date, booking.start_time, 2, "Chi duoc huy lich truoc it nhat 2 gio");
    const updated = await exports.cancelPatientBooking(patient.id, bookingId, reason);
    if (!updated) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    return updated;
};
exports.cancelMyBooking = cancelMyBooking;
const rescheduleMyBooking = async (userId, bookingId, newSlotId, reason) => {
    const patient = await getPatientOrThrow(userId);
    const booking = await exports.findPatientBookingById(patient.id, bookingId);
    if (!booking) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    if (!(0, appointment_state.isPatientReschedulableStatus)(booking.status)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Lich kham khong the doi o trang thai hien tai");
    }
    assertBeforeHours(booking.slot_date, booking.start_time, 2, "Chi duoc doi lich truoc it nhat 2 gio");
    try {
        const updated = await exports.reschedulePatientBooking(patient.id, bookingId, newSlotId, reason);
        if (!updated) {
            throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
        }
        return updated;
    }
    catch (error) {
        if (error instanceof app_error.AppError) {
            throw error;
        }
        const message = error instanceof Error ? error.message : "Khong the doi lich kham";
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, message);
    }
};
exports.rescheduleMyBooking = rescheduleMyBooking;
const getMyLabResults = async (userId) => {
    const patient = await getPatientOrThrow(userId);
    return exports.listPatientLabResults(patient.id);
};
exports.getMyLabResults = getMyLabResults;
const getMyPrescriptions = async (userId) => {
    const patient = await getPatientOrThrow(userId);
    return exports.listPatientPrescriptions(patient.id);
};
exports.getMyPrescriptions = getMyPrescriptions;
const getMyPayments = async (userId) => {
    const patient = await getPatientOrThrow(userId);
    return exports.listPatientPayments(patient.id);
};
exports.getMyPayments = getMyPayments;
const payMyAppointment = async (userId, payload) => {
    const patient = await getPatientOrThrow(userId);
    const appointment = await exports.findPatientAppointmentForPayment(patient.id, payload.appointmentId);
    if (!appointment) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    const hasPaid = await exports.hasPaidTransactionForAppointment(payload.appointmentId);
    if (hasPaid) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Lich kham nay da duoc thanh toan");
    }
    const isOnline = isOnlinePaymentMethod(payload.method);
    const isDirect = DIRECT_PAYMENT_METHODS.has(payload.method);
    if (!isOnline && !isDirect) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Phuong thuc thanh toan khong hop le");
    }
    if (isOnline) {
        const hasPending = await exports.hasPendingTransactionForAppointment(payload.appointmentId);
        if (hasPending) {
            throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Da ton tai giao dich online cho lich kham nay");
        }
    }
    const nowIso = new Date().toISOString();
    const payment = await exports.createPaymentTransaction({
        appointmentId: payload.appointmentId,
        patientId: patient.id,
        invoiceCode: buildInvoiceCode(),
        amount: payload.amount,
        method: payload.method,
        status: isOnline ? "PENDING" : "PAID",
        serviceSnapshot: payload.serviceName ?? "Kham tong quat",
        gatewayResponse: {
            source: isOnline ? "mock-gateway-init" : "direct-payment",
            initiated_at: nowIso,
        },
    });
    if (isOnline) {
        return Object.assign({}, payment, {
            checkout_url: buildMockCheckoutUrl(payment.id, payload.method, payment.gateway_order_code ?? ""),
            next_action: "CONFIRM_ONLINE_PAYMENT",
        });
    }
    await exports.createNotificationForPatient(patient.id, "Thanh toan thanh cong", `Giao dich ${payment.invoice_code} da thanh toan thanh cong.`, "PAYMENT_PAID");
    return payment;
};
exports.payMyAppointment = payMyAppointment;
const confirmMyOnlinePayment = async (userId, paymentId, payload) => {
    const patient = await getPatientOrThrow(userId);
    const payment = await exports.findPatientPaymentById(patient.id, paymentId);
    if (!payment) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay giao dich thanh toan");
    }
    if (!isOnlinePaymentMethod(payment.payment_method)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Giao dich nay khong phai thanh toan online");
    }
    if (payment.status === "PAID") {
        return payment;
    }
    if (payment.status !== "PENDING") {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Chi giao dich PENDING moi duoc xac nhan");
    }
    const completed = await exports.completePaymentTransaction(paymentId, {
        gatewayTransactionCode: payload.gatewayTransactionCode ?? buildGatewayTransactionCode(payment.payment_gateway ?? payment.payment_method),
        gatewayResponse: {
            source: "mock-gateway-confirm",
            confirmed_at: new Date().toISOString(),
        },
    });
    if (!completed) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Khong the cap nhat trang thai giao dich");
    }
    await exports.createNotificationForPatient(patient.id, "Thanh toan thanh cong", `Giao dich ${completed.invoice_code} da duoc xac nhan thanh cong.`, "PAYMENT_PAID");
    return completed;
};
exports.confirmMyOnlinePayment = confirmMyOnlinePayment;
const failMyOnlinePayment = async (userId, paymentId, payload) => {
    const patient = await getPatientOrThrow(userId);
    const payment = await exports.findPatientPaymentById(patient.id, paymentId);
    if (!payment) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay giao dich thanh toan");
    }
    if (!isOnlinePaymentMethod(payment.payment_method)) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Giao dich nay khong phai thanh toan online");
    }
    if (payment.status === "FAILED") {
        return payment;
    }
    if (payment.status === "PAID") {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Giao dich da thanh toan thanh cong, khong the danh dau that bai");
    }
    const failed = await exports.failPaymentTransaction(paymentId, {
        gatewayResponse: {
            source: "mock-gateway-fail",
            reason: payload.reason ?? "Giao dich bi huy",
            failed_at: new Date().toISOString(),
        },
    });
    if (!failed) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Khong the cap nhat giao dich that bai");
    }
    await exports.createNotificationForPatient(patient.id, "Thanh toan that bai", `Giao dich ${failed.invoice_code} da duoc cap nhat that bai.`, "PAYMENT_FAILED");
    return failed;
};
exports.failMyOnlinePayment = failMyOnlinePayment;
const getMyPaymentInvoicePdf = async (userId, paymentId) => {
    const patient = await getPatientOrThrow(userId);
    const invoice = await exports.getInvoiceDetailByPaymentId(patient.id, paymentId);
    if (!invoice) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay hoa don");
    }
    if (invoice.status !== "PAID") {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Chi xuat hoa don cho giao dich da thanh toan");
    }
    const body = await exports.buildPaymentInvoicePdf(invoice);
    const safeInvoiceCode = (invoice.invoice_code ?? paymentId).replace(/[^a-zA-Z0-9_-]/g, "_");
    return {
        filename: `invoice-${safeInvoiceCode}.pdf`,
        contentType: "application/pdf",
        body,
    };
};
exports.getMyPaymentInvoicePdf = getMyPaymentInvoicePdf;
const getMyNotifications = async (userId) => exports.listNotificationsByUserId(userId);
exports.getMyNotifications = getMyNotifications;
const readMyNotification = async (userId, notificationId) => {
    const ok = await exports.markNotificationAsRead(userId, notificationId);
    if (!ok) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay thong bao");
    }
};
exports.readMyNotification = readMyNotification;
const createMyReview = async (userId, payload) => {
    const patient = await getPatientOrThrow(userId);
    const appointment = await exports.findAppointmentForReview(patient.id, payload.appointmentId);
    if (!appointment) {
        throw new app_error.AppError(http_status_codes.StatusCodes.NOT_FOUND, "Khong tim thay lich kham");
    }
    if (!(0, appointment_state.isTerminalAppointmentStatus)(appointment.status) || appointment.status !== "COMPLETED") {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Chi duoc danh gia sau khi lich kham da hoan tat");
    }
    const hasReview = await exports.findReviewByAppointmentId(payload.appointmentId);
    if (hasReview) {
        throw new app_error.AppError(http_status_codes.StatusCodes.BAD_REQUEST, "Ban da danh gia lich kham nay");
    }
    const review = await exports.createDoctorReview({
        appointmentId: payload.appointmentId,
        patientId: patient.id,
        rating: payload.rating,
        comment: payload.comment,
    });
    await exports.notifyDoctorByDoctorId(appointment.doctor_id, "Danh gia moi tu benh nhan", `Ban vua nhan duoc danh gia ${payload.rating}/5 sao tu benh nhan.`, "DOCTOR_REVIEW");
    return review;
};
exports.createMyReview = createMyReview;
