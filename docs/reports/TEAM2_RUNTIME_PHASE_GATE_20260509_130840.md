# TEAM2_RUNTIME_PHASE_GATE

- generated_at_utc: 2026-05-09T06:08:40Z
- generated_at_local: 2026-05-09 13:08:40 +0700
- base_url: `https://www.nguyenlananh.com`
- project_name: `nguyenlananh-com`
- target_envs: `production preview`
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
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production preview REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 CHECK_PAGES_SECRETS=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-live-secrets-preflight.sh`
- log_tail:

```text
[FAIL] Pages env=production missing secret name: MAIL_API_WORKSPACE_ID
[FAIL] Pages env=production missing secret name: MAIL_API_WEBHOOK_SECRET
[FAIL] Pages env=production missing secret name: VIETQR_BANK_BIN
[FAIL] Pages env=production missing secret name: VIETQR_ACCOUNT_NO
[FAIL] Pages env=production missing secret name: VIETQR_ACCOUNT_NAME
[PASS] read Pages secret names for env=preview (count=0)
[FAIL] Pages env=preview missing secret name: API_BASE_URL
[FAIL] Pages env=preview missing secret name: ENV_DEPLOY_TARGET
[FAIL] Pages env=preview missing secret name: REFUND_POLICY
[FAIL] Pages env=preview missing secret name: EMAIL_PROVIDER
[FAIL] Pages env=preview missing secret name: MAIL_API_BASE_URL
[FAIL] Pages env=preview missing secret name: MAIL_API_KEY
[FAIL] Pages env=preview missing secret name: MAIL_API_WORKSPACE_ID
[FAIL] Pages env=preview missing secret name: MAIL_API_WEBHOOK_SECRET
[FAIL] Pages env=preview missing secret name: EMAIL_FROM_SYSTEM
[FAIL] Pages env=preview missing secret name: EMAIL_FROM_PAY
[FAIL] Pages env=preview missing secret name: EMAIL_REPLY_TO_SUPPORT
[FAIL] Pages env=preview missing secret name: PAYMENTS_ADMIN_KEY
[FAIL] Pages env=preview missing secret name: VIETQR_BANK_BIN
[FAIL] Pages env=preview missing secret name: VIETQR_ACCOUNT_NO
[FAIL] Pages env=preview missing secret name: VIETQR_ACCOUNT_NAME

== Missing secret checklist ==
  - VIETQR_BANK_BIN
  - VIETQR_ACCOUNT_NO
  - VIETQR_ACCOUNT_NAME
  - MAIL_API_KEY
  - MAIL_API_WORKSPACE_ID
  - MAIL_API_WEBHOOK_SECRET
  - API_BASE_URL
  - ENV_DEPLOY_TARGET
  - REFUND_POLICY
  - EMAIL_PROVIDER
  - MAIL_API_BASE_URL
  - EMAIL_FROM_SYSTEM
  - EMAIL_FROM_PAY
  - EMAIL_REPLY_TO_SUPPORT
  - PAYMENTS_ADMIN_KEY

Summary: failures=22 missing=15
```

### Step 3: Team 2 live gate
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production preview REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 CHECK_PAGES_SECRETS=1 ENFORCE_COMMERCE_LIVE=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/team2-live-gate.sh`
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
FAILURES=22 WARNINGS=1
Live gate completed with failures.
```

### Step 4: Rails independent gate
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production preview REPORT_DIR=/tmp/team2-runtime-phase-gate.PRfPyZ CHECK_PAGES_SECRETS=1 INTL_PROVIDER=paypal REQUIRE_INTL_PROVIDER=0 REQUIRE_PROVIDER_READY=1 REQUIRE_COMPLETED=1 bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-rails-independent-gate.sh`
- log_tail:

```text
[FAIL] Pages env=preview missing secret name: ENV_DEPLOY_TARGET
[FAIL] Pages env=preview missing secret name: REFUND_POLICY
[FAIL] Pages env=preview missing secret name: EMAIL_PROVIDER
[FAIL] Pages env=preview missing secret name: MAIL_API_BASE_URL
[FAIL] Pages env=preview missing secret name: MAIL_API_KEY
[FAIL] Pages env=preview missing secret name: MAIL_API_WORKSPACE_ID
[FAIL] Pages env=preview missing secret name: MAIL_API_WEBHOOK_SECRET
[FAIL] Pages env=preview missing secret name: EMAIL_FROM_SYSTEM
[FAIL] Pages env=preview missing secret name: EMAIL_FROM_PAY
[FAIL] Pages env=preview missing secret name: EMAIL_REPLY_TO_SUPPORT
[FAIL] Pages env=preview missing secret name: PAYMENTS_ADMIN_KEY
[FAIL] Pages env=preview missing secret name: VIETQR_BANK_BIN
[FAIL] Pages env=preview missing secret name: VIETQR_ACCOUNT_NO
[FAIL] Pages env=preview missing secret name: VIETQR_ACCOUNT_NAME
[PASS] rails endpoint returned rail catalog
[PASS] rail guard blocks VN identity on USD provider (code=VN_ID_REQUIRES_VND)
[PASS] rail guard blocks INTL identity on VND provider (code=INTERNATIONAL_ID_REQUIRES_USD)
[FAIL] VN rail provider is not ready yet (code=PROVIDER_NOT_READY)
[PASS] INTL provider readiness deferred for this phase (REQUIRE_INTL_PROVIDER=0)

== Missing secret checklist (from rail/provider signals) ==
[WARN] set these secrets before strict provider-ready proof:
  - MAIL_API_KEY
  - MAIL_API_WORKSPACE_ID
  - MAIL_API_WEBHOOK_SECRET
  - VIETQR_BANK_BIN
  - VIETQR_ACCOUNT_NO
  - VIETQR_ACCOUNT_NAME
  - API_BASE_URL
  - ENV_DEPLOY_TARGET
  - REFUND_POLICY
  - EMAIL_PROVIDER
  - MAIL_API_BASE_URL
  - EMAIL_FROM_SYSTEM
  - EMAIL_FROM_PAY
  - EMAIL_REPLY_TO_SUPPORT
  - PAYMENTS_ADMIN_KEY

Report: /tmp/team2-runtime-phase-gate.PRfPyZ/PAYMENT_RAILS_INDEPENDENT_GATE_20260509_130903.md
FAILURES=22 WARNINGS=1
```

### Step 5: Payment proof smoke
- status: `FAIL`
- exit_code: `1`
- command: `env BASE_URL=https://www.nguyenlananh.com PROJECT_NAME=nguyenlananh-com TARGET_ENVS=production preview CHECK_PAGES_SECRETS=1 REQUIRE_STRIPE=0 REQUIRE_INTL_PROVIDER=0 REQUIRE_COMPLETED=1 USD_PROVIDER=paypal D1_NAME=nguyenlananh-payments-prod PAYMENTS_ADMIN_KEY= bash /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com/scripts/payment-live-proof-smoke.sh`
- log_tail:

```text
      "changes": 0,
      "last_row_id": 22,
      "changed_db": false,
      "size_after": 163840,
      "rows_read": 0,
      "rows_written": 0,
      "total_attempts": 1
    }
  }
]
payment_orders=0 email_jobs=0 vietqr_orders=0 webhook_events=22
vn_completed=0 usd_completed=0 sent_email_with_provider_id=0 smoke_sent_email_with_provider_id=0

== D1 latest order evidence for smoke emails ==
[]
[FAIL] No VN completed orders in D1 yet
[PASS] USD completion proof deferred for this phase (REQUIRE_INTL_PROVIDER=0)
[FAIL] No sent email rows with provider message IDs in D1 yet

== Missing secret checklist (from proof signals) ==
[WARN] set these secrets before strict proof run:
  - VIETQR_BANK_BIN
  - VIETQR_ACCOUNT_NO
  - VIETQR_ACCOUNT_NAME
  - MAIL_API_KEY
  - MAIL_API_WORKSPACE_ID
  - MAIL_API_WEBHOOK_SECRET
  - API_BASE_URL
  - ENV_DEPLOY_TARGET
  - REFUND_POLICY
  - EMAIL_PROVIDER
  - MAIL_API_BASE_URL
  - EMAIL_FROM_SYSTEM
  - EMAIL_FROM_PAY
  - EMAIL_REPLY_TO_SUPPORT
  - PAYMENTS_ADMIN_KEY

== Proof summary ==
FAILURES=25 WARNINGS=1
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
- `VIETQR_BANK_BIN`
- `VIETQR_ACCOUNT_NO`
- `VIETQR_ACCOUNT_NAME`

### Missing Secret Hints
- `MAIL_API_KEY`
- `MAIL_API_WORKSPACE_ID`
- `MAIL_API_WEBHOOK_SECRET`
- `VIETQR_BANK_BIN`
- `VIETQR_ACCOUNT_NO`
- `VIETQR_ACCOUNT_NAME`
- `API_BASE_URL`
- `ENV_DEPLOY_TARGET`
- `REFUND_POLICY`
- `EMAIL_PROVIDER`
- `MAIL_API_BASE_URL`
- `EMAIL_FROM_SYSTEM`
- `EMAIL_FROM_PAY`
- `EMAIL_REPLY_TO_SUPPORT`
- `PAYMENTS_ADMIN_KEY`

### External Blockers
- none

### Next Actions
- Set missing secrets using `scripts/provision-payment-live-secrets.sh`, redeploy, rerun strict mode.
