#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
PROJECT_NAME="${PROJECT_NAME:-nguyenlananh-com}"
TARGET_ENVS="${TARGET_ENVS:-production}"
REQUIRE_PAYPAL="${REQUIRE_PAYPAL:-0}"
REQUIRE_STRIPE="${REQUIRE_STRIPE:-0}"
REQUIRE_INTL_PROVIDER="${REQUIRE_INTL_PROVIDER:-0}"
STRICT_MODE="${STRICT_MODE:-0}"
CHECK_PAGES_SECRETS="${CHECK_PAGES_SECRETS:-1}"
INTL_PROVIDER="${INTL_PROVIDER:-paypal}"
PAYMENTS_ADMIN_KEY="${PAYMENTS_ADMIN_KEY:-}"
D1_NAME="${D1_NAME:-nguyenlananh-payments-prod}"
CONNECTIVITY_PREFLIGHT="${CONNECTIVITY_PREFLIGHT:-1}"
SKIP_ON_CONNECTIVITY_FAIL="${SKIP_ON_CONNECTIVITY_FAIL:-1}"
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
SKIPPED=0
STEP_LABELS=()
STEP_COMMANDS=()
STEP_CODES=()
STEP_LOGS=()
AGG_MISSING_HINTS=()
AGG_EXTERNAL_BLOCKERS=()
EXPECTED_SECRET_CONTRACT=()

cleanup() {
  rm -rf "$TMP_LOG_DIR"
}
trap cleanup EXIT

json_escape() {
  printf '%s' "$1" | jq -Rs .
}

queue_missing_hint() {
  local item="$1"
  local existing
  for existing in "${AGG_MISSING_HINTS[@]-}"; do
    if [ "$existing" = "$item" ]; then
      return
    fi
  done
  AGG_MISSING_HINTS+=("$item")
}

queue_external_blocker() {
  local item="$1"
  local existing
  for existing in "${AGG_EXTERNAL_BLOCKERS[@]-}"; do
    if [ "$existing" = "$item" ]; then
      return
    fi
  done
  AGG_EXTERNAL_BLOCKERS+=("$item")
}

collect_step_aggregates() {
  local log_file
  local line
  local candidate
  for log_file in "${STEP_LOGS[@]-}"; do
    while IFS= read -r line; do
      if [[ "$line" == *"Could not resolve host"* ]]; then
        queue_external_blocker "DNS_RESOLUTION_FAILED"
      fi
      if [[ "$line" == *"returned HTTP 000"* ]]; then
        queue_external_blocker "HTTP_000_NETWORK_OR_DNS"
      fi
      if [[ "$line" == *"unable to list Pages secrets"* ]]; then
        queue_external_blocker "PAGES_SECRET_LIST_UNAVAILABLE"
      fi
      if [[ "$line" == *"unable to query D1"* ]]; then
        queue_external_blocker "D1_QUERY_UNAVAILABLE"
      fi
      if [[ "$line" == *"operation not permitted"* ]]; then
        queue_external_blocker "LOCAL_PERMISSION_RESTRICTED"
      fi

      if [[ "$line" == *"missing secret name:"* ]]; then
        candidate="${line##*: }"
        if [ -n "$candidate" ]; then
          queue_missing_hint "$candidate"
        fi
      fi

      if [[ "$line" =~ ^[[:space:]]+-[[:space:]]([A-Z0-9_]+(=[^[:space:]]+)?)$ ]]; then
        candidate="${BASH_REMATCH[1]}"
        queue_missing_hint "$candidate"
      fi
    done < "$log_file"
  done
}

