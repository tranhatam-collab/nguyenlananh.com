# Practice Field Repositioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition `nguyenlananh.com` from a content/course surface into a filtering practice field: public pages invite the right people, members receive small non-coercive practices, email respects consent, and human-led pilot circles become the retention layer.

**Architecture:** Keep the current static HTML + `assets/members.js` + Cloudflare Pages Functions/D1 architecture. Payment rails remain the critical path and are not blocked by this plan; this plan starts with docs/copy/product framing, then adds low-risk member profile/check-in fields, reminder consent, and pilot evidence gates. The platform remains bilingual, VN-first on `nguyenlananh.com`, with EN kept consistent but not over-expanded.

**Tech Stack:** Static HTML, vanilla JS in `assets/members.js`, Cloudflare Pages Functions, D1 payment/member tables, Mail IAI One email provider, existing audit gates (`content-audit`, `validate-bilingual-release`, `local-public-site-audit`, `team2-live-gate`, `payment-rails-independent-gate`).

---

## Strategic Lock

### Product Decision

`nguyenlananh.com` is not a self-help blog, not a habit app, and not a mass-market course. It is a practice field for people who are willing to see avoidance, meet the emotional root, and take one small real action with rhythm and human support.

### Non-Negotiables

- Do not promise automatic transformation.
- Do not use email reminders as pressure.
- Do not make check-in equal to "I succeeded today".
- Do not build a noisy social feed.
- Do not remove Stripe from code or roadmap; Stripe is temporarily deferred for the current payment phase.
- Do not block current PayPal/VietQR/Email payment work with this repositioning plan.

### Product Language

Use this language consistently:

- VI: `trường thực hành`, `lưới lọc người sẵn sàng`, `nhịp nhẹ`, `đối diện sâu`, `một bước thật`, `điểm né`, `người thật đi cùng`.
- EN: `practice field`, `readiness filter`, `gentle rhythm`, `deep facing`, `one real step`, `avoidance point`, `human companionship`.

Avoid these labels in public positioning:

- VI: `thay đổi tự động`, `hack thói quen`, `cam kết lột xác`, `đọc là chuyển hóa`, `ai cũng dùng được`.
- EN: `automatic transformation`, `habit hack`, `instant change`, `read and transform`, `for everyone`.

---

## File Map

### Create

- `docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md`
  - Canonical product memo for dev, content, legal, marketing, and operations.
- `docs/PRACTICE_FIELD_PILOT_14_DAY_SPEC.md`
  - Pilot design for 10-20 people, with check-in prompts and human review points.
- `scripts/practice-field-readiness-audit.mjs`
  - Static audit to catch regressions in copy, required check-in options, and reminder consent text.

### Modify

- `index.html`
  - Public homepage positioning.
- `en/index.html`
  - English homepage mirror.
- `members/index.html`
  - Members landing: clarify filtering and practice field.
- `en/members/index.html`
  - English members mirror.
- `members/start/index.html`
  - Entry profile: two tracks and reminder consent.
- `en/members/start/index.html`
  - English entry mirror.
- `members/journey/day-1/index.html`
  - Day 1 micro-pass and avoidance acknowledgement.
- `members/journey/day-2/index.html`
  - Day 2 micro-pass and body/emotion prompt.
- `members/journey/day-7/index.html`
  - Day 7 review and human-support prompt.
- `en/members/journey/day-1/index.html`
  - English mirror.
- `en/members/journey/day-2/index.html`
  - English mirror.
- `en/members/journey/day-7/index.html`
  - English mirror.
- `members/practice/index.html`
  - Add "I am avoiding" as valid check-in path.
- `en/members/practice/index.html`
  - English mirror.
- `assets/members.js`
  - Store track, reminder intensity, pause state, avoidance state, and micro-pass progress.
- `functions/_lib/email.js`
  - Update journey/reminder tone once reminder templates exist in runtime.
- `docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md`
  - Add consent reminder variants and pause language.
- `docs/DEV_TEAM_RELEASE_DISCIPLINE.md`
  - Add practice-field copy and anti-coercion review gate.

