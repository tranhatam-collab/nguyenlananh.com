import { PLANS, PROVIDER_CATALOG, TEMPLATE_IDS, planByCode, providerByCode } from "./constants.js";
import {
  createMagicLink,
  createOrder,
  createVietQrOrder,
  findIdempotency,
  getMagicLinkByHash,
  getOrderByCaptureId,
  getOrderByInternalId,
  getOrderByProviderOrderId,
  getOrderByProviderSessionId,
  getUserByEmail,
  getUserById,
  getVietQrOrderByInternalOrderId,
  getWebhookByEventId,
  listVietQrOrders,
  markMagicLinkUsed,
  recordWebhook,
  requireDb,
  revokeUserMembership,
  storeIdempotency,
  updateOrder,
  updateVietQrOrder,
  updateWebhook,
  upsertUserMembership
} from "./db.js";
import { queueAndSendEmail } from "./email.js";
import {
  assert,
  buildAbsoluteUrl,
  daysFrom,
  errorResponse,
  getLocale,
  isFutureIso,
  json,
  localeToDashboardPath,
  localeToReturnPath,
  normalizeEmail,
  normalizeNextPath,
  nowIso,
  publicEnvironmentSummary,
  randomId,
  randomToken,
  readJson,
  sha256Hex,
  timingSafeEqualHex,
  toHex,
  withQuery
} from "./utils.js";

const PAYPAL_API_LIVE = "https://api-m.paypal.com";
const PAYPAL_API_SANDBOX = "https://api-m.sandbox.paypal.com";
const STRIPE_API = "https://api.stripe.com";
const IMPLEMENTED_PROVIDER_CODES = ["paypal", "stripe", "vietqr"];
const VIETQR_DEFAULT_TEMPLATE = "compact2";

function normalizeIdentityCountry(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!normalized) return "VN";
  if (normalized === "VIETNAM" || normalized === "VNM") return "VN";
  if (normalized === "FOREIGN" || normalized === "INTL" || normalized === "INTERNATIONAL" || normalized === "NON_VN") return "INTL";
  return normalized;
}

export function resolvePaymentRail({ identityCountry, providerCode }) {
  const territory = normalizeIdentityCountry(identityCountry);
  const provider = String(providerCode || "").trim().toLowerCase();
  const wantsVnd = provider === "vietqr";
  const wantsUsd = provider === "paypal" || provider === "stripe";

  if (territory === "VN" && wantsUsd) {
    return {
      allowed: false,
      code: "VN_ID_REQUIRES_VND",
      message: "Vietnam ID requires VND checkout."
    };
  }

  if (territory !== "VN" && wantsVnd) {
    return {
      allowed: false,
      code: "INTERNATIONAL_ID_REQUIRES_USD",
      message: "International ID requires USD checkout."
    };
  }

  return {
    allowed: true,
    territory,
    currency: wantsVnd ? "VND" : "USD"
  };
}

function planAmountForCurrency(plan, currency) {
  if (String(currency || "").toUpperCase() === "VND") return Number(plan.priceVnd || 0);
  return Number(plan.priceUsd || 0);
}

function providerSecretsReady(provider, env) {
  return provider.requiredSecrets.every((secretName) => Boolean(env[secretName]));
}

function providerStatus(provider, env) {
  const implemented = IMPLEMENTED_PROVIDER_CODES.includes(provider.code);
  const enabled = providerSecretsReady(provider, env) && Boolean(env.PAYMENTS_DB) && implemented;
  const manualFallback = provider.code === "paypal" && Boolean(env.PAYPAL_MERCHANT_EMAIL) && !enabled;
  return {
    code: provider.code,
    label: provider.label,
    region: provider.region,
    methods: provider.methods,
    currencies: provider.currencies,
    implemented,
    enabled,
    manual_fallback: manualFallback,
    mode:
      !implemented
        ? "planned"
        : enabled && provider.code === "paypal" && String(env.PAYPAL_ENV || "live").toLowerCase() === "sandbox"
          ? "sandbox"
          : enabled
            ? "live"
            : "setup_required"
  };
}

function paymentMethodProviders(env) {
  return PROVIDER_CATALOG.map((provider) => providerStatus(provider, env));
}

function paymentRailCatalog(env) {
  const providers = paymentMethodProviders(env);
  const byCode = new Map(providers.map((provider) => [provider.code, provider]));
  const enrich = (providerCode) => ({
    provider: providerCode,
    ...(byCode.get(providerCode) || {
      code: providerCode,
      label: providerCode,
      enabled: false,
      mode: "unknown"
    })
  });

  return [
    {
      rail: "VN_VND",
      required_identity_country: "VN",
      currency: "VND",
      providers: ["vietqr", "momo", "vnpay", "zalopay"].map(enrich)
    },
    {
      rail: "INTL_USD",
      required_identity_country: "INTL",
      currency: "USD",
      providers: ["paypal", "stripe"].map(enrich)
    }
  ];
}

function idempotencyConflict(existing, requestHash) {
  return existing && existing.request_hash !== requestHash;
}

function paypalBaseUrl(env) {
  return String(env.PAYPAL_ENV || "live").toLowerCase() === "sandbox" ? PAYPAL_API_SANDBOX : PAYPAL_API_LIVE;
}

