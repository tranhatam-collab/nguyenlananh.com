#!/usr/bin/env bash
set -euo pipefail

# Deploys the current site to Cloudflare Pages using Wrangler (if installed).
# Requires: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID environment variables or GitHub Secrets when running in CI.

PROJECT_NAME="nguyenlananh-com"  # Cloudflare Pages project name as shown in dashboard
BUILD_DIR="./"                   # Path to the site content to deploy; adjust if you have a build step

if ! command -v wrangler >/dev/null 2>&1; then
  echo "Wrangler not installed. Install with: npm i -g @cloudflare/wrangler"
  exit 1
fi

echo "Deploying to Cloudflare Pages project: ${PROJECT_NAME} from ${BUILD_DIR}"
wrangler pages deploy --project "$PROJECT_NAME" --path "$BUILD_DIR" --prod

echo "Deploy initiated. Check Cloudflare Pages dashboard for status."
