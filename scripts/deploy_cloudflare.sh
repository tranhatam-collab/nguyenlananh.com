#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-nguyenlananh-com}"
BUILD_DIR="${BUILD_DIR:-}"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler is not installed. Install with: npm i -g @cloudflare/wrangler"
  exit 1
fi

if [ -z "$BUILD_DIR" ]; then
  BUILD_DIR="$(node "$REPO_ROOT/scripts/prepare_release_dist.mjs")"
fi

echo "Deploying ${BUILD_DIR} to Cloudflare Pages project ${PROJECT_NAME}"
wrangler pages deploy "$BUILD_DIR" --project-name "$PROJECT_NAME" --branch main --commit-dirty=true

echo "Deploy command sent. Check Cloudflare Pages for rollout status."
