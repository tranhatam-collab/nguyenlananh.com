import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse, nowIso } from "../../../../_lib/utils.js";

// GET /api/admin/creators/applications
// PATCH /api/admin/creators/applications
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "members.manage");
    const { results } = await db
      .prepare("SELECT * FROM creator_applications ORDER BY submitted_at DESC")
      .all();
    return json({ ok: true, applications: results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không tải được đơn.");
  }
}

export async function onRequestPatch(context) {
  try {
    const { db } = await requireAdminPermission(context, "members.manage");
    const body = await context.request.json();
    const { id, status, review_note, reviewer_name } = body;
    if (!id || !status) return errorResponse(400, "INVALID", "Thiếu id hoặc status.");

    await db
      .prepare("UPDATE creator_applications SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?")
      .bind(status, review_note || "", reviewer_name || "", nowIso(), id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không cập nhật được đơn.");
  }
}
