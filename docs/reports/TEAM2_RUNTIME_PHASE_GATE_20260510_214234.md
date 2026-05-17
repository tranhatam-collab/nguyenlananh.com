# TEAM2_RUNTIME_PHASE_GATE

- generated_at_utc: 2026-05-10T14:42:34Z
- generated_at_local: 2026-05-10 21:42:34 +0700
- base_url: `https://www.nguyenlananh.com`
- project_name: `nguyenlananh-com`
- target_envs: `production`
- require_paypal: `0`
- require_stripe: `0`
- require_intl_provider: `0`
- strict_mode: `1`
- check_pages_secrets: `1`
- intl_provider: `paypal`

## Step Results
### Step 1: Connectivity preflight
- status: `PASS`
- exit_code: `0`
- command: `connectivity_preflight`
- log_tail:

```text
Connectivity check: https://www.nguyenlananh.com -> 200
[PASS] base URL reachable
```

### Step 2: Secrets preflight
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 VN_VIA_PAY_IAI_ONE=1 CHECK_PAGES_SECRETS=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-live-secrets-preflight.sh`
- log_tail:

```text
== payment live secrets preflight ==
UTC: 2026-05-10T14:42:35Z
Base URL: https://www.nguyenlananh.com
Require PayPal in this phase: 0
Require Stripe in this phase: 0
VN rail via pay.iai.one: 1
Check Pages secret names: 1

[PASS] health ok=true and db_ready=true
[PASS] providers endpoint returned valid JSON
[PASS] email_provider is mail_iai_one
[FAIL] vietqr enabled=false (mode=setup_required)
[PASS] paypal readiness deferred for this phase (REQUIRE_PAYPAL=0)
[PASS] stripe readiness deferred for this phase (REQUIRE_STRIPE=0)

== Pages secret names check ==
[PASS] read Pages secret names for env=production (count=15)

== Missing secret checklist ==
  - PAY_IAI_ONE_API_KEY

Summary: failures=1 missing=1
```

### Step 3: Team 2 live gate
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 VN_VIA_PAY_IAI_ONE=1 CHECK_PAGES_SECRETS=1 ENFORCE_COMMERCE_LIVE=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/team2-live-gate.sh`
- log_tail:

```text
    "manual_fallback": true
  }
}
[2/5] providers
{
  "ok": true,
  "paypal": {
    "enabled": false,
    "mode": "setup_required",
    "manual_fallback": true,
    "public": {
      "merchant_email": "pay@nguyenlananh.com"
    }
  }
}
[3/5] create-checkout
create-checkout did not create a PayPal order. This is expected until PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_WEBHOOK_ID are configured.
{
  "ok": false,
  "code": "PROVIDER_NOT_READY",
  "message": "PayPal is not configured yet."
}
[5/5] webhook smoke
{
  "ok": false,
  "code": "PAYPAL_NOT_CONFIGURED",
  "message": "PayPal webhook secrets are missing."
}
[extra] magic-link resend
{
  "queued": true,
  "template_id": "T02_MAGIC_LINK_RESEND",
  "expires_in_minutes": 15
}
Smoke run completed.
[PASS] payment/auth smoke completed

== Gate summary ==
FAILURES=1 WARNINGS=1
Live gate completed with failures.
```

### Step 4: Rails independent gate
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production REPORT_DIR=/tmp/team2-runtime-phase-gate.KUDlIm CHECK_PAGES_SECRETS=1 VN_VIA_PAY_IAI_ONE=1 INTL_PROVIDER=paypal REQUIRE_INTL_PROVIDER=0 REQUIRE_PROVIDER_READY=1 REQUIRE_COMPLETED=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-rails-independent-gate.sh`
- log_tail:

```text
== payment rails independent gate ==
UTC: 2026-05-10T14:42:57Z
Local: 2026-05-10 21:42:57 +0700
Base URL: https://www.nguyenlananh.com
Require INTL provider: 0
Require rail guard: 1
Require provider ready: 1
Require completed: 1
VN rail via pay.iai.one: 1
Check Pages secret names: 1