async function paypalAccessToken(env) {
  const response = await fetch(`${paypalBaseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    const error = new Error(body.error_description || "Unable to obtain PayPal access token.");
    error.status = 502;
    throw error;
  }

  return body.access_token;
}

async function createPayPalCheckout(env, order, idempotencyKey) {
  const accessToken = await paypalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": idempotencyKey
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.internal_order_id,
          custom_id: order.internal_order_id,
          invoice_id: order.internal_order_id,
          description: `Nguyenlananh Membership ${order.plan.label}`,
          amount: {
            currency_code: "USD",
            value: Number(order.amount || 0).toFixed(2)
          }
        }
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Nguyenlananh.com",
            user_action: "PAY_NOW",
            return_url: order.success_url,
            cancel_url: order.cancel_url
          }
        }
      }
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.id) {
    const error = new Error(body.message || "PayPal order creation failed.");
    error.status = 502;
    throw error;
  }

  const approveLink =
    body.links?.find((link) => link.rel === "payer-action")?.href ||
    body.links?.find((link) => link.rel === "approve")?.href ||
    null;

  assert(approveLink, "PAYPAL_APPROVE_URL_MISSING", "PayPal did not return an approval URL.", 502);

  return {
    provider_order_id: body.id,
    checkout_url: approveLink,
    raw: body
  };
}

async function capturePayPalOrder(env, providerOrderId, idempotencyKey) {
  const accessToken = await paypalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}/v2/checkout/orders/${providerOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": idempotencyKey
    }
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 422) {
    const error = new Error(body.message || "PayPal capture failed.");
    error.status = 502;
    throw error;
  }

  const capture = body.purchase_units?.[0]?.payments?.captures?.[0] || null;
  return {
    status: capture?.status || body.status || "UNKNOWN",
    capture_id: capture?.id || null,
    raw: body
  };
}

async function verifyPayPalWebhook(env, headers, payload) {
  const accessToken = await paypalAccessToken(env);
  const response = await fetch(`${paypalBaseUrl(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"] || "",
      cert_url: headers["paypal-cert-url"] || "",
      transmission_id: headers["paypal-transmission-id"] || "",
      transmission_sig: headers["paypal-transmission-sig"] || "",
      transmission_time: headers["paypal-transmission-time"] || "",
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: payload
    })
  });

  const body = await response.json().catch(() => ({}));
  return body.verification_status === "SUCCESS";
}

function formUrlEncode(payload) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  return params;
}

