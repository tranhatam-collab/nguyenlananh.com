import { TEMPLATE_IDS } from "./constants.js";
import { getEmailJobByDedupeKey, insertEmailJob, updateEmailJob } from "./db.js";
import { nowIso } from "./utils.js";

function normalizeEmailProvider(env) {
  const explicit = String(env.EMAIL_PROVIDER || "")
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  if (env.MAIL_API_KEY || env.MAIL_API_BASE_URL || env.MAIL_API_URL) return "mail_iai_one";
  if (env.RESEND_API_KEY) return "resend";
  return "preview";
}

function normalizeMailApiBaseUrl(env) {
  const raw = String(env.MAIL_API_BASE_URL || env.MAIL_API_URL || "https://api.mail.iai.one/v1").trim();
  return raw.replace(/\/+$/u, "");
}

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
        : "[Nguyenlananh.com] Chào mừng bạn vào hệ hành trình",
      text: isEnglish
        ? `Hi,\n\nYour membership is now active.\nPlan: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nIf this was not you, contact ${supportEmail}.`
        : `Chào bạn,\n\nTài khoản thành viên của bạn đã được kích hoạt.\nGói: ${payload.plan_name}\nMagic link: ${payload.magic_link}\nDashboard: ${dashboardUrl}\n\nNếu cần hỗ trợ, vui lòng liên hệ ${supportEmail}.`
    };
  }

  if (templateId === TEMPLATE_IDS.resend) {
    return {
      from: systemFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish ? "[Nguyenlananh.com] Your new magic link" : "[Nguyenlananh.com] Magic link mới của bạn",
      text: isEnglish
        ? `Hi,\n\nHere is your new login magic link:\n${payload.magic_link}\n\nThis link expires in ${payload.magic_link_expire_minutes || 15} minutes.`
        : `Chào bạn,\n\nĐây là magic link mới để đăng nhập:\n${payload.magic_link}\n\nLink có hiệu lực trong ${payload.magic_link_expire_minutes || 15} phút.`
    };
  }

  if (templateId === TEMPLATE_IDS.receipt) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Receipt] Payment successful #${payload.order_id}`
        : `[Biên nhận] Thanh toán thành công #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nWe received your payment successfully.\nPlan: ${payload.plan_name}\nAmount: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
        : `Chào bạn,\n\nChúng tôi đã nhận thanh toán thành công.\nGói: ${payload.plan_name}\nSố tiền: ${payload.amount} ${payload.currency}\nOrder ID: ${payload.order_id}\nCapture ID: ${payload.capture_id}\nDashboard: ${dashboardUrl}`
    };
  }

  if (templateId === TEMPLATE_IDS.failed) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? "[Nguyenlananh.com] Payment not completed"
        : "[Nguyenlananh.com] Thanh toán chưa thành công",
      text: isEnglish
        ? `Hi,\n\nPayment for order ${payload.order_id} was not completed.\nRetry here: ${payload.next_step_url}\nNeed help? ${supportEmail}`
        : `Chào bạn,\n\nThanh toán cho đơn ${payload.order_id} chưa thành công.\nThử lại tại đây: ${payload.next_step_url}\nCần hỗ trợ? ${supportEmail}`
    };
  }

  if (templateId === TEMPLATE_IDS.refunded) {
    return {
      from: paymentFromAddress(env),
      reply_to: supportEmail,
      subject: isEnglish
        ? `[Nguyenlananh.com] Refund update #${payload.order_id}`
        : `[Nguyenlananh.com] Cập nhật hoàn tiền #${payload.order_id}`,
      text: isEnglish
        ? `Hi,\n\nA refund was recorded for order ${payload.order_id}.\nCurrent policy: ${payload.refund_policy}\nSupport: ${supportEmail}`
        : `Chào bạn,\n\nHệ thống đã ghi nhận hoàn tiền cho đơn ${payload.order_id}.\nChính sách hiện tại: ${payload.refund_policy}\nHỗ trợ: ${supportEmail}`
    };
  }

  return {
    from: systemFromAddress(env),
    reply_to: supportEmail,
    subject: isEnglish ? "[Nguyenlananh.com] Payment event" : "[Nguyenlananh.com] Sự kiện thanh toán",
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

async function sendViaMailIaiOne(env, emailJob) {
  const content = renderTemplate(emailJob.template_id, emailJob.language, emailJob.payload_json, env);
  const baseUrl = normalizeMailApiBaseUrl(env);
  const useLegacyEndpoint = baseUrl.includes("/_mail");
  const endpoint = useLegacyEndpoint ? `${baseUrl}/emails` : `${baseUrl}/send`;

  const headers = {
    Authorization: `Bearer ${env.MAIL_API_KEY}`,
    "Content-Type": "application/json"
  };

  if (!useLegacyEndpoint && env.MAIL_API_WORKSPACE_ID) {
    headers["X-Workspace-Id"] = env.MAIL_API_WORKSPACE_ID;
  }

  if (!useLegacyEndpoint) {
    headers["X-Request-Id"] = `nla-${emailJob.template_id}-${Date.now()}`;
  }

  const html = `<pre style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; white-space:pre-wrap;">${escapeHtml(
    content.text
  )}</pre>`;

  const body = useLegacyEndpoint
    ? {
        from: content.from,
        to: [emailJob.recipient_email],
        reply_to: content.reply_to,
        subject: content.subject,
        text: content.text,
        html
      }
    : {
        from: { email: content.from },
        to: [{ email: emailJob.recipient_email }],
        reply_to: content.reply_to ? { email: content.reply_to } : undefined,
        subject: content.subject,
        text: content.text,
        html,
        tags: ["nguyenlananh.com", emailJob.template_id],
        metadata: {
          source_domain: "nguyenlananh.com",
          template_id: emailJob.template_id
        }
      };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const raw = await response.text();
  const parsed = (() => {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return {};
    }
  })();

  if (!response.ok) {
    const error = new Error(parsed.message || raw || "MAIL_API request failed.");
    error.details = parsed;
    throw error;
  }

  return {
    provider_message_id: parsed.message_id || parsed.id || parsed.data?.message_id || null
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

  const provider = normalizeEmailProvider(env);
  const canSend =
    (provider === "mail_iai_one" && !!env.MAIL_API_KEY) || (provider === "resend" && !!env.RESEND_API_KEY);

  if (!canSend) {
    return {
      status: "preview",
      provider_message_id: null,
      content
    };
  }

  try {
    const result =
      provider === "mail_iai_one" ? await sendViaMailIaiOne(env, emailJob) : await sendViaResend(env, emailJob);
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
  const provider = normalizeEmailProvider(env);
  const existing = await getEmailJobByDedupeKey(db, dedupeKey);
  if (existing) return existing;

  const timestamp = nowIso();
  const job = await insertEmailJob(db, {
    template_id: templateId,
    recipient_email: recipientEmail,
    language,
    provider,
    dedupe_key: dedupeKey,
    payload_json: payload,
    status: "queued",
    created_at: timestamp,
    updated_at: timestamp,
    scheduled_for: timestamp
  });

  const canSend =
    (provider === "mail_iai_one" && !!env.MAIL_API_KEY) || (provider === "resend" && !!env.RESEND_API_KEY);
  if (!canSend) {
    return job;
  }

  try {
    const result = provider === "mail_iai_one" ? await sendViaMailIaiOne(env, job) : await sendViaResend(env, job);
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