[PASS] health ok=true and db_ready=true
[PASS] providers endpoint returned valid JSON
[PASS] email_provider is mail_iai_one

== Pages secret names check ==
[PASS] read Pages secret names for env=production (count=15)
[PASS] rails endpoint returned rail catalog
[PASS] rail guard blocks VN identity on USD provider (code=VN_ID_REQUIRES_VND)
[PASS] rail guard blocks INTL identity on VND provider (code=INTERNATIONAL_ID_REQUIRES_USD)
[FAIL] VN rail provider is not ready yet (code=PROVIDER_NOT_READY)
[PASS] INTL provider readiness deferred for this phase (REQUIRE_INTL_PROVIDER=0)

== Missing secret checklist (from rail/provider signals) ==
[WARN] set these secrets before strict provider-ready proof:
  - PAY_IAI_ONE_API_KEY

Report: /tmp/team2-runtime-phase-gate.KUDlIm/PAYMENT_RAILS_INDEPENDENT_GATE_20260510_214257.md
FAILURES=1 WARNINGS=1
```

### Step 5: Payment proof smoke
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production CHECK_PAGES_SECRETS=1 VN_VIA_PAY_IAI_ONE=1 REQUIRE_STRIPE=0 REQUIRE_INTL_PROVIDER=0 REQUIRE_COMPLETED=1 USD_PROVIDER=paypal D1_NAME=nguyenlananh-payments-prod PAYMENTS_ADMIN_KEY=004ce4ce962ed7d0dee82a43db7b3670614ee7b0869b197db7f34bee50a926d1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-live-proof-smoke.sh`
- log_tail:

```text
      {
        "smoke_sent_email_with_provider_id": 0
      }
    ],
    "success": true,
    "meta": {
      "served_by": "v3-prod",
      "served_by_region": "APAC",
      "served_by_colo": "SIN",
      "served_by_primary": true,
      "timings": {
        "sql_duration_ms": 0.0771
      },
      "duration": 0.0771,
      "changes": 0,
      "last_row_id": 28,
      "changed_db": false,
      "size_after": 167936,
      "rows_read": 0,
      "rows_written": 0,
      "total_attempts": 1
    }
  }
]
payment_orders=0 email_jobs=0 vietqr_orders=0 webhook_events=28
vn_completed=0 usd_completed=0 sent_email_with_provider_id=0 smoke_sent_email_with_provider_id=0

== D1 latest order evidence for smoke emails ==
[]
[FAIL] No VN completed orders in D1 yet
[PASS] USD completion proof deferred for this phase (REQUIRE_INTL_PROVIDER=0)
[FAIL] No sent email rows with provider message IDs in D1 yet

== Missing secret checklist (from proof signals) ==
[WARN] set these secrets before strict proof run:
  - PAY_IAI_ONE_API_KEY

== Proof summary ==
FAILURES=4 WARNINGS=1
Proof smoke completed with failures.
```

## Summary

- total_steps: `5`
- passed_steps: `1`
- failed_steps: `4`
- skipped_steps: `0`
- connectivity_failed: `0`
- verdict: `BLOCKED_PENDING_EXTERNAL_RUNTIME_READINESS`

## Aggregates

### Expected Secret Contract
- `API_BASE_URL`
- `ENV_DEPLOY_TARGET`
- `REFUND_POLICY`
- `EMAIL_PROVIDER=mail_iai_one`
- `MAIL_API_BASE_URL`
- `MAIL_API_KEY`
- `MAIL_API_WORKSPACE_ID`
- `MAIL_API_WEBHOOK_SECRET`
- `EMAIL_FROM_SYSTEM`
- `EMAIL_FROM_PAY`
- `EMAIL_REPLY_TO_SUPPORT`
- `PAYMENTS_ADMIN_KEY`
- `PAY_IAI_ONE_API_KEY`

### Missing Secret Hints
- `PAY_IAI_ONE_API_KEY`

### External Blockers
- none

### Next Actions
- Set missing secrets using `scripts/provision-payment-live-secrets.sh`, redeploy, rerun strict mode.
