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

BASE_URL="${BASE_URL:-https://nguyenlananh.com}"
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
  [ -z "$body" ] && body='{}'
  if [ "$method" = "POST" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      -H "Content-Type: application/json" -d "$body" "$BASE_URL$path")
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
check "admin-redirect" GET  "/admin/"                        302
check "session-noauth" GET  "/api/auth/session"              401
check "logout"         POST "/api/auth/logout"               200
check "magic-request"  POST "/api/auth/magic-links/request"  422 '{}'
# Secrets are configured in production (GOOGLE_*, MAGIC_LINK_SECRET, etc.),
# so Google OAuth start should now build the redirect (302) instead of 501.
check "google-start"   GET  "/api/auth/google/start"         302

echo ""
echo "== RESULT: $(green "$PASS PASS"), $( [ "$FAIL" -gt 0 ] && red "$FAIL FAIL" || echo "$FAIL FAIL" ) =="
[ "$FAIL" -eq 0 ]
