#!/usr/bin/env node
/**
 * human-text-gate.mjs
 *
 * Web text, SEO, heading, language, and true-state gate for nguyenlananh.com.
 * It intentionally avoids backend, payment, auth, database, and legal logic.
 *
 * Usage:
 *   node scripts/human-text-gate.mjs
 *   node scripts/human-text-gate.mjs --fail
 *   node scripts/human-text-gate.mjs --json
 *   node scripts/human-text-gate.mjs --no-write
 */

import fs from "node:fs";
import path from "node:path";
import { RELEASE_INCLUDE_PATHS } from "./lib/release-config.mjs";

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const FAIL_ON_ISSUES = ARGS.has("--fail");
const OUTPUT_JSON = ARGS.has("--json");
const NO_WRITE = ARGS.has("--no-write");
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const REPORT_JSON = path.join(REPORT_DIR, "HUMAN_TEXT_GATE_REPORT.json");
const REPORT_MD = path.join(REPORT_DIR, "HUMAN_TEXT_GATE_REPORT.md");

const SKIP_PATH_RE = /\/\[[^\]]+\]\//;
const EXCLUDED_DIRS = new Set([".git", "node_modules", ".wrangler"]);
const HTML_INCLUDE_PATHS = RELEASE_INCLUDE_PATHS.filter((entry) => {
  return !["functions", "assets", "content", "_headers", "_redirects", "robots.txt", "sitemap.xml"].includes(entry);
});

const BLOCKED_SYMBOLS = [
  "✅", "❌", "🎉", "🚨", "⚠", "⚠️", "ℹ", "ℹ️", "👉", "✨", "★", "☆", "◆", "◇", "■", "□", "●"
];
const EDITORIAL_PUNCTUATION_RE = /[–—→]/gu;
const VI_DIACRITICS_RE = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

function walk(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (target.endsWith(".html")) out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    walk(path.join(target, entry.name), out);
  }
  return out;
}

