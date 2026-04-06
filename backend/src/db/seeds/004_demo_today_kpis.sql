-- Demo KPI data for current date (idempotent)
-- Ensures admin dashboard always has "today" numbers:
-- - new_patients_today
-- - appointments_today
-- - revenue_today

-- 1) Create 3 patient users for today's KPI
WITH new_users (email, full_name, password_hash, created_at, updated_at) AS (
  VALUES
    ('patient.today01@benhvien.vn', 'Benh Nhan Hom Nay 01', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', date_trunc('day', NOW()) + INTERVAL '8 hours', NOW()),
    ('patient.today02@benhvien.vn', 'Benh Nhan Hom Nay 02', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', date_trunc('day', NOW()) + INTERVAL '9 hours', NOW()),
    ('patient.today03@benhvien.vn', 'Benh Nhan Hom Nay 03', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', date_trunc('day', NOW()) + INTERVAL '10 hours', NOW())
)
INSERT INTO users (email, full_name, password_hash, is_active, is_deleted, created_at, updated_at)
SELECT
  u.email,
  u.full_name,
  u.password_hash,
  TRUE,
  FALSE,
  u.created_at,
  u.updated_at
FROM new_users u
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  created_at = EXCLUDED.created_at,
  is_active = TRUE,
  is_deleted = FALSE,
  updated_at = NOW();

-- 2) Bind PATIENT role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'PATIENT'
WHERE u.email IN (
  'patient.today01@benhvien.vn',
  'patient.today02@benhvien.vn',
  'patient.today03@benhvien.vn'
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3) Create patient profiles with created_at in today range
WITH src (email, patient_code, phone_number, created_at) AS (
  VALUES
    ('patient.today01@benhvien.vn', 'BNTODAY001', '0909700001', date_trunc('day', NOW()) + INTERVAL '8 hours'),
    ('patient.today02@benhvien.vn', 'BNTODAY002', '0909700002', date_trunc('day', NOW()) + INTERVAL '9 hours'),
    ('patient.today03@benhvien.vn', 'BNTODAY003', '0909700003', date_trunc('day', NOW()) + INTERVAL '10 hours')
)
INSERT INTO patients (
  user_id,
  patient_code,
  phone_number,
  date_of_birth,
  gender,
  address,
  emergency_contact_name,
  emergency_contact_phone,
  health_insurance_number,
  created_at,
  updated_at
)
SELECT
  u.id,
  s.patient_code,
  s.phone_number,
  DATE '1998-01-01',
  'Nam',
  'TP HCM',
  'Nguoi than demo',
  '0911222333',
  'BHYTTODAY' || right(s.patient_code, 3),
  s.created_at,
  NOW()
FROM src s
INNER JOIN users u ON u.email = s.email
ON CONFLICT (patient_code) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  phone_number = EXCLUDED.phone_number,
  created_at = EXCLUDED.created_at,
  updated_at = NOW();

-- 4) Create 3 slots for today from active doctors
WITH doctor_pool AS (
  SELECT
    d.id AS doctor_id,
    d.department_id,
    row_number() OVER (ORDER BY d.doctor_code) AS rn
  FROM doctors d
  WHERE d.is_active = TRUE
    AND d.is_deleted = FALSE
  LIMIT 3
)
INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time, is_available, is_deleted, created_at, updated_at)
SELECT
  dp.doctor_id,
  CURRENT_DATE,
  CASE dp.rn
    WHEN 1 THEN TIME '08:00:00'
    WHEN 2 THEN TIME '09:00:00'
    ELSE TIME '10:00:00'
  END AS start_time,
  CASE dp.rn
    WHEN 1 THEN TIME '08:30:00'
    WHEN 2 THEN TIME '09:30:00'
    ELSE TIME '10:30:00'
  END AS end_time,
  TRUE,
  FALSE,
  NOW(),
  NOW()
FROM doctor_pool dp
ON CONFLICT (doctor_id, slot_date, start_time, end_time) DO UPDATE
SET
  is_deleted = FALSE,
  updated_at = NOW();

