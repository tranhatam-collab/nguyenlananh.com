-- Nguyenlananh.com — 10-product chain schema (additive, non-breaking)
-- Apply: wrangler d1 execute nguyenlananh-payments-prod --remote \
--          --file=./docs/migrations/2026-06-03-products-entitlements.sql
-- Account: 62d57eaa548617aeecac766e5a1cb98e  ·  DB: nguyenlananh-payments-prod
-- All statements are IF NOT EXISTS / nullable — safe to re-run.

-- Catalog: source of truth for price + access grant per product
CREATE TABLE IF NOT EXISTS products (
  code TEXT PRIMARY KEY,             -- 'p1_37ngay', 'p2_workbook', ...
  title TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'one_time' | 'subscription' | 'high_ticket'
  price_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  access_grant TEXT,                 -- entitlement key granted on purchase
  active INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Entitlements: what a user can access
CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',   -- active | expired | revoked
  granted_at TEXT NOT NULL,
  expires_at TEXT,                          -- NULL = lifetime
  source_order_id TEXT,
  UNIQUE(user_id, product_code),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Progress for drip journeys / courses (P1, P7)
CREATE TABLE IF NOT EXISTS enrollment_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  last_activity_at TEXT,
  completed_at TEXT,
  state_json TEXT,
  UNIQUE(user_id, product_code),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active, type);
CREATE INDEX IF NOT EXISTS idx_enrollment_user ON enrollment_progress(user_id, product_code);

-- Seed Wave 1 catalog (idempotent). Adjust prices before go-live.
INSERT OR IGNORE INTO products (code, title, type, price_amount, currency, access_grant, active, created_at, updated_at)
VALUES
  ('p2_workbook', 'Workbook PDF "Cái Chổi"', 'one_time', 9.00, 'USD', 'grant_workbook', 1, datetime('now'), datetime('now')),
  ('p1_37ngay',   'Hành trình 37 Ngày Làm Chủ', 'one_time', 29.00, 'USD', 'grant_37ngay', 1, datetime('now'), datetime('now')),
  ('p5_donghanh', 'Membership Đồng Hành', 'subscription', 9.00, 'USD', 'grant_membership', 1, datetime('now'), datetime('now'));