async function stripeRequest(env, method, path, payload, idempotencyKey) {
  const headers = {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`
  };

  let body;
  if (payload instanceof URLSearchParams) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = payload.toString();
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    body
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error?.message || "Stripe API request failed.");
    error.status = 502;
    throw error;
  }

  return result;
}

async function createStripeCheckout(env, order, idempotencyKey) {
  const payload = formUrlEncode({
    mode: "payment",
    success_url: withQuery(order.success_url, {
      provider: "stripe",
      internal_order_id: order.internal_order_id,
      session_id: "{CHECKOUT_SESSION_ID}"
    }),
    cancel_url: withQuery(order.cancel_url, {
      provider: "stripe",
      internal_order_id: order.internal_order_id
    }),
    client_reference_id: order.internal_order_id,
    customer_email: order.email,
    billing_address_collection: "auto",
    "metadata[internal_order_id]": order.internal_order_id,
    "metadata[plan_code]": order.plan.code,
    "metadata[email]": order.email,
    "payment_intent_data[metadata][internal_order_id]": order.internal_order_id,
    "payment_intent_data[metadata][plan_code]": order.plan.code,
    "payment_intent_data[metadata][email]": order.email,
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": String(order.currency || "USD").toLowerCase(),
    "line_items[0][price_data][unit_amount]": Math.round(Number(order.amount || 0) * 100),
    "line_items[0][price_data][product_data][name]": `Nguyenlananh Membership ${order.plan.label}`
  });

  const body = await stripeRequest(env, "POST", "/v1/checkout/sessions", payload, idempotencyKey);
  assert(body.url, "STRIPE_CHECKOUT_URL_MISSING", "Stripe did not return a checkout URL.", 502);

  return {
    provider_session_id: body.id,
    provider_order_id: body.payment_intent || null,
    checkout_url: body.url,
    raw: body
  };
}

async function retrieveStripeSession(env, sessionId) {
  const body = await stripeRequest(env, "GET", `/v1/checkout/sessions/${sessionId}`, null, null);
  return {
    session_id: body.id,
    payment_status: body.payment_status,
    status: body.status,
    capture_id: body.payment_intent || null,
    raw: body
  };
}

function normalizeDigits(value) {
  return String(value || "").replace(/\D+/g, "");
}

export function buildVietQrQuickLink({ bankBin, accountNo, amount, transferNote, accountName, template = VIETQR_DEFAULT_TEMPLATE }) {
  const sanitizedBankBin = normalizeDigits(bankBin);
  const sanitizedAccountNo = normalizeDigits(accountNo);
  const sanitizedAmount = Math.max(0, Math.round(Number(amount || 0)));
  const safeNote = String(transferNote || "").trim();
  assert(sanitizedBankBin.length >= 6, "VIETQR_BANK_BIN_INVALID", "VIETQR_BANK_BIN is invalid.", 500);
  assert(sanitizedAccountNo.length >= 6, "VIETQR_ACCOUNT_NO_INVALID", "VIETQR_ACCOUNT_NO is invalid.", 500);
  assert(sanitizedAmount > 0, "VIETQR_AMOUNT_INVALID", "VND amount must be greater than zero.", 422);
  assert(safeNote.length >= 6, "VIETQR_TRANSFER_NOTE_INVALID", "Transfer note is invalid.", 500);

  const url = new URL(`https://img.vietqr.io/image/${sanitizedBankBin}-${sanitizedAccountNo}-${template}.png`);
  url.searchParams.set("amount", String(sanitizedAmount));
  url.searchParams.set("addInfo", safeNote);
  if (String(accountName || "").trim()) {
    url.searchParams.set("accountName", String(accountName || "").trim());
  }
  return url.toString();
}

function buildVietQrTransferNote(internalOrderId) {
  const normalized = String(internalOrderId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `NLA${normalized.slice(-10)}`;
}

async function createVietQrCheckout(env, order) {
  const transferNote = buildVietQrTransferNote(order.internal_order_id);
  const qrUrl = buildVietQrQuickLink({
    bankBin: env.VIETQR_BANK_BIN,
    accountNo: env.VIETQR_ACCOUNT_NO,
    accountName: env.VIETQR_ACCOUNT_NAME,
    amount: order.amount,
    transferNote,
    template: env.VIETQR_TEMPLATE || VIETQR_DEFAULT_TEMPLATE
  });

  return {
    provider_order_id: transferNote,
    checkout_url: qrUrl,
    raw: {
      mode: "manual_confirm",
      transfer_note: transferNote,
      qr_url: qrUrl,
      bank_bin: String(env.VIETQR_BANK_BIN || ""),
      account_no: String(env.VIETQR_ACCOUNT_NO || ""),
      account_name: String(env.VIETQR_ACCOUNT_NAME || ""),
      amount: Number(order.amount || 0),
      currency: "VND"
    }
  };
}

async function hmacSha256Hex(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(signature);
}

async function verifyStripeWebhook(rawBody, signatureHeader, endpointSecret) {
  if (!signatureHeader || !endpointSecret) return false;
  const entries = signatureHeader.split(",").map((item) => item.trim());
  const timestamp = entries.find((entry) => entry.startsWith("t="))?.slice(2);
  const signatures = entries.filter((entry) => entry.startsWith("v1=")).map((entry) => entry.slice(3));
  if (!timestamp || !signatures.length) return false;

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (Number.isNaN(ageSeconds) || ageSeconds > 300) return false;

  const expected = await hmacSha256Hex(endpointSecret, `${timestamp}.${rawBody}`);
  return signatures.some((signature) => timingSafeEqualHex(signature, expected));
}

function serializeHeaders(headers) {
  return Object.fromEntries(Array.from(headers.entries()));
}

function originFromRequest(request, env) {
  if (env.API_BASE_URL) {
    try {
      return new URL(env.API_BASE_URL).origin;
    } catch (_error) {
      // fall through
    }
  }
  return new URL(request.url).origin;
}

function buildReturnUrls({ request, env, locale, internalOrderId, successUrl, cancelUrl, retryUrl, providerCode }) {
  const origin = originFromRequest(request, env);
  const nextSuccess = successUrl || buildAbsoluteUrl(origin, localeToReturnPath(locale, "success"));
  const nextCancel = cancelUrl || buildAbsoluteUrl(origin, localeToReturnPath(locale, "cancel"));
  const nextRetry = retryUrl || buildAbsoluteUrl(origin, localeToReturnPath(locale, "retry"));

  return {
    success_url: withQuery(nextSuccess, {
      provider: providerCode,
      internal_order_id: internalOrderId
    }),
    cancel_url: withQuery(nextCancel, {
      provider: providerCode,
      internal_order_id: internalOrderId
    }),
    retry_url: withQuery(nextRetry, {
      provider: providerCode,
      internal_order_id: internalOrderId
    })
  };
}

function providerPublicConfig(providerCode, env) {
  if (providerCode === "paypal") {
    return {
      merchant_email: env.PAYPAL_MERCHANT_EMAIL || null
    };
  }

  if (providerCode === "stripe") {
    return {
      publishable_key: env.STRIPE_PUBLISHABLE_KEY || null
    };
  }

  if (providerCode === "vietqr") {
    return {
      bank_bin: env.VIETQR_BANK_BIN || null,
      account_no: env.VIETQR_ACCOUNT_NO || null,
      account_name: env.VIETQR_ACCOUNT_NAME || null,
      template: env.VIETQR_TEMPLATE || VIETQR_DEFAULT_TEMPLATE
    };
  }

  return {};
}

function buildOrderLookup(event) {
  return (
    event?.resource?.supplementary_data?.related_ids?.order_id ||
    event?.resource?.invoice_id ||
    event?.data?.object?.client_reference_id ||
    event?.data?.object?.metadata?.internal_order_id ||
    null
  );
}

function buildCaptureLookup(event) {
  return (
    event?.resource?.id ||
    event?.resource?.payment_intent ||
    event?.data?.object?.payment_intent ||
    null
  );
}

async function issueMagicLink({ db, order, user, env, request }) {
  const origin = originFromRequest(request, env);
  const dashboardPath = localeToDashboardPath(order.locale);
  const nextPath = normalizeNextPath(order.metadata_json?.next_path, order.locale);
  const rawToken = randomToken(24);
  const tokenHash = await sha256Hex(rawToken);
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await createMagicLink(db, {
    user_id: user.id,
    email: user.email,
    token_hash: tokenHash,
    redirect_path: nextPath,
    expires_at: expiresAt,
    created_at: createdAt
  });

  return {
    token: rawToken,
    expires_at: expiresAt,
    url: withQuery(buildAbsoluteUrl(origin, dashboardPath), {
      magic: rawToken,
      next: nextPath
    }),
    next_path: nextPath
  };
}

async function sendFulfillmentEmails({ db, env, order, user, magicLink, providerCaptureId, request }) {
  const origin = originFromRequest(request, env);
  const locale = getLocale(order.locale || user.preferred_language);
  const dashboardUrl = buildAbsoluteUrl(origin, localeToDashboardPath(locale));
  const commonPayload = {
    plan_name: order.plan_code,
    amount: order.amount,
    currency: order.currency,
    order_id: order.internal_order_id,
    capture_id: providerCaptureId,
    dashboard_url: dashboardUrl,
    magic_link: magicLink.url,
    support_email: env.EMAIL_REPLY_TO_SUPPORT || "support@nguyenlananh.com"
  };

  await queueAndSendEmail({
    db,
    env,
    templateId: TEMPLATE_IDS.receipt,
    recipientEmail: user.email,
    language: locale,
    dedupeKey: `${TEMPLATE_IDS.receipt}:${user.email}:${order.internal_order_id}:${providerCaptureId || "na"}`,
    payload: commonPayload
  });

  await queueAndSendEmail({
    db,
    env,
    templateId: TEMPLATE_IDS.welcome,
    recipientEmail: user.email,
    language: locale,
    dedupeKey: `${TEMPLATE_IDS.welcome}:${user.email}:${order.internal_order_id}:${providerCaptureId || "na"}`,
    payload: {
      ...commonPayload,
      magic_link_expire_minutes: 15
    }
  });
}

async function markPaymentFailed({ db, env, order }) {
  await updateOrder(db, order.internal_order_id, {
    payment_status: "denied",
    updated_at: nowIso()
  });

  await queueAndSendEmail({
    db,
    env,
    templateId: TEMPLATE_IDS.failed,
    recipientEmail: order.email,
    language: getLocale(order.locale),
    dedupeKey: `${TEMPLATE_IDS.failed}:${order.email}:${order.internal_order_id}`,
    payload: {
      order_id: order.internal_order_id,
      next_step_url: order.retry_url || order.cancel_url || order.success_url
    }
  });
}

async function applyRefundPolicy({ db, env, order, providerCaptureId }) {
  const refundPolicy = String(env.REFUND_POLICY || "manual_review").toLowerCase();
  const now = nowIso();
  await updateOrder(db, order.internal_order_id, {
    payment_status: "refunded",
    fulfillment_status: refundPolicy === "revoke_immediately" ? "revoked" : "fulfilled",
    refunded_at: now,
    updated_at: now
  });

  if (refundPolicy === "revoke_immediately" && order.user_id) {
    await revokeUserMembership(db, order.user_id, now);
  }

  await queueAndSendEmail({
    db,
    env,
    templateId: TEMPLATE_IDS.refunded,
    recipientEmail: order.email,
    language: getLocale(order.locale),
    dedupeKey: `${TEMPLATE_IDS.refunded}:${order.email}:${order.internal_order_id}:${providerCaptureId || "na"}`,
    payload: {
      order_id: order.internal_order_id,
      refund_policy: refundPolicy
    }
  });
}

async function fulfillOrder({ db, env, order, request, providerCaptureId, providerSessionId, providerOrderId }) {
  let user = order.user_id ? await getUserById(db, order.user_id) : await getUserByEmail(db, order.email);

  if (order.fulfillment_status === "fulfilled" && user) {
    const magicLink = await issueMagicLink({ db, order, user, env, request });
    return {
      internal_order_id: order.internal_order_id,
      provider: order.provider,
      provider_order_id: providerOrderId || order.provider_order_id,
      provider_session_id: providerSessionId || order.provider_session_id,
      capture_id: providerCaptureId || order.provider_capture_id,
      capture_status: "COMPLETED",
      fulfillment_status: "FULFILLED",
      membership_type: user.membership_type,
      expires_at: user.expires_at,
      magic_link: magicLink.url,
      magic_link_expires_at: magicLink.expires_at
    };
  }

  const plan = planByCode(order.plan_code);
  assert(plan, "INVALID_PLAN", "Unknown membership plan.", 422);

  const baseExpiry =
    user && user.active && isFutureIso(user.expires_at)
      ? user.expires_at
      : nowIso();
  const expiresAt = daysFrom(baseExpiry, plan.durationDays);
  user = await upsertUserMembership(db, {
    email: order.email,
    membership_type: plan.code,
    membership_label: plan.label,
    preferred_language: getLocale(order.locale),
    expires_at: expiresAt,
    updated_at: nowIso()
  });

  const paidAt = nowIso();
  await updateOrder(db, order.internal_order_id, {
    user_id: user.id,
    provider_order_id: providerOrderId || order.provider_order_id,
    provider_capture_id: providerCaptureId || order.provider_capture_id,
    provider_session_id: providerSessionId || order.provider_session_id,
    payment_status: "captured",
    fulfillment_status: "fulfilled",
    paid_at: paidAt,
    updated_at: paidAt
  });

  const refreshedOrder = await getOrderByInternalId(db, order.internal_order_id);
  const magicLink = await issueMagicLink({ db, order: refreshedOrder, user, env, request });
  await sendFulfillmentEmails({
    db,
    env,
    order: refreshedOrder,
    user,
    magicLink,
    providerCaptureId: providerCaptureId || order.provider_capture_id,
    request
  });

  return {
    internal_order_id: refreshedOrder.internal_order_id,
    provider: refreshedOrder.provider,
    provider_order_id: providerOrderId || refreshedOrder.provider_order_id,
    provider_session_id: providerSessionId || refreshedOrder.provider_session_id,
    capture_id: providerCaptureId || refreshedOrder.provider_capture_id,
    capture_status: "COMPLETED",
    fulfillment_status: "FULFILLED",
    membership_type: user.membership_type,
    expires_at: user.expires_at,
    magic_link: magicLink.url,
    magic_link_expires_at: magicLink.expires_at,
    queued_email_templates: [TEMPLATE_IDS.receipt, TEMPLATE_IDS.welcome]
  };
}

function decorateResponse({ order, checkout }) {
  const body = {
    ok: true,
    internal_order_id: order.internal_order_id,
    provider: order.provider,
    plan_code: order.plan.code,
    amount: Number(order.amount),
    currency: order.currency,
    checkout_url: checkout.checkout_url,
    provider_order_id: checkout.provider_order_id || null,
    provider_session_id: checkout.provider_session_id || null,
    success_url: order.success_url,
    cancel_url: order.cancel_url,
    retry_url: order.retry_url
  };

  if (order.provider === "vietqr") {
    body.manual_transfer = {
      bank_bin: checkout.raw?.bank_bin || null,
      account_no: checkout.raw?.account_no || null,
      account_name: checkout.raw?.account_name || null,
      transfer_note: checkout.raw?.transfer_note || checkout.provider_order_id || null,
      qr_url: checkout.raw?.qr_url || checkout.checkout_url || null,
      amount: Number(order.amount),
      currency: order.currency
    };
  }

  return body;
}

async function createCheckoutForProvider({ providerCode, env, order, idempotencyKey }) {
  if (providerCode === "paypal") {
    return createPayPalCheckout(env, order, idempotencyKey);
  }

  if (providerCode === "stripe") {
    return createStripeCheckout(env, order, idempotencyKey);
  }

  if (providerCode === "vietqr") {
    return createVietQrCheckout(env, order);
  }

  const error = new Error(`${providerCode} has not been wired into runtime yet.`);
  error.status = 501;
  throw error;
}

async function finalizeProviderPayment({ order, body, env, idempotencyKey }) {
  if (order.provider === "paypal") {
    const capture = await capturePayPalOrder(env, body.provider_order_id || order.provider_order_id, idempotencyKey);
    return {
      capture_status: capture.status,
      provider_capture_id: capture.capture_id,
      provider_order_id: body.provider_order_id || order.provider_order_id,
      provider_session_id: null
    };
  }

  if (order.provider === "stripe") {
    const sessionId = body.provider_session_id || order.provider_session_id;
    const session = await retrieveStripeSession(env, sessionId);
    return {
      capture_status: session.payment_status === "paid" ? "COMPLETED" : String(session.payment_status || session.status || "PENDING").toUpperCase(),
      provider_capture_id: session.capture_id,
      provider_order_id: order.provider_order_id,
      provider_session_id: session.session_id
    };
  }

  if (order.provider === "vietqr") {
    const confirmed = Boolean(body.manual_confirmed || body.provider_ref || body.provider_capture_id);
    return {
      capture_status: confirmed ? "COMPLETED" : "PENDING",
      provider_capture_id: body.provider_capture_id || body.provider_ref || null,
      provider_order_id: order.provider_order_id,
      provider_session_id: null
    };
  }

  return {
    capture_status: "PENDING",
    provider_capture_id: null,
    provider_order_id: order.provider_order_id,
    provider_session_id: order.provider_session_id
  };
}

export async function listProvidersResponse(context) {
  return json({
    ok: true,
    providers: paymentMethodProviders(context.env).map((provider) => ({
      ...provider,
      public: providerPublicConfig(provider.code, context.env)
    })),
    environment: publicEnvironmentSummary(context.env)
  });
}

export async function listPaymentRailsResponse(context) {
  return json({
    ok: true,
    rails: paymentRailCatalog(context.env),
    policy: {
      vn_identity_requires: {
        currency: "VND",
        providers: ["vietqr", "momo", "vnpay", "zalopay"]
      },
      intl_identity_requires: {
        currency: "USD",
        providers: ["paypal", "stripe"]
      }
    }
  });
}

function requireAdminPaymentAccess(context) {
  const secret = String(context.env.PAYMENTS_ADMIN_KEY || context.env.ADMIN_PAYMENT_CONFIRM_KEY || "");
  assert(secret, "ADMIN_KEY_NOT_CONFIGURED", "Admin payment confirmation key is missing.", 503);
  const provided = String(context.request.headers.get("x-admin-key") || "");
  assert(provided, "ADMIN_KEY_REQUIRED", "x-admin-key is required.", 401);
  assert(timingSafeEqualHex(provided, secret), "ADMIN_KEY_INVALID", "Invalid admin key.", 403);
}

export async function createVietQrOrderResponse(context) {
  const body = await readJson(context.request);
  const providerBody = {
    ...(body || {}),
    provider: "vietqr"
  };
  const request = new Request(context.request.url, {
    method: "POST",
    headers: context.request.headers,
    body: JSON.stringify(providerBody)
  });
  return createCheckoutResponse({ ...context, request });
}

export async function markVietQrPendingResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const internalOrderId = String(body.internal_order_id || "").trim();
    assert(internalOrderId, "ORDER_ID_REQUIRED", "internal_order_id is required.", 422);

    const db = requireDb(context.env);
    const order = await getOrderByInternalId(db, internalOrderId);
    assert(order, "ORDER_NOT_FOUND", "Order not found.", 404);
    assert(order.provider === "vietqr", "ORDER_PROVIDER_INVALID", "Order is not a VietQR order.", 422);

    const email = normalizeEmail(body.email);
    if (email) {
      assert(email === normalizeEmail(order.email), "ORDER_EMAIL_MISMATCH", "Order email does not match.", 403);
    }

    await updateOrder(db, internalOrderId, {
      payment_status: "awaiting_confirmation",
      updated_at: nowIso()
    });
    await updateVietQrOrder(db, internalOrderId, {
      status: "awaiting_confirmation",
      awaiting_confirmation_at: nowIso(),
      updated_at: nowIso()
    });

    const vietQrOrder = await getVietQrOrderByInternalOrderId(db, internalOrderId);

    return json({
      ok: true,
      internal_order_id: internalOrderId,
      status: "awaiting_confirmation",
      transfer_note: vietQrOrder?.transfer_note || order.provider_order_id || null,
      qr_url: vietQrOrder?.qr_url || null
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "VIETQR_MARK_PENDING_FAILED", error.message || "Unable to mark VietQR payment pending.");
  }
}

export async function listVietQrOrdersResponse(context) {
  try {
    requireAdminPaymentAccess(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const status = String(url.searchParams.get("status") || "awaiting_confirmation").trim();
    const limit = Number(url.searchParams.get("limit") || 50);
    const orders = await listVietQrOrders(db, {
      status: status === "all" ? null : status,
      limit
    });
    return json({
      ok: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "VIETQR_LIST_FAILED", error.message || "Unable to list VietQR orders.");
  }
}

export async function confirmVietQrOrderResponse(context) {
  try {
    requireAdminPaymentAccess(context);
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const internalOrderId = String(body.internal_order_id || "").trim();
    assert(internalOrderId, "ORDER_ID_REQUIRED", "internal_order_id is required.", 422);
    const providerRef = String(body.provider_ref || "").trim() || `vietqr_${internalOrderId}`;

    const db = requireDb(context.env);
    const order = await getOrderByInternalId(db, internalOrderId);
    assert(order, "ORDER_NOT_FOUND", "Order not found.", 404);
    assert(order.provider === "vietqr", "ORDER_PROVIDER_INVALID", "Order is not a VietQR order.", 422);

    if (order.fulfillment_status === "fulfilled") {
      return json({
        ok: true,
        internal_order_id: internalOrderId,
        provider: "vietqr",
        status: "already_confirmed",
        provider_ref: order.provider_capture_id || providerRef
      });
    }

    const finalized = await finalizeProviderPayment({
      order,
      body: {
        manual_confirmed: true,
        provider_ref: providerRef
      },
      env: context.env,
      idempotencyKey: context.request.headers.get("x-idempotency-key") || randomId("vietqr_confirm")
    });

    assert(finalized.capture_status === "COMPLETED", "VIETQR_CONFIRM_FAILED", "Unable to confirm VietQR payment.", 409);

    const fulfilled = await fulfillOrder({
      db,
      env: context.env,
      order,
      request: context.request,
      providerCaptureId: finalized.provider_capture_id || providerRef,
      providerOrderId: finalized.provider_order_id || order.provider_order_id
    });

    await updateVietQrOrder(db, internalOrderId, {
      status: "confirmed",
      provider_ref: providerRef,
      confirmed_by: String(context.request.headers.get("x-admin-user") || body.confirmed_by || "admin").slice(0, 120),
      confirmation_note: String(body.confirmation_note || "").slice(0, 240) || null,
      confirmed_at: nowIso(),
      updated_at: nowIso()
    });

    return json({
      ok: true,
      internal_order_id: internalOrderId,
      provider: "vietqr",
      capture_status: "COMPLETED",
      fulfillment_status: fulfilled.fulfillment_status,
      provider_ref: providerRef,
      magic_link: fulfilled.magic_link || null,
      queued_email_templates: fulfilled.queued_email_templates || []
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "VIETQR_CONFIRM_FAILED", error.message || "Unable to confirm VietQR payment.");
  }
}

export async function createCheckoutResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const providerCode = String(body.provider || "").trim().toLowerCase();
    const provider = providerByCode(providerCode);
    assert(provider, "PROVIDER_UNSUPPORTED", "Unsupported payment provider.", 422);

    const plan = planByCode(body.plan_code);
    assert(plan, "PLAN_INVALID", "Unsupported plan code.", 422);
    const rail = resolvePaymentRail({
      identityCountry: body.identity_country,
      providerCode
    });
    assert(rail.allowed, rail.code || "PAYMENT_RAIL_INVALID", rail.message || "Payment rail is not allowed for this identity country.", 422);
    assert(providerSecretsReady(provider, context.env), "PROVIDER_NOT_READY", `${provider.label} is not configured yet.`, 409);

    const email = normalizeEmail(body.email);
    assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required.", 422);

    const idempotencyKey = context.request.headers.get("x-idempotency-key");
    assert(idempotencyKey, "IDEMPOTENCY_REQUIRED", "X-Idempotency-Key is required.", 400);

    const db = requireDb(context.env);
    const requestHash = await sha256Hex(JSON.stringify(body));
    const route = "/api/payments/create-checkout";
    const existing = await findIdempotency(db, route, idempotencyKey);
    if (idempotencyConflict(existing, requestHash)) {
      return errorResponse(409, "IDEMPOTENCY_CONFLICT", "This idempotency key was already used with different payload.");
    }
    if (existing) {
      return json(existing.response_json, { status: existing.status_code });
    }

    const locale = getLocale(body.locale);
    const internalOrderId = randomId("ord");
    const returnUrls = buildReturnUrls({
      request: context.request,
      env: context.env,
      locale,
      internalOrderId,
      successUrl: body.success_url,
      cancelUrl: body.cancel_url,
      retryUrl: body.retry_url,
      providerCode
    });

    const order = {
      internal_order_id: internalOrderId,
      email,
      provider: providerCode,
      plan,
      amount: planAmountForCurrency(plan, rail.currency),
      currency: rail.currency,
      locale,
      success_url: returnUrls.success_url,
      cancel_url: returnUrls.cancel_url,
      retry_url: returnUrls.retry_url,
      metadata_json: {
        next_path: normalizeNextPath(body.next_path, locale),
        source: "join",
        identity_country: rail.territory,
        identity_ref: String(body.identity_ref || "").trim().slice(0, 80) || null,
        raw_metadata: body.metadata || {}
      }
    };

    const checkout = await createCheckoutForProvider({
      providerCode,
      env: context.env,
      order,
      idempotencyKey
    });

    await createOrder(db, {
      internal_order_id: internalOrderId,
      email,
      locale,
      provider: providerCode,
      plan_code: plan.code,
      amount: order.amount,
      currency: order.currency,
      provider_order_id: checkout.provider_order_id || null,
      provider_session_id: checkout.provider_session_id || null,
      payment_status: "created",
      fulfillment_status: "not_fulfilled",
      success_url: returnUrls.success_url,
      cancel_url: returnUrls.cancel_url,
      retry_url: returnUrls.retry_url,
      metadata_json: order.metadata_json,
      idempotency_key_create: idempotencyKey,
      created_at: nowIso(),
      updated_at: nowIso()
    });

    if (providerCode === "vietqr") {
      await createVietQrOrder(db, {
        internal_order_id: internalOrderId,
        email,
        locale,
        plan_code: plan.code,
        amount: Math.round(order.amount),
        currency: "VND",
        transfer_note: checkout.raw?.transfer_note || checkout.provider_order_id,
        bank_bin: checkout.raw?.bank_bin || String(context.env.VIETQR_BANK_BIN || ""),
        account_no: checkout.raw?.account_no || String(context.env.VIETQR_ACCOUNT_NO || ""),
        account_name: checkout.raw?.account_name || String(context.env.VIETQR_ACCOUNT_NAME || ""),
        qr_url: checkout.raw?.qr_url || checkout.checkout_url,
        status: "pending",
        created_at: nowIso(),
        updated_at: nowIso()
      });
    }

    const responseBody = decorateResponse({ order, checkout });
    await storeIdempotency(db, {
      route,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      status_code: 201,
      response_json: responseBody,
      created_at: nowIso()
    });

    return json(responseBody, { status: 201 });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "CREATE_CHECKOUT_FAILED", error.message || "Payment creation failed.");
  }
}

export async function finalizeCheckoutResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const db = requireDb(context.env);

    const internalOrderId = String(body.internal_order_id || "").trim();
    assert(internalOrderId, "ORDER_ID_REQUIRED", "internal_order_id is required.", 422);

    const idempotencyKey = context.request.headers.get("x-idempotency-key");
    assert(idempotencyKey, "IDEMPOTENCY_REQUIRED", "X-Idempotency-Key is required.", 400);

    const route = "/api/payments/finalize";
    const requestHash = await sha256Hex(JSON.stringify(body));
    const existing = await findIdempotency(db, route, idempotencyKey);
    if (idempotencyConflict(existing, requestHash)) {
      return errorResponse(409, "IDEMPOTENCY_CONFLICT", "This idempotency key was already used with different payload.");
    }
    if (existing) {
      return json(existing.response_json, { status: existing.status_code });
    }

    const order = await getOrderByInternalId(db, internalOrderId);
    assert(order, "ORDER_NOT_FOUND", "Order not found.", 404);

    const finalized = await finalizeProviderPayment({
      order,
      body,
      env: context.env,
      idempotencyKey
    });

    let responseBody;
    if (finalized.capture_status === "COMPLETED") {
      responseBody = await fulfillOrder({
        db,
        env: context.env,
        order,
        request: context.request,
        providerCaptureId: finalized.provider_capture_id,
        providerSessionId: finalized.provider_session_id,
        providerOrderId: finalized.provider_order_id
      });
      if (order.provider === "vietqr") {
        await updateVietQrOrder(db, order.internal_order_id, {
          status: "confirmed",
          provider_ref: finalized.provider_capture_id || finalized.provider_order_id || null,
          confirmed_at: nowIso(),
          updated_at: nowIso()
        });
      }
    } else if (finalized.capture_status === "DENIED") {
      await markPaymentFailed({ db, env: context.env, order });
      responseBody = {
        ok: true,
        internal_order_id: order.internal_order_id,
        provider: order.provider,
        capture_status: "DENIED",
        fulfillment_status: "NOT_FULFILLED"
      };
      if (order.provider === "vietqr") {
        await updateVietQrOrder(db, order.internal_order_id, {
          status: "expired",
          updated_at: nowIso()
        });
      }
    } else {
      await updateOrder(db, order.internal_order_id, {
        payment_status: "pending",
        updated_at: nowIso()
      });
      responseBody = {
        ok: true,
        internal_order_id: order.internal_order_id,
        provider: order.provider,
        capture_status: finalized.capture_status,
        fulfillment_status: "PENDING"
      };
      if (order.provider === "vietqr") {
        await updateVietQrOrder(db, order.internal_order_id, {
          status: "awaiting_confirmation",
          awaiting_confirmation_at: nowIso(),
          updated_at: nowIso()
        });
      }
    }

    await storeIdempotency(db, {
      route,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      status_code: 200,
      response_json: responseBody,
      created_at: nowIso()
    });

    return json(responseBody);
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "FINALIZE_FAILED", error.message || "Payment finalize failed.");
  }
}