build_expected_secret_contract() {
  EXPECTED_SECRET_CONTRACT=(
    API_BASE_URL
    ENV_DEPLOY_TARGET
    REFUND_POLICY
    EMAIL_PROVIDER=mail_iai_one
    MAIL_API_BASE_URL
    MAIL_API_KEY
    MAIL_API_WORKSPACE_ID
    MAIL_API_WEBHOOK_SECRET
    EMAIL_FROM_SYSTEM
    EMAIL_FROM_PAY
    EMAIL_REPLY_TO_SUPPORT
    PAYMENTS_ADMIN_KEY
    VIETQR_BANK_BIN
    VIETQR_ACCOUNT_NO
    VIETQR_ACCOUNT_NAME
  )

  if [ "$REQUIRE_PAYPAL" = "1" ] || [ "$REQUIRE_INTL_PROVIDER" = "1" ]; then
    EXPECTED_SECRET_CONTRACT+=(
      PAYPAL_CLIENT_ID
      PAYPAL_CLIENT_SECRET
      PAYPAL_WEBHOOK_ID
      PAYPAL_MERCHANT_EMAIL
    )
  fi

  if [ "$REQUIRE_STRIPE" = "1" ]; then
    EXPECTED_SECRET_CONTRACT+=(
      STRIPE_SECRET_KEY
      STRIPE_PUBLISHABLE_KEY
      STRIPE_WEBHOOK_SECRET
    )
  fi
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

  return "$rc"
}

connectivity_preflight() {
  local code
  if code="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL" 2>/dev/null)"; then
    :
  else
    code="000"
  fi

  echo "Connectivity check: $BASE_URL -> $code"
  if [ "$code" = "000" ]; then
    echo "[FAIL] base URL is unreachable (network or DNS)"
    return 1
  fi
  if [ "$code" -ge 200 ] && [ "$code" -lt 500 ]; then
    echo "[PASS] base URL reachable"
    return 0
  fi
  echo "[WARN] base URL returned HTTP $code"
  return 0
}

