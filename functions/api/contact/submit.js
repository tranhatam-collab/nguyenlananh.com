import { TEMPLATE_IDS } from "../../_lib/constants.js";
import { requireDb } from "../../_lib/db.js";
import { sendTemplateEmailDirect } from "../../_lib/email.js";
import { requireTurnstile } from "../../_lib/turnstile.js";
import { errorResponse, json, normalizeEmail, nowIso, randomId, readJson } from "../../_lib/utils.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await readJson(request);

  // Turnstile bot verification
  const turnstileError = await requireTurnstile(body, request, env);
  if (turnstileError) return errorResponse(turnstileError.status, turnstileError.code, turnstileError.message);

  const name = String(body?.name || "").trim();
  const contact = String(body?.contact || "").trim();
  const message = String(body?.message || "").trim();

  if (!name || name.length < 1 || name.length > 100) {
    return errorResponse(400, "INVALID_NAME", "Vui lòng nhập tên (tối đa 100 ký tự).");
  }
  if (!contact || contact.length < 3 || contact.length > 200) {
    return errorResponse(400, "INVALID_CONTACT", "Vui lòng nhập email hoặc số điện thoại hợp lệ.");
  }
  if (!message || message.length < 5 || message.length > 5000) {
    return errorResponse(400, "INVALID_MESSAGE", "Lời nhắn cần từ 5 đến 5000 ký tự.");
  }

  const timestamp = nowIso();
  let dbStored = false;
  let dbError = null;
  try {
    const db = requireDb(env);
    await db
      .prepare(
        `INSERT INTO contact_submissions (id, name, contact, message, source_ip, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        randomId("ctc"),
        name,
        contact,
        message,
        request.headers.get("CF-Connecting-IP") || null,
        request.headers.get("User-Agent") || null,
        timestamp
      )
      .run();
    dbStored = true;
  } catch (e) {
    dbError = e.message;
  }

  const payload = {
    name,
    contact,
    message,
    contact_email: normalizeEmail(contact),
    submitted_at: timestamp
  };

  let emailStatus = "preview";
  try {
    const result = await sendTemplateEmailDirect({
      env,
      templateId: TEMPLATE_IDS.contact,
      recipientEmail: env.CONTACT_NOTIFICATION_EMAIL || "lienhe@nguyenlananh.com",
      language: "vi",
      payload
    });
    emailStatus = result.status;
  } catch (_e) {
    emailStatus = "failed";
  }

  return json({
    ok: true,
    message: "Lời nhắn đã được gửi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
    email_status: emailStatus,
    db_stored: dbStored,
    ...(dbError ? { db_error: dbError } : {})
  });
}
