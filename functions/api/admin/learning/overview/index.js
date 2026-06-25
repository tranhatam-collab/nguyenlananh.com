import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../../_lib/utils.js";

// GET /api/admin/learning/overview
// Returns overview stats for the learning platform.
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "learning.view");

    const [lessonProgress, assessmentAttempts, examAttempts, practiceSubs, certs, checkins] = await Promise.all([
      db.prepare("SELECT status, COUNT(*) as cnt FROM lesson_progress GROUP BY status").all(),
      db.prepare("SELECT passed, COUNT(*) as cnt FROM assessment_attempts GROUP BY passed").all(),
      db.prepare("SELECT passed, COUNT(*) as cnt FROM exam_attempts GROUP BY passed").all(),
      db.prepare("SELECT status, COUNT(*) as cnt FROM practice_submissions GROUP BY status").all(),
      db.prepare("SELECT status, COUNT(*) as cnt FROM certifications GROUP BY status").all(),
      db.prepare("SELECT COUNT(*) as total FROM checkins").first(),
    ]);

    return json({
      ok: true,
      overview: {
        lesson_progress: lessonProgress.results || [],
        assessment_attempts: assessmentAttempts.results || [],
        exam_attempts: examAttempts.results || [],
        practice_submissions: practiceSubs.results || [],
        certifications: certs.results || [],
        total_checkins: checkins?.total || 0,
      },
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load learning overview.");
  }
}
