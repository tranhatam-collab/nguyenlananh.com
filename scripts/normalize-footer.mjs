#!/usr/bin/env node
/**
 * normalize-footer.mjs
 * Unifies the © tagline line in every footer.
 *
 * VI: "Không phải để trở thành ai đó. Mà để trở về đúng là mình."
 * EN: "Not to become someone else. To return to who you truly are."
 *
 * Detects locale via the surrounding <html lang="..."> attribute.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXCLUDE_DIRS = new Set([".git", "node_modules", "docs", "scripts", "functions", ".wrangler"]);

const VI_TAGLINE = "Không phải để trở thành ai đó. Mà để trở về đúng là mình.";
const EN_TAGLINE = "Not to become someone else. To return to who you truly are.";

// Match: © <span id="year"></span> · <anything until the next "<">
const COPY_RX = /(©\s*<span id="year"><\/span>\s*·\s*)([^<]+)/g;

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

let scanned = 0;
let changed = 0;
const changedFiles = [];

for await (const file of walk(ROOT)) {
  scanned += 1;
  const before = readFileSync(file, "utf8");
  const isEnglish = /<html[^>]*lang="en/i.test(before);
  const target = isEnglish ? EN_TAGLINE : VI_TAGLINE;
  const after = before.replace(COPY_RX, (_match, prefix) => `${prefix}${target}`);
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    changed += 1;
    changedFiles.push(relative(ROOT, file));
  }
}

console.log(JSON.stringify({ scanned, changed }, null, 2));
