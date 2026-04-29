#!/usr/bin/env node
/**
 * content-audit.mjs
 *
 * Internal pre-deploy audit. Catches the kinds of issues the bilingual
 * release validator does not: internal link integrity, missing assets,
 * meta length, placeholder/dev-voice copy, sitemap hygiene, and public
 * pages that are missing <title> or <h1>.
 *
 * Usage:
 *   node scripts/content-audit.mjs            # human-readable report
 *   node scripts/content-audit.mjs --json     # JSON to stdout
 *   node scripts/content-audit.mjs --fail     # exit 1 if any issues
 *
 * The script reads only — never writes. Safe to re-run.
 */

import { readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARGS = new Set(process.argv.slice(2));
const OUTPUT_JSON = ARGS.has("--json");
const FAIL_ON_ISSUES = ARGS.has("--fail");

const EXCLUDE_DIRS = new Set([
  ".git", ".claude", "node_modules", "docs", "scripts",
  "functions", ".wrangler",
  // "nguyenlananh.com" is a stray legacy subfolder kept around for reference;
  // it is NOT the deployable site (the deployable site is at the repo root).
  "nguyenlananh.com",
]);

// Paths that look like Next.js-style dynamic templates ("[slug]") are
// build artefacts, not real public pages. Skip them entirely.
const TEMPLATE_PATH_RE = /\/\[[^\]]+\]\//;

// ────────────────────────────────────────────────────────────────────
// Limits & known-bad patterns
// ────────────────────────────────────────────────────────────────────

const TITLE_MIN = 25;
const TITLE_MAX = 70;
const DESC_MIN  = 70;
const DESC_MAX  = 180;

// User-facing copy must never contain these. Each entry: pattern + reason.
const BAD_COPY_PATTERNS = [
  { rx: /\bLorem\s+ipsum\b/i,                      reason: "Lorem ipsum placeholder" },
  { rx: /\bTODO\b/,                                 reason: "TODO marker" },
  { rx: /\bFIXME\b/,                                reason: "FIXME marker" },
  { rx: /\bTBD\b/,                                  reason: "TBD marker" },
  { rx: /\[slug\]/i,                                reason: "[slug] template placeholder" },
  { rx: /khoá\s*voice|khóa\s*voice/i,              reason: "dev-voice: 'khoá voice'" },
  { rx: /voice[- ]locked/i,                         reason: "dev-voice: 'voice-locked'" },
  { rx: /locked\s+reading\s+order/i,                reason: "dev-voice: 'locked reading order'" },
  { rx: /publish\s+order/i,                         reason: "dev-voice: 'publish order'" },
  { rx: /go\s+live\s+as/i,                          reason: "dev-voice: 'go live as…'" },
  { rx: /\bArticle visual\b/,                       reason: "placeholder caption 'Article visual'" },
  { rx: /đang\s+cập\s+nhật\s+bản\s+xác\s+thực/i,   reason: "placeholder 'đang cập nhật bản xác thực'" },
  { rx: /Phase\s*1\s*\/\s*Phase\s*2/i,             reason: "internal phase placeholder" },
  { rx: /Loạt\s+pillar\s+mới/i,                    reason: "dev-voice: 'Loạt pillar mới'" },
];

// Every <loc> in sitemap must NOT contain these.
const SITEMAP_FORBIDDEN = [
  { rx: /docs\/iai\.one-platform/, reason: "submodule path leaked into sitemap" },
  { rx: /\s/,                       reason: "literal whitespace in URL" },
];

// ────────────────────────────────────────────────────────────────────
// Walking helpers
// ────────────────────────────────────────────────────────────────────

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function fileExists(absolute) {
  try { statSync(absolute); return true; } catch { return false; }
}

// Resolve an internal href (from a given source file) to an absolute path
// inside the repo. Returns null if the href points to nothing checkable.
function resolveInternalHref(href, sourceFile) {
  if (!href) return null;
  // Strip query/hash so /path/?x=1#y → /path/
  const cleaned = href.split("#", 1)[0].split("?", 1)[0];
  if (!cleaned) return null;
  // Skip protocols, mailto, tel, javascript, anchors
  if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(cleaned)) return null;
  if (cleaned.startsWith("//")) return null;
  // Skip API + functions endpoints (server routes, not files on disk)
  if (cleaned.startsWith("/api/")) return null;
  // Skip cdn / wrangler / cloudflare cgi
  if (cleaned.startsWith("/cdn-cgi/")) return null;

  let target;
  if (cleaned.startsWith("/")) {
    target = join(ROOT, cleaned);
  } else {
    // relative
    target = resolve(dirname(sourceFile), cleaned);
  }

  // Directory-style URL → expect index.html
  if (cleaned.endsWith("/") || (!/\.[a-z0-9]+$/i.test(cleaned))) {
    return join(target, "index.html");
  }
  return target;
}

