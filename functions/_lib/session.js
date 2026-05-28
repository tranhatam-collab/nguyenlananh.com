import { base64UrlDecodeJson, base64UrlEncodeJson, daysFrom, nowIso, sha256Hex } from "./utils.js";

const SESSION_COOKIE_NAME = "__nla_session";
const SESSION_TTL_DAYS = 30;

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64UrlEncodeJson({ __sig: Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("") });
}

export async function signJwt(secret, payload) {
  const header = base64UrlEncodeJson({ alg: "HS256", typ: "JWT" });
  const body = base64UrlEncodeJson(payload);
  const signature = await sha256Hex(`${header}.${body}.${secret}`);
  return `${header}.${body}.${signature}`;
}

export async function verifyJwt(secret, token) {
  if (!token || typeof token !== "string" || token.split(".").length !== 3) return null;
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) return null;
  const expected = await sha256Hex(`${header}.${body}.${secret}`);
  if (expected !== signature) return null;
  const payload = base64UrlDecodeJson(body);
  if (!payload || typeof payload !== "object") return null;
  const exp = Number(payload.exp || 0);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export async function createSessionCookie(env, user) {
  const secret = String(env.MAGIC_LINK_SECRET || "").trim();
  if (!secret) return null;
  const now = new Date();
  const payload = {
    sub: user.id,
    email: user.email,
    membership_type: user.membership_type || "free",
    membership_label: user.membership_label || "Đồng hành miễn phí",
    preferred_language: user.preferred_language || "vi",
    role: user.role || "user",
    expires_at: user.expires_at,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(now.getTime() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60
  };
  return signJwt(secret, payload);
}

export async function parseSessionCookie(env, cookieHeader) {
  if (!cookieHeader) return null;
  const secret = String(env.MAGIC_LINK_SECRET || "").trim();
  if (!secret) return null;
  const cookies = String(cookieHeader).split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      const value = cookie.slice(`${SESSION_COOKIE_NAME}=`.length);
      return verifyJwt(secret, decodeURIComponent(value));
    }
  }
  return null;
}

export function sessionCookieHeaders(value, options = {}) {
  const secure = options.secure !== false ? "; Secure" : "";
  const sameSite = options.sameSite || "Lax";
  const httpOnly = options.httpOnly !== false ? "; HttpOnly" : "";
  const maxAge = SESSION_TTL_DAYS * 24 * 60 * 60;
  return {
    "Set-Cookie": `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}${httpOnly}${secure}; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}`
  };
}

export async function requireSession(context) {
  const { request, env } = context;
  const cookieHeader = request.headers.get("Cookie");
  const session = await parseSessionCookie(env, cookieHeader);
  if (!session) {
    const error = new Error("Session required.");
    error.code = "SESSION_REQUIRED";
    error.status = 401;
    throw error;
  }
  return session;
}
