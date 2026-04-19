import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  DOMAIN,
  DEFAULT_LOCALE_CODE,
  buildAlternateLinks,
  buildBrowserI18nConfigSource,
  getAllLocales,
  getLiveLocales,
  localeByCode,
  localeFileFromDefaultFile,
  localizedRoute,
  normalizeRoute,
  stripLocalePrefix
} from "./lib/i18n-config.mjs";

const ROOT = process.cwd();
const LIVE_LOCALES = getLiveLocales();
const NON_DEFAULT_LIVE_LOCALES = LIVE_LOCALES.filter((locale) => locale.code !== DEFAULT_LOCALE_CODE);
const NON_DEFAULT_PREFIXES = getAllLocales()
  .filter((locale) => locale.code !== DEFAULT_LOCALE_CODE && locale.pathSegment)
  .map((locale) => `${locale.pathSegment}/`);
const NON_LIVE_PREFIXES = getAllLocales()
  .filter((locale) => !locale.live && locale.pathSegment)
  .map((locale) => `${locale.pathSegment}/`);

const RAW_FILES = execSync('git ls-files "*index.html"', { encoding: "utf8" })
  .split("\n")
  .map((value) => value.trim())
  .filter(Boolean)
  .filter((file) => !file.startsWith("nguyenlananh.com/"))
  .filter((file) => !file.startsWith(".claude/"));

const DEFAULT_FILES = RAW_FILES.filter((file) => !NON_DEFAULT_PREFIXES.some((prefix) => file.startsWith(prefix)));

function routeFromFile(file) {
  if (file === "index.html") return "/";
  if (!file.endsWith("/index.html")) return "/";
  const dir = file.slice(0, -"/index.html".length);
  return normalizeRoute(`/${dir}/`);
}

function splitSuffix(url) {
  const index = url.search(/[?#]/);
  if (index === -1) return { pathname: url, suffix: "" };
  return { pathname: url.slice(0, index), suffix: url.slice(index) };
}

function localizeInternalHref(href, localeCode) {
  const { pathname, suffix } = splitSuffix(href);

  if (
    !pathname ||
    pathname.startsWith("#") ||
    pathname.startsWith("mailto:") ||
    pathname.startsWith("tel:") ||
    pathname.startsWith("javascript:") ||
    pathname.startsWith("http://") ||
    pathname.startsWith("https://") ||
    pathname.startsWith("//")
  ) {
    return href;
  }

  if (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/cdn-cgi/") ||
    pathname.startsWith("/_") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return href;
  }

  if (!pathname.startsWith("/")) {
    return href;
  }

  const baseRoute = stripLocalePrefix(pathname);
  return `${localizedRoute(baseRoute, localeCode)}${suffix}`;
}

function rewriteInternalHrefs(html, localeCode) {
  return html.replace(/href="([^"]+)"/g, (match, href) => `href="${localizeInternalHref(href, localeCode)}"`);
}

function upsertCanonical(html, url) {
  if (/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i.test(html)) {
    return html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${url}" />`);
  }

  return html.replace(/<meta\s+name="robots"[^>]*>/i, `<link rel="canonical" href="${url}" />\n  $&`);
}

function upsertOgUrl(html, url) {
  if (/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i.test(html)) {
    return html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i, `<meta property="og:url" content="${url}" />`);
  }

  return html;
}

function stripAlternateTags(html) {
  return html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/>\n?/gi, "\n");
}

function insertAlternateTags(html, baseRoute) {
  const block = buildAlternateLinks(baseRoute);
  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/(<link\s+rel="canonical"[^\n]*\n)/i, `$1${block}\n`);
  }
  return html.replace(/<meta\s+name="robots"/i, `${block}\n\n  <meta name="robots"`);
}

function ensureLangScripts(html) {
  let output = html;

  if (!output.includes("/assets/i18n-config.js")) {
    if (output.includes("/assets/lang-routing.js")) {
      output = output.replace(
        /<script src="\/assets\/lang-routing\.js"><\/script>/i,
        '  <script src="/assets/i18n-config.js"></script>\n  <script src="/assets/lang-routing.js"></script>'
      );
    } else {
      output = output.replace("</body>", '  <script src="/assets/i18n-config.js"></script>\n</body>');
    }
  }

  if (!output.includes("/assets/lang-routing.js")) {
    output = output.replace("</body>", '  <script src="/assets/lang-routing.js"></script>\n</body>');
  }

  return output;
}

function setHtmlLang(html, langCode) {
  if (/<html[^>]*lang="[^"]+"/i.test(html)) {
    return html.replace(/(<html[^>]*lang=")([^"]+)("[^>]*>)/i, `$1${langCode}$3`);
  }
  return html.replace(/<html(\s|>)/i, `<html lang="${langCode}"$1`);
}

