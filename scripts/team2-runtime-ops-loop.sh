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
CONNECTIVITY_PREFLIGHT="${CONNECTIVITY_PREFLIGHT:-1}"
SKIP_ON_CONNECTIVITY_FAIL="${SKIP_ON_CONNECTIVITY_FAIL:-1}"
REPORT_DIR="${REPORT_DIR:-$ROOT_DIR/docs/reports}"
STAMP="$(date '+%Y%m%d_%H%M%S')"
REPORT_MD_PATH="${REPORT_MD_PATH:-$REPORT_DIR/TEAM2_RUNTIME_PHASE_GATE_${STAMP}.md}"
REPORT_JSON_PATH="${REPORT_JSON_PATH:-$REPORT_DIR/TEAM2_RUNTIME_PHASE_GATE_${STAMP}.json}"

echo "== Team 2 Runtime Ops Loop =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Base URL: $BASE_URL"
echo "Phase flags: strict=$STRICT_MODE require_stripe=$REQUIRE_STRIPE check_pages_secrets=$CHECK_PAGES_SECRETS"
echo "Output: $REPORT_MD_PATH"
echo "Output: $REPORT_JSON_PATH"
echo

set +e
env \
  BASE_URL="$BASE_URL" \
  PROJECT_NAME="$PROJECT_NAME" \
  TARGET_ENVS="$TARGET_ENVS" \
  REQUIRE_STRIPE="$REQUIRE_STRIPE" \
  STRICT_MODE="$STRICT_MODE" \
  CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
  INTL_PROVIDER="$INTL_PROVIDER" \
  PAYMENTS_ADMIN_KEY="$PAYMENTS_ADMIN_KEY" \
  D1_NAME="$D1_NAME" \
  CONNECTIVITY_PREFLIGHT="$CONNECTIVITY_PREFLIGHT" \
  SKIP_ON_CONNECTIVITY_FAIL="$SKIP_ON_CONNECTIVITY_FAIL" \
  REPORT_PATH="$REPORT_MD_PATH" \
  REPORT_JSON_PATH="$REPORT_JSON_PATH" \
  bash "$ROOT_DIR/scripts/team2-runtime-phase-gate.sh"
phase_rc=$?
set -e

echo
echo "== Derived next actions =="
if REPORT_PATH="$REPORT_JSON_PATH" bash "$ROOT_DIR/scripts/team2-runtime-next-actions.sh"; then
  :
else
  echo "[WARN] Could not derive next actions from $REPORT_JSON_PATH"
  if [ "$phase_rc" -eq 0 ]; then
    exit 1
  fi
fi

echo
echo "Artifacts:"
echo "- $REPORT_MD_PATH"
echo "- $REPORT_JSON_PATH"

exit "$phase_rc"
