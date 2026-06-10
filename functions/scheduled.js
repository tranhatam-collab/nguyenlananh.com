import { TEMPLATE_IDS } from "./_lib/constants.js";
import { queueAndSendEmail } from "./_lib/email.js";
import { requireDb } from "./_lib/db.js";
import { getLocale } from "./_lib/utils.js";

function productDay3TemplateFor(source) {
  const map = {
    loop: TEMPLATE_IDS.product_loop_day3,
    space: TEMPLATE_IDS.product_space_day3,
    capital: TEMPLATE_IDS.product_capital_day3,
    creative: TEMPLATE_IDS.product_creative_day3,
    family: TEMPLATE_IDS.product_family_day3
  };
  return map[source] || null;
}

function productDay7TemplateFor(source) {
  const map = {
    loop: TEMPLATE_IDS.product_loop_day7,
    space: TEMPLATE_IDS.product_space_day7,
    capital: TEMPLATE_IDS.product_capital_day7,
    creative: TEMPLATE_IDS.product_creative_day7,
    family: TEMPLATE_IDS.product_family_day7
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

function daysAgoIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function daysAgoIsoEnd(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString();
}

export async function scheduled(event, env, ctx) {
  const db = requireDb(env);
  const now = new Date().toISOString();

  // Day 3 follow-ups
  const day3Start = daysAgoIso(3);
  const day3End = daysAgoIsoEnd(3);
  const day3Users = await db.prepare(
    `SELECT id, email, preferred_language, product_source, created_at FROM users
     WHERE product_source IS NOT NULL
     AND created_at >= ? AND created_at <= ?
     AND active = 1`
  ).bind(day3Start, day3End).all();

  for (const user of day3Users.results || []) {
    const templateId = productDay3TemplateFor(user.product_source);
    if (!templateId) continue;
    const locale = getLocale(user.preferred_language);
    const dedupeKey = `${templateId}:${user.email}:${user.id}`;
    try {
      await queueAndSendEmail({
        db,
        env,
        templateId,
        recipientEmail: user.email,
        language: locale,
        dedupeKey,
        payload: {
          deep_url: productDeepUrlFor(user.product_source, locale),
          article_url: productArticleUrlFor(user.product_source, locale)
        }
      });
    } catch (_err) {
      // Continue with next user
    }
  }

  // Day 7 follow-ups
  const day7Start = daysAgoIso(7);
  const day7End = daysAgoIsoEnd(7);
  const day7Users = await db.prepare(
    `SELECT id, email, preferred_language, product_source, created_at FROM users
     WHERE product_source IS NOT NULL
     AND created_at >= ? AND created_at <= ?
     AND active = 1`
  ).bind(day7Start, day7End).all();

  for (const user of day7Users.results || []) {
    const templateId = productDay7TemplateFor(user.product_source);
    if (!templateId) continue;
    const locale = getLocale(user.preferred_language);
    const dedupeKey = `${templateId}:${user.email}:${user.id}`;
    try {
      await queueAndSendEmail({
        db,
        env,
        templateId,
        recipientEmail: user.email,
        language: locale,
        dedupeKey,
        payload: {
          deep_url: productDeepUrlFor(user.product_source, locale),
          article_url: productArticleUrlFor(user.product_source, locale)
        }
      });
    } catch (_err) {
      // Continue with next user
    }
  }

  return new Response("OK", { status: 200 });
}
