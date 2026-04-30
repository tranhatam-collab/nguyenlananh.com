#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
TEST_EMAIL="${TEST_EMAIL:-qa+team2-livegate@nguyenlananh.com}"
ENFORCE_COMMERCE_LIVE="${ENFORCE_COMMERCE_LIVE:-0}"

DOMAIN_APEX="${DOMAIN_APEX:-https://nguyenlananh.com}"
DOMAIN_WWW="${DOMAIN_WWW:-https://www.nguyenlananh.com}"
DOMAIN_ADMIN="${DOMAIN_ADMIN:-https://admin.nguyenlananh.com}"
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

print_status() {
  local url="$1"
  local label="$2"
  local expected="${3:-200}"
  local code
  if code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)"; then
    :
  else
    code="000"
  fi
  echo "$url -> $code"
  if [ "$code" = "$expected" ]; then
    pass "$label returned HTTP $expected"
  else
    fail "$label returned HTTP $code (expected $expected)"
  fi
}

echo "== Team 2 Live Gate =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Local: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "Enforce commerce-live criteria: $ENFORCE_COMMERCE_LIVE"
echo

echo "== Domain HTTP status =="
print_status "$DOMAIN_APEX" "apex domain"
print_status "$DOMAIN_WWW" "www domain"
print_status "$DOMAIN_ADMIN" "admin domain"
echo

echo "== Payments health by domain =="
for domain in "$DOMAIN_APEX" "$DOMAIN_WWW" "$DOMAIN_ADMIN"; do
  echo "-- $domain/api/payments/health"
  health_json="$(curl -sS "$domain/api/payments/health" 2>/dev/null || true)"
  if printf "%s" "$health_json" | jq empty >/dev/null 2>&1; then
    printf "%s" "$health_json" | jq '{ok, db_ready: .environment.db_ready, deploy_target: .environment.deploy_target}'
    ok="$(printf "%s" "$health_json" | jq -r '.ok // false')"
    db_ready="$(printf "%s" "$health_json" | jq -r '.environment.db_ready // false')"
    if [ "$ok" = "true" ] && [ "$db_ready" = "true" ]; then
      pass "$domain health ok + db_ready true"
    else
      fail "$domain health did not return ok=true and db_ready=true"
    fi
  else
    fail "$domain health response was not valid JSON"
  fi
done
echo

echo "== Provider readiness snapshot =="
providers_json="$(curl -sS "$BASE_URL/api/payments/providers" 2>/dev/null || true)"
if printf "%s" "$providers_json" | jq empty >/dev/null 2>&1; then
  printf "%s" "$providers_json" | jq '{ok, env: .environment, providers: [.providers[] | {code, enabled, mode}]}'
  email_provider="$(printf "%s" "$providers_json" | jq -r '.environment.email_provider // "unknown"')"
  if [ "$email_provider" = "mail_iai_one" ]; then
    pass "email_provider is mail_iai_one"
  else
    warn "email_provider is $email_provider (expected mail_iai_one for Team 2 final runtime proof)"
  fi
  for code in paypal stripe vietqr; do
    enabled="$(printf "%s" "$providers_json" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.enabled // false)')"
    mode="$(printf "%s" "$providers_json" | jq -r --arg code "$code" '.providers[] | select(.code == $code) | (.mode // "unknown")')"
    if [ "$enabled" = "true" ]; then
      pass "$code is enabled (mode=$mode)"
    else
      if [ "$ENFORCE_COMMERCE_LIVE" = "1" ]; then
        fail "$code is not enabled (mode=$mode)"
      else
        warn "$code is not enabled yet (mode=$mode)"
      fi
    fi
  done
else
  fail "providers response was not valid JSON"
fi
echo

echo "== Admin smoke (www) =="
if "$ROOT_DIR/scripts/smoke-admin-content-accounts.sh" "$DOMAIN_WWW"; then
  pass "admin smoke completed"
else
  fail "admin smoke failed"
fi
echo

echo "== Payment/Auth smoke (www) =="
if BASE_URL="$BASE_URL" TEST_EMAIL="$TEST_EMAIL" "$ROOT_DIR/docs/contracts/paypal-backend-smoke.sh"; then
  pass "payment/auth smoke completed"
else
  fail "payment/auth smoke failed"
fi
echo

echo "== Gate summary =="
echo "FAILURES=$FAILURES WARNINGS=$WARNINGS"
if [ "$FAILURES" -gt 0 ]; then
  echo "Live gate completed with failures."
  exit 1
fi

if [ "$ENFORCE_COMMERCE_LIVE" = "1" ] && [ "$WARNINGS" -gt 0 ]; then
  echo "Live gate completed with warnings while ENFORCE_COMMERCE_LIVE=1."
  exit 1
fi

echo "Live gate completed."
