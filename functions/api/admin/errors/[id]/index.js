import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { resolveSiteError } from "../../../../_lib/site_logger.js";
import { json, errorResponse, readJson } from "../../../../_lib/utils.js";

export async function onRequestPatch(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "errors.resolve");
    const id = String(context.params.id || "").trim();
    if (!id) return errorResponse(422, "ID_REQUIRED", "Error id is required.");
    await resolveSiteError(db, id, session.email);
    return json({ ok: true, resolved: true });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ERROR_RESOLVE_FAILED", error.message || "Unable to resolve error.");
  }
}
