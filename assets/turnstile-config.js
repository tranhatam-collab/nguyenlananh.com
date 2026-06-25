// Turnstile site key configuration
// This file is auto-included before turnstile.js on pages that need bot protection.
// After creating your Turnstile widget on dash.cloudflare.com, replace the empty string below
// with your site key (it's public and safe to expose in client-side code).
// Then set TURNSTILE_SECRET_KEY as a Cloudflare Pages secret:
//   CLOUDFLARE_ACCOUNT_ID=62d57eaa... npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name=nguyenlananh-com
window.TURNSTILE_SITE_KEY = window.TURNSTILE_SITE_KEY || "";
