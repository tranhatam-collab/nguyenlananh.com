import { requireDb } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../_lib/utils.js";

// GET /api/learn/submit-practice?lesson_slug=<slug>
// Returns all practice submissions for a user in a lesson.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const lesson_slug = url.searchParams.get("lesson_slug");

    if (!lesson_slug) return errorResponse(400, "MISSING_LESSON", "lesson_slug is required.");

    const rows = await db
      .prepare("SELECT * FROM practice_submissions WHERE user_id = ? AND lesson_slug = ? ORDER BY created_at DESC")
      .bind(session.sub, lesson_slug)
      .all();
    return json({ ok: true, submissions: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}

// POST /api/learn/submit-practice
// Body: { lesson_slug, exercise_slug?, submission_type, content, evidence_url? }
export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const body = await context.request.json();
    const { lesson_slug, exercise_slug, submission_type, content, evidence_url } = body;

    if (!lesson_slug) return errorResponse(400, "MISSING_LESSON", "lesson_slug is required.");
    if (!content) return errorResponse(400, "MISSING_CONTENT", "content is required.");

    const now = nowIso();
    const id = randomId("psub");

    await db
      .prepare(
        `INSERT INTO practice_submissions (id, user_id, lesson_slug, exercise_slug, submission_type, content, evidence_url, status, submitted_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`
      )
      .bind(
        id,
        session.sub,
        lesson_slug,
        exercise_slug || null,
        submission_type || "text",
        content,
        evidence_url || null,
        now,
        now
      )
      .run();

    // Mark lesson_progress practice_submitted = 1
    const existing = await db
      .prepare("SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_slug = ?")
      .bind(session.sub, lesson_slug)
      .first();

    if (existing) {
      await db
        .prepare("UPDATE lesson_progress SET practice_submitted = 1, updated_at = ? WHERE id = ?")
        .bind(now, existing.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO lesson_progress (id, user_id, lesson_slug, status, practice_submitted, created_at, updated_at)
           VALUES (?, ?, ?, 'in_progress', 1, ?, ?)`
        )
        .bind(randomId("lp"), session.sub, lesson_slug, now, now)
        .run();
    }

    return json({ ok: true, submission_id: id });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
