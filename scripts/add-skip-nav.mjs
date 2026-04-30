#!/usr/bin/env node
/**
 * add-skip-nav.mjs
 *
 * Two-part WCAG 2.4.1 fix:
 *   1. Adds id="main" to <main> elements that lack it (skip-nav target).
 *   2. Adds <a class="skip" href="#main"> after <body> (the bypass link).
 *
 * Locale from <html lang="…">:
 *   VI → "Bỏ qua điều hướng"
 *   EN → "Skip navigation"
 *
 * Idempotent — pages that already have both are unchanged.
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
let mainIdAdded = 0;
let skipLinkAdded = 0;
let skippedNoMain = 0;

for await (const file of walk(ROOT)) {
  scanned += 1;
  let html = readFileSync(file, "utf8");
  let changed = false;

  const rel = relative(ROOT, file);
  // Skip 404 standalone page
  if (rel === "404.html") continue;

  // 1. Add id="main" to <main> if missing
  if (/<main\b/.test(html) && !/id="main"/.test(html)) {
    html = html.replace(/<main\b/, '<main id="main"');
    mainIdAdded += 1;
    changed = true;
  }

  // Must have #main target for skip-nav to work
  if (!/id="main"/.test(html)) {
    skippedNoMain += 1;
    if (changed) writeFileSync(file, html, "utf8");
    continue;
  }

  // 2. Add skip link if missing
  if (!/class="skip"/.test(html)) {
    const isEN = /<html[^>]*\blang="en/i.test(html);
    const label = isEN ? "Skip navigation" : "Bỏ qua điều hướng";
    const skipLink = `<a class="skip" href="#main">${label}</a>`;

    html = html.replace(
      /(<body[^>]*>)/i,
      `$1\n  ${skipLink}`
    );
    skipLinkAdded += 1;
    changed = true;
  }

  if (changed) writeFileSync(file, html, "utf8");
}

console.log(JSON.stringify({ scanned, mainIdAdded, skipLinkAdded, skippedNoMain }, null, 2));
