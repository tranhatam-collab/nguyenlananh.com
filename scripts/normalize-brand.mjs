#!/usr/bin/env node
/**
 * normalize-brand.mjs
 * Unifies brand identity (logo + wordmark + tagline) and primary nav across all .html files.
 *
 * - Replaces every <a class="brand">...</a> block with a canonical version
 *   (VI or EN based on the href prefix).
 * - Replaces every <nav class="navlinks">...</nav> block with a canonical 4-item nav.
 * - Replaces every mobile drawer <nav aria-label="(Điều hướng di động|Mobile navigation)">
 *   with a canonical 5-item drawer (4 nav items + CTA item).
 * - Logo: inline SVG (arch + center dot) embedded in <span class="mark">.
 *
 * Usage: node scripts/normalize-brand.mjs
 *
 * Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([".git", "node_modules", "docs", "scripts", "functions", ".wrangler"]);

// Reference the canonical logo SVG asset; one source of truth, easy to update.
// Image is decorative — the wordmark next to it carries the brand name. We
// signal that in three ways so every audit / a11y tool sees it consistently:
//   - empty alt=""               (WCAG SC 1.1.1 marker)
//   - aria-hidden="true"          (skip from the accessibility tree)
//   - role="presentation"         (also expose as decorative to legacy AT)
const LOGO_IMG = `<img class="markIcon" src="/assets/brand/logo-mark.svg" alt="" width="40" height="40" loading="eager" decoding="async" aria-hidden="true" role="presentation"/>`;

const BRAND_VI = `<a class="brand" href="/" aria-label="Nguyễn Lan Anh — về trang chủ"><span class="mark" aria-hidden="true">${LOGO_IMG}</span><span class="name"><strong>Nguyễn Lan Anh</strong><span class="tagline">Đi vào bên trong để tái thiết cuộc đời</span></span></a>`;

const BRAND_EN = `<a class="brand" href="/en/" aria-label="Lan Anh Nguyen — back to home"><span class="mark" aria-hidden="true">${LOGO_IMG}</span><span class="name"><strong>Lan Anh Nguyen</strong><span class="tagline">Rebuild your life from within</span></span></a>`;

const NAV_VI = `<nav class="navlinks" aria-label="Điều hướng chính"><a href="/hanh-trinh/">Hành trình</a><a href="/phuong-phap/">Phương pháp</a><a href="/bai-viet/">Bài viết</a><a href="/members/">Thành viên</a></nav>`;

const NAV_EN = `<nav class="navlinks" aria-label="Primary navigation"><a href="/en/hanh-trinh/">Journey</a><a href="/en/phuong-phap/">Method</a><a href="/en/bai-viet/">Writings</a><a href="/en/members/">Members</a></nav>`;

const DRAWER_VI = `<nav aria-label="Điều hướng di động"><a href="/hanh-trinh/" data-close>Hành trình</a><a href="/phuong-phap/" data-close>Phương pháp</a><a href="/bai-viet/" data-close>Bài viết</a><a href="/members/" data-close>Thành viên</a><a href="/join/" data-close class="drawerCta">Đăng ký</a></nav>`;

const DRAWER_EN = `<nav aria-label="Mobile navigation"><a href="/en/hanh-trinh/" data-close>Journey</a><a href="/en/phuong-phap/" data-close>Method</a><a href="/en/bai-viet/" data-close>Writings</a><a href="/en/members/" data-close>Members</a><a href="/en/join/" data-close class="drawerCta">Join</a></nav>`;

// Brand block: anchor + descendants, non-greedy until matching </a>.
// Uses [\s\S]*? to allow newlines/HTML inside.
const BRAND_RX = /<a\s+class="brand"[^>]*>[\s\S]*?<\/a>/g;

// Primary nav block.
const NAV_RX = /<nav\s+class="navlinks"[^>]*>[\s\S]*?<\/nav>/g;

// Mobile drawer nav block (matches both VI and EN aria-labels).
const DRAWER_RX = /<nav\s+aria-label="(Điều hướng di động|Mobile navigation)"[^>]*>[\s\S]*?<\/nav>/g;

function isEnglishContext(htmlSegment) {
  // We use the brand block's href to decide locale: starts with /en/
  return /href="\/en\/?"/.test(htmlSegment) || /href="\/en\//.test(htmlSegment);
}

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

const stats = {
  scanned: 0,
  changed: 0,
  brandReplaced: 0,
  navReplaced: 0,
  drawerReplaced: 0,
  hethongFix: 0
};

const changedFiles = [];

for await (const file of walk(ROOT)) {
  stats.scanned += 1;
  const before = readFileSync(file, "utf8");
  let after = before;
  let touched = false;

  // Replace brand blocks.
  after = after.replace(BRAND_RX, (match) => {
    stats.brandReplaced += 1;
    touched = true;
    return isEnglishContext(match) ? BRAND_EN : BRAND_VI;
  });

  // Replace navlinks blocks. Locale by checking links inside.
  after = after.replace(NAV_RX, (match) => {
    stats.navReplaced += 1;
    touched = true;
    return /\/en\//.test(match) ? NAV_EN : NAV_VI;
  });

  // Replace mobile drawer nav.
  after = after.replace(DRAWER_RX, (match) => {
    stats.drawerReplaced += 1;
    touched = true;
    return /Mobile navigation/.test(match) ? DRAWER_EN : DRAWER_VI;
  });

  if (after !== before) {
    writeFileSync(file, after, "utf8");
    stats.changed += 1;
    changedFiles.push(relative(ROOT, file));
  }
}

console.log(JSON.stringify(stats, null, 2));
console.log(`Modified ${changedFiles.length} files.`);
