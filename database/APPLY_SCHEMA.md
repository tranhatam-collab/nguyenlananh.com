# Apply D1 Database Schema — Runbook

## Prerequisites
- Wrangler CLI installed and authenticated
- Database `nguyenlananh-payments-prod` already created

## Step 1: Verify database exists
```bash
wrangler d1 list
```
You should see `nguyenlananh-payments-prod` with ID `16dfc26d-ed33-4dc1-a349-6e216860ae05`.

## Step 2: Apply schema (idempotent)
```bash
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com
wrangler d1 execute nguyenlananh-payments-prod --file=./database/payment_gateway_d1.sql
```

This command runs all `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` statements.
Safe to re-run — it will not drop or modify existing data.

## Step 3: Verify tables created
```bash
wrangler d1 execute nguyenlananh-payments-prod --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Expected tables:
- `users`
- `payment_orders`
- `idempotency_keys`
- `webhook_events`
- `magic_links`
- `email_jobs`
- `vietqr_orders`
- `contact_submissions`
- `admin_member_snapshot_queue`

## Troubleshooting
- **"Database not found"**: Run `wrangler d1 create nguyenlananh-payments-prod` first.
- **Apply fails mid-way**: The schema uses `IF NOT EXISTS`, so you can safely re-run.
- **Need preview DB**: `wrangler d1 create nguyenlananh-payments-preview`, then update `wrangler.toml`.
