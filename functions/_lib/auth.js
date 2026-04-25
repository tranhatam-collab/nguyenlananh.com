import { TEMPLATE_IDS } from "./constants.js";
import { sendTemplateEmailDirect } from "./email.js";
import {
  assert,
  buildAbsoluteUrl,
  errorResponse,
  getLocale,
  json,
  normalizeEmail,
  normalizeNextPath,
  nowIso,
  randomId,
  readJson,
  timingSafeEqualHex,
  withQuery
} from "./utils.js";

function membersStartPath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/members/start/" : "/members/start/";
}

function membershipLabel(locale = "vi") {
  return getLocale(locale) === "en-US" ? "Free Companion" : "Đồng hành miễn phí";
}

function magicSecret(env) {
  return env.MAGIC_LINK_SECRET || env.RESEND_API_KEY || env.EMAIL_FROM_SYSTEM || env.PAYPAL_MERCHANT_EMAIL || "nla-magic-link";
}

function base64UrlEncode(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const normalized = String(value || "")
    .replaceAll("-", "+")
    .replaceAll("_", "/")
    .padEnd(Math.ceil(String(value || "").length / 4) * 4, "=");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signMagicPayload(payload, env) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256Hex(magicSecret(env), encoded);
  return `${encoded}.${signature}`;
}

async function verifyMagicToken(token, env) {
  const [encoded, signature] = String(token || "").split(".");
  assert(encoded && signature, "TOKEN_INVALID", "Magic link is invalid.", 422);

  const expected = await hmacSha256Hex(magicSecret(env), encoded);
  assert(timingSafeEqualHex(signature, expected), "TOKEN_INVALID", "Magic link is invalid.", 422);

  let payload = {};
  try {
    payload = JSON.parse(base64UrlDecode(encoded));
  } catch (_error) {
    assert(false, "TOKEN_INVALID", "Magic link is invalid.", 422);
  }

  assert(Number(payload.exp || 0) > Date.now(), "MAGIC_EXPIRED", "Magic link has expired.", 410);
  return payload;
}

export async function signupMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const email = normalizeEmail(body.email);
    assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required.", 422);

    const locale = getLocale(body.locale);
    const nextPath = normalizeNextPath(body.next_path || membersStartPath(locale), locale);
    const issuedAt = Date.now();
    const expiresInMinutes = 20;
    const payload = {
      email,
      locale,
      membership_type: "free",
      membership_label: membershipLabel(locale),
      next_path: nextPath,
      iat: issuedAt,
      exp: issuedAt + expiresInMinutes * 60 * 1000
    };

    const token = await signMagicPayload(payload, context.env);
    const origin = new URL(context.request.url).origin;
    const magicLink = withQuery(buildAbsoluteUrl(origin, membersStartPath(locale)), {
      magic: token,
      next: nextPath
    });

    const delivery = await sendTemplateEmailDirect({
      env: context.env,
      templateId: TEMPLATE_IDS.resend,
      recipientEmail: email,
      language: locale,
      payload: {
        magic_link: magicLink,
        magic_link_expire_minutes: expiresInMinutes
      }
    });

    return json({
      ok: true,
      email,
      expires_in_minutes: expiresInMinutes,
      delivery_status: delivery.status,
      preview_magic_link: delivery.status === "sent" ? null : magicLink
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_SIGNUP_FAILED", error.message || "Unable to send magic link.");
  }
}

export async function consumeStatelessMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const token = String(body.token || "").trim();
    assert(token, "TOKEN_REQUIRED", "Magic token is required.", 422);

    const payload = await verifyMagicToken(token, context.env);
    const locale = getLocale(body.locale || payload.locale);
    const nextPath = normalizeNextPath(body.next_path || payload.next_path || membersStartPath(locale), locale);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    return json({
      ok: true,
      session: {
        id: randomId("sess"),
        email: payload.email,
        membershipType: payload.membership_type || "free",
        membershipLabel: payload.membership_label || membershipLabel(locale),
        startedAt: nowIso(),
        expiresAt
      },
      next_path: nextPath
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_CONSUME_FAILED", error.message || "Unable to consume magic link.");
  }
}
