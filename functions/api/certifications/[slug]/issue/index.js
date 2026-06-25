import { requireDb } from "../../../../_lib/db.js";
import { requireSession } from "../../../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../../../_lib/utils.js";

// POST /api/certifications/[slug]/issue
// Issues a certificate if the user has passed the exam + submitted practice evidence.
// Body: { exam_attempt_id, practice_submission_ids?: [] }
export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const slug = context.params.slug;
    const body = await context.request.json();
    const { exam_attempt_id } = body;

    if (!exam_attempt_id) return errorResponse(400, "MISSING_EXAM_ATTEMPT", "exam_attempt_id is required.");

    // Check exam passed
    const examAttempt = await db
      .prepare("SELECT * FROM exam_attempts WHERE id = ? AND user_id = ? AND exam_slug = ?")
      .bind(exam_attempt_id, session.sub, slug)
      .first();

    if (!examAttempt) return errorResponse(404, "EXAM_ATTEMPT_NOT_FOUND", "Exam attempt not found.");
    if (!examAttempt.passed) return errorResponse(403, "EXAM_NOT_PASSED", "Cannot issue certificate — exam not passed.");

    // Check if cert already issued
    const existing = await db
      .prepare("SELECT id, cert_number FROM certifications WHERE user_id = ? AND cert_slug = ? AND status = 'issued'")
      .bind(session.sub, slug)
      .first();

    if (existing) {
      return json({ ok: true, already_issued: true, cert_id: existing.id, cert_number: existing.cert_number });
    }

    // Check practice submissions (at least 1 for cert programs)
    const practiceCount = await db
      .prepare("SELECT COUNT(*) as cnt FROM practice_submissions WHERE user_id = ? AND lesson_slug = ? AND status = 'submitted'")
      .bind(session.sub, slug)
      .first();

    if (!practiceCount || practiceCount.cnt === 0) {
      return errorResponse(403, "NO_PRACTICE_EVIDENCE", "Cannot issue certificate — no practice evidence submitted.");
    }

    // Generate cert number
    const now = nowIso();
    const year = now.split("-")[0];
    const certNumber = `NLA-${slug.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${year}-${randomId("").slice(-6).toUpperCase()}`;

    const certId = randomId("cert");

    await db
      .prepare(
        `INSERT INTO certifications (id, user_id, cert_slug, cert_number, title, status, issued_at, metadata_json, created_at)
         VALUES (?, ?, ?, ?, ?, 'issued', ?, ?, ?)`
      )
      .bind(
        certId,
        session.sub,
        slug,
        certNumber,
        slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        now,
        JSON.stringify({ exam_attempt_id, practice_count: practiceCount.cnt }),
        now
      )
      .run();

    // Add auto-review record
    await db
      .prepare(
        `INSERT INTO certification_reviews (id, certification_id, review_type, decision, notes, evidence_json, reviewed_at, created_at)
         VALUES (?, ?, 'auto', 'approved', 'Auto-issued: exam passed + practice evidence submitted', ?, ?, ?)`
      )
      .bind(
        randomId("crev"),
        certId,
        JSON.stringify({ exam_attempt_id, exam_score: examAttempt.percentage, practice_count: practiceCount.cnt }),
        now,
        now
      )
      .run();

    return json({
      ok: true,
      cert_id: certId,
      cert_number: certNumber,
      issued_at: now,
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
