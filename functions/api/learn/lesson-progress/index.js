import { requireDb } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../_lib/utils.js";

// GET /api/learn/lesson-progress?slug=<lesson_slug>
// Returns progress for a specific lesson, or all lesson progress for the user.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const row = await db
        .prepare("SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_slug = ?")
        .bind(session.sub, slug)
        .first();
      return json({ ok: true, progress: row || null });
    }

    const rows = await db
      .prepare("SELECT * FROM lesson_progress WHERE user_id = ? ORDER BY updated_at DESC")
      .bind(session.sub)
      .all();
    return json({ ok: true, progress: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}

// POST /api/learn/lesson-progress
// Body: { lesson_slug, status, self_assessment_score?, self_assessment_answers?, practice_submitted? }
export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const body = await context.request.json();
    const { lesson_slug, status, self_assessment_score, self_assessment_answers, practice_submitted } = body;

    if (!lesson_slug) return errorResponse(400, "MISSING_SLUG", "lesson_slug is required.");
    if (!status) return errorResponse(400, "MISSING_STATUS", "status is required.");

    const now = nowIso();
    const completedAt = status === "completed" ? now : null;

    // Upsert
    const existing = await db
      .prepare("SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_slug = ?")
      .bind(session.sub, lesson_slug)
      .first();

    if (existing) {
      await db
        .prepare(
          `UPDATE lesson_progress SET
            status = ?,
            self_assessment_score = COALESCE(?, self_assessment_score),
            self_assessment_answers_json = COALESCE(?, self_assessment_answers_json),
            practice_submitted = COALESCE(?, practice_submitted),
            completed_at = COALESCE(?, completed_at),
            updated_at = ?
          WHERE id = ?`
        )
        .bind(
          status,
          self_assessment_score ?? null,
          self_assessment_answers ? JSON.stringify(self_assessment_answers) : null,
          practice_submitted ?? null,
          completedAt,
          now,
          existing.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO lesson_progress (id, user_id, lesson_slug, status, self_assessment_score, self_assessment_answers_json, practice_submitted, completed_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          randomId("lp"),
          session.sub,
          lesson_slug,
          status,
          self_assessment_score ?? null,
          self_assessment_answers ? JSON.stringify(self_assessment_answers) : null,
          practice_submitted ? 1 : 0,
          completedAt,
          now,
          now
        )
        .run();
    }

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
