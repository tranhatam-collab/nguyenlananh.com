import { getMemberProgress, saveMemberProgress } from "../../_lib/db.js";
import { requireSession } from "../../_lib/session.js";
import { json, errorResponse } from "../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const session = await requireSession(context);
    const progress = await getMemberProgress(context.env.DB, session.sub);
    return json({ ok: true, progress: progress || {} });
  } catch (err) {
    const status = err.status || 401;
    return errorResponse(status, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}

export async function onRequestPost(context) {
  try {
    const session = await requireSession(context);
    const body = await context.request.json();
    const progress = body.progress || body || {};
    await saveMemberProgress(context.env.DB, session.sub, progress);
    return json({ ok: true });
  } catch (err) {
    const status = err.status || 401;
    return errorResponse(status, err.code || "UNAUTHORIZED", err.message || "Session required.");
  }
}
