import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse, nowIso } from "../../../../_lib/utils.js";

// GET /api/admin/learning/practice
// Returns practice submissions (optionally filtered by status).
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "learning.view");
    const url = new URL(context.request.url);
    const status = url.searchParams.get("status") || "submitted";
    const limitParam = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.min(Number.isNaN(limitParam) ? 50 : limitParam, 200);

    const rows = await db
      .prepare(`SELECT ps.*, u.email as user_email FROM practice_submissions ps
        LEFT JOIN users u ON ps.user_id = u.id
        WHERE ps.status = ?
        ORDER BY ps.submitted_at DESC LIMIT ?`)
      .bind(status, limit)
      .all();

    return json({ ok: true, submissions: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load practice submissions.");
  }
}

// POST /api/admin/learning/practice
// Review a practice submission (score + notes).
// Body: { submission_id, review_score, review_notes }
export async function onRequestPost(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "learning.manage");
    const body = await context.request.json();
    const { submission_id, review_score, review_notes } = body;

    if (!submission_id) return errorResponse(400, "MISSING_ID", "submission_id is required.");

    await db
      .prepare("UPDATE practice_submissions SET status = 'reviewed', review_score = ?, review_notes = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?")
      .bind(review_score || null, review_notes || null, session.email, nowIso(), submission_id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to review submission.");
  }
}
