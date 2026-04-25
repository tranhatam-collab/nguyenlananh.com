import { TEMPLATE_IDS } from "./constants.js";
import { getEmailJobByDedupeKey, insertEmailJob, updateEmailJob } from "./db.js";
import { nowIso } from "./utils.js";

function paymentFromAddress(env) {
  return env.EMAIL_FROM_PAY || "pay@nguyenlananh.com";
}

function systemFromAddress(env) {
  return env.EMAIL_FROM_SYSTEM || "noreply@nguyenlananh.com";
}

function supportAddress(env) {
  return env.EMAIL_REPLY_TO_SUPPORT || "support@nguyenlananh.com";
}

function renderTemplate(templateId, locale, payload, env) {
  const isEnglish = locale === "en-US";
  const dashboardUrl = payload.dashboard_url || payload.magic_link || payload.next_step_url || env.API_BASE_URL || "";
  const supportEmail = payload.support_email || supportAddress(env);

  if (templateId === TEMPLATE_IDS.welcome) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Welcome to your journey system"
        : "[Nguyenlananh.com] Chao mung ban vao he hanh trinh",
      text: isEnglish
        ? `Hi,\n\nYour membership is now active.\nPlan: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nIf this was not you, contact ${supportEmail}.`
        : `Chao ban,\n\nTai khoan thanh vien cua ban da duoc kich hoat.\nGoi: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nNeu can ho tro, vui long lien he ${supportEmail}.`
    };
  }

  if (templateId === TEMPLATE_IDS.resend) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish ? "[Nguyenlananh.com] Your new magic link" : "[Nguyenlananh.com] Magic link moi cua ban",
      text: isEnglish
        ? `Hi,\n\nHere is your new login magic link:\n${payload.magic_link}\n\nThis link expires in ${payload.magic_link_expire_minutes || 15} minutes.`
        : `Chao ban,\n\nDay la magic link moi de dang nhap:\n${payload.magic_link}\n\nLink co hieu luc trong ${payload.magic_link_expire_minutes || 15} phut.`
    };
  }

  if (templateId === TEMPLATE_IDS.receipt) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Receipt] Payment successful #${payload.order_id}`
        : `[Bien nhan] Thanh toan thanh cong #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nWe received your payment successfully.\nPlan: ${payload.plan_name}\nAmount: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
        : `Chao ban,\n\nChung toi da nhan thanh toan thanh cong.\nGoi: ${payload.plan_name}\nSo tien: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
    };
  }

  if (templateId === TEMPLATE_IDS.failed) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Payment not completed"
        : "[Nguyenlananh.com] Thanh toan chua thanh cong",
      text: isEnglish
        ? `Hi,\n\nPayment for order ${payload.order_id} was not completed.\nRetry here: ${payload.next_step_url}\nNeed help? ${supportEmail}`
        : `Chao ban,\n\nThanh toan cho don ${payload.order_id} chua thanh cong.\nThu lai tai day: ${payload.next_step_url}\nCan ho tro? ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.refunded) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Nguyenlananh.com] Refund update #${payload.order_id}`
        : `[Nguyenlananh.com] Cap nhat hoan tien #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nA refund was recorded for order ${payload.order_id}.\nCurrent policy: ${payload.refund_policy}\nSupport: ${supportEmail}`
        : `Chao ban,\n\nHe thong da ghi nhan hoan tien cho don ${payload.order_id}.\nChinh sach hien tai: ${payload.refund_policy}\nHo tro: ${supportEmail}`
    };
  }

  return {
    from: systemFromAddress(env),
    reply_to: supportEmail,
    subject: isEnglish ? "[Nguyenlananh.com] Payment event" : "[Nguyenlananh.com] Su kien thanh toan",
    text: JSON.stringify(payload, null, 2)
  };
}

async function sendViaResend(env, emailJob) {
  const content = renderTemplate(emailJob.template_id, emailJob.language, emailJob.payload_json, env);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: content.from,
      to: [emailJob.recipient_email],
      reply_to: content.reply_to,
      subject: content.subject,
      text: content.text,
      html: `<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; white-space:pre-wrap;">${escapeHtml(
        content.text
      )}</pre>`
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "Email provider request failed.");
    error.details = body;
    throw error;
  }

  return {
    provider_message_id: body.id || null
  };
}

export async function sendTemplateEmailDirect({ env, templateId, recipientEmail, language, payload }) {
  const content = renderTemplate(templateId, language, payload, env);
  const emailJob = {
    template_id: templateId,
    recipient_email: recipientEmail,
    language,
    payload_json: payload
  };

  if ((env.EMAIL_PROVIDER || "").toLowerCase() !== "resend" || !env.RESEND_API_KEY) {
    return {
      status: "preview",
      provider_message_id: null,
      content
    };
  }

  try {
    const result = await sendViaResend(env, emailJob);
    return {
      status: "sent",
      provider_message_id: result.provider_message_id || null,
      content
    };
  } catch (error) {
    return {
      status: "failed",
      provider_message_id: null,
      error_detail: error.message || "Unknown email failure",
      content
    };
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function queueAndSendEmail({ db, env, templateId, recipientEmail, language, dedupeKey, payload }) {
  const existing = await getEmailJobByDedupeKey(db, dedupeKey);
  if (existing) return existing;

  const timestamp = nowIso();
  const job = await insertEmailJob(db, {
    template_id: templateId,
    recipient_email: recipientEmail,
    language,
    dedupe_key: dedupeKey,
    payload_json: payload,
    status: "queued",
    created_at: timestamp,
    updated_at: timestamp,
    scheduled_for: timestamp
  });

  if ((env.EMAIL_PROVIDER || "").toLowerCase() !== "resend" || !env.RESEND_API_KEY) {
    return job;
  }

  try {
    const result = await sendViaResend(env, job);
    await updateEmailJob(db, job.id, {
      status: "sent",
      provider_message_id: result.provider_message_id,
      sent_at: nowIso(),
      updated_at: nowIso()
    });
    return {
      ...job,
      status: "sent",
      provider_message_id: result.provider_message_id
    };
  } catch (error) {
    await updateEmailJob(db, job.id, {
      status: "failed",
      error_detail: error.message || "Unknown email failure",
      failed_at: nowIso(),
      updated_at: nowIso()
    });
    return {
      ...job,
      status: "failed",
      error_detail: error.message || "Unknown email failure"
    };
  }
}