### Do Not Touch In This Plan

- `functions/_lib/payments.js`
- `functions/api/payments/*`
- `scripts/provision-payment-live-secrets.sh`
- `scripts/payment-rails-independent-gate.sh`
- `scripts/team2-live-gate.sh`

Reason: Team Pay/Team 2 owns payment rails until strict proof is complete.

---

## Task 1: Add Canonical Practice Field Memo

**Files:**
- Create: `docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md`

- [ ] **Step 1: Create the memo with locked positioning**

Use this content:

```markdown
# NGUYENLANANH.COM PRACTICE FIELD POSITIONING MEMO

Date: 2026-05-03
Status: Canonical after payment-rails phase; applies to product, content, email, legal, marketing, and dev.

## 1. What This Website Is

Nguyenlananh.com is a practice field for people who are ready to see their avoidance, meet the emotional root underneath it, and take one small real action with rhythm and human companionship.

It is not a self-help blog, not a habit tracker, not a mass-market course, and not a promise of automatic transformation.

Vietnamese positioning:
`Một trường thực hành cho người sẵn sàng đi vào gốc rễ, nhận ra điểm né, và làm một bước thật với nhịp nhẹ, sự thật và người thật đi cùng.`

English positioning:
`A practice field for people ready to face the root, notice avoidance, and take one real step with gentle rhythm, truth, and human companionship.`

## 2. Who It Filters In

- People who sense that reading more is no longer enough.
- People who are willing to name avoidance without shame.
- People who can start with a small real action instead of a dramatic life change.
- People who value quiet practice over public performance.
- People open to being accompanied by a real person or a small circle.

## 3. Who It Does Not Try To Convert

- People looking for instant motivation.
- People who want another layer of intellectual content.
- People who only want a habit streak without emotional honesty.
- People who want a noisy public community.
- People who reject all forms of inner facing.

## 4. Product Shape

The site has two layers:

1. Fixed core:
   - Quan sát / Observe
   - Cảm nhận / Feel
   - Hành động / Act
   - Chuyển hóa / Transform

2. Flexible application:
   - real cases
   - small circles
   - mentor/creator formulas
   - human reflection after key check-ins

## 5. Two Entry Tracks

Track A: Nhịp nhẹ / Gentle Rhythm
- For people who easily avoid, resist reminders, or feel pressure quickly.
- Practices are 5-10 minutes.
- Success includes honestly saying "I am avoiding".

Track B: Đối diện sâu / Deep Facing
- For people ready to meet ego, emotional root, and recurring loops.
- Practices are sharper, still small, and never coercive.
- Human review is recommended after key moments.

## 6. Reminder Ethics

Email reminders must be chosen by the member:

- Level 0: No reminders.
- Level 1: Gentle daily reminder.
- Level 2: Rhythm reminder with one 5-minute step.

Every reminder must include a pause option:
`Tạm dừng nhắc 7 ngày / Pause reminders for 7 days`

No reminder may use guilt, pressure, spiritual superiority, or fear of losing progress.

## 7. Check-In Ethics

Check-in must allow these valid states:

- I did the practice.
- I did one smaller step.
- I am avoiding.
- I need a human reflection.

Avoidance is not failure. Avoidance is data.

## 8. Pilot Before Scale

Before adding large community features, run a 14-day pilot with 10-20 people.

Primary KPI:
- Day 7 return rate
- Day 14 completion rate
- percentage of members who can name their avoidance point
- number of check-ins requesting human reflection
- number of people who continue voluntarily after the pilot

Traffic and conversion are secondary during pilot.

## 9. Public Promise

The public promise:
`Không thêm một lớp kiến thức để né cảm xúc. Chỉ một bước thật để nhìn rõ hơn và sống thật hơn.`

English:
`Not another layer of knowledge to avoid feeling. One real step toward seeing clearly and living honestly.`

## 10. Legal/Ethical Guardrail

This system is educational and reflective. It does not replace medical, psychological, legal, financial, or crisis support.
```

- [ ] **Step 2: Verify no prohibited promise**

Run:

