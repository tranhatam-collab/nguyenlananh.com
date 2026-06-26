#!/usr/bin/env node
/**
 * Flow Matrix — end-to-end verification for nguyenlananh.com
 * Tests both VI and EN across 5 groups:
 *   1. Google login button + redirect_uri
 *   2. Checkout for each product landing page (dummy token → expect TURNSTILE_FAILED)
 *   3. Contact form (dummy token → expect TURNSTILE_FAILED)
 *   4. Member gating (deep lessons redirect when logged out)
 *   5. Nav/CTA/footer links (including /api/)
 *
 * Run: node scripts/flow-matrix.mjs [host]
 * Default host: https://www.nguyenlananh.com
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const HOST = process.argv[2] || "https://www.nguyenlananh.com";

const LANGUAGES = ["vi", "en"];

const GOOGLE_LOGIN_PAGES = {
  vi: "/join/",
  en: "/en/join/",
};

const CONTACT_PAGES = {
  vi: "/lien-he/",
  en: "/en/lien-he/",
};

// Product landing pages with their data-plan attribute
const PRODUCT_LANDINGS_VI = [
  { path: "/products/one-corner-reset/", plan: "micro_one_corner", price: 75000 },
  { path: "/products/7-day-true-rhythm/", plan: "micro_7day_rhythm", price: 225000 },
  { path: "/products/life-reset-mini/", plan: "micro_life_reset", price: 175000 },
  { path: "/products/companion-circle/", plan: "micro_companion", price: 225000 },
  { path: "/products/inner-listening-kit/", plan: "micro_inner_listening", price: 125000 },
  { path: "/assessments/personal-capital/", plan: "diag_capital_self", price: 1250000 },
  { path: "/assessments/avoidance-map/", plan: "asmt_avoidance_self", price: 490000 },
  { path: "/programs/family-pattern-mapping/", plan: "prog_family_pattern", price: 10000000 },
  { path: "/programs/open-loop-closure-sprint/", plan: "open_loop_closure_sprint", price: 490000 },
  { path: "/programs/boundary-foundation/", plan: "cert_boundary_found", price: 7600000 },
  { path: "/programs/personal-after-action-review/", plan: "personal_after_action_review", price: 750000 },
  { path: "/programs/self-trust-practice-lab/", plan: "self_trust_evidence_builder", price: 990000 },
  { path: "/programs/space-reset-practitioner/", plan: "prog_space_reset", price: 12700000 },
  { path: "/programs/creative-practice-studio/", plan: "prog_creative_studio", price: 10000000 },
  { path: "/programs/emotional-block-mapping/", plan: "prog_emo_block", price: 6300000 },
  { path: "/programs/rhythm-design-lab/", plan: "prog_rhythm_lab", price: 2500000 },
  { path: "/certification/practice-method-designer/", plan: "cert_method_designer", price: 76000000 },
  { path: "/certification/practice-companion-level-1/", plan: "cert_companion_l1", price: 30000000 },
];

// Product landing pages with data-plan (both VI and EN)
const PRODUCT_LANDINGS_VI = [
  { path: "/products/one-corner-reset/", plan: "micro_one_corner", price: 75000 },
  { path: "/products/7-day-true-rhythm/", plan: "micro_7day_rhythm", price: 225000 },
  { path: "/products/life-reset-mini/", plan: "micro_life_reset", price: 175000 },
  { path: "/products/companion-circle/", plan: "micro_companion", price: 225000 },
  { path: "/products/inner-listening-kit/", plan: "micro_inner_listening", price: 125000 },
  { path: "/assessments/personal-capital/", plan: "diag_capital_self", price: 1250000 },
  { path: "/assessments/avoidance-map/", plan: "asmt_avoidance_self", price: 490000 },
  { path: "/programs/family-pattern-mapping/", plan: "prog_family_pattern", price: 10000000 },
  { path: "/programs/open-loop-closure-sprint/", plan: "open_loop_closure_sprint", price: 490000 },
  { path: "/programs/boundary-foundation/", plan: "cert_boundary_found", price: 7600000 },
  { path: "/programs/personal-after-action-review/", plan: "personal_after_action_review", price: 750000 },
  { path: "/programs/self-trust-practice-lab/", plan: "self_trust_evidence_builder", price: 990000 },
  { path: "/programs/space-reset-practitioner/", plan: "prog_space_reset", price: 12700000 },
  { path: "/programs/creative-practice-studio/", plan: "prog_creative_studio", price: 10000000 },
  { path: "/programs/emotional-block-mapping/", plan: "prog_emo_block", price: 6300000 },
  { path: "/programs/rhythm-design-lab/", plan: "prog_rhythm_lab", price: 2500000 },
  { path: "/certification/practice-method-designer/", plan: "cert_method_designer", price: 76000000 },
  { path: "/certification/practice-companion-level-1/", plan: "cert_companion_l1", price: 30000000 },
];

const PRODUCT_LANDINGS_EN = PRODUCT_LANDINGS_VI;

// Membership tiers (no dedicated landing pages; test API directly)
const MEMBERSHIP_TIERS = [
  { plan: "year1", price: 75000 },
  { plan: "year2", price: 1490000 },
  { plan: "year3", price: 2490000 },
];

const DEEP_LESSONS = {
  vi: [
    "/members/deep/rhythm-design-lab/",
    "/members/deep/space-reset-practitioner/",
    "/members/deep/family-pattern-mapping/",
    "/members/deep/creative-practice-studio/",
    "/members/deep/personal-capital/",
    "/members/deep/avoidance-map/",
  ],
  en: [
    "/en/members/deep/ban-do-vong-lap/",
    "/en/members/deep/tai-thiet-khong-gian/",
    "/en/members/deep/xuong-sang-tao/",
  ],
};

const results = [];
let failCount = 0;
let passCount = 0;

function log(group, lang, test, status, detail) {
  const s = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : status === "BLOCKED" ? "⏸️" : "ℹ️";
  results.push({ group, lang, test, status, detail });
  console.log(`${s} [${group} | ${lang}] ${test}: ${status}${detail ? " — " + detail : ""}`);
  if (status === "PASS") passCount++;
  if (status === "FAIL") failCount++;
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  return { res, text };
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { res, text, json };
}

// 1. Google login flow
async function testGoogleLogin(lang) {
  const page = GOOGLE_LOGIN_PAGES[lang];
  const url = `${HOST}${page}`;
  const { text, res } = await fetchText(url);
  if (res.status !== 200) {
    return log("Google Login", lang, "Join page load", "FAIL", `status ${res.status}`);
  }

  const btnMatch = text.match(/id="googleLoginBtn"[^>]*href="([^"]+)"/);
  if (!btnMatch) {
    return log("Google Login", lang, "Google button exists", "FAIL", "button not found");
  }
  const href = btnMatch[1];
  const expected = `/api/auth/google/start/?locale=${lang}`;
  if (!href.includes("/api/auth/google/start")) {
    return log("Google Login", lang, "Button href", "FAIL", `href=${href}`);
  }
  if (href.includes("/en/api/") || href.includes("/vi/api/")) {
    return log("Google Login", lang, "Button href locale", "FAIL", `href=${href}`);
  }
  log("Google Login", lang, "Button href", "PASS", href);

  const startUrl = href.startsWith("http") ? href : `${HOST}${href}`;
  const { res: startRes, text: startText } = await fetchText(startUrl, { redirect: "manual" });
  if (startRes.status !== 302) {
    return log("Google Login", lang, "Start endpoint", "FAIL", `status ${startRes.status}`);
  }
  const loc = startRes.headers.get("location");
  if (!loc || !loc.includes("accounts.google.com")) {
    return log("Google Login", lang, "Start redirect", "FAIL", `location=${loc}`);
  }
  const redirectUri = new URL(loc).searchParams.get("redirect_uri");
  if (redirectUri !== "https://www.nguyenlananh.com/api/auth/google/callback") {
    return log("Google Login", lang, "redirect_uri", "FAIL", `redirect_uri=${redirectUri}`);
  }
  log("Google Login", lang, "Start 302 + redirect_uri", "PASS", redirectUri);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// 2. Checkout flow
async function testCheckout(lang) {
  const landings = lang === "en" ? PRODUCT_LANDINGS_EN : PRODUCT_LANDINGS_VI;
  for (const prod of landings) {
    const path = lang === "en" && !prod.path.startsWith("/en/") ? `/en${prod.path}` : prod.path;
    const url = `${HOST}${path}`;
    const { text, res } = await fetchText(url);
    if (res.status !== 200) {
      log("Checkout", lang, `Landing ${prod.path}`, "FAIL", `status ${res.status}`);
      continue;
    }
    const planMatch = text.match(/data-plan="([^"]+)"/);
    if (!planMatch) {
      log("Checkout", lang, `Landing ${prod.path} data-plan`, "FAIL", "no data-plan");
      continue;
    }
    const plan = planMatch[1];
    if (plan !== prod.plan) {
      log("Checkout", lang, `Landing ${prod.path} plan`, "FAIL", `expected ${prod.plan}, got ${plan}`);
      continue;
    }
    log("Checkout", lang, `Landing ${prod.path} plan`, "PASS", plan);

    const payload = {
      provider: "vietqr",
      plan_code: plan,
      identity_country: "VN",
      email: "test@example.com",
      locale: lang,
      turnstile_token: "dummy",
    };
    const { res: checkoutRes, json } = await fetchJson(`${HOST}/api/payments/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": `matrix-${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify(payload),
    });
    await sleep(500);
    if (checkoutRes.status === 403 && json?.code === "TURNSTILE_FAILED") {
      log("Checkout", lang, `API ${plan} dummy token`, "PASS", "TURNSTILE_FAILED (correct fail-closed)");
    } else {
      log("Checkout", lang, `API ${plan} dummy token`, "FAIL", `status ${checkoutRes.status} code=${json?.code}`);
    }
  }

  // Membership API tests (no dedicated landing pages)
  for (const tier of MEMBERSHIP_TIERS) {
    const payload = {
      provider: "vietqr",
      plan_code: tier.plan,
      identity_country: "VN",
      email: "test@example.com",
      locale: lang,
      turnstile_token: "dummy",
    };
    const { res: checkoutRes, json } = await fetchJson(`${HOST}/api/payments/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": `matrix-${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify(payload),
    });
    await sleep(500);
    if (checkoutRes.status === 403 && json?.code === "TURNSTILE_FAILED") {
      log("Checkout", lang, `API membership ${tier.plan} dummy token`, "PASS", "TURNSTILE_FAILED (correct fail-closed)");
    } else {
      log("Checkout", lang, `API membership ${tier.plan} dummy token`, "FAIL", `status ${checkoutRes.status} code=${json?.code}`);
    }
  }
}

// 3. Contact form
async function testContact(lang) {
  const page = CONTACT_PAGES[lang];
  const url = `${HOST}${page}`;
  const { text, res } = await fetchText(url);
  if (res.status !== 200) {
    return log("Contact", lang, "Contact page load", "FAIL", `status ${res.status}`);
  }
  const formMatch = text.match(/id="contactForm"/);
  const mailtoFormMatch = text.match(/action="mailto:/);
  if (!formMatch) {
    if (mailtoFormMatch) {
      return log("Contact", lang, "Contact form API", "FAIL", "page uses mailto form instead of API");
    }
    return log("Contact", lang, "Contact form exists", "FAIL", "form not found");
  }
  log("Contact", lang, "Contact form exists", "PASS");

  const payload = {
    name: "Matrix Test",
    contact: "test@example.com",
    message: "This is a test message from flow matrix.",
    "cf-turnstile-response": "dummy",
  };
  const { res: submitRes, json } = await fetchJson(`${HOST}/api/contact/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await sleep(500);
  if (submitRes.status === 403 && json?.code === "TURNSTILE_FAILED") {
    log("Contact", lang, "Submit dummy token", "PASS", "TURNSTILE_FAILED (correct fail-closed)");
  } else {
    log("Contact", lang, "Submit dummy token", "FAIL", `status ${submitRes.status} code=${json?.code}`);
  }
}

// 4. Member gating
async function testGating(lang) {
  const lessons = DEEP_LESSONS[lang] || [];
  for (const lesson of lessons) {
    const url = `${HOST}${lesson}`;
    const { res, text } = await fetchText(url, { redirect: "manual" });
    if (res.status === 302) {
      const loc = res.headers.get("location") || "";
      const ok = loc.startsWith("/") && (loc.includes("/join") || loc.includes("/programs") || loc.includes("/assessments") || loc.includes("/certification") || loc.includes("/members/deep"));
      log("Gating", lang, `${lesson} redirect`, ok ? "PASS" : "FAIL", loc);
    } else if (res.status === 200) {
      log("Gating", lang, `${lesson} public access`, "FAIL", "got 200, expected 302 redirect");
    } else {
      log("Gating", lang, `${lesson} status`, "FAIL", `status ${res.status}`);
    }
    await sleep(200);
  }

  // Public index should be 200
  const indexPath = lang === "en" ? "/en/members/deep/" : "/members/deep/";
  const { res: idxRes } = await fetchText(`${HOST}${indexPath}`, { redirect: "manual" });
  if (idxRes.status === 200) {
    log("Gating", lang, "Deep index public", "PASS");
  } else {
    log("Gating", lang, "Deep index public", "FAIL", `status ${idxRes.status}`);
  }
}

// 5. Links
async function collectHtmlFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== ".wrangler") {
      await collectHtmlFiles(full, files);
    } else if (entry.name.endsWith(".html") || entry.name.endsWith(".htm")) {
      files.push(full);
    }
  }
  return files;
}

function resolveUrl(url, sourceFile) {
  if (url.startsWith("http") || url.startsWith("//") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("data:") || url.startsWith("javascript:")) {
    return null;
  }
  const clean = url.split("?")[0].split("#")[0];
  if (!clean) return null;
  if (clean.startsWith("/")) {
    return { type: "abs", path: clean };
  }
  return { type: "rel", path: resolve(dirname(sourceFile), clean) };
}

function pathExists(path) {
  if (existsSync(path)) return true;
  if (existsSync(join(path, "index.html"))) return true;
  if (path.endsWith("/") && existsSync(path.slice(0, -1))) return true;
  if (!extname(path) && existsSync(path + ".html")) return true;
  return false;
}

const PLANNED_PRODUCTS = new Set([
  "/products/37-day-life-project-studio/",
  "/products/21-day-true-rhythm-design/",
  "/products/community-builder-practice/",
  "/products/creative-work-operating-system/",
  "/products/decision-clarity-lab/",
  "/products/environment-design-lab/",
  "/products/family-roles-boundaries-lab/",
  "/products/life-system-mapping-lab/",
  "/products/personal-resource-economy/",
  "/products/space-reset-professional-lab/",
]);

async function testLinks() {
  const files = await collectHtmlFiles(ROOT);
  let broken = [];
  let apiLinks = [];
  let checked = 0;
  let total = 0;

  for (const file of files) {
    const rel = file.replace(ROOT + "/", "");
    const html = await readFile(file, "utf-8");
    const matches = [...html.matchAll(/href=["']([^"']+)["']/g), ...html.matchAll(/src=["']([^"']+)["']/g), ...html.matchAll(/data-action=["']([^"']+)["']/g)];
    for (const m of matches) {
      total++;
      const url = m[1];
      const resolved = resolveUrl(url, file);
      if (!resolved) continue;
      checked++;
      if (resolved.type === "abs") {
        if (resolved.path.startsWith("/api/")) {
          apiLinks.push({ file: rel, url });
          continue;
        }
        if (PLANNED_PRODUCTS.has(resolved.path)) continue;
        if (!pathExists(join(ROOT, resolved.path))) {
          broken.push({ file: rel, url, reason: "file missing" });
        }
      } else {
        if (!pathExists(resolved.path)) {
          broken.push({ file: rel, url, reason: "relative missing" });
        }
      }
    }
  }

  // Test API links
  for (const link of apiLinks) {
    const url = `${HOST}${link.url}`;
    const { res } = await fetchText(url, { method: "GET", redirect: "manual" });
    // API endpoints may require POST or specific body; accept 200, 302, 405, 400, 401, 403
    // 404/501 means broken
    const ok = ![404, 501, 500].includes(res.status);
    if (!ok) {
      broken.push({ file: link.file, url: link.url, reason: `API status ${res.status}` });
    }
  }

  if (broken.length === 0) {
    log("Links", "vi+en", `All ${checked} internal + ${apiLinks.length} API links`, "PASS");
  } else {
    for (const b of broken) {
      log("Links", "vi+en", `${b.file} → ${b.url}`, "FAIL", b.reason);
    }
  }
}

async function main() {
  console.log(`\n=== FLOW MATRIX — ${HOST} ===\n`);
  for (const lang of LANGUAGES) {
    await testGoogleLogin(lang);
    await sleep(500);
  }
  for (const lang of LANGUAGES) {
    await testCheckout(lang);
    await sleep(1000);
  }
  for (const lang of LANGUAGES) {
    await testContact(lang);
    await sleep(500);
  }
  for (const lang of LANGUAGES) {
    await testGating(lang);
    await sleep(500);
  }
  await testLinks();

  console.log("\n=== SUMMARY ===");
  console.log(`PASS: ${passCount} | FAIL: ${failCount} | BLOCKED: ${results.filter((r) => r.status === "BLOCKED").length}`);
  if (failCount > 0) {
    console.log("\nFAILURES:");
    for (const r of results.filter((x) => x.status === "FAIL")) {
      console.log(`  ${r.group} | ${r.lang} | ${r.test}: ${r.detail}`);
    }
  }
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Matrix error:", e);
  process.exit(1);
});
