-- ============================================================
-- Admin RBAC schema — nguyenlananh.com
-- Per-user admin login + role-based access control
-- ============================================================

-- Admin users (separate from public users table)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'content_editor'
    CHECK (role IN ('super_admin', 'ops_manager', 'finance', 'content_editor')),
  display_name TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_login_at TEXT,
  last_login_ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);

-- Admin sessions (server-side, revocable)
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  user_agent TEXT,
  revoked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Audit log — every admin action
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL DEFAULT '',
  resource_id TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- ============================================================
-- Permission matrix (enforced in code, documented here)
-- ============================================================
-- Permission          | super_admin | ops_manager | finance | content_editor
-- --------------------+-------------+-------------+---------+---------------
-- dashboard.view      |     ✅      |     ✅      |   ✅    |      ✅
-- content.view        |     ✅      |     ✅      |   ✅    |      ✅
-- content.manage      |     ✅      |     ❌      |   ❌    |      ✅
-- content.image       |     ✅      |     ❌      |   ❌    |      ✅
-- members.view        |     ✅      |     ✅      |   ✅    |      ❌
-- members.manage      |     ✅      |     ✅      |   ❌    |      ❌
-- payments.view       |     ✅      |     ✅      |   ✅    |      ❌
-- payments.confirm    |     ✅      |     ✅      |   ✅    |      ❌
-- payments.refund     |     ✅      |     ❌      |   ✅    |      ❌
-- settings.view       |     ✅      |     ✅      |   ❌    |      ❌
-- settings.manage     |     ✅      |     ❌      |   ❌    |      ❌
-- admin_users.manage  |     ✅      |     ❌      |   ❌    |      ❌
-- ops.queue           |     ✅      |     ✅      |   ❌    |      ❌
-- audit.view          |     ✅      |     ✅      |   ❌    |      ❌
