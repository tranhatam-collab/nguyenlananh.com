#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   BASE_URL=https://www.nguyenlananh.com \
#   TEST_EMAIL=qa+paypal@example.com \
#   ./docs/contracts/paypal-backend-smoke.sh

BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
TEST_EMAIL="${TEST_EMAIL:-qa-member@example.com}"
CREATE_KEY="${CREATE_KEY:-nla-smoke-create-$(date +%s)}"
CAPTURE_KEY="${CAPTURE_KEY:-nla-smoke-capture-$(date +%s)}"
WEBHOOK_EVENT_ID="${WEBHOOK_EVENT_ID:-nla-smoke-webhook-$(date +%s)}"

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require curl
require jq

echo "[1/5] health"
curl -sS "$BASE_URL/api/payments/health" | jq '{ok, db_ready: .environment.db_ready, paypal: (.providers[] | select(.code == "paypal") | {enabled, mode, manual_fallback})}'

echo "[2/5] providers"
curl -sS "$BASE_URL/api/payments/providers" | jq '{ok, paypal: (.providers[] | select(.code == "paypal") | {enabled, mode, manual_fallback, public})}'

echo "[3/5] create-checkout"
CREATE_RES="$(curl -sS -X POST "$BASE_URL/api/payments/create-checkout" \
  -H 'Content-Type: application/json' \
  -H "X-Idempotency-Key: $CREATE_KEY" \
  -d "{\"provider\":\"paypal\",\"email\":\"$TEST_EMAIL\",\"plan_code\":\"year1\",\"identity_country\":\"INTL\",\"locale\":\"en\",\"success_url\":\"$BASE_URL/en/join/success/\",\"cancel_url\":\"$BASE_URL/en/join/cancel/\",\"retry_url\":\"$BASE_URL/en/join/retry/\",\"next_path\":\"/en/members/dashboard/\"}")"

echo "$CREATE_RES" | jq . >/dev/null
INTERNAL_ORDER_ID="$(echo "$CREATE_RES" | jq -r '.internal_order_id // empty')"
PAYPAL_ORDER_ID="$(echo "$CREATE_RES" | jq -r '.provider_order_id // empty')"

if [[ -z "$INTERNAL_ORDER_ID" || -z "$PAYPAL_ORDER_ID" ]]; then
  echo "create-checkout did not create a PayPal order. This is expected until PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_WEBHOOK_ID are configured." >&2
  echo "$CREATE_RES" | jq . >&2
else
  echo "internal_order_id=$INTERNAL_ORDER_ID"
  echo "paypal_order_id=$PAYPAL_ORDER_ID"

  echo "[4/5] finalize checkout (requires approved payer in real flow)"
  CAPTURE_RES="$(curl -sS -X POST "$BASE_URL/api/payments/finalize" \
    -H 'Content-Type: application/json' \
    -H "X-Idempotency-Key: $CAPTURE_KEY" \
    -d "{\"internal_order_id\":\"$INTERNAL_ORDER_ID\",\"provider_order_id\":\"$PAYPAL_ORDER_ID\"}")"

  echo "$CAPTURE_RES" | jq . >/dev/null
  echo "$CAPTURE_RES" | jq '{internal_order_id,provider,provider_order_id,capture_status,fulfillment_status,queued_email_templates}'
fi

echo "[5/5] webhook smoke"
WEBHOOK_RES="$(curl -sS -X POST "$BASE_URL/api/payments/paypal/webhook" \
  -H 'Content-Type: application/json' \
  -d "{\"id\":\"$WEBHOOK_EVENT_ID\",\"event_type\":\"PAYMENT.CAPTURE.COMPLETED\",\"resource\":{\"id\":\"smoke-capture\"}}")"

echo "$WEBHOOK_RES" | jq .

echo "[extra] magic-link resend"
RESEND_RES="$(curl -sS -X POST "$BASE_URL/api/auth/magic-links/resend" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEST_EMAIL\",\"locale\":\"vi\"}")"

echo "$RESEND_RES" | jq . >/dev/null
echo "$RESEND_RES" | jq '{queued,template_id,expires_in_minutes}'

echo "Smoke run completed."
