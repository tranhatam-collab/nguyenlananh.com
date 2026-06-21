import { TEMPLATE_IDS } from "./constants.js";

function productWelcomeTemplateFor(source) {
  const map = {
    loop: TEMPLATE_IDS.product_loop_welcome,
    space: TEMPLATE_IDS.product_space_welcome,
    capital: TEMPLATE_IDS.product_capital_welcome,
    creative: TEMPLATE_IDS.product_creative_welcome,
    family: TEMPLATE_IDS.product_family_welcome
  };
  return map[source] || null;
}

function productDeepUrlFor(source, locale) {
  const isEn = getLocale(locale) === "en-US";
  const prefix = isEn ? "https://www.nguyenlananh.com/en" : "https://www.nguyenlananh.com";
  const map = {
    loop: `${prefix}/members/deep/ban-do-vong-lap/`,
    space: `${prefix}/members/deep/tai-thiet-khong-gian/`,
    capital: `${prefix}/members/deep/dau-tu-noi-tai/`,
    creative: `${prefix}/members/deep/xuong-sang-tao/`,
    family: `${prefix}/members/deep/gia-dinh-va-goc-re/`
  };
  return map[source] || "";
}

function productArticleUrlFor(source, locale) {
  const isEn = getLocale(locale) === "en-US";
  const prefix = isEn ? "https://www.nguyenlananh.com/en" : "https://www.nguyenlananh.com";
  const map = {
    loop: `${prefix}/bai-viet/ban-do-vong-lap-ca-nhan/`,
    space: `${prefix}/bai-viet/tai-thiet-khong-gian-song/`,
    capital: `${prefix}/bai-viet/kinh-te-cua-su-ro-rang/`,
    creative: `${prefix}/bai-viet/lao-dong-sang-tao-he-van-hanh/`,
    family: `${prefix}/bai-viet/he-gia-dinh-va-goc-re/`
  };
  return map[source] || "";
}

import { createMagicLink, getMagicLinkByHash, getUserByEmail, getUserById, markMagicLinkUsed, requireDb, upsertUserMembership } from "./db.js";
import { createSessionCookie, sessionCookieHeaders } from "./session.js";
import { sendTemplateEmailDirect } from "./email.js";
import { checkMagicLinkRateLimit, rateLimitResponse } from "./ratelimit.js";
import { logError } from "./log.js";
import {
  assert,
  base64UrlDecodeJson,
  base64UrlEncodeJson,
  buildAbsoluteUrl,
  daysFrom,
  errorResponse,
  getLocale,
  json,
  normalizeEmail,
  normalizeNextPath,
  nowIso,
  randomId,
  randomToken,
  readJson,
  sha256Hex,
  timingSafeEqualHex,
  withQuery
} from "./utils.js";

function membersStartPath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/members/start/" : "/members/start/";
}

function membershipLabel(locale = "vi") {
  return getLocale(locale) === "en-US" ? "Free Companion" : "Đồng hành miễn phí";
}

const MAGIC_LINK_EXPIRE_MINUTES = 20;
const GOOGLE_OAUTH_STATE_TTL_SECONDS = 10 * 60;
const FREE_MEMBERSHIP_DAYS = 365;

async function ensureCompanionUser(db, email, locale, productSource) {
  const existing = await getUserByEmail(db, email);
  if (existing) return existing;

  const now = nowIso();
  return upsertUserMembership(db, {
    email,
    membership_type: "free",
    membership_label: membershipLabel(locale),
    preferred_language: getLocale(locale),
    product_source: productSource || null,
    expires_at: daysFrom(now, FREE_MEMBERSHIP_DAYS),
    created_at: now,
    updated_at: now
  });
}

