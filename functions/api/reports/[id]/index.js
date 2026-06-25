import { requireDb } from "../../../_lib/db.js";
import { requireSession } from "../../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../../_lib/utils.js";

// GET /api/reports/[id]
// Returns a learning report by ID (must belong to the requesting user)
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const reportId = context.params.id;

    const report = await db
      .prepare("SELECT * FROM learning_reports WHERE id = ? AND user_id = ?")
      .bind(reportId, session.sub)
      .first();

    if (!report) return errorResponse(404, "REPORT_NOT_FOUND", "Report not found.");

    return json({
      ok: true,
      report: {
        id: report.id,
        type: report.report_type,
        source_slug: report.source_slug,
        summary: report.summary,
        report_html: report.report_html,
        report_json: report.report_json ? JSON.parse(report.report_json) : null,
        recommendations: report.recommendations_json ? JSON.parse(report.recommendations_json) : null,
        generated_at: report.generated_at,
      },
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