```bash
rg -n "tự động chuyển hóa|lột xác|instant change|automatic transformation|habit hack" docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md
git commit -m "docs(product): lock practice field positioning"
```

---

## Task 2: Update Public Positioning Copy

**Files:**
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `members/index.html`
- Modify: `en/members/index.html`

- [ ] **Step 1: Change homepage hero promise**

Replace the current homepage promise with:

VI:

```text
Một trường thực hành cho người sẵn sàng đi vào gốc rễ, nhận ra điểm né, và làm một bước thật với nhịp nhẹ, sự thật và người thật đi cùng.
```

EN:

```text
A practice field for people ready to face the root, notice avoidance, and take one real step with gentle rhythm, truth, and human companionship.
```

- [ ] **Step 2: Add public "not for everyone" block**

Add a restrained section near the membership CTA, not in the hero:

VI heading:

```text
Không dành cho tất cả mọi người
```

VI body:

```text
Hệ này không cố thuyết phục người chưa sẵn sàng. Nếu bạn chỉ muốn đọc thêm cho hay, hãy ở lại với các bài viết mở. Nếu bạn đã thấy mình né phần Cảm và muốn làm một bước thật, hãy bắt đầu bằng nhịp nhẹ.
```

EN heading:

```text
Not For Everyone
```

EN body:

```text
This system does not try to convince people who are not ready. If you only want to read, stay with the open writings. If you can see how you avoid feeling and want one real step, begin with the gentle rhythm.
```

- [ ] **Step 3: Update members landing product definition**

On `members/index.html`, make the first viewport explain:

```text
Thành viên không phải là kho bài đọc sâu hơn. Đây là lộ trình thực hành: chọn nhịp, làm một bước nhỏ, check-in cả khi đang né, và nhận phản hồi người thật ở những mốc cần thiết.
```

On `en/members/index.html`:

```text
Membership is not a deeper reading library. It is a guided practice path: choose a rhythm, take one small step, check in even when you are avoiding, and receive human reflection at the moments that matter.
```

- [ ] **Step 4: Run gates**

Run:

```bash
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
node scripts/local-public-site-audit.mjs
```

Expected:

```text
Content audit: No issues found
Bilingual validation status: pass
Local public audit: totalIssues 0
```

- [ ] **Step 5: Commit**

```bash
git add index.html en/index.html members/index.html en/members/index.html docs/reports/LOCAL_PUBLIC_SITE_AUDIT.json docs/reports/LOCAL_PUBLIC_SITE_AUDIT.md
git commit -m "fix(positioning): clarify practice field and readiness filter"
```

---

## Task 3: Add Two Entry Tracks To Member Start

**Files:**
- Modify: `members/start/index.html`
- Modify: `en/members/start/index.html`
- Modify: `assets/members.js`

- [ ] **Step 1: Add track choices to the start form**

In both `members/start/index.html` and `en/members/start/index.html`, add a required segmented/radio control with values:

```html
<fieldset class="memberField" data-practice-track>
  <legend>Chọn nhịp bắt đầu</legend>
  <label><input type="radio" name="practiceTrack" value="gentle" required> Nhịp nhẹ</label>
  <label><input type="radio" name="practiceTrack" value="deep"> Đối diện sâu</label>
</fieldset>
```

English:

```html
<fieldset class="memberField" data-practice-track>
  <legend>Choose your starting rhythm</legend>
  <label><input type="radio" name="practiceTrack" value="gentle" required> Gentle rhythm</label>
  <label><input type="radio" name="practiceTrack" value="deep"> Deep facing</label>
</fieldset>
```

- [ ] **Step 2: Add reminder intensity choices**

Add this under the track control:

VI:

```html
<fieldset class="memberField" data-reminder-intensity>
  <legend>Bạn muốn được nhắc như thế nào?</legend>
  <label><input type="radio" name="reminderIntensity" value="none" required> Không nhắc</label>
  <label><input type="radio" name="reminderIntensity" value="gentle"> Nhắc nhẹ</label>
  <label><input type="radio" name="reminderIntensity" value="rhythm"> Nhắc kèm một bước 5 phút</label>
</fieldset>
```

