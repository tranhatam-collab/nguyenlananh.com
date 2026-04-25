import fs from "node:fs";
import path from "node:path";
import { buildMarkdownReport, runBilingualAudit } from "./lib/bilingual-audit.mjs";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const JSON_PATH = path.join(REPORT_DIR, "bilingual-audit.json");
const MD_PATH = path.join(REPORT_DIR, "BILINGUAL_LANGUAGE_REBUILD_REPORT.md");

const report = runBilingualAudit(ROOT);
const markdown = buildMarkdownReport(report);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
fs.writeFileSync(MD_PATH, markdown, "utf8");

console.log(`Bilingual audit written to ${JSON_PATH}`);
console.log(`Markdown report written to ${MD_PATH}`);
console.log(`Status: ${report.summary.status}`);
console.log(`URLs audited: ${report.summary.totalUrls}`);
console.log(`Total issues: ${report.summary.totalIssues}`);
console.log(`Blocking issues: ${report.summary.blockingIssues}`);
