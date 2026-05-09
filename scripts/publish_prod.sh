#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RUN_LOCAL_PUBLIC_SITE_AUDIT="${RUN_LOCAL_PUBLIC_SITE_AUDIT:-1}"
RUN_FUNCTIONS_BUILD="${RUN_FUNCTIONS_BUILD:-1}"
RUN_HOMEPAGE_REFRESH_GATE="${RUN_HOMEPAGE_REFRESH_GATE:-1}"
ENFORCE_HOMEPAGE_LIVE_SMOKE="${ENFORCE_HOMEPAGE_LIVE_SMOKE:-0}"
HOMEPAGE_GATE_BASE_URL="${HOMEPAGE_GATE_BASE_URL:-https://www.nguyenlananh.com}"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Publish is locked to branch 'main'. Current branch: $CURRENT_BRANCH"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash changes before publishing."
  exit 1
fi

if [ "$RUN_FUNCTIONS_BUILD" = "1" ] && ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler is required for functions build gate. Install with: npm i -g @cloudflare/wrangler"
  exit 1
fi

echo "Syncing i18n and sitemap"
node scripts/sync-i18n.mjs

echo "Running human text gate"
node scripts/human-text-gate.mjs --no-write --fail

echo "Running bilingual release validation"
node scripts/validate-bilingual-release.mjs

echo "Running strict content audit"
node scripts/content-audit.mjs --fail

if [ "$RUN_HOMEPAGE_REFRESH_GATE" = "1" ]; then
  echo "Running homepage refresh readiness gate (local contract)"
  node scripts/homepage-refresh-readiness-gate.mjs --fail

  if [ "$ENFORCE_HOMEPAGE_LIVE_SMOKE" = "1" ]; then
    echo "Running homepage refresh readiness gate (live smoke)"
    BASE_URL="$HOMEPAGE_GATE_BASE_URL" node scripts/homepage-refresh-readiness-gate.mjs --fail --require-live
  fi
fi

if [ "$RUN_LOCAL_PUBLIC_SITE_AUDIT" = "1" ]; then
  echo "Running local public site audit"
  node scripts/local-public-site-audit.mjs
fi

if [ "$RUN_FUNCTIONS_BUILD" = "1" ]; then
  echo "Running Cloudflare Functions build gate"
  wrangler pages functions build
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "sync-i18n produced changes. Commit them before publishing."
  exit 1
fi

echo "Pushing main"
git push origin main

echo "Deploying to Cloudflare Pages"
SKIP_RELEASE_GATES=1 RUN_LOCAL_PUBLIC_SITE_AUDIT="$RUN_LOCAL_PUBLIC_SITE_AUDIT" RUN_FUNCTIONS_BUILD="$RUN_FUNCTIONS_BUILD" "$REPO_ROOT/scripts/deploy_cloudflare.sh"

echo "Publish flow completed."
