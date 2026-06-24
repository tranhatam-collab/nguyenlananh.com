import { requireAdminPermission } from "../../../_lib/admin_auth.js";
import { listSiteErrors, resolveSiteError } from "../../../_lib/site_logger.js";
import { json, errorResponse } from "../../../_lib/utils.js";

export async function onRequestGet(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "errors.view");
    const url = new URL(context.request.url);
    const errors = await listSiteErrors(db, {
      limit: url.searchParams.get("limit") || 100,
      status: url.searchParams.get("status"),
      code: url.searchParams.get("code"),
      resolved: url.searchParams.get("resolved"),
      since: url.searchParams.get("since"),
      until: url.searchParams.get("until"),
    });
    return json({ ok: true, count: errors.length, errors });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ERRORS_LIST_FAILED", error.message || "Unable to list errors.");
  }
}
