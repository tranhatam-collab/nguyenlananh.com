#!/usr/bin/env node
/**
 * add-mobile-nav.mjs
 *
 * The desktop nav `<nav class="navlinks">` is hidden below 920px, so on
 * phones a page is unreachable unless it ships a hamburger button + a
 * drawer with the same nav. Most pages were generated without those, so
 * mobile users on /join/, /bai-viet/<slug>/, /members/*, etc. see only
 * the brand and have no way to navigate.
 *
 * This script ensures every public HTML page carries:
 *   1. a `<button class="hamburger">` appended inside its existing
 *      `<div class="actions">` block (the one beside `<nav class="navlinks">`),
 *      after any existing CTA, and
 *   2. a `<div class="drawer">` block placed immediately before the closing
 *      `</header>` of the topbar.
 *
 * Locale (VI vs EN) is detected from `<html lang="…">`. Locale-specific
 * strings come from the canonical homepage chrome that already shipped.
 *
 * Idempotent: pages that already include `class="hamburger"` are skipped.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([
  ".git", ".claude", "node_modules", "docs", "scripts",
  "functions", ".wrangler", "nguyenlananh.com",
]);

const HAMBURGER_VI = `<button class="hamburger" type="button" id="hamburger" aria-label="Mở menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button>`;
const HAMBURGER_EN = `<button class="hamburger" type="button" id="hamburger" aria-label="Open menu" aria-controls="drawer" aria-expanded="false"><span aria-hidden="true"></span></button>`;

const DRAWER_VI = `\n  <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Điều hướng">
    <div class="dhead">
      <div>
        <div style="font-weight:700; font-size:13px;">Điều hướng</div>
        <div class="hint">Chọn một mục để đi tới.</div>
      </div>
      <button class="btn" type="button" id="closeDrawer" aria-label="Đóng menu">Đóng</button>
    </div>
    <nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Hệ thống</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav>
    <div class="foot">Đi chậm để đi sâu. Đi thật để đi xa.</div>
  </div>`;

const DRAWER_EN = `\n  <div class="drawer" id="drawer" role="dialog" aria-modal="false" aria-label="Navigation menu">
    <div class="dhead">
      <div>
        <div style="font-weight:700; font-size:13px;">Menu</div>
        <div class="hint">Choose a section to continue.</div>
      </div>
      <button class="btn" type="button" id="closeDrawer" aria-label="Close menu">Close</button>
    </div>
    <nav aria-label="Mobile navigation"><a href="/en/hanh-trinh/" data-close>Journey</a><a href="/en/phuong-phap/" data-close>System</a><a href="/en/bai-viet/" data-close>Writings</a><a href="/en/members/" data-close>Members</a><a href="/en/join/" data-close class="drawerCta">Join</a></nav>
    <div class="foot">Move slowly to go deep. Move truthfully to go far.</div>
  </div>`;

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
const skipped = { alreadyHas: 0, noActions: 0, noHeader: 0 };

for await (const file of walk(ROOT)) {
  scanned += 1;
  const before = readFileSync(file, "utf8");

  if (/class="hamburger"/.test(before)) {
    skipped.alreadyHas += 1;
    continue;
  }

  const isEnglish = /<html[^>]*\blang="en/i.test(before);
  const hamburger = isEnglish ? HAMBURGER_EN : HAMBURGER_VI;
  const drawer    = isEnglish ? DRAWER_EN    : DRAWER_VI;

  // 1. Inject hamburger inside <div class="actions">…</div>. Match the
  //    actions container by capturing its inner content up to the next
  //    </div> that is followed by </div></div></header> (closing
  //    navwrap, container, header). This avoids matching unrelated
  //    .actions elements deeper in the page.
  const actionsRe = /(<div class="actions">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/div>\s*<\/header>)/i;
  const actionsMatch = before.match(actionsRe);
  if (!actionsMatch) {
    skipped.noActions += 1;
    continue;
  }
  const newActions = `${actionsMatch[1]}${actionsMatch[2]}${hamburger}${actionsMatch[3]}`;
  let after = before.replace(actionsRe, newActions);

  // 2. Inject drawer immediately before </header>. Match the FIRST
  //    </header> after the actions block we just touched.
  if (!/<\/header>/i.test(after)) {
    skipped.noHeader += 1;
    continue;
  }
  after = after.replace(/<\/header>/i, `${drawer}\n</header>`);

  writeFileSync(file, after, "utf8");
  updated += 1;
}

console.log(JSON.stringify({ scanned, updated, skipped }, null, 2));
