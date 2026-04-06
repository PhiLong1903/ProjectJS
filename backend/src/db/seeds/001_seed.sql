-- Lưu ý: thay hash bên dưới nếu bạn muốn đổi mật khẩu mặc định.
-- Admin mặc định: admin@benhvien.vn / Admin@123
-- Bác sĩ mặc định: doctor@benhvien.vn / Doctor@123
-- Bệnh nhân mặc định: patient@benhvien.vn / Patient@123

INSERT INTO roles (name, description)
VALUES
  ('ADMIN', 'Quản trị hệ thống CMS và dữ liệu y tế'),
  ('DOCTOR', 'Bác sĩ điều trị'),
  ('PATIENT', 'Bệnh nhân sử dụng cổng đặt lịch'),
  ('STAFF', 'Nhân viên tiếp nhận')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, full_name, password_hash)
VALUES
  ('admin@benhvien.vn', 'Quản trị hệ thống', '$2a$10$kUfKp1pgu9OjnYUJbsI7i.nvxviPFNRl9/J29.5k8CgAQbN0lWava'),
  ('doctor@benhvien.vn', 'BS.CKI Lê Thị Thu Hà', '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze'),
  ('patient@benhvien.vn', 'Nguyễn Văn A', '$2a$10$Zfra/h65clR2gPKwrgFf7eupNY/YvJ8l0Z3wJNHvKXd1BOUSGutCe')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'ADMIN'
WHERE u.email = 'admin@benhvien.vn'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'DOCTOR'
WHERE u.email = 'doctor@benhvien.vn'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN roles r ON r.name = 'PATIENT'
WHERE u.email = 'patient@benhvien.vn'
ON CONFLICT DO NOTHING;

INSERT INTO patients (user_id, patient_code, phone_number, date_of_birth, gender, address)
SELECT u.id, 'BN20260001', '0901234567', DATE '1998-09-10', 'Nam', 'Thủ Đức, TP.HCM'
FROM users u
WHERE u.email = 'patient@benhvien.vn'
ON CONFLICT (patient_code) DO NOTHING;

INSERT INTO departments (name, slug, description, location, phone)
VALUES
  ('Khoa Nội tổng quát', 'khoa-noi-tong-quat', 'Khám và điều trị bệnh lý nội khoa cho người lớn.', 'Tầng 2 - Khu A', '02838901234'),
  ('Khoa Ngoại tổng quát', 'khoa-ngoai-tong-quat', 'Phẫu thuật và điều trị ngoại khoa toàn diện.', 'Tầng 3 - Khu B', '02838905678'),
  ('Khoa Nhi', 'khoa-nhi', 'Chăm sóc sức khỏe trẻ em từ sơ sinh đến 15 tuổi.', 'Tầng 4 - Khu C', '02838907777'),
  ('Khoa Tim mạch', 'khoa-tim-mach', 'Tầm soát và điều trị bệnh tim mạch chuyên sâu.', 'Tầng 5 - Khu A', '02838908888')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO doctors (doctor_code, full_name, specialty, department_id, experience_years, description)
SELECT
  'BS-NTQ-001',
  'BS.CKII Trần Minh Tâm',
  'Nội tiết - Nội tổng quát',
  d.id,
  15,
  'Chuyên gia điều trị bệnh lý nội tiết và chuyển hóa.'
FROM departments d
WHERE d.slug = 'khoa-noi-tong-quat'
ON CONFLICT (doctor_code) DO NOTHING;

INSERT INTO doctors (doctor_code, full_name, specialty, department_id, experience_years, description)
SELECT
  'BS-NHI-002',
  'BS.CKI Lê Thị Thu Hà',
  'Nhi hô hấp',
  d.id,
  10,
  'Bác sĩ chuyên sâu về bệnh hô hấp ở trẻ em.'
FROM departments d
WHERE d.slug = 'khoa-nhi'
ON CONFLICT (doctor_code) DO NOTHING;