EN:

```html
<fieldset class="memberField" data-reminder-intensity>
  <legend>How would you like reminders to work?</legend>
  <label><input type="radio" name="reminderIntensity" value="none" required> No reminders</label>
  <label><input type="radio" name="reminderIntensity" value="gentle"> Gentle reminder</label>
  <label><input type="radio" name="reminderIntensity" value="rhythm"> Reminder with one 5-minute step</label>
</fieldset>
```

- [ ] **Step 3: Extend profile schema in `assets/members.js`**

In `saveProfileForEmail`, add:

```js
practiceTrack: String(profile.practiceTrack || "").trim(),
reminderIntensity: String(profile.reminderIntensity || "").trim(),
reminderPausedUntil: String(profile.reminderPausedUntil || "").trim(),
humanReflectionOptIn: Boolean(profile.humanReflectionOptIn),
```

In `profileIsComplete`, require:

```js
["fullName", "currentState", "desiredShift", "companionRhythm", "practiceTrack", "reminderIntensity"]
```

- [ ] **Step 4: Wire form read/write**

Where the start/profile form is serialized, include:

```js
practiceTrack: formData.get("practiceTrack"),
reminderIntensity: formData.get("reminderIntensity"),
humanReflectionOptIn: formData.get("humanReflectionOptIn") === "on"
```

When rendering a saved profile, set the matching radio buttons by value.

- [ ] **Step 5: Run JS syntax and gates**

Run:

```bash
node --check assets/members.js
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
```

Expected:

```text
assets/members.js syntax OK
Content audit: No issues found
Bilingual validation status: pass
```

- [ ] **Step 6: Commit**

```bash
git add members/start/index.html en/members/start/index.html assets/members.js
git commit -m "feat(members): add gentle and deep practice tracks"
```

---

## Task 4: Make Avoidance A Valid Check-In State

**Files:**
- Modify: `members/practice/index.html`
- Modify: `en/members/practice/index.html`
- Modify: `members/journey/day-1/index.html`
- Modify: `members/journey/day-2/index.html`
- Modify: `members/journey/day-7/index.html`
- Modify: `en/members/journey/day-1/index.html`
- Modify: `en/members/journey/day-2/index.html`
- Modify: `en/members/journey/day-7/index.html`
- Modify: `assets/members.js`

- [ ] **Step 1: Add check-in state options**

Use these exact values in the practice/check-in form:

```html
<label><input type="radio" name="practiceState" value="done" required> Tôi đã làm bài thực hành</label>
<label><input type="radio" name="practiceState" value="smaller_step"> Tôi đã làm một bước nhỏ hơn</label>
<label><input type="radio" name="practiceState" value="avoiding"> Tôi đang né</label>
<label><input type="radio" name="practiceState" value="human_reflection"> Tôi cần người thật phản hồi</label>
```

EN:

```html
<label><input type="radio" name="practiceState" value="done" required> I did the practice</label>
<label><input type="radio" name="practiceState" value="smaller_step"> I did one smaller step</label>
<label><input type="radio" name="practiceState" value="avoiding"> I am avoiding</label>
<label><input type="radio" name="practiceState" value="human_reflection"> I need human reflection</label>
```

- [ ] **Step 2: Add micro-pass prompt to day pages**

Day 1 VI:

```text
Micro-pass hôm nay: viết một dòng thật. Nếu bạn đang né, chỉ cần viết: "Tôi đang né điều gì?"
```

Day 1 EN:

```text
Today's micro-pass: write one honest line. If you are avoiding, write: "What am I avoiding?"
```

Day 2 VI:

```text
Micro-pass hôm nay: làm một việc 5-10 phút với thân thể hoặc không gian sống. Không cần hoàn hảo.
```

Day 2 EN:

```text
Today's micro-pass: do one 5-10 minute action with your body or living space. It does not need to be perfect.
```

Day 7 VI:

```text
Micro-pass hôm nay: nhìn lại một điểm né lặp lại trong 7 ngày. Nếu cần, đánh dấu "tôi cần người thật phản hồi".
```

Day 7 EN:

```text
Today's micro-pass: review one avoidance point that repeated this week. If needed, choose "I need human reflection."
```

- [ ] **Step 3: Store check-in entries with avoidance data**

In `assets/members.js`, store each entry as:

```js
{
  date: todayKey(),
  practiceState,
  track: profile?.practiceTrack || "gentle",
  oneLine: String(formData.get("oneLine") || "").trim(),
  minutes: Number(formData.get("minutes") || 0),
  needsHumanReflection: practiceState === "human_reflection",
  createdAt: new Date().toISOString()
}
```

- [ ] **Step 4: Adjust pass/unlock logic**

Treat these states as progress:

```js
const PASS_STATES = new Set(["done", "smaller_step", "avoiding", "human_reflection"]);
```

Do not count `avoiding` as failure. Show:

VI:

```text
Bạn đã nhìn thấy điểm né. Hôm nay như vậy là đủ để giữ nhịp.
```

EN:

```text
You noticed the avoidance point. That is enough to keep the rhythm today.
```

- [ ] **Step 5: Run gates**

```bash
node --check assets/members.js
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
node scripts/local-public-site-audit.mjs
```

Expected: all pass, `local-public-site-audit` reports `totalIssues: 0`.

- [ ] **Step 6: Commit**

```bash
git add assets/members.js members/practice/index.html en/members/practice/index.html members/journey/day-1/index.html members/journey/day-2/index.html members/journey/day-7/index.html en/members/journey/day-1/index.html en/members/journey/day-2/index.html en/members/journey/day-7/index.html docs/reports/LOCAL_PUBLIC_SITE_AUDIT.json docs/reports/LOCAL_PUBLIC_SITE_AUDIT.md
git commit -m "feat(practice): make avoidance a valid check-in state"
```

---

## Task 5: Update Reminder Ethics And Email Tone

**Files:**
- Modify: `docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md`
- Modify: `functions/_lib/email.js`

- [ ] **Step 1: Add reminder consent section to docs**

Append this section after the Language Policy in `docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md`:

```markdown
## Reminder Consent Policy

Members choose reminder intensity:

- `none`: no reminder emails.
- `gentle`: one gentle reminder.
- `rhythm`: reminder with one 5-minute practice step.

Every reminder includes:
- no guilt
- no pressure
- one small action
- a 7-day pause option
- support contact

Avoidance language:
VI: `Nếu bạn đang né, chỉ cần gọi tên điểm né. Như vậy cũng là một bước thật.`
EN: `If you are avoiding, simply name the avoidance point. That is also one real step.`
```

- [ ] **Step 2: Add runtime reminder copy helper**

In `functions/_lib/email.js`, add a helper near `renderTemplate`:

```js
function reminderTone(locale, intensity, payload = {}) {
  const isEnglish = locale === "en-US";
  const dashboardUrl = payload.dashboard_url || payload.next_step_url || "";
  if (String(intensity || "gentle") === "rhythm") {
    return isEnglish
      ? `One small step for today: take 5 minutes, notice what you are avoiding, and write one honest line.\n\nOpen your dashboard: ${dashboardUrl}\n\nPause reminders for 7 days: ${payload.pause_url || ""}`
      : `Một bước nhỏ hôm nay: dành 5 phút, nhìn xem bạn đang né điều gì, rồi viết một dòng thật.\n\nVào dashboard: ${dashboardUrl}\n\nTạm dừng nhắc 7 ngày: ${payload.pause_url || ""}`;
  }
  return isEnglish
    ? `A gentle reminder: you do not need to force progress today. If you are avoiding, naming it is already one real step.\n\nOpen your dashboard: ${dashboardUrl}\n\nPause reminders for 7 days: ${payload.pause_url || ""}`
    : `Một lời nhắc nhẹ: hôm nay bạn không cần ép mình tiến bộ. Nếu đang né, gọi tên điểm né đã là một bước thật.\n\nVào dashboard: ${dashboardUrl}\n\nTạm dừng nhắc 7 ngày: ${payload.pause_url || ""}`;
}
```

- [ ] **Step 3: Connect helper only where reminder template exists**

