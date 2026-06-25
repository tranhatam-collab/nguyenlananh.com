-- 2FA (TOTP) schema for nguyenlananh.com
-- Apply with: wrangler d1 execute nguyenlananh-payments-prod --remote --file=./database/add_2fa_turnstile.sql

-- 2FA columns on users table
ALTER TABLE users ADD COLUMN otp_secret TEXT;
ALTER TABLE users ADD COLUMN otp_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN otp_backup_codes TEXT; -- JSON array of hashed codes
ALTER TABLE users ADD COLUMN otp_enabled_at TEXT;

-- Turnstile verification log (optional, for audit)
CREATE TABLE IF NOT EXISTS turnstile_verifications (
  id TEXT PRIMARY KEY,
  ip TEXT,
  action TEXT,
  success INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
