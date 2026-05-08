#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
TARGET_ENVS="${TARGET_ENVS:-production}"
REQUIRE_STRIPE="${REQUIRE_STRIPE:-0}"
STRICT_MODE="${STRICT_MODE:-0}"
CHECK_PAGES_SECRETS="${CHECK_PAGES_SECRETS:-1}"
INTL_PROVIDER="${INTL_PROVIDER:-paypal}"
PAYMENTS_ADMIN_KEY="${PAYMENTS_ADMIN_KEY:-}"
D1_NAME="${D1_NAME:-nguyenlananh-payments-prod}"

TOTAL=0
PASSED=0
FAILED=0

run_step() {
  local label="$1"
  shift

  TOTAL=$((TOTAL + 1))
  echo
  echo "== STEP $TOTAL: $label =="
  echo "Command: $*"

  set +e
  "$@"
  local rc=$?
  set -e

  if [ "$rc" -eq 0 ]; then
    PASSED=$((PASSED + 1))
    echo "[PASS] $label"
  else
    FAILED=$((FAILED + 1))
    echo "[FAIL] $label (exit=$rc)"
  fi
}

echo "== Team 2 Runtime Phase Gate =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Local: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "Base URL: $BASE_URL"
echo "Project: $PROJECT_NAME"
echo "Target envs: $TARGET_ENVS"
echo "Require Stripe: $REQUIRE_STRIPE"
echo "Strict mode: $STRICT_MODE"
echo "Check Pages secrets: $CHECK_PAGES_SECRETS"

run_step "Secrets preflight" \
  env \
  BASE_URL="$BASE_URL" \
  PROJECT_NAME="$PROJECT_NAME" \
  TARGET_ENVS="$TARGET_ENVS" \
  REQUIRE_STRIPE="$REQUIRE_STRIPE" \
  CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
  bash "$ROOT_DIR/scripts/payment-live-secrets-preflight.sh"

run_step "Team 2 live gate" \
  env \
  BASE_URL="$BASE_URL" \
  PROJECT_NAME="$PROJECT_NAME" \
  TARGET_ENVS="$TARGET_ENVS" \
  REQUIRE_STRIPE="$REQUIRE_STRIPE" \
  CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
  ENFORCE_COMMERCE_LIVE="$STRICT_MODE" \
  bash "$ROOT_DIR/scripts/team2-live-gate.sh"

run_step "Rails independent gate" \
  env \
  BASE_URL="$BASE_URL" \
  PROJECT_NAME="$PROJECT_NAME" \
  TARGET_ENVS="$TARGET_ENVS" \
  CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
  INTL_PROVIDER="$INTL_PROVIDER" \
  REQUIRE_PROVIDER_READY="$STRICT_MODE" \
  REQUIRE_COMPLETED="$STRICT_MODE" \
  bash "$ROOT_DIR/scripts/payment-rails-independent-gate.sh"

run_step "Payment proof smoke" \
  env \
  BASE_URL="$BASE_URL" \
  PROJECT_NAME="$PROJECT_NAME" \
  TARGET_ENVS="$TARGET_ENVS" \
  CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
  REQUIRE_STRIPE="$REQUIRE_STRIPE" \
  REQUIRE_COMPLETED="$STRICT_MODE" \
  USD_PROVIDER="$INTL_PROVIDER" \
  D1_NAME="$D1_NAME" \
  PAYMENTS_ADMIN_KEY="$PAYMENTS_ADMIN_KEY" \
  bash "$ROOT_DIR/scripts/payment-live-proof-smoke.sh"

echo
echo "== Team 2 Runtime Phase Summary =="
echo "TOTAL=$TOTAL PASSED=$PASSED FAILED=$FAILED"

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

echo "All phase checks passed."