// ────────────────────────────────────────────────────────────────────
// HTML field extractors (regex — fine for our static HTML shape)
// ────────────────────────────────────────────────────────────────────

function extractField(html, rx) {
  const m = html.match(rx);
  return m ? m[1].trim() : null;
}

function extractAll(html, rx) {
  const out = [];
  let m;
  while ((m = rx.exec(html)) !== null) out.push(m[1]);
  return out;
}

const TITLE_RX       = /<title>([^<]*)<\/title>/i;
const DESC_RX        = /<meta\s+name="description"\s+content="([^"]*)"/i;
const ROBOTS_RX      = /<meta\s+name="robots"\s+content="([^"]*)"/i;
const CANONICAL_RX   = /<link\s+rel="canonical"\s+href="([^"]*)"/i;
const H1_RX          = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i;
const HREF_RX        = /<a\b[^>]*\shref="([^"]+)"/gi;
const IMG_RX         = /<img\b[^>]*\ssrc="([^"]+)"/gi;
const SCRIPT_SRC_RX  = /<script\b[^>]*\ssrc="([^"]+)"/gi;
const STYLE_HREF_RX  = /<link\b[^>]*\srel="stylesheet"[^>]*\shref="([^"]+)"/gi;
const ALT_HREF_STYLE = /<link\b[^>]*\shref="([^"]+)"[^>]*\srel="stylesheet"/gi;

// ────────────────────────────────────────────────────────────────────
// Issue collector
// ────────────────────────────────────────────────────────────────────

const issues = {
  broken_internal_links: [],
  missing_assets: [],
  meta_missing: [],
  meta_too_short: [],
  meta_too_long: [],
  placeholder_copy: [],
  sitemap_hygiene: [],
  missing_h1: [],
};

function rel(p) { return relative(ROOT, p); }

// ────────────────────────────────────────────────────────────────────
// Per-file HTML audit
// ────────────────────────────────────────────────────────────────────

const htmlFiles = [];

for await (const file of walk(ROOT)) {
  if (!file.endsWith(".html")) continue;
  if (TEMPLATE_PATH_RE.test(file)) continue;
  htmlFiles.push(file);
}

let scanned = 0;
let bytesProcessed = 0;

