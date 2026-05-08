#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${ADMIN_SMOKE_BASE:-https://590cf00d.nguyenlananh-com.pages.dev}}"

ROUTES=(
  "/admin/"
  "/admin/dashboard/"
  "/admin/content/"
  "/admin/members/"
  "/admin/creators/"
  "/admin/settings/"
  "/en/admin/"
  "/en/admin/dashboard/"
  "/en/admin/content/"
  "/en/admin/members/"
  "/en/admin/creators/"
  "/en/admin/settings/"
)

OK=0
FAIL=0

log_ok() {
  echo "[PASS] $1"
  OK=$((OK + 1))
}

log_fail() {
  echo "[FAIL] $1"
  FAIL=$((FAIL + 1))
}

check_http() {
  local route="$1"
  local url="$BASE_URL${route}"
  local code
  code="$(curl -s -o /tmp/admin-smoke.body -w "%{http_code}" "$url" || true)"
  if [ "$code" = "200" ]; then
    log_ok "$route => 200"
  else
    log_fail "$route => $code"
  fi
}

fetch_body() {
  local url="$1"
  curl -fsSL --retry 2 --retry-delay 1 --connect-timeout 10 --max-time 30 "$url" 2>/dev/null || true
}

for route in "${ROUTES[@]}"; do
  check_http "$route"
done

echo
echo "--- Admin HTML markers ---"

settings_body="$(fetch_body "$BASE_URL/admin/settings/")"
en_settings_body="$(fetch_body "$BASE_URL/en/admin/settings/")"

if [ -z "$settings_body" ]; then
  log_fail "/admin/settings/ body fetch failed"
fi
if [ -z "$en_settings_body" ]; then
  log_fail "/en/admin/settings/ body fetch failed"
fi

if grep -Fq 'admin-account-manager' <<< "$settings_body"; then
  log_ok "/admin/settings/ has admin account manager section"
else
  log_fail "/admin/settings/ missing admin account manager"
fi

if grep -Fq 'admin-account-save' <<< "$settings_body"; then
  log_ok "/admin/settings/ has account save control"
else
  log_fail "/admin/settings/ missing account save control"
fi

if grep -Fq 'admin-account-reset' <<< "$settings_body"; then
  log_ok "/admin/settings/ has account reset control"
else
  log_fail "/admin/settings/ missing account reset control"
fi

if grep -Fq 'admin-console.js' <<< "$settings_body"; then
  log_ok "/admin/settings/ loads admin-console"
else
  log_fail "/admin/settings/ missing admin-console"
fi

if grep -Fq 'admin-account-manager' <<< "$en_settings_body"; then
  log_ok "/en/admin/settings/ has admin account manager section"
else
  log_fail "/en/admin/settings/ missing admin account manager"
fi

console_js="$(fetch_body "$BASE_URL/assets/admin-console.js")"
if [ -z "$console_js" ]; then
  log_fail "admin-console.js fetch failed"
fi

if grep -Fq "content_editor" <<< "$console_js"; then
  log_ok "admin-console.js includes content_editor role"
else
  log_fail "admin-console.js missing content_editor role"
fi

if grep -Fq "content_manage" <<< "$console_js"; then
  log_ok "admin-console.js includes content_manage permission"
else
  log_fail "admin-console.js missing content_manage permission"
fi

if grep -Fq "content_image" <<< "$console_js"; then
  log_ok "admin-console.js includes content_image permission"
else
  log_fail "admin-console.js missing content_image permission"
fi

if grep -Fq "content.editor" <<< "$console_js"; then
  log_ok "default seed account content.editor exists in admin-console.js"
else
  log_fail "default seed account content.editor not found in admin-console.js"
fi

echo
echo "SUMMARY: PASS=$OK  FAIL=$FAIL"

if [ "$FAIL" -ne 0 ]; then
  exit 1
fi
