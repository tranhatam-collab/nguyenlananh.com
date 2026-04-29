import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE_URL = process.env.BASE_URL || "http://localhost:4173";
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const JSON_PATH = path.join(REPORT_DIR, "LOCAL_PUBLIC_SITE_AUDIT.json");
const MD_PATH = path.join(REPORT_DIR, "LOCAL_PUBLIC_SITE_AUDIT.md");

const INCLUDE_PATHS = [
  "404.html",
  "admin",
  "assets",
  "bai-viet",
  "chinh-sach-bao-mat",
  "chuong-trinh",
  "dieu-khoan",
  "du-an",
  "en",
  "faq",
  "gioi-thieu",
  "hanh-trinh",
  "index.html",
  "join",
  "lien-he",
  "members",
  "mien-tru-trach-nhiem",
  "phuong-phap"
];

const INTERNAL_COPY_PATTERNS = [
  /lorem ipsum/i,
  /\bTODO\b/i,
  /\bTBD\b/i,
  /placeholder/i,
  /coming soon/i,
  /đang cập nhật/i,
  /dang cap nhat/i,
  /\bPhase\s+\d\b/i,
  /admin-only/i,
  /debug/i,
  /dummy/i,
  /test user/i,
  /Top blockers/i
];

const VI_DIACRITICS = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

function walk(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (target.endsWith(".html")) out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
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

function attr(html, name) {
  const pattern = new RegExp(`${name}=["']([^"']*)["']`, "i");
  return html.match(pattern)?.[1]?.trim() || "";
}

function metaContent(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${escaped}["'][^>]*>`, "i");
  const tag = html.match(pattern)?.[0] || "";
  return attr(tag, "content");
}

function linkHref(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<link\\s+[^>]*rel=["']${escaped}["'][^>]*>`, "i");
  const tag = html.match(pattern)?.[0] || "";
  return attr(tag, "href");
}

function stripText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectHtmlFiles() {
  return INCLUDE_PATHS.flatMap((rel) => walk(path.join(ROOT, rel)))
    .filter((file) => !file.includes(`${path.sep}docs${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}.next${path.sep}`))
    .filter((file) => !file.includes(`${path.sep}.vercel${path.sep}`))
    .sort();
}

function collectRefs(html) {
  const refs = [];
  const re = /\s(?:href|src)=["']([^"']+)["']/gi;
  let match;
  while ((match = re.exec(html))) refs.push(match[1]);
  return refs;
}

function normalizeLocalRef(ref, route) {
  if (!ref || ref.startsWith("#")) return "";
  if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(ref)) return "";
  try {
    const url = ref.startsWith("http")
      ? new URL(ref)
      : new URL(ref, `${BASE_URL}${route}`);
    if (url.origin !== BASE_URL) return "";
    return url.pathname;
  } catch {
    return "";
  }
}

function checkUrl(pathname) {
  const url = `${BASE_URL}${pathname}`;
  if (pathname.startsWith("/api/")) return { url, status: "local-api-unavailable" };

  const decoded = decodeURIComponent(pathname);
  const candidates = [];
  if (decoded.endsWith("/")) candidates.push(path.join(ROOT, decoded.slice(1), "index.html"));
  candidates.push(path.join(ROOT, decoded.slice(1)));
  if (!path.extname(decoded)) candidates.push(path.join(ROOT, decoded.slice(1), "index.html"));

  const exists = candidates.some((candidate) => fs.existsSync(candidate));
  return { url, status: exists ? 200 : 404 };
}

function auditPage(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFromFile(filePath);
  const text = stripText(html);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
  const description = metaContent(html, "description");
  const canonical = linkHref(html, "canonical");
  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const twitterTitle = metaContent(html, "twitter:title");
  const twitterDescription = metaContent(html, "twitter:description");
  const lang = html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1] || "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const issues = [];

  const add = (severity, code, message) => issues.push({ severity, code, message });

  if (!title) add("high", "missing_title", "Missing <title>.");
  if (title.length > 65) add("medium", "long_title", `<title> is ${title.length} characters.`);
  if (!description) add("high", "missing_meta_description", "Missing meta description.");
  if (description && (description.length < 70 || description.length > 165)) {
    add("medium", "meta_description_length", `Meta description is ${description.length} characters.`);
  }
  if (!canonical) add("high", "missing_canonical", "Missing canonical URL.");
  if (!ogTitle) add("high", "missing_og_title", "Missing og:title.");
  if (!ogDescription) add("high", "missing_og_description", "Missing og:description.");
  if (!twitterTitle) add("medium", "missing_twitter_title", "Missing twitter:title.");
  if (!twitterDescription) add("medium", "missing_twitter_description", "Missing twitter:description.");
  if (!lang) add("high", "missing_html_lang", "Missing html lang.");
  if (route !== "/404.html" && h1Count !== 1) add("high", "invalid_h1_count", `Expected 1 h1, found ${h1Count}.`);

  for (const pattern of INTERNAL_COPY_PATTERNS) {
    const match = text.match(pattern);
    if (match) add("high", "internal_or_placeholder_copy", `Found public copy pattern: ${match[0]}`);
  }

  if (route.startsWith("/en/")) {
    const cleaned = text
      .replace(/🇻🇳 Tiếng Việt/g, "")
      .replace(/Tiếng Việt/g, "")
      .replace(/Nguyen Lan Anh/g, "");
    if (VI_DIACRITICS.test(cleaned)) add("high", "english_page_contains_vietnamese_diacritics", "English page still contains Vietnamese diacritics.");
  }

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgTags) {
    const src = attr(img, "src");
    const alt = attr(img, "alt");
    const decorative = /role=["']presentation["']|aria-hidden=["']true["']/i.test(img);
    if (!decorative && !alt) add("high", "missing_image_alt", `Image missing alt: ${src || "(no src)"}`);
    if (src && src.includes(" ")) add("high", "asset_path_contains_space", `Image path contains a space: ${src}`);
  }

  const refs = collectRefs(html).map((ref) => normalizeLocalRef(ref, route)).filter(Boolean);
  return { route, file: path.relative(ROOT, filePath), title, description, issues, refs: [...new Set(refs)] };
}

const files = collectHtmlFiles();
const audits = files.map(auditPage);
const refSet = new Set(audits.flatMap((audit) => audit.refs));
const linkChecks = [];
for (const ref of refSet) linkChecks.push(checkUrl(ref));

const brokenRefs = linkChecks.filter((item) => Number(item.status) >= 400 || item.status === 0);
const localApiRefs = linkChecks.filter((item) => item.status === "local-api-unavailable");
const issueCounts = {};
for (const audit of audits) {
  for (const issue of audit.issues) issueCounts[issue.code] = (issueCounts[issue.code] || 0) + 1;
}

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  pagesAudited: audits.length,
  pagesWithIssues: audits.filter((audit) => audit.issues.length).length,
  totalIssues: audits.reduce((sum, audit) => sum + audit.issues.length, 0),
  brokenInternalRefs: brokenRefs.length,
  localApiRefs: localApiRefs.length,
  issueCounts
};

