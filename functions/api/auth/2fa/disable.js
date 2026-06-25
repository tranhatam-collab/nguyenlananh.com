// 2FA disable — remove OTP secret + backup codes
// POST /api/auth/2fa/disable
// Body: { code } — requires current TOTP code to disable
// Requires authenticated session with 2FA verified

import { parseSessionCookie } from "../../../_lib/session.js";
import { getUserById, requireDb } from "../../../_lib/db.js";
import { base32Decode, verifyTOTP } from "../../../_lib/totp.js";
import { errorResponse, json, nowIso } from "../../../_lib/utils.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const session = await parseSessionCookie(env, request.headers.get("Cookie"));
    if (!session) return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");

    const body = await request.json().catch(() => ({}));
    const { code } = body;
    if (!code) return errorResponse(422, "CODE_REQUIRED", "Current verification code is required to disable 2FA.");

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user) return errorResponse(404, "USER_NOT_FOUND", "User not found.");
    if (!user.otp_enabled) return errorResponse(400, "2FA_NOT_ENABLED", "2FA is not enabled.");

    // Verify current code before disabling
    const secretBytes = base32Decode(user.otp_secret);
    const valid = await verifyTOTP(secretBytes, code);
    if (!valid) return errorResponse(422, "CODE_INVALID", "Invalid verification code.");

    // Disable 2FA
    const now = nowIso();
    await db
      .prepare(
        "UPDATE users SET otp_secret = NULL, otp_enabled = 0, otp_backup_codes = NULL, otp_enabled_at = NULL, updated_at = ? WHERE id = ?"
      )
      .bind(now, session.sub)
      .run();

    return json({
      ok: true,
      message: "2FA disabled successfully.",
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "2FA_DISABLE_FAILED", error.message || "Unable to disable 2FA.");
  }
}
