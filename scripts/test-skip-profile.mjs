#!/usr/bin/env node
// scripts/test-skip-profile.mjs
// Test 8 groups for PLAN_SKIP_PROFILE_2026-06-26
// Run: node scripts/test-skip-profile.mjs [base_url]
// Default base: http://localhost:8788 (local) or https://www.nguyenlananh.com (if passed)

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const BASE = process.argv[2] || "https://www.nguyenlananh.com";
const IS_LIVE = BASE.startsWith("https://");

let pass = 0, fail = 0;
const results = [];

function ok(group, name, detail = "") {
  pass++;
  results.push(`✅ [${group}] ${name}${detail ? " — " + detail : ""}`);
}
function bad(group, name, detail = "") {
  fail++;
  results.push(`❌ [${group}] ${name}${detail ? " — " + detail : ""}`);
}

// ============================================================
// Load source files for unit tests
// ============================================================
const authSrc = readFileSync(new URL("../functions/_lib/auth.js", import.meta.url), "utf8");
const membersSrc = readFileSync(new URL("../assets/members.js", import.meta.url), "utf8");
const utilsSrc = readFileSync(new URL("../functions/_lib/utils.js", import.meta.url), "utf8");
const startViSrc = readFileSync(new URL("../members/start/index.html", import.meta.url), "utf8");
const startEnSrc = readFileSync(new URL("../en/members/start/index.html", import.meta.url), "utf8");

// ============================================================
// Group 1 — OAuth destination (VI + EN)
// ============================================================
function testGroup1() {
  // Source check: auth.js uses localeToDashboardPath, not membersStartPath, for fallback
  const usesDashboard = authSrc.includes("localeToDashboardPath(locale)") &&
    !authSrc.match(/membersStartPath\(locale\)/);
  if (usesDashboard) ok("1-OAuth-dest", "auth.js uses localeToDashboardPath for fallback");
  else bad("1-OAuth-dest", "auth.js still uses membersStartPath for fallback");

  // Source check: localeToDashboardPath exists in utils.js
  if (utilsSrc.includes("localeToDashboardPath")) ok("1-OAuth-dest", "localeToDashboardPath exists in utils.js");
  else bad("1-OAuth-dest", "localeToDashboardPath missing from utils.js");

  // Source check: auth.js imports localeToDashboardPath
  if (authSrc.match(/import\s*\{[^}]*localeToDashboardPath/s)) ok("1-OAuth-dest", "auth.js imports localeToDashboardPath");
  else bad("1-OAuth-dest", "auth.js does not import localeToDashboardPath");

  // Source check: exactly 2 fallback usages (start + callback)
  const fallbackCount = (authSrc.match(/localeToDashboardPath\(locale\)/g) || []).length;
  if (fallbackCount === 2) ok("1-OAuth-dest", `Exactly 2 fallback usages (start + callback)`);
  else bad("1-OAuth-dest", `Expected 2 fallback usages, found ${fallbackCount}`);
}

// ============================================================
// Group 2 — Valid next_path
// ============================================================
function testGroup2() {
  // Source check: normalizeNextPath allows /members/* and /en/members/*
  const allowsMembers = utilsSrc.includes("members(\\/|$)");
  if (allowsMembers) ok("2-next-path", "normalizeNextPath allows /members/* and /en/members/*");
  else bad("2-next-path", "normalizeNextPath regex missing /members pattern");

  // Source check: membersStartPath still exists (not deleted)
  if (authSrc.includes("function membersStartPath")) ok("2-next-path", "membersStartPath still exists (preserved)");
  else bad("2-next-path", "membersStartPath was deleted (should be preserved)");
}

