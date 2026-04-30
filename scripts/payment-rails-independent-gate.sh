#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
PLAN_CODE="${PLAN_CODE:-year1}"
VN_EMAIL="${VN_EMAIL:-ops-rail-vn@nguyenlananh.com}"
INTL_EMAIL="${INTL_EMAIL:-ops-rail-intl@nguyenlananh.com}"
INTL_PROVIDER="${INTL_PROVIDER:-paypal}"
REQUIRE_RAIL_GUARD="${REQUIRE_RAIL_GUARD:-1}"
REQUIRE_PROVIDER_READY="${REQUIRE_PROVIDER_READY:-0}"
REQUIRE_COMPLETED="${REQUIRE_COMPLETED:-0}"
REPORT_DIR="${REPORT_DIR:-$ROOT_DIR/docs/reports}"

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

need_cmd curl
need_cmd jq

STAMP_UTC="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
STAMP_LOCAL="$(date '+%Y-%m-%d %H:%M:%S %z')"
REPORT_TS="$(date '+%Y%m%d_%H%M%S')"
REPORT_PATH="$REPORT_DIR/PAYMENT_RAILS_INDEPENDENT_GATE_${REPORT_TS}.md"

FAILURES=0
WARNINGS=0

pass() {
  local msg="$1"
  echo "[PASS] $msg"
}

warn() {
  local msg="$1"
  echo "[WARN] $msg"
  WARNINGS=$((WARNINGS + 1))
}

fail() {
  local msg="$1"
  echo "[FAIL] $msg"
  FAILURES=$((FAILURES + 1))
}

guard_fail_or_warn() {
  local msg="$1"
  if [ "$REQUIRE_RAIL_GUARD" = "1" ]; then
    fail "$msg"
  else
    warn "$msg"
  fi
}

ready_fail_or_warn() {
  local msg="$1"
  if [ "$REQUIRE_PROVIDER_READY" = "1" ]; then
    fail "$msg"
  else
    warn "$msg"
  fi
}

mkdir -p "$REPORT_DIR"

checkout_probe() {
  local provider="$1"
  local country="$2"
  local email="$3"
  local locale="$4"
  local key="$5"

  curl -sS -X POST "$BASE_URL/api/payments/create-checkout" \
    -H "content-type: application/json" \
    -H "x-idempotency-key: $key" \
    --data "{\"email\":\"$email\",\"plan_code\":\"$PLAN_CODE\",\"identity_country\":\"$country\",\"provider\":\"$provider\",\"locale\":\"$locale\",\"next_path\":\"/members/dashboard/\"}" \
    2>/dev/null || true
}

echo "== payment rails independent gate =="
echo "UTC: $STAMP_UTC"
echo "Local: $STAMP_LOCAL"
echo "Base URL: $BASE_URL"
echo "Require rail guard: $REQUIRE_RAIL_GUARD"
echo "Require provider ready: $REQUIRE_PROVIDER_READY"
echo "Require completed: $REQUIRE_COMPLETED"
echo

HEALTH_JSON="$(curl -sS "$BASE_URL/api/payments/health" 2>/dev/null || true)"
if printf "%s" "$HEALTH_JSON" | jq empty >/dev/null 2>&1; then
  if printf "%s" "$HEALTH_JSON" | jq -e '.ok == true and .environment.db_ready == true' >/dev/null 2>&1; then
    pass "health ok=true and db_ready=true"
  else
    fail "health endpoint did not return ok=true and db_ready=true"
  fi
else
  fail "health endpoint returned invalid JSON"
fi

PROVIDERS_JSON="$(curl -sS "$BASE_URL/api/payments/providers" 2>/dev/null || true)"
if printf "%s" "$PROVIDERS_JSON" | jq empty >/dev/null 2>&1; then
  pass "providers endpoint returned valid JSON"
else
  fail "providers endpoint returned invalid JSON"
fi

RAILS_JSON="$(curl -sS "$BASE_URL/api/payments/rails" 2>/dev/null || true)"
if printf "%s" "$RAILS_JSON" | jq empty >/dev/null 2>&1; then
  if printf "%s" "$RAILS_JSON" | jq -e '.ok == true and (.rails | length) >= 2' >/dev/null 2>&1; then
    pass "rails endpoint returned rail catalog"
  else
    fail "rails endpoint JSON missing expected catalog structure"
  fi
else
  fail "rails endpoint returned invalid JSON"
fi

PROBE_VN_USD_KEY="rail-vn-usd-$(date +%s)"
PROBE_INTL_VND_KEY="rail-intl-vnd-$(date +%s)"
PROBE_VN_VND_KEY="rail-vn-vnd-$(date +%s)"
PROBE_INTL_USD_KEY="rail-intl-usd-$(date +%s)"

VN_USD_JSON="$(checkout_probe paypal VN "$VN_EMAIL" vi "$PROBE_VN_USD_KEY")"
VN_USD_CODE="$(printf "%s" "$VN_USD_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$VN_USD_CODE" = "VN_ID_REQUIRES_VND" ]; then
  pass "rail guard blocks VN identity on USD provider (code=VN_ID_REQUIRES_VND)"