If `TEMPLATE_IDS` already contains a reminder template, route it through `reminderTone`. If no runtime reminder template exists, keep the helper unused and document it with a one-line comment:

```js
// Used by the reminder template when scheduled retention emails are enabled.
```

- [ ] **Step 4: Run syntax**

```bash
node --check functions/_lib/email.js
node scripts/content-audit.mjs --fail
```

Expected: syntax OK and content audit pass.

- [ ] **Step 5: Commit**

```bash
git add docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md functions/_lib/email.js
git commit -m "fix(email): align reminders with consent and avoidance tone"
```

---

## Task 6: Specify The 14-Day Human Pilot

**Files:**
- Create: `docs/PRACTICE_FIELD_PILOT_14_DAY_SPEC.md`

- [ ] **Step 1: Create pilot spec**

Use this content:

```markdown
# PRACTICE FIELD 14-DAY PILOT SPEC

Date: 2026-05-03
Owner: Product + Content + Ops
Tech owner: Team Dev after payment proof

## Goal

Run a quiet 14-day pilot for 10-20 people to test whether small practices, avoidance-aware check-ins, and human reflection improve retention without coercive reminders.

## Participants

Two entry groups:

1. Gentle Rhythm
   - people who avoid, resist reminders, or abandon structured practices quickly

2. Deep Facing
   - people who are ready to meet emotional roots and ego reactions directly

## Daily Structure

Every day:
- one insight
- one 5-10 minute practice
- one check-in state
- one honest line

Valid check-in states:
- did the practice
- did one smaller step
- avoiding
- needs human reflection

## Human Touchpoints

- Day 1: welcome and track confirmation
- Day 3: detect early avoidance
- Day 7: short review
- Day 14: closing reflection and next-step recommendation

## KPI

Primary:
- Day 7 return rate
- Day 14 completion rate
- avoidance naming rate
- human reflection requests
- voluntary continuation rate

Secondary:
- payment conversion
- email open rate
- checkout completion

## Success Threshold For Next Phase

Move to community/circle build only if:
- at least 50% return on Day 7
- at least 30% complete Day 14
- at least 40% can name one avoidance point
- at least 5 real reflection requests are handled by a human

## What Not To Build During Pilot

- public feed
- likes
- gamified leaderboard
- AI-only emotional advice
- more than two tracks
- certification
```

- [ ] **Step 2: Commit**

```bash
git add docs/PRACTICE_FIELD_PILOT_14_DAY_SPEC.md
git commit -m "docs(pilot): define 14-day practice field validation"
```

---

## Task 7: Add Practice Field Regression Audit

**Files:**
- Create: `scripts/practice-field-readiness-audit.mjs`
- Modify: `docs/DEV_TEAM_RELEASE_DISCIPLINE.md`

- [ ] **Step 1: Add audit script**

Create `scripts/practice-field-readiness-audit.mjs`:

```js
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const files = [
  "index.html",
  "en/index.html",
  "members/index.html",
  "en/members/index.html",
  "members/start/index.html",
  "en/members/start/index.html",
  "members/practice/index.html",
  "en/members/practice/index.html",
  "assets/members.js",
  "docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md"
];

const required = [
  { file: "index.html", patterns: ["trường thực hành", "một bước thật"] },
  { file: "en/index.html", patterns: ["practice field", "one real step"] },
  { file: "members/index.html", patterns: ["không phải là kho bài đọc", "đang né"] },
  { file: "en/members/index.html", patterns: ["not a deeper reading library", "avoiding"] },
  { file: "members/start/index.html", patterns: ["practiceTrack", "reminderIntensity"] },
  { file: "en/members/start/index.html", patterns: ["practiceTrack", "reminderIntensity"] },
  { file: "members/practice/index.html", patterns: ["value=\"avoiding\"", "human_reflection"] },
  { file: "en/members/practice/index.html", patterns: ["value=\"avoiding\"", "human_reflection"] },
  { file: "assets/members.js", patterns: ["practiceTrack", "reminderIntensity", "human_reflection", "avoiding"] },
  { file: "docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md", patterns: ["Reminder Ethics", "Avoidance is not failure"] }
];

const banned = [
  "automatic transformation",
  "instant change",
  "habit hack",
  "tự động chuyển hóa",
  "lột xác tức thì",
  "ai cũng dùng được"
];

const issues = [];

for (const file of files) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    issues.push({ type: "missing_file", file });
  }
}

for (const item of required) {
  const full = path.join(ROOT, item.file);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  for (const pattern of item.patterns) {
    if (!text.includes(pattern)) {
      issues.push({ type: "missing_pattern", file: item.file, pattern });
    }
  }
}

for (const file of files.filter((file) => fs.existsSync(path.join(ROOT, file)))) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf8").toLowerCase();
  for (const pattern of banned) {
    if (text.includes(pattern.toLowerCase())) {
      issues.push({ type: "banned_claim", file, pattern });
    }
  }
}

if (issues.length) {
  console.log(JSON.stringify({ ok: false, issues }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, filesChecked: files.length, issues: 0 }, null, 2));
```

