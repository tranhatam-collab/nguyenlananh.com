#!/usr/bin/env bash
# Smoke test against the Cloudflare Pages PREVIEW deployment.
# Usage:
#   bash scripts/smoke-preview.sh
#   BASE_URL=https://preview.nguyenlananh-com.pages.dev bash scripts/smoke-preview.sh
# Exit code 0 = all PASS, 1 = at least one FAIL.
set -uo pipefail

BASE_URL="${BASE_URL:-https://preview.nguyenlananh-com.pages.dev}"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m' "$1"; }
red()   { printf '\033[31m%s\033[0m' "$1"; }

# check NAME METHOD PATH EXPECTED_CODE [BODY_JSON]
check() {
  local name="$1" method="$2" path="$3" expected="$4" body="${5:-}"
  local code
  [ -z "$body" ] && body='{}'
  if [ "$method" = "POST" ]; then
    code=$(curl -s -o /tmp/_smoke_body -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" -d "$body" "$BASE_URL$path")
  else
    code=$(curl -s -o /tmp/_smoke_body -w "%{http_code}" "$BASE_URL$path")
  fi
  if [ "$code" = "$expected" ]; then
    printf '  %s  %-6s %-45s %s\n' "$(green PASS)" "$method" "$path" "$code"
    PASS=$((PASS+1))
  else
    printf '  %s  %-6s %-45s got=%s want=%s\n' "$(red FAIL)" "$method" "$path" "$code" "$expected"
    FAIL=$((FAIL+1))
  fi
}

echo "== Smoke (PREVIEW) :: $BASE_URL =="
echo "-- Static pages (VI) --"
check "home"        GET "/"               200
check "members"     GET "/members/"       200
check "bai-viet"    GET "/bai-viet/"      200
check "join"        GET "/join/"          200
check "phuong-phap" GET "/phuong-phap/"   200
echo "-- Static pages (EN parity) --"
check "en-home"        GET "/en/"             200
check "en-members"     GET "/en/members/"     200
check "en-bai-viet"    GET "/en/bai-viet/"    200
check "en-join"        GET "/en/join/"        200
check "en-phuong-phap" GET "/en/phuong-phap/" 200
echo "-- Admin gate --"
check "admin-redirect" GET "/admin/" 302
echo "-- Auth API --"
check "session-noauth" GET  "/api/auth/session"               401
check "logout"         POST "/api/auth/logout"                200
check "google-start"   GET  "/api/auth/google/start"          501
check "google-cb"      GET  "/api/auth/google/callback"       501
check "magic-request"  POST "/api/auth/magic-links/request"   422 '{}'
check "magic-consume"  POST "/api/auth/magic-links/consume"   422 '{}'
echo "-- Admin API (key-gated) --"
check "vietqr-confirm" POST "/api/admin/vietqr-confirm"             503 '{}'
check "ops-queue"      GET  "/api/admin/ops/queue"                  503
check "vietqr-orders"  GET  "/api/admin/payments/vietqr/orders"     503
echo "-- Asset (LCP hero) --"
check "logo-mark"      GET "/assets/brand/logo-mark.svg" 200

echo ""
echo "== RESULT: $(green "$PASS PASS"), $( [ "$FAIL" -gt 0 ] && red "$FAIL FAIL" || echo "$FAIL FAIL" ) =="
[ "$FAIL" -eq 0 ]
