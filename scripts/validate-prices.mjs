#!/usr/bin/env node
/**
 * validate-prices.mjs
 *
 * CI gate: ensures every landing page `data-price` (VND) and `data-plan`
 * attribute matches the canonical price registry in functions/_lib/constants.js.
 *
 * Drift between landing pages and the checkout registry causes customers to be
 * charged a different amount than advertised — this script prevents that.
 *
 * Usage:
 *   node scripts/validate-prices.mjs          # report only, exit 0
 *   node scripts/validate-prices.mjs --fail   # exit 1 on any mismatch
 *   node scripts/validate-prices.mjs --json   # emit JSON report
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const FAIL_ON_ISSUES = ARGS.has("--fail");
const OUTPUT_JSON = ARGS.has("--json");

const CONSTANTS_PATH = path.join(ROOT, "functions", "_lib", "constants.js");
const EXCLUDED_DIRS = new Set([".git", "node_modules", ".wrangler", "functions", "docs", "scripts", "database", ".devin", ".claude", ".codeium"]);

// Plans marked as draft (e.g. monthly_practice) are not expected to have a live
// landing page, but if a landing page references them it must still match.
const DRAFT_PLAN_CODES = new Set(["monthly_practice"]);

async function loadPlans() {
  const fileUrl = pathToFileURL(CONSTANTS_PATH).href;
  const mod = await import(fileUrl);
  // PLANS is the backward-compatible unified registry used by checkout.
  return mod.PLANS;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith(".html")) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

// Extract all (plan, price) pairs from an HTML file by scanning each tag.
// A page may have:
//   - body data-plan="X" data-price="Y"           (default tier)
//   - <input value="X" data-price="Y" />          (tier selector radios)
//   - <any data-plan="X" data-price="Y" />        (explicit pair)
// Plan code is resolved from data-plan, falling back to value="" on inputs.
function extractPriceAttrs(html) {
  const findings = [];
  // Match each opening tag that contains data-price.
  const tagRe = /<[a-zA-Z][^>]*\bdata-price=["']([^"']+)["'][^>]*>/g;
  for (const match of html.matchAll(tagRe)) {
    const tag = match[0];
    const price = match[1];
    const planMatch = tag.match(/\bdata-plan=["']([^"']+)["']/);
    const valueMatch = tag.match(/\bvalue=["']([^"']+)["']/);
    const plan = planMatch?.[1] || valueMatch?.[1] || null;
    findings.push({ plan, price });
  }
  return findings;
}

async function main() {
  const plans = await loadPlans();
  const planByCode = new Map(Object.entries(plans));

  const htmlFiles = walk(ROOT);
  const mismatches = [];
  const unknownPlans = [];
  const missingPriceAttr = [];
  let checked = 0;

  for (const file of htmlFiles) {
    const rel = path.relative(ROOT, file);
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes("data-plan") && !html.includes("data-price")) continue;

    const findings = extractPriceAttrs(html);
    for (const f of findings) {
      checked++;
      if (!f.plan) {
        mismatches.push({ file: rel, plan: null, price: f.price, expected: null, reason: "data-price without data-plan" });
        continue;
      }
      if (!f.price) {
        missingPriceAttr.push({ file: rel, plan: f.plan, reason: "data-plan without data-price" });
        continue;
      }
      const plan = planByCode.get(f.plan);
      if (!plan) {
        unknownPlans.push({ file: rel, plan: f.plan, reason: "plan code not in constants.js" });
        continue;
      }
      const expectedVnd = Number(plan.priceVnd);
      const actualVnd = Number(String(f.price).replace(/[^\d]/g, ""));
      if (Number.isNaN(actualVnd) || actualVnd !== expectedVnd) {
        mismatches.push({
          file: rel,
          plan: f.plan,
          price: f.price,
          expected: expectedVnd,
          reason: `data-price ${actualVnd} !== registry ${expectedVnd}`
        });
      }
    }
  }

  const issues = [...mismatches, ...unknownPlans, ...missingPriceAttr];
  const report = {
    checked,
    mismatch_count: mismatches.length,
    unknown_plan_count: unknownPlans.length,
    missing_price_count: missingPriceAttr.length,
    mismatches,
    unknown_plans: unknownPlans,
    missing_price: missingPriceAttr
  };

  if (OUTPUT_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Price validation: ${checked} attrs checked across ${htmlFiles.length} HTML files.`);
    if (mismatches.length) {
      console.log(`\nMISMATCHES (${mismatches.length}):`);
      for (const m of mismatches) {
        console.log(`  ${m.file}  plan=${m.plan}  ${m.reason}`);
      }
    }
    if (unknownPlans.length) {
      console.log(`\nUNKNOWN PLANS (${unknownPlans.length}):`);
      for (const u of unknownPlans) {
        console.log(`  ${u.file}  plan=${u.plan}  ${u.reason}`);
      }
    }
    if (missingPriceAttr.length) {
      console.log(`\nMISSING data-price (${missingPriceAttr.length}):`);
      for (const m of missingPriceAttr) {
        console.log(`  ${m.file}  plan=${m.plan}  ${m.reason}`);
      }
    }
    if (issues.length === 0) {
      console.log("PASS — all landing page prices match the registry.");
    } else {
      console.log(`\nFAIL — ${issues.length} issue(s) found.`);
    }
  }

  if (FAIL_ON_ISSUES && issues.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("validate-prices failed:", err);
  process.exit(2);
});