- [ ] **Step 2: Run audit before wiring into release discipline**

```bash
node scripts/practice-field-readiness-audit.mjs
```

Expected after Tasks 1-4 are complete:

```json
{
  "ok": true,
  "filesChecked": 10,
  "issues": 0
}
```

- [ ] **Step 3: Add gate to release discipline**

Append to `docs/DEV_TEAM_RELEASE_DISCIPLINE.md`:

```markdown
## 18. Practice Field Positioning Gate

After payment rails are stable, any change to homepage, members, journey, practice, or email reminders must pass:

```bash
node scripts/practice-field-readiness-audit.mjs
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
node scripts/local-public-site-audit.mjs
```

The gate blocks:
- coercive reminder language
- missing "I am avoiding" check-in state
- public claims of automatic transformation
- members positioning as only a reading library
```
```

- [ ] **Step 4: Commit**

```bash
git add scripts/practice-field-readiness-audit.mjs docs/DEV_TEAM_RELEASE_DISCIPLINE.md
git commit -m "chore(gates): add practice field readiness audit"
```

---

## Task 8: Final Verification And Deploy Discipline

**Files:**
- No source changes.

- [ ] **Step 1: Confirm payment work is not mixed**

Run:

```bash
git status --short
```

Expected: no modified payment files unless the active task explicitly touched payment.

Payment files that must not be accidentally staged by this plan:

```text
functions/_lib/payments.js
functions/api/payments/rails.js
scripts/provision-payment-live-secrets.sh
scripts/payment-rails-independent-gate.sh
scripts/team2-live-gate.sh
```

- [ ] **Step 2: Run full public gates**

```bash
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
node scripts/local-public-site-audit.mjs
node scripts/practice-field-readiness-audit.mjs
```

Expected:

```text
Content audit: No issues found
Bilingual validation status: pass
Local public audit: totalIssues 0
practice-field-readiness-audit: ok true
```

- [ ] **Step 3: Run runtime build**

```bash
wrangler pages functions build --outfile /tmp/nla-functions-worker-practice-field.js
```

Expected:

```text
Compiled Worker successfully
```

- [ ] **Step 4: Deploy only after payment owner confirms safe window**

Run only after Team Pay confirms no secret entry or proof run is in progress:

```bash
bash scripts/deploy_cloudflare.sh
```

- [ ] **Step 5: Smoke production**

```bash
curl -I https://www.nguyenlananh.com/
curl -I https://www.nguyenlananh.com/members/
curl -I https://www.nguyenlananh.com/members/start/
curl -sS https://www.nguyenlananh.com/api/payments/rails
```

Expected:

```text
homepage 200
members 200
members/start 200
payments/rails ok true
```

- [ ] **Step 6: Commit verification report if generated**

If `local-public-site-audit` updates the tracked report files, include them in the same commit that changed public pages:

```bash
git add docs/reports/LOCAL_PUBLIC_SITE_AUDIT.json docs/reports/LOCAL_PUBLIC_SITE_AUDIT.md
git commit -m "docs(qa): refresh practice field public audit"
```

If only timestamps changed and no public source changed, revert those report files:

```bash
git checkout -- docs/reports/LOCAL_PUBLIC_SITE_AUDIT.json docs/reports/LOCAL_PUBLIC_SITE_AUDIT.md
```

---

## Implementation Order

Use this order to avoid breaking payment work:

1. Task 1: memo only.
2. Task 6: pilot spec only.
3. Task 2: public copy.
4. Task 3: member entry fields.
5. Task 4: check-in state.
6. Task 5: reminder tone docs/runtime helper.
7. Task 7: regression audit.
8. Task 8: final verification and deploy.

Do not begin Tasks 3-5 while Team Pay is setting secrets or running payment proof unless the team explicitly creates a clean branch/worktree.

---

## Acceptance Criteria

This plan is complete when:

- `docs/NGUYENLANANH_PRACTICE_FIELD_POSITIONING_MEMO.md` exists and is canonical.
- Homepage and members landing no longer position the product as a content/course library.
- Member start has two tracks: `gentle` and `deep`.
- Reminder consent has three states: `none`, `gentle`, `rhythm`.
- Check-in accepts `avoiding` and `human_reflection` as valid progress states.
- Email reminder language is non-coercive and contains a pause path.
- A 14-day pilot spec exists with measurable non-traffic KPIs.
- `practice-field-readiness-audit` passes.
- Existing public gates still pass:
  - `content-audit --fail`
  - `validate-bilingual-release`
  - `local-public-site-audit`
- Payment rails still pass with current phase setting:
  - `BASE_URL=https://www.nguyenlananh.com ENFORCE_COMMERCE_LIVE=0 REQUIRE_STRIPE=0 bash scripts/team2-live-gate.sh`

