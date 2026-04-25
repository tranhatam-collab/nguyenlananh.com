-- Nguyenlananh.com payment gateway schema for Cloudflare D1
-- Apply with: wrangler d1 execute <DB_NAME> --file=./database/payment_gateway_d1.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  membership_type TEXT NOT NULL,
  membership_label TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'vi',
  expires_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_orders (
  internal_order_id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'vi',
  provider TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  provider_order_id TEXT,
  provider_capture_id TEXT,
  provider_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'created',
  fulfillment_status TEXT NOT NULL DEFAULT 'not_fulfilled',
  success_url TEXT,
  cancel_url TEXT,
  retry_url TEXT,
  metadata_json TEXT,
  idempotency_key_create TEXT,
  idempotency_key_finalize TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  refunded_at TEXT,
  UNIQUE(provider, provider_order_id),
  UNIQUE(provider, provider_session_id),
  UNIQUE(provider, provider_capture_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(route, idempotency_key)
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  signature_valid INTEGER NOT NULL DEFAULT 0,
  headers_json TEXT,
  payload_json TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  error_code TEXT,
  error_detail TEXT
);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  redirect_path TEXT,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS email_jobs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'resend',
  template_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'vi',
  dedupe_key TEXT NOT NULL UNIQUE,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  error_detail TEXT,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT,
  failed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_lookup
  ON payment_orders(provider, payment_status, fulfillment_status);

CREATE INDEX IF NOT EXISTS idx_payment_orders_email
  ON payment_orders(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider
  ON webhook_events(provider, event_type, processed);

CREATE INDEX IF NOT EXISTS idx_magic_links_email
  ON magic_links(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_jobs_queue
  ON email_jobs(status, scheduled_for);
