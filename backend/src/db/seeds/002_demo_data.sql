BEGIN;

-- =========================================================
-- DEMO DATA FOR HOSPITAL E-HEALTH SYSTEM
-- Run in pgAdmin Query Tool after 001_init.sql + 001_seed.sql
--
-- Default passwords used by hash:
-- - Admin/Staff demo users: Admin@123
-- - Doctor demo users:      Doctor@123
-- - Patient demo users:     Patient@123
-- =========================================================

-- 1) Roles (safe)
INSERT INTO roles (name, description)
VALUES
  ('ADMIN', 'Quan tri he thong'),
  ('DOCTOR', 'Bac si dieu tri'),
  ('PATIENT', 'Benh nhan'),
  ('STAFF', 'Nhan vien van hanh')
ON CONFLICT (name) DO NOTHING;

-- 2) Departments
WITH department_source (name, slug, description, location, phone) AS (
  VALUES
    ('Khoa Da lieu', 'khoa-da-lieu', 'Kham va dieu tri cac benh ly da', 'Tang 3 - Khu D', '02839010001'),
    ('Khoa Tai Mui Hong', 'khoa-tai-mui-hong', 'Kham chuyen sau Tai Mui Hong', 'Tang 2 - Khu C', '02839010002'),
    ('Khoa San', 'khoa-san', 'Theo doi thai ky va suc khoe phu nu', 'Tang 4 - Khu B', '02839010003'),
    ('Khoa Chan doan hinh anh', 'khoa-chan-doan-hinh-anh', 'Sieu am, X-quang, CT, MRI', 'Tang 1 - Khu A', '02839010004'),
    ('Khoa Than kinh', 'khoa-than-kinh', 'Chan doan va dieu tri benh than kinh', 'Tang 5 - Khu C', '02839010005'),
    ('Khoa Ung buou', 'khoa-ung-buou', 'Tam soat va dieu tri ung buou', 'Tang 6 - Khu A', '02839010006')
)
INSERT INTO departments (name, slug, description, location, phone)
SELECT name, slug, description, location, phone
FROM department_source
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- 3) Additional users
WITH user_source (email, full_name, password_hash, is_active) AS (
  VALUES
    -- Admin/Staff
    ('admin.ops@benhvien.vn', 'Admin Van Hanh', '$2a$10$kUfKp1pgu9OjnYUJbsI7i.nvxviPFNRl9/J29.5k8CgAQbN0lWava', TRUE),
    ('staff.tiepnhan@benhvien.vn', 'Le Tan Mot Cua', '$2a$10$kUfKp1pgu9OjnYUJbsI7i.nvxviPFNRl9/J29.5k8CgAQbN0lWava', TRUE),
    ('staff.ketoan@benhvien.vn', 'Ke Toan Vien', '$2a$10$kUfKp1pgu9OjnYUJbsI7i.nvxviPFNRl9/J29.5k8CgAQbN0lWava', TRUE),

    -- Doctors
    ('doctor.timmach@benhvien.vn', 'BS Tran Quang Minh', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.ngoaikhoa@benhvien.vn', 'BS Nguyen Hoang Phuc', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.dalieu@benhvien.vn', 'BS Pham Minh Chau', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.taimuihong@benhvien.vn', 'BS Le Thu Hien', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.sanphu@benhvien.vn', 'BS Vo Ngoc Anh', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.cdha@benhvien.vn', 'BS Do Quang Huy', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.thankinh@benhvien.vn', 'BS Truong Hai Dang', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),
    ('doctor.ungbuou@benhvien.vn', 'BS Bui Ngoc Lan', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', TRUE),

    -- Patients
    ('patient.anh01@benhvien.vn', 'Nguyen Minh Anh', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh02@benhvien.vn', 'Tran Gia Bao', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh03@benhvien.vn', 'Le Quoc Dat', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh04@benhvien.vn', 'Pham Thao Nhi', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh05@benhvien.vn', 'Vo Hoang Nam', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh06@benhvien.vn', 'Dang Khanh Linh', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh07@benhvien.vn', 'Phan Tuan Kiet', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh08@benhvien.vn', 'Do Huu Phuoc', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh09@benhvien.vn', 'Ngo Thanh Truc', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE),
    ('patient.anh10@benhvien.vn', 'Huynh Duc Huy', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe', TRUE)
)
INSERT INTO users (email, full_name, password_hash, is_active)
SELECT email, full_name, password_hash, is_active
FROM user_source
ON CONFLICT (email) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 4) User roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'ADMIN'
WHERE u.email IN ('admin.ops@benhvien.vn')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'STAFF'
WHERE u.email IN ('staff.tiepnhan@benhvien.vn', 'staff.ketoan@benhvien.vn')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'DOCTOR'
WHERE u.email IN (
  'doctor.timmach@benhvien.vn',
  'doctor.ngoaikhoa@benhvien.vn',
  'doctor.dalieu@benhvien.vn',
  'doctor.taimuihong@benhvien.vn',
  'doctor.sanphu@benhvien.vn',
  'doctor.cdha@benhvien.vn',
  'doctor.thankinh@benhvien.vn',
  'doctor.ungbuou@benhvien.vn'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'PATIENT'
WHERE u.email IN (
  'patient.anh01@benhvien.vn',
  'patient.anh02@benhvien.vn',
  'patient.anh03@benhvien.vn',
  'patient.anh04@benhvien.vn',
  'patient.anh05@benhvien.vn',
  'patient.anh06@benhvien.vn',
  'patient.anh07@benhvien.vn',
  'patient.anh08@benhvien.vn',
  'patient.anh09@benhvien.vn',
  'patient.anh10@benhvien.vn'
)
ON CONFLICT DO NOTHING;

-- 5) Doctor profiles
WITH doctor_source (
  email,
  doctor_code,
  full_name,
  specialty,
  department_slug,
  experience_years,
  qualifications,
  description,
  avatar_url
) AS (
  VALUES
    ('doctor.timmach@benhvien.vn', 'BS-TM-003', 'BS Tran Quang Minh', 'Noi tim mach', 'khoa-tim-mach', 14, 'CKII Tim mach, Chung chi ECG nang cao', 'Chuyen theo doi va dieu tri tang huyet ap, roi loan nhip tim.', NULL),
    ('doctor.ngoaikhoa@benhvien.vn', 'BS-NGOAI-004', 'BS Nguyen Hoang Phuc', 'Ngoai tong quat', 'khoa-ngoai-tong-quat', 12, 'CKI Ngoai tong quat', 'Thuc hien phau thuat noi soi bung va theo doi sau mo.', NULL),
    ('doctor.dalieu@benhvien.vn', 'BS-DALIEU-005', 'BS Pham Minh Chau', 'Da lieu', 'khoa-da-lieu', 9, 'CKI Da lieu', 'Dieu tri mun, viem da tiep xuc, benh da man tinh.', NULL),
    ('doctor.taimuihong@benhvien.vn', 'BS-TAIMUIHONG-006', 'BS Le Thu Hien', 'Tai mui hong', 'khoa-tai-mui-hong', 8, 'CKI Tai Mui Hong', 'Chan doan va dieu tri viem xoang, viem hong man.', NULL),
    ('doctor.sanphu@benhvien.vn', 'BS-SAN-007', 'BS Vo Ngoc Anh', 'San phu khoa', 'khoa-san', 11, 'CKI San phu khoa', 'Theo doi thai ky, tu van suc khoe sinh san.', NULL),
    ('doctor.cdha@benhvien.vn', 'BS-CDHA-008', 'BS Do Quang Huy', 'Chan doan hinh anh', 'khoa-chan-doan-hinh-anh', 10, 'Chung chi Chan doan hinh anh', 'Doc ket qua X-quang, sieu am, ho tro hoi chan.', NULL),
    ('doctor.thankinh@benhvien.vn', 'BS-THANKINH-009', 'BS Truong Hai Dang', 'Than kinh', 'khoa-than-kinh', 13, 'CKII Than kinh', 'Theo doi dau nua dau, roi loan giac ngu, dot quy.', NULL),
    ('doctor.ungbuou@benhvien.vn', 'BS-UNG-010', 'BS Bui Ngoc Lan', 'Ung buou', 'khoa-ung-buou', 15, 'CKII Ung buou', 'Tu van tam soat va theo doi benh ly ung buou.', NULL)
)
INSERT INTO doctors (
  user_id,
  doctor_code,
  full_name,
  specialty,
  department_id,
  experience_years,
  qualifications,
  description,
  avatar_url
)
SELECT
  u.id,
  ds.doctor_code,
  ds.full_name,
  ds.specialty,
  d.id,
  ds.experience_years,
  ds.qualifications,
  ds.description,
  ds.avatar_url
FROM doctor_source ds
INNER JOIN users u ON u.email = ds.email
INNER JOIN departments d ON d.slug = ds.department_slug
ON CONFLICT (doctor_code) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  full_name = EXCLUDED.full_name,
  specialty = EXCLUDED.specialty,
  department_id = EXCLUDED.department_id,
  experience_years = EXCLUDED.experience_years,
  qualifications = EXCLUDED.qualifications,
  description = EXCLUDED.description,
  avatar_url = EXCLUDED.avatar_url,
  is_active = TRUE,
  updated_at = NOW();

-- 6) Patient profiles
WITH patient_source (
  email,
  patient_code,
  phone_number,
  date_of_birth,
  gender,
  address,
  emergency_contact_name,
  emergency_contact_phone,
  health_insurance_number
) AS (
  VALUES
    ('patient.anh01@benhvien.vn', 'BN20260101', '0909000101', DATE '1995-02-10', 'Nam', 'Thu Duc, TP HCM', 'Nguyen Van Son', '0911001101', 'BHYT010001'),
    ('patient.anh02@benhvien.vn', 'BN20260102', '0909000102', DATE '1989-08-20', 'Nam', 'Go Vap, TP HCM', 'Tran Thi Hoa', '0911001102', 'BHYT010002'),
    ('patient.anh03@benhvien.vn', 'BN20260103', '0909000103', DATE '1998-11-05', 'Nam', 'Quan 12, TP HCM', 'Le Thi Nga', '0911001103', 'BHYT010003'),
    ('patient.anh04@benhvien.vn', 'BN20260104', '0909000104', DATE '1993-04-12', NULL, 'Binh Thanh, TP HCM', 'Pham Van Kien', '0911001104', 'BHYT010004'),
    ('patient.anh05@benhvien.vn', 'BN20260105', '0909000105', DATE '2000-12-25', 'Nam', 'Tan Binh, TP HCM', 'Vo Thi Lan', '0911001105', 'BHYT010005'),
    ('patient.anh06@benhvien.vn', 'BN20260106', '0909000106', DATE '1991-07-17', NULL, 'Phu Nhuan, TP HCM', 'Dang Van Cuong', '0911001106', 'BHYT010006'),
    ('patient.anh07@benhvien.vn', 'BN20260107', '0909000107', DATE '1987-09-30', 'Nam', 'Quan 3, TP HCM', 'Phan Thi Mai', '0911001107', 'BHYT010007'),
    ('patient.anh08@benhvien.vn', 'BN20260108', '0909000108', DATE '1999-01-09', 'Nam', 'Quan 7, TP HCM', 'Do Thi Hanh', '0911001108', 'BHYT010008'),
    ('patient.anh09@benhvien.vn', 'BN20260109', '0909000109', DATE '1996-06-14', NULL, 'Binh Tan, TP HCM', 'Ngo Van Loc', '0911001109', 'BHYT010009'),
    ('patient.anh10@benhvien.vn', 'BN20260110', '0909000110', DATE '1994-10-22', 'Nam', 'Quan 1, TP HCM', 'Huynh Thi Tam', '0911001110', 'BHYT010010')
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
  health_insurance_number
)
SELECT
  u.id,
  ps.patient_code,
  ps.phone_number,
  ps.date_of_birth,
  ps.gender,
  ps.address,
  ps.emergency_contact_name,
  ps.emergency_contact_phone,
  ps.health_insurance_number
