#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-nguyenlananh-com}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-62d57eaa548617aeecac766e5a1cb98e}"
BUILD_DIR="${BUILD_DIR:-}"
RUN_LOCAL_PUBLIC_SITE_AUDIT="${RUN_LOCAL_PUBLIC_SITE_AUDIT:-1}"
RUN_TEAM2_RUNTIME_GATE="${RUN_TEAM2_RUNTIME_GATE:-0}"
SKIP_RELEASE_GATES="${SKIP_RELEASE_GATES:-0}"
RUN_FUNCTIONS_BUILD="${RUN_FUNCTIONS_BUILD:-1}"
TEAM2_BASE_URL="${TEAM2_BASE_URL:-https://www.nguyenlananh.com}"
TEAM2_REQUIRE_STRIPE="${TEAM2_REQUIRE_STRIPE:-0}"
TEAM2_STRICT_MODE="${TEAM2_STRICT_MODE:-0}"
TEAM2_CHECK_PAGES_SECRETS="${TEAM2_CHECK_PAGES_SECRETS:-1}"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler is not installed. Install with: npm i -g @cloudflare/wrangler"
  exit 1
fi

echo "Syncing i18n and content registry"
node "$REPO_ROOT/scripts/sync-i18n.mjs"

if [ "$SKIP_RELEASE_GATES" != "1" ]; then
  echo "Running human text, SEO, QA, and reporting gate"
  node "$REPO_ROOT/scripts/human-text-gate.mjs" --no-write --fail

  echo "Running bilingual release validation"
  node "$REPO_ROOT/scripts/validate-bilingual-release.mjs"

  echo "Running strict content audit"
  node "$REPO_ROOT/scripts/content-audit.mjs" --fail

  if [ "$RUN_LOCAL_PUBLIC_SITE_AUDIT" = "1" ]; then
    echo "Running local public site audit"
    node "$REPO_ROOT/scripts/local-public-site-audit.mjs"
  fi

  if [ "$RUN_FUNCTIONS_BUILD" = "1" ]; then
    echo "Running Cloudflare Functions build gate"
    wrangler pages functions build
  fi
else
  echo "Skipping release gates in deploy script (SKIP_RELEASE_GATES=1)"
fi

if [ "$RUN_TEAM2_RUNTIME_GATE" = "1" ]; then
  echo "Running Team 2 runtime ops loop"
  BASE_URL="$TEAM2_BASE_URL" \
  REQUIRE_STRIPE="$TEAM2_REQUIRE_STRIPE" \
  STRICT_MODE="$TEAM2_STRICT_MODE" \
  CHECK_PAGES_SECRETS="$TEAM2_CHECK_PAGES_SECRETS" \
  bash "$REPO_ROOT/scripts/team2-runtime-ops-loop.sh"
fi

if [ -z "$BUILD_DIR" ]; then
  BUILD_DIR="$(node "$REPO_ROOT/scripts/prepare_release_dist.mjs")"
fi

echo "Deploying ${BUILD_DIR} to Cloudflare Pages project ${PROJECT_NAME}"
echo "Using Cloudflare account ${CLOUDFLARE_ACCOUNT_ID}"
wrangler pages deploy "$BUILD_DIR" --project-name "$PROJECT_NAME" --branch main --commit-dirty=true

echo "Deploy command sent. Check Cloudflare Pages for rollout status."