async function issueMagicLinkToken({ db, user, email, nextPath, locale, request, productSource }) {
  const rawToken = randomToken(24);
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRE_MINUTES * 60 * 1000).toISOString();

  await createMagicLink(db, {
    user_id: user?.id || null,
    email,
    token_hash: tokenHash,
    redirect_path: nextPath,
    product_source: productSource,
    expires_at: expiresAt,
    created_at: nowIso()
  });

  const origin = new URL(request.url).origin;
  return {
    url: withQuery(buildAbsoluteUrl(origin, membersStartPath(locale)), {
      magic: rawToken,
      next: nextPath
    }),
    expires_at: expiresAt
  };
}

async function createSignedOauthState(secret, payload) {
  const encoded = base64UrlEncodeJson(payload);
  const signature = await sha256Hex(`${encoded}.${secret}`);
  return `${encoded}.${signature}`;
}

async function verifySignedOauthState(secret, stateToken) {
  const [encoded, signature] = String(stateToken || "").split(".");
  if (!encoded || !signature) return null;
  const expected = await sha256Hex(`${encoded}.${secret}`);
  if (!timingSafeEqualHex(expected, signature)) return null;
  const payload = base64UrlDecodeJson(encoded);
  if (!payload || typeof payload !== "object") return null;
  const exp = Number(payload.exp || 0);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function googleOauthConfig(env, request) {
  const missing = [];
  const clientId = String(env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(env.GOOGLE_CLIENT_SECRET || "").trim();
  const defaultRedirect = new URL("/api/auth/google/callback", request.url).toString();
  const redirectUri = String(env.GOOGLE_REDIRECT_URI || defaultRedirect).trim();
  const stateSecret = String(env.GOOGLE_OAUTH_STATE_SECRET || "").trim();

  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!redirectUri) missing.push("GOOGLE_REDIRECT_URI");
  if (!stateSecret) missing.push("GOOGLE_OAUTH_STATE_SECRET or MAGIC_LINK_SECRET");

  return {
    ready: missing.length === 0,
    missing,
    clientId,
    clientSecret,
    redirectUri,
    stateSecret
  };
}

export async function googleOAuthStartResponse(context) {
  try {
    const cfg = googleOauthConfig(context.env, context.request);
    if (!cfg.ready) {
      return errorResponse(501, "GOOGLE_NOT_CONFIGURED", "Google OAuth is not configured.", {
        missing: cfg.missing
      });
    }

    const url = new URL(context.request.url);
    const locale = getLocale(url.searchParams.get("locale") || "vi");
    const nextPath = normalizeNextPath(url.searchParams.get("next_path") || membersStartPath(locale), locale);
    const state = await createSignedOauthState(cfg.stateSecret, {
      nonce: randomId("gstate"),
      locale,
      next_path: nextPath,
      product_source: url.searchParams.get("source") || null,
      exp: Math.floor(Date.now() / 1000) + GOOGLE_OAUTH_STATE_TTL_SECONDS
    });

    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", cfg.clientId);
    googleUrl.searchParams.set("redirect_uri", cfg.redirectUri);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "openid email profile");
    googleUrl.searchParams.set("state", state);
    googleUrl.searchParams.set("prompt", "select_account");

    return Response.redirect(googleUrl.toString(), 302);
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "GOOGLE_START_FAILED", error.message || "Unable to start Google OAuth.");
  }
}

