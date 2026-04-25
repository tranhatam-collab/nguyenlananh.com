const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function nowIso() {
  return new Date().toISOString();
}

export function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  Object.entries(JSON_HEADERS).forEach(([key, value]) => {
    if (!headers.has(key)) headers.set(key, value);
  });
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers
  });
}

export function errorResponse(status, code, message, extra = {}) {
  return json(
    {
      ok: false,
      code,
      message,
      ...extra
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (_error) {
    return null;
  }
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function randomId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function randomToken(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(input) {
  const data = new TextEncoder().encode(String(input));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function safeJsonParse(value, fallback = null) {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

export function timingSafeEqualHex(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export function getLocale(input) {
  const normalized = String(input || "").toLowerCase();
  if (normalized.startsWith("en")) return "en-US";
  return "vi";
}

export function localeToDashboardPath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/members/dashboard/" : "/members/dashboard/";
}

export function localeToJoinPath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/join/" : "/join/";
}

export function localeToReturnPath(locale = "vi", status = "success") {
  const base = getLocale(locale) === "en-US" ? "/en/join" : "/join";
  return `${base}/${status}/`;
}

export function buildAbsoluteUrl(origin, pathOrUrl) {
  try {
    return new URL(pathOrUrl, origin).toString();
  } catch (_error) {
    return new URL("/", origin).toString();
  }
}

export function withQuery(urlString, params) {
  const url = new URL(urlString);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

export function daysFrom(baseIso, days) {
  const base = baseIso ? new Date(baseIso) : new Date();
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function parseIsoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFutureIso(value) {
  const date = parseIsoOrNull(value);
  return Boolean(date && date.getTime() > Date.now());
}

export function assert(value, code, message, status = 400) {
  if (value) return;
  const error = new Error(message);
  error.code = code;
  error.status = status;
  throw error;
}

export function normalizeNextPath(value, locale = "vi") {
  const fallback = localeToDashboardPath(locale);
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (!/^(\/(en\/)?members(\/|$))/.test(value)) return fallback;
  return value;
}

export function publicEnvironmentSummary(env) {
  return {
    api_base_url: env.API_BASE_URL || null,
    deploy_target: env.ENV_DEPLOY_TARGET || "cloudflare-pages",
    email_provider: env.EMAIL_PROVIDER || "pending",
    refund_policy: env.REFUND_POLICY || "manual_review",
    db_ready: Boolean(env.PAYMENTS_DB)
  };
}