function translateCommonUI(html, localeCode) {
  if (localeCode !== "en") return html;

  const pairs = [
    [">Trang chủ<", ">Home<"],
    [">Hành trình<", ">Journey<"],
    [">Phương pháp<", ">Method<"],
    [">Chương trình<", ">Programs<"],
    [">Bài viết<", ">Articles<"],
    [">Liên hệ<", ">Contact<"],
    [">Giới thiệu<", ">About<"],
    [">Điều khoản sử dụng<", ">Terms of Use<"],
    [">Chính sách bảo mật<", ">Privacy Policy<"],
    [">Miễn trừ trách nhiệm<", ">Disclaimer<"],
    [">Đóng<", ">Close<"],
    [">Mở menu<", ">Open menu<"],
    [">Đăng xuất<", ">Sign out<"],
    [">Đăng ký thành viên<", ">Register membership<"],
    [">Mở khóa toàn bộ hành trình<", ">Unlock full journey<"],
    [">Không đọc thêm. Bắt đầu.<", ">Stop reading. Start now.<"],
    [">Liên hệ đồng hành<", ">Contact for guidance<"],
    [">Đi tiếp từ đây<", ">Continue from here<"],
    [">Về trang bài viết<", ">Back to articles<"]
  ];

  let output = html;
  for (const [from, to] of pairs) {
    output = output.split(from).join(to);
  }
  return output;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), content, "utf8");
}

function buildLocalizedHtml(sourceHtml, baseRoute, localeCode, preserveExisting) {
  const locale = localeByCode(localeCode, { includePlanned: true });
  const localizedUrl = `${DOMAIN}${localizedRoute(baseRoute, localeCode)}`;

  let html = sourceHtml;
  html = setHtmlLang(html, locale.htmlLang);
  html = upsertCanonical(html, localizedUrl);
  html = upsertOgUrl(html, localizedUrl);
  html = stripAlternateTags(html);
  html = insertAlternateTags(html, baseRoute);
  html = rewriteInternalHrefs(html, localeCode);
  if (!preserveExisting) {
    html = translateCommonUI(html, localeCode);
  }
  html = ensureLangScripts(html);
  return html;
}

function getAllIndexFiles() {
  return execSync('find . -name "index.html"', { encoding: "utf8" })
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.replace(/^\.\//, ""))
    .filter((file) => !file.startsWith(".git/"))
    .filter((file) => !file.startsWith(".claude/"))
    .filter((file) => !file.startsWith("nguyenlananh.com/"))
    .filter((file) => !NON_LIVE_PREFIXES.some((prefix) => file.startsWith(prefix)));
}

function shouldIndex(file) {
  if (file.includes("/[slug]/")) return false;
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  if (!robots) return true;
  return !robots[1].toLowerCase().includes("noindex");
}

for (const defaultFile of DEFAULT_FILES) {
  const baseRoute = routeFromFile(defaultFile);
  const defaultHtml = fs.readFileSync(path.join(ROOT, defaultFile), "utf8");

  const viHtml = buildLocalizedHtml(defaultHtml, baseRoute, DEFAULT_LOCALE_CODE, true);
  writeFile(defaultFile, viHtml);

  for (const locale of NON_DEFAULT_LIVE_LOCALES) {
    const localizedFile = localeFileFromDefaultFile(defaultFile, locale.code);
    const localizedPath = path.join(ROOT, localizedFile);
    const hasExistingLocalizedFile = fs.existsSync(localizedPath);

    if (!hasExistingLocalizedFile && !locale.autoGenerateFromDefault) {
      continue;
    }

    const sourceHtml = hasExistingLocalizedFile ? fs.readFileSync(localizedPath, "utf8") : viHtml;
    const localizedHtml = buildLocalizedHtml(sourceHtml, baseRoute, locale.code, hasExistingLocalizedFile);
    writeFile(localizedFile, localizedHtml);
  }
}

writeFile("assets/i18n-config.js", buildBrowserI18nConfigSource());

const allIndexFiles = getAllIndexFiles().filter(shouldIndex);
const uniqueRoutes = [...new Set(allIndexFiles.map((file) => routeFromFile(file)))].sort();

const sitemapLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

for (const route of uniqueRoutes) {
  let priority = "0.8";
  let changefreq = "weekly";

  if (route === "/") {
    priority = "1.0";
    changefreq = "daily";
  } else if (route === localizedRoute("/", "en")) {
    priority = "0.9";
    changefreq = "daily";
  } else if (route === "/bai-viet/" || route === localizedRoute("/bai-viet/", "en")) {
    priority = "0.95";
    changefreq = "daily";
  } else if (route.startsWith("/bai-viet/") || route.startsWith(localizedRoute("/bai-viet/", "en"))) {
    priority = "0.74";
    changefreq = "monthly";
  }

  sitemapLines.push(`  <url><loc>${DOMAIN}${route}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
}

sitemapLines.push("</urlset>");
writeFile("sitemap.xml", `${sitemapLines.join("\n")}\n`);

console.log(`Processed default pages: ${DEFAULT_FILES.length}`);
console.log(`Live locales: ${LIVE_LOCALES.map((locale) => locale.code).join(", ")}`);
console.log(`Indexed routes in sitemap: ${uniqueRoutes.length}`);