FROM patient_source ps
INNER JOIN users u ON u.email = ps.email
ON CONFLICT (patient_code) DO UPDATE
SET
  user_id = EXCLUDED.user_id,
  phone_number = EXCLUDED.phone_number,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  address = EXCLUDED.address,
  emergency_contact_name = EXCLUDED.emergency_contact_name,
  emergency_contact_phone = EXCLUDED.emergency_contact_phone,
  health_insurance_number = EXCLUDED.health_insurance_number,
  updated_at = NOW();

-- 7) Medical services
WITH service_source (
  service_code,
  name,
  slug,
  short_description,
  description,
  price_from
) AS (
  VALUES
    ('DV-THM-010', 'Kham Tai Mui Hong chuyen sau', 'kham-tai-mui-hong-chuyen-sau', 'Kham va noi soi tai mui hong.', 'Danh gia viem xoang, viem hong, viem mui di ung.', 650000),
    ('DV-DL-011', 'Goi dieu tri da lieu co ban', 'goi-dieu-tri-da-lieu-co-ban', 'Tu van va theo doi benh da thong thuong.', 'Bao gom kham chuyen khoa va huong dan cham soc tai nha.', 550000),
    ('DV-SAN-012', 'Goi theo doi thai ky 3 thang giua', 'goi-theo-doi-thai-ky-3-thang-giua', 'Theo doi suc khoe me va be trong tam ca nguyet 2.', 'Kham thai, sieu am, tu van dinh duong va phong benh.', 2200000),
    ('DV-UNG-013', 'Tam soat ung thu vu co ban', 'tam-soat-ung-thu-vu-co-ban', 'Tam soat dinh ky cho nu gioi.', 'Bao gom kham lam sang, sieu am vu va tu van ket qua.', 1750000),
    ('DV-XN-014', 'Goi xet nghiem tong quat nang cao', 'goi-xet-nghiem-tong-quat-nang-cao', 'Danh gia tong quan suc khoe qua xet nghiem.', 'Bao gom mau, nuoc tieu, duong huyet, mo mau, men gan.', 1350000)
)
INSERT INTO medical_services (
  service_code,
  name,
  slug,
  short_description,
  description,
  price_from
)
SELECT
  service_code,
  name,
  slug,
  short_description,
  description,
  price_from