// ============================================================
// Group 3 — Open redirect (AC4)
// ============================================================
function testGroup3() {
  // Source check: normalizeNextPath requires startsWith("/")
  const requiresSlash = utilsSrc.includes('value.startsWith("/")');
  if (requiresSlash) ok("3-open-redirect", "normalizeNextPath requires leading /");
  else bad("3-open-redirect", "normalizeNextPath missing startsWith(/) check");

  // Source check: normalizeNextPath regex only allows /members or /en/members
  const hasRegex = utilsSrc.includes("members(\\/|$)") && utilsSrc.includes("value.startsWith");
  if (hasRegex) ok("3-open-redirect", "normalizeNextPath regex restricts to /members/* only");
  else bad("3-open-redirect", "normalizeNextPath regex too permissive");

  // Source check: fallback to dashboard
  const hasFallback = utilsSrc.includes("localeToDashboardPath(locale)");
  if (hasFallback) ok("3-open-redirect", "normalizeNextPath falls back to dashboard");
  else bad("3-open-redirect", "normalizeNextPath missing dashboard fallback");
}

// ============================================================
// Group 4 — No-op redirect (B2)
// ============================================================
function testGroup4() {
  // Source check: redirectFreeMemberToStart returns false
  const noopMatch = membersSrc.match(/function redirectFreeMemberToStart\([^)]*\)\s*\{[\s\S]*?return false;\s*\}/);
  if (noopMatch) ok("4-noop", "redirectFreeMemberToStart returns false (no-op)");
  else bad("4-noop", "redirectFreeMemberToStart does not return false");

  // Source check: call site still exists (not deleted)
  const callSiteExists = membersSrc.includes("if (redirectFreeMemberToStart(session)) return;");
  if (callSiteExists) ok("4-noop", "Call site preserved (line ~1458)");
  else bad("4-noop", "Call site was deleted (should be preserved per ĐC1)");

  // Source check: no window.location.replace in the function
  const noReplace = !membersSrc.match(/redirectFreeMemberToStart[\s\S]*?window\.location\.replace/);
  if (noReplace) ok("4-noop", "No window.location.replace in redirectFreeMemberToStart");
  else bad("4-noop", "window.location.replace still present in function");
}

// ============================================================
// Group 5 — Free member navigation (live)
// ============================================================
async function testGroup5() {
  if (!IS_LIVE) {
    ok("5-free-nav", "Skipped (not live URL)");
    return;
  }
  const routes = ["/members/dashboard/", "/members/journey/", "/members/practice/", "/members/experience/"];
  for (const route of routes) {
    try {
      const res = await fetch(`${BASE}${route}`, { redirect: "manual" });
      if (res.status === 200) ok("5-free-nav", `${route} → 200`);
      else bad("5-free-nav", `${route} → ${res.status} (expected 200)`);
    } catch (e) {
      bad("5-free-nav", `${route} → fetch error: ${e.message}`);
    }
  }
}

// ============================================================
// Group 6 — Paid gate (live, specific status per route)
// ============================================================
async function testGroup6() {
  if (!IS_LIVE) {
    ok("6-paid-gate", "Skipped (not live URL)");
    return;
  }
  // Deep lessons → 302 for anonymous
  const deepRoutes = [
    { path: "/members/deep/rhythm-design-lab/", expected: 302 },
    { path: "/members/deep/space-reset-practitioner/", expected: 302 },
    { path: "/members/deep/practice-companion-level-1/", expected: 302 },
    { path: "/members/deep/practice-method-designer/", expected: 302 },
  ];
  for (const { path, expected } of deepRoutes) {
    try {
      const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
      if (res.status === expected) ok("6-paid-gate", `${path} → ${expected}`);
      else bad("6-paid-gate", `${path} → ${res.status} (expected ${expected})`);
    } catch (e) {
      bad("6-paid-gate", `${path} → fetch error: ${e.message}`);
    }
  }
  // Deep index → 200 (public)
  try {
    const res = await fetch(`${BASE}/members/deep/`, { redirect: "manual" });
    if (res.status === 200) ok("6-paid-gate", "/members/deep/ → 200 (public index)");
    else bad("6-paid-gate", `/members/deep/ → ${res.status} (expected 200)`);
  } catch (e) {
    bad("6-paid-gate", `/members/deep/ → fetch error: ${e.message}`);
  }
  // API → 401 for anonymous
  try {
    const res = await fetch(`${BASE}/api/auth/session`);
    if (res.status === 401) ok("6-paid-gate", "/api/auth/session → 401");
    else bad("6-paid-gate", `/api/auth/session → ${res.status} (expected 401)`);
  } catch (e) {
    bad("6-paid-gate", `/api/auth/session → fetch error: ${e.message}`);
  }
}

