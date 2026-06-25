import { json, errorResponse, getCookieValue } from "../../../_lib/utils.js";
import { requireDb } from "../../../_lib/db.js";

// GET /api/members/me
// Returns current member info and creator status.
export async function onRequestGet(context) {
  try {
    const token = context.request.headers.get("Authorization")?.replace("Bearer ", "") ||
                  getCookieValue(context.request, "nla_session");
    if (!token) return errorResponse(401, "UNAUTHORIZED", "Bạn cần đăng nhập.");

    const db = requireDb(context.env);
    const session = await db
      .prepare("SELECT user_id, email FROM sessions WHERE token = ? AND expires_at > datetime('now')")
      .bind(token)
      .first();
    if (!session) return errorResponse(401, "UNAUTHORIZED", "Phiên hết hạn.");

    const user = await db
      .prepare("SELECT id, email, name, membership_type, membership_label FROM users WHERE id = ?")
      .bind(session.user_id)
      .first();
    if (!user) return errorResponse(404, "NOT_FOUND", "Không tìm thấy user.");

    const creator = await db
      .prepare("SELECT id, status FROM creator_profiles WHERE user_id = ?")
      .bind(user.id)
      .first();

    return json({
      ok: true,
      user: {
        ...user,
        is_creator: !!creator && creator.status === "approved"
      }
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không tải được thông tin.");
  }
}