FROM service_source
ON CONFLICT (slug) DO UPDATE
SET
  service_code = EXCLUDED.service_code,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price_from = EXCLUDED.price_from,
  is_active = TRUE,
  updated_at = NOW();

-- 8) News articles
WITH news_source (title, slug, summary, content, is_published, published_at) AS (
  VALUES
    (
      'Benh vien mo rong lich kham cuoi tuan',
      'benh-vien-mo-rong-lich-kham-cuoi-tuan',
      'Tu thang 4, benh vien bo sung ca kham sang thu 7 de giam tai.',
      'Nguoi dan co the dat lich online va chu dong chon khung gio phu hop trong ngay thu 7.',
      TRUE,
      NOW() - INTERVAL '10 days'
    ),
    (
      'Huong dan phong benh ho hap giao mua',
      'huong-dan-phong-benh-ho-hap-giao-mua',
      'Nguoi co benh nen can giu am va kham som khi co dau hieu bat thuong.',
      'Bac si khuyen cao nguoi dan deo khau trang, uong du nuoc va han che tiep xuc khoi bui.',
      TRUE,
      NOW() - INTERVAL '7 days'
    ),
    (
      'Trien khai quy trinh thanh toan vien phi khong tien mat',
      'trien-khai-thanh-toan-vien-phi-khong-tien-mat',
      'Nguoi benh co the thanh toan bang the, vi dien tu hoac chuyen khoan.',
      'He thong luu lich su hoa don dien tu va giup doi soat nhanh hon.',
      TRUE,
      NOW() - INTERVAL '5 days'
    ),
    (
      'Chuong trinh tam soat tim mach cho nguoi tren 40 tuoi',
      'chuong-trinh-tam-soat-tim-mach-cho-nguoi-tren-40-tuoi',
      'Khuyen khich nguoi dan kiem tra suc khoe tim mach dinh ky.',
      'Goi tam soat bao gom kham chuyen khoa, dien tim va xet nghiem can thiet.',
      TRUE,
      NOW() - INTERVAL '3 days'
    )
)
INSERT INTO news_articles (title, slug, summary, content, is_published, published_at)
SELECT title, slug, summary, content, is_published, published_at
FROM news_source
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content = EXCLUDED.content,
  is_published = EXCLUDED.is_published,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();

