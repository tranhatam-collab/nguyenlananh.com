#!/usr/bin/env bash
set -euo pipefail

# Auto-commit any changes and trigger Cloudflare deploy when changes exist.
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT=$(pwd)
fi
cd "$REPO_ROOT"

STATUS=$(git status --porcelain)
if [[ -z "$STATUS" ]]; then
  echo "No changes to commit."
  exit 0
fi

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
git add -A
git commit -m "auto: update content/assets [${TIMESTAMP}]"
git push origin main

echo "Change committed and pushed. Triggering Cloudflare deploy..."
if [ -x ./scripts/deploy_cloudflare.sh ]; then
  ./scripts/deploy_cloudflare.sh
elif [ -x ./nguyenlananh.com/scripts/deploy_cloudflare.sh ]; then
  ./nguyenlananh.com/scripts/deploy_cloudflare.sh
else
  echo "deploy script not found or not executable. Please run manually: ./scripts/deploy_cloudflare.sh"
fi
