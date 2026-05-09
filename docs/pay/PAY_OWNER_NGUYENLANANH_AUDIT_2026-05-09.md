# Pay-Owner — nguyenlananh.com Audit

Date: 2026-05-09
Owner: Pay-Owner agent
Authority: founder direct chat 2026-05-09 ("Hoàn thành toàn bộ việc thanh toán cho nguyenlananh.com")

---

## 0. Scope

nguyenlananh.com uses Cloudflare Pages Functions (not a single bundled worker).
All payment code lives in `functions/` — shipped by the Pages build pipeline.
D1 binding: `PAYMENTS_DB` bound in `wrangler.toml` for `[env.production]`.

---

## 1. Payment lanes confirmed

| Lane | Provider | Currency | Status |
|---|---|---|---|
| VN identity | VietQR (manual confirm) | VND | Code complete — awaiting live secrets |
| International identity | PayPal | USD | Code complete — awaiting PayPal merchant account |
| International identity | Stripe | USD | Code complete — deferred this phase |

Rail guard enforced at `/api/payments/create-checkout`:
- `identity_country=VN` → must use VND provider (VietQR)
- `identity_country=INTL` → must use USD provider (PayPal/Stripe)

---

## 2. Findings

### F-N-001 — SEVERITY: HIGH — VietQR bank credentials not provisioned
- **Impact**: VietQR is the sole live payment method for Vietnamese users (all current customers). Without VIETQR_BANK_BIN, VIETQR_ACCOUNT_NO, VIETQR_ACCOUNT_NAME the provider returns `mode=setup_required` and `/api/payments/vietqr/create-order` fails.
- **Fix**: Founder provides bank account details. Pay-Owner runs `scripts/provision-payment-live-secrets.sh` with `REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0`.
- **Status**: Raised as REQ-N-001.

### F-N-002 — SEVERITY: HIGH — Email secrets not provisioned
- **Impact**: Magic links cannot be sent. Signup + auth are blocked.
- **Required secrets**: `EMAIL_PROVIDER`, `MAIL_API_BASE_URL`, `MAIL_API_KEY`, `MAIL_API_WORKSPACE_ID`, `MAIL_API_WEBHOOK_SECRET`, `EMAIL_FROM_SYSTEM`, `EMAIL_FROM_PAY`, `EMAIL_REPLY_TO_SUPPORT`
- **Fix**: Founder provisions via mail.iai.one or another provider.
- **Status**: Raised as REQ-N-002.

### F-N-003 — SEVERITY: MEDIUM — Magic link auth was stateless HMAC (security gap)
- **Impact**: Old implementation relied on env-variable-derived HMAC secrets and had no server-side token revocation. Tokens leaked from logs could be replayed within the 20-min window.
- **Fix**: Replaced with DB-backed magic link system (token hash stored in `magic_links` table, one-time-use enforced). **Fixed in this round — see commit.**
- **Status**: CLOSED.

### F-N-004 — SEVERITY: LOW — Preview env had no D1 binding
- **Impact**: Preview deployments could not access PAYMENTS_DB; all payment APIs returned 503.
- **Fix**: Added `[env.preview]` D1 binding to `wrangler.toml` (pointing to prod DB until a dedicated preview DB is created). **Fixed in this round.**
- **Status**: CLOSED.

### F-N-005 — SEVERITY: LOW — PayPal / Stripe deferred
- **Impact**: International checkout is code-complete but secrets not provisioned for this phase.
- **Fix**: Founder provides PayPal merchant credentials when ready. Phase 2 per rollout doc.
- **Status**: Tracked — not a blocker for VN launch.

### F-N-006 — SEVERITY: INFO — MoMo / VNPay / ZaloPay stubs in catalog
- **Impact**: Provider catalog lists MoMo, VNPay, ZaloPay with no runtime adapter. They will never appear as `enabled=true` (no required secrets → `mode=setup_required`).
- **Fix**: Stubs are safe. Do not expose them in the UI until adapters are written. Current `/api/payments/providers` already gates by `enabled`.
- **Status**: Deferred — out of scope for this phase.

---

## 3. What is code-complete

### Payment API surface (all live in `functions/`)

| Route | Method | Status |
|---|---|---|
| `/api/payments/health` | GET | ✅ |
| `/api/payments/providers` | GET | ✅ |
| `/api/payments/rails` | GET | ✅ |
| `/api/payments/create-checkout` | POST | ✅ |
| `/api/payments/vietqr/create-order` | POST | ✅ |
| `/api/payments/vietqr/mark-pending` | POST | ✅ |
| `/api/payments/finalize` | POST | ✅ |
| `/api/payments/paypal/webhook` | POST | ✅ |
| `/api/payments/stripe/webhook` | POST | ✅ |
| `/api/admin/payments/vietqr/orders` | GET | ✅ |
| `/api/admin/vietqr-confirm` | POST | ✅ |
| `/api/auth/signup` | POST | ✅ |
| `/api/auth/magic-links/consume` | POST | ✅ (DB-backed, upgraded this round) |
| `/api/auth/magic-links/resend` | POST | ✅ |

### D1 Schema
- `users` — membership records
- `payment_orders` — all provider orders
- `vietqr_orders` — VietQR-specific detail (QR URL, transfer note, bank info)
- `idempotency_keys` — create-checkout dedup
- `webhook_events` — webhook receipt log
- `magic_links` — DB-backed magic link tokens (upgraded this round)
- `email_jobs` — email send queue
- `admin_member_snapshot_queue` — admin operations queue

### VietQR flow
1. User POSTs `/api/payments/vietqr/create-order` → receives QR URL + transfer note
2. User transfers bank → POSTs `/api/payments/vietqr/mark-pending`
3. Admin sees order in `/admin/payments/` → POSTs `/api/admin/vietqr-confirm` with `PAYMENTS_ADMIN_KEY`
4. Membership granted → magic link sent to user

---

## 4. Blockers for production live

| # | Blocker | Owner | REQ |
|---|---|---|---|
| 1 | VIETQR_BANK_BIN, VIETQR_ACCOUNT_NO, VIETQR_ACCOUNT_NAME | Founder | REQ-N-001 |
| 2 | PAYMENTS_ADMIN_KEY | Founder | REQ-N-001 |
| 3 | Email secrets (MAIL_API_KEY etc.) | Founder | REQ-N-002 |
| 4 | API_BASE_URL, ENV_DEPLOY_TARGET, REFUND_POLICY | Founder | REQ-N-001 |

---

## 5. Not blockers (nice-to-have before full live)

- PayPal merchant account + PAYPAL_WEBHOOK_ID (phase 2)
- Dedicated preview D1 database (phase 2)

---

## 6. Verification commands

```bash
# Check health + provider readiness
BASE_URL=https://www.nguyenlananh.com \
REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 \
bash scripts/payment-live-secrets-preflight.sh

# Full runtime gate
BASE_URL=https://www.nguyenlananh.com \
REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 STRICT_MODE=0 \
bash scripts/team2-runtime-phase-gate.sh

# Schema apply (run once after D1 created)
wrangler d1 execute nguyenlananh-payments-prod --remote --file=./database/payment_gateway_d1.sql
```