-- 9) Doctor slots (create a wide pool for booking demo)
WITH doctor_pool AS (
  SELECT id
  FROM doctors
  WHERE doctor_code IN (
    'BS-NTQ-001',
    'BS-NHI-002',
    'BS-TM-003',
    'BS-NGOAI-004',
    'BS-DALIEU-005',
    'BS-TAIMUIHONG-006',
    'BS-SAN-007',
    'BS-CDHA-008',
    'BS-THANKINH-009',
    'BS-UNG-010'
  )
),
date_pool AS (
  SELECT generate_series(DATE '2026-03-25', DATE '2026-04-10', INTERVAL '1 day')::date AS slot_date
),
time_pool AS (
  SELECT *
  FROM (
    VALUES
      (TIME '08:00', TIME '08:30'),
      (TIME '08:30', TIME '09:00'),
      (TIME '09:00', TIME '09:30'),
      (TIME '13:30', TIME '14:00')
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
ON CONFLICT (doctor_id, slot_date, start_time, end_time) DO UPDATE
SET
  is_available = EXCLUDED.is_available,
  updated_at = NOW();

-- 10) Appointments
WITH appointment_source (
  patient_code,
  doctor_code,
  slot_date,
  start_time,
  status,
  reason,
  notes,
  doctor_note,
  diagnosis,
  patient_cancel_reason,
  reschedule_note,
  doctor_response_reason
) AS (
  VALUES
    ('BN20260001', 'BS-NHI-002', DATE '2026-03-26', TIME '08:00', 'COMPLETED', 'Ho sot 2 ngay', 'Da uong thuoc ha sot tai nha', 'Tre dap ung dieu tri tot', 'Viem hong cap', NULL, NULL, NULL),
    ('BN20260101', 'BS-NTQ-001', DATE '2026-03-26', TIME '08:30', 'COMPLETED', 'Dau dau mat ngu', 'Can theo doi huyet ap tai nha', 'Tinh trang on dinh', 'Roi loan tien dinh nhe', NULL, NULL, NULL),
    ('BN20260102', 'BS-TM-003', DATE '2026-03-27', TIME '09:00', 'COMPLETED', 'Kiem tra tim mach dinh ky', 'Tien su tang huyet ap', 'Huyet ap da kiem soat', 'Tang huyet ap do 1', NULL, NULL, NULL),
    ('BN20260103', 'BS-DALIEU-005', DATE '2026-03-27', TIME '13:30', 'COMPLETED', 'Noi man do ngua', 'Nghi viem da tiep xuc', 'Can tranh tac nhan kich ung', 'Viem da tiep xuc', NULL, NULL, NULL),
    ('BN20260104', 'BS-SAN-007', DATE '2026-04-02', TIME '08:00', 'CONFIRMED', 'Kham thai dinh ky', 'Thai tuan 16', NULL, NULL, NULL, NULL, NULL),
    ('BN20260105', 'BS-TAIMUIHONG-006', DATE '2026-04-02', TIME '08:30', 'PENDING', 'Dau hong keo dai', 'Kem nghen mui ve dem', NULL, NULL, NULL, NULL, NULL),
    ('BN20260106', 'BS-NGOAI-004', DATE '2026-04-03', TIME '09:00', 'CONFIRMED', 'Tai kham vet thuong sau mo', 'Tai kham lan 2', NULL, NULL, NULL, 'Doi lich tu 08:00 sang 09:00 theo yeu cau benh nhan', NULL),
    ('BN20260107', 'BS-THANKINH-009', DATE '2026-04-03', TIME '13:30', 'PENDING', 'Dau nua dau', 'Dau dau 2-3 lan moi tuan', NULL, NULL, NULL, NULL, NULL),
    ('BN20260108', 'BS-UNG-010', DATE '2026-04-04', TIME '08:00', 'CONFIRMED', 'Tu van tam soat ung thu vu', 'Gia dinh co tien su', NULL, NULL, NULL, NULL, NULL),
    ('BN20260109', 'BS-CDHA-008', DATE '2026-04-04', TIME '08:30', 'CANCELLED', 'Sieu am bung tong quat', 'Benh nhan ban cong tac', NULL, NULL, 'Ban khong den duoc theo lich', NULL, NULL),
    ('BN20260110', 'BS-NHI-002', DATE '2026-04-05', TIME '09:00', 'CANCELLED', 'Tre ho dem', 'Bac si xin doi lich do lich cong tac', NULL, NULL, NULL, NULL, 'Bac si de xuat doi lich sang 2026-04-06 09:00'),
    ('BN20260101', 'BS-TM-003', DATE '2026-04-05', TIME '13:30', 'PENDING', 'Hoi hop danh trong nguc', 'Xuat hien vao buoi toi', NULL, NULL, NULL, NULL, NULL)
)
INSERT INTO appointments (
  patient_id,
  doctor_id,
  department_id,
  slot_id,
  status,
  reason,
  notes,
  doctor_note,
  diagnosis,
  patient_cancel_reason,
  reschedule_note,
  doctor_response_reason
)
SELECT
  p.id,
  d.id,
  d.department_id,
  ds.id,
  a.status,
  a.reason,
  a.notes,
  a.doctor_note,
  a.diagnosis,
  a.patient_cancel_reason,
  a.reschedule_note,
  a.doctor_response_reason
FROM appointment_source a
INNER JOIN patients p ON p.patient_code = a.patient_code
INNER JOIN doctors d ON d.doctor_code = a.doctor_code
INNER JOIN doctor_slots ds
  ON ds.doctor_id = d.id
 AND ds.slot_date = a.slot_date
 AND ds.start_time = a.start_time
ON CONFLICT (slot_id) DO UPDATE
SET
  status = EXCLUDED.status,
  reason = EXCLUDED.reason,
  notes = EXCLUDED.notes,
  doctor_note = EXCLUDED.doctor_note,
  diagnosis = EXCLUDED.diagnosis,
  patient_cancel_reason = EXCLUDED.patient_cancel_reason,
  reschedule_note = EXCLUDED.reschedule_note,
  doctor_response_reason = EXCLUDED.doctor_response_reason,
  updated_at = NOW();

-- Keep slot availability consistent with appointment status
UPDATE doctor_slots ds
SET
  is_available = CASE WHEN a.status = 'CANCELLED' THEN TRUE ELSE FALSE END,
  updated_at = NOW()
FROM appointments a
WHERE a.slot_id = ds.id;

-- 11) Lab results
WITH lab_source (
  patient_code,
  test_code,
  test_name,
  result_summary,
  result_detail,
  conclusion,
  status,
  performed_at
) AS (
  VALUES
    ('BN20260101', 'LAB-CBC', 'Tong phan tich te bao mau', 'Chi so on dinh', 'Hong cau va bach cau trong gioi han tham chieu.', 'Tai kham dinh ky sau 6 thang.', 'COMPLETED', NOW() - INTERVAL '12 days'),
    ('BN20260102', 'LAB-LIPID', 'Mo mau', 'Cholesterol tang nhe', 'LDL tang nhe, can dieu chinh che do an.', 'Theo doi va tai kiem sau 3 thang.', 'COMPLETED', NOW() - INTERVAL '10 days'),
    ('BN20260103', 'LAB-GLU', 'Duong huyet', 'Duong huyet luc doi gioi han cao', 'Khuyen nghi theo doi them HbA1c.', 'Tu van dinh duong va van dong.', 'COMPLETED', NOW() - INTERVAL '9 days'),
    ('BN20260104', 'LAB-BHCG', 'Beta hCG', 'Phu hop tuoi thai', 'Chi so phu hop giai doan thai ky.', 'Tiep tuc theo doi thai ky dinh ky.', 'COMPLETED', NOW() - INTERVAL '2 days'),
    ('BN20260105', 'LAB-CRP', 'C-reactive protein', 'Dang cho ket qua', 'Mau da gui khoa xet nghiem.', NULL, 'PENDING', NULL)
)
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
  l.test_code,
  l.test_name,
  l.result_summary,
  l.result_detail,
  l.conclusion,
  l.status,
  l.performed_at
