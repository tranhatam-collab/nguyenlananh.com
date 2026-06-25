import { requireDb } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse, nowIso, randomId } from "../../_lib/utils.js";

// GET /api/learn/checkin?program_slug=<slug>
// Returns all checkins for a user in a program.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const program_slug = url.searchParams.get("program_slug");

    if (!program_slug) return errorResponse(400, "MISSING_PROGRAM", "program_slug is required.");

    const rows = await db
      .prepare("SELECT * FROM checkins WHERE user_id = ? AND program_slug = ? ORDER BY day_number ASC")
      .bind(session.sub, program_slug)
      .all();
    return json({ ok: true, checkins: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}

// POST /api/learn/checkin
// Body: { program_slug, day_number, mood?, energy?, notes?, completed_actions? }
export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const body = await context.request.json();
    const { program_slug, day_number, mood, energy, notes, completed_actions } = body;

    if (!program_slug) return errorResponse(400, "MISSING_PROGRAM", "program_slug is required.");
    if (!day_number || day_number < 1) return errorResponse(400, "INVALID_DAY", "day_number must be >= 1.");

    const now = nowIso();
    const today = now.split("T")[0];

    // Upsert (unique constraint on user_id + program_slug + day_number)
    const existing = await db
      .prepare("SELECT id FROM checkins WHERE user_id = ? AND program_slug = ? AND day_number = ?")
      .bind(session.sub, program_slug, day_number)
      .first();

    if (existing) {
      await db
        .prepare(
          `UPDATE checkins SET
            mood = COALESCE(?, mood),
            energy = COALESCE(?, energy),
            notes = COALESCE(?, notes),
            completed_actions_json = COALESCE(?, completed_actions_json),
            checkin_date = ?,
            created_at = ?
          WHERE id = ?`
        )
        .bind(
          mood ?? null,
          energy ?? null,
          notes ?? null,
          completed_actions ? JSON.stringify(completed_actions) : null,
          today,
          now,
          existing.id
        )
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO checkins (id, user_id, program_slug, day_number, mood, energy, notes, completed_actions_json, checkin_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          randomId("chk"),
          session.sub,
          program_slug,
          day_number,
          mood ?? null,
          energy ?? null,
          notes ?? null,
          completed_actions ? JSON.stringify(completed_actions) : null,
          today,
          now
        )
        .run();
    }

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
