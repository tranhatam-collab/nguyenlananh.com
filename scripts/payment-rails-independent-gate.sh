#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
PLAN_CODE="${PLAN_CODE:-year1}"
VN_EMAIL="${VN_EMAIL:-ops-rail-vn@nguyenlananh.com}"
INTL_EMAIL="${INTL_EMAIL:-ops-rail-intl@nguyenlananh.com}"
INTL_PROVIDER="${INTL_PROVIDER:-paypal}"
REQUIRE_INTL_PROVIDER="${REQUIRE_INTL_PROVIDER:-0}"
REQUIRE_RAIL_GUARD="${REQUIRE_RAIL_GUARD:-1}"
REQUIRE_PROVIDER_READY="${REQUIRE_PROVIDER_READY:-0}"
REQUIRE_COMPLETED="${REQUIRE_COMPLETED:-0}"
VN_VIA_PAY_IAI_ONE="${VN_VIA_PAY_IAI_ONE:-1}"
CHECK_PAGES_SECRETS="${CHECK_PAGES_SECRETS:-0}"
PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
TARGET_ENVS="${TARGET_ENVS:-production}"
REPORT_DIR="${REPORT_DIR:-$ROOT_DIR/docs/reports}"

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

need_cmd curl
need_cmd jq
if [ "$CHECK_PAGES_SECRETS" = "1" ]; then
  need_cmd wrangler
fi

STAMP_UTC="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
STAMP_LOCAL="$(date '+%Y-%m-%d %H:%M:%S %z')"
REPORT_TS="$(date '+%Y%m%d_%H%M%S')"
REPORT_PATH="$REPORT_DIR/PAYMENT_RAILS_INDEPENDENT_GATE_${REPORT_TS}.md"

FAILURES=0
WARNINGS=0
MISSING_SECRET_HINTS=()

pass() {
  local msg="$1"
  echo "[PASS] $msg"
}

warn() {
  local msg="$1"
  echo "[WARN] $msg"
  WARNINGS=$((WARNINGS + 1))
}

fail() {
  local msg="$1"
  echo "[FAIL] $msg"
  FAILURES=$((FAILURES + 1))
}

queue_secret_hint() {
  local item="$1"
  local existing
  for existing in "${MISSING_SECRET_HINTS[@]-}"; do
    if [ "$existing" = "$item" ]; then
      return
    fi
  done
  MISSING_SECRET_HINTS+=("$item")
}

append_provider_secret_hints() {
  local provider="$1"
  case "$provider" in
    paypal)
      queue_secret_hint "PAYPAL_CLIENT_ID"
      queue_secret_hint "PAYPAL_CLIENT_SECRET"
      queue_secret_hint "PAYPAL_WEBHOOK_ID"
      queue_secret_hint "PAYPAL_MERCHANT_EMAIL"
      ;;
    stripe)
      queue_secret_hint "STRIPE_SECRET_KEY"
      queue_secret_hint "STRIPE_PUBLISHABLE_KEY"
      queue_secret_hint "STRIPE_WEBHOOK_SECRET"
      ;;
    vietqr)
      if [ "$VN_VIA_PAY_IAI_ONE" = "1" ]; then
        queue_secret_hint "PAY_IAI_ONE_API_KEY"
      else
        queue_secret_hint "VIETQR_BANK_BIN"
        queue_secret_hint "VIETQR_ACCOUNT_NO"
        queue_secret_hint "VIETQR_ACCOUNT_NAME"
      fi
      ;;
    *)
      ;;
  esac
}

append_mail_secret_hints() {
  queue_secret_hint "EMAIL_PROVIDER=mail_iai_one"
  queue_secret_hint "MAIL_API_BASE_URL"
  queue_secret_hint "MAIL_API_KEY"
  queue_secret_hint "MAIL_API_WORKSPACE_ID"
  queue_secret_hint "MAIL_API_WEBHOOK_SECRET"
  queue_secret_hint "EMAIL_FROM_SYSTEM"
  queue_secret_hint "EMAIL_FROM_PAY"
  queue_secret_hint "EMAIL_REPLY_TO_SUPPORT"
}

