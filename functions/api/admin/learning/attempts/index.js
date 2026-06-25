import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../../_lib/utils.js";

// GET /api/admin/learning/attempts
// Returns recent assessment/exam attempts.
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "learning.view");
    const url = new URL(context.request.url);
    const type = url.searchParams.get("type") || "assessment";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);

    let rows;
    if (type === "exam") {
      rows = await db
        .prepare(`SELECT ea.*, u.email as user_email FROM exam_attempts ea
          LEFT JOIN users u ON ea.user_id = u.id
          ORDER BY ea.created_at DESC LIMIT ?`)
        .bind(limit)
        .all();
    } else {
      rows = await db
        .prepare(`SELECT aa.*, u.email as user_email FROM assessment_attempts aa
          LEFT JOIN users u ON aa.user_id = u.id
          ORDER BY aa.created_at DESC LIMIT ?`)
        .bind(limit)
        .all();
    }

    return json({ ok: true, attempts: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load attempts.");
  }
}
