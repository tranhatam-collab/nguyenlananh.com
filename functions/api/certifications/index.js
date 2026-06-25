import { requireDb } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse } from "../../_lib/utils.js";

// GET /api/certifications
// Returns all certifications for the logged-in user.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);

    const rows = await db
      .prepare("SELECT * FROM certifications WHERE user_id = ? ORDER BY issued_at DESC")
      .bind(session.sub)
      .all();

    return json({ ok: true, certifications: rows.results || [] });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
