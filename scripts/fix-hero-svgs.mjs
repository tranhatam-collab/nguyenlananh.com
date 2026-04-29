#!/usr/bin/env node
/**
 * fix-hero-svgs.mjs
 *
 * Hero SVG illustrations under /assets/images/articles/ embed three text rows:
 *   1. The article slug rendered without Vietnamese diacritics
 *      (e.g. "bon truc thay doi" instead of "Bốn trục thay đổi")
 *   2. The placeholder caption "Article visual"
 *   3. The author byline "Nguyen Lan Anh — Bài viết"
 *
 * For each <slug>-hero.svg we:
 *   - Look up the matching article at /bai-viet/<slug>/index.html
 *   - Pull the canonical Vietnamese title from <title> (preferring the
 *     part before " | "), falling back to <h1>.
 *   - Replace row 1 with that title.
 *   - Replace row 2 with "Hình minh hoạ".
 *   - Replace row 3 with "Nguyễn Lan Anh — Bài viết".
 *   - Migrate the slate gradient + fill palette to the warm brand palette.
 *
 * Idempotent. Logs a per-file before/after summary.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HERO_DIR = join(ROOT, "assets/images/articles");
const ARTICLES_DIR = join(ROOT, "bai-viet");

function readArticleTitle(slug) {
  const htmlPath = join(ARTICLES_DIR, slug, "index.html");
  let html;
  try {
    html = readFileSync(htmlPath, "utf8");
  } catch {
    return null;
  }
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    // Strip everything after the first " | " separator so we keep only the
    // article title, not the suffix (" | Bài viết", " | Nguyenlananh.com", etc.)
    const cleaned = titleMatch[1].split(/\s*\|\s*/u, 1)[0].trim();
    if (cleaned) return cleaned;
  }
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (h1Match) return h1Match[1].trim();
  return null;
}

function migrateColors(svg) {
  return svg
    // Slate text fills → warm umber / brick / rust matching brand hierarchy
    .replaceAll('fill="#111827"', 'fill="#2a1810"')
    .replaceAll('fill="#0f172a"', 'fill="#2a1810"')
    .replaceAll('fill="#334155"', 'fill="#6b4a35"')
    // Slate strokes → warm earth alpha
    .replaceAll('stroke="#64748b"', 'stroke="#8b2818"')
    .replaceAll('stroke="rgba(30, 41, 59, 0.35)"', 'stroke="rgba(139,40,24,0.30)"')
    .replaceAll('stroke="rgba(30,41,59,0.35)"', 'stroke="rgba(139,40,24,0.30)"')
    // Cool gradient stops → warm cream / saffron / sand for brand-feel
    .replaceAll('stop-color="#f5f6f8"', 'stop-color="#fdf6e8"')
    .replaceAll('stop-color="#f8fafc"', 'stop-color="#fdf6e8"')
    .replaceAll('stop-color="#dfe7f0"', 'stop-color="#faecd0"')
    .replaceAll('stop-color="#e2e8f0"', 'stop-color="#f5ebc8"')
    .replaceAll('stop-color="#9fb1d1"', 'stop-color="#d88e36"');
}

const TEXT_ROW_RE = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;

function rewriteSvg(svg, title) {
  let rowIndex = 0;
  const replaced = svg.replace(TEXT_ROW_RE, (match, attrs, inner) => {
    rowIndex += 1;
    if (rowIndex === 1) return `<text${attrs}>${title}</text>`;
    if (rowIndex === 2) return `<text${attrs}>Hình minh hoạ</text>`;
    if (rowIndex === 3) return `<text${attrs}>Nguyễn Lan Anh — Bài viết</text>`;
    return match;
  });
  return migrateColors(replaced);
}

const heroFiles = (await readdir(HERO_DIR))
  .filter((name) => name.endsWith("-hero.svg"));

let scanned = 0;
let updated = 0;
const skipped = [];
const log = [];

for (const filename of heroFiles) {
  scanned += 1;
  const slug = filename.replace(/-hero\.svg$/, "");
  const title = readArticleTitle(slug);
  if (!title) {
    skipped.push({ filename, reason: "no matching article HTML" });
    continue;
  }
  const fullPath = join(HERO_DIR, filename);
  const before = readFileSync(fullPath, "utf8");
  const after = rewriteSvg(before, title);
  if (after !== before) {
    writeFileSync(fullPath, after, "utf8");
    updated += 1;
    log.push({ slug, title });
  }
}

// Default hero illustration (article-hero-default.svg) keeps its own
// canonical strings; just migrate the palette.
const defaultPath = join(HERO_DIR, "article-hero-default.svg");
try {
  const before = readFileSync(defaultPath, "utf8");
  const after = migrateColors(before);
  if (after !== before) {
    writeFileSync(defaultPath, after, "utf8");
    log.push({ slug: "article-hero-default", title: "(palette only)" });
    updated += 1;
  }
} catch {}

console.log(JSON.stringify({ scanned, updated, skippedCount: skipped.length }, null, 2));
if (skipped.length) console.log("Skipped:", skipped);
console.log("Updated heroes:");
for (const item of log) console.log(`  ${item.slug}: ${item.title}`);
