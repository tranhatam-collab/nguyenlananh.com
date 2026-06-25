#!/usr/bin/env node
/**
 * Broken links checker — scans all HTML files for internal links
 * and verifies they point to existing files.
 * Run: node scripts/check-broken-links.mjs
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Collect all HTML files
async function collectHtmlFiles(dir, files = []) {
  const entries = await readdirSafe(dir);
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== ".wrangler") {
      await collectHtmlFiles(full, files);
    } else if (entry.name.endsWith(".html") || entry.name.endsWith(".htm")) {
      files.push(full);
    }
  }
  return files;
}

async function readdirSafe(dir) {
  try {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(dir, { withFileTypes: true });
    return entries;
  } catch {
    return [];
  }
}

// Extract internal links from HTML
function extractLinks(html, filePath) {
  const links = [];
  const hrefRegex = /href=["']([^"']+)["']/g;
  const srcRegex = /src=["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    links.push({ url: match[1], type: "href", source: filePath });
  }
  while ((match = srcRegex.exec(html)) !== null) {
    links.push({ url: match[1], type: "src", source: filePath });
  }
  return links;
}

// Resolve a URL to a file path
function resolveUrl(url, sourceFile) {
  // Skip external, anchor, mailto, tel, API endpoints (dynamic)
  if (url.startsWith("http") || url.startsWith("//") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("data:") || url.startsWith("javascript:") || url.startsWith("/api/") || url.includes("/api/")) {
    return null;
  }
  // Remove query string and anchor
  const clean = url.split("?")[0].split("#")[0];
  if (!clean) return null;

  // Absolute path from root
  if (clean.startsWith("/")) {
    return join(ROOT, clean);
  }
  // Relative path
  return resolve(dirname(sourceFile), clean);
}

// Planned product pages (not yet built — links from member academy/deep pages)
const PLANNED_PRODUCTS = new Set([
  "/products/37-day-life-project-studio/",
  "/products/21-day-true-rhythm-design/",
  "/products/community-builder-practice/",
  "/products/creative-work-operating-system/",
  "/products/decision-clarity-lab/",
  "/products/environment-design-lab/",
  "/products/family-roles-boundaries-lab/",
  "/products/life-system-mapping-lab/",
  "/products/personal-resource-economy/",
  "/products/space-reset-professional-lab/",
]);

// Check if a path exists (handle /dir/ → /dir/index.html)
function pathExists(path) {
  if (existsSync(path)) return true;
  // Try index.html for directory paths
  if (existsSync(join(path, "index.html"))) return true;
  // Try without trailing slash
  if (path.endsWith("/") && existsSync(path.slice(0, -1))) return true;
  // Try with .html extension
  if (!extname(path) && existsSync(path + ".html")) return true;
  return false;
}

async function main() {
  console.log("Broken links checker — scanning all HTML files...\n");
  const files = await collectHtmlFiles(ROOT);
  console.log(`Found ${files.length} HTML files.\n`);

  const broken = [];
  let totalLinks = 0;
  let checkedLinks = 0;

  for (const file of files) {
    const html = await readFile(file, "utf-8");
    const links = extractLinks(html, file);
    for (const link of links) {
      totalLinks++;
      const resolved = resolveUrl(link.url, link.source);
      if (resolved === null) continue; // external/skip
      checkedLinks++;
      if (!pathExists(resolved)) {
        // Allow planned products
        const cleanUrl = link.url.split("?")[0].split("#")[0];
        if (PLANNED_PRODUCTS.has(cleanUrl)) continue;
        const relFile = file.replace(ROOT + "/", "");
        broken.push({ file: relFile, url: link.url, type: link.type });
      }
    }
  }

  console.log(`Checked ${checkedLinks} internal links (out of ${totalLinks} total).\n`);

  if (broken.length === 0) {
    console.log("PASS — no broken internal links found.");
    process.exit(0);
  } else {
    console.log(`FAIL — ${broken.length} broken links found:\n`);
    for (const b of broken) {
      console.log(`  ${b.file} → ${b.url} [${b.type}]`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
