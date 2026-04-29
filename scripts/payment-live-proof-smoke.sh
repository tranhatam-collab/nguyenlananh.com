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

VN_KEY="smoke-vn-$(date +%s)"
USD_KEY="smoke-usd-$(date +%s)"
CONFIRM_KEY="smoke-confirm-$(date +%s)"
PROVIDER_REF="ops_smoke_$(date +%s)"

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

print_status() {
  local url="$1"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url")"
  echo "$url -> $code"
}

echo "== web cutover status =="
print_status "$VN_DOMAIN"
print_status "$WWW_DOMAIN"
print_status "$ADMIN_DOMAIN"
echo

echo "== providers =="
curl -sS "$BASE_URL/api/payments/providers"
echo
echo

echo "== health =="
curl -sS "$BASE_URL/api/payments/health"
echo
echo

echo "== VN rail create-order (vietqr) =="
VN_RES="$(curl -sS -X POST "$BASE_URL/api/payments/vietqr/create-order" \
  -H "content-type: application/json" \
  -H "x-idempotency-key: $VN_KEY" \
  --data "{\"email\":\"$VN_EMAIL\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"VN\",\"locale\":\"$VN_LOCALE\",\"next_path\":\"$NEXT_PATH\"}")"
echo "$VN_RES"
echo

VN_ORDER_ID="$(printf "%s" "$VN_RES" | jq -r '.internal_order_id // empty' 2>/dev/null || true)"

if [ -n "$VN_ORDER_ID" ]; then
  echo "== VN mark-pending =="
  curl -sS -X POST "$BASE_URL/api/payments/vietqr/mark-pending" \
    -H "content-type: application/json" \
    --data "{\"internal_order_id\":\"$VN_ORDER_ID\",\"email\":\"$VN_EMAIL\"}"
  echo
  echo

  if [ -n "$PAYMENTS_ADMIN_KEY" ]; then
    echo "== VN admin confirm (with PAYMENTS_ADMIN_KEY) =="
    curl -sS -X POST "$BASE_URL/api/admin/vietqr-confirm" \
      -H "content-type: application/json" \
      -H "x-admin-key: $PAYMENTS_ADMIN_KEY" \
      -H "x-idempotency-key: $CONFIRM_KEY" \
      --data "{\"internal_order_id\":\"$VN_ORDER_ID\",\"provider_ref\":\"$PROVIDER_REF\",\"confirmed_by\":\"ops-smoke\"}"
    echo
    echo
  else
    echo "== VN admin confirm skipped: PAYMENTS_ADMIN_KEY is empty =="
    echo
  fi
fi

echo "== USD rail create-checkout ($USD_PROVIDER) =="
USD_RES="$(curl -sS -X POST "$BASE_URL/api/payments/create-checkout" \
  -H "content-type: application/json" \
  -H "x-idempotency-key: $USD_KEY" \
  --data "{\"email\":\"$USD_EMAIL\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"INTL\",\"provider\":\"$USD_PROVIDER\",\"locale\":\"$USD_LOCALE\",\"next_path\":\"$NEXT_PATH\"}")"
echo "$USD_RES"
echo

USD_CHECKOUT_URL="$(printf "%s" "$USD_RES" | jq -r '.checkout_url // empty' 2>/dev/null || true)"
if [ -n "$USD_CHECKOUT_URL" ]; then
  echo "USD checkout URL:"
  echo "$USD_CHECKOUT_URL"
  echo
fi

echo "== D1 evidence counters =="
cd "$ROOT_DIR"
wrangler d1 execute "$D1_NAME" --remote --command \
  "SELECT COUNT(*) AS payment_orders FROM payment_orders; SELECT COUNT(*) AS email_jobs FROM email_jobs; SELECT COUNT(*) AS vietqr_orders FROM vietqr_orders; SELECT COUNT(*) AS webhook_events FROM webhook_events;"
echo

echo "== D1 latest order evidence for smoke emails =="
wrangler d1 execute "$D1_NAME" --remote --command \
  "SELECT internal_order_id, provider, email, payment_status, fulfillment_status, created_at FROM payment_orders WHERE email IN ('$VN_EMAIL', '$USD_EMAIL') ORDER BY created_at DESC LIMIT 10;"

echo
echo "Done."
