// 2FA status — check if 2FA is enabled for current user
// GET /api/auth/2fa/status

import { parseSessionCookie } from "../../../_lib/session.js";
import { getUserById, requireDb } from "../../../_lib/db.js";
import { errorResponse, json } from "../../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const session = await parseSessionCookie(env, request.headers.get("Cookie"));
    if (!session) return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user) return errorResponse(404, "USER_NOT_FOUND", "User not found.");

    return json({
      ok: true,
      enabled: Boolean(user.otp_enabled),
      enabled_at: user.otp_enabled_at || null,
      has_backup_codes: Boolean(user.otp_backup_codes),
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "2FA_STATUS_FAILED", error.message || "Unable to check 2FA status.");
  }
}
