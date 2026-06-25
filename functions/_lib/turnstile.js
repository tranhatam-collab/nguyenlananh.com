// Server-side Turnstile token verification
// Calls Cloudflare siteverify endpoint to validate token

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare test keys — always pass verification, provide ZERO real protection.
// If these are set in production, fail CLOSED (reject all) to force admin to use real keys.
const TEST_SECRET_KEYS = new Set([
  "1x0000000000000000000000000000000AA", // always-pass test secret
  "2x0000000000000000000000000000000AA", // always-block test secret
  "3x0000000000000000000000000000000AA", // already-valid test secret
]);

/**
 * Verify a Turnstile token server-side.
 * @param {string} token - cf-turnstile-response token from frontend
 * @param {string} remoteIp - client IP (optional but recommended)
 * @param {object} env - Cloudflare env with TURNSTILE_SECRET_KEY
 * @returns {Promise<{success: boolean, error?: string, action?: string}>}
 */
export async function verifyTurnstileToken(token, remoteIp, env) {
  const secret = env?.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // If not configured, allow through (graceful degradation)
    return { success: true, skipped: true, error: "TURNSTILE_SECRET_KEY not configured" };
  }
  if (TEST_SECRET_KEYS.has(secret)) {
    // Test secret key detected — fail CLOSED to prevent fake bot protection
    console.error("[turnstile] TEST secret key in production — rejecting all tokens. Set a real secret key via Cloudflare dashboard → Turnstile.");
    return { success: false, error: "Turnstile is misconfigured (test key). Contact admin to fix." };
  }
  if (!token) {
    return { success: false, error: "Missing Turnstile token" };
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();
    return {
      success: Boolean(data.success),
      error: data["error-codes"]?.length ? data["error-codes"].join(", ") : null,
      action: data.action || null,
      challenge_ts: data.challenge_ts || null,
      hostname: data.hostname || null,
    };
  } catch (err) {
    return { success: false, error: `Turnstile verification failed: ${err.message}` };
  }
}

/**
 * Extract Turnstile token from request body or headers.
 * Frontend sends it as cf-turnstile-response in body, or as X-Turnstile-Token header.
 */
export function extractTurnstileToken(body, headers) {
  if (body && body["cf-turnstile-response"]) return body["cf-turnstile-response"];
  if (body && body.turnstile_token) return body.turnstile_token;
  if (headers && headers.get) {
    const h = headers.get("x-turnstile-token");
    if (h) return h;
  }
  return null;
}

/**
 * Get client IP from request.
 */
export function getClientIp(request) {
  const headers = request?.headers;
  if (!headers?.get) return null;
  return headers.get("cf-connecting-ip") || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

/**
 * Middleware-like helper: verify Turnstile token, return error response if invalid.
 * Returns null if verification passed (caller continues).
 * Returns Response if verification failed (caller returns this).
 */
export async function requireTurnstile(body, request, env) {
  const token = extractTurnstileToken(body, request?.headers);
  const ip = getClientIp(request);
  const result = await verifyTurnstileToken(token, ip, env);
  if (!result.success) {
    return {
      ok: false,
      code: "TURNSTILE_FAILED",
      message: result.error || "Bot verification failed. Please try again.",
      status: 403,
    };
  }
  return null;
}
