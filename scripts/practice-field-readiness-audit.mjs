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
      /Tôi đang né/
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
      /I am avoiding/
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
      /needsHumanReflection/
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
