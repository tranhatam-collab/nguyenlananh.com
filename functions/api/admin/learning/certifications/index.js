import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../../_lib/utils.js";

// GET /api/admin/learning/certifications
// Returns all issued certifications.
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "learning.view");
    const url = new URL(context.request.url);
    const limitParam = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.min(Number.isNaN(limitParam) ? 50 : limitParam, 200);

    const rows = await db
      .prepare(`SELECT c.*, u.email as user_email FROM certifications c
        LEFT JOIN users u ON c.user_id = u.id
        ORDER BY c.issued_at DESC LIMIT ?`)
      .bind(limit)
      .all();

    return json({ ok: true, certifications: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load certifications.");
  }
}
