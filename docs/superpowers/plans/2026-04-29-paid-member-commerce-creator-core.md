# Paid Member Commerce Creator Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Step 2-3 foundation after the public pillar series: paid member content, deep/pro programs, package commerce, creator/collaborator workflow, admin/CMS operations, and final homepage refresh readiness.

**Architecture:** Keep public content static and indexable, keep member/pro/creator content gated, and make programs/product access explicit through data manifests before touching the homepage. Use docs canon first, then static/data builders, then runtime entitlement checks.

**Tech Stack:** Static HTML, Cloudflare Pages Functions, Cloudflare D1, existing `functions/_lib/*` payment/auth utilities, `assets/members.js`, docs-driven content manifests.

---

## File Structure

- Create: `docs/NGUYENLANANH_STEP_2_3_PAID_MEMBER_COMMERCE_CREATOR_MASTER_PLAN_2026-04-29.md`  
  Owns product/content strategy and pillar-to-paid mapping.
- Create: `admin/content/member-programs-collection.json`  
  Data manifest for programs, modules, lessons, worksheets, offers, entitlements.
- Create: `docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md`  
  Canon source for Core, Deep, Pro and creator curriculum outlines.
- Create: `scripts/build-member-programs.mjs`  
  Builds member/pro program HTML/data from canon docs.
- Modify: `members/deep/index.html` and `en/members/deep/index.html`  
  Align deep route cards to 10-pillar paid map and 12-track deep layer.
- Modify: `members/pro/index.html` and `en/members/pro/index.html`  
  Add Family and Children tracks or mark as planned with disabled cards.
- Modify: `members/creator/*` and `en/members/creator/*`  
  Add collaborator curriculum, submission packet checklist, review rubric.
- Modify: `functions/_lib/constants.js`  
  Add package metadata only after content/offer map is locked.
- Modify: `database/payment_gateway_d1.sql`  
  Add program/offers/entitlements/creator/audit tables after data manifest is reviewed.
- Homepage phase gated: `index.html`, `en/index.html`, `admin/site-config.json`  
  Modify only after all previous tasks pass and `docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md` is complete.

---

### Task 1: Lock Content + Product Manifest

**Files:**
- Create: `admin/content/member-programs-collection.json`
- Read: `docs/NGUYENLANANH_STEP_2_3_PAID_MEMBER_COMMERCE_CREATOR_MASTER_PLAN_2026-04-29.md`

- [x] **Step 1: Create manifest with the exact product layers**

```json
{
  "collection": "member_programs",
  "generated_at": "2026-04-29T00:00:00+07:00",
  "layers": [
    {
      "code": "free",
      "label": "Free Member",
      "routes": ["/members/start/", "/members/dashboard/"],
      "purpose": "orientation, profile, chooser"
    },
    {
      "code": "year1",
      "label": "Core Access",
      "routes": ["/members/journey/", "/members/practice/", "/members/experience/"],
      "purpose": "7-day foundation, 30-day practice, 10 pillar companion lessons"
    },
    {
      "code": "year2",
      "label": "Deep Continuity",
      "routes": ["/members/deep/"],
      "purpose": "90-day deep layer and all pillar-mapped deep tracks"
    },
    {
      "code": "year3",
      "label": "Mastery / Pro",
      "routes": ["/members/pro/", "/members/creator/"],
      "purpose": "pro tracks and creator eligibility after review"
    }
  ]
}
```

- [x] **Step 2: Validate JSON**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('admin/content/member-programs-collection.json','utf8')); console.log('member programs manifest ok')"
```

Expected: `member programs manifest ok`

- [ ] **Step 3: Commit**

```bash
git add admin/content/member-programs-collection.json
git commit -m "Add member program product manifest"
```

### Task 2: Create Paid Content Canon

**Files:**
- Create: `docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md`

- [x] **Step 1: Add canon outline**

Write sections:

```markdown
# Member Programs Content Canon — 2026-04-29

## Core Access

### 10 Pillar Companion Lessons