export async function googleOAuthCallbackResponse(context) {
  try {
    const cfg = googleOauthConfig(context.env, context.request);
    if (!cfg.ready) {
      return errorResponse(501, "GOOGLE_NOT_CONFIGURED", "Google OAuth is not configured.", {
        missing: cfg.missing
      });
    }

    const callbackUrl = new URL(context.request.url);
    const oauthError = callbackUrl.searchParams.get("error");
    if (oauthError) {
      return errorResponse(401, "GOOGLE_PROVIDER_ERROR", "Google OAuth provider returned an error.", {
        provider_error: oauthError
      });
    }

    const code = String(callbackUrl.searchParams.get("code") || "").trim();
    const stateToken = String(callbackUrl.searchParams.get("state") || "").trim();
    assert(code, "GOOGLE_CODE_REQUIRED", "Google authorization code is required.", 422);
    assert(stateToken, "GOOGLE_STATE_REQUIRED", "Google state is required.", 422);

    const state = await verifySignedOauthState(cfg.stateSecret, stateToken);
    assert(state, "GOOGLE_STATE_INVALID", "Google state is invalid or expired.", 401);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: cfg.redirectUri,
        grant_type: "authorization_code"
      }).toString()
    });
    const tokenPayload = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !tokenPayload.access_token) {
      const googleError = tokenPayload.error || "unknown";
      const googleDesc = tokenPayload.error_description || "";
      console.error("[google-oauth] token exchange failed:", {
        status: tokenResponse.status,
        googleError,
        googleDesc,
        redirectUri: cfg.redirectUri,
        clientIdPrefix: cfg.clientId.slice(0, 8) + "..."
      });
      const err = new Error(googleDesc || "Token exchange failed.");
      err.code = `GOOGLE_TOKEN_FAILED_${googleError}`;
      err.status = 401;
      throw err;
    }

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        authorization: `Bearer ${tokenPayload.access_token}`
      }
    });
    const profilePayload = await profileResponse.json().catch(() => ({}));
    if (!profileResponse.ok) {
      console.error("[google-oauth] profile fetch failed:", { status: profileResponse.status });
      const err = new Error("Unable to fetch Google profile.");
      err.code = "GOOGLE_PROFILE_FAILED";
      err.status = 401;
      throw err;
    }

    const email = normalizeEmail(profilePayload.email);
    assert(email && email.includes("@"), "GOOGLE_EMAIL_MISSING", "Google account email is missing.", 422);
    assert(profilePayload.email_verified !== false, "GOOGLE_EMAIL_UNVERIFIED", "Google account email is not verified.", 403);

    const locale = getLocale(state.locale || profilePayload.locale || "vi");
    const db = requireDb(context.env);
    const user = await ensureCompanionUser(db, email, locale, state.product_source || null);
    const nextPath = normalizeNextPath(state.next_path || membersStartPath(locale), locale);

    // Update product_source if provided in OAuth state
    if (state.product_source && !user.product_source) {
      await db.prepare("UPDATE users SET product_source = ?, updated_at = ? WHERE id = ?")
        .bind(state.product_source, nowIso(), user.id)
        .run();
      user.product_source = state.product_source;
    }

    // Send product welcome email (non-blocking)
    const productWelcomeTemplate = productWelcomeTemplateFor(user.product_source);
    if (productWelcomeTemplate) {
      try {
        await sendTemplateEmailDirect({
          env: context.env,
          templateId: productWelcomeTemplate,
          recipientEmail: user.email,
          language: locale,
          payload: {
            deep_url: productDeepUrlFor(user.product_source, locale),
            article_url: productArticleUrlFor(user.product_source, locale)
          }
        });
      } catch (_emailError) {
        // Non-blocking: welcome email failure should not break login
      }
    }

    // Create session cookie directly — no magic link redirect needed
    const cookieValue = await createSessionCookie(context.env, user);
    const redirectUrl = buildAbsoluteUrl(new URL(context.request.url).origin, nextPath);

    if (cookieValue) {
      const cookieHeaders = sessionCookieHeaders(cookieValue);
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
          ...cookieHeaders
        }
      });
    }

    // Fallback: if cookie creation fails, redirect to members page with error
    const loginUrl = new URL("/members/", context.request.url);
    loginUrl.searchParams.set("error", "SESSION_CREATE_FAILED");
    return Response.redirect(loginUrl.toString(), 302);
  } catch (error) {
    console.error("[google-oauth] callback error:", { code: error.code, message: error.message });
    const loginUrl = new URL("/members/", context.request.url);
    loginUrl.searchParams.set("error", error.code || "google_callback_failed");
    return Response.redirect(loginUrl.toString(), 302);
  }
}

