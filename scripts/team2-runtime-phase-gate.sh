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
REPORT_DIR="${REPORT_DIR:-$ROOT_DIR/docs/reports}"
REPORT_TS="$(date '+%Y%m%d_%H%M%S')"
REPORT_PATH="${REPORT_PATH:-$REPORT_DIR/TEAM2_RUNTIME_PHASE_GATE_${REPORT_TS}.md}"
REPORT_JSON_PATH="${REPORT_JSON_PATH:-${REPORT_PATH%.md}.json}"
TMP_LOG_DIR="$(mktemp -d /tmp/team2-runtime-phase-gate.XXXXXX)"
STAMP_UTC="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
STAMP_LOCAL="$(date '+%Y-%m-%d %H:%M:%S %z')"

TOTAL=0
PASSED=0
FAILED=0
STEP_LABELS=()
STEP_COMMANDS=()
STEP_CODES=()
STEP_LOGS=()

cleanup() {
  rm -rf "$TMP_LOG_DIR"
}
trap cleanup EXIT

json_escape() {
  printf '%s' "$1" | jq -Rs .
}

if ! command -v jq >/dev/null 2>&1; then
  echo "Missing required command: jq"
  exit 1
fi

run_step() {
  local label="$1"
  shift
  local cmd=("$@")

  TOTAL=$((TOTAL + 1))
  local step_num="$TOTAL"
  local log_file="$TMP_LOG_DIR/step_${step_num}.log"

  echo
  echo "== STEP $step_num: $label =="
  echo "Command: ${cmd[*]}"

  set +e
  "${cmd[@]}" >"$log_file" 2>&1
  local rc=$?
  set -e

  cat "$log_file"

  STEP_LABELS+=("$label")
  STEP_COMMANDS+=("${cmd[*]}")
  STEP_CODES+=("$rc")
  STEP_LOGS+=("$log_file")

  if [ "$rc" -eq 0 ]; then
    PASSED=$((PASSED + 1))
    echo "[PASS] $label"
  else
    FAILED=$((FAILED + 1))
    echo "[FAIL] $label (exit=$rc)"
  fi
}

write_report() {
  mkdir -p "$REPORT_DIR"
  {
    echo "# TEAM2_RUNTIME_PHASE_GATE"
    echo
    echo "- generated_at_utc: $STAMP_UTC"
    echo "- generated_at_local: $STAMP_LOCAL"
    echo "- base_url: \`$BASE_URL\`"
    echo "- project_name: \`$PROJECT_NAME\`"
    echo "- target_envs: \`$TARGET_ENVS\`"
    echo "- require_stripe: \`$REQUIRE_STRIPE\`"
    echo "- strict_mode: \`$STRICT_MODE\`"
    echo "- check_pages_secrets: \`$CHECK_PAGES_SECRETS\`"
    echo "- intl_provider: \`$INTL_PROVIDER\`"
    echo
    echo "## Step Results"
    local i
    for ((i=0; i<${#STEP_LABELS[@]}; i++)); do
      local step_idx=$((i + 1))
      local code="${STEP_CODES[$i]}"
      local status="PASS"
      if [ "$code" -ne 0 ]; then
        status="FAIL"
      fi
      echo "### Step $step_idx: ${STEP_LABELS[$i]}"
      echo "- status: \`$status\`"
      echo "- exit_code: \`$code\`"
      echo "- command: \`${STEP_COMMANDS[$i]}\`"
      echo "- log_tail:"
      echo
      echo '```text'
      tail -n 40 "${STEP_LOGS[$i]}"
      echo '```'
      echo
    done
    echo "## Summary"
    echo
    echo "- total_steps: \`$TOTAL\`"
    echo "- passed_steps: \`$PASSED\`"
    echo "- failed_steps: \`$FAILED\`"
    if [ "$FAILED" -gt 0 ]; then
      echo "- verdict: \`BLOCKED_PENDING_EXTERNAL_RUNTIME_READINESS\`"
    else
      echo "- verdict: \`RUNTIME_PHASE_GATE_PASS\`"
    fi
  } > "$REPORT_PATH"

  {
    echo "{"
    echo "  \"generated_at_utc\": $(json_escape "$STAMP_UTC"),"
    echo "  \"generated_at_local\": $(json_escape "$STAMP_LOCAL"),"
    echo "  \"base_url\": $(json_escape "$BASE_URL"),"
    echo "  \"project_name\": $(json_escape "$PROJECT_NAME"),"
    echo "  \"target_envs\": $(json_escape "$TARGET_ENVS"),"
    echo "  \"require_stripe\": $REQUIRE_STRIPE,"
    echo "  \"strict_mode\": $STRICT_MODE,"
    echo "  \"check_pages_secrets\": $CHECK_PAGES_SECRETS,"
    echo "  \"intl_provider\": $(json_escape "$INTL_PROVIDER"),"
    echo "  \"steps\": ["
    local i
    for ((i=0; i<${#STEP_LABELS[@]}; i++)); do
      local step_idx=$((i + 1))
      local code="${STEP_CODES[$i]}"
      local status="PASS"
      if [ "$code" -ne 0 ]; then
        status="FAIL"
      fi
      local log_tail
      log_tail="$(tail -n 40 "${STEP_LOGS[$i]}")"
      if [ "$i" -gt 0 ]; then
        echo "    ,{"
      else
        echo "    {"
      fi
      echo "      \"index\": $step_idx,"
      echo "      \"label\": $(json_escape "${STEP_LABELS[$i]}"),"
      echo "      \"status\": $(json_escape "$status"),"
      echo "      \"exit_code\": $code,"
      echo "      \"command\": $(json_escape "${STEP_COMMANDS[$i]}"),"
      echo "      \"log_tail\": $(json_escape "$log_tail")"
      echo "    }"
    done
    echo "  ],"
    echo "  \"summary\": {"
    echo "    \"total_steps\": $TOTAL,"
    echo "    \"passed_steps\": $PASSED,"
    echo "    \"failed_steps\": $FAILED,"
    if [ "$FAILED" -gt 0 ]; then
      echo "    \"verdict\": \"BLOCKED_PENDING_EXTERNAL_RUNTIME_READINESS\""
    else
      echo "    \"verdict\": \"RUNTIME_PHASE_GATE_PASS\""
    fi
    echo "  }"
    echo "}"
  } > "$REPORT_JSON_PATH"

  echo
  echo "Report: $REPORT_PATH"
  echo "JSON Report: $REPORT_JSON_PATH"
}

echo "== Team 2 Runtime Phase Gate =="
echo "UTC: $STAMP_UTC"
echo "Local: $STAMP_LOCAL"
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
  REPORT_DIR="$TMP_LOG_DIR" \
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
write_report

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

echo "All phase checks passed."