---

## Self-Review

### Spec Coverage

- Psychology and avoidance: covered by Tasks 1, 3, 4, 5.
- Gentle rhythm vs deep facing: covered by Task 3.
- Human interaction and quiet circles: covered by Task 6.
- Public positioning as filter, not mass market: covered by Tasks 1 and 2.
- Avoiding coercive reminders: covered by Task 5.
- Team execution and gates: covered by Tasks 7 and 8.
- Payment plan continuity: locked in Non-Negotiables, File Map, and Task 8.

### Placeholder Scan

The plan has no unresolved placeholder markers and no undefined target file paths.

### Type Consistency

The plan uses these stable values across tasks:

- `practiceTrack`: `gentle`, `deep`
- `reminderIntensity`: `none`, `gentle`, `rhythm`
- `practiceState`: `done`, `smaller_step`, `avoiding`, `human_reflection`

These values must not be renamed without updating the audit script and all VI/EN forms.

---

## Execution Addendum 2026-05-03B

The founder-approved psychology-behavior update narrows the immediate release
scope:

1. Keep homepage and public marketing copy unchanged in this pass.
2. Implement the first product layer inside member runtime only.
3. Keep all payment files untouched.
4. Add the consolidated plan at
   `docs/NGUYENLANANH_WEBSITE_PRODUCT_PLAN_2026-05-03.md`.
5. Add `scripts/practice-field-readiness-audit.mjs` as the product gate.

This pass is accepted when these commands pass:

```bash
node scripts/practice-field-readiness-audit.mjs --fail
node scripts/content-audit.mjs --fail
node scripts/validate-bilingual-release.mjs
node scripts/local-public-site-audit.mjs
bash scripts/deploy_cloudflare.sh
```

Current implementation files:

- `members/start/index.html`
- `en/members/start/index.html`
- `members/practice/index.html`
- `members/pilot/index.html`
- `members/circle/index.html`
- `en/members/practice/index.html`
- `en/members/pilot/index.html`
- `en/members/circle/index.html`
- `members/journey/day-1/index.html`
- `members/journey/day-2/index.html`
- `members/journey/day-7/index.html`
- `en/members/journey/day-1/index.html`
- `en/members/journey/day-2/index.html`
- `en/members/journey/day-7/index.html`
- `assets/members.js`
- `docs/DEV_TEAM_RELEASE_DISCIPLINE.md`