else
  guard_fail_or_warn "VN->USD probe expected VN_ID_REQUIRES_VND, got ${VN_USD_CODE:-unknown}"
fi

INTL_VND_JSON="$(checkout_probe vietqr INTL "$INTL_EMAIL" en "$PROBE_INTL_VND_KEY")"
INTL_VND_CODE="$(printf "%s" "$INTL_VND_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$INTL_VND_CODE" = "INTERNATIONAL_ID_REQUIRES_USD" ]; then
  pass "rail guard blocks INTL identity on VND provider (code=INTERNATIONAL_ID_REQUIRES_USD)"
else
  guard_fail_or_warn "INTL->VND probe expected INTERNATIONAL_ID_REQUIRES_USD, got ${INTL_VND_CODE:-unknown}"
fi

VN_VND_JSON="$(checkout_probe vietqr VN "$VN_EMAIL" vi "$PROBE_VN_VND_KEY")"
VN_VND_OK="$(printf "%s" "$VN_VND_JSON" | jq -r '.ok // false' 2>/dev/null || echo false)"
VN_VND_CODE="$(printf "%s" "$VN_VND_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
if [ "$VN_VND_OK" = "true" ]; then
  pass "VN rail probe on vietqr accepted"
elif [ "$VN_VND_CODE" = "PROVIDER_NOT_READY" ]; then
  ready_fail_or_warn "VN rail provider is not ready yet (code=PROVIDER_NOT_READY)"
else
  fail "VN rail probe failed with code=${VN_VND_CODE:-unknown}"
fi

INTL_USD_JSON="$(checkout_probe "$INTL_PROVIDER" INTL "$INTL_EMAIL" en "$PROBE_INTL_USD_KEY")"
INTL_USD_OK="$(printf "%s" "$INTL_USD_JSON" | jq -r '.ok // false' 2>/dev/null || echo false)"
INTL_USD_CODE="$(printf "%s" "$INTL_USD_JSON" | jq -r '.code // ""' 2>/dev/null || true)"
INTL_USD_URL="$(printf "%s" "$INTL_USD_JSON" | jq -r '.checkout_url // ""' 2>/dev/null || true)"
if [ "$INTL_USD_OK" = "true" ] && [ -n "$INTL_USD_URL" ]; then
  pass "INTL rail probe on $INTL_PROVIDER returned checkout_url"
elif [ "$INTL_USD_CODE" = "PROVIDER_NOT_READY" ]; then
  ready_fail_or_warn "INTL rail provider $INTL_PROVIDER is not ready yet (code=PROVIDER_NOT_READY)"
else
  fail "INTL rail probe failed with code=${INTL_USD_CODE:-unknown}"
fi

{
  echo "# PAYMENT_RAILS_INDEPENDENT_GATE"
  echo
  echo "- generated_at_utc: $STAMP_UTC"
  echo "- generated_at_local: $STAMP_LOCAL"
  echo "- base_url: \`$BASE_URL\`"
  echo "- require_rail_guard: \`$REQUIRE_RAIL_GUARD\`"
  echo "- require_provider_ready: \`$REQUIRE_PROVIDER_READY\`"
  echo "- require_completed: \`$REQUIRE_COMPLETED\`"
  echo
  echo "## Summary"
  echo
  echo "- failures: \`$FAILURES\`"
  echo "- warnings: \`$WARNINGS\`"
  echo
  echo "## Health"
  echo
  echo '```json'
  printf "%s\n" "$HEALTH_JSON" | jq .
  echo '```'
  echo
  echo "## Providers"
  echo
  echo '```json'
  printf "%s\n" "$PROVIDERS_JSON" | jq .
  echo '```'
  echo
  echo "## Rails"
  echo
  echo '```json'
  printf "%s\n" "$RAILS_JSON" | jq .
  echo '```'
  echo
  echo "## Probes"
  echo
  echo "### VN identity + PayPal (must block)"
  echo '```json'
  printf "%s\n" "$VN_USD_JSON" | jq .
  echo '```'
  echo
  echo "### INTL identity + VietQR (must block)"
  echo '```json'
  printf "%s\n" "$INTL_VND_JSON" | jq .
  echo '```'
  echo
  echo "### VN identity + VietQR"
  echo '```json'
  printf "%s\n" "$VN_VND_JSON" | jq .
  echo '```'
  echo
  echo "### INTL identity + $INTL_PROVIDER"
  echo '```json'
  printf "%s\n" "$INTL_USD_JSON" | jq .
  echo '```'
} >"$REPORT_PATH"

echo
echo "Report: $REPORT_PATH"
echo "FAILURES=$FAILURES WARNINGS=$WARNINGS"

if [ "$FAILURES" -gt 0 ]; then
  exit 1
fi

if [ "$REQUIRE_COMPLETED" = "1" ] && [ "$WARNINGS" -gt 0 ]; then
  exit 1
fi

exit 0
