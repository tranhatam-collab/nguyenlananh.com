#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BASE_URL=https://staging.nguyenlananh.com \
#   TEST_EMAIL=qa+paypal@example.com \
#   ./docs/contracts/paypal-backend-smoke.sh

BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
TEST_EMAIL="${TEST_EMAIL:-qa-member@example.com}"
CREATE_KEY="${CREATE_KEY:-nla-smoke-create-$(date +%s)}"
CAPTURE_KEY="${CAPTURE_KEY:-nla-smoke-capture-$(date +%s)}"

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require curl
require jq

echo "[1/3] create-order"
CREATE_RES="$(curl -sS -X POST "$BASE_URL/api/paypal/create-order" \
  -H 'Content-Type: application/json' \
  -H "X-Idempotency-Key: $CREATE_KEY" \
  -d "{\"email\":\"$TEST_EMAIL\",\"plan_code\":\"year1\",\"locale\":\"vi\",\"success_url\":\"$BASE_URL/join/?status=success\",\"cancel_url\":\"$BASE_URL/join/?status=cancel\"}")"

echo "$CREATE_RES" | jq . >/dev/null
INTERNAL_ORDER_ID="$(echo "$CREATE_RES" | jq -r '.internal_order_id // empty')"
PAYPAL_ORDER_ID="$(echo "$CREATE_RES" | jq -r '.paypal_order_id // empty')"

if [[ -z "$INTERNAL_ORDER_ID" || -z "$PAYPAL_ORDER_ID" ]]; then
  echo "create-order failed: missing internal_order_id/paypal_order_id" >&2
  echo "$CREATE_RES" | jq . >&2
  exit 1
fi

echo "internal_order_id=$INTERNAL_ORDER_ID"
echo "paypal_order_id=$PAYPAL_ORDER_ID"

echo "[2/3] capture-order (requires approved payer in real flow)"
CAPTURE_RES="$(curl -sS -X POST "$BASE_URL/api/paypal/capture-order" \
  -H 'Content-Type: application/json' \
  -H "X-Idempotency-Key: $CAPTURE_KEY" \
  -d "{\"internal_order_id\":\"$INTERNAL_ORDER_ID\",\"paypal_order_id\":\"$PAYPAL_ORDER_ID\"}")"

echo "$CAPTURE_RES" | jq . >/dev/null
echo "$CAPTURE_RES" | jq '{internal_order_id,paypal_order_id,capture_status,fulfillment_status,queued_email_templates}'

echo "[3/3] magic-link resend"
RESEND_RES="$(curl -sS -X POST "$BASE_URL/api/auth/magic-links/resend" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEST_EMAIL\",\"locale\":\"vi\"}")"

echo "$RESEND_RES" | jq . >/dev/null
echo "$RESEND_RES" | jq '{queued,template_id,expires_in_minutes}'

echo "Smoke run completed."
