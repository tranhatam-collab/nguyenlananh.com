import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  DEFAULT_LOCALE_CODE,
  DOMAIN,
  localeByCode,
  localizedRoute,
  normalizeRoute,
  stripLocalePrefix
} from "./i18n-config.mjs";

const EXCLUDED_PREFIXES = [".claude/", "nguyenlananh.com/"];
const PUBLIC_TEXT_PLACEHOLDER_VALUES = new Set(["VI", "EN", "EN-US", "FR", "JA", "KO"]);
const INTERNAL_PATH_BLOCKLIST = ["/assets/", "/cdn-cgi/", "/api/", "/_", "/robots.txt", "/sitemap.xml"];

function listIndexFiles(root) {
  return execSync('git ls-files "*index.html"', { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((file) => !file.includes("/[slug]/"))
    .filter((file) => !EXCLUDED_PREFIXES.some((prefix) => file.startsWith(prefix)))
    .filter((file) => fs.existsSync(path.join(root, file)));
}

function routeFromFile(file) {
  if (file === "index.html") return "/";
  return normalizeRoute(`/${file.replace(/\/index\.html$/u, "")}/`);
}

function localeCodeFromFile(file) {
  return file.startsWith("en/") ? "en" : DEFAULT_LOCALE_CODE;
}

function pageTypeFromRoute(route) {
  const base = stripLocalePrefix(route);
  if (base === "/") return "home";
  if (base.startsWith("/admin/")) return "admin";
  if (base.startsWith("/members/")) return "members";
  if (base.startsWith("/bai-viet/")) return "article";
  if (base.startsWith("/du-an/")) return "project";
  if (
    [
      "/chinh-sach-bao-mat/",
      "/dieu-khoan/",
      "/mien-tru-trach-nhiem/"
    ].includes(base)
  ) {
    return "legal";
  }
  return "page";
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">");
}

function extractSingle(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1].trim()) : "";
}

function extractAll(html, pattern) {
  return Array.from(html.matchAll(pattern), (match) => decodeHtml((match[1] || "").trim()));
}

function extractTextNodes(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<!--[\s\S]*?-->/gu, " ");

  return Array.from(cleaned.matchAll(/>([^<>]+)</gu), (match) => decodeHtml(match[1]))
    .map((value) => value.replace(/\s+/gu, " ").trim())
    .filter(Boolean);
}

function extractImages(html) {
  // Find every <img> together with the immediate enclosing element so we can
  // tell whether the image is marked as decorative (WCAG SC 1.1.1).
  // A decorative image is correctly authored with `alt=""` AND lives inside
  // an element carrying `aria-hidden="true"` or `role="presentation"`, OR the
  // <img> itself carries those attributes. The validator must not flag those.
  const imgRe = /<img\b[^>]*>/giu;
  const out = [];
  let match;
  while ((match = imgRe.exec(html)) !== null) {
    const tag = match[0];
    const altMatch = tag.match(/\balt="([^"]*)"/iu);
    const srcMatch = tag.match(/\bsrc="([^"]+)"/iu);
    const hasAlt = Boolean(altMatch);
    const alt = altMatch ? decodeHtml(altMatch[1].trim()) : "";

    // Self-marked as decorative.
    let decorative = /\baria-hidden="true"/iu.test(tag) || /\brole="(presentation|none)"/iu.test(tag);

    // Or wrapped by an immediate ancestor that is. Scan back ~400 chars for
    // an opening tag carrying aria-hidden="true" or role="presentation".
    if (!decorative) {
      const windowStart = Math.max(0, match.index - 400);
      const before = html.slice(windowStart, match.index);
      // Find the LAST opening tag that has not been closed before the <img>.
      const ancestorRe = /<(\w+)\b([^>]*)>/giu;
      let lastDecorativeOpen = -1;
      let m;
      while ((m = ancestorRe.exec(before)) !== null) {
        const attrs = m[2] || "";
        if (/\baria-hidden="true"/iu.test(attrs) || /\brole="(presentation|none)"/iu.test(attrs)) {
          // Make sure this tag is still open at the <img>: no matching closer
          // appears between this tag and the image.
          const tagName = m[1];
          const closeRe = new RegExp(`</${tagName}>`, "giu");
          closeRe.lastIndex = ancestorRe.lastIndex;
          const closer = closeRe.exec(before);
          if (!closer) lastDecorativeOpen = m.index;
        }
      }
      if (lastDecorativeOpen !== -1) decorative = true;
    }

    out.push({
      src: srcMatch ? srcMatch[1] : "",
      hasAlt,
      alt,
      decorative
    });
  }
  return out;
}

