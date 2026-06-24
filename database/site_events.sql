-- ============================================================
-- Site Events — unified event log cho toàn bộ website
-- ============================================================
-- Bắt mọi event: request, auth, payment, email, error, admin, content
-- Tự động ghi qua middleware (không phụ thuộc code mỗi endpoint)

CREATE TABLE IF NOT EXISTS site_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  level TEXT NOT NULL DEFAULT 'info',          -- info | warn | error | critical
  category TEXT NOT NULL DEFAULT 'request',    -- request | auth | payment | email | admin | content | webhook | system
  action TEXT NOT NULL DEFAULT '',             -- login | logout | order_created | payment_confirmed | email_sent | ...
  method TEXT NOT NULL DEFAULT '',             -- GET | POST | PATCH | DELETE
  path TEXT NOT NULL DEFAULT '',               -- /api/admin/users
  status INTEGER NOT NULL DEFAULT 0,           -- HTTP status code
  duration_ms INTEGER NOT NULL NULL DEFAULT 0, -- Request duration
  user_email TEXT NOT NULL DEFAULT '',         -- Email của user (nếu có session)
  admin_email TEXT NOT NULL DEFAULT '',        -- Email của admin (nếu admin session)
  ip TEXT NOT NULL DEFAULT '',                 -- Client IP
  user_agent TEXT NOT NULL DEFAULT '',         -- User-Agent (truncated)
  country TEXT NOT NULL DEFAULT '',            -- Country (from CF-IPCountry)
  detail TEXT NOT NULL DEFAULT '',             -- JSON detail (error message, metadata, etc.)
  request_id TEXT NOT NULL DEFAULT ''          -- Unique request ID for tracing
);

CREATE INDEX IF NOT EXISTS idx_site_events_ts ON site_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_site_events_level ON site_events(level);
CREATE INDEX IF NOT EXISTS idx_site_events_category ON site_events(category);
CREATE INDEX IF NOT EXISTS idx_site_events_action ON site_events(action);
CREATE INDEX IF NOT EXISTS idx_site_events_status ON site_events(status);
CREATE INDEX IF NOT EXISTS idx_site_events_path ON site_events(path);
CREATE INDEX IF NOT EXISTS idx_site_events_user ON site_events(user_email);
CREATE INDEX IF NOT EXISTS idx_site_events_admin ON site_events(admin_email);

-- ============================================================
-- Error tracking — chi tiết mọi error 4xx/5xx
-- ============================================================
CREATE TABLE IF NOT EXISTS site_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  request_id TEXT NOT NULL DEFAULT '',
  status INTEGER NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  path TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  stack TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  user_email TEXT NOT NULL DEFAULT '',
  admin_email TEXT NOT NULL DEFAULT '',
  request_body TEXT NOT NULL DEFAULT '',       -- Truncated request body for debugging
  resolved INTEGER NOT NULL DEFAULT 0,
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_errors_ts ON site_errors(ts DESC);
CREATE INDEX IF NOT EXISTS idx_site_errors_status ON site_errors(status);
CREATE INDEX IF NOT EXISTS idx_site_errors_code ON site_errors(code);
CREATE INDEX IF NOT EXISTS idx_site_errors_resolved ON site_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_site_errors_request ON site_errors(request_id);