UPDATE doctors
SET qualifications = 'CKI Nhi khoa, Chứng chỉ Nội soi hô hấp nhi'
WHERE doctor_code = 'BS-NHI-002'
  AND (qualifications IS NULL OR qualifications = '');

UPDATE doctors
SET qualifications = 'CKII Nội tổng quát, Chứng chỉ Nội tiết'
WHERE doctor_code = 'BS-NTQ-001'
  AND (qualifications IS NULL OR qualifications = '');

UPDATE doctors d
SET user_id = u.id
FROM users u
WHERE d.doctor_code = 'BS-NHI-002'
  AND u.email = 'doctor@benhvien.vn'
  AND (d.user_id IS DISTINCT FROM u.id);

INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time)
SELECT id, DATE '2026-04-01', TIME '08:00', TIME '08:30'
FROM doctors
WHERE doctor_code = 'BS-NTQ-001'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time)
SELECT id, DATE '2026-04-01', TIME '08:30', TIME '09:00'
FROM doctors
WHERE doctor_code = 'BS-NTQ-001'
ON CONFLICT DO NOTHING;

INSERT INTO doctor_slots (doctor_id, slot_date, start_time, end_time)
SELECT id, DATE '2026-04-02', TIME '09:00', TIME '09:30'
FROM doctors
WHERE doctor_code = 'BS-NHI-002'
ON CONFLICT DO NOTHING;

-- Bo sung them bac si de moi khoa co toi thieu 3-4 nguoi
WITH doctor_seed (
  doctor_code,
  full_name,
  specialty,
  department_slug,
  experience_years,
  description
) AS (
  VALUES
    ('BS-NTQ-101', 'BS.CKII Pham Quoc An', 'Noi tong quat', 'khoa-noi-tong-quat', 12, 'Theo doi benh noi khoa man tinh cho nguoi lon.'),
    ('BS-NTQ-102', 'BS.CKI Nguyen Thi Thu', 'Noi tieu hoa', 'khoa-noi-tong-quat', 9, 'Chan doan va dieu tri benh ly tieu hoa.'),
    ('BS-NTQ-103', 'BS.CKI Tran Minh Tri', 'Noi ho hap', 'khoa-noi-tong-quat', 8, 'Theo doi hen phe quan va benh pho co tac.'),
    ('BS-NGOAI-201', 'BS.CKII Doan Hai Nam', 'Ngoai tong quat', 'khoa-ngoai-tong-quat', 14, 'Phau thuat tong quat va theo doi sau mo.'),
    ('BS-NGOAI-202', 'BS.CKI Le Van Dung', 'Ngoai tieu hoa', 'khoa-ngoai-tong-quat', 10, 'Phau thuat noi soi duong tieu hoa.'),
    ('BS-NGOAI-203', 'BS.CKI Bui Thi Yen', 'Ngoai chan thuong', 'khoa-ngoai-tong-quat', 9, 'Dieu tri chan thuong phan mem va vet thuong.'),
    ('BS-NHI-301', 'BS.CKII Vu Hoang Lan', 'Nhi tong quat', 'khoa-nhi', 13, 'Kham nhi tong quat va tu van dinh duong.'),
    ('BS-NHI-302', 'BS.CKI Phan Duc Minh', 'Nhi tieu hoa', 'khoa-nhi', 8, 'Theo doi benh ly tieu hoa tre em.'),
    ('BS-NHI-303', 'BS.CKI Dang Thu Trang', 'Nhi ho hap', 'khoa-nhi', 7, 'Dieu tri benh ho hap thuong gap o tre.'),
    ('BS-TM-401', 'BS.CKII Nguyen Quang Long', 'Tim mach', 'khoa-tim-mach', 15, 'Theo doi benh mach vanh va tang huyet ap.'),
    ('BS-TM-402', 'BS.CKI Hoang Thi Mai', 'Tim mach can thiep', 'khoa-tim-mach', 11, 'Tu van va theo doi sau can thiep mach vanh.'),
    ('BS-TM-403', 'BS.CKI Truong Gia Bao', 'Roi loan nhip tim', 'khoa-tim-mach', 9, 'Danh gia va dieu tri roi loan nhip tim.')
)
INSERT INTO doctors (
  doctor_code,
  full_name,
  specialty,
  department_id,
  experience_years,
  description,
  is_active
)
SELECT
  ds.doctor_code,
  ds.full_name,
  ds.specialty,
  d.id,
  ds.experience_years,
  ds.description,
  TRUE
