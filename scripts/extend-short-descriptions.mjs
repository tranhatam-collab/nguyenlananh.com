#!/usr/bin/env node
/**
 * extend-short-descriptions.mjs
 *
 * Some article meta descriptions sit at 55-69 characters — under the 70-165
 * SEO band the release standard expects. Each affected page already has a
 * <p class="sub"> paragraph that summarises the article in human voice;
 * those sub paragraphs are typically 80-170 characters long. This script
 * promotes that sub paragraph (or the existing meta description, whichever
 * fits) into the meta description, and keeps og:description / twitter:
 * description in sync. Title-side fields are not touched.
 *
 * The script is idempotent: it only updates a description when the current
 * one is shorter than 70 characters AND the candidate replacement is longer
 * than the current one and within the 70-165 band.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([
  ".git", ".claude", "node_modules", "docs", "scripts", "functions", ".wrangler"
]);

const DESC_MIN = 70;
const DESC_MAX = 165;

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

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function trimToBand(text) {
  if (!text) return null;
  if (text.length >= DESC_MIN && text.length <= DESC_MAX) return text;
  if (text.length > DESC_MAX) {
    // Trim at the last word boundary that fits.
    const slice = text.slice(0, DESC_MAX - 1).replace(/\s+\S*$/u, "").trim();
    return slice.length >= DESC_MIN ? slice : null;
  }
  return null;
}

function pickReplacement(currentDesc, h1Text, subText) {
  const candidates = [];

  // 1. Trimmed current desc (covers descriptions that are too long).
  const trimmedCurrent = trimToBand(currentDesc);
  if (trimmedCurrent && trimmedCurrent !== currentDesc) candidates.push(trimmedCurrent);

  // 2. Sub paragraph as is, if it fits.
  if (subText && subText.length >= DESC_MIN && subText.length <= DESC_MAX) {
    candidates.push(subText);
  }

  // 3. Current desc + sub, if combined fits the band.
  if (currentDesc && subText) {
    const combined = `${currentDesc} ${subText}`.replace(/\s+/g, " ").trim();
    if (combined.length >= DESC_MIN && combined.length <= DESC_MAX) {
      candidates.push(combined);
    }
  }

  // 4. h1 + current desc as a last fallback.
  if (h1Text && currentDesc) {
    const h1Plus = `${h1Text}: ${currentDesc}`.replace(/\s+/g, " ").trim();
    if (h1Plus.length >= DESC_MIN && h1Plus.length <= DESC_MAX) {
      candidates.push(h1Plus);
    }
  }

  // 5. Trimmed sub if it was originally too long.
  if (subText && subText.length > DESC_MAX) {
    const trimmedSub = trimToBand(subText);
    if (trimmedSub) candidates.push(trimmedSub);
  }

  // Best candidate = longest within band.
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] || null;
}

const stats = { scanned: 0, updated: 0, skipped: 0 };
const log = [];

for await (const file of walk(ROOT)) {
  stats.scanned += 1;
  let html = readFileSync(file, "utf8");

  // Apply to every page, including noindex admin/legal pages — internal
  // clarity still requires a 70-165 char description per the release standard.
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!descMatch) continue;
  const currentDesc = decode(descMatch[1].trim());
  if (currentDesc.length >= DESC_MIN && currentDesc.length <= DESC_MAX) continue;

  const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? decode(h1Match[1].replace(/<[^>]+>/g, "").trim()) : "";

  const subMatch = html.match(/<p\s+class="sub"[^>]*>([\s\S]*?)<\/p>/i);
  const subText = subMatch ? decode(subMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()) : "";

  const replacement = pickReplacement(currentDesc, h1Text, subText);
  if (!replacement || replacement === currentDesc) {
    stats.skipped += 1;
    continue;
  }

  const escaped = escAttr(replacement);
  const before = html;
  html = html.replace(/(<meta\s+name="description"\s+content=)"[^"]*"/i, `$1"${escaped}"`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=)"[^"]*"/i, `$1"${escaped}"`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=)"[^"]*"/i, `$1"${escaped}"`);

  if (html !== before) {
    writeFileSync(file, html, "utf8");
    stats.updated += 1;
    log.push({
      file: relative(ROOT, file),
      old_len: currentDesc.length,
      new_len: replacement.length
    });
  } else {
    stats.skipped += 1;
  }
}

console.log(JSON.stringify(stats, null, 2));
for (const item of log) {
  console.log(`  ${String(item.old_len).padStart(3)} -> ${String(item.new_len).padStart(3)}  ${item.file}`);
}
