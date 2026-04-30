# PAYMENT_RAILS_INDEPENDENT_STATUS_2026-04-30

Date: 2026-04-30 (ICT)  
Scope: backend/runtime payment rails only for `nguyenlananh.com` (no public UI/copy/SEO/a11y scope in this batch).

## What was changed

1. Runtime rail policy is now enforced independently from provider-secret readiness:
   - file: `functions/_lib/payments.js`
   - change: `resolvePaymentRail(...)` validation now runs **before** `PROVIDER_NOT_READY`.
   - impact:
     - VN identity + USD provider now returns `422 VN_ID_REQUIRES_VND`
     - INTL identity + VND provider now returns `422 INTERNATIONAL_ID_REQUIRES_USD`
     - provider setup state still returns `409 PROVIDER_NOT_READY` only for valid rail attempts.

2. Added new API endpoint to expose rail contract:
   - file: `functions/api/payments/rails.js`
   - route: `GET /api/payments/rails`
   - response: rail catalog + policy for VN_VND and INTL_USD.

3. Added independent rail gate script:
   - file: `scripts/payment-rails-independent-gate.sh`
   - purpose: health/providers/rails checks + 4 rail probes + markdown evidence output.

4. Updated Team 2 live gate script to include rail guard probes:
   - file: `scripts/team2-live-gate.sh`
   - added checks for expected guard codes on cross-rail probes.

## Deployment

- Cloudflare Pages deployment completed:
  - URL: `https://2e7e8416.nguyenlananh-com-63s.pages.dev`
  - target project: `nguyenlananh-com`
  - account: `62d57eaa548617aeecac766e5a1cb98e`

## Runtime verification after deploy

Command run:

```bash
BASE_URL=https://www.nguyenlananh.com \
REQUIRE_PROVIDER_READY=0 \
REQUIRE_RAIL_GUARD=1 \
REQUIRE_COMPLETED=0 \
bash scripts/payment-rails-independent-gate.sh
```

Result:

- PASS: health ok + db ready
- PASS: providers endpoint valid
- PASS: rails endpoint valid
- PASS: VN + PayPal blocked with `VN_ID_REQUIRES_VND`
- PASS: INTL + VietQR blocked with `INTERNATIONAL_ID_REQUIRES_USD`
- WARN: VN rail provider not ready (`PROVIDER_NOT_READY`)
- WARN: INTL rail provider not ready (`PROVIDER_NOT_READY`)
- failures: `0`
- warnings: `2`

Evidence file generated:

- `docs/reports/PAYMENT_RAILS_INDEPENDENT_GATE_20260430_183939.md`

## Remaining blockers to reach full payment live

Provider runtime secrets still missing for full checkout live (current setup_required lanes):

- `VIETQR_BANK_BIN`
- `VIETQR_ACCOUNT_NO`
- `VIETQR_ACCOUNT_NAME`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MAIL_API_KEY`

For `nguyenlananh.com` provider lanes in current environment:

- `vietqr`: setup_required
- `paypal`: setup_required
- `stripe`: setup_required

## Notes

- A full `team2-live-gate.sh` rerun shows payment rail probes are now PASS.
- That rerun still has a separate non-payment failure in admin smoke (`admin-console.js missing content_editor role`), outside this payment-rail batch.
