// 2FA setup — generate secret + QR code URI
// POST /api/auth/2fa/setup
// Requires authenticated session

import { parseSessionCookie } from "../../../_lib/session.js";
import { getUserById, requireDb } from "../../../_lib/db.js";
import { generateSecretBase32, buildOtpAuthUri } from "../../../_lib/totp.js";
import { errorResponse, json } from "../../../_lib/utils.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const session = await parseSessionCookie(env, request.headers.get("Cookie"));
    if (!session) return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user || !user.active) return errorResponse(403, "MEMBERSHIP_INACTIVE", "Membership is inactive.");

    if (user.otp_enabled) {
      return errorResponse(409, "2FA_ALREADY_ENABLED", "2FA is already enabled. Disable first to reconfigure.");
    }

    // Generate new secret (not yet saved — saved on enable after verification)
    const secretBase32 = generateSecretBase32(20);
    const issuer = "Nguyen Lan Anh";
    const otpAuthUri = buildOtpAuthUri({
      issuer,
      account: user.email,
      secretBase32,
    });

    return json({
      ok: true,
      secret: secretBase32,
      otpauth_uri: otpAuthUri,
      qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUri)}`,
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "2FA_SETUP_FAILED", error.message || "Unable to setup 2FA.");
  }
}
