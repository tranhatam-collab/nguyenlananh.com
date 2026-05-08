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
      /human_reflection/,
      /intake queue/i,
      /recommended route/i,
      /admin reflection and admin pilot can now import/i,
      /open a module on the same machine with the full intake queue/i,
      /priority/i
    ]
  },
  {
    file: "members/dashboard/index.html",
    patterns: [
      /id="member-ops-status"/,
      /id="member-ops-summary"/,
      /id="member-ops-next"/,
      /id="memberOpsSnapshotOutput"/,
      /admin home/
    ]
  },
  {
    file: "en/members/dashboard/index.html",
    patterns: [
      /id="member-ops-status"/,
      /id="member-ops-summary"/,
      /id="member-ops-next"/,
      /id="memberOpsSnapshotOutput"/,
      /admin home/
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
      /id="pilot-readiness-status"/,
      /id="pilotReadinessOutput"/,
      /admin pilot/
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
      /id="pilot-readiness-status"/,
      /id="pilotReadinessOutput"/,
      /admin pilot/
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
      /intake queue packet/i,
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
      /intake queue packet/i,
      /Back to Members/
    ]
  },
  {
    file: "admin/index.html",
    patterns: [
      /id="member-snapshot-import"/,
      /id="member-snapshot-queue"/,
      /id="member-snapshot-queue-route-filter"/,
      /id="member-snapshot-queue-handoff-filter"/,
      /id="member-snapshot-queue-priority-filter"/,
      /id="member-snapshot-queue-packet"/,
      /id="member-snapshot-queue-copy"/,
      /id="member-snapshot-queue-export"/,
      /id="member-snapshot-queue-merge"/,
      /id="member-snapshot-queue-open-reflection"/,
      /id="member-snapshot-queue-open-pilot"/,
      /phần đang lọc/,
      /id="member-snapshot-queue-handoff-preview"/
    ]
  },
  {
    file: "en/admin/index.html",
    patterns: [
      /id="member-snapshot-import"/,
      /id="member-snapshot-queue"/,
      /id="member-snapshot-queue-route-filter"/,
      /id="member-snapshot-queue-handoff-filter"/,
      /id="member-snapshot-queue-priority-filter"/,
      /id="member-snapshot-queue-packet"/,
      /id="member-snapshot-queue-copy"/,
      /id="member-snapshot-queue-export"/,
      /id="member-snapshot-queue-merge"/,
      /id="member-snapshot-queue-open-reflection"/,
      /id="member-snapshot-queue-open-pilot"/,
      /filtered queue/,
      /id="member-snapshot-queue-handoff-preview"/
    ]
  },
  {
    file: "admin/pilot/index.html",
    patterns: [
      /<meta name="robots" content="noindex,follow" \/>/,
      /Readiness pilot 14 ngày/,
      /id="pilot-status"/,
      /id="pilot-evidence-output"/,
      /intake queue packet/i,
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
      /intake queue packet/i,
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
      /packet_type: "member_ops_snapshot"/,
      /function initDashboardPage\(session\)/,
      /function initPilotPage\(session\)/,
      /packet_type: "member_pilot_readiness"/,
      /function initReflectionPage\(session\)/
    ]
  },
  {
    file: "assets/admin-console.js",
    patterns: [
      /function initReflection\(\)/,
      /member-snapshot-import/,
      /member-snapshot-queue/,
      /member-snapshot-queue-packet/,
      /member-snapshot-queue-copy/,
      /member-snapshot-queue-export/,
      /member-snapshot-queue-merge/,
      /member-snapshot-save/,
      /admin_member_snapshot_queue/,
      /buildMemberSnapshotQueuePacket/,
      /buildFilteredMemberSnapshotQueuePacket/,
      /mergeMemberSnapshotQueueItems/,
      /imported_admin_intake_queue/,
      /admin_home_filtered_queue/,
      /describeQueueFilters/,
      /formatPriorityMix/,
      /renderImportedSubsetSummary/,
      /Filter scope:|Phạm vi lọc:/,
      /Priority mix:|Tương quan ưu tiên:/,
      /Imported subset summary|Tóm tắt subset đã nạp/,
      /all priority levels|tất cả mức ưu tiên/,
      /Open reflection ops with filtered queue|Mở reflection ops với phần đang lọc/,
      /Open pilot ops with filtered queue|Mở pilot ops với phần đang lọc/,
      /Batch handoff preview:|Xem trước batch handoff:/,
      /queue_total/,
      /queue_relevant/,
      /Queue -> reflection|Sẵn cho reflection/,
      /Queue -> pilot|Sẵn cho pilot/,
      /Already routed|Đã handoff/,
      /recommendedRouteForSnapshot/,
      /queueRecommendedRoute/,
      /queueLastRoutedTo/,
      /data-member-queue-action/,
      /pendingReflectionPacket/,
      /pendingPilotPacket/,
      /pendingReflectionQueuePacket/,
      /pendingPilotQueuePacket/,
      /member_ops_snapshot/,
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
      /imported_member_pilot_readiness/,
      /ready_profiles_with_checkin/,
      /Copy evidence|Đã copy pilot evidence/,
      /Needs reflection now|Cần reflection ngay/,
      /Ready for pilot review|Sẵn rà pilot/,
      /Priority|Ưu tiên/,
      /Priority now|Ưu tiên hiện tại/,
      /data-priority-quick-filter/,
      /Visible now|Đang hiện/,
      /No queue item matches the current filters|Không có item nào khớp bộ lọc hiện tại/
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
