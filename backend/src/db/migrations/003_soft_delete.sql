ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE doctor_slots ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE lab_test_catalog ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_departments_is_deleted ON departments(is_deleted);
CREATE INDEX IF NOT EXISTS idx_doctors_is_deleted ON doctors(is_deleted);
CREATE INDEX IF NOT EXISTS idx_doctor_slots_is_deleted ON doctor_slots(is_deleted);
CREATE INDEX IF NOT EXISTS idx_medical_services_is_deleted ON medical_services(is_deleted);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_deleted ON news_articles(is_deleted);
CREATE INDEX IF NOT EXISTS idx_lab_results_is_deleted ON lab_results(is_deleted);
CREATE INDEX IF NOT EXISTS idx_medicines_is_deleted ON medicines(is_deleted);
CREATE INDEX IF NOT EXISTS idx_lab_test_catalog_is_deleted ON lab_test_catalog(is_deleted);
