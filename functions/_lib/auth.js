import { TEMPLATE_IDS } from "./constants.js";
import { createMagicLink, getMagicLinkByHash, getUserByEmail, getUserById, markMagicLinkUsed, requireDb, upsertUserMembership } from "./db.js";
import { sendTemplateEmailDirect } from "./email.js";
import {
  assert,
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
  withQuery
} from "./utils.js";

function membersStartPath(locale = "vi") {
  return getLocale(locale) === "en-US" ? "/en/members/start/" : "/members/start/";
}

function membershipLabel(locale = "vi") {
  return getLocale(locale) === "en-US" ? "Free Companion" : "Đồng hành miễn phí";
}

const MAGIC_LINK_EXPIRE_MINUTES = 20;
const FREE_MEMBERSHIP_DAYS = 365;

async function ensureCompanionUser(db, email, locale) {
  const existing = await getUserByEmail(db, email);
  if (existing) return existing;

  const now = nowIso();
  return upsertUserMembership(db, {
    email,
    membership_type: "free",
    membership_label: membershipLabel(locale),
    preferred_language: getLocale(locale),
    expires_at: daysFrom(now, FREE_MEMBERSHIP_DAYS),
    created_at: now,
    updated_at: now
  });
}

async function issueMagicLinkToken({ db, user, email, nextPath, locale, request }) {
  const rawToken = randomToken(24);
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRE_MINUTES * 60 * 1000).toISOString();

  await createMagicLink(db, {
    user_id: user?.id || null,
    email,
    token_hash: tokenHash,
    redirect_path: nextPath,
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

export async function signupMagicLinkResponse(context) {
  try {
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);

    const email = normalizeEmail(body.email);
    assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required.", 422);

    const locale = getLocale(body.locale);
    const nextPath = normalizeNextPath(body.next_path || membersStartPath(locale), locale);
    const db = requireDb(context.env);
    const user = await ensureCompanionUser(db, email, locale);
    const magicLink = await issueMagicLinkToken({
      db,
      user,
      email,
      nextPath,
      locale,
      request: context.request
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

    return json({
      ok: true,
      email,
      expires_in_minutes: MAGIC_LINK_EXPIRE_MINUTES,
      delivery_status: delivery.status,
      preview_magic_link: delivery.status === "sent" ? null : magicLink.url
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

    const db = requireDb(context.env);
    const tokenHash = await sha256Hex(token);
    const magicLink = await getMagicLinkByHash(db, tokenHash);
    assert(magicLink, "MAGIC_NOT_FOUND", "Magic link was not found.", 404);
    assert(!magicLink.used_at, "MAGIC_USED", "Magic link was already used.", 409);
    assert(new Date(magicLink.expires_at).getTime() > Date.now(), "MAGIC_EXPIRED", "Magic link has expired.", 410);

    const user = magicLink.user_id ? await getUserById(db, magicLink.user_id) : await getUserByEmail(db, magicLink.email);
    assert(user && user.active, "MEMBERSHIP_INACTIVE", "Membership is inactive.", 403);

    await markMagicLinkUsed(db, magicLink.id, nowIso());

    const locale = getLocale(body.locale || user.preferred_language);
    const nextPath = normalizeNextPath(body.next_path || magicLink.redirect_path || membersStartPath(locale), locale);

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
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "MAGIC_CONSUME_FAILED", error.message || "Unable to consume magic link.");
  }
}