export async function resendMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const email = normalizeEmail(body.email);
    assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required.", 422);

    const db = requireDb(context.env);
    const user = await getUserByEmail(db, email);
    if (!user) {
      return json({
        ok: true,
        queued: true,
        template_id: TEMPLATE_IDS.resend,
        expires_in_minutes: 15
      });
    }

    const locale = getLocale(body.locale || user.preferred_language);
    const order = {
      email: user.email,
      locale,
      metadata_json: {
        next_path: normalizeNextPath(body.next_path, locale)
      }
    };
    const magicLink = await issueMagicLink({
      db,
      order,
      user,
      env: context.env,
      request: context.request
    });

    await queueAndSendEmail({
      db,
      env: context.env,
      templateId: TEMPLATE_IDS.resend,
      recipientEmail: user.email,
      language: locale,
      dedupeKey: `${TEMPLATE_IDS.resend}:${user.email}:${magicLink.expires_at}`,
      payload: {
        magic_link: magicLink.url,
        magic_link_expire_minutes: 15
      }
    });

    return json({
      ok: true,
      queued: true,
      template_id: TEMPLATE_IDS.resend,
      expires_in_minutes: 15
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_RESEND_FAILED", error.message || "Unable to resend magic link.");
  }
}

export async function consumeMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const token = String(body.token || "").trim();
    assert(token, "TOKEN_REQUIRED", "Magic token is required.", 422);

    const db = requireDb(context.env);
    const tokenHash = await sha256Hex(token);
    const magicLink = await getMagicLinkByHash(db, tokenHash);
    assert(magicLink, "MAGIC_NOT_FOUND", "Magic link was not found.", 404);
    assert(!magicLink.used_at, "MAGIC_USED", "Magic link was already used.", 409);
    assert(new Date(magicLink.expires_at).getTime() > Date.now(), "MAGIC_EXPIRED", "Magic link has expired.", 410);

    const user = magicLink.user_id ? await getUserById(db, magicLink.user_id) : await getUserByEmail(db, magicLink.email);
    assert(user && user.active, "MEMBERSHIP_INACTIVE", "Membership is inactive.", 403);

    await markMagicLinkUsed(db, magicLink.id, nowIso());

    return json({
      ok: true,
      session: {
        id: randomId("sess"),
        email: user.email,
        membershipType: user.membership_type,
        membershipLabel: user.membership_label,
        expiresAt: user.expires_at,
        startedAt: nowIso()
      },
      next_path: normalizeNextPath(body.next_path || magicLink.redirect_path, user.preferred_language)
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_CONSUME_FAILED", error.message || "Unable to consume magic link.");
  }
}

