#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-nguyenlananh-com}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-62d57eaa548617aeecac766e5a1cb98e}"
BUILD_DIR="${BUILD_DIR:-}"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler is not installed. Install with: npm i -g @cloudflare/wrangler"
  exit 1
fi

echo "Syncing i18n and content registry"
node "$REPO_ROOT/scripts/sync-i18n.mjs"

echo "Running human text, SEO, QA, and reporting gate"
node "$REPO_ROOT/scripts/human-text-gate.mjs" --no-write --fail

echo "Running bilingual release validation"
node "$REPO_ROOT/scripts/validate-bilingual-release.mjs"

if [ -z "$BUILD_DIR" ]; then
  BUILD_DIR="$(node "$REPO_ROOT/scripts/prepare_release_dist.mjs")"
fi

echo "Deploying ${BUILD_DIR} to Cloudflare Pages project ${PROJECT_NAME}"
echo "Using Cloudflare account ${CLOUDFLARE_ACCOUNT_ID}"
wrangler pages deploy "$BUILD_DIR" --project-name "$PROJECT_NAME" --branch main --commit-dirty=true

echo "Deploy command sent. Check Cloudflare Pages for rollout status."