FROM lab_source l
INNER JOIN patients p ON p.patient_code = l.patient_code
WHERE NOT EXISTS (
  SELECT 1
  FROM lab_results lr
  WHERE lr.patient_id = p.id
    AND lr.test_code = l.test_code
    AND lr.performed_at IS NOT DISTINCT FROM l.performed_at
);

-- 12) Prescriptions (for completed appointments)
WITH prescription_source (
  patient_code,
  doctor_code,
  slot_date,
  start_time,
  diagnosis,
  medications,
  advice
) AS (
  VALUES
    (
      'BN20260001',
      'BS-NHI-002',
      DATE '2026-03-26',
      TIME '08:00',
      'Viem hong cap',
      '[{"medicineCode":"MED-PARA-500","medicineName":"Paracetamol 500mg","dosage":"1 vien","frequency":"2 lan/ngay","duration":"3 ngay","note":"Uong sau an"}]'::jsonb,
      'Uong nhieu nuoc am, tai kham neu sot tren 2 ngay.'
    ),
    (
      'BN20260101',
      'BS-NTQ-001',
      DATE '2026-03-26',
      TIME '08:30',
      'Roi loan tien dinh nhe',
      '[{"medicineCode":"MED-BETAHISTINE-16","medicineName":"Betahistine 16mg","dosage":"1 vien","frequency":"2 lan/ngay","duration":"7 ngay","note":"Khong dung chung voi ruou bia"}]'::jsonb,
      'Ngu som, han che thuc khuya, tai kham sau 7 ngay neu con trieu chung.'
    ),
    (
      'BN20260102',
      'BS-TM-003',
      DATE '2026-03-27',
      TIME '09:00',
      'Tang huyet ap do 1',
      '[{"medicineCode":"MED-AMLODIPINE-5","medicineName":"Amlodipine 5mg","dosage":"1 vien","frequency":"1 lan/ngay","duration":"30 ngay","note":"Do huyet ap moi sang"}]'::jsonb,
      'Tap the duc nhe 30 phut/ngay, an nhat va tai kham sau 1 thang.'
    ),
    (
      'BN20260103',
      'BS-DALIEU-005',
      DATE '2026-03-27',
      TIME '13:30',
      'Viem da tiep xuc',
      '[{"medicineCode":"MED-CETIRIZINE-10","medicineName":"Cetirizine 10mg","dosage":"1 vien","frequency":"1 lan buoi toi","duration":"5 ngay","note":"Tranh gaixuoc da"}]'::jsonb,
      'Tranh tiep xuc hoa chat kich ung, duong am da hang ngay.'
    )
)
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
  d.id,
  p.id,
  ps.diagnosis,
  ps.medications,
  ps.advice
