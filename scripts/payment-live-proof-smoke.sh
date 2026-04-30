#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
D1_NAME="${D1_NAME:-nguyenlananh-payments-prod}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-62d57eaa548617aeecac766e5a1cb98e}"

VN_EMAIL="${VN_EMAIL:-ops-smoke+vn@nguyenlananh.com}"
USD_EMAIL="${USD_EMAIL:-ops-smoke+intl@nguyenlananh.com}"
PLAN_CODE="${PLAN_CODE:-year1}"
USD_PROVIDER="${USD_PROVIDER:-paypal}"
VN_DOMAIN="${VN_DOMAIN:-https://nguyenlananh.com}"
WWW_DOMAIN="${WWW_DOMAIN:-https://www.nguyenlananh.com}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-https://admin.nguyenlananh.com}"
VN_LOCALE="${VN_LOCALE:-vi}"
USD_LOCALE="${USD_LOCALE:-en}"
NEXT_PATH="${NEXT_PATH:-/members/dashboard/}"
PAYMENTS_ADMIN_KEY="${PAYMENTS_ADMIN_KEY:-}"
REQUIRE_COMPLETED="${REQUIRE_COMPLETED:-0}"

VN_KEY="smoke-vn-$(date +%s)"
USD_KEY="smoke-usd-$(date +%s)"
CONFIRM_KEY="smoke-confirm-$(date +%s)"
PROVIDER_REF="ops_smoke_$(date +%s)"
FAILURES=0
WARNINGS=0

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

need_cmd curl
need_cmd jq
need_cmd wrangler

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

require_or_warn() {
  local msg="$1"
  if [ "$REQUIRE_COMPLETED" = "1" ]; then
    fail "$msg"
  else
    warn "$msg"
  fi
}

print_status() {
  local url="$1"
  local label="$2"
  local expected="${3:-200}"
  local code
  if code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)"; then
    :
  else
    code="000"
  fi
  echo "$url -> $code"
  if [ "$code" = "$expected" ]; then
    pass "$label returned HTTP $expected"
  else
    fail "$label returned HTTP $code (expected $expected)"
  fi
}

echo "== web cutover status =="
echo "Require completed proof: $REQUIRE_COMPLETED"
print_status "$VN_DOMAIN" "apex domain"
print_status "$WWW_DOMAIN" "www domain"
print_status "$ADMIN_DOMAIN" "admin domain"
echo

echo "== providers =="
PROVIDERS_RES="$(curl -sS "$BASE_URL/api/payments/providers" 2>/dev/null || true)"
if printf "%s" "$PROVIDERS_RES" | jq empty >/dev/null 2>&1; then
  printf "%s" "$PROVIDERS_RES" | jq .
  for code in paypal stripe vietqr; do
    enabled="$(printf "%s" "$PROVIDERS_RES" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.enabled // false)')"
    mode="$(printf "%s" "$PROVIDERS_RES" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.mode // "unknown")')"
    if [ "$enabled" = "true" ]; then
      pass "$code enabled (mode=$mode)"
    else
      require_or_warn "$code not enabled (mode=$mode)"
    fi
  done
  email_provider="$(printf "%s" "$PROVIDERS_RES" | jq -r '.environment.email_provider // "unknown"')"
  if [ "$email_provider" = "mail_iai_one" ]; then
    pass "email_provider is mail_iai_one"
  else
    require_or_warn "email_provider is $email_provider (expected mail_iai_one)"
  fi
else
  fail "providers response was not valid JSON"
fi
echo
echo

echo "== health =="
HEALTH_RES="$(curl -sS "$BASE_URL/api/payments/health" 2>/dev/null || true)"
if printf "%s" "$HEALTH_RES" | jq empty >/dev/null 2>&1; then
  printf "%s" "$HEALTH_RES" | jq .
  health_ok="$(printf "%s" "$HEALTH_RES" | jq -r '.ok // false')"
  db_ready="$(printf "%s" "$HEALTH_RES" | jq -r '.environment.db_ready // false')"
  if [ "$health_ok" = "true" ] && [ "$db_ready" = "true" ]; then
    pass "health ok + db_ready true"
  else
    fail "health did not return ok=true and db_ready=true"
  fi
else
  fail "health response was not valid JSON"
fi
echo
echo