function extractFigures(html) {
  return Array.from(html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/giu), (match) => {
    const block = match[0];
    const imgMatch = block.match(/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/iu) || block.match(/<img\b[^>]*src="([^"]+)"[^>]*>/iu);
    const figcaptionMatch = block.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/iu);

    return {
      src: imgMatch ? imgMatch[1] : "",
      alt: imgMatch && imgMatch[2] ? decodeHtml(imgMatch[2].trim()) : "",
      hasImage: Boolean(imgMatch),
      hasFigcaption: Boolean(figcaptionMatch),
      figcaption: figcaptionMatch ? decodeHtml(figcaptionMatch[1].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim()) : ""
    };
  });
}

function readSvgAccessibility(root, src) {
  if (!src || !src.endsWith(".svg") || !src.startsWith("/assets/")) return null;

  const absPath = path.join(root, src.replace(/^\//u, ""));
  if (!fs.existsSync(absPath)) {
    return {
      path: src,
      exists: false,
      hasRoleImg: false,
      hasAriaLabel: false,
      hasAriaLabelledby: false,
      hasTitleNode: false,
      description: ""
    };
  }

  const raw = fs.readFileSync(absPath, "utf8");
  const hasRoleImg = /role="img"/iu.test(raw);
  const ariaLabelMatch = raw.match(/aria-label="([^"]+)"/iu);
  const ariaLabelledbyMatch = raw.match(/aria-labelledby="([^"]+)"/iu);
  const labelledbyId = ariaLabelledbyMatch ? ariaLabelledbyMatch[1] : "";
  const titleRegex = labelledbyId
    ? new RegExp(`<title[^>]*id="${labelledbyId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}"[^>]*>([^<]+)<\\/title>`, "iu")
    : /<title\b[^>]*>([^<]+)<\/title>/iu;
  const titleMatch = raw.match(titleRegex);

  return {
    path: src,
    exists: true,
    hasRoleImg,
    hasAriaLabel: Boolean(ariaLabelMatch && ariaLabelMatch[1].trim()),
    hasAriaLabelledby: Boolean(ariaLabelledbyMatch),
    hasTitleNode: Boolean(titleMatch && titleMatch[1].trim()),
    description: ariaLabelMatch?.[1]?.trim() || titleMatch?.[1]?.trim() || ""
  };
}

function extractAnchors(html) {
  return Array.from(
    html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/giu),
    (match) => ({
      href: match[1],
      text: decodeHtml(match[2].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim())
    })
  );
}

