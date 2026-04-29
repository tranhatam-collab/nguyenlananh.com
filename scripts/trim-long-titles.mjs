#!/usr/bin/env node
/**
 * trim-long-titles.mjs
 *
 * Some pages put " | Nguyenlananh.com" at the end of <title>, which pushes
 * naturally long article titles past the 70-char SEO limit. This script
 * strips that brand suffix on every <title> longer than 65 chars (to give
 * a 5-char buffer under the 70-char gate). It does NOT touch og:title or
 * twitter:title, so the brand is still present in social previews.
 *
 * Idempotent. Read-only outside the strip.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([".git", ".claude", "node_modules", "docs", "scripts", "functions", ".wrangler"]);
const SUFFIX = " | Nguyenlananh.com";
const MAX_TITLE = 65;

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
const trimmed = [];

for await (const file of walk(ROOT)) {
  scanned += 1;
  const before = readFileSync(file, "utf8");
  const after = before.replace(/<title>([^<]+)<\/title>/, (whole, current) => {
    const t = current.trim();
    if (!t.endsWith(SUFFIX)) return whole;
    if (t.length <= MAX_TITLE) return whole;
    const stripped = t.slice(0, t.length - SUFFIX.length).trim();
    return `<title>${stripped}</title>`;
  });
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    updated += 1;
    const m = after.match(/<title>([^<]+)<\/title>/);
    trimmed.push({ file: file.replace(ROOT + "/", ""), title: m?.[1], len: m?.[1]?.length });
  }
}

console.log(JSON.stringify({ scanned, updated }, null, 2));
for (const t of trimmed) console.log(`  ${t.len.toString().padStart(3)} | ${t.file}`);