for (const file of htmlFiles) {
  scanned += 1;
  const html = readFileSync(file, "utf8");
  bytesProcessed += html.length;

  const robots = extractField(html, ROBOTS_RX) || "";
  const isIndexable = !/noindex/i.test(robots);

  // 1. Internal link integrity (skip if file is template-style with [slug])
  const isTemplate = file.includes("/[slug]/");
  if (!isTemplate) {
    const seen = new Set();
    for (const m of html.matchAll(HREF_RX)) {
      const href = m[1];
      if (seen.has(href)) continue;
      seen.add(href);
      const target = resolveInternalHref(href, file);
      if (!target) continue;
      if (!fileExists(target)) {
        issues.broken_internal_links.push({
          file: rel(file),
          href,
          expected: rel(target),
        });
      }
    }
  }

  // 2. Asset existence: <img>, <script src>, <link rel="stylesheet">
  for (const m of html.matchAll(IMG_RX)) {
    const src = m[1];
    const target = resolveInternalHref(src, file);
    if (target && !fileExists(target)) {
      issues.missing_assets.push({ file: rel(file), kind: "img", src });
    }
  }
  for (const m of html.matchAll(SCRIPT_SRC_RX)) {
    const src = m[1];
    const target = resolveInternalHref(src, file);
    if (target && !fileExists(target)) {
      issues.missing_assets.push({ file: rel(file), kind: "script", src });
    }
  }
  for (const rx of [STYLE_HREF_RX, ALT_HREF_STYLE]) {
    for (const m of html.matchAll(rx)) {
      const src = m[1];
      const target = resolveInternalHref(src, file);
      if (target && !fileExists(target)) {
        issues.missing_assets.push({ file: rel(file), kind: "stylesheet", src });
      }
    }
  }

  // 3 & 4 & 7: title / description / h1 only matter for indexable pages
  if (isIndexable) {
    const title = extractField(html, TITLE_RX);
    const desc  = extractField(html, DESC_RX);
    const h1Raw = extractField(html, H1_RX);
    const h1Text = h1Raw ? h1Raw.replace(/<[^>]+>/g, "").trim() : "";

    if (!title) {
      issues.meta_missing.push({ file: rel(file), field: "title" });
    } else if (title.length < TITLE_MIN) {
      issues.meta_too_short.push({ file: rel(file), field: "title", length: title.length, value: title });
    } else if (title.length > TITLE_MAX) {
      issues.meta_too_long.push({ file: rel(file), field: "title", length: title.length, value: title });
    }

    if (!desc) {
      issues.meta_missing.push({ file: rel(file), field: "description" });
    } else if (desc.length < DESC_MIN) {
      issues.meta_too_short.push({ file: rel(file), field: "description", length: desc.length, value: desc });
    } else if (desc.length > DESC_MAX) {
      issues.meta_too_long.push({ file: rel(file), field: "description", length: desc.length, value: desc });
    }

    if (!h1Text) {
      issues.missing_h1.push({ file: rel(file) });
    }
  }

  // 5. Bad copy / placeholders. Strip <script> + <style> + tag attributes
  // first so we audit only visible-ish text. Admin tools use ops jargon by
  // design (they're behind auth + noindex), so skip placeholder scan for
  // any path under /admin/.
  const isAdmin = /\/admin\//.test(file);
  if (!isAdmin) {
    const visible = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ");
    for (const { rx, reason } of BAD_COPY_PATTERNS) {
      const m = visible.match(rx);
      if (m) {
        issues.placeholder_copy.push({
          file: rel(file),
          reason,
          sample: m[0].slice(0, 80),
        });
      }
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// 6. Sitemap hygiene
// ────────────────────────────────────────────────────────────────────

const sitemapPath = join(ROOT, "sitemap.xml");
let sitemapUrls = [];
if (fileExists(sitemapPath)) {
  const xml = readFileSync(sitemapPath, "utf8");
  const locs = extractAll(xml, /<loc>([^<]+)<\/loc>/g);
  sitemapUrls = locs;

  for (const loc of locs) {
    for (const { rx, reason } of SITEMAP_FORBIDDEN) {
      if (rx.test(loc)) {
        issues.sitemap_hygiene.push({ url: loc, reason });
      }
    }
    // Verify each sitemap URL points to a real file
    try {
      const u = new URL(loc);
      const target = resolveInternalHref(u.pathname, sitemapPath);
      if (target && !fileExists(target)) {
        issues.sitemap_hygiene.push({
          url: loc,
          reason: "URL points to a path with no file on disk",
        });
      }
    } catch {
      issues.sitemap_hygiene.push({ url: loc, reason: "URL fails to parse" });
    }
  }
} else {
  issues.sitemap_hygiene.push({ url: "(none)", reason: "sitemap.xml missing at repo root" });
}

// ────────────────────────────────────────────────────────────────────
// Report
// ────────────────────────────────────────────────────────────────────

const totalIssues = Object.values(issues).reduce((sum, list) => sum + list.length, 0);

const report = {
  summary: {
    scanned_files: scanned,
    sitemap_urls: sitemapUrls.length,
    total_issues: totalIssues,
    by_category: Object.fromEntries(
      Object.entries(issues).map(([k, v]) => [k, v.length])
    ),
  },
  issues,
};

if (OUTPUT_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const colors = process.stdout.isTTY ? {
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
    red:  (s) => `\x1b[31m${s}\x1b[0m`,
    yellow:(s)=> `\x1b[33m${s}\x1b[0m`,
    green:(s) => `\x1b[32m${s}\x1b[0m`,
    dim:  (s) => `\x1b[2m${s}\x1b[0m`,
  } : { bold:(s)=>s, red:(s)=>s, yellow:(s)=>s, green:(s)=>s, dim:(s)=>s };

  console.log(colors.bold("\nContent audit"));
  console.log(colors.dim(`  Scanned ${scanned} HTML files · sitemap with ${sitemapUrls.length} URLs`));

  const sorted = Object.entries(issues).sort((a, b) => b[1].length - a[1].length);
  for (const [category, list] of sorted) {
    if (!list.length) continue;
    const headColor = list.length > 0 ? colors.red : colors.green;
    console.log(`\n${colors.bold(category)} ${headColor(`(${list.length})`)}`);
    const preview = list.slice(0, 8);
    for (const item of preview) {
      const summary = Object.entries(item)
        .filter(([k]) => k !== "value")
        .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("  ");
      console.log(`  · ${summary}`);
    }
    if (list.length > preview.length) {
      console.log(colors.dim(`  …and ${list.length - preview.length} more`));
    }
  }

  if (totalIssues === 0) {
    console.log(colors.green("\n✓ No issues found"));
  } else {
    console.log(`\n${colors.bold(colors.red(`Total issues: ${totalIssues}`))}`);
    console.log(colors.dim(`Run with --json for the full report.`));
  }
}

if (FAIL_ON_ISSUES && totalIssues > 0) {
  process.exit(1);
}
