import { requireDb } from "../../../../_lib/db.js";
import { requireSession } from "../../../../_lib/session.js";
import { json, errorResponse } from "../../../../_lib/utils.js";

// GET /api/assessments/[slug]/score?attempt_id=<id>
// Returns the scored result for a specific attempt.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const slug = context.params.slug;
    const url = new URL(context.request.url);
    const attemptId = url.searchParams.get("attempt_id");

    if (!attemptId) return errorResponse(400, "MISSING_ATTEMPT", "attempt_id is required.");

    const attempt = await db
      .prepare("SELECT * FROM assessment_attempts WHERE id = ? AND user_id = ? AND assessment_slug = ?")
      .bind(attemptId, session.sub, slug)
      .first();

    if (!attempt) return errorResponse(404, "ATTEMPT_NOT_FOUND", "Attempt not found.");

    return json({
      ok: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        max_score: attempt.max_score,
        percentage: attempt.percentage,
        passed: !!attempt.passed,
        result: attempt.result_json ? JSON.parse(attempt.result_json) : null,
        submitted_at: attempt.submitted_at,
      },
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