export async function signupMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const email = normalizeEmail(body.email);
    assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required.", 422);

    const rateLimit = await checkMagicLinkRateLimit(context.env, email, context.request);
    if (rateLimit.limited) {
      return rateLimitResponse(rateLimit.code, rateLimit.retryAfter);
    }

    const locale = getLocale(body.locale);
    const nextPath = normalizeNextPath(body.next_path || membersStartPath(locale), locale);
    const db = requireDb(context.env);
    const user = await ensureCompanionUser(db, email, locale, body.source || null);
    const magicLink = await issueMagicLinkToken({
      db,
      user,
      email,
      nextPath,
      locale,
      request: context.request,
      productSource: body.source || null
    });

    const delivery = await sendTemplateEmailDirect({
      env: context.env,
      templateId: TEMPLATE_IDS.resend,
      recipientEmail: email,
      language: locale,
      payload: {
        magic_link: magicLink.url,
        magic_link_expire_minutes: MAGIC_LINK_EXPIRE_MINUTES
      }
    });

    if (delivery.status === "failed") {
      logError({ route: "/api/auth/magic-links/request", code: "EMAIL_DELIVERY_FAILED", msg: delivery.error_detail || "Email provider failed", error: delivery.error_detail });
      return errorResponse(502, "EMAIL_DELIVERY_FAILED", "Email delivery failed. Please try again later or use Google OAuth to sign in.");
    }

    return json({
      ok: true,
      email,
      expires_in_minutes: MAGIC_LINK_EXPIRE_MINUTES,
      delivery_status: delivery.status,
      provider: delivery.provider || null,
      preview_magic_link: String(context.env.ENV_DEPLOY_TARGET) === "production" ? null : magicLink.url
    });
  } catch (error) {
    logError({ route: "/api/auth/magic-links/request", code: error.code || "MAGIC_SIGNUP_FAILED", msg: error.message || "Unable to send magic link.", error });
    return errorResponse(error.status || 500, error.code || "MAGIC_SIGNUP_FAILED", error.message || "Unable to send magic link.");
  }
}

export async function consumeStatelessMagicLinkResponse(context) {
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

    if (magicLink.product_source && !user.product_source) {
      await db.prepare("UPDATE users SET product_source = ?, updated_at = ? WHERE id = ?")
        .bind(magicLink.product_source, nowIso(), user.id)
        .run();
      user.product_source = magicLink.product_source;
    }

    await markMagicLinkUsed(db, magicLink.id, nowIso());

    const locale = getLocale(body.locale || user.preferred_language);
    const nextPath = normalizeNextPath(body.next_path || magicLink.redirect_path || membersStartPath(locale), locale);

    const productWelcomeTemplate = productWelcomeTemplateFor(user.product_source);
    if (productWelcomeTemplate) {
      try {
        await sendTemplateEmailDirect({
          env: context.env,
          templateId: productWelcomeTemplate,
          recipientEmail: user.email,
          language: locale,
          payload: {
            deep_url: productDeepUrlFor(user.product_source, locale),
            article_url: productArticleUrlFor(user.product_source, locale)
          }
        });
      } catch (_emailError) {
        // Non-blocking: welcome email failure should not break login
      }
    }

    const cookieValue = await createSessionCookie(context.env, user);
    const cookieHeaders = cookieValue ? sessionCookieHeaders(cookieValue) : {};

    return json({
      ok: true,
      session: {
        id: randomId("sess"),
        email: user.email,
        membershipType: user.membership_type || "free",
        membershipLabel: user.membership_label || membershipLabel(locale),
        startedAt: nowIso(),
        expiresAt: user.expires_at
      },
      next_path: nextPath
    }, { headers: cookieHeaders });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_CONSUME_FAILED", error.message || "Unable to consume magic link.");
  }
}