FROM prescription_source ps
INNER JOIN patients p ON p.patient_code = ps.patient_code
INNER JOIN doctors d ON d.doctor_code = ps.doctor_code
INNER JOIN doctor_slots ds
  ON ds.doctor_id = d.id
 AND ds.slot_date = ps.slot_date
 AND ds.start_time = ps.start_time
INNER JOIN appointments a
  ON a.patient_id = p.id
 AND a.slot_id = ds.id
WHERE a.status = 'COMPLETED'
ON CONFLICT (appointment_id) DO UPDATE
SET
  diagnosis = EXCLUDED.diagnosis,
  medications = EXCLUDED.medications,
  advice = EXCLUDED.advice,
  updated_at = NOW();

-- 13) Payment transactions
WITH payment_source (
  invoice_code,
  patient_code,
  doctor_code,
  slot_date,
  start_time,
  amount,
  payment_method,
  status,
  paid_at
) AS (
  VALUES
    ('INV20260326001', 'BN20260001', 'BS-NHI-002', DATE '2026-03-26', TIME '08:00', 450000, 'EWALLET', 'PAID', NOW() - INTERVAL '11 days'),
    ('INV20260326002', 'BN20260101', 'BS-NTQ-001', DATE '2026-03-26', TIME '08:30', 500000, 'CARD', 'PAID', NOW() - INTERVAL '11 days'),
    ('INV20260327003', 'BN20260102', 'BS-TM-003', DATE '2026-03-27', TIME '09:00', 700000, 'BANK_TRANSFER', 'PAID', NOW() - INTERVAL '10 days'),
    ('INV20260327004', 'BN20260103', 'BS-DALIEU-005', DATE '2026-03-27', TIME '13:30', 550000, 'EWALLET', 'PAID', NOW() - INTERVAL '10 days'),
    ('INV20260402005', 'BN20260104', 'BS-SAN-007', DATE '2026-04-02', TIME '08:00', 800000, 'CARD', 'PENDING', NULL),
    ('INV20260403006', 'BN20260106', 'BS-NGOAI-004', DATE '2026-04-03', TIME '09:00', 650000, 'BANK_TRANSFER', 'PENDING', NULL),
    ('INV20260404007', 'BN20260108', 'BS-UNG-010', DATE '2026-04-04', TIME '08:00', 900000, 'CARD', 'PENDING', NULL),
    ('INV20260405008', 'BN20260101', 'BS-TM-003', DATE '2026-04-05', TIME '13:30', 700000, 'EWALLET', 'PENDING', NULL)
)
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
  p.id,
  ps.invoice_code,
  ps.amount,
  ps.payment_method,
  ps.status,
  ps.paid_at