guard_fail_or_warn() {
  local msg="$1"
  if [ "$REQUIRE_RAIL_GUARD" = "1" ]; then
    fail "$msg"
  else
    warn "$msg"
  fi
}

ready_fail_or_warn() {
  local msg="$1"
  if [ "$REQUIRE_PROVIDER_READY" = "1" ]; then
    fail "$msg"
  else
    warn "$msg"
  fi
}

check_pages_secret_names() {
  local target_env="$1"
  local list_output
  local parsed_names
  local required=(
    API_BASE_URL
    ENV_DEPLOY_TARGET
    REFUND_POLICY
    EMAIL_PROVIDER
    MAIL_API_BASE_URL
    MAIL_API_KEY
    MAIL_API_WORKSPACE_ID
    MAIL_API_WEBHOOK_SECRET
    EMAIL_FROM_SYSTEM
    EMAIL_FROM_PAY
    EMAIL_REPLY_TO_SUPPORT
    PAYMENTS_ADMIN_KEY
  )

  if [ "$VN_VIA_PAY_IAI_ONE" = "1" ]; then
    required+=(PAY_IAI_ONE_API_KEY)
  else
    required+=(
      VIETQR_BANK_BIN
      VIETQR_ACCOUNT_NO
      VIETQR_ACCOUNT_NAME
    )
  fi

  if [ "$REQUIRE_INTL_PROVIDER" = "1" ]; then
    case "$INTL_PROVIDER" in
      paypal)
        required+=(
          PAYPAL_CLIENT_ID
          PAYPAL_CLIENT_SECRET
          PAYPAL_WEBHOOK_ID
          PAYPAL_MERCHANT_EMAIL
        )
        ;;
      stripe)
        required+=(
          STRIPE_SECRET_KEY
          STRIPE_PUBLISHABLE_KEY
          STRIPE_WEBHOOK_SECRET
        )
        ;;
      *)
        ;;
    esac
  fi

  if ! list_output="$(wrangler pages secret list --project-name "$PROJECT_NAME" --env "$target_env" 2>/dev/null)"; then
    ready_fail_or_warn "unable to list Pages secrets for env=$target_env (check wrangler auth/project/env)"
    return
  fi

  parsed_names="$(printf "%s\n" "$list_output" | sed -n 's/^  - \([^:]*\):.*/\1/p')"
  local secret_count=0
  if [ -n "$parsed_names" ]; then
    secret_count="$(printf "%s\n" "$parsed_names" | wc -l | tr -d ' ')"
  fi
  pass "read Pages secret names for env=$target_env (count=$secret_count)"

  local key
  for key in "${required[@]}"; do
    if ! grep -Fxq "$key" <<< "$parsed_names"; then
      queue_secret_hint "$key"
      ready_fail_or_warn "Pages env=$target_env missing secret name: $key"
    fi
  done
}

mkdir -p "$REPORT_DIR"

checkout_probe() {
  local provider="$1"
  local country="$2"
  local email="$3"
  local locale="$4"
  local key="$5"

  curl -sS -X POST "$BASE_URL/api/payments/create-checkout" \
    -H "content-type: application/json" \
    -H "x-idempotency-key: $key" \
    --data "{\"email\":\"$email\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"$country\",\"provider\":\"$provider\",\"locale\":\"$locale\",\"next_path\":\"/members/dashboard/\"}" \
    2>/dev/null || true
}

echo "== payment rails independent gate =="
echo "UTC: $STAMP_UTC"
echo "Local: $STAMP_LOCAL"
echo "Base URL: $BASE_URL"
echo "Require INTL provider: $REQUIRE_INTL_PROVIDER"
echo "Require rail guard: $REQUIRE_RAIL_GUARD"
echo "Require provider ready: $REQUIRE_PROVIDER_READY"
echo "Require completed: $REQUIRE_COMPLETED"
echo "VN rail via pay.iai.one: $VN_VIA_PAY_IAI_ONE"
echo "Check Pages secret names: $CHECK_PAGES_SECRETS"
echo

HEALTH_JSON="$(curl -sS "$BASE_URL/api/payments/health" 2>/dev/null || true)"
if printf "%s" "$HEALTH_JSON" | jq empty >/dev/null 2>&1; then
  if printf "%s" "$HEALTH_JSON" | jq -e '.ok == true and .environment.db_ready == true' >/dev/null 2>&1; then
    pass "health ok=true and db_ready=true"
  else
    fail "health endpoint did not return ok=true and db_ready=true"
  fi
