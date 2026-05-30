-- Migration: Create rate_limits table for magic-link rate limiting
-- Applied: lazily at runtime (CREATE TABLE IF NOT EXISTS in ratelimit.js)
-- Run manually if desired:
--   wrangler d1 execute nguyenlananh-payments-prod --command="CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0);"

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0
);
