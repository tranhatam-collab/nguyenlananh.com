# TEAM2_RUNTIME_PHASE_GATE

- generated_at_utc: 2026-05-09T07:16:10Z
- generated_at_local: 2026-05-09 14:16:10 +0700
- base_url: `https://www.nguyenlananh.com`
- project_name: `nguyenlananh-com`
- target_envs: `production`
- require_paypal: `0`
- require_stripe: `0`
- require_intl_provider: `0`
- strict_mode: `0`
- check_pages_secrets: `1`
- intl_provider: `paypal`

## Step Results
### Step 1: Connectivity preflight
- status: `FAIL`
- exit_code: `1`
- command: `connectivity_preflight`
- log_tail:

```text
Connectivity check: https://www.nguyenlananh.com -> 000
[FAIL] base URL is unreachable (network or DNS)
```

## Summary

- total_steps: `1`
- passed_steps: `0`
- failed_steps: `1`
- skipped_steps: `4`
- connectivity_failed: `1`
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
- none

### External Blockers
- `BASE_URL_UNREACHABLE`

### Next Actions
- Fix external blockers first (DNS, Cloudflare access, local wrangler permission) then rerun gate.
