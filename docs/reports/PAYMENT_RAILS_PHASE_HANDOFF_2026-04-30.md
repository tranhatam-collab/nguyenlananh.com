# PAYMENT_RAILS_PHASE_HANDOFF_2026-04-30

Date: 2026-04-30  
Repo: `nguyenlananh.com`

## Scope locked for current phase

- Stripe is deferred for current live phase.
- Stripe is **not removed** from code paths or env contract.
- Current priority rails:
  - VN identity -> VND via `vietqr`
  - INTL identity -> USD via `paypal`
- Mail lane remains `mail_iai_one`.

## Script updates completed

1. `scripts/provision-payment-live-secrets.sh`
   - Added `SKIP_STRIPE=1` support.
   - When enabled, script does not prompt/set Stripe secrets.
   - Stripe env names are still preserved for future phase.

2. `scripts/team2-live-gate.sh`
   - Added `REQUIRE_STRIPE=0|1` switch.
   - With `REQUIRE_STRIPE=0`, gate validates PayPal + VietQR rails without blocking on Stripe readiness.

## Recommended commands for Team 2 / Team Pay

```bash
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com

TARGET_ENVS="production preview" SKIP_STRIPE=1 bash scripts/provision-payment-live-secrets.sh
bash scripts/deploy_cloudflare.sh

BASE_URL=https://www.nguyenlananh.com REQUIRE_PROVIDER_READY=0 REQUIRE_COMPLETED=0 bash scripts/payment-rails-independent-gate.sh
BASE_URL=https://www.nguyenlananh.com ENFORCE_COMMERCE_LIVE=0 REQUIRE_STRIPE=0 bash scripts/team2-live-gate.sh
```

## Strict closeout gate (after real proofs)

Only run strict after VN + INTL + email evidence are present.

```bash
BASE_URL=https://www.nguyenlananh.com REQUIRE_PROVIDER_READY=1 REQUIRE_COMPLETED=1 bash scripts/payment-rails-independent-gate.sh
```

