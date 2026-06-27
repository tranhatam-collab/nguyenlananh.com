import { requireAdminSession } from "../../../_lib/admin_auth.js";
import { json, errorResponse, normalizeEmail, timingSafeEqualHex } from "../../../_lib/utils.js";
import { sendTemplateEmailDirect } from "../../../_lib/email.js";
import { TEMPLATE_IDS } from "../../../_lib/constants.js";

async function requireAdminTestAccess(context) {
  const providedKey = String(context.request.headers.get("x-admin-key") || "").trim();
  const secretKey = String(
    context.env.PAYMENTS_ADMIN_KEY ||
    context.env.ADMIN_OPS_KEY ||
    context.env.ADMIN_PAYMENT_CONFIRM_KEY ||
    ""
  ).trim();
  if (secretKey && providedKey && timingSafeEqualHex(providedKey, secretKey)) {
    return true;
  }
  await requireAdminSession(context);
  return true;
}

// POST /api/admin/email/test
// Send a test email through the currently configured provider.
// Auth: admin session OR x-admin-key header.
// Body: { to?: string, template?: string, language?: "en"|"vi" }
export async function onRequestPost(context) {
  try {
    await requireAdminTestAccess(context);
    const body = await context.request.json();
    const to = normalizeEmail(body?.to) || context.env.EMAIL_REPLY_TO_SUPPORT || "support@nguyenlananh.com";
    const templateId = body?.template || TEMPLATE_IDS.resend;
    const language = body?.language === "en" ? "en" : "vi";

    const result = await sendTemplateEmailDirect({
      env: context.env,
      templateId,
      recipientEmail: to,
      language,
      payload: {
        login_url: "https://www.nguyenlananh.com/members/",
        login_url_expire_minutes: 60,
        plan_name: "test-plan",
        order_id: "test-order",
        amount: 0,
        currency: "VND",
        support_email: context.env.EMAIL_REPLY_TO_SUPPORT || "support@nguyenlananh.com"
      }
    });

    return json({
      ok: true,
      provider: result.provider,
      status: result.status,
      provider_message_id: result.provider_message_id || null,
      recipient: to,
      template: templateId,
      language
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "EMAIL_TEST_FAILED", err.message || "Không gửi được email test.");
  }
}
