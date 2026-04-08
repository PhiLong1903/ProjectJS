const { StatusCodes } = require("http-status-codes");
const { query } = require("../config/db");
const { AppError } = require("../utils/app-error");

const getPatientByCodeAndPhone = async (patientCode, phoneNumber) => {
  const result = await query(
    `
      SELECT
        p.id,
        p.patient_code,
        p.phone_number,
        p.date_of_birth::text,
        p.gender,
        p.address,
        p.health_insurance_number,
        p.created_at::text,
        u.full_name,
        u.email
      FROM patients p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.patient_code = $1
        AND p.phone_number = $2
      LIMIT 1
    `,
    [patientCode, phoneNumber]
  );

  return result.rows[0] ?? null;
};

const getPatientAppointments = async (patientId) => {
  const result = await query(
    `
      SELECT
        a.id,
        a.status,
        a.reason,
        a.notes,
        a.diagnosis,
        a.doctor_note,
        a.patient_cancel_reason,
        a.reschedule_note,
        a.doctor_response_reason,
        a.created_at::text,
        a.updated_at::text,
        d.id AS doctor_id,
        d.full_name AS doctor_name,
        d.specialty AS doctor_specialty,
        dep.id AS department_id,
        dep.name AS department_name,
        ds.id AS slot_id,
        ds.slot_date::text,
        ds.start_time::text,
        ds.end_time::text
      FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      INNER JOIN departments dep ON dep.id = a.department_id
      INNER JOIN doctor_slots ds ON ds.id = a.slot_id
      WHERE a.patient_id = $1
      ORDER BY ds.slot_date DESC, ds.start_time DESC
      LIMIT 100
    `,
    [patientId]
  );

  return result.rows;
};

const getPatientLabResults = async (patientId) => {
  const result = await query(
    `
      SELECT
        id,
        test_code,
        test_name,
        result_summary,
        result_detail,
        conclusion,
        status,
        performed_at::text,
        created_at::text,
        updated_at::text
      FROM lab_results
      WHERE patient_id = $1
        AND is_deleted = FALSE
      ORDER BY COALESCE(performed_at, created_at) DESC
      LIMIT 100
    `,
    [patientId]
  );

  return result.rows;
};

const getPatientPrescriptions = async (patientId) => {
  const result = await query(
    `
      SELECT
        pr.id,
        pr.appointment_id,
        pr.doctor_id,
        d.full_name AS doctor_name,
        pr.diagnosis,
        pr.medications,
        pr.advice,
        pr.created_at::text,
        pr.updated_at::text,
        ds.slot_date::text,
        ds.start_time::text,
        ds.end_time::text
      FROM prescriptions pr
      LEFT JOIN doctors d ON d.id = pr.doctor_id
      LEFT JOIN appointments a ON a.id = pr.appointment_id
      LEFT JOIN doctor_slots ds ON ds.id = a.slot_id
      WHERE pr.patient_id = $1
      ORDER BY pr.created_at DESC
      LIMIT 100
    `,
    [patientId]
  );

  return result.rows;
};

const getPatientPayments = async (patientId) => {
  const result = await query(
    `
      SELECT
        id,
        appointment_id,
        invoice_code,
        amount::text,
        payment_method,
        payment_gateway,
        status,
        service_snapshot,
        gateway_order_code,
        gateway_transaction_code,
        paid_at::text,
        reconciled_at::text,
        created_at::text,
        updated_at::text
      FROM payment_transactions
      WHERE patient_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `,
    [patientId]
  );

  return result.rows;
};

const lookupPatientRecord = async (payload) => {
  const patient = await getPatientByCodeAndPhone(payload.patientCode, payload.phoneNumber);
  if (!patient) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Khong tim thay ho so kham benh. Vui long kiem tra lai ma benh nhan va so dien thoai."
    );
  }

  const [appointments, labResults, prescriptions, payments] = await Promise.all([
    getPatientAppointments(patient.id),
    getPatientLabResults(patient.id),
    getPatientPrescriptions(patient.id),
    getPatientPayments(patient.id),
  ]);

  return {
    patient: {
      id: patient.id,
      patient_code: patient.patient_code,
      full_name: patient.full_name,
      email: patient.email,
      phone_number: patient.phone_number,
      date_of_birth: patient.date_of_birth,
      gender: patient.gender,
      address: patient.address,
      health_insurance_number: patient.health_insurance_number,
      created_at: patient.created_at,
    },
    summary: {
      total_appointments: appointments.length,
      total_lab_results: labResults.length,
      total_prescriptions: prescriptions.length,
      total_payments: payments.length,
    },
    appointments,
    lab_results: labResults,
    prescriptions,
    payments,
  };
};

exports.lookupPatientRecordService = lookupPatientRecord;
