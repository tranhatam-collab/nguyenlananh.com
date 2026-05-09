#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-62d57eaa548617aeecac766e5a1cb98e}"
EMAIL_PROVIDER="${EMAIL_PROVIDER:-mail_iai_one}"
MAIL_API_BASE_URL_DEFAULT="${MAIL_API_BASE_URL:-https://api.mail.iai.one/v1}"
TARGET_ENVS="${TARGET_ENVS:-production preview}"
REQUIRE_PAYPAL="${REQUIRE_PAYPAL:-0}"
REQUIRE_STRIPE="${REQUIRE_STRIPE:-0}"
SKIP_STRIPE="${SKIP_STRIPE:-0}"
VN_VIA_PAY_IAI_ONE="${VN_VIA_PAY_IAI_ONE:-1}"
NON_INTERACTIVE="${NON_INTERACTIVE:-0}"
MISSING_REQUIRED_INPUT=0

if [ "$SKIP_STRIPE" = "1" ]; then
  REQUIRE_STRIPE=0
fi

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
  for target_env in $TARGET_ENVS; do
    printf "%s" "$value" | wrangler pages secret put "$name" --project-name "$PROJECT_NAME" --env "$target_env" >/dev/null
    echo "  - set $name ($target_env)"
  done
}

read_secret() {
  local prompt="$1"
  local outvar="$2"
  local value=""
  local from_env="${!outvar-}"
  if [ -n "$from_env" ]; then
    printf -v "$outvar" "%s" "$from_env"
    echo "Using $outvar from environment."
    return
  fi
  if [ "$NON_INTERACTIVE" = "1" ]; then
    echo "Missing required input in NON_INTERACTIVE mode: $outvar"
    MISSING_REQUIRED_INPUT=1
    return
  fi
  read -rsp "$prompt: " value
  echo
  printf -v "$outvar" "%s" "$value"
}

read_value_with_default() {
  local prompt="$1"
  local default_value="$2"
  local outvar="$3"
  local from_env="${!outvar-}"
  if [ -n "$from_env" ]; then
    printf -v "$outvar" "%s" "$from_env"
    echo "Using $outvar from environment."
    return
  fi
  local value=""
  if [ "$NON_INTERACTIVE" = "1" ]; then
    value="$default_value"
  else
    read -rp "$prompt [$default_value]: " value
    if [ -z "$value" ]; then
      value="$default_value"
    fi
  fi
  printf -v "$outvar" "%s" "$value"
}

need_cmd wrangler

echo "Project: $PROJECT_NAME"
echo "Account: $CLOUDFLARE_ACCOUNT_ID"
echo "Setting payment/email secrets for nguyenlananh.com"
echo "Target environments: $TARGET_ENVS"
echo "Email provider mode: $EMAIL_PROVIDER"
echo "Require PayPal in this phase: $REQUIRE_PAYPAL"
echo "Require Stripe in this phase: $REQUIRE_STRIPE"
echo "VN rail via pay.iai.one: $VN_VIA_PAY_IAI_ONE"
echo "Stripe deferred for current phase: $SKIP_STRIPE"
echo "Non-interactive mode: $NON_INTERACTIVE"
echo

if [ "$VN_VIA_PAY_IAI_ONE" = "1" ]; then
  read_secret "PAY_IAI_ONE_API_KEY" PAY_IAI_ONE_API_KEY
else
  read_secret "VIETQR_BANK_BIN" VIETQR_BANK_BIN
  read_secret "VIETQR_ACCOUNT_NO" VIETQR_ACCOUNT_NO
  read_secret "VIETQR_ACCOUNT_NAME" VIETQR_ACCOUNT_NAME
fi
read_secret "PAYMENTS_ADMIN_KEY" PAYMENTS_ADMIN_KEY
if [ "$REQUIRE_PAYPAL" = "1" ]; then
  read_secret "PAYPAL_CLIENT_ID" PAYPAL_CLIENT_ID
  read_secret "PAYPAL_CLIENT_SECRET" PAYPAL_CLIENT_SECRET
  read_secret "PAYPAL_WEBHOOK_ID" PAYPAL_WEBHOOK_ID
  read_secret "PAYPAL_MERCHANT_EMAIL" PAYPAL_MERCHANT_EMAIL
else
  echo "Skipping PayPal secrets for this phase (REQUIRE_PAYPAL=0)."
fi
if [ "$REQUIRE_STRIPE" = "1" ]; then
  read_secret "STRIPE_SECRET_KEY" STRIPE_SECRET_KEY
  read_secret "STRIPE_PUBLISHABLE_KEY" STRIPE_PUBLISHABLE_KEY
  read_secret "STRIPE_WEBHOOK_SECRET" STRIPE_WEBHOOK_SECRET
