#!/usr/bin/env node
/**
 * build-content-stats.mjs
 *
 * Scans /bai-viet/ and /en/bai-viet/ static HTML articles and emits
 * assets/content-stats.json — a pre-computed snapshot consumed by
 * /api/admin/audit at runtime (Workers cannot read the static filesystem).
 *
 * Metrics per locale:
 *   - total_articles       (article pages, excluding category indexes)
 *   - category_pages       (index/listing pages)
 *   - under_standard       (< 1500 words of body text)
 *   - missing_cta          (no link to /join/, /products/, /members/, /bat-dau/)
 *   - missing_metadata     (missing <title>, meta description, or og:title)
 *   - vi_en_coverage       (slugs present in both vi and en)
 *   - articles             (per-article detail: slug, words, has_cta, has_meta)
 *
 * Usage:
 *   node scripts/build-content-stats.mjs            # write assets/content-stats.json
 *   node scripts/build-content-stats.mjs --json     # also print JSON to stdout
 *   node scripts/build-content-stats.mjs --fail     # exit 1 if any under-standard
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const OUTPUT_JSON = ARGS.has("--json");
const FAIL_ON_ISSUES = ARGS.has("--fail");
const OUT_PATH = path.join(ROOT, "assets", "content-stats.json");

const MIN_WORDS = 1500;
const CTA_PATTERNS = ["/join/", "/products/", "/members/", "/bat-dau/", "/creators/", "/assessments/", "/programs/", "/certification/"];
const TEMPLATE_RE = /\/\[[^\]]+\]\//;

function walkArticles(dir) {
  const articles = [];
  const categories = [];
  if (!fs.existsSync(dir)) return { articles, categories };
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (TEMPLATE_RE.test(`/${entry.name}/`)) continue;
    const sub = path.join(dir, entry.name);
    const indexPath = path.join(sub, "index.html");
    if (!fs.existsSync(indexPath)) continue;
    // Heuristic: category pages live under /bai-viet/chuyen-muc/:slug/
    // or are top-level index pages with very few words and many links.
    const isCategory = dir.includes("chuyen-muc");
    if (isCategory) {
      categories.push({ slug: entry.name, path: indexPath });
    } else {
      articles.push({ slug: entry.name, path: indexPath });
    }
  }
  return { articles, categories };
}

function walkCategoryDirs(dir) {
  const cats = [];
  const catDir = path.join(dir, "chuyen-muc");
  if (!fs.existsSync(catDir)) return cats;
  for (const entry of fs.readdirSync(catDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(catDir, entry.name, "index.html");
    if (fs.existsSync(indexPath)) cats.push({ slug: entry.name, path: indexPath });
  }
  return cats;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(html) {
  const text = stripHtml(html);
  return text.split(/\s+/).filter(Boolean).length;
}

function hasCta(html) {
  return CTA_PATTERNS.some((p) => html.includes(p));
}

function hasMetadata(html) {
  const hasTitle = /<title>[^<]{10,}<\/title>/i.test(html);
  const hasDesc = /<meta\s+name=["']description["']\s+content=["'][^"']{20,}["']/i.test(html);
  const hasOg = /<meta\s+property=["']og:title["']\s+content=["'][^"']{10,}["']/i.test(html);
  return hasTitle && hasDesc && hasOg;
}

function analyzeLocale(localeDir, locale) {
  const { articles } = walkArticles(localeDir);
  const categories = walkCategoryDirs(localeDir);

  const articleDetails = [];
  let underStandard = 0;
  let missingCta = 0;
  let missingMeta = 0;

  for (const art of articles) {
    const html = fs.readFileSync(art.path, "utf8");
    const words = wordCount(html);
    const cta = hasCta(html);
    const meta = hasMetadata(html);
    if (words < MIN_WORDS) underStandard++;
    if (!cta) missingCta++;
    if (!meta) missingMeta++;
    articleDetails.push({ slug: art.slug, words, has_cta: cta, has_metadata: meta });
  }

  return {
    locale,
    total_articles: articles.length,
    category_pages: categories.length,
    under_standard: underStandard,
    missing_cta: missingCta,
    missing_metadata: missingMeta,
    articles: articleDetails
  };
}

function main() {
  const vi = analyzeLocale(path.join(ROOT, "bai-viet"), "vi");
  const en = analyzeLocale(path.join(ROOT, "en", "bai-viet"), "en");

  const viSlugs = new Set(vi.articles.map((a) => a.slug));
  const enSlugs = new Set(en.articles.map((a) => a.slug));
  const both = [...viSlugs].filter((s) => enSlugs.has(s));
  const viOnly = [...viSlugs].filter((s) => !enSlugs.has(s));
  const enOnly = [...enSlugs].filter((s) => !viSlugs.has(s));

  const stats = {
    generated_at: new Date().toISOString(),
    min_words: MIN_WORDS,
    vi,
    en,
    vi_en_coverage: {
      both: both.length,
      vi_only: viOnly.length,
      en_only: enOnly.length,
      vi_only_slugs: viOnly,
      en_only_slugs: enOnly
    }
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(stats, null, 2));

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    console.log(`Content stats written to ${path.relative(ROOT, OUT_PATH)}`);
    console.log(`  VI: ${vi.total_articles} articles, ${vi.category_pages} categories, ${vi.under_standard} under-standard, ${vi.missing_cta} missing CTA, ${vi.missing_metadata} missing metadata`);
    console.log(`  EN: ${en.total_articles} articles, ${en.category_pages} categories, ${en.under_standard} under-standard, ${en.missing_cta} missing CTA, ${en.missing_metadata} missing metadata`);
    console.log(`  VI/EN coverage: ${both.length} both, ${viOnly.length} VI-only, ${enOnly.length} EN-only`);
  }

  if (FAIL_ON_ISSUES && (vi.under_standard > 0 || en.under_standard > 0)) {
    process.exit(1);
  }
}

main();
