# Team 2 Runtime Commerce/Auth/Member Access Report

Date: 2026-04-29
Owner: Team 2
Target: `https://www.nguyenlananh.com`
Cloudflare Pages project: `nguyenlananh-com`
Latest deployment checked: `https://4f1b7aee.nguyenlananh-com.pages.dev`

## Cloudflare Account Migration Update

Additional target account requested by admin team:

- Target Cloudflare account id: `62d57eaa548617aeecac766e5a1cb98e`
- Target Pages project: `nguyenlananh-com`
- Target Pages preview/live deployment checked: `https://dcd4c748.nguyenlananh-com-63s.pages.dev`
- Target D1 database: `nguyenlananh-payments-prod`
- Target D1 database id: `16dfc26d-ed33-4dc1-a349-6e216860ae05`

Actions completed on the target account:

- Applied `database/payment_gateway_d1.sql` to the target D1 database.
- Deployed the current static site + Pages Functions bundle to the target Pages project.
- Verified `/api/payments/health` on the target Pages deployment returns `ok: true` and `db_ready: true`.
- Verified target D1 tables exist: `email_jobs`, `idempotency_keys`, `magic_links`, `payment_orders`, `users`, `vietqr_orders`, `webhook_events`.
- Ran admin smoke on `https://dcd4c748.nguyenlananh-com-63s.pages.dev`: `PASS=21`, `FAIL=0`.
- Ran payment/auth smoke on `https://dcd4c748.nguyenlananh-com-63s.pages.dev`: health/providers pass; PayPal remains blocked by missing live secrets.
- Attached Pages custom domains through the official Cloudflare Pages Domains API:
  - `nguyenlananh.com`
  - `www.nguyenlananh.com`
  - `admin.nguyenlananh.com`

Current custom-domain status on target account:

- DNS was repaired at `2026-04-29 12:24 +07` using a scoped DNS Edit token.
- Replaced stale `A`/`AAAA` records for `@`, `www`, and `admin` with proxied CNAME records to `nguyenlananh-com-63s.pages.dev`.
- Restored the apex mail records after the DNS repair:
  - `MX nguyenlananh.com -> 10 mail.iai.one`
  - `TXT nguyenlananh.com -> v=spf1 mx a:mail.iai.one ~all`
- Verified public HTTP:
  - `https://nguyenlananh.com` => `200`
  - `https://www.nguyenlananh.com` => `200`
  - `https://admin.nguyenlananh.com` => `200`
- Verified runtime health on all three domains:
  - `/api/payments/health` returns `ok: true`
  - `/api/payments/health` returns `db_ready: true`

DNS/admin blocker status:

- `CNAME record not set` blocker is closed.
- Custom domains now resolve through Cloudflare Pages and serve the new runtime.
- No further DNS action is required for the web cutover at this checkpoint.

## Change Log (Timestamped)

- `2026-04-29 12:30:41 +0700` (`2026-04-29T05:30:41Z`): Team 2 confirmed directive to keep all new scripts unchanged in place and continue dev around them.
- `2026-04-29 12:31:09 +0700` (`2026-04-29T05:31:09Z`): Added new script `scripts/team2-live-gate.sh` (no rollback/deletion of existing scripts) to unify live-gate checks for 3 domains + admin smoke + payment/auth smoke.
- `2026-04-29 12:31:09 +0700` (`2026-04-29T05:31:09Z`): Executed `scripts/team2-live-gate.sh` on production:
  - Domain HTTP: apex/www/admin all `200`
  - `/api/payments/health`: all domains `ok: true`, `db_ready: true`
  - Admin smoke: `PASS=21`, `FAIL=0`
  - Payment/auth smoke: guard behavior unchanged; PayPal still blocked by missing live API secrets

Ops automation update (post-cutover):

- `scripts/payment-live-proof-smoke.sh` was hardened for production proof collection:
  - default `BASE_URL` switched to `https://www.nguyenlananh.com`
  - uses runtime payload field `email` (instead of legacy `candidate_email`)
  - can run optional VietQR admin confirm when `PAYMENTS_ADMIN_KEY` is provided
  - prints D1 evidence counters and latest `payment_orders` rows for smoke emails
- `scripts/provision-payment-live-secrets.sh` now requests and sets the full live secret set:
  - `PAYMENTS_ADMIN_KEY`
  - `PAYPAL_MERCHANT_EMAIL`
  - `EMAIL_FROM_SYSTEM`, `EMAIL_FROM_PAY`, `EMAIL_REPLY_TO_SUPPORT`

## Summary

Production runtime is live on Cloudflare Pages Functions and now has a D1 production binding:

- Binding name: `PAYMENTS_DB`
- D1 database: `nguyenlananh-payments-prod`
- D1 database id: `16dfc26d-ed33-4dc1-a349-6e216860ae05`
- Schema applied: `database/payment_gateway_d1.sql`

The backend health surface is ready and reports `db_ready: true`.

PayPal live API is not fully enabled yet because production secrets currently do not include:

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

Existing production secrets visible through Wrangler:

- `API_BASE_URL`
- `CANCEL_URL`
- `EMAIL_PROVIDER`
- `ENV_DEPLOY_TARGET`
- `MERCHANT_EMAIL`
- `PAYPAL_MERCHANT_EMAIL`
- `REFUND_POLICY`
- `RETRY_URL`
- `SUCCESS_URL`