else
  echo "Skipping Stripe secrets for this phase (REQUIRE_STRIPE=0)."
fi
read_value_with_default "MAIL_API_BASE_URL" "$MAIL_API_BASE_URL_DEFAULT" MAIL_API_BASE_URL
read_secret "MAIL_API_KEY" MAIL_API_KEY
read_secret "MAIL_API_WORKSPACE_ID" MAIL_API_WORKSPACE_ID
read_secret "MAIL_API_WEBHOOK_SECRET" MAIL_API_WEBHOOK_SECRET
read_secret "EMAIL_FROM_SYSTEM" EMAIL_FROM_SYSTEM
read_secret "EMAIL_FROM_PAY" EMAIL_FROM_PAY
read_secret "EMAIL_REPLY_TO_SUPPORT" EMAIL_REPLY_TO_SUPPORT

if [ "$MISSING_REQUIRED_INPUT" -ne 0 ]; then
  echo
  echo "Aborted: missing required secrets in NON_INTERACTIVE mode."
  echo "Set required values as environment variables and run again."
  exit 1
fi

echo
echo "Applying secrets..."
if [ "$VN_VIA_PAY_IAI_ONE" = "1" ]; then
  put_secret "PAY_IAI_ONE_API_KEY" "$PAY_IAI_ONE_API_KEY"
else
  put_secret "VIETQR_BANK_BIN" "$VIETQR_BANK_BIN"
  put_secret "VIETQR_ACCOUNT_NO" "$VIETQR_ACCOUNT_NO"
  put_secret "VIETQR_ACCOUNT_NAME" "$VIETQR_ACCOUNT_NAME"
fi
put_secret "PAYMENTS_ADMIN_KEY" "$PAYMENTS_ADMIN_KEY"
if [ "$REQUIRE_PAYPAL" = "1" ]; then
  put_secret "PAYPAL_CLIENT_ID" "$PAYPAL_CLIENT_ID"
  put_secret "PAYPAL_CLIENT_SECRET" "$PAYPAL_CLIENT_SECRET"
  put_secret "PAYPAL_WEBHOOK_ID" "$PAYPAL_WEBHOOK_ID"
  put_secret "PAYPAL_MERCHANT_EMAIL" "$PAYPAL_MERCHANT_EMAIL"
fi
if [ "$REQUIRE_STRIPE" = "1" ]; then
  put_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
  put_secret "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"
  put_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"
fi
put_secret "EMAIL_PROVIDER" "$EMAIL_PROVIDER"
put_secret "MAIL_API_BASE_URL" "$MAIL_API_BASE_URL"
put_secret "MAIL_API_KEY" "$MAIL_API_KEY"
put_secret "MAIL_API_WORKSPACE_ID" "$MAIL_API_WORKSPACE_ID"
put_secret "MAIL_API_WEBHOOK_SECRET" "$MAIL_API_WEBHOOK_SECRET"
put_secret "EMAIL_FROM_SYSTEM" "$EMAIL_FROM_SYSTEM"
put_secret "EMAIL_FROM_PAY" "$EMAIL_FROM_PAY"
put_secret "EMAIL_REPLY_TO_SUPPORT" "$EMAIL_REPLY_TO_SUPPORT"

unset \
  PAYMENTS_ADMIN_KEY \
  MAIL_API_BASE_URL \
  MAIL_API_KEY \
  MAIL_API_WORKSPACE_ID \
  MAIL_API_WEBHOOK_SECRET \
  EMAIL_FROM_SYSTEM \
  EMAIL_FROM_PAY \
  EMAIL_REPLY_TO_SUPPORT

if [ "$VN_VIA_PAY_IAI_ONE" = "1" ]; then
  unset PAY_IAI_ONE_API_KEY
else
  unset \
    VIETQR_BANK_BIN \
    VIETQR_ACCOUNT_NO \
    VIETQR_ACCOUNT_NAME
fi

if [ "$REQUIRE_PAYPAL" = "1" ]; then
  unset \
    PAYPAL_CLIENT_ID \
    PAYPAL_CLIENT_SECRET \
    PAYPAL_WEBHOOK_ID \
    PAYPAL_MERCHANT_EMAIL
fi

if [ "$REQUIRE_STRIPE" = "1" ]; then
  unset \
    STRIPE_SECRET_KEY \
    STRIPE_PUBLISHABLE_KEY \
    STRIPE_WEBHOOK_SECRET
fi

echo
for target_env in $TARGET_ENVS; do
  echo "Current secret names ($target_env):"
  wrangler pages secret list --project-name "$PROJECT_NAME" --env "$target_env"
  echo
done

echo "Done."