else
  fail "health endpoint returned invalid JSON"
fi

PROVIDERS_JSON="$(curl -sS "$BASE_URL/api/payments/providers" 2>/dev/null || true)"
if printf "%s" "$PROVIDERS_JSON" | jq empty >/dev/null 2>&1; then
  pass "providers endpoint returned valid JSON"
  email_provider="$(printf "%s" "$PROVIDERS_JSON" | jq -r '.environment.email_provider // "unknown"' 2>/dev/null || echo unknown)"
  if [ "$email_provider" != "mail_iai_one" ]; then
    ready_fail_or_warn "email_provider is $email_provider (expected mail_iai_one)"
    append_mail_secret_hints
  else
    pass "email_provider is mail_iai_one"
  fi
else
  fail "providers endpoint returned invalid JSON"
fi

if [ "$CHECK_PAGES_SECRETS" = "1" ]; then
  echo
  echo "== Pages secret names check =="
  for env_name in $TARGET_ENVS; do
    check_pages_secret_names "$env_name"
  done
fi

RAILS_JSON="$(curl -sS "$BASE_URL/api/payments/rails" 2>/dev/null || true)"
if printf "%s" "$RAILS_JSON" | jq empty >/dev/null 2>&1; then
  if printf "%s" "$RAILS_JSON" | jq -e '.ok == true and (.rails | length) >= 2' >/dev/null 2>&1; then
    pass "rails endpoint returned rail catalog"
  else
    fail "rails endpoint JSON missing expected catalog structure"
  fi
else
  fail "rails endpoint returned invalid JSON"
fi

PROBE_VN_USD_KEY="rail-vn-usd-$(date +%s)"
PROBE_INTL_VND_KEY="rail-intl-vnd-$(date +%s)"
PROBE_VN_VND_KEY="rail-vn-vnd-$(date +%s)"
PROBE_INTL_USD_KEY="rail-intl-usd-$(date +%s)"

VN_USD_JSON="$(checkout_probe paypal VN "$VN_EMAIL" vi "$PROBE_VN_USD_KEY")"
VN_USD_CODE="$(printf "%s" "$VN_USD_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$VN_USD_CODE" = "VN_ID_REQUIRES_VND" ]; then
  pass "rail guard blocks VN identity on USD provider (code=VN_ID_REQUIRES_VND)"
else
  guard_fail_or_warn "VN->USD probe expected VN_ID_REQUIRES_VND, got ${VN_USD_CODE:-unknown}"
fi

INTL_VND_JSON="$(checkout_probe vietqr INTL "$INTL_EMAIL" en "$PROBE_INTL_VND_KEY")"
INTL_VND_CODE="$(printf "%s" "$INTL_VND_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$INTL_VND_CODE" = "INTERNATIONAL_ID_REQUIRES_USD" ]; then
  pass "rail guard blocks INTL identity on VND provider (code=INTERNATIONAL_ID_REQUIRES_USD)"
else
  guard_fail_or_warn "INTL->VND probe expected INTERNATIONAL_ID_REQUIRES_USD, got ${INTL_VND_CODE:-unknown}"
fi

VN_VND_JSON="$(checkout_probe vietqr VN "$VN_EMAIL" vi "$PROBE_VN_VND_KEY")"
VN_VND_OK="$(printf "%s" "$VN_VND_JSON" | jq -r '.ok // false' 2>/dev/null || echo false)"
VN_VND_CODE="$(printf "%s" "$VN_VND_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$VN_VND_OK" = "true" ]; then
  pass "VN rail probe on vietqr accepted"
elif [ "$VN_VND_CODE" = "PROVIDER_NOT_READY" ]; then
  append_provider_secret_hints "vietqr"
  ready_fail_or_warn "VN rail provider is not ready yet (code=PROVIDER_NOT_READY)"
else
  fail "VN rail probe failed with code=${VN_VND_CODE:-unknown}"
fi