function localizedInternalMismatch(href, localeCode) {
  if (!href || !href.startsWith("/")) return false;
  if (INTERNAL_PATH_BLOCKLIST.some((prefix) => href.startsWith(prefix))) return false;
  const pathname = href.split(/[?#]/u, 1)[0];
  const baseRoute = stripLocalePrefix(pathname);
  const expected = localizedRoute(baseRoute, localeCode);
  return normalizeRoute(pathname) !== expected;
}

function findCounterpart(file, allFiles) {
  if (file.startsWith("en/")) {
    const candidate = file.slice(3);
    return allFiles.has(candidate) ? candidate : null;
  }

  const candidate = `en/${file}`;
  return allFiles.has(candidate) ? candidate : null;
}

function pushIssue(bucket, issue) {
  bucket.push(issue);
}

function auditFile(file, root, allFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const route = routeFromFile(file);
  const localeCode = localeCodeFromFile(file);
  const locale = localeByCode(localeCode, { includePlanned: true });
  const counterpart = findCounterpart(file, allFiles);
  const issues = [];

  const title = extractSingle(html, /<title>([^<]*)<\/title>/iu);
  const metaDescription = extractSingle(html, /<meta\s+name="description"\s+content="([^"]*)"/iu);
  const canonical = extractSingle(html, /<link\s+rel="canonical"\s+href="([^"]*)"/iu);
  const ogTitle = extractSingle(html, /<meta\s+property="og:title"\s+content="([^"]*)"/iu);
  const ogDescription = extractSingle(html, /<meta\s+property="og:description"\s+content="([^"]*)"/iu);
  const twitterTitle = extractSingle(html, /<meta\s+name="twitter:title"\s+content="([^"]*)"/iu);
  const twitterDescription = extractSingle(html, /<meta\s+name="twitter:description"\s+content="([^"]*)"/iu);
  const h1List = extractAll(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/giu).map((value) => value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim());
  const textNodes = extractTextNodes(html);
  const images = extractImages(html);
  const figures = extractFigures(html);
  const anchors = extractAnchors(html);
  const svgDescriptions = [];

  if (!html.includes("/assets/content-registry.js")) {
    pushIssue(issues, {
      severity: "high",
      category: "source",
      code: "missing_content_registry",
      message: "Page is not wired to the centralized bilingual content registry."
    });
  }

  if (!title) {
    pushIssue(issues, { severity: "high", category: "metadata", code: "missing_title", message: "Missing <title>." });
  }
  if (!metaDescription) {
    pushIssue(issues, { severity: "high", category: "metadata", code: "missing_meta_description", message: "Missing meta description." });
  }
  if (!canonical) {
    pushIssue(issues, { severity: "high", category: "metadata", code: "missing_canonical", message: "Missing canonical URL." });
  }
  if (!ogTitle) {
    pushIssue(issues, { severity: "high", category: "metadata", code: "missing_og_title", message: "Missing OG title." });
  }
  if (!ogDescription) {
    pushIssue(issues, { severity: "high", category: "metadata", code: "missing_og_description", message: "Missing OG description." });
  }
  if (!twitterTitle) {
    pushIssue(issues, { severity: "medium", category: "metadata", code: "missing_twitter_title", message: "Missing Twitter title." });
  }
  if (!twitterDescription) {
    pushIssue(issues, { severity: "medium", category: "metadata", code: "missing_twitter_description", message: "Missing Twitter description." });
  }
  if (h1List.length !== 1) {
    pushIssue(issues, {
      severity: "high",
      category: "seo",
      code: "invalid_h1_count",
      message: `Expected exactly one H1, found ${h1List.length}.`
    });
  }

  if (canonical && !canonical.startsWith(DOMAIN)) {
    pushIssue(issues, {
      severity: "medium",
      category: "metadata",
      code: "canonical_not_absolute",
      message: "Canonical URL is not absolute."
    });
  }

  // Per WCAG SC 1.1.1, an empty `alt=""` is the correct marker for purely
  // decorative images. We only flag images that have no alt attribute at all,
  // or that have empty alt but are NOT marked as decorative (e.g. no
  // aria-hidden="true" / role="presentation" on the image or an ancestor).
  const missingAlt = images.filter((image) => !image.hasAlt || (!image.alt && !image.decorative));
  for (const image of missingAlt) {
    pushIssue(issues, {
      severity: "high",
      category: "alt",
      code: "missing_alt",
      message: `Image is missing alt text: ${image.src || "(unknown src)"}`
    });
  }

  for (const figure of figures) {
    if (figure.hasFigcaption && !figure.figcaption) {
      pushIssue(issues, {
        severity: "medium",
        category: "image",
        code: "empty_figcaption",
        message: `Figure caption is empty for image: ${figure.src || "(unknown src)"}`
      });
    }
  }

  for (const image of images) {
    const svgAccessibility = readSvgAccessibility(root, image.src);
    if (!svgAccessibility) continue;
    svgDescriptions.push(svgAccessibility);

    if (!svgAccessibility.exists) {
      pushIssue(issues, {
        severity: "high",
        category: "image",
        code: "missing_svg_asset",
        message: `Referenced SVG asset does not exist: ${image.src}`
      });
      continue;
    }

    if (svgAccessibility.hasRoleImg && !svgAccessibility.hasAriaLabel && !svgAccessibility.hasTitleNode) {
      pushIssue(issues, {
        severity: "medium",
        category: "image",
        code: "missing_svg_description",
        message: `SVG asset is missing an accessible description: ${image.src}`
      });
    }
  }

  if (localeCode === "en") {
    const sanitizedEnglishHtml = html
      .replaceAll("🇻🇳 Tiếng Việt", "")
      .replaceAll("Tiếng Việt", "")
      .replaceAll("🇺🇸 English", "")
      .replaceAll("English", "");

    if (/[À-ỹĐđ]/u.test(sanitizedEnglishHtml)) {
      pushIssue(issues, {
        severity: "high",
        category: "en",
        code: "english_page_contains_vietnamese_diacritics",
        message: "English page still contains Vietnamese diacritics."
      });
    }
  }

  const englishUiOnViPage = textNodes.some((node) =>
    /\b(Home|Journey|System|Programs|Writings|Contact|Privacy Policy|Terms|Dashboard|Practice|Deep|Experience)\b/u.test(node)
  );

  if (localeCode === "vi" && englishUiOnViPage) {
    pushIssue(issues, {
      severity: "medium",
      category: "vi",
      code: "vietnamese_page_contains_english_ui",
      message: "Vietnamese page appears to contain English UI labels."
    });
  }

  for (const anchor of anchors) {
    if (PUBLIC_TEXT_PLACEHOLDER_VALUES.has(anchor.text.toUpperCase())) {
      pushIssue(issues, {
        severity: "medium",
        category: "ui",
        code: "placeholder_locale_link",
        message: `Placeholder locale link found: ${anchor.text}`
      });
    }

    if (localizedInternalMismatch(anchor.href, localeCode)) {
      pushIssue(issues, {
        severity: "medium",
        category: "seo",
        code: "wrong_language_internal_link",
        message: `Internal link does not match the page locale: ${anchor.href}`
      });
    }
  }

  if (!counterpart) {
    pushIssue(issues, {
      severity: "high",
      category: "bilingual",
      code: "missing_counterpart_page",
      message: "Page is missing its counterpart in the second live language."
    });
  } else {
    const counterpartHtml = fs.readFileSync(path.join(root, counterpart), "utf8");
    const counterpartTitle = extractSingle(counterpartHtml, /<title>([^<]*)<\/title>/iu);
    const counterpartDescription = extractSingle(counterpartHtml, /<meta\s+name="description"\s+content="([^"]*)"/iu);

    if (title && counterpartTitle && title === counterpartTitle) {
      pushIssue(issues, {
        severity: "medium",
        category: "metadata",
        code: "duplicate_cross_locale_title",
        message: "VI and EN titles are identical."
      });
    }

    if (metaDescription && counterpartDescription && metaDescription === counterpartDescription) {
      pushIssue(issues, {
        severity: "medium",
        category: "metadata",
        code: "duplicate_cross_locale_description",
        message: "VI and EN meta descriptions are identical."
      });
    }
  }

  return {
    file,
    route,
    url: `${DOMAIN}${route}`,
    locale: locale?.code || localeCode,
    htmlLang: locale?.htmlLang || localeCode,
    pageType: pageTypeFromRoute(route),
    title,
    metaDescription,
    h1: h1List[0] || "",
    h1Count: h1List.length,
    textNodeCount: textNodes.length,
    imageCount: images.length,
    altCount: images.filter((image) => image.hasAlt && image.alt).length,
    figureCount: figures.length,
    figcaptionCount: figures.filter((figure) => figure.hasFigcaption && figure.figcaption).length,
    svgDescriptionCount: svgDescriptions.filter((item) => item.description).length,
    counterpartFile: counterpart,
    issues
  };
}

