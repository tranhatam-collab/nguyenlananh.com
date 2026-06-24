import { requireAdminPermission } from "../../../_lib/admin_auth.js";
import { listSiteEvents, siteEventsSummary } from "../../../_lib/site_logger.js";
import { json, errorResponse } from "../../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "events.view");
    const url = new URL(context.request.url);
    const events = await listSiteEvents(db, {
      limit: url.searchParams.get("limit") || 100,
      level: url.searchParams.get("level"),
      category: url.searchParams.get("category"),
      action: url.searchParams.get("action"),
      path: url.searchParams.get("path"),
      status: url.searchParams.get("status"),
      userEmail: url.searchParams.get("user_email"),
      adminEmail: url.searchParams.get("admin_email"),
      requestId: url.searchParams.get("request_id"),
      since: url.searchParams.get("since"),
      until: url.searchParams.get("until"),
    });
    return json({ ok: true, count: events.length, events });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "EVENTS_LIST_FAILED", error.message || "Unable to list events.");
  }
}
