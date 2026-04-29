# Team 2 Runtime Completion Brief

Date: 2026-04-30
Owner: Team 2 runtime commerce/auth/email
Target: `https://www.nguyenlananh.com`
Cloudflare account: `62d57eaa548617aeecac766e5a1cb98e`
Pages project: `nguyenlananh-com`
D1 database: `nguyenlananh-payments-prod`

## Decision

Public site, admin shell, Pages Functions, and D1 binding are live and healthy.

Do not claim full commerce live yet. The remaining blocker is production merchant/email configuration and proof collection:

- PayPal is implemented but `setup_required`.
- Stripe is implemented but `setup_required`.
- VietQR manual-confirm rail is implemented but `setup_required`.
- Email code supports `mail_iai_one`, but production secret names do not yet include `MAIL_API_*`.

## Verified On 2026-04-30

Local repo:

- `HEAD`: `d59d668 mail: switch nguyenlananh.com to mail.iai.one canonical lane`
- Worktree started clean after fresh clone from `origin/main`.

Repository gates:

- `node scripts/content-audit.mjs --fail` -> pass, 0 issues, 239 HTML files scanned, 144 sitemap URLs.
- `node scripts/validate-bilingual-release.mjs` -> pass, 238 URLs audited, 0 blocking issues.
- `node scripts/local-public-site-audit.mjs` -> pass, 241 pages audited, 0 issues.
- `wrangler pages functions build --outfile /tmp/nla-functions-worker.js` -> compiled successfully.

Production live gate:

- `https://nguyenlananh.com` -> 200
- `https://www.nguyenlananh.com` -> 200
- `https://admin.nguyenlananh.com` -> 200
- `/api/payments/health` on all 3 domains -> `ok: true`, `db_ready: true`, `deploy_target: cloudflare-pages`
- Admin smoke -> `PASS=21`, `FAIL=0`
- Magic-link resend smoke -> queued successfully

Provider readiness from production:

- PayPal -> `enabled: false`, `mode: setup_required`, public fallback merchant `pay@nguyenlananh.com`
- Stripe -> `enabled: false`, `mode: setup_required`, publishable key is `null`
- VietQR -> `enabled: false`, `mode: setup_required`, bank fields are `null`
- MoMo/VNPay/ZaloPay -> `implemented: false`, `mode: planned`

D1 proof counters from `payment-live-proof-smoke.sh`:

- `payment_orders`: 0
- `email_jobs`: 0
- `vietqr_orders`: 0
- `webhook_events`: 4

These counters are expected while payment providers are still missing production secrets.

## Current Production Secret Names

Wrangler currently lists these production secrets:

- `API_BASE_URL`
- `EMAIL_FROM_PAY`
- `EMAIL_FROM_SYSTEM`
- `EMAIL_PROVIDER`
- `EMAIL_REPLY_TO_SUPPORT`
- `ENV_DEPLOY_TARGET`
- `PAYMENTS_ADMIN_KEY`
- `PAYPAL_MERCHANT_EMAIL`
- `REFUND_POLICY`
- `VIETQR_TEMPLATE`

Missing for full live proof:

- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- VietQR: `VIETQR_BANK_BIN`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME`
- Mail IAI One: `MAIL_API_BASE_URL`, `MAIL_API_KEY`, `MAIL_API_WORKSPACE_ID`, `MAIL_API_WEBHOOK_SECRET`

## Team 2 Action Plan

1. Set all production secrets without printing values:

```bash
PROJECT_NAME=nguyenlananh-com \
CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
EMAIL_PROVIDER=mail_iai_one \
./scripts/provision-payment-live-secrets.sh
```

2. Confirm secret names only:

```bash
wrangler pages secret list --project-name nguyenlananh-com
```

3. Configure merchant webhooks:

- PayPal webhook URL: `https://www.nguyenlananh.com/api/payments/paypal/webhook`
- Stripe webhook URL: `https://www.nguyenlananh.com/api/payments/stripe/webhook`

4. Redeploy once after secrets are set so the production runtime definitely uses the new environment:

```bash
scripts/deploy_cloudflare.sh
```

5. Rerun live gates:

```bash
bash scripts/team2-live-gate.sh
PAYMENTS_ADMIN_KEY="..." bash scripts/payment-live-proof-smoke.sh
```

6. Collect real proof for each rail:

- VN rail: create VietQR order -> mark pending -> compare transfer note in bank account -> admin confirm -> verify `vietqr_orders`, `payment_orders`, `users`, and `email_jobs`.
- USD PayPal rail: create checkout -> approve with real payer -> finalize/capture -> verify `payment_status=completed`, `fulfillment_status=fulfilled`, receipt email, welcome/magic-link email, and inbox delivery.
- USD Stripe rail: create checkout -> complete payment -> webhook/finalize -> verify the same D1 and inbox proof.

## Team 2 Green Criteria

Team 2 may mark runtime commerce as live only when all conditions below are true:

- `/api/payments/providers` shows PayPal, Stripe, and VietQR `enabled: true` or an explicitly approved subset for launch.
- `scripts/team2-live-gate.sh` exits 0.
- `scripts/payment-live-proof-smoke.sh` exits 0 with real provider references.
- D1 has at least one completed order for VN and one completed order for USD launch proof.
- `email_jobs` contains sent rows with provider message IDs.
- Inbox proof exists for receipt and magic-link/welcome email.
- No secret value is printed in terminal output, logs, reports, or commits.

## Boundary With Team 1/Admin

Team 1/admin can treat content, SEO, sitemap, bilingual surface, admin routes, and public member pages as green at this checkpoint.

Team 2 owns only the remaining production runtime proof: payment secrets, merchant dashboard webhooks, live checkout, D1 evidence, email delivery, and admin payment-confirm operations.
