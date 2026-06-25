import { requireDb } from "../../../../_lib/db.js";
import { requireSession } from "../../../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../../../_lib/utils.js";

// GET /api/exams/[slug]/attempt
// Returns exam definition + questions (without correct answers)
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const slug = context.params.slug;

    const exam = await db
      .prepare("SELECT * FROM exam_definitions WHERE slug = ?")
      .bind(slug)
      .first();
    if (!exam) return errorResponse(404, "EXAM_NOT_FOUND", `Exam '${slug}' not found.`);

    // Get questions from linked assessment if exam reuses assessment questions
    const questions = await db
      .prepare("SELECT id, question_index, question_text, question_type, options_json, category, weight FROM assessment_questions WHERE assessment_slug = ? ORDER BY question_index ASC")
      .bind(slug)
      .all();

    const cleanQuestions = (questions.results || []).map(q => ({
      ...q,
      options: q.options_json ? JSON.parse(q.options_json) : null,
      options_json: undefined,
    }));

    // Get user's previous exam attempts
    const attempts = await db
      .prepare("SELECT id, score, max_score, percentage, passed, submitted_at FROM exam_attempts WHERE user_id = ? AND exam_slug = ? ORDER BY created_at DESC LIMIT 5")
      .bind(session.sub, slug)
      .all();

    return json({
      ok: true,
      exam: {
        slug: exam.slug,
        title: exam.title,
        program_slug: exam.program_slug,
        exam_type: exam.exam_type,
        question_count: exam.question_count,
        passing_score: exam.passing_score,
        duration_minutes: exam.duration_minutes,
      },
      questions: cleanQuestions,
      previous_attempts: attempts.results || [],
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}

// POST /api/exams/[slug]/attempt
// Body: { answers: { question_id: selected_answer, ... } }
export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const slug = context.params.slug;
    const body = await context.request.json();
    const { answers } = body;

    if (!answers) return errorResponse(400, "MISSING_ANSWERS", "answers is required.");

    const exam = await db
      .prepare("SELECT * FROM exam_definitions WHERE slug = ?")
      .bind(slug)
      .first();
    if (!exam) return errorResponse(404, "EXAM_NOT_FOUND", `Exam '${slug}' not found.`);

    const questions = await db
      .prepare("SELECT * FROM assessment_questions WHERE assessment_slug = ? ORDER BY question_index ASC")
      .bind(slug)
      .all();

    if (!questions.results || questions.results.length === 0) {
      return errorResponse(404, "NO_QUESTIONS", "This exam has no questions configured.");
    }

    let score = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    for (const q of questions.results) {
      const userAnswer = answers[q.id] || answers[q.question_index] || null;
      const weight = q.weight || 1.0;
      maxScore += weight;
      const isCorrect = userAnswer && q.correct_answer && String(userAnswer).trim() === String(q.correct_answer).trim();
      if (isCorrect) score += weight;
      gradedAnswers.push({
        question_id: q.id,
        question_index: q.question_index,
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: !!isCorrect,
        explanation: q.explanation || null,
      });
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (exam.passing_score || 70);
    const now = nowIso();
    const attemptId = randomId("exam");

    await db
      .prepare(
        `INSERT INTO exam_attempts (id, user_id, exam_slug, status, score, max_score, percentage, passed, answers_json, started_at, submitted_at, created_at)
         VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        attemptId,
        session.sub,
        slug,
        score,
        maxScore,
        percentage,
        passed ? 1 : 0,
        JSON.stringify(answers),
        now,
        now,
        now
      )
      .run();

    return json({
      ok: true,
      attempt_id: attemptId,
      score,
      max_score: maxScore,
      percentage,
      passed,
      passing_score: exam.passing_score || 70,
      graded: gradedAnswers,
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
