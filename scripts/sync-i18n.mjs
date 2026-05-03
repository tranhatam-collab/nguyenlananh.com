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
import { buildBrowserContentRegistrySource, loadContentRegistry, validateContentRegistry } from "./lib/content-registry.mjs";

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
  .filter((file) => !file.startsWith("docs/"))
  .filter((file) => !file.includes("/node_modules/"))
  .filter((file) => !file.includes("/.next/"))
  .filter((file) => !file.includes("/.vercel/"))
  .filter((file) => !file.includes("/dist/"))
  .filter((file) => !file.includes("/out/"))
  .filter((file) => !file.includes(" "))
  .filter((file) => !file.startsWith("nguyenlananh.com/"))
  .filter((file) => !file.startsWith(".claude/"))
  .filter((file) => fs.existsSync(path.join(ROOT, file)));

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

function stripHtmlTags(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function extractText(html, pattern) {
  const match = html.match(pattern);
  return match ? stripHtmlTags(match[1]) : "";
}

function truncateMeta(text, max = 160) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}...`;
}

function pageTypeFromBaseRoute(baseRoute) {
  if (baseRoute === "/") return "home";
  if (baseRoute.startsWith("/admin/")) return "admin";
  if (baseRoute.startsWith("/members/")) return "members";
  if (baseRoute.startsWith("/bai-viet/")) return "article";
  if (baseRoute.startsWith("/du-an/")) return "project";
  if (baseRoute === "/join/") return "join";
  if (
    ["/chinh-sach-bao-mat/", "/dieu-khoan/", "/mien-tru-trach-nhiem/"].includes(baseRoute)
  ) {
    return "legal";
  }
  return "page";
}

function fallbackDescription(baseRoute, localeCode, title, h1) {
  const label = h1 || title || (localeCode === "en" ? "this page" : "trang này");
  const pageType = pageTypeFromBaseRoute(baseRoute);

  if (localeCode === "en") {
    switch (pageType) {
      case "admin":
        return `Admin workspace for ${label} on Nguyen Lan Anh.`;
      case "members":
        return `Members-only page for ${label} inside Nguyen Lan Anh.`;
      case "article":
        return `Read ${label} on Nguyen Lan Anh.`;
      case "project":
        return `Project page for ${label} on Nguyen Lan Anh.`;
      case "join":
        return "Join Nguyen Lan Anh by email to begin the free companionship flow.";
      case "legal":
        return `Reference page for ${label} on Nguyen Lan Anh.`;
      case "home":
        return "Rebuild your life from within with bilingual guidance, writings, and membership paths.";
      default:
        return `Explore ${label} on Nguyen Lan Anh.`;
    }
  }

  switch (pageType) {
    case "admin":
      return `Không gian quản trị cho ${label} trên Nguyễn Lan Anh.`;
    case "members":
      return `Trang thành viên dành cho ${label} trong hệ Nguyễn Lan Anh.`;
    case "article":
      return `Đọc ${label} trên Nguyễn Lan Anh.`;
    case "project":
      return `Trang dự án cho ${label} trên Nguyễn Lan Anh.`;
    case "join":
      return "Đăng ký Nguyễn Lan Anh bằng email để bắt đầu luồng đồng hành miễn phí.";
    case "legal":
      return `Trang tham chiếu cho ${label} trên Nguyễn Lan Anh.`;
    case "home":
      return "Đi vào bên trong để tái thiết cuộc đời với hệ bài viết, đồng hành và lộ trình song ngữ.";
    default:
      return `Khám phá ${label} trên Nguyễn Lan Anh.`;
  }
}

function ensureMetaDescription(html, baseRoute, localeCode) {
  const existing = extractText(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  if (existing) return { html, description: existing };

  const candidate = truncateMeta(
    extractText(html, /<p[^>]*class="[^"]*\bsub\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
      extractText(html, /<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
      extractText(html, /<main[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i) ||
      fallbackDescription(
        baseRoute,
        localeCode,
        extractText(html, /<title>([\s\S]*?)<\/title>/i),
        extractText(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
      )
  );

  const tag = `<meta name="description" content="${escapeAttribute(candidate)}" />`;
  if (/<link\s+rel="canonical"/i.test(html)) {
    return {
      html: html.replace(/(<link\s+rel="canonical"[^\n]*\n)/i, `$1  ${tag}\n`),
      description: candidate
    };
  }

  return {
    html: html.replace(/<meta\s+name="robots"/i, `${tag}\n  <meta name="robots"`),
    description: candidate
  };
}

function ensureMetaTag(html, { test, replace, insertAfter, tag }) {
  if (test.test(html)) {
    return html.replace(replace, tag);
  }

  if (insertAfter.test(html)) {
    return html.replace(insertAfter, `$&\n  ${tag}`);
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
}

function ensureSocialMetadata(html, localeCode, url, title, description) {
  const safeTitle = escapeAttribute(title);
  const safeDescription = escapeAttribute(description);
  const twitterCard = '<meta name="twitter:card" content="summary_large_image" />';

  let output = html;
  output = ensureMetaTag(output, {
    test: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+property="og:type"[^\n]*\n/i,
    tag: `<meta property="og:title" content="${safeTitle}" />`
  });
  output = ensureMetaTag(output, {
    test: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+property="og:title"[^\n]*\n/i,
    tag: `<meta property="og:description" content="${safeDescription}" />`
  });
  output = ensureMetaTag(output, {
    test: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+property="og:description"[^\n]*\n/i,
    tag: `<meta property="og:url" content="${escapeAttribute(url)}" />`
  });
  output = ensureMetaTag(output, {
    test: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+name="twitter:card"[^\n]*\n/i,
    tag: `<meta name="twitter:title" content="${safeTitle}" />`
  });
  output = ensureMetaTag(output, {
    test: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+name="twitter:title"[^\n]*\n/i,
    tag: `<meta name="twitter:description" content="${safeDescription}" />`
  });
  output = ensureMetaTag(output, {
    test: /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/>/i,
    replace: /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/>/i,
    insertAfter: /<meta\s+property="og:url"[^\n]*\n/i,
    tag: twitterCard
  });

  return output;
}

function stripAlternateTags(html) {
  return html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]*"\s*\/>\n?/gi, "\n");
}

function stripPlaceholderLocaleLinks(html) {
  return html.replace(/<a\b[^>]*>\s*(?:VI|EN|EN-US|FR|JA|KO)\s*<\/a>/gi, "");
}

function normalizeHeadBoundary(html) {
  let output = html.replace(
    /<\/head>\s*((?:<(?:meta|link)\b[^>]*>\s*)+)(<body\b[^>]*>)/i,
    (_match, strayTags, bodyTag) => `${strayTags}</head>\n${bodyTag}`
  );

  output = output.replace(
    /(<body\b[^>]*>)\s*((?:<(?:meta|link)\b[^>]*>\s*)+)/i,
    (_match, bodyTag, strayTags) => `${strayTags}${bodyTag}`
  );

  return output;
}

function stripTrailingLineWhitespace(html) {
  return html.replace(/[ \t]+$/gm, "");
}

function insertAlternateTags(html, baseRoute) {
  const block = buildAlternateLinks(baseRoute);
  if (/<link\s+rel="canonical"/i.test(html)) {
    return html.replace(/(<link\s+rel="canonical"[^\n]*\n)\s*/i, `$1${block}\n`);
  }
  return html.replace(/<meta\s+name="robots"/i, `${block}\n\n  <meta name="robots"`);
}

function ensureLangScripts(html) {
  let output = html;

  if (!output.includes("/assets/content-registry.js")) {
    if (output.includes("/assets/site.js")) {
      output = output.replace(
        /<script src="\/assets\/site\.js"><\/script>/i,
        '  <script src="/assets/content-registry.js"></script>\n  <script src="/assets/site.js"></script>'
      );
    } else {
      output = output.replace("</body>", '  <script src="/assets/content-registry.js"></script>\n</body>');
    }
  }

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

function normalizeCommonUI(html, localeCode) {
  const pairs =
    localeCode === "en"
      ? [
          [">Trang chủ<", ">Home<"],
          [">Hành trình<", ">Journey<"],
          [">Phương pháp<", ">System<"],
          [">Chương trình<", ">Programs<"],
          [">Bài viết<", ">Writings<"],
          [">Liên hệ<", ">Contact<"],
          [">Giới thiệu<", ">Story<"],
          [">Điều khoản sử dụng<", ">Terms of Use<"],
          [">Chính sách bảo mật<", ">Privacy Policy<"],
          [">Miễn trừ trách nhiệm<", ">Disclaimer<"],
          [">Đóng<", ">Close<"],
          [">Mở menu<", ">Open menu<"],
          [">Đăng xuất<", ">Sign out<"],
          [">Đăng ký thành viên<", ">Join membership<"],
          [">Mở khóa toàn bộ hành trình<", ">Unlock full journey<"],
          [">Không đọc thêm. Bắt đầu.<", ">Stop reading. Start now.<"],
          [">Liên hệ đồng hành<", ">Contact for guidance<"],
          [">Đi tiếp từ đây<", ">Continue from here<"],
          [">Về trang bài viết<", ">Back to writings<"],
          ["Members nav", "Members navigation"]
        ]
      : [
          ["FAQ | Nguyenlananh.com", "Câu hỏi thường gặp | Nguyenlananh.com"],
          ["Members Practice | Nguyenlananh.com", "Thực hành thành viên | Nguyenlananh.com"],
          ["Members Deep | Nguyenlananh.com", "Chuyên sâu thành viên | Nguyenlananh.com"],
          ["Members Experience | Nguyenlananh.com", "Trải nghiệm thành viên | Nguyenlananh.com"],
          ["Members Pro Layer | Nguyenlananh.com", "Tầng Pro thành viên | Nguyenlananh.com"],
          ["Creator Layer | Nguyenlananh.com", "Tầng creator | Nguyenlananh.com"],
          ["Creator Guidelines | Nguyenlananh.com", "Hướng dẫn creator | Nguyenlananh.com"],
          ["Creator Library | Nguyenlananh.com", "Thư viện creator | Nguyenlananh.com"],
          ["Creator Operations | Nguyenlananh.com", "Vận hành creator | Nguyenlananh.com"],
          ["Creator Submit | Nguyenlananh.com", "Gửi nội dung creator | Nguyenlananh.com"],
          ["Pro Environment | Nguyenlananh.com", "Pro môi trường | Nguyenlananh.com"],
          ["Pro Creation | Nguyenlananh.com", "Pro sáng tạo | Nguyenlananh.com"],
          ["Pro Discipline | Nguyenlananh.com", "Pro kỷ luật | Nguyenlananh.com"],
          ["Pro Inner Work | Nguyenlananh.com", "Pro nội tâm | Nguyenlananh.com"],
          ["Pro Reset Life | Nguyenlananh.com", "Pro làm mới đời sống | Nguyenlananh.com"],
          ["Pro Wealth | Nguyenlananh.com", "Pro tài chính | Nguyenlananh.com"],
          ["Admin Dashboard | Nguyễn Lan Anh", "Bảng điều khiển quản trị | Nguyễn Lan Anh"],
          ["Admin Foundation", "Nền quản trị"],
          ["Membership + Creator Operations", "Vận hành thành viên + creator"],
          ["Public -> Guided -> Deep", "Công khai -> Dẫn nhập -> Chuyên sâu"],
          ["Homepage", "Trang chủ"],
          ["Journey -> Practice -> Deep -> Experience", "Hành trình -> Thực hành -> Chuyên sâu -> Trải nghiệm"],
          ["Journey first. Revenue second.", "Hành trình trước. Doanh thu sau."],
          ["Experience keeps retention.", "Trải nghiệm giữ độ gắn bó."],
          ["Deep work, not fast content.", "Làm sâu, không làm nhanh."],
          ["Deep Layer", "Tầng chuyên sâu"],
          ["Daily Practice", "Thực hành hằng ngày"],
          ["Experience Layer", "Tầng trải nghiệm"],
          ["Về Practice", "Về Thực hành"],
          ["Mở Practice hôm nay", "Mở Thực hành hôm nay"],
          ["Mở Practice", "Mở Thực hành"],
          ["Về Deep Layer", "Về Tầng chuyên sâu"],
          ["Quay về Deep Layer", "Quay về Tầng chuyên sâu"],
          ["Xem chuyên đề Deep", "Xem chuyên đề chuyên sâu"],
          ["Về Dashboard", "Về Bảng điều khiển"],
          ["Về Journey", "Về Hành trình"],
          ["Xem lại Journey", "Xem lại Hành trình"],
          ["Về Experience", "Về Trải nghiệm"],
          ["Dashboard", "Bảng điều khiển"],
          ["Journey", "Hành trình"],
          ["Practice", "Thực hành"],
          ["profileThực hànhTrack", "profilePracticeTrack"],
          ["Deep", "Chuyên sâu"],
          ["Experience", "Trải nghiệm"],
          ["Pro Layer", "Tầng Pro"],
          ["INNER WORK", "NỘI TÂM"],
          [">Dashboard<", ">Bảng điều khiển<"],
          [">Journey<", ">Hành trình<"],
          [">Practice<", ">Thực hành<"],
          [">Deep<", ">Chuyên sâu<"],
          [">Experience<", ">Trải nghiệm<"],
          [">Sign out<", ">Đăng xuất<"],
          [">Story<", ">Câu chuyện<"],
          [">Writings<", ">Bài viết<"],
          [">System<", ">Hệ thống<"],
          [">Programs<", ">Chương trình<"],
          [">Contact<", ">Kết nối<"],
          [">Terms<", ">Điều khoản<"],
          [">Privacy Policy<", ">Quyền riêng tư<"],
          ["Members Dashboard", "Bảng điều khiển thành viên"],
          ["Members Journey", "Hành trình thành viên"],
          ["Journey System", "Hệ hành trình"],
          ["Transformation Loop", "Vòng lặp chuyển hóa"],
          ["Framework Layer", "Tầng chuyên sâu"],
          ["Daily Action System", "Hệ thực hành hằng ngày"],
          ["Journey before revenue. Value before scale.", "Đi hành trình trước. Giá trị trước quy mô."],
          ["Members nav", "Điều hướng thành viên"],
          ["Core flow", "Luồng cốt lõi"],
          ["View Pro layer", "Xem tầng Pro"],
          ["Creator layer (internal)", "Tầng creator (nội bộ)"],
          ["Open creator path", "Mở lộ trình creator"]
        ];

  let output = html;
  for (const [from, to] of pairs) {
    output = output.split(from).join(to);
  }

  if (localeCode === "vi") {
    output = output.replace(/Journey Day (\d+)/g, "Hành trình ngày $1");
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
  html = normalizeHeadBoundary(html);
  html = stripPlaceholderLocaleLinks(html);
  html = setHtmlLang(html, locale.htmlLang);
  html = upsertCanonical(html, localizedUrl);
  const metaResult = ensureMetaDescription(html, baseRoute, localeCode);
  html = metaResult.html;
  const title = extractText(html, /<title>([\s\S]*?)<\/title>/i);
  html = ensureSocialMetadata(html, localeCode, localizedUrl, title, metaResult.description);
  html = upsertOgUrl(html, localizedUrl);
  html = stripAlternateTags(html);
  html = insertAlternateTags(html, baseRoute);
  html = rewriteInternalHrefs(html, localeCode);
  html = normalizeCommonUI(html, localeCode);
  html = ensureLangScripts(html);
  html = normalizeHeadBoundary(html);
  html = stripTrailingLineWhitespace(html);
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
    .filter((file) => !file.startsWith("docs/"))
    .filter((file) => !file.includes("/node_modules/"))
    .filter((file) => !file.includes("/.next/"))
    .filter((file) => !file.includes("/.vercel/"))
    .filter((file) => !file.includes("/dist/"))
    .filter((file) => !file.includes("/out/"))
    .filter((file) => !file.includes(" "))
    .filter((file) => !file.startsWith("nguyenlananh.com/"))
    .filter((file) => !NON_LIVE_PREFIXES.some((prefix) => file.startsWith(prefix)))
    .filter((file) => fs.existsSync(path.join(ROOT, file)));
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

const contentRegistry = loadContentRegistry(ROOT);
const contentRegistryErrors = validateContentRegistry(contentRegistry);
if (contentRegistryErrors.length > 0) {
  throw new Error(`Invalid content registry:\n${contentRegistryErrors.join("\n")}`);
}

writeFile("assets/i18n-config.js", buildBrowserI18nConfigSource());
writeFile("assets/content-registry.js", buildBrowserContentRegistrySource(contentRegistry));

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
