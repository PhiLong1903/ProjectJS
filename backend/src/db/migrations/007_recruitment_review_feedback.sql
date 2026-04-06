ALTER TABLE recruitment_applications
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE recruitment_applications
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE recruitment_applications
ADD COLUMN IF NOT EXISTS feedback_message TEXT;

ALTER TABLE recruitment_applications
ADD COLUMN IF NOT EXISTS feedback_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_recruitment_applications_reviewed_at
  ON recruitment_applications(reviewed_at DESC);