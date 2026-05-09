#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_GLOB="$ROOT_DIR/docs/reports/TEAM2_RUNTIME_PHASE_GATE_*.json"
REPORT_PATH="${REPORT_PATH:-}"

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

need_cmd jq
need_cmd ls

if [ -z "$REPORT_PATH" ]; then
  latest="$(ls -1t $REPORT_GLOB 2>/dev/null | head -n 1 || true)"
  if [ -z "$latest" ]; then
    echo "[FAIL] No TEAM2 runtime JSON report found."
    echo "Run: bash scripts/team2-runtime-phase-gate.sh"
    exit 1
  fi
  REPORT_PATH="$latest"
fi

if [ ! -f "$REPORT_PATH" ]; then
  echo "[FAIL] Report file not found: $REPORT_PATH"
  exit 1
fi

if ! jq empty "$REPORT_PATH" >/dev/null 2>&1; then
  echo "[FAIL] Invalid JSON report: $REPORT_PATH"
  exit 1
fi

verdict="$(jq -r '.summary.verdict // "UNKNOWN"' "$REPORT_PATH")"
total_steps="$(jq -r '.summary.total_steps // 0' "$REPORT_PATH")"
passed_steps="$(jq -r '.summary.passed_steps // 0' "$REPORT_PATH")"
failed_steps="$(jq -r '.summary.failed_steps // 0' "$REPORT_PATH")"
skipped_steps="$(jq -r '.summary.skipped_steps // 0' "$REPORT_PATH")"
connectivity_failed="$(jq -r '.connectivity_failed // 0' "$REPORT_PATH")"
base_url="$(jq -r '.base_url // ""' "$REPORT_PATH")"
require_stripe="$(jq -r '.require_stripe // 0' "$REPORT_PATH")"
require_paypal="$(jq -r '.require_paypal // 0' "$REPORT_PATH")"
require_intl_provider="$(jq -r '.require_intl_provider // 0' "$REPORT_PATH")"
strict_mode="$(jq -r '.strict_mode // 0' "$REPORT_PATH")"

echo "== Team 2 Runtime Next Actions =="
echo "Report: $REPORT_PATH"
echo "Base URL: $base_url"
echo "Verdict: $verdict"
echo "Summary: total=$total_steps passed=$passed_steps failed=$failed_steps skipped=$skipped_steps"
echo "Phase flags: strict_mode=$strict_mode require_paypal=$require_paypal require_stripe=$require_stripe require_intl_provider=$require_intl_provider connectivity_failed=$connectivity_failed"
echo

echo "== External blockers =="
blockers="$(jq -r '.external_blockers[]? // empty' "$REPORT_PATH")"
if [ -z "$blockers" ]; then
  echo "- none"
else
  printf "%s\n" "$blockers" | sed 's/^/- /'
fi
echo

echo "== Missing secrets =="
missing="$(jq -r '.aggregate_missing_hints[]? // empty' "$REPORT_PATH")"
if [ -z "$missing" ]; then
  echo "- none"
else
  printf "%s\n" "$missing" | sed 's/^/- /'
fi
echo

echo "== Expected secret contract =="
expected="$(jq -r '.expected_secret_contract[]? // empty' "$REPORT_PATH")"
if [ -z "$expected" ]; then
  echo "- none"
else
  printf "%s\n" "$expected" | sed 's/^/- /'
fi
echo

if [ -z "$missing" ] && [ -n "$expected" ] && [ "$verdict" != "RUNTIME_PHASE_GATE_PASS" ]; then
  echo "[INFO] Missing hints are empty because probes did not reach runtime fully. Use expected contract above."
  echo
fi

echo "== Suggested commands =="
if [ "$connectivity_failed" = "1" ]; then
  echo "- Fix DNS/network reachability to $base_url"
fi
if [ -n "$missing" ] || [ -n "$expected" ]; then
  echo "- Provision secrets (phase-aware):"
  echo "  TARGET_ENVS=\"production preview\" REQUIRE_PAYPAL=$require_paypal REQUIRE_STRIPE=$require_stripe bash scripts/provision-payment-live-secrets.sh"
  echo "- Redeploy:"
  echo "  bash scripts/deploy_cloudflare.sh"
fi
echo "- Re-run non-strict gate:"
echo "  BASE_URL=$base_url REQUIRE_PAYPAL=$require_paypal REQUIRE_STRIPE=$require_stripe REQUIRE_INTL_PROVIDER=$require_intl_provider STRICT_MODE=0 CHECK_PAGES_SECRETS=1 bash scripts/team2-runtime-phase-gate.sh"
echo "- Re-run strict gate:"
echo "  BASE_URL=$base_url REQUIRE_PAYPAL=$require_paypal REQUIRE_STRIPE=$require_stripe REQUIRE_INTL_PROVIDER=$require_intl_provider STRICT_MODE=1 CHECK_PAGES_SECRETS=1 bash scripts/team2-runtime-phase-gate.sh"

if [ "$verdict" = "RUNTIME_PHASE_GATE_PASS" ]; then
  echo
  echo "[PASS] Runtime phase gate is fully green."
else
  echo
  echo "[WARN] Runtime phase gate not fully green yet."
fi
