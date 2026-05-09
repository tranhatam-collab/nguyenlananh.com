#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
EXPECT_EMAIL_PROVIDER="${EXPECT_EMAIL_PROVIDER:-mail_iai_one}"
REQUIRE_PAYPAL="${REQUIRE_PAYPAL:-0}"
REQUIRE_STRIPE="${REQUIRE_STRIPE:-0}"
CHECK_PAGES_SECRETS="${CHECK_PAGES_SECRETS:-0}"
PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
TARGET_ENVS="${TARGET_ENVS:-production}"

FAILURES=0
MISSING=()

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "[FAIL] missing required command: $cmd"
    exit 1
  fi
}

pass() {
  echo "[PASS] $1"
}

fail() {
  echo "[FAIL] $1"
  FAILURES=$((FAILURES + 1))
}

queue_missing() {
  local item="$1"
  local existing
  for existing in "${MISSING[@]-}"; do
    if [ "$existing" = "$item" ]; then
      return
    fi
  done
  MISSING+=("$item")
}

append_provider_missing() {
  local provider="$1"
  case "$provider" in
    paypal)
      queue_missing "PAYPAL_CLIENT_ID"
      queue_missing "PAYPAL_CLIENT_SECRET"
      queue_missing "PAYPAL_WEBHOOK_ID"
      queue_missing "PAYPAL_MERCHANT_EMAIL"
      ;;
    stripe)
      queue_missing "STRIPE_SECRET_KEY"
      queue_missing "STRIPE_PUBLISHABLE_KEY"
      queue_missing "STRIPE_WEBHOOK_SECRET"
      ;;
    vietqr)
      queue_missing "VIETQR_BANK_BIN"
      queue_missing "VIETQR_ACCOUNT_NO"
      queue_missing "VIETQR_ACCOUNT_NAME"
      ;;
    *)
      ;;
  esac
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
    VIETQR_BANK_BIN
    VIETQR_ACCOUNT_NO
    VIETQR_ACCOUNT_NAME
  )

  if [ "$REQUIRE_PAYPAL" = "1" ]; then
    required+=(
      PAYPAL_MERCHANT_EMAIL
      PAYPAL_CLIENT_ID
      PAYPAL_CLIENT_SECRET
      PAYPAL_WEBHOOK_ID
    )
  fi

  if [ "$REQUIRE_STRIPE" = "1" ]; then
    required+=(
      STRIPE_SECRET_KEY
      STRIPE_PUBLISHABLE_KEY
      STRIPE_WEBHOOK_SECRET
    )
  fi

  if ! list_output="$(wrangler pages secret list --project-name "$PROJECT_NAME" --env "$target_env" 2>/dev/null)"; then
    fail "unable to list Pages secrets for env=$target_env (check wrangler auth/project/env)"
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
      fail "Pages env=$target_env missing secret name: $key"
      queue_missing "$key"
    fi
  done
}

need_cmd curl
need_cmd jq
if [ "$CHECK_PAGES_SECRETS" = "1" ]; then
  need_cmd wrangler
fi

echo "== payment live secrets preflight =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Base URL: $BASE_URL"
echo "Require PayPal in this phase: $REQUIRE_PAYPAL"
echo "Require Stripe in this phase: $REQUIRE_STRIPE"
echo "Check Pages secret names: $CHECK_PAGES_SECRETS"
echo

health_json="$(curl -sS "$BASE_URL/api/payments/health" 2>/dev/null || true)"
if printf "%s" "$health_json" | jq empty >/dev/null 2>&1; then
  ok="$(printf "%s" "$health_json" | jq -r '.ok // false')"
  db_ready="$(printf "%s" "$health_json" | jq -r '.environment.db_ready // false')"
  if [ "$ok" = "true" ] && [ "$db_ready" = "true" ]; then
    pass "health ok=true and db_ready=true"
  else
    fail "health is not ready: ok=$ok db_ready=$db_ready"
  fi
else
  fail "health endpoint did not return valid JSON"
fi

providers_json="$(curl -sS "$BASE_URL/api/payments/providers" 2>/dev/null || true)"
if ! printf "%s" "$providers_json" | jq empty >/dev/null 2>&1; then
  fail "providers endpoint did not return valid JSON"
else
  pass "providers endpoint returned valid JSON"

  email_provider="$(printf "%s" "$providers_json" | jq -r '.environment.email_provider // "unknown"')"
  if [ "$email_provider" = "$EXPECT_EMAIL_PROVIDER" ]; then
    pass "email_provider is $EXPECT_EMAIL_PROVIDER"
  else
    fail "email_provider is $email_provider (expected $EXPECT_EMAIL_PROVIDER)"
    queue_missing "EMAIL_PROVIDER=$EXPECT_EMAIL_PROVIDER"
    queue_missing "MAIL_API_BASE_URL"
    queue_missing "MAIL_API_KEY"
    queue_missing "MAIL_API_WORKSPACE_ID"
    queue_missing "MAIL_API_WEBHOOK_SECRET"
    queue_missing "EMAIL_FROM_SYSTEM"
    queue_missing "EMAIL_FROM_PAY"
    queue_missing "EMAIL_REPLY_TO_SUPPORT"
  fi

  provider_codes=(vietqr)
  if [ "$REQUIRE_PAYPAL" = "1" ]; then
    provider_codes=(paypal "${provider_codes[@]}")
  fi
  if [ "$REQUIRE_STRIPE" = "1" ]; then
    provider_codes=(stripe "${provider_codes[@]}")
  fi

  for code in "${provider_codes[@]}"; do
    enabled="$(printf "%s" "$providers_json" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.enabled // false)')"
    mode="$(printf "%s" "$providers_json" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.mode // "unknown")')"
    if [ "$enabled" = "true" ]; then
      pass "$code enabled=true"
      continue
    fi

    if [ "$mode" = "setup_required" ]; then
      fail "$code enabled=false (mode=setup_required)"
      append_provider_missing "$code"
    else
      fail "$code enabled=false (mode=$mode)"
    fi
  done
  if [ "$REQUIRE_PAYPAL" != "1" ]; then
    pass "paypal readiness deferred for this phase (REQUIRE_PAYPAL=0)"
  fi
  if [ "$REQUIRE_STRIPE" != "1" ]; then
    pass "stripe readiness deferred for this phase (REQUIRE_STRIPE=0)"
  fi
fi

if [ "$CHECK_PAGES_SECRETS" = "1" ]; then
  echo
  echo "== Pages secret names check =="
  for env_name in $TARGET_ENVS; do
    check_pages_secret_names "$env_name"
  done
fi

echo
echo "== Missing secret checklist =="
if [ "${#MISSING[@]}" -eq 0 ]; then
  pass "no missing secrets detected for this phase"
else
  for item in "${MISSING[@]}"; do
    echo "  - $item"
  done
fi

echo
echo "Summary: failures=$FAILURES missing=${#MISSING[@]}"

if [ "$FAILURES" -gt 0 ]; then
  exit 1
fi
exit 0
