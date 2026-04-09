#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Publish is locked to branch 'main'. Current branch: $CURRENT_BRANCH"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash changes before publishing."
  exit 1
fi

echo "Syncing i18n and sitemap"
node scripts/sync-i18n.mjs

if [ -n "$(git status --porcelain)" ]; then
  echo "sync-i18n produced changes. Commit them before publishing."
  exit 1
fi

echo "Pushing main"
git push origin main

echo "Deploying to Cloudflare Pages"
"$REPO_ROOT/scripts/deploy_cloudflare.sh"

echo "Publish flow completed."