INTL_USD_JSON='{"ok":false,"code":"DEFERRED_PHASE","message":"INTL provider readiness deferred in this phase."}'
if [ "$REQUIRE_INTL_PROVIDER" = "1" ]; then
  INTL_USD_JSON="$(checkout_probe "$INTL_PROVIDER" INTL "$INTL_EMAIL" en "$PROBE_INTL_USD_KEY")"
  INTL_USD_OK="$(printf "%s" "$INTL_USD_JSON" | jq -r '.ok // false' 2>/dev/null || echo false)"
  INTL_USD_CODE="$(printf "%s" "$INTL_USD_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
  INTL_USD_URL="$(printf "%s" "$INTL_USD_JSON" | jq -r '.checkout_url // ""' 2>/dev/null || true)"
  if [ "$INTL_USD_OK" = "true" ] && [ -n "$INTL_USD_URL" ]; then
    pass "INTL rail probe on $INTL_PROVIDER returned checkout_url"
  elif [ "$INTL_USD_CODE" = "PROVIDER_NOT_READY" ]; then
    append_provider_secret_hints "$INTL_PROVIDER"
    ready_fail_or_warn "INTL rail provider $INTL_PROVIDER is not ready yet (code=PROVIDER_NOT_READY)"
  else
    fail "INTL rail probe failed with code=${INTL_USD_CODE:-unknown}"
  fi
else
  pass "INTL provider readiness deferred for this phase (REQUIRE_INTL_PROVIDER=0)"
fi

echo
echo "== Missing secret checklist (from rail/provider signals) =="
if [ "${#MISSING_SECRET_HINTS[@]}" -eq 0 ]; then
  pass "no missing secret hints detected from current rail checks"
else
  warn "set these secrets before strict provider-ready proof:"
  for hint in "${MISSING_SECRET_HINTS[@]}"; do
    echo "  - $hint"
  done
fi

{
  echo "# PAYMENT_RAILS_INDEPENDENT_GATE"
  echo
  echo "- generated_at_utc: $STAMP_UTC"
  echo "- generated_at_local: $STAMP_LOCAL"
  echo "- base_url: \`$BASE_URL\`"
  echo "- require_intl_provider: \`$REQUIRE_INTL_PROVIDER\`"
  echo "- intl_provider: \`$INTL_PROVIDER\`"
  echo "- require_rail_guard: \`$REQUIRE_RAIL_GUARD\`"
  echo "- require_provider_ready: \`$REQUIRE_PROVIDER_READY\`"
  echo "- require_completed: \`$REQUIRE_COMPLETED\`"
  echo
  echo "## Summary"
  echo
  echo "- failures: \`$FAILURES\`"
  echo "- warnings: \`$WARNINGS\`"
  echo
  echo "## Health"
  echo
  echo '```json'
  printf "%s\n" "$HEALTH_JSON" | jq .
  echo '```'
  echo
  echo "## Providers"
  echo
  echo '```json'
  printf "%s\n" "$PROVIDERS_JSON" | jq .
  echo '```'
  echo
  echo "## Rails"
  echo
  echo '```json'
  printf "%s\n" "$RAILS_JSON" | jq .
  echo '```'
  echo
  echo "## Probes"
  echo
  echo "### VN identity + PayPal (must block)"
  echo '```json'
  printf "%s\n" "$VN_USD_JSON" | jq .
  echo '```'
  echo
  echo "### INTL identity + VietQR (must block)"
  echo '```json'
  printf "%s\n" "$INTL_VND_JSON" | jq .
  echo '```'
  echo
  echo "### VN identity + VietQR"
  echo '```json'
  printf "%s\n" "$VN_VND_JSON" | jq .
  echo '```'
  echo
  echo "### INTL identity + $INTL_PROVIDER"
  echo '```json'
  printf "%s\n" "$INTL_USD_JSON" | jq .
  echo '```'
} >"$REPORT_PATH"

echo
echo "Report: $REPORT_PATH"
echo "FAILURES=$FAILURES WARNINGS=$WARNINGS"

if [ "$FAILURES" -gt 0 ]; then
  exit 1
fi

if [ "$REQUIRE_COMPLETED" = "1" ] && [ "$WARNINGS" -gt 0 ]; then
  exit 1
fi

exit 0