FROM doctor_seed ds
INNER JOIN departments d ON d.slug = ds.department_slug
ON CONFLICT (doctor_code) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  specialty = EXCLUDED.specialty,
  department_id = EXCLUDED.department_id,
  experience_years = EXCLUDED.experience_years,
  description = EXCLUDED.description,
  is_active = TRUE,
  is_deleted = FALSE,
  updated_at = NOW();

-- Neu khoa nao van chua du 3 bac si thi tu dong bo sung du lieu demo
WITH department_pool AS (
  SELECT id, slug
  FROM departments
  WHERE is_deleted = FALSE
),
doctor_count AS (
  SELECT department_id, COUNT(*)::int AS total
  FROM doctors
  WHERE is_deleted = FALSE
  GROUP BY department_id
),
gap AS (
  SELECT
    dp.id AS department_id,
    dp.slug,
    GREATEST(0, 3 - COALESCE(dc.total, 0)) AS missing
  FROM department_pool dp
  LEFT JOIN doctor_count dc ON dc.department_id = dp.id
),
auto_seed AS (
  SELECT
    g.department_id,
    g.slug,
    gs AS local_seq,
    ROW_NUMBER() OVER (ORDER BY g.slug, gs) AS global_seq
  FROM gap g
  INNER JOIN generate_series(1, 3) gs ON gs <= g.missing
)
INSERT INTO doctors (
  doctor_code,
  full_name,
  specialty,
  department_id,
  experience_years,
  description,
  is_active
)
SELECT
  CONCAT('BS-AUTO-', LPAD(global_seq::text, 4, '0')),
  CONCAT('BS Bo sung ', INITCAP(REPLACE(slug, '-', ' ')), ' ', local_seq),
  INITCAP(REPLACE(slug, '-', ' ')),
  department_id,
  6 + local_seq,
  'Bac si bo sung de demo dat lich kham',
  TRUE
FROM auto_seed
ON CONFLICT (doctor_code) DO NOTHING;

-- Xoa toan bo tai khoan bac si cu va tao lai tai khoan cho tat ca bac si hien co
WITH doctor_users_to_delete AS (
  SELECT DISTINCT u.id
  FROM users u
  INNER JOIN user_roles ur ON ur.user_id = u.id
  INNER JOIN roles r ON r.id = ur.role_id
  WHERE r.name = 'DOCTOR'
)
DELETE FROM users u
USING doctor_users_to_delete d
WHERE u.id = d.id;

WITH doctor_account_source AS (
  SELECT
    d.id AS doctor_id,
    LOWER(
      'doctor.' || REGEXP_REPLACE(d.doctor_code, '[^a-zA-Z0-9]+', '', 'g') || '@benhvien.vn'
    ) AS email,
    d.full_name
  FROM doctors d
  WHERE d.is_deleted = FALSE
),
upsert_doctor_users AS (
  INSERT INTO users (
    email,
    full_name,
    password_hash,
    is_active
  )
  SELECT
    src.email,
    src.full_name,
    '$2a$10$tPkb14ci7s25ZDfYzXatau07.c5en9QMS3kOFhJwKVHvow.jEkoze', -- Doctor@123
    TRUE
  FROM doctor_account_source src
  ON CONFLICT (email) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE,
    is_deleted = FALSE,
    updated_at = NOW()
  RETURNING id, email
),
all_doctor_users AS (
  SELECT id, email
  FROM upsert_doctor_users
  UNION
  SELECT u.id, u.email
  FROM users u
  INNER JOIN doctor_account_source src ON src.email = u.email
),
doctor_user_map AS (
  SELECT
    src.doctor_id,
    u.id AS user_id
  FROM doctor_account_source src
  INNER JOIN all_doctor_users u ON u.email = src.email
)
UPDATE doctors d
SET
  user_id = m.user_id,
  is_active = TRUE,
  is_deleted = FALSE,
  updated_at = NOW()
