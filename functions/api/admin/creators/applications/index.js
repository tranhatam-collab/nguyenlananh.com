import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse, nowIso } from "../../../../_lib/utils.js";
import { TEMPLATE_IDS } from "../../../../_lib/constants.js";
import { sendTemplateEmailDirect } from "../../../../_lib/email.js";

// GET /api/admin/creators/applications
// PATCH /api/admin/creators/applications
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "members.manage");
    const { results } = await db
      .prepare("SELECT * FROM creator_applications ORDER BY submitted_at DESC")
      .all();
    return json({ ok: true, applications: results || [] });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không tải được đơn.");
  }
}

export async function onRequestPatch(context) {
  try {
    const { db } = await requireAdminPermission(context, "members.manage");
    const body = await context.request.json();
    const { id, status, review_note, reviewer_name, reason } = body;
    if (!id || !status) return errorResponse(400, "INVALID", "Thiếu id hoặc status.");

    await db
      .prepare("UPDATE creator_applications SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?")
      .bind(status, review_note || "", reviewer_name || "", nowIso(), id)
      .run();

    // Send approval/rejection email (non-blocking)
    try {
      const app = await db.prepare("SELECT email, name FROM creator_applications WHERE id = ?").bind(id).first();
      if (app) {
        const templateId = status === "approved"
          ? TEMPLATE_IDS.creator_approved
          : status === "rejected"
            ? TEMPLATE_IDS.creator_rejected
            : null;
        if (templateId) {
          await sendTemplateEmailDirect({
            env: context.env,
            templateId,
            recipientEmail: app.email,
            language: "vi",
            payload: { creator_name: app.name, email: app.email, reason: reason || review_note || "" }
          });
        }
      }
    } catch (_e) { /* non-blocking */ }

    return json({ ok: true });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không cập nhật được đơn.");
  }
}