FROM payment_source ps
INNER JOIN patients p ON p.patient_code = ps.patient_code
INNER JOIN doctors d ON d.doctor_code = ps.doctor_code
INNER JOIN doctor_slots ds
  ON ds.doctor_id = d.id
 AND ds.slot_date = ps.slot_date
 AND ds.start_time = ps.start_time
INNER JOIN appointments a
  ON a.patient_id = p.id
 AND a.slot_id = ds.id
ON CONFLICT (invoice_code) DO UPDATE
SET
  appointment_id = EXCLUDED.appointment_id,
  patient_id = EXCLUDED.patient_id,
  amount = EXCLUDED.amount,
  payment_method = EXCLUDED.payment_method,
  status = EXCLUDED.status,
  paid_at = EXCLUDED.paid_at,
  updated_at = NOW();

-- 14) Doctor reviews (only completed appointments)
WITH review_source (
  patient_code,
  doctor_code,
  slot_date,
  start_time,
  rating,
  comment
) AS (
  VALUES
    ('BN20260001', 'BS-NHI-002', DATE '2026-03-26', TIME '08:00', 5, 'Bac si tu van ro rang, be de hop tac.'),
    ('BN20260101', 'BS-NTQ-001', DATE '2026-03-26', TIME '08:30', 5, 'Kham ky, huong dan chi tiet.'),
    ('BN20260102', 'BS-TM-003', DATE '2026-03-27', TIME '09:00', 4, 'Thai do than thien, quy trinh nhanh.'),
    ('BN20260103', 'BS-DALIEU-005', DATE '2026-03-27', TIME '13:30', 4, 'Phac do de hieu, da giam kich ung sau 2 ngay.')
)
INSERT INTO doctor_reviews (appointment_id, doctor_id, patient_id, rating, comment)
SELECT
  a.id,
  d.id,
  p.id,
  rs.rating,
  rs.comment
FROM review_source rs
INNER JOIN patients p ON p.patient_code = rs.patient_code
INNER JOIN doctors d ON d.doctor_code = rs.doctor_code
INNER JOIN doctor_slots ds
  ON ds.doctor_id = d.id
 AND ds.slot_date = rs.slot_date
 AND ds.start_time = rs.start_time
INNER JOIN appointments a
  ON a.patient_id = p.id
 AND a.slot_id = ds.id
WHERE a.status = 'COMPLETED'
ON CONFLICT (appointment_id) DO UPDATE
SET
  rating = EXCLUDED.rating,
  comment = EXCLUDED.comment;