FROM doctor_user_map m
WHERE d.id = m.doctor_id;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
INNER JOIN doctors d ON d.user_id = u.id
INNER JOIN roles r ON r.name = 'DOCTOR'
WHERE d.is_deleted = FALSE
ON CONFLICT DO NOTHING;

-- Tao khung gio kham tu ngay hien tai tro di de dat lich duoc ngay
WITH doctor_pool AS (
  SELECT id
  FROM doctors
  WHERE is_active = TRUE
    AND is_deleted = FALSE
),
date_pool AS (
  SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '14 day', INTERVAL '1 day')::date AS slot_date
),
time_pool AS (
  SELECT *
  FROM (
    VALUES
      (TIME '08:00', TIME '08:30'),
      (TIME '08:30', TIME '09:00'),
      (TIME '09:00', TIME '09:30'),
      (TIME '09:30', TIME '10:00'),
      (TIME '13:30', TIME '14:00'),
      (TIME '14:00', TIME '14:30')
  ) AS t(start_time, end_time)
)
INSERT INTO doctor_slots (
  doctor_id,
  slot_date,
  start_time,
  end_time,
  is_available,
  is_deleted
)
SELECT
  d.id,
  dp.slot_date,
  tp.start_time,
  tp.end_time,
  TRUE,
  FALSE
FROM doctor_pool d
CROSS JOIN date_pool dp
CROSS JOIN time_pool tp
ON CONFLICT (doctor_id, slot_date, start_time, end_time) DO UPDATE
SET
  is_available = TRUE,
  is_deleted = FALSE,
  updated_at = NOW();

INSERT INTO medical_services (service_code, name, slug, short_description, description, price_from)
VALUES
  ('DV-KSK-001', 'Gói khám sức khỏe tổng quát', 'goi-kham-suc-khoe-tong-quat', 'Gói khám định kỳ cho cá nhân và doanh nghiệp.', 'Bao gồm xét nghiệm máu, nước tiểu, siêu âm bụng, X-quang ngực.', 1200000),
  ('DV-TM-002', 'Tầm soát tim mạch', 'tam-soat-tim-mach', 'Đánh giá nguy cơ tim mạch toàn diện.', 'Khám chuyên khoa tim mạch, điện tim, siêu âm tim, xét nghiệm mỡ máu.', 1800000),
  ('DV-NHI-003', 'Khám nhi tổng quát', 'kham-nhi-tong-quat', 'Khám sức khỏe định kỳ cho trẻ em.', 'Theo dõi tăng trưởng, tư vấn dinh dưỡng, tầm soát bệnh lý thường gặp.', 450000)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO news_articles (title, slug, summary, content, is_published, published_at)
