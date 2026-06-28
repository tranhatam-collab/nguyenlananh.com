import { getUserById, requireDb } from "../../_lib/db.js";
import { parseSessionCookie } from "../../_lib/session.js";
import { errorResponse, json, nowIso } from "../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const session = await parseSessionCookie(env, cookieHeader);
    if (!session) {
      return errorResponse(401, "SESSION_INVALID", "Session is missing or expired.");
    }

    const db = requireDb(env);
    const user = await getUserById(db, session.sub);
    if (!user || !user.active) {
      return errorResponse(403, "MEMBERSHIP_INACTIVE", "Membership is inactive.");
    }

    let contentAccess = [];
    try {
      const rows = await db
        .prepare(
          `SELECT plan_code, content_slug, expires_at
             FROM content_access
            WHERE user_id = ?
              AND (expires_at IS NULL OR expires_at > ?)`
        )
        .bind(session.sub, nowIso())
        .all();
      contentAccess = Array.isArray(rows?.results)
        ? rows.results.map((row) => ({
            planCode: row.plan_code,
            contentSlug: row.content_slug,
            expiresAt: row.expires_at || null
          }))
        : [];
    } catch (_error) {
      contentAccess = [];
    }

    return json({
      ok: true,
      session: {
        id: session.sub,
        email: user.email,
        membershipType: user.membership_type,
        membershipLabel: user.membership_label,
        preferredLanguage: user.preferred_language,
        startedAt: new Date(session.iat * 1000).toISOString(),
        expiresAt: user.expires_at,
        contentAccess
      }
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "SESSION_CHECK_FAILED", error.message || "Unable to verify session.");
  }
}
