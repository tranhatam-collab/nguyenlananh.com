# Team 2 Step 2-3 Content / Commerce / Creator Report — 2026-04-29

## 2026-04-29 14:18:48 +0700

Scope: research and lock the Step 2-3 structure after the 10 public pillar articles: paid member content, deep/pro programs, package commerce, creator/collaborator workflow, admin/CMS operations, and the homepage refresh gate.

What changed:

- Added Step 2-3 master plan:
  - `docs/NGUYENLANANH_STEP_2_3_PAID_MEMBER_COMMERCE_CREATOR_MASTER_PLAN_2026-04-29.md`
- Added paid member program canon:
  - `docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md`
- Added developer/admin data manifest:
  - `admin/content/member-programs-collection.json`
- Added homepage refresh gate:
  - `docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md`
- Added implementation plan for Team dev:
  - `docs/superpowers/plans/2026-04-29-paid-member-commerce-creator-core.md`

Research sources reviewed:

- Existing public pillar docs and generated article routes.
- Existing membership master docs.
- Existing deep/pro/creator member pages.
- Existing payment plan constants in `functions/_lib/constants.js`.
- Existing D1 payment/auth schema in `database/payment_gateway_d1.sql`.
- Existing admin/CMS docs and admin route skeleton.

Strategic structure locked:

- Access ladder:
  - Free Member
  - `year1` Core Access
  - `year2` Deep Continuity
  - `year3` Mastery / Pro
- Public-to-paid map:
  - 10 public pillars -> 10 core companion lesson chains.
  - 10 public pillars -> 12 deep practice tracks.
  - 10 public pillars -> 8 pro tracks.
- Pro gap closed at strategy level:
  - Existing 6 tracks remain: Reset Life, Inner, Discipline, Environment, Creation, Wealth.
  - Required new tracks added to plan/manifest: Family & Relationship Systems, Children & Education Environment.
- Creator/collaborator structure:
  - 8 collaborator roles.
  - 10 training modules.
  - submission packet.
  - review rubric.
- CMS/admin structure:
  - programs, modules, lessons, worksheets, offers, entitlements, creator submissions, audit logs.

Route discipline:

- Existing routes are marked `existing`.
- Routes not built yet are marked `planned` or `required_new_route`.
- Homepage files are explicitly blocked from modification until the gate passes:
  - `index.html`
  - `en/index.html`
  - `admin/site-config.json`

Validation:

- `admin/content/member-programs-collection.json` parsed successfully.
- Manifest counts:
  - layers: 4
  - pillar companion lessons: 10
  - deep tracks: 12
  - pro tracks: 8
  - creator curriculum modules: 10
- No unresolved marker matches in:
  - `docs/MEMBER_PROGRAMS_CONTENT_CANON_2026-04-29.md`
  - `docs/NGUYENLANANH_STEP_2_3_PAID_MEMBER_COMMERCE_CREATOR_MASTER_PLAN_2026-04-29.md`
  - `docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md`
  - `admin/content/member-programs-collection.json`

Runtime/live-gate coordination:

- No runtime script was deleted or rolled back.
- Preserved:
  - `scripts/payment-live-proof-smoke.sh`
  - `scripts/provision-payment-live-secrets.sh`
  - `scripts/deploy_cloudflare.sh`
- No Cloudflare Pages, D1, PayPal, magic link, or admin runtime setting was changed in this step.
- No deploy was run for this research/structure checkpoint.

Next dev execution:

1. Build `scripts/build-member-programs.mjs` from `admin/content/member-programs-collection.json`.
2. Render/update `/members/deep/`, `/members/pro/`, and creator member pages from the locked structure.
3. Add package entitlement metadata only after content/offer copy is reviewed.
4. Add admin release checklist and content inventory labels.
5. Run route smoke, update this report, then decide whether homepage refresh gate passes.

Homepage status:

- Homepage is not updated in this checkpoint.
- Homepage refresh remains blocked until the Step 2-3 implementation gate is complete.

## 2026-04-29 14:23:35 +0700

Post-write validation:

- Manifest reference check passed:
  - every pillar `deep_track` exists in `deep_tracks`
  - every pillar `pro_tracks` entry exists in `pro_tracks`
  - counts remain 10 pillars, 12 deep tracks, 8 pro tracks, 10 creator modules
- Focused unresolved marker scan returned no matches for the Step 2-3 canon, master plan, homepage gate, report, and manifest.
- Homepage gate scan confirmed the homepage remains blocked through:
  - `docs/HOMEPAGE_REFRESH_GATE_AFTER_STEP_2_3.md`
  - `admin/content/member-programs-collection.json`
  - this report

## 2026-04-29 14:37:16 +0700

Owner requested full draft content for Step 2-3 topics, to review before any commit.

Draft content added:

- `docs/member-programs-drafts/README_STEP_2_3_FULL_CONTENT_DRAFTS_2026-04-29.md`
- `docs/member-programs-drafts/CORE_MEMBER_PAID_LESSONS_FULL_DRAFT_2026-04-29.md`
- `docs/member-programs-drafts/DEEP_CONTINUITY_TRACKS_FULL_DRAFT_2026-04-29.md`
- `docs/member-programs-drafts/PRO_PROGRAMS_FULL_DRAFT_2026-04-29.md`
- `docs/member-programs-drafts/SALES_CREATOR_ADMIN_PROCESS_FULL_DRAFT_2026-04-29.md`

Coverage:

- Core:
  - orientation sequence
  - seven-day foundation
  - 10 pillar companion chains
  - worksheets, prompts, CTA, chooser logic
- Deep:
  - 12 tracks
  - five lessons per track
  - worksheet fields
  - seven-day practice
  - caution note
  - next-step chooser
- Pro:
  - 8 tracks
  - Family & Relationship Systems and Children & Education Environment included
  - who should enter / who should wait
  - eight modules per track
  - workbook fields
  - 30/60/90-day implementation plans
  - completion criteria
- Sales / creator / admin:
  - 8 public choose-right sales drafts
  - 8 member upgrade drafts
  - 5 checkout support blocks
  - 10 creator/collaborator modules
  - admin/CMS workflow, offer/entitlement procedure, creator submission procedure, support procedure, homepage refresh procedure

Validation:

- Unresolved marker scan returned no matches in `docs/member-programs-drafts`.
- Coverage scan confirmed:
  - 10 Core pillar sections
  - 12 Deep track sections
  - 8 Pro track sections
  - 8 Sales sections
  - 8 Upgrade sections
  - 5 Checkout sections
  - 10 Creator sections
- Draft word counts:
  - Core draft: 5906 words
  - Deep draft: 3622 words
  - Pro draft: 3047 words
  - Sales/Creator/Admin draft: 4241 words

Coordination:

- No commit was created, per owner instruction to review first.
- No deploy was run.
- Homepage files remain untouched:
  - `index.html`
  - `en/index.html`
  - `admin/site-config.json`
- Runtime/live-gate scripts remain untouched and preserved.
