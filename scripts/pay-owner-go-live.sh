#!/usr/bin/env bash
# pay-owner-go-live.sh — one-shot live activation for nguyenlananh.com VN lane.
# Usage:  bash scripts/pay-owner-go-live.sh
# Safe to re-run. Secrets are unset on exit (trap).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  unset PAY_IAI_ONE_API_KEY MAIL_API_KEY MAIL_API_WORKSPACE_ID \
        MAIL_API_WEBHOOK_SECRET PAYMENTS_ADMIN_KEY \
        EMAIL_FROM_SYSTEM EMAIL_FROM_PAY EMAIL_REPLY_TO_SUPPORT \
        API_BASE_URL ENV_DEPLOY_TARGET REFUND_POLICY 2>/dev/null || true
}
trap cleanup EXIT

prompt_secret() {
  local label="$1"
  local var="$2"
  local existing="${!var-}"
  if [ -n "$existing" ]; then
    echo "[i] $var already set in env, using it."
    return 0
  fi
  if [ ! -t 0 ]; then
    echo "[FAIL] $var: stdin is not a TTY. Run this script directly in your terminal," >&2
    echo "       not piped or with redirected input." >&2
    exit 3
  fi
  local value=""
  local attempts=0
  while [ -z "$value" ]; do
    attempts=$((attempts + 1))
    if [ "$attempts" -gt 5 ]; then
      echo "[FAIL] $var: too many empty attempts. Aborting." >&2
      exit 3
    fi
    printf "%s: " "$label" >&2
    if ! IFS= read -rs value; then
      printf "\n[FAIL] %s: stdin closed (EOF). Aborting.\n" "$var" >&2
      exit 3
    fi
    printf "\n" >&2
    if [ -z "$value" ]; then
      echo "[!] $var cannot be empty. Try again." >&2
    fi
  done
  printf -v "$var" "%s" "$value"
  export "$var"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "[FAIL] missing required command: $1"; exit 2; }
}

echo "== nguyenlananh.com — Pay-Owner go-live =="
echo "Repo: $ROOT_DIR"
echo

need_cmd wrangler
need_cmd curl
need_cmd jq
need_cmd openssl

echo "Step 1/4 — collect secrets (input is hidden)"
prompt_secret "PAY_IAI_ONE_API_KEY"      PAY_IAI_ONE_API_KEY
prompt_secret "MAIL_API_KEY"             MAIL_API_KEY
prompt_secret "MAIL_API_WORKSPACE_ID"    MAIL_API_WORKSPACE_ID
prompt_secret "MAIL_API_WEBHOOK_SECRET"  MAIL_API_WEBHOOK_SECRET

# PAYMENTS_ADMIN_KEY: reuse if exported, else generate
if [ -z "${PAYMENTS_ADMIN_KEY-}" ]; then
  PAYMENTS_ADMIN_KEY="$(openssl rand -hex 32)"
  export PAYMENTS_ADMIN_KEY
  echo
  echo "[!] Generated PAYMENTS_ADMIN_KEY. Save it now (cannot be re-read after this run):"
  echo "    PAYMENTS_ADMIN_KEY=$PAYMENTS_ADMIN_KEY"
  echo
fi

# Static / governance vars (with sane defaults)
export EMAIL_FROM_SYSTEM="${EMAIL_FROM_SYSTEM:-noreply@nguyenlananh.com}"
export EMAIL_FROM_PAY="${EMAIL_FROM_PAY:-pay@nguyenlananh.com}"
export EMAIL_REPLY_TO_SUPPORT="${EMAIL_REPLY_TO_SUPPORT:-support@nguyenlananh.com}"
export API_BASE_URL="${API_BASE_URL:-https://www.nguyenlananh.com/api}"
export ENV_DEPLOY_TARGET="${ENV_DEPLOY_TARGET:-cloudflare-pages}"
export REFUND_POLICY="${REFUND_POLICY:-manual_review}"

echo
echo "Step 2/4 — push secrets to Cloudflare Pages (production + preview)"
NON_INTERACTIVE=1 \
VN_VIA_PAY_IAI_ONE=1 \
REQUIRE_PAYPAL=0 \
REQUIRE_STRIPE=0 \
TARGET_ENVS="production preview" \
bash scripts/provision-payment-live-secrets.sh

echo
echo "Step 3/4 — run live gate (non-strict; PayPal/Stripe deferred)"
BASE_URL=https://www.nguyenlananh.com \
PROJECT_NAME=nguyenlananh-com \
TARGET_ENVS=production \
REQUIRE_PAYPAL=0 \
REQUIRE_STRIPE=0 \
VN_VIA_PAY_IAI_ONE=1 \
CHECK_PAGES_SECRETS=1 \
ENFORCE_COMMERCE_LIVE=0 \
bash scripts/team2-live-gate.sh

echo
echo "Step 4/4 — confirm vietqr enabled=true mode=pay_iai_one"
PROVIDER_JSON="$(curl -sS https://www.nguyenlananh.com/api/payments/providers || true)"
echo "$PROVIDER_JSON" | jq '.providers[] | select(.code=="vietqr")'

ENABLED="$(echo "$PROVIDER_JSON" | jq -r '.providers[] | select(.code=="vietqr") | .enabled // false')"
MODE="$(echo "$PROVIDER_JSON"    | jq -r '.providers[] | select(.code=="vietqr") | .mode    // "unknown"')"

echo
if [ "$ENABLED" = "true" ] && [ "$MODE" = "pay_iai_one" ]; then
  echo "[PASS] nguyenlananh.com VN lane LIVE via pay.iai.one"
  echo
  echo "Reminder: store PAYMENTS_ADMIN_KEY printed above in 1Password / vault."
  exit 0
else
  echo "[WARN] vietqr not yet enabled (enabled=$ENABLED mode=$MODE)."
  echo "       Re-check Cloudflare deployment + secrets. Script can be re-run safely."
  exit 1
fi
