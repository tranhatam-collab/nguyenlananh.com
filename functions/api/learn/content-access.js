import { requireDb } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse } from "../../_lib/utils.js";

// GET /api/learn/content-access?plan_code=<code> or ?content_slug=<slug>
// Checks if the user has access to a specific content/plan.
export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const planCode = url.searchParams.get("plan_code");
    const contentSlug = url.searchParams.get("content_slug");

    if (!planCode && !contentSlug) {
      return errorResponse(400, "MISSING_PARAM", "plan_code or content_slug is required.");
    }

    let row;
    if (planCode) {
      row = await db
        .prepare("SELECT * FROM content_access WHERE user_id = ? AND plan_code = ?")
        .bind(session.sub, planCode)
        .first();
    } else {
      row = await db
        .prepare("SELECT * FROM content_access WHERE user_id = ? AND content_slug = ?")
        .bind(session.sub, contentSlug)
        .first();
    }

    // Check if access is expired
    let hasAccess = !!row;
    if (row && row.expires_at) {
      const exp = new Date(row.expires_at).getTime();
      if (Number.isFinite(exp) && exp < Date.now()) {
        hasAccess = false;
      }
    }

    return json({
      ok: true,
      has_access: hasAccess,
      access: row || null,
    });
  } catch (err) {
    return errorResponse(err.status || 401, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
