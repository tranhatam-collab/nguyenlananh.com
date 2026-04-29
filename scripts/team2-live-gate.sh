#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
TEST_EMAIL="${TEST_EMAIL:-qa+team2-livegate@nguyenlananh.com}"

DOMAIN_APEX="${DOMAIN_APEX:-https://nguyenlananh.com}"
DOMAIN_WWW="${DOMAIN_WWW:-https://www.nguyenlananh.com}"
DOMAIN_ADMIN="${DOMAIN_ADMIN:-https://admin.nguyenlananh.com}"

print_status() {
  local url="$1"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url")"
  echo "$url -> $code"
}

echo "== Team 2 Live Gate =="
echo "UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "Local: $(date '+%Y-%m-%d %H:%M:%S %z')"
echo

echo "== Domain HTTP status =="
print_status "$DOMAIN_APEX"
print_status "$DOMAIN_WWW"
print_status "$DOMAIN_ADMIN"
echo

echo "== Payments health by domain =="
for domain in "$DOMAIN_APEX" "$DOMAIN_WWW" "$DOMAIN_ADMIN"; do
  echo "-- $domain/api/payments/health"
  curl -sS "$domain/api/payments/health" | jq '{ok, db_ready: .environment.db_ready, deploy_target: .environment.deploy_target}'
done
echo

echo "== Admin smoke (www) =="
"$ROOT_DIR/scripts/smoke-admin-content-accounts.sh" "$DOMAIN_WWW"
echo

echo "== Payment/Auth smoke (www) =="
BASE_URL="$BASE_URL" TEST_EMAIL="$TEST_EMAIL" "$ROOT_DIR/docs/contracts/paypal-backend-smoke.sh"
echo

echo "Live gate completed."
