#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-62d57eaa548617aeecac766e5a1cb98e}"
EMAIL_PROVIDER="${EMAIL_PROVIDER:-mail_iai_one}"
MAIL_API_BASE_URL_DEFAULT="${MAIL_API_BASE_URL:-https://api.mail.iai.one/v1}"

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

put_secret() {
  local name="$1"
  local value="$2"
  printf "%s" "$value" | wrangler pages secret put "$name" --project-name "$PROJECT_NAME" >/dev/null
  echo "  - set $name"
}

read_secret() {
  local prompt="$1"
  local outvar="$2"
  local value=""
  read -rsp "$prompt: " value
  echo
  printf -v "$outvar" "%s" "$value"
}

read_value_with_default() {
  local prompt="$1"
  local default_value="$2"
  local outvar="$3"
  local value=""
  read -rp "$prompt [$default_value]: " value
  if [ -z "$value" ]; then
    value="$default_value"
  fi
  printf -v "$outvar" "%s" "$value"
}

need_cmd wrangler

echo "Project: $PROJECT_NAME"
echo "Account: $CLOUDFLARE_ACCOUNT_ID"
echo "Setting production payment/email secrets for nguyenlananh.com"
echo "Email provider mode: $EMAIL_PROVIDER"
echo

read_secret "VIETQR_BANK_BIN" VIETQR_BANK_BIN
read_secret "VIETQR_ACCOUNT_NO" VIETQR_ACCOUNT_NO
read_secret "VIETQR_ACCOUNT_NAME" VIETQR_ACCOUNT_NAME
read_secret "PAYMENTS_ADMIN_KEY" PAYMENTS_ADMIN_KEY
read_secret "PAYPAL_CLIENT_ID" PAYPAL_CLIENT_ID
read_secret "PAYPAL_CLIENT_SECRET" PAYPAL_CLIENT_SECRET
read_secret "PAYPAL_WEBHOOK_ID" PAYPAL_WEBHOOK_ID
read_secret "PAYPAL_MERCHANT_EMAIL" PAYPAL_MERCHANT_EMAIL
read_secret "STRIPE_SECRET_KEY" STRIPE_SECRET_KEY
read_secret "STRIPE_PUBLISHABLE_KEY" STRIPE_PUBLISHABLE_KEY
read_secret "STRIPE_WEBHOOK_SECRET" STRIPE_WEBHOOK_SECRET
read_value_with_default "MAIL_API_BASE_URL" "$MAIL_API_BASE_URL_DEFAULT" MAIL_API_BASE_URL
read_secret "MAIL_API_KEY" MAIL_API_KEY
read_secret "MAIL_API_WORKSPACE_ID" MAIL_API_WORKSPACE_ID
read_secret "MAIL_API_WEBHOOK_SECRET" MAIL_API_WEBHOOK_SECRET
read_secret "EMAIL_FROM_SYSTEM" EMAIL_FROM_SYSTEM
read_secret "EMAIL_FROM_PAY" EMAIL_FROM_PAY
read_secret "EMAIL_REPLY_TO_SUPPORT" EMAIL_REPLY_TO_SUPPORT

echo
echo "Applying secrets..."
put_secret "VIETQR_BANK_BIN" "$VIETQR_BANK_BIN"
put_secret "VIETQR_ACCOUNT_NO" "$VIETQR_ACCOUNT_NO"
put_secret "VIETQR_ACCOUNT_NAME" "$VIETQR_ACCOUNT_NAME"
put_secret "PAYMENTS_ADMIN_KEY" "$PAYMENTS_ADMIN_KEY"
put_secret "PAYPAL_CLIENT_ID" "$PAYPAL_CLIENT_ID"
put_secret "PAYPAL_CLIENT_SECRET" "$PAYPAL_CLIENT_SECRET"
put_secret "PAYPAL_WEBHOOK_ID" "$PAYPAL_WEBHOOK_ID"
put_secret "PAYPAL_MERCHANT_EMAIL" "$PAYPAL_MERCHANT_EMAIL"
put_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
put_secret "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
put_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
put_secret "EMAIL_PROVIDER" "$EMAIL_PROVIDER"
put_secret "MAIL_API_BASE_URL" "$MAIL_API_BASE_URL"
put_secret "MAIL_API_KEY" "$MAIL_API_KEY"
put_secret "MAIL_API_WORKSPACE_ID" "$MAIL_API_WORKSPACE_ID"
put_secret "MAIL_API_WEBHOOK_SECRET" "$MAIL_API_WEBHOOK_SECRET"
put_secret "EMAIL_FROM_SYSTEM" "$EMAIL_FROM_SYSTEM"
put_secret "EMAIL_FROM_PAY" "$EMAIL_FROM_PAY"
put_secret "EMAIL_REPLY_TO_SUPPORT" "$EMAIL_REPLY_TO_SUPPORT"

unset \
  VIETQR_BANK_BIN \
  VIETQR_ACCOUNT_NO \
  VIETQR_ACCOUNT_NAME \
  PAYMENTS_ADMIN_KEY \
  PAYPAL_CLIENT_ID \
  PAYPAL_CLIENT_SECRET \
  PAYPAL_WEBHOOK_ID \
  PAYPAL_MERCHANT_EMAIL \
  STRIPE_SECRET_KEY \
  STRIPE_PUBLISHABLE_KEY \
  STRIPE_WEBHOOK_SECRET \
  MAIL_API_BASE_URL \
  MAIL_API_KEY \
  MAIL_API_WORKSPACE_ID \
  MAIL_API_WEBHOOK_SECRET \
  EMAIL_FROM_SYSTEM \
  EMAIL_FROM_PAY \
  EMAIL_REPLY_TO_SUPPORT

echo
echo "Current production secret names:"
wrangler pages secret list --project-name "$PROJECT_NAME"

echo
echo "Done."
