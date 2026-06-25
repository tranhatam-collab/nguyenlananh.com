import { json, errorResponse } from "../../../_lib/utils.js";
import { requireDb } from "../../../_lib/db.js";

// GET /api/creators/profiles/:slug
// Public endpoint for a single approved creator profile.
export async function onRequestGet(context) {
  try {
    const { slug } = context.params;
    const db = requireDb(context.env);
    const profile = await db
      .prepare("SELECT slug, name, bio, avatar_url, website, social_links, specialties, created_at FROM creator_profiles WHERE slug = ? AND status = 'approved'")
      .bind(slug)
      .first();

    if (!profile) {
      return errorResponse(404, "NOT_FOUND", "Không tìm thấy creator.");
    }

    const { results } = await db
      .prepare("SELECT id, type, title, slug, status, published_at FROM creator_submissions WHERE creator_id = (SELECT id FROM creator_profiles WHERE slug = ?) AND status = 'published' ORDER BY published_at DESC")
      .bind(slug)
      .all();

    return json({ ok: true, profile, submissions: results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không tải được creator.");
  }
}
