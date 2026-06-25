import { json, errorResponse } from "../../../_lib/utils.js";
import { getDb } from "../../../_lib/db.js";

// GET /api/creators/profiles
// Public endpoint listing approved creator profiles.
export async function onRequestGet(context) {
  try {
    const db = getDb(context.env);
    const { results } = await db
      .prepare("SELECT slug, name, bio, avatar_url, specialties, created_at FROM creator_profiles WHERE status = 'approved' ORDER BY created_at DESC")
      .all();

    return json({ ok: true, creators: results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không tải được danh sách creator.");
  }
}
