#!/usr/bin/env node
/**
 * restore-member-nav.mjs
 *
 * Pages that live behind the member auth wall (every page with
 * `data-page="members-*"`) should expose member-section navigation, not the
 * public site nav. The earlier brand normaliser overwrote every <nav
 * class="navlinks"> with the public 4-item bar; that means signed-in members
 * have no quick way to jump between Dashboard / Journey / Practice / Deep /
 * Experience / Pro from the topbar.
 *
 * This script puts member nav back on those pages and keeps the drawer
 * aligned so mobile members see the same six entries.
 *
 * Idempotent.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([
  ".git", ".claude", "node_modules", "docs", "scripts",
  "functions", ".wrangler", "nguyenlananh.com",
]);

const NAV_VI = `<nav class="navlinks" aria-label="Điều hướng thành viên"><a href="/members/dashboard/">Bảng điều khiển</a><a href="/members/journey/">Hành trình</a><a href="/members/practice/">Thực hành</a><a href="/members/deep/">Chuyên sâu</a><a href="/members/experience/">Trải nghiệm</a><a href="/members/pro/">Pro</a></nav>`;

const NAV_EN = `<nav class="navlinks" aria-label="Member navigation"><a href="/en/members/dashboard/">Dashboard</a><a href="/en/members/journey/">Journey</a><a href="/en/members/practice/">Practice</a><a href="/en/members/deep/">Deep</a><a href="/en/members/experience/">Experience</a><a href="/en/members/pro/">Pro</a></nav>`;

const DRAWER_NAV_VI = `<nav aria-label="Điều hướng thành viên di động"><a href="/members/dashboard/" data-close>Bảng điều khiển</a><a href="/members/journey/" data-close>Hành trình</a><a href="/members/practice/" data-close>Thực hành</a><a href="/members/deep/" data-close>Chuyên sâu</a><a href="/members/experience/" data-close>Trải nghiệm</a><a href="/members/pro/" data-close>Pro</a><a href="/" data-close class="drawerCta">Về trang chủ</a></nav>`;

const DRAWER_NAV_EN = `<nav aria-label="Member mobile navigation"><a href="/en/members/dashboard/" data-close>Dashboard</a><a href="/en/members/journey/" data-close>Journey</a><a href="/en/members/practice/" data-close>Practice</a><a href="/en/members/deep/" data-close>Deep</a><a href="/en/members/experience/" data-close>Experience</a><a href="/en/members/pro/" data-close>Pro</a><a href="/en/" data-close class="drawerCta">Back to home</a></nav>`;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

let scanned = 0;
let updated = 0;

for await (const file of walk(ROOT)) {
  scanned += 1;
  const before = readFileSync(file, "utf8");

  // Only act on pages explicitly tagged as members-* surfaces.
  if (!/data-page="members-/.test(before)) continue;

  // Skip the public-facing /members/ + /en/members/ landings: those are the
  // door INTO the member system and should keep public nav.
  if (/data-page="members-public"/.test(before)) continue;

  const isEnglish = /<html[^>]*\blang="en/i.test(before);
  const desktopNav = isEnglish ? NAV_EN : NAV_VI;
  const drawerNav  = isEnglish ? DRAWER_NAV_EN : DRAWER_NAV_VI;

  let after = before;
  // 1. Replace the desktop navlinks block (whatever aria-label the brand
  //    normaliser injected — Primary / Điều hướng chính / etc.).
  after = after.replace(/<nav class="navlinks"[^>]*>[\s\S]*?<\/nav>/i, desktopNav);

  // 2. Replace the drawer's mobile-nav block. The drawer wrapper carries
  //    aria-label "Điều hướng" or "Navigation menu"; inside it, find the
  //    inner <nav aria-label="Điều hướng di động"> / "Mobile navigation"
  //    and swap its content.
  after = after.replace(
    /<nav aria-label="(?:Điều hướng di động|Mobile navigation)"[^>]*>[\s\S]*?<\/nav>/i,
    drawerNav
  );

  if (after !== before) {
    writeFileSync(file, after, "utf8");
    updated += 1;
  }
}

console.log(JSON.stringify({ scanned, updated }, null, 2));