VALUES
  (
    'Triển khai hệ thống đặt lịch khám trực tuyến 24/7',
    'trien-khai-he-thong-dat-lich-kham-truc-tuyen-24-7',
    'Bệnh viện chính thức vận hành cổng E-Health Booking cho người dân.',
    'Người bệnh có thể chủ động chọn khoa, bác sĩ và khung giờ phù hợp ngay trên website. Hệ thống giúp giảm thời gian chờ đợi và tăng trải nghiệm khám chữa bệnh.',
    TRUE,
    NOW()
  ),
  (
    'Khuyến cáo phòng bệnh hô hấp mùa nắng nóng',
    'khuyen-cao-phong-benh-ho-hap-mua-nang-nong',
    'Bác sĩ khoa Nhi đưa ra hướng dẫn phòng bệnh cho trẻ nhỏ.',
    'Phụ huynh cần duy trì môi trường sống thông thoáng, bổ sung đủ nước và đưa trẻ đi khám sớm khi có dấu hiệu sốt kéo dài, ho nhiều hoặc khó thở.',
    TRUE,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;

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
  'XN-MAU-001',
  'Tổng phân tích tế bào máu ngoại vi',
  'Chỉ số trong giới hạn cho phép',
  'Hồng cầu, bạch cầu, tiểu cầu ổn định. Không ghi nhận bất thường đáng kể.',
  'Theo dõi định kỳ mỗi 6 tháng.',
  'COMPLETED',
  NOW() - INTERVAL '2 days'
FROM patients p
WHERE p.patient_code = 'BN20260001'
  AND NOT EXISTS (
    SELECT 1
    FROM lab_results lr
    WHERE lr.test_code = 'XN-MAU-001'
      AND lr.patient_id = p.id
  );

INSERT INTO cms_pages (page_key, title, content)
VALUES
  (
    'about-us',
    'Giới thiệu bệnh viện',
    '{"vision":"Trở thành bệnh viện đa khoa chuẩn số hóa", "mission":"Lấy người bệnh làm trung tâm"}'::jsonb
  ),
  (
    'patient-guide',
    'Hướng dẫn người bệnh',
    '{"steps":["Đăng ký tài khoản","Đặt lịch trực tuyến","Đến khám đúng giờ"]}'::jsonb
  ),
  (
    'contact',
    'Liên hệ',
    '{"hotline":"1900 1234", "email":"cskh@benhvien.vn"}'::jsonb
  )
ON CONFLICT (page_key) DO NOTHING;

INSERT INTO medicines (code, name, unit, description, is_active)
VALUES
  ('MED-PARA-500', 'Paracetamol 500mg', 'Viên', 'Giảm đau, hạ sốt', TRUE),
  ('MED-AMOX-500', 'Amoxicillin 500mg', 'Viên', 'Kháng sinh phổ rộng', TRUE),
  ('MED-ORS-01', 'Oresol', 'Gói', 'Bù điện giải', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO lab_test_catalog (code, name, description, is_active)
VALUES
  ('LAB-CBC', 'Tổng phân tích tế bào máu', 'Đánh giá số lượng hồng cầu, bạch cầu, tiểu cầu', TRUE),
  ('LAB-GLU', 'Đường huyết', 'Đánh giá glucose máu', TRUE),
  ('LAB-LIPID', 'Mỡ máu', 'Đánh giá Cholesterol và Triglyceride', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_settings (key, value, description)
VALUES
  ('hospital_working_hours', '{"weekdays":"07:00-17:00","saturday":"07:00-11:30","sunday":"off"}'::jsonb, 'Khung giờ làm việc chung của bệnh viện'),
  ('payment_gateway', '{"provider":"MOCK_PAY","enabled":true,"currency":"VND"}'::jsonb, 'Cấu hình cổng thanh toán trực tuyến'),
  ('notification_channel', '{"email":true,"sms":false,"push":false}'::jsonb, 'Cấu hình hệ thống nhắc lịch')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO notifications (user_id, title, message, type)
SELECT u.id, 'Nhắc lịch khám', 'Bạn có lịch khám vào ngày 2026-04-01. Vui lòng đến trước 15 phút.', 'BOOKING_REMINDER'
FROM users u
WHERE u.email = 'patient@benhvien.vn'
  AND NOT EXISTS (
    SELECT 1
    FROM notifications n
    WHERE n.user_id = u.id
      AND n.title = 'Nhắc lịch khám'
  );

