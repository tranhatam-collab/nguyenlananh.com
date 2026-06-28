// Turnstile site key configuration.
// Production should serve this path through functions/assets/turnstile-config.js
// so the public site key comes from Cloudflare env TURNSTILE_SITE_KEY.
window.TURNSTILE_SITE_KEY = window.TURNSTILE_SITE_KEY || "";
window.TURNSTILE_SITE_KEY_CONFIGURED = Boolean(window.TURNSTILE_SITE_KEY);
