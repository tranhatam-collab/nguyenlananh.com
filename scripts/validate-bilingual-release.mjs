import { runBilingualAudit } from "./lib/bilingual-audit.mjs";

const report = runBilingualAudit(process.cwd());

console.log(`Bilingual validation status: ${report.summary.status}`);
console.log(`URLs audited: ${report.summary.totalUrls}`);
console.log(`Issues found: ${report.summary.totalIssues}`);
console.log(`Blocking issues: ${report.summary.blockingIssues}`);

if (report.summary.totalIssues > 0) {
  console.error("Release validation failed. Resolve blocking bilingual issues before deploy.");
  process.exit(1);
}
