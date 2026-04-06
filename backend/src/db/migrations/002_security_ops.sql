CREATE TABLE IF NOT EXISTS auth_login_attempts (
  email VARCHAR(255) PRIMARY KEY,
  failed_count INT NOT NULL DEFAULT 0,
  first_failed_at TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT auth_login_attempts_failed_count_check CHECK (failed_count >= 0)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(120) NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  actor_role VARCHAR(30),
  target_type VARCHAR(80),
  target_id VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
  ip_address VARCHAR(64),
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_logs_status_check CHECK (status IN ('SUCCESS', 'FAILED'))
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_jobs_channel_check CHECK (channel IN ('EMAIL', 'SMS', 'PUSH')),
  CONSTRAINT notification_jobs_status_check CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
  CONSTRAINT notification_jobs_attempt_count_check CHECK (attempt_count >= 0),
  CONSTRAINT notification_jobs_max_attempts_check CHECK (max_attempts > 0),
  CONSTRAINT uq_notification_jobs_notification_channel UNIQUE (notification_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_auth_login_attempts_locked_until
  ON auth_login_attempts(locked_until);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user_id
  ON audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_retry
  ON notification_jobs(status, next_retry_at, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_user_id
  ON notification_jobs(user_id);

DROP TRIGGER IF EXISTS trg_auth_login_attempts_updated_at ON auth_login_attempts;
CREATE TRIGGER trg_auth_login_attempts_updated_at
BEFORE UPDATE ON auth_login_attempts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_notification_jobs_updated_at ON notification_jobs;
CREATE TRIGGER trg_notification_jobs_updated_at
BEFORE UPDATE ON notification_jobs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION enqueue_notification_jobs()
RETURNS TRIGGER AS $$
DECLARE
  channels JSONB;
  email_enabled BOOLEAN;
  sms_enabled BOOLEAN;
  push_enabled BOOLEAN;
BEGIN
  SELECT value
  INTO channels
  FROM system_settings
  WHERE key = 'notification_channel'
  LIMIT 1;

  IF channels IS NULL THEN
    channels := '{"email":true,"sms":false,"push":false}'::jsonb;
  END IF;

  email_enabled := COALESCE((channels ->> 'email')::boolean, false);
  sms_enabled := COALESCE((channels ->> 'sms')::boolean, false);
  push_enabled := COALESCE((channels ->> 'push')::boolean, false);

  IF email_enabled THEN
    INSERT INTO notification_jobs (
      notification_id,
      user_id,
      channel,
      status,
      next_retry_at
    )
    VALUES (NEW.id, NEW.user_id, 'EMAIL', 'PENDING', NOW())
    ON CONFLICT (notification_id, channel) DO NOTHING;
  END IF;

  IF sms_enabled THEN
    INSERT INTO notification_jobs (
      notification_id,
      user_id,
      channel,
      status,
      next_retry_at
    )
    VALUES (NEW.id, NEW.user_id, 'SMS', 'PENDING', NOW())
    ON CONFLICT (notification_id, channel) DO NOTHING;
  END IF;

  IF push_enabled THEN
    INSERT INTO notification_jobs (
      notification_id,
      user_id,
      channel,
      status,
      next_retry_at
    )
    VALUES (NEW.id, NEW.user_id, 'PUSH', 'PENDING', NOW())
    ON CONFLICT (notification_id, channel) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notifications_enqueue_jobs ON notifications;
CREATE TRIGGER trg_notifications_enqueue_jobs
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION enqueue_notification_jobs();
