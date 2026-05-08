#!/usr/bin/env node
/**
 * homepage-refresh-readiness-gate.mjs
 *
 * Validates Step 2-3 readiness conditions before homepage refresh.
 * This script checks only content/runtime surface contracts and reports
 * explicit true-state for production smoke evidence.
 *
 * Usage:
 *   node scripts/homepage-refresh-readiness-gate.mjs
 *   node scripts/homepage-refresh-readiness-gate.mjs --fail
 *   BASE_URL=https://www.nguyenlananh.com node scripts/homepage-refresh-readiness-gate.mjs --fail --require-live
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const FAIL_ON_ISSUES = ARGS.has("--fail");
const REQUIRE_LIVE = ARGS.has("--require-live") || process.env.REQUIRE_LIVE === "1";
const BASE_URL = (process.env.BASE_URL || "").trim().replace(/\/+$/, "");
const REPORT_DIR = path.join(ROOT, "docs", "reports");
const REPORT_JSON = path.join(REPORT_DIR, "HOMEPAGE_REFRESH_READINESS_GATE.json");
const REPORT_MD = path.join(REPORT_DIR, "HOMEPAGE_REFRESH_READINESS_GATE.md");

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(ROOT, file));
}

function check(id, title, passed, evidence, blocker = true) {
  return {
    id,
    title,
    status: passed ? "pass" : "fail",
    blocker,
    evidence,
  };
}

function pendingCheck(id, title, evidence, blocker) {
  return {
    id,
    title,
    status: "pending",
    blocker,
    evidence,
  };
}

async function runLiveSmoke(baseUrl) {
  const routes = [
    "/members/pro/family/",
    "/members/pro/children/",
    "/en/members/pro/family/",
    "/en/members/pro/children/",
    "/members/creator/",
    "/en/members/creator/",
  ];
  const results = [];
  for (const route of routes) {
    const url = `${baseUrl}${route}`;
    let status = 0;
    let ok = false;
    try {
      const res = await fetch(url, { redirect: "manual" });
      status = res.status;
      ok = status === 200;
    } catch {
      status = 0;
      ok = false;
    }
    results.push({ route, status, ok, url });
  }
  return results;
}

const checks = [];

const deepFiles = [
  "members/deep/index.html",
  "en/members/deep/index.html",
];
const deepTopics = [
  "ban-do-vong-lap",
  "am-thanh-tu-than",
  "gia-dinh-va-goc-re",
  "tre-em-va-khong-gian-lon-len",
  "moi-truong-song-nhu-mot-than-the-thu-hai",
  "ky-luat-nhe-va-nhip-song-moi",
  "lao-dong-vat-the-va-su-truong-thanh",
  "ranh-gioi-mem-trong-gia-dinh",
  "doi-thoai-chua-lanh-trong-nha",
  "tre-em-va-nhip-song-so",
];
const deepMissing = [];
for (const file of deepFiles) {
  if (!exists(file)) {
    deepMissing.push(file);
    continue;
  }
  const html = read(file);
  for (const slug of deepTopics) {
    if (!html.includes(slug)) {
      deepMissing.push(`${file} missing ${slug}`);
    }
  }
}
checks.push(
  check(
    "deep_pages_reflect_final_tracks",
    "Deep pages reflect final track structure",
    deepMissing.length === 0,
    deepMissing.length ? deepMissing : ["members/deep/ and en/members/deep/ list all 10 deep topics"],
  )
);

const proRouteFiles = [
  "members/pro/family/index.html",
  "members/pro/children/index.html",
  "en/members/pro/family/index.html",
  "en/members/pro/children/index.html",
];
const proMissing = proRouteFiles.filter((file) => !exists(file));
checks.push(
  check(
    "pro_required_new_routes_exist",
    "Required new Pro routes exist",
    proMissing.length === 0,
    proMissing.length ? proMissing : proRouteFiles,
  )
);

const proViHtml = exists("members/pro/index.html") ? read("members/pro/index.html") : "";
const proEnHtml = exists("en/members/pro/index.html") ? read("en/members/pro/index.html") : "";
const proIndexReady =
  proViHtml.includes("8 gói nâng cấp") &&
  proViHtml.includes("/members/pro/family/") &&
  proViHtml.includes("/members/pro/children/") &&
  proEnHtml.includes("8 guided upgrades") &&
  proEnHtml.includes("/en/members/pro/family/") &&
  proEnHtml.includes("/en/members/pro/children/");
checks.push(
  check(
    "pro_index_exposes_8_tracks",
    "Pro index pages expose 8-track surface",
    proIndexReady,
    proIndexReady
      ? ["members/pro/index.html and en/members/pro/index.html show 8 tracks including family and children"]
      : ["Pro index pages still not aligned to 8-track manifest"],
  )
);

const creatorGuides = [
  "members/creator/guidelines/index.html",
  "en/members/creator/guidelines/index.html",
];
const creatorGuideMissing = creatorGuides.filter((file) => !exists(file));
const creatorCurriculumVisible =
  creatorGuideMissing.length === 0 &&
  read("members/creator/guidelines/index.html").includes("curriculum") &&
  read("en/members/creator/guidelines/index.html").includes("curriculum");
checks.push(
  check(
    "creator_curriculum_visible_to_members",
    "Creator curriculum visible in member creator area",
    creatorCurriculumVisible,
    creatorCurriculumVisible
      ? creatorGuides
      : creatorGuideMissing.length
        ? creatorGuideMissing
        : ["Creator guideline pages do not include curriculum section text"],
  )
);

let entitlementMapCheck = false;
let entitlementEvidence = [];
if (exists("admin/content/member-programs-collection.json")) {
  const manifest = JSON.parse(read("admin/content/member-programs-collection.json"));
  const requiredGate = Array.isArray(manifest?.homepage_gate?.required_before_refresh)
    ? manifest.homepage_gate.required_before_refresh
    : [];
  const proTracks = Array.isArray(manifest?.pro_tracks) ? manifest.pro_tracks : [];
  const familyTrack = proTracks.find((track) => track?.code === "family_relationship_systems");
  const childrenTrack = proTracks.find((track) => track?.code === "children_education_environment");
  entitlementMapCheck =
    requiredGate.includes("entitlement_map_exists") &&
    familyTrack?.route_status === "existing" &&
    childrenTrack?.route_status === "existing";
  entitlementEvidence = entitlementMapCheck
    ? [
        "homepage_gate.required_before_refresh includes entitlement_map_exists",
        "pro_tracks family_relationship_systems route_status=existing",
        "pro_tracks children_education_environment route_status=existing",
      ]
    : ["member-programs manifest not aligned to entitlement map requirements"];
} else {
  entitlementEvidence = ["admin/content/member-programs-collection.json missing"];
}
checks.push(
  check(
    "entitlement_map_exists",
    "Package/entitlement map reflected in runtime docs/code",
    entitlementMapCheck,
    entitlementEvidence,
  )
);

const adminContentHtml = exists("admin/content/index.html") ? read("admin/content/index.html") : "";
const adminChecklistVisible =
  adminContentHtml.includes("Danh sách kiểm tra phát hành bước 2-3") &&
  adminContentHtml.includes("admin-release-checklist");
checks.push(
  check(
    "admin_release_checklist_exists",
    "Admin release checklist visible",
    adminChecklistVisible,
    adminChecklistVisible
      ? ["admin/content/index.html contains the release checklist section"]
      : ["admin/content/index.html missing release checklist section"],
  )
);

if (!BASE_URL) {
  checks.push(
    pendingCheck(
      "production_smoke_passes",
      "Production route smoke after Step 2-3 build",
      ["Set BASE_URL to run live smoke (example: https://www.nguyenlananh.com)"],
      REQUIRE_LIVE,
    )
  );
} else {
  const liveResults = await runLiveSmoke(BASE_URL);
  const failed = liveResults.filter((row) => !row.ok);
  checks.push({
    id: "production_smoke_passes",
    title: "Production route smoke after Step 2-3 build",
    status: failed.length ? "fail" : "pass",
    blocker: true,
    evidence: liveResults.map((row) => `${row.route} -> ${row.status}`),
  });
}

const blockers = checks.filter((item) => item.blocker && item.status !== "pass");
const hasPendingOnly = blockers.length > 0 && blockers.every((item) => item.status === "pending");
const verdict = blockers.length === 0
  ? "HOMEPAGE_REFRESH_GATE_PASS"
  : hasPendingOnly
    ? "RELEASE_READY_PENDING_EVIDENCE"
    : "HOMEPAGE_REFRESH_GATE_BLOCKED";

const report = {
  summary: {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL || null,
    requireLive: REQUIRE_LIVE,
    totalChecks: checks.length,
    blockingCount: blockers.length,
    verdict,
  },
  checks,
};

const md = [
  "# Homepage Refresh Readiness Gate",
  "",
  `Verdict: ${verdict}`,
  "",
  `Generated at: ${report.summary.generatedAt}`,
  `Base URL: ${BASE_URL || "(not provided)"}`,
  `Require live smoke: ${REQUIRE_LIVE ? "yes" : "no"}`,
  "",
  "| Check | Status | Blocker | Evidence |",
  "|---|---|---|---|",
  ...checks.map((item) => `| ${item.title} | ${item.status.toUpperCase()} | ${item.blocker ? "yes" : "no"} | ${item.evidence.join("<br>")} |`),
  "",
  "True state:",
  `- ${verdict}`,
].join("\n");

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");
fs.writeFileSync(REPORT_MD, `${md}\n`, "utf8");

console.log(`Homepage refresh readiness: ${verdict}`);
console.log(`Report JSON: ${REPORT_JSON}`);
console.log(`Report MD: ${REPORT_MD}`);
if (blockers.length) {
  for (const item of blockers) {
    console.log(`BLOCKER: ${item.id} (${item.status})`);
  }
}

if (FAIL_ON_ISSUES && blockers.length) process.exit(1);
