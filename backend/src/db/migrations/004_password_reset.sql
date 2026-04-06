ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token CHAR(64);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
  ON users(password_reset_token);

CREATE INDEX IF NOT EXISTS idx_users_password_reset_expires
  ON users(password_reset_expires);