write_report() {
  mkdir -p "$REPORT_DIR"
  build_expected_secret_contract
  collect_step_aggregates
  {
    echo "# TEAM2_RUNTIME_PHASE_GATE"
    echo
    echo "- generated_at_utc: $STAMP_UTC"
    echo "- generated_at_local: $STAMP_LOCAL"
    echo "- base_url: \`$BASE_URL\`"
    echo "- project_name: \`$PROJECT_NAME\`"
    echo "- target_envs: \`$TARGET_ENVS\`"
    echo "- require_paypal: \`$REQUIRE_PAYPAL\`"
    echo "- require_stripe: \`$REQUIRE_STRIPE\`"
    echo "- require_intl_provider: \`$REQUIRE_INTL_PROVIDER\`"
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
    echo "- skipped_steps: \`$SKIPPED\`"
    echo "- connectivity_failed: \`$CONNECTIVITY_FAILED\`"
    if [ "$FAILED" -gt 0 ]; then
      echo "- verdict: \`BLOCKED_PENDING_EXTERNAL_RUNTIME_READINESS\`"
    else
      echo "- verdict: \`RUNTIME_PHASE_GATE_PASS\`"
    fi
    echo
    echo "## Aggregates"
    echo
    echo "### Expected Secret Contract"
    if [ "${#EXPECTED_SECRET_CONTRACT[@]}" -eq 0 ]; then
      echo "- none"
    else
      local expected
      for expected in "${EXPECTED_SECRET_CONTRACT[@]}"; do
        echo "- \`$expected\`"
      done
    fi
    echo
    echo "### Missing Secret Hints"
    if [ "${#AGG_MISSING_HINTS[@]}" -eq 0 ]; then
      echo "- none"
    else
      local hint
      for hint in "${AGG_MISSING_HINTS[@]}"; do
        echo "- \`$hint\`"
      done
    fi
    echo
    echo "### External Blockers"
    if [ "${#AGG_EXTERNAL_BLOCKERS[@]}" -eq 0 ]; then
      echo "- none"
    else
      local blocker
      for blocker in "${AGG_EXTERNAL_BLOCKERS[@]}"; do
        echo "- \`$blocker\`"
      done
    fi
    echo
    echo "### Next Actions"
    if [ "${#AGG_EXTERNAL_BLOCKERS[@]}" -gt 0 ]; then
      echo "- Fix external blockers first (DNS, Cloudflare access, local wrangler permission) then rerun gate."
    fi
    if [ "${#AGG_MISSING_HINTS[@]}" -gt 0 ]; then
      echo "- Set missing secrets using \`scripts/provision-payment-live-secrets.sh\`, redeploy, rerun strict mode."
    fi
    if [ "${#AGG_EXTERNAL_BLOCKERS[@]}" -eq 0 ] && [ "${#AGG_MISSING_HINTS[@]}" -eq 0 ]; then
      echo "- No blockers detected from aggregate parser."
    fi
  } > "$REPORT_PATH"

  {
    echo "{"
    echo "  \"generated_at_utc\": $(json_escape "$STAMP_UTC"),"
    echo "  \"generated_at_local\": $(json_escape "$STAMP_LOCAL"),"
    echo "  \"base_url\": $(json_escape "$BASE_URL"),"
    echo "  \"project_name\": $(json_escape "$PROJECT_NAME"),"
    echo "  \"target_envs\": $(json_escape "$TARGET_ENVS"),"
    echo "  \"require_paypal\": $REQUIRE_PAYPAL,"
    echo "  \"require_stripe\": $REQUIRE_STRIPE,"
    echo "  \"require_intl_provider\": $REQUIRE_INTL_PROVIDER,"
    echo "  \"strict_mode\": $STRICT_MODE,"
    echo "  \"check_pages_secrets\": $CHECK_PAGES_SECRETS,"
    echo "  \"connectivity_preflight\": $CONNECTIVITY_PREFLIGHT,"
    echo "  \"skip_on_connectivity_fail\": $SKIP_ON_CONNECTIVITY_FAIL,"
    echo "  \"connectivity_failed\": $CONNECTIVITY_FAILED,"
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
    echo "  \"expected_secret_contract\": ["
    local i
    for ((i=0; i<${#EXPECTED_SECRET_CONTRACT[@]}; i++)); do
      if [ "$i" -gt 0 ]; then
        echo "    ,$(json_escape "${EXPECTED_SECRET_CONTRACT[$i]}")"
      else
        echo "    $(json_escape "${EXPECTED_SECRET_CONTRACT[$i]}")"
      fi
    done
    echo "  ],"
    echo "  \"aggregate_missing_hints\": ["
    for ((i=0; i<${#AGG_MISSING_HINTS[@]}; i++)); do
      if [ "$i" -gt 0 ]; then
        echo "    ,$(json_escape "${AGG_MISSING_HINTS[$i]}")"
      else
        echo "    $(json_escape "${AGG_MISSING_HINTS[$i]}")"
      fi
    done
    echo "  ],"
    echo "  \"external_blockers\": ["
    for ((i=0; i<${#AGG_EXTERNAL_BLOCKERS[@]}; i++)); do
      if [ "$i" -gt 0 ]; then
        echo "    ,$(json_escape "${AGG_EXTERNAL_BLOCKERS[$i]}")"
      else
        echo "    $(json_escape "${AGG_EXTERNAL_BLOCKERS[$i]}")"
      fi
    done
    echo "  ],"
    echo "  \"next_actions\": ["
    local action_count=0
    if [ "${#AGG_EXTERNAL_BLOCKERS[@]}" -gt 0 ]; then
      echo "    $(json_escape "Fix external blockers first (DNS, Cloudflare access, local wrangler permission) then rerun gate.")"
      action_count=$((action_count + 1))
    fi
    if [ "${#AGG_MISSING_HINTS[@]}" -gt 0 ]; then
      if [ "$action_count" -gt 0 ]; then
        echo "    ,$(json_escape "Set missing secrets using scripts/provision-payment-live-secrets.sh, redeploy, rerun strict mode.")"
      else
        echo "    $(json_escape "Set missing secrets using scripts/provision-payment-live-secrets.sh, redeploy, rerun strict mode.")"
      fi
      action_count=$((action_count + 1))
    fi
    if [ "$action_count" -eq 0 ]; then
      echo "    $(json_escape "No blockers detected from aggregate parser.")"
    fi
    echo "  ],"
    echo "  \"summary\": {"
    echo "    \"total_steps\": $TOTAL,"
    echo "    \"passed_steps\": $PASSED,"
    echo "    \"failed_steps\": $FAILED,"
    echo "    \"skipped_steps\": $SKIPPED,"
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
echo "Require PayPal: $REQUIRE_PAYPAL"
echo "Require Stripe: $REQUIRE_STRIPE"
echo "Require INTL provider: $REQUIRE_INTL_PROVIDER"
echo "Strict mode: $STRICT_MODE"
echo "Check Pages secrets: $CHECK_PAGES_SECRETS"
echo "Connectivity preflight: $CONNECTIVITY_PREFLIGHT"
echo "Skip steps on connectivity fail: $SKIP_ON_CONNECTIVITY_FAIL"

CONNECTIVITY_FAILED=0
if [ "$CONNECTIVITY_PREFLIGHT" = "1" ]; then
  if ! run_step "Connectivity preflight" connectivity_preflight; then
    CONNECTIVITY_FAILED=1
    queue_external_blocker "BASE_URL_UNREACHABLE"
    if [ "$SKIP_ON_CONNECTIVITY_FAIL" = "1" ]; then
      echo
      echo "[WARN] Connectivity preflight failed. Skipping deep runtime steps."
      SKIPPED=4
    fi
  fi
fi

if [ "$CONNECTIVITY_FAILED" = "1" ] && [ "$SKIP_ON_CONNECTIVITY_FAIL" = "1" ]; then
  :
else
  run_step "Secrets preflight" \
    env \
    BASE_URL="$BASE_URL" \
    PROJECT_NAME="$PROJECT_NAME" \
    TARGET_ENVS="$TARGET_ENVS" \
    REQUIRE_PAYPAL="$REQUIRE_PAYPAL" \
    REQUIRE_STRIPE="$REQUIRE_STRIPE" \
    CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
    bash "$ROOT_DIR/scripts/payment-live-secrets-preflight.sh" || true

  run_step "Team 2 live gate" \
    env \
    BASE_URL="$BASE_URL" \
    PROJECT_NAME="$PROJECT_NAME" \
    TARGET_ENVS="$TARGET_ENVS" \
    REQUIRE_PAYPAL="$REQUIRE_PAYPAL" \
    REQUIRE_STRIPE="$REQUIRE_STRIPE" \
    CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
    ENFORCE_COMMERCE_LIVE="$STRICT_MODE" \
    bash "$ROOT_DIR/scripts/team2-live-gate.sh" || true

  run_step "Rails independent gate" \
    env \
    BASE_URL="$BASE_URL" \
    PROJECT_NAME="$PROJECT_NAME" \
    TARGET_ENVS="$TARGET_ENVS" \
    REPORT_DIR="$TMP_LOG_DIR" \
    CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
    INTL_PROVIDER="$INTL_PROVIDER" \
    REQUIRE_INTL_PROVIDER="$REQUIRE_INTL_PROVIDER" \
    REQUIRE_PROVIDER_READY="$STRICT_MODE" \
    REQUIRE_COMPLETED="$STRICT_MODE" \
    bash "$ROOT_DIR/scripts/payment-rails-independent-gate.sh" || true

  run_step "Payment proof smoke" \
    env \
    BASE_URL="$BASE_URL" \
    PROJECT_NAME="$PROJECT_NAME" \
    TARGET_ENVS="$TARGET_ENVS" \
    CHECK_PAGES_SECRETS="$CHECK_PAGES_SECRETS" \
    REQUIRE_STRIPE="$REQUIRE_STRIPE" \
    REQUIRE_INTL_PROVIDER="$REQUIRE_INTL_PROVIDER" \
    REQUIRE_COMPLETED="$STRICT_MODE" \
    USD_PROVIDER="$INTL_PROVIDER" \
    D1_NAME="$D1_NAME" \
    PAYMENTS_ADMIN_KEY="$PAYMENTS_ADMIN_KEY" \
    bash "$ROOT_DIR/scripts/payment-live-proof-smoke.sh" || true
fi

echo
echo "== Team 2 Runtime Phase Summary =="
echo "TOTAL=$TOTAL PASSED=$PASSED FAILED=$FAILED SKIPPED=$SKIPPED"
write_report

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

echo "All phase checks passed."