const report = { summary, audits, brokenRefs, localApiRefs };
fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const topPages = audits
  .filter((audit) => audit.issues.length)
  .slice(0, 80)
  .map((audit) => `- ${audit.route}: ${audit.issues.map((issue) => issue.code).join(", ")}`)
  .join("\n");

const topBroken = brokenRefs
  .slice(0, 80)
  .map((item) => `- ${item.status} ${item.url}${item.error ? ` (${item.error})` : ""}`)
  .join("\n");

const markdown = `# Local Public Site Audit

- Generated at: ${summary.generatedAt}
- Base URL: ${summary.baseUrl}
- Pages audited: ${summary.pagesAudited}
- Pages with issues: ${summary.pagesWithIssues}
- Total issues: ${summary.totalIssues}
- Broken internal refs: ${summary.brokenInternalRefs}
- Local API refs skipped: ${summary.localApiRefs}

## Issue Counts

${Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).map(([code, count]) => `- ${code}: ${count}`).join("\n") || "- None"}

## Pages With Issues

${topPages || "- None"}

## Broken Internal Refs

${topBroken || "- None"}
`;

fs.writeFileSync(MD_PATH, markdown, "utf8");

console.log(`Local public audit written to ${JSON_PATH}`);
console.log(`Markdown report written to ${MD_PATH}`);
console.log(JSON.stringify(summary, null, 2));

if (summary.totalIssues > 0 || summary.brokenInternalRefs > 0) process.exitCode = 1;