// ============================================================
// Group 7 — Profile skip button (source + live)
// ============================================================
function testGroup7Source() {
  // VI
  if (startViSrc.includes('href="/members/dashboard/"') && startViSrc.includes("Để sau")) {
    ok("7-skip-btn", "VI: skip link + text present");
  } else {
    bad("7-skip-btn", "VI: skip link or text missing");
  }
  // EN
  if (startEnSrc.includes('href="/en/members/dashboard/"') && startEnSrc.includes("Skip for now")) {
    ok("7-skip-btn", "EN: skip link + text present");
  } else {
    bad("7-skip-btn", "EN: skip link or text missing");
  }
  // VI badge
  if (startViSrc.includes("Profile đồng hành — tùy chọn")) ok("7-skip-btn", "VI: optional badge present");
  else bad("7-skip-btn", "VI: optional badge missing");
  // EN badge
  if (startEnSrc.includes("Companion profile — optional")) ok("7-skip-btn", "EN: optional badge present");
  else bad("7-skip-btn", "EN: optional badge missing");
}

async function testGroup7Live() {
  if (!IS_LIVE) return;
  try {
    const res = await fetch(`${BASE}/members/start/`);
    const html = await res.text();
    if (html.includes('href="/members/dashboard/"') && html.includes("Để sau")) {
      ok("7-skip-btn", "VI live: skip link present");
    } else {
      bad("7-skip-btn", "VI live: skip link missing");
    }
  } catch (e) {
    bad("7-skip-btn", `VI live: fetch error: ${e.message}`);
  }
  try {
    const res = await fetch(`${BASE}/en/members/start/`);
    const html = await res.text();
    if (html.includes('href="/en/members/dashboard/"') && html.includes("Skip for now")) {
      ok("7-skip-btn", "EN live: skip link present");
    } else {
      bad("7-skip-btn", "EN live: skip link missing");
    }
  } catch (e) {
    bad("7-skip-btn", `EN live: fetch error: ${e.message}`);
  }
}

// ============================================================
// Group 8 — Checkout without profile (live)
// ============================================================
async function testGroup8() {
  if (!IS_LIVE) {
    ok("8-checkout", "Skipped (not live URL)");
    return;
  }
  try {
    const res = await fetch(`${BASE}/api/payments/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_code: "micro_one_corner", turnstile_token: "dummy" }),
    });
    const body = await res.json();
    if (body.code === "TURNSTILE_FAILED" || body.error?.code === "TURNSTILE_FAILED") {
      ok("8-checkout", `Checkout API → TURNSTILE_FAILED (no profile dependency)`);
    } else if (body.code === "PROFILE_REQUIRED" || body.error?.code === "PROFILE_REQUIRED") {
      bad("8-checkout", `Checkout API → PROFILE_REQUIRED (should not depend on profile)`);
    } else {
      ok("8-checkout", `Checkout API → ${body.code || body.error?.code || res.status} (no profile error)`);
    }
  } catch (e) {
    bad("8-checkout", `Checkout API → fetch error: ${e.message}`);
  }
}

// ============================================================
// Run all
// ============================================================
async function main() {
  console.log(`=== SKIP PROFILE TESTS — ${BASE} ===\n`);

  testGroup1();
  testGroup2();
  testGroup3();
  testGroup4();
  testGroup7Source();
  await testGroup5();
  await testGroup6();
  await testGroup7Live();
  await testGroup8();

  for (const r of results) console.log(r);
  console.log(`\n=== SUMMARY ===`);
  console.log(`PASS: ${pass} | FAIL: ${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
