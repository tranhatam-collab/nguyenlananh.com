import { json, errorResponse, randomId, nowIso, getCookieValue } from "../../../_lib/utils.js";
import { getDb } from "../../../_lib/db.js";

// POST /api/creators/submissions
// Requires authenticated member who is an approved creator.
export async function onRequestPost(context) {
  try {
    const session = await getSession(context);
    if (!session) return errorResponse(401, "UNAUTHORIZED", "Bạn cần đăng nhập.");

    const db = getDb(context.env);
    const creator = await db
      .prepare("SELECT id FROM creator_profiles WHERE user_id = ? AND status = 'approved'")
      .bind(session.user_id)
      .first();
    if (!creator) {
      return errorResponse(403, "NOT_CREATOR", "Bạn chưa là creator được duyệt.");
    }

    const body = await context.request.json();
    const type = String(body.type || "").trim();
    const title = String(body.title || "").trim();
    const contentJson = JSON.stringify(body.content || {});
    const attachments = JSON.stringify(body.attachments || []);

    if (!type || !title) {
      return errorResponse(400, "INVALID", "Thiếu loại hoặc tiêu đề.");
    }

    const id = randomId("csub");
    await db
      .prepare(
        `INSERT INTO creator_submissions (id, creator_id, type, title, content_json, attachments, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
      )
      .bind(id, creator.id, type, title, contentJson, attachments, nowIso(), nowIso())
      .run();

    return json({ ok: true, id });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không lưu được submission.");
  }
}

async function getSession(context) {
  const token = context.request.headers.get("Authorization")?.replace("Bearer ", "") ||
                getCookieValue(context.request, "nla_session");
  if (!token) return null;
  try {
    const db = getDb(context.env);
    const session = await db
      .prepare("SELECT user_id, email FROM sessions WHERE token = ? AND expires_at > datetime('now')")
      .bind(token)
      .first();
    return session || null;
  } catch {
    return null;
  }
}
