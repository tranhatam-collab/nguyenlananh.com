#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const failMode = process.argv.includes("--fail");

const checks = [
  {
    file: "docs/NGUYENLANANH_WEBSITE_PRODUCT_PLAN_2026-05-03.md",
    patterns: [
      /Stripe is temporarily deferred/i,
      /practice field/i,
      /readiness filter/i,
      /done/,
      /smaller_step/,
      /avoiding/,
      /human_reflection/
    ]
  },
  {
    file: "members/dashboard/index.html",
    patterns: [
      /id="member-ops-status"/,
      /id="member-ops-summary"/,
      /id="member-ops-next"/
    ]
  },
  {
    file: "en/members/dashboard/index.html",
    patterns: [
      /id="member-ops-status"/,
      /id="member-ops-summary"/,
      /id="member-ops-next"/
    ]
  },
  {
    file: "members/start/index.html",
    patterns: [
      /id="profilePracticeTrack"/,
      /value="gentle"/,
      /value="deep"/,
      /id="profileReminderIntensity"/,
      /value="none"/,
      /value="rhythm"/,
      /id="profileReminderPause"/,
      /Tạm dừng nhắc 7 ngày/
    ]
  },
  {
    file: "en/members/start/index.html",
    patterns: [
      /id="profilePracticeTrack"/,
      /value="gentle"/,
      /value="deep"/,
      /id="profileReminderIntensity"/,
      /value="none"/,
      /value="rhythm"/,
      /id="profileReminderPause"/,
      /Pause reminders for 7 days/
    ]
  },
  {
    file: "members/practice/index.html",
    patterns: [
      /name="practiceState"/,
      /value="done"/,
      /value="smaller_step"/,
      /value="avoiding"/,
      /value="human_reflection"/,
      /data-practice-one-line/,
      /Tôi đang né/,
      /data-practice-handoff-status/
    ]
  },
  {
    file: "en/members/practice/index.html",
    patterns: [
      /name="practiceState"/,
      /value="done"/,
      /value="smaller_step"/,
      /value="avoiding"/,
      /value="human_reflection"/,
      /data-practice-one-line/,
      /I am avoiding/,
      /data-practice-handoff-status/
    ]
  },
  {
    file: "members/pilot/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Pilot 14 ngày/,
      /Nhịp nhẹ/,
      /Đối diện sâu/,
      /Tôi đang né/,
      /data-profile-track/,
      /id="pilot-readiness-status"/
    ]
  },
  {
    file: "en/members/pilot/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /14-Day Pilot/,
      /Gentle Rhythm/,
      /Deep Facing/,
      /I am avoiding/,
      /data-profile-track/,
      /id="pilot-readiness-status"/
    ]
  },
  {
    file: "members/circle/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Nhóm nhỏ thực hành/,
      /8-20 người/,
      /không feed lớn/i,
      /Tôi đang né/,
      /data-profile-track/
    ]
  },
  {
    file: "members/reflection/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Bàn giao phản hồi người thật/,
      /Khung bàn giao 3 dòng/,
      /id="reflectionHandoffForm"/,
      /id="reflectionHandoffOutput"/,
      /admin reflection/,
      /data-profile-track/,
      /Quay lại check-in/
    ]
  },
  {
    file: "en/members/reflection/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Human reflection handoff/,
      /The 3-line handoff/,
      /id="reflectionHandoffForm"/,
      /id="reflectionHandoffOutput"/,
      /admin reflection/,
      /data-profile-track/,
      /Return to check-in/
    ]
  },
  {
    file: "admin/reflection/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Hàng đợi phản hồi người thật/,
      /Triage trước khi trả lời/,
      /id="reflection-status"/,
      /id="reflection-evidence-output"/,
      /Quay lại Members/
    ]
  },
  {
    file: "en/admin/reflection/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Human reflection queue/,
      /Triage before replying/,
      /id="reflection-status"/,
      /id="reflection-evidence-output"/,
      /Back to Members/
    ]
  },
  {
    file: "admin/pilot/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Readiness pilot 14 ngày/,
      /id="pilot-status"/,
      /id="pilot-evidence-output"/,
      /Day 1/,
      /Day 3/,
      /Day 7/
    ]
  },
  {
    file: "en/admin/pilot/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /14-day pilot readiness/,
      /id="pilot-status"/,
      /id="pilot-evidence-output"/,
      /Day 1/,
      /Day 3/,
      /Day 7/
    ]
  },
  {
    file: "en/members/circle/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Quiet Practice Circle/,
      /8-20 people/,
      /No large feed/,
      /I am avoiding/,
      /data-profile-track/
    ]
  },
  {
    file: "assets/members.js",
    patterns: [
      /practiceTrack/,
      /reminderIntensity/,
      /reminderPausedUntil/,
      /practiceState/,
      /oneLine/,
      /needsHumanReflection/,
      /reflectionReadyTitle/,
      /data-practice-reflection-panel/,
      /nla_member_reflection_handoffs/,
      /packet_type: "member_reflection_handoff"/,
      /reflectionHandoffMatchesLatest/,
      /handoffReadyStatus/,
      /function initDashboardPage\(session\)/,
      /function initPilotPage\(session\)/,
      /function initReflectionPage\(session\)/
    ]
  },
  {
    file: "assets/admin-console.js",
    patterns: [
      /function initReflection\(\)/,
      /nla_member_progress/,
      /nla_member_reflection_handoffs/,
      /reflection-status/,
      /Needs human reflection|Cần phản hồi người thật/,
      /reflection-evidence-output/,
      /Copied reflection evidence|Đã copy reflection evidence/,
      /imported_member_reflection_handoff/,
      /matched_handoffs/,
      /function initPilot\(\)/,
      /nla_member_profiles/,
      /pilot-status/,
      /Ready for Day 1 welcome|Sẵn sàng welcome Day 1/,
      /pilot-evidence-output/,
      /ready_profiles_with_checkin/,
      /Copy evidence|Đã copy pilot evidence/
    ]
  },
  {
    file: "docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md",
    patterns: [
      /reminder_pause_url/,
      /reminder_settings_url/,
      /five_minute_step/,
      /Tạm dừng nhắc 7 ngày/,
      /Pause reminders for 7 days/
    ]
  },
  {
    file: "sitemap.xml",
    patterns: [
      /^(?![\s\S]*\/members\/pilot\/)[\s\S]*$/,
      /^(?![\s\S]*\/members\/circle\/)[\s\S]*$/,
      /^(?![\s\S]*\/members\/reflection\/)[\s\S]*$/,
      /^(?![\s\S]*\/admin\/reflection\/)[\s\S]*$/,
      /^(?![\s\S]*\/admin\/pilot\/)[\s\S]*$/
    ]
  }
];

const issues = [];

for (const check of checks) {
  const path = resolve(root, check.file);
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    issues.push({ file: check.file, issue: "file_missing", detail: error.message });
    continue;
  }

  for (const pattern of check.patterns) {
    if (!pattern.test(text)) {
      issues.push({
        file: check.file,
        issue: "pattern_missing",
        detail: String(pattern)
      });
    }
  }
}

console.log("\nPractice-field readiness audit");
console.log(`  Files checked: ${checks.length}`);
console.log(`  Issues found: ${issues.length}`);

if (issues.length) {
  for (const item of issues) {
    console.log(`- ${item.file}: ${item.issue} ${item.detail}`);
  }
}

if (issues.length && failMode) {
  process.exit(1);
}
