#!/usr/bin/env node
/**
 * strip-hero-text.mjs
 *
 * Article hero SVGs are purely decorative — the article page already
 * shows the canonical h1 directly above the image, so embedded title
 * text only causes problems (locale leak: VI title showing on EN
 * pages, dev-voice captions like "Article visual"). This script
 * removes every <text>…</text> row from each hero SVG, leaving only
 * the abstract gradient and stroke decorations.
 *
 * Idempotent.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const HERO_DIR = join(ROOT, "assets/images/articles");

const TEXT_RE = /\s*<text\b[^>]*>[\s\S]*?<\/text>\s*/g;
// Strip text wrappers that only carry typography setup (font-family, fill).
// We keep <g> wrappers if they hold decoration, so only collapse a <g> when
// it became empty after the <text> children were removed.
const EMPTY_GROUP_RE = /\s*<g\b[^>]*>\s*<\/g>\s*/g;

const heroFiles = (await readdir(HERO_DIR)).filter((name) => name.endsWith(".svg"));

let scanned = 0;
let updated = 0;

for (const filename of heroFiles) {
  scanned += 1;
  const fullPath = join(HERO_DIR, filename);
  const before = readFileSync(fullPath, "utf8");
  let after = before.replace(TEXT_RE, "\n  ");
  after = after.replace(EMPTY_GROUP_RE, "\n");
  if (after !== before) {
    writeFileSync(fullPath, after, "utf8");
    updated += 1;
  }
}

console.log(JSON.stringify({ scanned, updated }, null, 2));