echo "== VN rail create-order (vietqr) =="
VN_RES="$(curl -sS -X POST "$BASE_URL/api/payments/vietqr/create-order" \
  -H "content-type: application/json" \
  -H "x-idempotency-key: $VN_KEY" \
  --data "{\"email\":\"$VN_EMAIL\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"VN\",\"locale\":\"$VN_LOCALE\",\"next_path\":\"$NEXT_PATH\"}" 2>/dev/null || true)"
echo "$VN_RES"
echo

VN_ORDER_ID="$(printf "%s" "$VN_RES" | jq -r '.internal_order_id // empty' 2>/dev/null || true)"
VN_OK="$(printf "%s" "$VN_RES" | jq -r '.ok // false' 2>/dev/null || echo false)"
VN_CODE="$(printf "%s" "$VN_RES" | jq -r '.code // empty' 2>/dev/null || true)"

if [ "$VN_OK" = "true" ] && [ -n "$VN_ORDER_ID" ]; then
  pass "VN create-order returned internal_order_id=$VN_ORDER_ID"
else
  if [ "$VN_CODE" = "PROVIDER_NOT_READY" ]; then
    require_or_warn "VN rail not ready yet (PROVIDER_NOT_READY)"
  else
    fail "VN create-order failed with code=${VN_CODE:-unknown}"
  fi
fi

if [ -n "$VN_ORDER_ID" ]; then
  echo "== VN mark-pending =="
  VN_PENDING_RES="$(curl -sS -X POST "$BASE_URL/api/payments/vietqr/mark-pending" \
    -H "content-type: application/json" \
    --data "{\"internal_order_id\":\"$VN_ORDER_ID\",\"email\":\"$VN_EMAIL\"}" 2>/dev/null || true)"
  echo "$VN_PENDING_RES"
  if printf "%s" "$VN_PENDING_RES" | jq -e '.ok == true' >/dev/null 2>&1; then
    pass "VN mark-pending queued"
  else
    fail "VN mark-pending did not return ok=true"
  fi
  echo

  if [ -n "$PAYMENTS_ADMIN_KEY" ]; then
    echo "== VN admin confirm (with PAYMENTS_ADMIN_KEY) =="
    VN_CONFIRM_RES="$(curl -sS -X POST "$BASE_URL/api/admin/vietqr-confirm" \
      -H "content-type: application/json" \
      -H "x-admin-key: $PAYMENTS_ADMIN_KEY" \
      -H "x-idempotency-key: $CONFIRM_KEY" \
      --data "{\"internal_order_id\":\"$VN_ORDER_ID\",\"provider_ref\":\"$PROVIDER_REF\",\"confirmed_by\":\"ops-smoke\"}" 2>/dev/null || true)"
    echo "$VN_CONFIRM_RES"
    if printf "%s" "$VN_CONFIRM_RES" | jq -e '.ok == true' >/dev/null 2>&1; then
      pass "VN admin confirm completed"
    else
      fail "VN admin confirm did not return ok=true"
    fi
    echo
  else
    echo "== VN admin confirm skipped: PAYMENTS_ADMIN_KEY is empty =="
    require_or_warn "PAYMENTS_ADMIN_KEY missing, cannot auto-confirm VN rail"
    echo
  fi
fi

echo "== USD rail create-checkout ($USD_PROVIDER) =="
USD_RES="$(curl -sS -X POST "$BASE_URL/api/payments/create-checkout" \
  -H "content-type: application/json" \
  -H "x-idempotency-key: $USD_KEY" \
  --data "{\"email\":\"$USD_EMAIL\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"INTL\",\"provider\":\"$USD_PROVIDER\",\"locale\":\"$USD_LOCALE\",\"next_path\":\"$NEXT_PATH\"}" 2>/dev/null || true)"
echo "$USD_RES"
echo

USD_CHECKOUT_URL="$(printf "%s" "$USD_RES" | jq -r '.checkout_url // empty' 2>/dev/null || true)"
USD_OK="$(printf "%s" "$USD_RES" | jq -r '.ok // false' 2>/dev/null || echo false)"
USD_CODE="$(printf "%s" "$USD_RES" | jq -r '.code // empty' 2>/dev/null || true)"
if [ -n "$USD_CHECKOUT_URL" ]; then
  pass "USD checkout created"
  echo "USD checkout URL:"
  echo "$USD_CHECKOUT_URL"
  echo
