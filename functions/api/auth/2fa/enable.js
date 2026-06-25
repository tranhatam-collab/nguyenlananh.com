// 2FA enable — verify first TOTP code, save secret + backup codes
// POST /api/auth/2fa/enable
// Body: { secret, code }
// Requires authenticated session

import { parseSessionCookie } from "../../../_lib/session.js";
import { getUserById, requireDb } from "../../../_lib/db.js";
import { base32Decode, verifyTOTP, generateBackupCodes, hashBackupCodes } from "../../../_lib/totp.js";
import { errorResponse, json, nowIso } from "../../../_lib/utils.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const session = await parseSessionCookie(env, request.headers.get("Cookie"));
    if (!session) return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");

    const body = await request.json().catch(() => ({}));
    const { secret, code } = body;
    if (!secret) return errorResponse(422, "SECRET_REQUIRED", "Secret is required.");
    if (!code) return errorResponse(422, "CODE_REQUIRED", "Verification code is required.");

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user || !user.active) return errorResponse(403, "MEMBERSHIP_INACTIVE", "Membership is inactive.");
    if (user.otp_enabled) return errorResponse(409, "2FA_ALREADY_ENABLED", "2FA is already enabled.");

    // Verify the TOTP code against the provided secret
    const secretBytes = base32Decode(secret);
    const valid = await verifyTOTP(secretBytes, code);
    if (!valid) return errorResponse(422, "CODE_INVALID", "Invalid verification code. Please try again.");

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedCodes = await hashBackupCodes(backupCodes);

    // Save to DB
    const now = nowIso();
    await db
      .prepare(
        "UPDATE users SET otp_secret = ?, otp_enabled = 1, otp_backup_codes = ?, otp_enabled_at = ?, updated_at = ? WHERE id = ?"
      )
      .bind(secret, JSON.stringify(hashedCodes), now, now, session.sub)
      .run();

    return json({
      ok: true,
      message: "2FA enabled successfully.",
      backup_codes: backupCodes,
      warning: "Save these backup codes in a safe place. Each can be used once.",
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "2FA_ENABLE_FAILED", error.message || "Unable to enable 2FA.");
  }
}
