-- PayPal + Email Automation Phase 2 schema patch (skeleton)

CREATE TABLE IF NOT EXISTS paypal_orders (
  internal_order_id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'created',
  fulfillment_status TEXT NOT NULL DEFAULT 'not_fulfilled',
  idempotency_key_create TEXT,
  idempotency_key_capture TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  captured_at TEXT,
  refunded_at TEXT
);

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  transmission_id TEXT,
  signature_valid INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  payload_json TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  error_code TEXT,
  error_detail TEXT
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_json TEXT,
  status_code INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE(route, idempotency_key)
);

CREATE TABLE IF NOT EXISTS email_jobs (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'vi',
  dedupe_key TEXT NOT NULL UNIQUE,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  retry_count INTEGER NOT NULL DEFAULT 0,
  provider_message_id TEXT,
  scheduled_for TEXT NOT NULL,
  sent_at TEXT,
  failed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paypal_orders_status ON paypal_orders(payment_status, fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON paypal_webhook_events(event_type, processed);
CREATE INDEX IF NOT EXISTS idx_email_jobs_queue ON email_jobs(status, scheduled_for);
