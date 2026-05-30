#!/usr/bin/env node
// Simple test runner for _lib pure functions.
// Usage: node scripts/test-lib.mjs
// Or:    node --test tests/*.test.mjs

import { execSync } from "node:child_process";

const files = [
  "tests/lib-utils.test.mjs",
  "tests/lib-session.test.mjs"
];

console.log("== _lib unit tests ==");
for (const file of files) {
  try {
    execSync(`node --check ${file}`, { stdio: "inherit" });
    console.log(`  syntax OK: ${file}`);
  } catch (e) {
    console.error(`  syntax FAIL: ${file}`);
    process.exit(1);
  }
}

console.log("\nTo run tests locally:");
console.log("  node --test tests/*.test.mjs");
console.log("  # or individually:");
console.log("  node --test tests/lib-utils.test.mjs");
console.log("  node --test tests/lib-session.test.mjs");