export async function paypalWebhookResponse(context) {
  try {
    const db = requireDb(context.env);
    const rawBody = await context.request.text();
    let event = {};

    try {
      event = JSON.parse(rawBody || "{}");
    } catch (_error) {
      return errorResponse(400, "INVALID_JSON", "Invalid webhook payload.");
    }

    const eventId = event.id;
    const eventType = event.event_type;
    if (!eventId || !eventType) {
      return errorResponse(400, "INVALID_EVENT", "Webhook payload is missing id or event_type.");
    }

    const existing = await getWebhookByEventId(db, eventId);
    if (existing?.processed) {
      return json({ ok: true, accepted: true, event_id: eventId }, { status: 202 });
    }

    const headers = serializeHeaders(context.request.headers);
    const paypalProvider = providerByCode("paypal");
    if (!providerSecretsReady(paypalProvider, context.env)) {
      if (!existing) {
        await recordWebhook(db, {
          provider: "paypal",
          event_id: eventId,
          event_type: eventType,
          signature_valid: false,
          headers_json: headers,
          payload_json: event,
          processed: false,
          received_at: nowIso(),
          error_code: "PAYPAL_NOT_CONFIGURED",
          error_detail: "PayPal webhook secrets are missing."
        });
      } else {
        await updateWebhook(db, eventId, {
          signature_valid: false,
          headers_json: headers,
          payload_json: event,
          error_code: "PAYPAL_NOT_CONFIGURED",
          error_detail: "PayPal webhook secrets are missing."
        });
      }
      return errorResponse(503, "PAYPAL_NOT_CONFIGURED", "PayPal webhook secrets are missing.");
    }

    const signatureValid = await verifyPayPalWebhook(context.env, headers, event);

    if (!existing) {
      await recordWebhook(db, {
        provider: "paypal",
        event_id: eventId,
        event_type: eventType,
        signature_valid: signatureValid,
        headers_json: headers,
        payload_json: event,
        processed: false,
        received_at: nowIso()
      });
    } else {
      await updateWebhook(db, eventId, {
        signature_valid: signatureValid,
        headers_json: headers,
        payload_json: event
      });
    }

    if (!signatureValid) {
      return errorResponse(401, "WEBHOOK_SIGNATURE_INVALID", "Invalid PayPal webhook signature.");
    }

    const orderId = buildOrderLookup(event);
    const captureId = buildCaptureLookup(event);
    const order =
      (orderId && (await getOrderByProviderOrderId(db, "paypal", orderId))) ||
      (captureId && (await getOrderByCaptureId(db, "paypal", captureId)));

    if (eventType === "PAYMENT.CAPTURE.COMPLETED" && order) {
      await fulfillOrder({
        db,
        env: context.env,
        order,
        request: context.request,
        providerCaptureId: captureId,
        providerOrderId: orderId || order.provider_order_id
      });
    } else if (eventType === "PAYMENT.CAPTURE.DENIED" && order) {
      await markPaymentFailed({ db, env: context.env, order });
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED" && order) {
      await applyRefundPolicy({
        db,
        env: context.env,
        order,
        providerCaptureId: captureId
      });
    }

    await updateWebhook(db, eventId, {
      processed: true,
      processed_at: nowIso()
    });

    return json({ ok: true, accepted: true, event_id: eventId }, { status: 202 });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "PAYPAL_WEBHOOK_FAILED", error.message || "PayPal webhook handling failed.");
  }
}

