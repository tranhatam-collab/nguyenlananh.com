#!/usr/bin/env bash
# Turnkey production deploy to the OFFICIAL Cloudflare account that holds the
# nguyenlananh.com DNS zone. This is the fix for error 1014 (CNAME Cross-User
# Banned): the Pages project must live in the SAME account as the DNS zone.
#
# Account (official): 62d57eaa548617aeecac766e5a1cb98e  (Anhhatam@gmail.com)
# Project name:       nguyenlananh-com
# Domain:             nguyenlananh.com / www.nguyenlananh.com
#
# PREREQUISITE — authentication (do ONE of these first, once):
#   Option A (browser, simplest):
#       wrangler login
#       # then in the browser, log in as Anhhatam@gmail.com and authorize
#   Option B (headless API token, best for CI):
#       # Create at: https://dash.cloudflare.com/profile/api-tokens
#       # Permissions: Account > Cloudflare Pages > Edit
#       #              Account > D1 > Edit
#       #              Zone    > DNS > Edit   (zone: nguyenlananh.com)
#       # Scope it to account 62d57eaa548617aeecac766e5a1cb98e
#       export CLOUDFLARE_API_TOKEN=<paste-token>
#
# Then run:  bash scripts/deploy-prod-official.sh
set -euo pipefail

ACCOUNT_ID="62d57eaa548617aeecac766e5a1cb98e"
# Verified 2026-06-03: only ONE project exists on this account:
#   - nguyenlananh-com  : owns nguyenlananh.com / www / admin + D1 + secrets.
#   - pages.dev suffix: nguyenlananh-com-63s.pages.dev (random suffix, NOT a separate project).
# Previous confusion was thinking -63s was a separate project. It is NOT.
PROJECT="${PROJECT:-nguyenlananh-com}"
BRANCH="main"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

echo "== Deploy to OFFICIAL account $ACCOUNT_ID =="

# 0. Verify auth works against the official account.
if ! wrangler whoami >/dev/null 2>&1; then
  echo "✘ Wrangler is not authenticated (token expired or missing)."
  echo "  Fix: run 'wrangler login' (as Anhhatam@gmail.com) OR export CLOUDFLARE_API_TOKEN."
  echo "  See the header of this script for token scopes."
  exit 1
fi

# 1. Ensure the Pages project exists in THIS account (idempotent).
if ! wrangler pages project list 2>/dev/null | grep -q "$PROJECT"; then
  echo "-- Project '$PROJECT' not found in account; creating --"
  wrangler pages project create "$PROJECT" --production-branch "$BRANCH"
else
  echo "-- Project '$PROJECT' already exists in account --"
fi

# 2. Deploy current working tree to the production branch.
echo "-- Deploying to branch '$BRANCH' --"
wrangler pages deploy . --project-name "$PROJECT" --branch "$BRANCH" --commit-dirty=true

# 3. Reminder: attach custom domains (one-time, idempotent in dashboard).
cat <<'EOF'

-- NEXT (one-time, if domains not yet attached to THIS project) --
   Dashboard > Workers & Pages > nguyenlananh-com > Custom domains > Add:
     nguyenlananh.com
     www.nguyenlananh.com
   (Cloudflare will reuse the existing DNS records in the same account — no 1014.)

EOF

# 4. Verify with the production smoke test.
echo "-- Verifying production --"
sleep 5
BASE_URL="https://nguyenlananh.com" bash scripts/smoke-production.sh || {
  echo "Smoke not fully green yet (DNS/domain attach may still be propagating)."
  echo "Re-run: BASE_URL=https://nguyenlananh.com bash scripts/smoke-production.sh"
}

echo "== Done. =="
