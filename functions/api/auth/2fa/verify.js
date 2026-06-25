// 2FA verify — verify TOTP code during login flow
// POST /api/auth/2fa/verify
// Body: { code, session_token } or uses session cookie
// Used as second step after Google OAuth if 2FA is enabled

import { parseSessionCookie } from "../../../_lib/session.js";
import { getUserById, requireDb } from "../../../_lib/db.js";
import { base32Decode, verifyTOTP, verifyBackupCode } from "../../../_lib/totp.js";
import { errorResponse, json, nowIso } from "../../../_lib/utils.js";
import { createSessionCookie } from "../../../_lib/session.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));
    const { code, backup_code } = body;

    // Session may be a pre-session (pending 2FA) or full session
    const session = await parseSessionCookie(env, request.headers.get("Cookie"));
    if (!session) return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user) return errorResponse(404, "USER_NOT_FOUND", "User not found.");
    if (!user.otp_enabled || !user.otp_secret) {
      return errorResponse(400, "2FA_NOT_ENABLED", "2FA is not enabled for this account.");
    }

    let verified = false;
    let usedBackupCode = false;

    if (code) {
      const secretBytes = base32Decode(user.otp_secret);
      verified = await verifyTOTP(secretBytes, code);
    } else if (backup_code) {
      const storedHashes = JSON.parse(user.otp_backup_codes || "[]");
      verified = await verifyBackupCode(backup_code, storedHashes);
      usedBackupCode = verified;
      if (verified) {
        // Remove used backup code
        const hash = await hashBackupCodeInput(backup_code);
        const remaining = storedHashes.filter(h => h !== hash);
        await db
          .prepare("UPDATE users SET otp_backup_codes = ?, updated_at = ? WHERE id = ?")
          .bind(JSON.stringify(remaining), nowIso(), session.sub)
          .run();
      }
    }

    if (!verified) {
      return errorResponse(422, "CODE_INVALID", "Invalid verification code. Please try again.");
    }

    // Issue full session (mark as 2fa_verified)
    const cookie = await createSessionCookie(env, {
      sub: session.sub,
      email: user.email,
      twofa_verified: true,
    });

    return json({
      ok: true,
      message: usedBackupCode ? "2FA verified via backup code." : "2FA verified.",
      used_backup_code: usedBackupCode,
    }, {
      headers: { "Set-Cookie": cookie },
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "2FA_VERIFY_FAILED", error.message || "Unable to verify 2FA.");
  }
}

async function hashBackupCodeInput(code) {
  const data = new TextEncoder().encode(code.replace(/\s/g, "").toUpperCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}