function routeFromFile(filePath) {
  const rel = path.relative(ROOT, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404.html";
  return `/${rel.replace(/index\.html$/, "")}`;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
  return match?.[1]?.trim() || "";
}

function metaContent(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = html.match(new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${escaped}["'][^>]*>`, "i"))?.[0] || "";
  return attr(tag, "content");
}

function linkHref(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tag = html.match(new RegExp(`<link\\s+[^>]*rel=["']${escaped}["'][^>]*>`, "i"))?.[0] || "";
  return attr(tag, "href");
}

function stripText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function textWithoutApprovedLocaleLabels(text) {
  return text
    .replaceAll("🇻🇳 Tiếng Việt", "")
    .replaceAll("🇺🇸 English", "")
    .replaceAll("Tiếng Việt", "")
    .replaceAll("Nguyen Lan Anh", "")
    .replaceAll("Lan Anh Nguyen", "");
}

function htmlLang(html) {
  return html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1]?.trim() || "";
}

function headingText(raw) {
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function addIssue(list, file, route, code, message, extra = {}) {
  list.push({ file: path.relative(ROOT, file), route, code, message, ...extra });
}

function auditPage(file) {
  const html = fs.readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const visibleText = stripText(html);
  const cleanedText = textWithoutApprovedLocaleLabels(visibleText);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const description = metaContent(html, "description");
  const canonical = linkHref(html, "canonical");
  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const ogImage = metaContent(html, "og:image");
  const robots = metaContent(html, "robots");
  const lang = htmlLang(html);
  const hMatches = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const h1Count = hMatches.filter((match) => match[1] === "1").length;
  const emptyHeadings = hMatches.filter((match) => !headingText(match[2]));
  const issues = [];
  const warnings = [];

  if (route !== "/404.html" && h1Count !== 1) {
    addIssue(issues, file, route, "h1_count_invalid", `Expected one H1, found ${h1Count}.`);
  }
  for (const heading of emptyHeadings) {
    addIssue(issues, file, route, "empty_heading", `Empty H${heading[1]} heading.`);
  }

  if (!title) addIssue(issues, file, route, "missing_title", "Missing title.");
  if (!description) addIssue(issues, file, route, "missing_description", "Missing meta description.");
  if (!canonical) addIssue(issues, file, route, "missing_canonical", "Missing canonical.");
  if (!ogTitle) addIssue(issues, file, route, "missing_og_title", "Missing og:title.");
  if (!ogDescription) addIssue(issues, file, route, "missing_og_description", "Missing og:description.");
  if (route !== "/404.html" && !ogImage) addIssue(issues, file, route, "missing_og_image", "Missing og:image.");
  if (!lang) addIssue(issues, file, route, "missing_html_lang", "Missing html lang.");

  for (const symbol of BLOCKED_SYMBOLS) {
    if (cleanedText.includes(symbol)) {
      addIssue(issues, file, route, "forbidden_decorative_symbol", `Forbidden decorative/status symbol: ${symbol}`);
    }
  }

  const editorialMatches = cleanedText.match(EDITORIAL_PUNCTUATION_RE) || [];
  if (editorialMatches.length) {
    addIssue(warnings, file, route, "legacy_editorial_punctuation", "Editorial dash or arrow found. New copy should use plain text unless editorially approved.", {
      count: editorialMatches.length,
      chars: [...new Set(editorialMatches)].join(""),
    });
  }

  if (route.startsWith("/en/") && VI_DIACRITICS_RE.test(cleanedText)) {
    addIssue(issues, file, route, "english_page_contains_vietnamese", "English page contains Vietnamese diacritics outside approved labels.");
  }

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgTags) {
    const src = attr(img, "src");
    const alt = attr(img, "alt");
    const decorative = /role=["']presentation["']|aria-hidden=["']true["']/i.test(img);
    if (!decorative && !alt) {
      addIssue(issues, file, route, "missing_image_alt", `Image missing alt: ${src || "(no src)"}`);
    }
  }

  const hStatus = route === "/404.html" ? "SKIPPED_404" : h1Count === 1 ? "PASS" : "FAIL";
  const characterStatus = issues.some((issue) => issue.code === "forbidden_decorative_symbol") ? "FAIL" : "PASS";
  const seoStatus = ["missing_title", "missing_description", "missing_canonical", "missing_og_title", "missing_og_description", "missing_og_image"]
    .some((code) => issues.some((issue) => issue.code === code)) ? "FAIL" : "PASS";

  return {
    url: route,
    file: path.relative(ROOT, file),
    page_role: route.startsWith("/admin/") || route.startsWith("/en/admin/") ? "admin" : route.startsWith("/members/") || route.startsWith("/en/members/") ? "members" : "public",
    h1_status: hStatus,
    character_hygiene: characterStatus,
    seo_metadata: seoStatus,
    canonical: canonical ? "PASS" : "FAIL",
    og_image: ogImage ? "PASS" : route === "/404.html" ? "SKIPPED_404" : "FAIL",
    alt_text: issues.some((issue) => issue.code === "missing_image_alt") ? "FAIL" : "PASS",
    language: lang || "MISSING",
    true_state: /noindex/i.test(robots) ? "NOINDEX" : "INDEXABLE",
    next_action: issues.length ? "FIX_BEFORE_WEB_READY" : warnings.length ? "EDITORIAL_REVIEW_OPTIONAL" : "NONE",
    issues,
    warnings,
  };
}

const protocolPath = path.join(ROOT, "docs", "HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL.md");
const disciplinePath = path.join(ROOT, "docs", "DEV_TEAM_RELEASE_DISCIPLINE.md");
const governanceIssues = [];

if (!fs.existsSync(protocolPath)) {
  governanceIssues.push({ file: "docs/HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL.md", code: "protocol_missing", message: "Protocol file is missing." });
} else {
  const protocol = fs.readFileSync(protocolPath, "utf8");
  for (const required of ["Web implementation boundary", "Technical token exception", "Required report shape", "Release gate for this repo"]) {
    if (!protocol.includes(required)) {
      governanceIssues.push({ file: "docs/HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL.md", code: "protocol_section_missing", message: `Missing section: ${required}` });
    }
  }
}

if (!fs.existsSync(disciplinePath) || !fs.readFileSync(disciplinePath, "utf8").includes("HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL")) {
  governanceIssues.push({ file: "docs/DEV_TEAM_RELEASE_DISCIPLINE.md", code: "release_discipline_not_linked", message: "Release discipline must link the human text protocol." });
}

const files = HTML_INCLUDE_PATHS
  .flatMap((entry) => walk(path.join(ROOT, entry)))
  .filter((file) => !SKIP_PATH_RE.test(file.split(path.sep).join("/")))
  .sort();

const inventory = files.map(auditPage);
const pageIssues = inventory.flatMap((page) => page.issues);
const pageWarnings = inventory.flatMap((page) => page.warnings);
const issues = [...governanceIssues, ...pageIssues];
const issueCounts = {};
for (const issue of issues) issueCounts[issue.code] = (issueCounts[issue.code] || 0) + 1;
const warningCounts = {};
for (const warning of pageWarnings) warningCounts[warning.code] = (warningCounts[warning.code] || 0) + 1;

const report = {
  summary: {
    generatedAt: new Date().toISOString(),
    pagesAudited: inventory.length,
    totalIssues: issues.length,
    totalWarnings: pageWarnings.length,
    issueCounts,
    warningCounts,
    trueState: issues.length ? "HUMAN_TEXT_GATE_FAIL" : "HUMAN_TEXT_GATE_PASS",
  },
  issues,
  warnings: pageWarnings,
  inventory,
};

const markdownInventory = inventory
  .map((page) => `| ${page.url} | ${page.page_role} | ${page.h1_status} | ${page.character_hygiene} | ${page.seo_metadata} | ${page.canonical} | ${page.og_image} | ${page.alt_text} | ${page.language} | ${page.true_state} | ${page.next_action} |`)
  .join("\n");

const markdown = `# Human Text Gate Report

Verdict:
${issues.length ? "CHARACTER_OR_TEXT_GATE_BLOCKED" : "WEB_TEXT_GATE_PASS"}

Evidence checked:
- ${inventory.length} HTML files in release scope.
- docs/HUMAN_TEXT_CHARACTER_AND_RESPONSE_PROTOCOL.md.
- docs/DEV_TEAM_RELEASE_DISCIPLINE.md link to the protocol.
- H1 count, empty headings, SEO metadata, canonical, Open Graph image, language, alt text, visible text symbols, and true state.

Pass:
${issues.length ? "- See Fail." : "- Human text blocking gate has zero issues."}

Fail:
${issues.length ? issues.map((issue) => `- ${issue.file || issue.route}: ${issue.code} - ${issue.message}`).join("\n") : "- None"}

Blocked by Founder:
- None.

Blocked by external asset:
- None.

True state:
${issues.length ? "HUMAN_TEXT_GATE_FAIL" : "HUMAN_TEXT_GATE_PASS"}

Team command:
Run \`node scripts/human-text-gate.mjs --fail\` before claiming any page is web-ready, SEO-ready, publication-ready, or release-ready.

Hard stop:
If this report has any Fail item, do not call the site web-ready.

Notes:
- Legacy editorial dash or arrow punctuation is reported as warning, not blocker, until a page-level editorial rewrite is approved.
- Approved language switch flags are not decorative copy and are excluded from character failures.

## Summary

- Generated at: ${report.summary.generatedAt}
- Pages audited: ${report.summary.pagesAudited}
- Total issues: ${report.summary.totalIssues}
- Total warnings: ${report.summary.totalWarnings}

## Issue Counts

${Object.entries(issueCounts).map(([code, count]) => `- ${code}: ${count}`).join("\n") || "- None"}

## Warning Counts

${Object.entries(warningCounts).map(([code, count]) => `- ${code}: ${count}`).join("\n") || "- None"}

## URL Inventory

| URL | page role | H1 status | character hygiene | SEO metadata | canonical | OG image | alt text | language | true state | next action |
|---|---|---|---|---|---|---|---|---|---|---|
${markdownInventory}
`;

if (!NO_WRITE) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_MD, markdown, "utf8");
}

if (OUTPUT_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Human text gate: ${report.summary.trueState}`);
  console.log(`Pages audited: ${report.summary.pagesAudited}`);
  console.log(`Issues: ${report.summary.totalIssues}`);
  console.log(`Warnings: ${report.summary.totalWarnings}`);
  if (issues.length) {
    for (const issue of issues.slice(0, 20)) {
      console.log(`- ${issue.file || issue.route}: ${issue.code} - ${issue.message}`);
    }
    if (issues.length > 20) console.log(`...and ${issues.length - 20} more`);
  }
}

if (FAIL_ON_ISSUES && issues.length > 0) process.exit(1);
