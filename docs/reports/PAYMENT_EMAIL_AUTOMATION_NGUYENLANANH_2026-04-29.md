# PAYMENT_EMAIL_AUTOMATION_NGUYENLANANH_2026-04-29

Date: 2026-04-29 (ICT)
Scope: VN + International payment runtime and payment email automation readiness for `nguyenlananh.com`.
Cloudflare target account: `62d57eaa548617aeecac766e5a1cb98e` (migrated on 2026-04-29).

## Done in repo/runtime

1. Added VN VietQR payment lane (manual confirm phase):
   - `POST /api/payments/vietqr/create-order`
   - `POST /api/payments/vietqr/mark-pending`
   - `GET /api/admin/payments/vietqr/orders`
   - `POST /api/admin/vietqr-confirm`
2. Added `vietqr_orders` table into D1 schema:
   - file: `database/payment_gateway_d1.sql`
3. Added admin confirmation UI:
   - `admin/payments/index.html`
4. Upgraded member unlock UI to real checkout flow:
   - VN ID -> VietQR (VND)
   - International ID -> USD checkout provider
5. Removed fake local-only unlock behavior from members start page.
6. Kept fulfillment/email logic on server side so receipt + welcome email are queued/sent only after confirmed payment.

## Done on production Cloudflare (2026-04-29)

0. Migrated active deployment target to account ID `62d57eaa548617aeecac766e5a1cb98e`:
   - created Pages project `nguyenlananh-com` on new account
   - created D1 `nguyenlananh-payments-prod` on new account
   - updated `wrangler.toml` D1 `database_id` to `16dfc26d-ed33-4dc1-a349-6e216860ae05`
   - first production deploy on new account: `https://dcd4c748.nguyenlananh-com-63s.pages.dev`
1. Verified Cloudflare access and resources:
   - Pages project `nguyenlananh-com`
   - D1 `nguyenlananh-payments-prod` (new ID: `16dfc26d-ed33-4dc1-a349-6e216860ae05`)
2. Applied production schema:
   - `wrangler d1 execute nguyenlananh-payments-prod --remote --file=./database/payment_gateway_d1.sql`
3. Verified production D1 tables:
   - `payment_orders`, `email_jobs`, `magic_links`, `webhook_events`, `vietqr_orders` all present
4. Set production vars/secrets already available now:
   - `API_BASE_URL=https://www.nguyenlananh.com/api`
   - `ENV_DEPLOY_TARGET=cloudflare-pages`
   - `REFUND_POLICY=manual_review`
   - `VIETQR_TEMPLATE=compact2`
   - `PAYPAL_MERCHANT_EMAIL=pay@nguyenlananh.com`
   - `EMAIL_PROVIDER=resend`
   - `EMAIL_FROM_SYSTEM=noreply@nguyenlananh.com`
   - `EMAIL_FROM_PAY=pay@nguyenlananh.com`
   - `EMAIL_REPLY_TO_SUPPORT=support@nguyenlananh.com`
   - `PAYMENTS_ADMIN_KEY` (rotated and working)
5. Deployed production successfully.
6. Verified runtime behavior:
   - `GET /api/payments/providers` -> `200`, `db_ready=true`
   - `GET /api/payments/health` -> `200`
   - `GET /api/admin/payments/vietqr/orders`:
     - no key -> `401 ADMIN_KEY_REQUIRED`
     - wrong key -> `403 ADMIN_KEY_INVALID`
     - correct key -> `200`
7. Updated ops scripts to default new account:
   - `scripts/deploy_cloudflare.sh`
   - `scripts/provision-payment-live-secrets.sh`
   - `scripts/payment-live-proof-smoke.sh`

## Live gate still blocked (outside-repo inputs missing)

1. Missing production secrets:
   - `VIETQR_BANK_BIN`
   - `VIETQR_ACCOUNT_NO`
   - `VIETQR_ACCOUNT_NAME`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_WEBHOOK_ID`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `RESEND_API_KEY`
2. Current production smoke confirms these are the exact blockers:
   - `POST /api/payments/vietqr/create-order` -> `409 PROVIDER_NOT_READY`
   - `POST /api/payments/create-checkout` (`provider=paypal`) -> `409 PROVIDER_NOT_READY`
   - public custom domain `https://www.nguyenlananh.com` still throws Cloudflare `Error 1000` (DNS points to prohibited IP), so canonical smoke should currently use Pages domain:
     - `https://nguyenlananh-com-63s.pages.dev`
3. Still required for true live claim:
   - run 1 VN flow + 1 USD flow with real provider evidence
   - provider ref
   - email message id
   - D1 rows
   - inbox proof.

## Helper scripts added today

1. `/scripts/provision-payment-live-secrets.sh`
   - prompts secure input and sets all missing production secrets
2. `/scripts/payment-live-proof-smoke.sh`
   - runs provider/health/VN/USD smoke
   - prints D1 evidence counters
