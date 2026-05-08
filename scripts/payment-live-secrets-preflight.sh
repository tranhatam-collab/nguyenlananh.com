#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
EXPECT_EMAIL_PROVIDER="${EXPECT_EMAIL_PROVIDER:-mail_iai_one}"
REQUIRE_STRIPE="${REQUIRE_STRIPE:-0}"

FAILURES=0
MISSING=()

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

echo "== payment live secrets preflight =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Base URL: $BASE_URL"
echo "Require Stripe in this phase: $REQUIRE_STRIPE"
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

  provider_codes=(paypal vietqr)
  if [ "$REQUIRE_STRIPE" = "1" ]; then
    provider_codes=(paypal stripe vietqr)
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
