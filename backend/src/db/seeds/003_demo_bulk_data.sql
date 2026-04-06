BEGIN;

-- =========================================================
-- BULK DEMO DATA
-- Mục tiêu: >= 50 bệnh nhân + nhiều lịch khám/đơn thuốc/thanh toán
-- =========================================================

-- 1) Tạo thêm 60 tài khoản bệnh nhân demo
WITH bulk_users AS (
  SELECT
    gs AS idx,
    format('patient.bulk%02s@benhvien.vn', gs) AS email,
    format('Benh Nhan Demo %02s', gs) AS full_name
  FROM generate_series(1, 60) AS gs
)
INSERT INTO users (email, full_name, password_hash, is_active)
SELECT
  bu.email,
  bu.full_name,
  '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe',
  TRUE
FROM bulk_users bu
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  is_active = TRUE,
  updated_at = NOW();

-- 2) Gán role PATIENT
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'PATIENT'
WHERE u.email LIKE 'patient.bulk%@benhvien.vn'
ON CONFLICT DO NOTHING;

-- 3) Hồ sơ bệnh nhân
WITH bulk_profiles AS (
  SELECT
    gs AS idx,
    format('patient.bulk%02s@benhvien.vn', gs) AS email,
    format('BNBULK%04s', gs) AS patient_code,
    format('093700%04s', gs) AS phone_number,
    (DATE '1985-01-01' + (gs * 97 % 12000) * INTERVAL '1 day')::date AS date_of_birth,
    CASE
      WHEN gs % 3 = 0 THEN 'Nam'
      WHEN gs % 3 = 1 THEN 'Nữ'
      ELSE 'Khác'
    END AS gender,
    format('Dia chi demo so %s, TP.HCM', gs) AS address,
    format('BHYTBULK%04s', gs) AS health_insurance_number
  FROM generate_series(1, 60) AS gs
)
INSERT INTO patients (
  user_id,
  patient_code,
  phone_number,
  date_of_birth,
  gender,
  address,
  health_insurance_number
)
SELECT
  u.id,
  bp.patient_code,
  bp.phone_number,
  bp.date_of_birth,
  bp.gender,
  bp.address,
  bp.health_insurance_number
FROM bulk_profiles bp
INNER JOIN users u ON u.email = bp.email
ON CONFLICT (patient_code) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  phone_number = EXCLUDED.phone_number,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  address = EXCLUDED.address,
  health_insurance_number = EXCLUDED.health_insurance_number,
  updated_at = NOW();

-- 4) Tạo thêm slot cho bác sĩ trong 20 ngày, mỗi ngày 2 slot
WITH doctor_pool AS (
  SELECT id
  FROM doctors
),
date_pool AS (
  SELECT generate_series(CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '10 days', INTERVAL '1 day')::date AS slot_date
),
time_pool AS (
  SELECT *
  FROM (
    VALUES
      (TIME '10:00', TIME '10:30'),
      (TIME '10:30', TIME '11:00')
  ) AS t(start_time, end_time)
)
INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, is_available)
SELECT
  d.id,
  dp.slot_date,
  tp.start_time,
  tp.end_time,
  TRUE
FROM doctor_pool d
CROSS JOIN date_pool dp
CROSS JOIN time_pool tp
ON CONFLICT (doctor_id, slot_date, start_time, end_time) DO NOTHING;

-- 5) Tạo thêm appointments cho bệnh nhân bulk từ các slot còn trống
WITH patient_pool AS (
  SELECT
    p.id AS patient_id,
    row_number() OVER (ORDER BY p.patient_code) AS rn
  FROM patients p
  WHERE p.patient_code LIKE 'BNBULK%'
),
patient_count AS (
  SELECT COUNT(*)::int AS total FROM patient_pool
),
slot_pool AS (
  SELECT
    ds.id AS slot_id,
    ds.doctor_id,
    d.department_id,
    ds.slot_date,
    ds.start_time,
    row_number() OVER (ORDER BY ds.slot_date, ds.start_time, ds.doctor_id) AS rn
  FROM doctor_slots ds
  INNER JOIN doctors d ON d.id = ds.doctor_id
  WHERE ds.is_available = TRUE
    AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.slot_id = ds.id)
  LIMIT 240
),
mapping AS (
  SELECT
    sp.slot_id,
    sp.doctor_id,
    sp.department_id,
    sp.slot_date,
    sp.start_time,
    pp.patient_id,
    sp.rn
  FROM slot_pool sp
  INNER JOIN patient_count pc ON TRUE
  INNER JOIN patient_pool pp
    ON pp.rn = ((sp.rn - 1) % pc.total) + 1
)
INSERT INTO appointments (
  patient_id,
  doctor_id,
  department_id,
  slot_id,
  status,
  reason,
  notes,
  diagnosis,
  doctor_note,
  patient_cancel_reason
)
SELECT
  m.patient_id,
  m.doctor_id,
  m.department_id,
  m.slot_id,
  CASE
    WHEN m.slot_date < CURRENT_DATE THEN
      CASE WHEN m.rn % 6 = 0 THEN 'CANCELLED' ELSE 'COMPLETED' END
    ELSE
      CASE WHEN m.rn % 4 = 0 THEN 'CONFIRMED' ELSE 'PENDING' END
  END AS status,
  format('Trieu chung demo #%s', m.rn),
  format('Ghi chu demo cho lich #%s', m.rn),
  CASE
    WHEN m.slot_date < CURRENT_DATE AND m.rn % 6 <> 0 THEN format('Chan doan demo #%s', m.rn)
    ELSE NULL
  END,
  CASE
    WHEN m.slot_date < CURRENT_DATE AND m.rn % 6 <> 0 THEN 'Benh nhan dap ung dieu tri on'
    ELSE NULL
  END,
  CASE
    WHEN m.slot_date < CURRENT_DATE AND m.rn % 6 = 0 THEN 'Benh nhan ban viec dot xuat'
    ELSE NULL
  END
