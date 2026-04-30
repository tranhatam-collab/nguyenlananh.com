#!/usr/bin/env node
/**
 * add-og-image.mjs
 *
 * Ensures every public HTML page has an og:image meta tag for social
 * sharing previews. Pages that already have one are skipped.
 *
 * Default fallback: og-homepage.svg (the generic brand social card).
 * Article pages that have a dedicated og image in /assets/og/ already
 * have it set — this script only fills in the gaps.
 *
 * Also adds twitter:image to match og:image when missing.
 *
 * Idempotent — safe to re-run.
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

const DEFAULT_OG_IMAGE = "https://www.nguyenlananh.com/assets/og/og-homepage.svg";

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
let ogAdded = 0;
let twitterAdded = 0;
let skipped = 0;

for await (const file of walk(ROOT)) {
  scanned += 1;
  let html = readFileSync(file, "utf8");
  let changed = false;

  // Skip 404 and [slug] template pages
  const rel = relative(ROOT, file);
  if (rel === "404.html" || rel.includes("[slug]")) {
    skipped += 1;
    continue;
  }

  // Add og:image if missing
  if (!/property="og:image"/.test(html)) {
    const ogImageTag = `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`;
    // Insert after og:url or og:description or og:title, or before </head>
    if (/property="og:url"/.test(html)) {
      html = html.replace(
        /(<meta\s+property="og:url"[^>]*\/>)/i,
        `$1\n  ${ogImageTag}`
      );
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `  ${ogImageTag}\n</head>`);
    }
    ogAdded += 1;
    changed = true;
  }

  // Add twitter:image if missing (match og:image value)
  if (!/name="twitter:image"/.test(html)) {
    const ogMatch = html.match(/property="og:image"\s+content="([^"]*)"/);
    const imageUrl = ogMatch ? ogMatch[1] : DEFAULT_OG_IMAGE;
    const twitterImageTag = `<meta name="twitter:image" content="${imageUrl}" />`;
    if (/name="twitter:card"/.test(html)) {
      html = html.replace(
        /(<meta\s+name="twitter:card"[^>]*\/>)/i,
        `$1\n  ${twitterImageTag}`
      );
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `  ${twitterImageTag}\n</head>`);
    }
    twitterAdded += 1;
    changed = true;
  }

  if (changed) writeFileSync(file, html, "utf8");
}

console.log(JSON.stringify({ scanned, ogAdded, twitterAdded, skipped }, null, 2));