-- 5) Create appointments for today (2 completed + 1 confirmed)
WITH patient_pool AS (
  SELECT
    p.id AS patient_id,
    row_number() OVER (ORDER BY p.patient_code) AS rn
  FROM patients p
  WHERE p.patient_code IN ('BNTODAY001', 'BNTODAY002', 'BNTODAY003')
),
slot_pool AS (
  SELECT
    ds.id AS slot_id,
    ds.doctor_id,
    d.department_id,
    row_number() OVER (ORDER BY ds.start_time, ds.id) AS rn
  FROM doctor_slots ds
  INNER JOIN doctors d ON d.id = ds.doctor_id
  WHERE ds.slot_date = CURRENT_DATE
    AND ds.is_deleted = FALSE
    AND ds.start_time IN (TIME '08:00:00', TIME '09:00:00', TIME '10:00:00')
  LIMIT 3
),
matched AS (
  SELECT
    p.patient_id,
    s.doctor_id,
    s.department_id,
    s.slot_id,
    p.rn
  FROM patient_pool p
  INNER JOIN slot_pool s ON s.rn = p.rn
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
  patient_cancel_reason,
  reschedule_note,
  doctor_response_reason,
  created_at,
  updated_at
)
SELECT
  m.patient_id,
  m.doctor_id,
  m.department_id,
  m.slot_id,
  CASE WHEN m.rn IN (1, 2) THEN 'COMPLETED' ELSE 'CONFIRMED' END,
  'Kham tong quat demo hom nay',
  'Du lieu demo cho dashboard',
  CASE WHEN m.rn IN (1, 2) THEN 'Theo doi suc khoe dinh ky' ELSE NULL END,
  CASE WHEN m.rn IN (1, 2) THEN 'Benh nhan on dinh' ELSE NULL END,
  NULL,
  NULL,
  NULL,
  NOW() - INTERVAL '20 minutes',
  NOW()
FROM matched m
ON CONFLICT (slot_id) DO UPDATE
SET
  patient_id = EXCLUDED.patient_id,
  doctor_id = EXCLUDED.doctor_id,
  department_id = EXCLUDED.department_id,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 6) Sync slot availability
UPDATE doctor_slots ds
SET
  is_available = CASE WHEN a.status = 'CANCELLED' THEN TRUE ELSE FALSE END,
  updated_at = NOW()
FROM appointments a
WHERE a.slot_id = ds.id
  AND ds.slot_date = CURRENT_DATE;

-- 7) Create PAID transactions for 2 completed appointments today
WITH paid_source AS (
  SELECT
    a.id AS appointment_id,
    a.patient_id,
    row_number() OVER (ORDER BY a.id) AS rn
  FROM appointments a
  INNER JOIN doctor_slots ds ON ds.id = a.slot_id
  INNER JOIN patients p ON p.id = a.patient_id
  WHERE ds.slot_date = CURRENT_DATE
    AND a.status = 'COMPLETED'
    AND p.patient_code IN ('BNTODAY001', 'BNTODAY002', 'BNTODAY003')
  LIMIT 2
)
INSERT INTO payment_transactions (
  appointment_id,
  patient_id,
  invoice_code,
  amount,
  payment_method,
  status,
  paid_at,
  created_at,
  updated_at
)
SELECT
  ps.appointment_id,
  ps.patient_id,
  'INV-TODAY-00' || ps.rn,
  CASE WHEN ps.rn = 1 THEN 350000 ELSE 500000 END,
  'CASH',
  'PAID',
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '10 minutes',
  NOW()
FROM paid_source ps
ON CONFLICT (invoice_code) DO UPDATE
SET
  appointment_id = EXCLUDED.appointment_id,
  patient_id = EXCLUDED.patient_id,
  amount = EXCLUDED.amount,
  payment_method = EXCLUDED.payment_method,
  status = EXCLUDED.status,
  paid_at = EXCLUDED.paid_at,
  updated_at = NOW();
