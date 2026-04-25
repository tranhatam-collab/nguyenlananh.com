#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const baseUrl = "https://www.nguyenlananh.com";
const manifestPath = path.join(root, "admin/content/articles-launch-collection.json");

function fail(message, errors) {
  errors.push(message);
}

function readText(filePath, errors) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing file: ${path.relative(root, filePath)}`, errors);
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function pagePathFromRoute(routePath) {
  return path.join(root, routePath.replace(/^\/+/, ""), "index.html");
}

function expectIncludes(haystack, needle, label, errors) {
  if (!haystack.includes(needle)) {
    fail(`Missing ${label}: ${needle}`, errors);
  }
}

function checkManifest(manifest, errors) {
  if (manifest.collection !== "articles") {
    fail(`Unexpected collection: ${manifest.collection}`, errors);
  }

  if (manifest.status !== "published") {
    fail(`Unexpected manifest status: ${manifest.status}`, errors);
  }

  if (!Array.isArray(manifest.items)) {
    fail("Manifest items is not an array", errors);
    return [];
  }

  if (manifest.items.length !== 10) {
    fail(`Expected 10 launch articles, found ${manifest.items.length}`, errors);
  }

  const publishOrders = manifest.items.map((item) => item.publish_order);
  const uniqueOrders = new Set(publishOrders);
  const expectedOrders = Array.from({ length: manifest.items.length }, (_, index) => index + 1);

  if (uniqueOrders.size !== publishOrders.length) {
    fail("Publish order contains duplicates", errors);
  }

  if (JSON.stringify(publishOrders) !== JSON.stringify(expectedOrders)) {
    fail(`Publish order is not locked as 1..${manifest.items.length}`, errors);
  }

  const slugs = manifest.items.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) {
    fail("Manifest contains duplicate slugs", errors);
  }

  for (const item of manifest.items) {
    if (item.collection !== "articles") {
      fail(`Item ${item.slug} has unexpected collection: ${item.collection}`, errors);
    }

    if (item.status !== "published") {
      fail(`Item ${item.slug} is not published`, errors);
    }
  }

  return manifest.items;
}

const errors = [];
const manifestRaw = readText(manifestPath, errors);
let manifest = { items: [] };

if (manifestRaw) {
  try {
    manifest = JSON.parse(manifestRaw);
  } catch (error) {
    fail(`Manifest is not valid JSON: ${error.message}`, errors);
  }
}

const items = checkManifest(manifest, errors);
const articleListVi = readText(path.join(root, "bai-viet/index.html"), errors);
const articleListEn = readText(path.join(root, "en/bai-viet/index.html"), errors);
const adminContent = readText(path.join(root, "admin/content/index.html"), errors);
const sitemap = readText(path.join(root, "sitemap.xml"), errors);

for (const item of items) {
  const viFilePath = pagePathFromRoute(item.path_vi);
  const enFilePath = pagePathFromRoute(item.path_en);
  const viHtml = readText(viFilePath, errors);
  const enHtml = readText(enFilePath, errors);
  const viUrl = `${baseUrl}${item.path_vi}`;
  const enUrl = `${baseUrl}${item.path_en}`;

  expectIncludes(viHtml, `<link rel="canonical" href="${viUrl}"`, `${item.slug} VI canonical`, errors);
  expectIncludes(viHtml, `hreflang="en-US" href="${enUrl}"`, `${item.slug} VI en alternate`, errors);
  expectIncludes(viHtml, `hreflang="vi" href="${viUrl}"`, `${item.slug} VI vi alternate`, errors);
  expectIncludes(viHtml, `<script type="application/ld+json">`, `${item.slug} VI schema`, errors);
  expectIncludes(viHtml, `href="${item.cta_vi.href}"`, `${item.slug} VI CTA`, errors);

  expectIncludes(enHtml, `<link rel="canonical" href="${enUrl}"`, `${item.slug} EN canonical`, errors);
  expectIncludes(enHtml, `hreflang="vi" href="${viUrl}"`, `${item.slug} EN vi alternate`, errors);
  expectIncludes(enHtml, `hreflang="en-US" href="${enUrl}"`, `${item.slug} EN en alternate`, errors);
  expectIncludes(enHtml, `<script type="application/ld+json">`, `${item.slug} EN schema`, errors);
  expectIncludes(enHtml, `href="${item.cta_en.href}"`, `${item.slug} EN CTA`, errors);

  for (const link of item.internal_links ?? []) {
    expectIncludes(viHtml, `href="${link.path_vi}"`, `${item.slug} VI internal link`, errors);
    expectIncludes(enHtml, `href="${link.path_en}"`, `${item.slug} EN internal link`, errors);
  }

  expectIncludes(articleListVi, `href="${item.path_vi}"`, `${item.slug} VI list page link`, errors);
  expectIncludes(articleListEn, `href="${item.path_en}"`, `${item.slug} EN list page link`, errors);
  expectIncludes(sitemap, `<loc>${viUrl}</loc>`, `${item.slug} VI sitemap entry`, errors);
  expectIncludes(sitemap, `<loc>${enUrl}</loc>`, `${item.slug} EN sitemap entry`, errors);
}

if (items.length > 0) {
  const first = items[0];
  const last = items[items.length - 1];
  expectIncludes(adminContent, "/admin/content/articles-launch-collection.json", "admin manifest link", errors);
  expectIncludes(adminContent, `href="${first.path_vi}"`, "admin first publish order link", errors);
  expectIncludes(adminContent, `href="${last.path_vi}"`, "admin last publish order link", errors);
  expectIncludes(adminContent, "launch-10-inner-clarity", "admin series marker", errors);
}

if (errors.length > 0) {
  console.error("FAIL launch articles smoke check");
  for (const [index, error] of errors.entries()) {
    console.error(`${index + 1}. ${error}`);
  }
  process.exit(1);
}

console.log("PASS launch articles smoke check");
console.log(`Checked ${items.length} launch articles`);
console.log("Verified manifest, VI/EN routes, list pages, admin content, and sitemap");