FROM mapping m
ON CONFLICT (slot_id) DO NOTHING;

-- Đồng bộ trạng thái is_available của slot theo appointment
UPDATE doctor_slots ds
SET
  is_available = CASE WHEN a.status = 'CANCELLED' THEN TRUE ELSE FALSE END,
  updated_at = NOW()
FROM appointments a
WHERE a.slot_id = ds.id;

-- 6) Đơn thuốc cho lịch COMPLETED của bệnh nhân bulk
INSERT INTO prescriptions (
  appointment_id,
  doctor_id,
  patient_id,
  diagnosis,
  medications,
  advice
)
SELECT
  a.id,
  a.doctor_id,
  a.patient_id,
  COALESCE(a.diagnosis, 'Chan doan tong quat'),
  '[{"medicineCode":"MED-PARA-500","medicineName":"Paracetamol 500mg","dosage":"1 vien","frequency":"2 lan/ngay","duration":"3 ngay","note":"Uong sau an"}]'::jsonb,
  'Tai kham neu trieu chung khong giam.'
FROM appointments a
INNER JOIN patients p ON p.id = a.patient_id
WHERE p.patient_code LIKE 'BNBULK%'
  AND a.status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1
    FROM prescriptions pr
    WHERE pr.appointment_id = a.id
  )
LIMIT 120;

-- 7) Kết quả cận lâm sàng cho bệnh nhân bulk
INSERT INTO lab_results (
  patient_id,
  test_code,
  test_name,
  result_summary,
  result_detail,
  conclusion,
  status,
  performed_at
)
SELECT
  p.id,
  'LAB-CBC',
  'Tong phan tich te bao mau',
  'Chi so co ban trong nguong tham chieu',
  'Du lieu demo: bach cau, hong cau, tieu cau trong nguong.',
  'Theo doi dinh ky moi 6 thang',
  'COMPLETED',
  NOW() - ((row_number() OVER (ORDER BY p.patient_code))::text || ' days')::interval
FROM patients p
WHERE p.patient_code LIKE 'BNBULK%'
  AND NOT EXISTS (
    SELECT 1
    FROM lab_results lr
    WHERE lr.patient_id = p.id
      AND lr.test_code = 'LAB-CBC'
  )
LIMIT 80;

-- 8) Thanh toán cho lịch COMPLETED/CONFIRMED/PENDING của bệnh nhân bulk
INSERT INTO payment_transactions (
  appointment_id,
  patient_id,
  invoice_code,
  amount,
  payment_method,
  status,
  paid_at
)
SELECT
  a.id,
  a.patient_id,
  'INVBULK' || upper(substr(replace(a.id::text, '-', ''), 1, 12)),
  CASE
    WHEN a.status = 'COMPLETED' THEN 550000
    WHEN a.status = 'CONFIRMED' THEN 450000
    ELSE 300000
  END,
  CASE
    WHEN (row_number() OVER (ORDER BY a.created_at)) % 3 = 0 THEN 'CARD'
    WHEN (row_number() OVER (ORDER BY a.created_at)) % 3 = 1 THEN 'EWALLET'
    ELSE 'BANK_TRANSFER'
  END,
  CASE
    WHEN a.status = 'COMPLETED' THEN 'PAID'
    ELSE 'PENDING'
  END,
  CASE
    WHEN a.status = 'COMPLETED' THEN a.updated_at
    ELSE NULL
  END
FROM appointments a
INNER JOIN patients p ON p.id = a.patient_id
WHERE p.patient_code LIKE 'BNBULK%'
  AND a.status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
  AND NOT EXISTS (
    SELECT 1
    FROM payment_transactions pt
    WHERE pt.appointment_id = a.id
  )
LIMIT 200;

-- 9) Đánh giá bác sĩ cho một phần lịch COMPLETED
INSERT INTO doctor_reviews (appointment_id, doctor_id, patient_id, rating, comment)
SELECT
  a.id,
  a.doctor_id,
  a.patient_id,
  CASE
    WHEN (row_number() OVER (ORDER BY a.updated_at DESC)) % 5 = 0 THEN 4
    ELSE 5
  END,
  'Danh gia demo: bac si tu van ro rang, thai do tot.'
FROM appointments a
INNER JOIN patients p ON p.id = a.patient_id
WHERE p.patient_code LIKE 'BNBULK%'
  AND a.status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1
    FROM doctor_reviews dr
    WHERE dr.appointment_id = a.id
  )
LIMIT 100;

-- 10) Thông báo mẫu cho bệnh nhân bulk
INSERT INTO notifications (user_id, title, message, type)
SELECT
  p.user_id,
  'Nhac lich kham',
  'Thong bao demo: ban co lich kham sap toi, vui long den dung gio.',
  'BOOKING_REMINDER'
FROM patients p
WHERE p.patient_code LIKE 'BNBULK%'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications n
    WHERE n.user_id = p.user_id
      AND n.title = 'Nhac lich kham'
  )
LIMIT 60;

COMMIT;
