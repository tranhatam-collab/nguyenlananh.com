import { requireAdminSession } from "../../../_lib/admin_auth.js";
import { json, errorResponse, normalizeEmail, timingSafeEqualHex } from "../../../_lib/utils.js";
import { sendTemplateEmailDirect } from "../../../_lib/email.js";
import { TEMPLATE_IDS } from "../../../_lib/constants.js";
import { checkAdminEmailTestRateLimit, rateLimitResponse } from "../../../_lib/ratelimit.js";

const DEFAULT_TEST_RECIPIENT = "support@nguyenlananh.com";

function allowedRecipients(env) {
  const configured = String(env.ADMIN_TEST_EMAIL_ALLOWED_TO || "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
  const fallback = normalizeEmail(env.EMAIL_REPLY_TO_SUPPORT) || DEFAULT_TEST_RECIPIENT;
  return new Set(configured.length ? configured : [fallback]);
}

function assertAllowedRecipient(env, email) {
  if (allowedRecipients(env).has(email)) return;
  const error = new Error("Recipient is not allowed for production email tests.");
  error.code = "ADMIN_EMAIL_TEST_RECIPIENT_DENIED";
  error.status = 403;
  throw error;
}

function normalizeTemplateId(input) {
  const templateId = String(input || TEMPLATE_IDS.resend).trim();
  const allowed = new Set(Object.values(TEMPLATE_IDS));
  if (allowed.has(templateId)) return templateId;
  const error = new Error("Template is not allowed for email tests.");
  error.code = "ADMIN_EMAIL_TEST_TEMPLATE_DENIED";
  error.status = 422;
  throw error;
}

async function requireAdminTestAccess(context) {
  const providedKey = String(context.request.headers.get("x-admin-key") || "").trim();
  const secretKey = String(
    context.env.ADMIN_TEST_EMAIL_KEY ||
    context.env.PAYMENTS_ADMIN_KEY ||
    context.env.ADMIN_OPS_KEY ||
    context.env.ADMIN_PAYMENT_CONFIRM_KEY ||
    ""
  ).trim();
  if (secretKey && providedKey) {
    if (timingSafeEqualHex(providedKey, secretKey)) {
      return true;
    }
    const error = new Error("Invalid admin key.");
    error.code = "ADMIN_KEY_INVALID";
    error.status = 403;
    throw error;
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
    const rateLimit = await checkAdminEmailTestRateLimit(context.env, context.request);
    if (rateLimit.limited) return rateLimitResponse(rateLimit.code, rateLimit.retryAfter);

    const body = await context.request.json();
    const to = normalizeEmail(body?.to) || normalizeEmail(context.env.EMAIL_REPLY_TO_SUPPORT) || DEFAULT_TEST_RECIPIENT;
    assertAllowedRecipient(context.env, to);
    const templateId = normalizeTemplateId(body?.template);
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
