#!/usr/bin/env bash
# Smoke test against PRODUCTION custom domain.
# Usage:
#   bash scripts/smoke-production.sh
#   BASE_URL=https://www.nguyenlananh.com bash scripts/smoke-production.sh
# Exit code 0 = all PASS, 1 = at least one FAIL.
#
# NOTE: As of 2026-05-30 the custom domain may return HTTP 403 "error 1014"
# (CNAME Cross-User Banned) — a Cloudflare account/DNS mismatch (see
# docs/plans/MASTER_PLAN_AUTONOMOUS.md §3 HB1). This script detects 1014 and
# prints a clear remediation pointer instead of a generic failure.
set -uo pipefail

BASE_URL="${BASE_URL:-https://www.nguyenlananh.com}"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m' "$1"; }
red()   { printf '\033[31m%s\033[0m' "$1"; }

# Detect Cloudflare 1014 banner early.
root_body=$(curl -s "$BASE_URL/" || true)
if printf '%s' "$root_body" | grep -q "error code: 1014"; then
  echo "$(red "BLOCKED: Cloudflare error 1014 (CNAME Cross-User Banned) at $BASE_URL")"
  echo "  -> Custom domain attached to a different Cloudflare account than the Pages project."
  echo "  -> Fix: docs/plans/MASTER_PLAN_AUTONOMOUS.md §3.1 (HB1) — Dashboard, ~45 min."
  exit 2
fi

check() {
  local name="$1" method="$2" path="$3" expected="$4" body="${5:-}"
  local code
  local extra_headers=()
  [ -z "$body" ] && body='{}'
  if [ "$path" = "/api/payments/vietqr/create-order" ]; then
    extra_headers=(-H "X-Idempotency-Key: smoke-$(date +%s)-$$")
  fi
  if [ "$method" = "POST" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" ${extra_headers[@]:+"${extra_headers[@]}"} -d "$body" "$BASE_URL$path")
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  fi
  if [ "$code" = "$expected" ]; then
    printf '  %s  %-6s %-45s %s\n' "$(green PASS)" "$method" "$path" "$code"
    PASS=$((PASS+1))
  else
    printf '  %s  %-6s %-45s got=%s want=%s\n' "$(red FAIL)" "$method" "$path" "$code" "$expected"
    FAIL=$((FAIL+1))
  fi
}

echo "== Smoke (PRODUCTION) :: $BASE_URL =="
echo "-- Static --"
check "home"           GET  "/"                              200
check "en-home"        GET  "/en/"                           200
check "members"        GET  "/members/"                      200
echo "-- Functions / API (proves functions/ deployed) --"
# Admin routes redirect to login when unauthenticated (correct RBAC behavior)
check "admin-page"     GET  "/admin/"                        302
check "session-noauth" GET  "/api/auth/session"              401
check "logout"         POST "/api/auth/logout"               200
# Magic link removed by design (commit 8c93caae); Google OAuth is the sole auth method.
# Payment order creation requires a Turnstile token from the frontend, so it is tested manually.
# Secrets are configured in production (GOOGLE_*, etc.),
# so Google OAuth start should now build the redirect (302) instead of 501.
check "google-start"   GET  "/api/auth/google/start"         302

echo "-- Turnstile runtime config --"
check "turnstile-config" GET "/api/turnstile/config"         200
turnstile_body=$(curl -s "$BASE_URL/api/turnstile/config")
if printf '%s' "$turnstile_body" | grep -q 'window.TURNSTILE_SITE_KEY_CONFIGURED = true;'; then
  printf '  %s  %-6s %-45s %s\n' "$(green PASS)" "CHECK" "turnstile configured flag" "true"
  PASS=$((PASS+1))
else
  printf '  %s  %-6s %-45s %s\n' "$(red FAIL)" "CHECK" "turnstile configured flag" "missing/false"
  FAIL=$((FAIL+1))
fi

echo ""
echo "== RESULT: $(green "$PASS PASS"), $( [ "$FAIL" -gt 0 ] && red "$FAIL FAIL" || echo "$FAIL FAIL" ) =="
[ "$FAIL" -eq 0 ]