function aggregateCounts(items) {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function summarizeAudits(audits) {
  const issues = audits.flatMap((audit) => audit.issues);
  const severityCounts = aggregateCounts(issues.map((issue) => issue.severity));
  const categoryCounts = aggregateCounts(issues.map((issue) => issue.category));
  const localeCounts = aggregateCounts(audits.map((audit) => audit.locale));

  return {
    generatedAt: new Date().toISOString(),
    totalUrls: audits.length,
    totalPagesWithIssues: audits.filter((audit) => audit.issues.length > 0).length,
    totalIssues: issues.length,
    blockingIssues: issues.length,
    status: issues.length > 0 ? "blocked" : "pass",
    totalImages: audits.reduce((acc, audit) => acc + audit.imageCount, 0),
    totalAltText: audits.reduce((acc, audit) => acc + audit.altCount, 0),
    totalFigures: audits.reduce((acc, audit) => acc + audit.figureCount, 0),
    totalFigcaptions: audits.reduce((acc, audit) => acc + audit.figcaptionCount, 0),
    totalSvgDescriptions: audits.reduce((acc, audit) => acc + audit.svgDescriptionCount, 0),
    localeCounts,
    severityCounts,
    categoryCounts
  };
}

export function runBilingualAudit(root = process.cwd()) {
  const files = listIndexFiles(root);
  const fileSet = new Set(files);
  const audits = files.map((file) => auditFile(file, root, fileSet));
  const summary = summarizeAudits(audits);

  return {
    summary,
    audits
  };
}

export function buildMarkdownReport(report) {
  const lines = [];
  lines.push("# Bilingual Language Rebuild Report");
  lines.push("");
  lines.push(`- Generated at: ${report.summary.generatedAt}`);
  lines.push(`- Status: ${report.summary.status.toUpperCase()}`);
  lines.push(`- Total URLs audited: ${report.summary.totalUrls}`);
  lines.push(`- Pages with issues: ${report.summary.totalPagesWithIssues}`);
  lines.push(`- Total issues: ${report.summary.totalIssues}`);
  lines.push(`- Blocking issues: ${report.summary.blockingIssues}`);
  lines.push(`- Images checked: ${report.summary.totalImages}`);
  lines.push(`- Alt text present: ${report.summary.totalAltText}`);
  lines.push(`- Figures checked: ${report.summary.totalFigures}`);
  lines.push(`- Figure captions present: ${report.summary.totalFigcaptions}`);
  lines.push(`- SVG descriptions present: ${report.summary.totalSvgDescriptions}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Locale split: ${JSON.stringify(report.summary.localeCounts)}`);
  lines.push(`- Severity split: ${JSON.stringify(report.summary.severityCounts)}`);
  lines.push(`- Category split: ${JSON.stringify(report.summary.categoryCounts)}`);
  lines.push("");
  lines.push("## Blocking Pages");
  lines.push("");

  const blockingPages = report.audits.filter((audit) => audit.issues.some((issue) => issue.severity === "high"));
  if (blockingPages.length === 0) {
    lines.push("- None");
  } else {
    for (const audit of blockingPages) {
      const highIssues = audit.issues.filter((issue) => issue.severity === "high");
      lines.push(`- ${audit.route} [${audit.locale}] -> ${highIssues.map((issue) => issue.code).join(", ")}`);
    }
  }

  lines.push("");
  lines.push("## Locked Decisions");
  lines.push("");
  lines.push("- Vietnamese is the source language for meaning and structure.");
  lines.push("- English must read as native international US English, not line-by-line translation.");
  lines.push("- Shared UI text must come from /content/vi.json and /content/en.json through assets/content-registry.js.");
  lines.push("- A page cannot be considered release-ready when title, description, H1, canonical, OG, alt text, or locale counterpart is missing.");
  lines.push("- Image descriptions are part of release scope: alt text on page, figcaption when used, and accessible descriptions inside local SVG assets.");

  return `${lines.join("\n")}\n`;
}