## Runtime Checks

### Payments Health

Command:

```bash
curl -sS https://www.nguyenlananh.com/api/payments/health
```

Result:

- `ok: true`
- `environment.db_ready: true`
- `environment.deploy_target: cloudflare-pages`
- `environment.email_provider: mail_iai_one`
- PayPal: `implemented: true`, `enabled: false`, `manual_fallback: true`, `mode: setup_required`

### Providers

Command:

```bash
curl -sS https://www.nguyenlananh.com/api/payments/providers
```

Result:

- `ok: true`
- PayPal public fallback merchant: `pay@nguyenlananh.com`
- PayPal API mode remains `setup_required` until live PayPal client/webhook secrets are added.

### PayPal Create Checkout

Command:

```bash
curl -i -X POST https://www.nguyenlananh.com/api/payments/create-checkout \
  -H 'Content-Type: application/json' \
  -H 'X-Idempotency-Key: team2-paypal-20260429-002' \
  -d '{"provider":"paypal","email":"qa+team2-paypal-20260429@nguyenlananh.com","plan_code":"year1","locale":"vi","success_url":"https://www.nguyenlananh.com/join/success/","cancel_url":"https://www.nguyenlananh.com/join/cancel/","retry_url":"https://www.nguyenlananh.com/join/retry/","next_path":"/members/dashboard/"}'
```

Result:

- HTTP `409`
- Code: `PROVIDER_NOT_READY`
- Message: `PayPal is not configured yet.`

Conclusion: API path is reachable and guarded correctly. Create order/capture cannot be completed until the missing PayPal secrets are configured.

### PayPal Webhook Smoke

Command:

```bash
curl -i -X POST https://www.nguyenlananh.com/api/payments/paypal/webhook \
  -H 'Content-Type: application/json' \
  -d '{"id":"team2-smoke-notconfigured-20260429-2","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{"id":"fake-capture"}}'
```

Result:

- HTTP `503`
- Code: `PAYPAL_NOT_CONFIGURED`
- Message: `PayPal webhook secrets are missing.`
- D1 recorded the event in `webhook_events` with `error_code = PAYPAL_NOT_CONFIGURED`.

Note: Team 2 patched the webhook handler so missing PayPal credentials return structured JSON instead of a Cloudflare 502.

## Magic Link Auth

Request link:

```bash
curl -sS -X POST https://www.nguyenlananh.com/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"qa+team2-20260429@nguyenlananh.com","locale":"vi","next_path":"/members/start/"}'
```

Result:

- `ok: true`
- `expires_in_minutes: 20`
- `delivery_status: preview`
- `preview_magic_link` returned because MAIL API key is not present in production secret list.

Consume link:

- `ok: true`
- Session created for `qa+team2-20260429@nguyenlananh.com`
- `membershipType: free`
- `next_path: /members/start/`

## Member Journey

HTTP route checks:

- `/members/start/` => `200`
- `/members/dashboard/` => `200`
- `/members/journey/day-1/` => `200`
- `/members/journey/day-7/` => `200`
- `/members/deep/` => `200`
- `/members/pro/` => `200`

Client gating status:

- Free member sessions are redirected to `/members/start/?gate=paid` when entering paid member paths.
- Paid access is local-session driven after successful payment/magic link fulfillment.
- Deep/pro content routes serve successfully and rely on `assets/members.js` for browser-side access gating.

## Admin

Production admin smoke was run with:

```bash
scripts/smoke-admin-content-accounts.sh https://www.nguyenlananh.com
```

Result:

- `PASS=21`
- `FAIL=0`

Covered:

- `/admin/`
- `/admin/dashboard/`
- `/admin/content/`
- `/admin/members/`
- `/admin/creators/`
- `/admin/settings/`
- English admin equivalents
- Account manager controls
- `content_editor`, `content_manage`, `content_image`, and default `content.editor` seed account markers

## Open Items For PayPal Live

1. Add production Pages secrets:

```bash
wrangler pages secret put PAYPAL_CLIENT_ID --project-name nguyenlananh-com
wrangler pages secret put PAYPAL_CLIENT_SECRET --project-name nguyenlananh-com
wrangler pages secret put PAYPAL_WEBHOOK_ID --project-name nguyenlananh-com
```

2. Configure PayPal dashboard webhook URL:

```text
https://www.nguyenlananh.com/api/payments/paypal/webhook
```

3. Rerun:

```bash
BASE_URL=https://www.nguyenlananh.com \
TEST_EMAIL=qa+paypal@example.com \
./docs/contracts/paypal-backend-smoke.sh
```

4. Complete real payer approval flow, then verify `create-checkout -> finalize -> magic link -> member dashboard`.

## Known Repo/Tooling Notes

- Local git object database is unhealthy. `git status` / `git diff --name-only` can hang or fail with missing object errors. No git staging/commit was attempted.
- `node scripts/validate-bilingual-release.mjs` is currently blocked by pre-existing bilingual audit issues: `217` total issues, `217` blocking.
- Sandbox DNS was intermittent for repeated `curl` smoke checks; production checks were rerun outside the sandbox where needed.
