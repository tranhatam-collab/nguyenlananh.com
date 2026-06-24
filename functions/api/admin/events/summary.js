import { requireAdminPermission } from "../../../_lib/admin_auth.js";
import { siteEventsSummary } from "../../../_lib/site_logger.js";
import { json, errorResponse } from "../../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "events.view");
    const summary = await siteEventsSummary(db);
    return json({ ok: true, summary });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "EVENTS_SUMMARY_FAILED", error.message || "Unable to get events summary.");
  }
}
