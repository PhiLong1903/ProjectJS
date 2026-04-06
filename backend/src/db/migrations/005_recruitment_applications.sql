CREATE TABLE IF NOT EXISTS recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  address VARCHAR(255),
  applied_position VARCHAR(180) NOT NULL,
  years_experience INT,
  current_workplace VARCHAR(180),
  expected_salary VARCHAR(120),
  cover_letter TEXT,
  cv_original_name VARCHAR(255) NOT NULL,
  cv_storage_path TEXT NOT NULL,
  cv_mime_type VARCHAR(120) NOT NULL,
  cv_size_bytes INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recruitment_applications_years_experience_check CHECK (
    years_experience IS NULL OR years_experience >= 0
  ),
  CONSTRAINT recruitment_applications_cv_size_check CHECK (cv_size_bytes > 0),
  CONSTRAINT recruitment_applications_status_check CHECK (
    status IN ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED')
  )
);

CREATE INDEX IF NOT EXISTS idx_recruitment_applications_created_at
  ON recruitment_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recruitment_applications_status
  ON recruitment_applications(status);

CREATE INDEX IF NOT EXISTS idx_recruitment_applications_is_deleted
  ON recruitment_applications(is_deleted);

DROP TRIGGER IF EXISTS trg_recruitment_applications_updated_at ON recruitment_applications;
CREATE TRIGGER trg_recruitment_applications_updated_at
BEFORE UPDATE ON recruitment_applications
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