export async function stripeWebhookResponse(context) {
  try {
    const db = requireDb(context.env);
    const rawBody = await context.request.text();
    const signatureHeader = context.request.headers.get("stripe-signature");
    const signatureValid = await verifyStripeWebhook(rawBody, signatureHeader, context.env.STRIPE_WEBHOOK_SECRET);

    let event = {};
    try {
      event = JSON.parse(rawBody || "{}");
    } catch (_error) {
      return errorResponse(400, "INVALID_JSON", "Invalid webhook payload.");
    }

    const eventId = event.id;
    const eventType = event.type;
    if (!eventId || !eventType) {
      return errorResponse(400, "INVALID_EVENT", "Webhook payload is missing id or type.");
    }

    const existing = await getWebhookByEventId(db, eventId);
    if (existing?.processed) {
      return json({ ok: true, received: true, event_id: eventId });
    }

    const headers = serializeHeaders(context.request.headers);
    if (!existing) {
      await recordWebhook(db, {
        provider: "stripe",
        event_id: eventId,
        event_type: eventType,
        signature_valid: signatureValid,
        headers_json: headers,
        payload_json: event,
        processed: false,
        received_at: nowIso()
      });
    }

    if (!signatureValid) {
      return errorResponse(400, "WEBHOOK_SIGNATURE_INVALID", "Invalid Stripe webhook signature.");
    }

    const sessionId = event.data?.object?.id || null;
    const captureId = buildCaptureLookup(event);
    const internalOrderId = buildOrderLookup(event);
    const order =
      (sessionId && (await getOrderByProviderSessionId(db, "stripe", sessionId))) ||
      (internalOrderId && (await getOrderByInternalId(db, internalOrderId))) ||
      (captureId && (await getOrderByCaptureId(db, "stripe", captureId)));

    if ((eventType === "checkout.session.completed" || eventType === "checkout.session.async_payment_succeeded") && order) {
      const paymentStatus = event.data?.object?.payment_status;
      if (paymentStatus === "paid" || eventType === "checkout.session.async_payment_succeeded") {
        await fulfillOrder({
          db,
          env: context.env,
          order,
          request: context.request,
          providerCaptureId: captureId,
          providerSessionId: sessionId
        });
      }
    } else if ((eventType === "checkout.session.async_payment_failed" || eventType === "checkout.session.expired") && order) {
      await markPaymentFailed({ db, env: context.env, order });
    } else if (eventType === "charge.refunded" && order) {
      await applyRefundPolicy({
        db,
        env: context.env,
        order,
        providerCaptureId: captureId
      });
    }

    await updateWebhook(db, eventId, {
      processed: true,
      processed_at: nowIso(),
      signature_valid: true,
      headers_json: headers,
      payload_json: event
    });

    return json({ ok: true, received: true, event_id: eventId });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "STRIPE_WEBHOOK_FAILED", error.message || "Stripe webhook handling failed.");
  }
}

export async function healthSummaryResponse(context) {
  return json({
    ok: true,
    providers: paymentMethodProviders(context.env),
    environment: publicEnvironmentSummary(context.env),
    plans: Object.values(PLANS).map((plan) => ({
      code: plan.code,
      price_usd: plan.priceUsd,
      price_vnd: plan.priceVnd,
      duration_days: plan.durationDays
    }))
  });
}
