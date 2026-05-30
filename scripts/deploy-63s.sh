#!/usr/bin/env bash
# Deploy current HEAD to nguyenlananh-com-63s (the project that owns
custom domains + D1 + secrets). Run after wrangler auth is restored.
set -euo pipefail

PROJECT="nguyenlananh-com-63s"
BRANCH="main"
ACCOUNT="62d57eaa548617aeecac766e5a1cb98e"
REPO="/Users/tranhatam/Documents/Devnewproject/nguyenlananh.com"

cd "$REPO"

echo "== Deploy to $PROJECT (account $ACCOUNT) =="

# Verify auth
if ! wrangler whoami >/dev/null 2>&1; then
  echo "Wrangler not authenticated. Run: wrangler login"
  exit 1
fi

# Deploy (override project name; wrangler.toml name is the empty project)
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT"
wrangler pages deploy . \
  --project-name "$PROJECT" \
  --branch "$BRANCH"

echo ""
echo "== Verifying (wait 10s for propagation) =="
sleep 10

check() {
  local url="$1" want="$2" name="$3"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$want" ]; then
    echo "  PASS $name ($code)"
  else
    echo "  FAIL $name (got $code, want $want)"
  fi
}

check "https://nguyenlananh.com/"                       "200" "home"
check "https://nguyenlananh.com/admin/"                  "302" "admin-redirect"
check "https://nguyenlananh.com/api/auth/session"        "401" "session-noauth"
check "https://nguyenlananh.com/api/auth/logout"        "200" "logout"
check "https://nguyenlananh.com/api/auth/google/start"  "302" "google-start"

echo "== Done =="