-- 15) Notifications
WITH notification_source (email, title, message, type) AS (
  VALUES
    ('patient.anh01@benhvien.vn', 'Nhac lich kham', 'Ban co lich kham vao ngay 2026-04-05 luc 13:30.', 'BOOKING_REMINDER'),
    ('patient.anh04@benhvien.vn', 'Xac nhan lich kham', 'Lich kham khoa San da duoc xac nhan.', 'BOOKING_CONFIRMED'),
    ('patient.anh09@benhvien.vn', 'Lich kham da huy', 'Lich kham ngay 2026-04-04 da duoc huy theo yeu cau.', 'BOOKING_CANCELLED'),
    ('doctor.timmach@benhvien.vn', 'Co lich hen moi', 'Ban vua nhan them mot lich kham tim mach.', 'NEW_BOOKING'),
    ('doctor.ngoaikhoa@benhvien.vn', 'Benh nhan doi lich', 'Mot benh nhan vua doi lich sang 09:00.', 'BOOKING_RESCHEDULED'),
    ('staff.tiepnhan@benhvien.vn', 'Tong hop trong ngay', 'He thong da cap nhat danh sach lich hen trong ngay.', 'SYSTEM')
)
INSERT INTO notifications (user_id, title, message, type)
SELECT
  u.id,
  ns.title,
  ns.message,
  ns.type
FROM notification_source ns
INNER JOIN users u ON u.email = ns.email
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications n
  WHERE n.user_id = u.id
    AND n.title = ns.title
    AND n.message = ns.message
);

-- 16) Contact messages
WITH contact_source (full_name, phone_number, email, subject, message) AS (
  VALUES
    ('Hoang Gia Bao', '0909550001', 'gia.bao@email.com', 'Hoi ve quy trinh dat lich', 'Toi muon biet cach doi lich hen tren website.'),
    ('Le Minh Chau', '0909550002', 'minh.chau@email.com', 'Hoi ve bao hiem y te', 'Benh vien co ap dung BHYT trai tuyen khong?'),
    ('Pham Thanh Son', '0909550003', 'thanh.son@email.com', 'Gop y giao dien', 'Trang dat lich de dung, mong co them bo loc theo bac si.'),
    ('Tran Van Khoa', NULL, 'khoa.tran@email.com', 'Yeu cau tu van', 'Xin duoc goi lai tu van tam soat tim mach.')
)
INSERT INTO contact_messages (full_name, phone_number, email, subject, message)
SELECT
  cs.full_name,
  cs.phone_number,
  cs.email,
  cs.subject,
  cs.message
FROM contact_source cs
WHERE NOT EXISTS (
  SELECT 1
  FROM contact_messages cm
  WHERE cm.full_name = cs.full_name
    AND cm.subject = cs.subject
    AND cm.message = cs.message
);

-- 17) Medicines
WITH medicine_source (code, name, unit, description, is_active) AS (
  VALUES
    ('MED-BETAHISTINE-16', 'Betahistine 16mg', 'Vien', 'Ho tro dieu tri roi loan tien dinh', TRUE),
    ('MED-AMLODIPINE-5', 'Amlodipine 5mg', 'Vien', 'Ho tro dieu tri tang huyet ap', TRUE),
    ('MED-CETIRIZINE-10', 'Cetirizine 10mg', 'Vien', 'Giam trieu chung di ung', TRUE),
    ('MED-OMEPRAZOLE-20', 'Omeprazole 20mg', 'Vien', 'Ho tro dieu tri benh ly da day', TRUE)
)
INSERT INTO medicines (code, name, unit, description, is_active)
SELECT code, name, unit, description, is_active
FROM medicine_source
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 18) Lab test catalog
WITH lab_catalog_source (code, name, description, is_active) AS (
  VALUES
    ('LAB-BHCG', 'Beta hCG', 'Xet nghiem theo doi thai ky', TRUE),
    ('LAB-CRP', 'C-reactive protein', 'Danh gia tinh trang viem', TRUE),
    ('LAB-TSH', 'TSH', 'Danh gia chuc nang tuyen giap', TRUE),
    ('LAB-HBA1C', 'HbA1c', 'Theo doi duong huyet trung binh 3 thang', TRUE)
)
INSERT INTO lab_test_catalog (code, name, description, is_active)
SELECT code, name, description, is_active
FROM lab_catalog_source
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 19) System settings
INSERT INTO system_settings (key, value, description)
VALUES
  (
    'hospital_working_hours',
    '{"weekdays":"07:00-17:30","saturday":"07:00-12:00","sunday":"off"}'::jsonb,
    'Khung gio lam viec mac dinh'
  ),
  (
    'payment_gateway',
    '{"provider":"MOCK_PAY","enabled":true,"currency":"VND","sandbox":true}'::jsonb,
    'Cau hinh cong thanh toan mo phong'
  ),
  (
    'notification_channel',
    '{"email":true,"sms":true,"push":false}'::jsonb,
    'Kenh gui thong bao nhac lich'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

COMMIT;