1. Bốn Trục: 4-Axis Life Audit
2. Cái Chổi: Manual Work Practice
3. Vòng Lặp: Loop Map
4. Im Lặng: Silence Log
5. Hệ Gia Đình: Family Role Map
6. Cô Đơn: Self-Connection Audit
7. Môi Trường: Environment Audit
8. Trẻ Em: Child Environment Map
9. Lao Động Sáng Tạo: Creative Labor Log
10. Đầu Tư Bản Thân: Right Investment Filter

## Deep Continuity

Use the 12-track deep layer from the master plan.

## Pro Tracks

Reset Life, Inner, Discipline, Environment, Creation, Wealth, Family, Children.

## Creator Curriculum

Use Creator 01-10 from the master plan.
```

- [x] **Step 2: Check no unresolved markers**

Run:

```bash
rg -n "TBD|TODO|fill in|FIXME|placeholder" docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md
git commit -m "Add member program content canon"
```

### Task 3: Build Deep/Pro Program Pages From Manifest

**Files:**
- Create: `scripts/build-member-programs.mjs`
- Modify: `members/deep/index.html`
- Modify: `en/members/deep/index.html`
- Modify: `members/pro/index.html`
- Modify: `en/members/pro/index.html`

- [ ] **Step 1: Create builder skeleton**

```js
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "admin/content/member-programs-collection.json");

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
}

function main() {
  const manifest = readManifest();
  if (!Array.isArray(manifest.layers) || manifest.layers.length < 4) {
    throw new Error("member_programs manifest is missing required layers");
  }
  console.log(`Loaded ${manifest.layers.length} member program layers.`);
}

main();
```

- [ ] **Step 2: Run builder**

```bash
node scripts/build-member-programs.mjs
```

Expected: `Loaded 4 member program layers.`

- [ ] **Step 3: Extend builder to render cards**

Render cards for:

- 12 Deep tracks
- 8 Pro tracks
- Creator curriculum entry point

Use existing `panel`, `grid2`, `pricingCard`, `actionsRow`, `cta`, `ghost` classes.

- [ ] **Step 4: Smoke generated pages**

```bash
rg -n "Family & Relationship|Children & Education|12-track|Creator curriculum" members/deep/index.html members/pro/index.html members/creator/index.html
```

Expected: matches for new content.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-member-programs.mjs members/deep/index.html en/members/deep/index.html members/pro/index.html en/members/pro/index.html
git commit -m "Build member deep and pro program structure"
```

### Task 4: Add Commerce Package + Entitlement Data

**Files:**
- Modify: `functions/_lib/constants.js`
- Modify: `database/payment_gateway_d1.sql`

- [ ] **Step 1: Add plan metadata without changing current prices**

```js
export const PLAN_ENTITLEMENTS = {
  year1: ["core_access"],
  year2: ["core_access", "deep_continuity"],
  year3: ["core_access", "deep_continuity", "pro_mastery", "creator_eligibility_review"]
};
```

- [ ] **Step 2: Add SQL tables**

```sql
CREATE TABLE IF NOT EXISTS program_entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  entitlement_code TEXT NOT NULL,
  route_pattern TEXT NOT NULL,
  source_order_id TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (source_order_id) REFERENCES payment_orders(internal_order_id)
);

CREATE INDEX IF NOT EXISTS idx_program_entitlements_user
  ON program_entitlements(user_id, active, expires_at);
```

- [ ] **Step 3: Run syntax check**

```bash
node -e "import('./functions/_lib/constants.js').then(m => console.log(Object.keys(m.PLANS).join(',')))"
```

Expected: `year1,year2,year3`

- [ ] **Step 4: Commit**

```bash
git add functions/_lib/constants.js database/payment_gateway_d1.sql
git commit -m "Add program entitlement metadata"
```

### Task 5: Creator/Collaborator Curriculum

**Files:**
- Modify: `members/creator/guidelines/index.html`
- Modify: `members/creator/submit/index.html`
- Modify: `members/creator/library/index.html`
- Modify: `members/creator/revenue-share/index.html`
- Mirror EN equivalents.

- [ ] **Step 1: Add curriculum to guidelines**

Include these 10 modules:

```text
Creator 01 - Voice lock của NguyenLanAnh
Creator 02 - Viết không giảng, không chữa, không hứa
Creator 03 - Biến một public pillar thành paid practice
Creator 04 - Case thật: dùng được mà không xâm phạm riêng tư
Creator 05 - Internal links và route ổn định
Creator 06 - SEO/meta mà không phá giọng
Creator 07 - EN meaning adaptation
Creator 08 - Worksheet và 7-day practice
Creator 09 - Submission packet chuẩn
Creator 10 - Review, revision, approval, revenue ops
```

- [ ] **Step 2: Add submission packet checklist**

Require:

```text
title, intended route, pillar/program mapped, VI draft, EN draft or brief,
practice block, reflection prompts, caution note, stable internal links,
image brief, ownership note
```

- [ ] **Step 3: Add review rubric**

Reject terms:

```text
hype, breakthrough, life-change illusion, public commission, private case exposure
```

- [ ] **Step 4: Commit**

```bash
git add members/creator en/members/creator
git commit -m "Add creator collaborator curriculum"
```

### Task 6: Admin/CMS Operations

**Files:**
- Modify: `admin/content/index.html`
- Modify: `admin/members/index.html`
- Modify: `admin/creators/index.html`
- Modify: `admin/settings/index.html`

- [ ] **Step 1: Add content inventory labels**

Admin content must show:

```text
Public Pillars
Core Member Lessons
Deep Tracks
Pro Tracks
Creator Curriculum
Worksheets
Offers
```

- [ ] **Step 2: Add status workflow copy**

Statuses:

```text
draft -> in_review -> approved -> published -> archived
```

- [ ] **Step 3: Add release checklist**

Checklist:

```text
VI/EN copy checked
Stable links only
No blocked tone terms
Entitlement mapped
Route smoke passed
Report updated
```

- [ ] **Step 4: Commit**

```bash
git add admin/content/index.html admin/members/index.html admin/creators/index.html admin/settings/index.html
git commit -m "Add admin content operations structure"
```

### Task 7: Homepage Refresh Gate

**Files:**
- Do not modify homepage yet.
- Create: `docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md`

- [x] **Step 1: Create gate checklist**

```markdown
# Homepage Refresh Gate After Step 2-3

Homepage update is allowed only after:

- 10 public pillars live
- member program manifest locked
- paid content canon locked
- deep/pro pages reflect final tracks
- creator curriculum exists
- entitlement map exists
- admin operation checklist exists
- production route smoke passes
```

- [ ] **Step 2: Commit**

```bash
git add docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md
git commit -m "Add homepage refresh gate"
```

### Task 8: Final QA + Deploy

**Files:**
- No new source files unless QA report is needed.
- Create/Modify: `docs/reports/TEAM_2_STEP_2_3_CONTENT_COMMERCE_REPORT_2026-04-29.md`

- [ ] **Step 1: Run local checks**

```bash
node -e "JSON.parse(require('fs').readFileSync('admin/content/member-programs-collection.json','utf8')); console.log('manifest ok')"
rg -n "TBD|TODO|undefined|breakthrough|life-change illusion" docs admin/content members en/members
```

Expected:

- `manifest ok`
- no unexpected matches except intentional rubric terms in creator guidelines/report docs

- [ ] **Step 2: Build release dist**

```bash
node scripts/prepare_release_dist.mjs
```

Expected: prints `/tmp` or `/var/folders/.../nla-release-dist.*`

- [ ] **Step 3: Deploy**

```bash
CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e wrangler pages deploy <release-dist> --project-name nguyenlananh-com --branch main --commit-dirty=true
```

Expected: deployment URL printed.

- [ ] **Step 4: Smoke routes**

```bash
curl -I https://nguyenlananh.com/members/deep/
curl -I https://nguyenlananh.com/members/pro/
curl -I https://nguyenlananh.com/members/creator/
```

Expected: HTTP 200.

- [ ] **Step 5: Update report and commit**

```bash
git add docs/reports/TEAM_2_STEP_2_3_CONTENT_COMMERCE_REPORT_2026-04-29.md
git commit -m "Report step 2-3 content commerce completion"
```