else
  if [ "$USD_OK" = "true" ]; then
    require_or_warn "USD checkout response ok=true but checkout_url was empty"
  elif [ "$USD_CODE" = "PROVIDER_NOT_READY" ]; then
    require_or_warn "USD rail not ready yet (PROVIDER_NOT_READY)"
  else
    fail "USD create-checkout failed with code=${USD_CODE:-unknown}"
  fi
fi

echo "== D1 evidence counters =="
cd "$ROOT_DIR"
COUNTS_JSON="$(wrangler d1 execute "$D1_NAME" --remote --json --command \
  "SELECT COUNT(*) AS payment_orders FROM payment_orders; \
   SELECT COUNT(*) AS email_jobs FROM email_jobs; \
   SELECT COUNT(*) AS vietqr_orders FROM vietqr_orders; \
   SELECT COUNT(*) AS webhook_events FROM webhook_events; \
   SELECT COUNT(*) AS vn_completed FROM payment_orders WHERE provider='vietqr' AND payment_status='completed'; \
   SELECT COUNT(*) AS usd_completed FROM payment_orders WHERE provider IN ('paypal','stripe') AND payment_status='completed'; \
   SELECT COUNT(*) AS sent_email_with_provider_id FROM email_jobs WHERE status='sent' AND provider_message_id IS NOT NULL; \
   SELECT COUNT(*) AS smoke_sent_email_with_provider_id FROM email_jobs WHERE recipient_email IN ('$VN_EMAIL', '$USD_EMAIL') AND status='sent' AND provider_message_id IS NOT NULL;")"
printf "%s\n" "$COUNTS_JSON" | jq .
payment_orders_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[0].results[0].payment_orders // 0')"
email_jobs_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[1].results[0].email_jobs // 0')"
vietqr_orders_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[2].results[0].vietqr_orders // 0')"
webhook_events_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[3].results[0].webhook_events // 0')"
vn_completed_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[4].results[0].vn_completed // 0')"
usd_completed_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[5].results[0].usd_completed // 0')"
sent_email_with_id_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[6].results[0].sent_email_with_provider_id // 0')"
smoke_sent_email_with_id_count="$(printf "%s" "$COUNTS_JSON" | jq -r '.[7].results[0].smoke_sent_email_with_provider_id // 0')"

echo "payment_orders=$payment_orders_count email_jobs=$email_jobs_count vietqr_orders=$vietqr_orders_count webhook_events=$webhook_events_count"
echo "vn_completed=$vn_completed_count usd_completed=$usd_completed_count sent_email_with_provider_id=$sent_email_with_id_count smoke_sent_email_with_provider_id=$smoke_sent_email_with_id_count"
echo

echo "== D1 latest order evidence for smoke emails =="
ORDERS_JSON="$(wrangler d1 execute "$D1_NAME" --remote --json --command \
  "SELECT internal_order_id, provider, email, payment_status, fulfillment_status, created_at FROM payment_orders WHERE email IN ('$VN_EMAIL', '$USD_EMAIL') ORDER BY created_at DESC LIMIT 10;")"
printf "%s\n" "$ORDERS_JSON" | jq '.[0].results'

if [ "$vn_completed_count" -gt 0 ]; then
  pass "VN completed orders found in D1"
else
  require_or_warn "No VN completed orders in D1 yet"
fi

if [ "$usd_completed_count" -gt 0 ]; then
  pass "USD completed orders found in D1"
else
  require_or_warn "No USD completed orders in D1 yet"
fi

if [ "$sent_email_with_id_count" -gt 0 ]; then
  pass "D1 has sent email rows with provider message IDs"
else
  require_or_warn "No sent email rows with provider message IDs in D1 yet"
fi

echo
echo "== Proof summary =="
echo "FAILURES=$FAILURES WARNINGS=$WARNINGS"
if [ "$FAILURES" -gt 0 ]; then
  echo "Proof smoke completed with failures."
  exit 1
fi

if [ "$REQUIRE_COMPLETED" = "1" ] && [ "$WARNINGS" -gt 0 ]; then
  echo "Proof smoke completed with warnings while REQUIRE_COMPLETED=1."
  exit 1
fi

echo "Done."
