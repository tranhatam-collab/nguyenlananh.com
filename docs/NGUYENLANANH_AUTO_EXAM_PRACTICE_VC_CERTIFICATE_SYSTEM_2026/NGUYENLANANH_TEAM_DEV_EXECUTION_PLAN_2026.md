# NGUYENLANANH_TEAM_DEV_EXECUTION_PLAN_2026.md

**Project:** nguyenlananh.com  
**Document type:** Team Dev Execution Plan  
**Version:** 1.0 Production Handoff  
**Date:** 2026-04-25  
**Owner:** Trần Hà Tâm  
**Primary language:** Vietnamese  
**Secondary language:** English  
**Core goal:** Build a web-based automated learning, membership, check-in, payment, email and reporting system for nguyenlananh.com, where 90 percent or more of the learner journey is automated. Direct expert interaction is reserved for 1:1 cases, high-tier members or flagged support needs.

---

## 0. Executive lock

This document converts the strategic education plan into a practical development plan for the team.

The team must build nguyenlananh.com as:

1. A public content and SEO website.
2. A free member onboarding system.
3. A paid learning and membership system.
4. A 7-day, 30-day, 90-day, 120-day, 1-year and 3-year automated journey.
5. A daily, weekly, monthly and quarterly check-in system.
6. An email automation system connected through `email.iai.one`.
7. A payment system supporting Stripe, PayPal and Vietnam QR payment.
8. A content admin studio for lessons, emails, reports, SEO articles and unlock rules.
9. A reporting system that tells the learner what happened and what to do next.
10. A 1:1 application and expert-support flow only when automation is not enough.

The launch principle is simple:

> Start small, but design correctly. Build only the first necessary layers in 30 days, but make the database, API and content model ready for 3 years.

---

## 1. Product scope

### 1.1 Public layer

The public layer is for visitors who have not registered.

Required pages:

| Route | Purpose | Priority |
|---|---|---|
| `/` | Homepage | P0 |
| `/vi/` | Vietnamese homepage if bilingual routing is used | P0 |
| `/en/` | English homepage | P1 |
| `/join` | Free member registration | P0 |
| `/pricing` | Pricing and plans | P0 |
| `/hanh-trinh-90-ngay` | 90-day journey landing page | P0 |
| `/7-ngay-bat-dau` | 7-day starter landing page | P0 |
| `/bai-viet` | SEO content hub | P0 |
| `/bai-viet/:slug` | Article detail | P0 |
| `/cau-hoi-thuong-gap` | FAQ | P1 |
| `/cau-chuyen` | Stories and testimonials | P1 |
| `/legal/terms` | Terms | P0 |
| `/legal/privacy` | Privacy | P0 |
| `/legal/refund` | Refund and cancellation | P0 |
| `/legal/disclaimer` | Educational disclaimer | P0 |

Public content must lead to only two primary actions:

1. **Đăng ký miễn phí**
2. **Bắt đầu hành trình 7 ngày**

Avoid too many CTAs.

---

### 1.2 Member layer

The member layer is for logged-in users.

Required app routes:

| Route | Purpose | Priority |
|---|---|---|
| `/app` | Member dashboard | P0 |
| `/app/today` | Today lesson | P0 |
| `/app/check-in` | Daily check-in | P0 |
| `/app/journal` | Reflection journal | P1 |
| `/app/progress` | Progress tracking | P0 |
| `/app/reports` | Weekly, monthly, 90-day reports | P1 |
| `/app/library` | Unlocked content library | P1 |
| `/app/billing` | Subscription and invoices | P0 |
| `/app/support` | Support and 1:1 application | P1 |
| `/app/settings` | Profile, notification, language | P1 |

---

### 1.3 Admin layer

The admin layer is for founder, content editor, support and dev admin.

Required admin routes:

| Route | Purpose | Priority |
|---|---|---|
| `/admin` | Admin overview | P0 |
| `/admin/content/lessons` | Lesson manager | P0 |
| `/admin/content/articles` | SEO article manager | P1 |
| `/admin/content/assets` | Image, audio, video asset manager | P1 |
| `/admin/email/templates` | Email template manager | P0 |
| `/admin/email/sequences` | Email sequence manager | P0 |
| `/admin/users` | User and membership overview | P0 |
| `/admin/check-ins` | Check-in monitoring | P1 |
| `/admin/payments` | Payment and subscription events | P0 |
| `/admin/reports` | Reports and export | P1 |
| `/admin/automation` | Automation rules and job status | P0 |
| `/admin/settings` | Global settings | P1 |

---

## 2. Technical direction

### 2.1 Production direction

The recommended V1 direction:

1. Keep the public site lightweight, fast and SEO-first.
2. Keep the existing Cloudflare Pages root deployment pattern if the current repository is static-root.
3. Add serverless API via Cloudflare Pages Functions or a separate Cloudflare Worker.
4. Use Supabase for V1 Auth and database if the current team wants fastest magic link, Google login and admin-friendly tables.
5. Keep payment provider integration behind internal API adapters.
6. Route all outbound email through `email.iai.one` instead of hard-coding Resend, SendGrid or another provider inside the app.
7. Build content as structured data, not hard-coded pages.
8. Make admin tools minimal in V1, but data-driven from day one.

### 2.2 Do not overbuild V1

Do not build these in the first 30 days:

1. Native mobile app.
2. Full AI personalization engine.
3. Complex community feed.
4. Livestream platform.
5. Mentor marketplace.
6. Public social network.
7. Too many badges.
8. Complex CRM.
9. Multi-country tax engine.
10. Fully automated bank reconciliation if QR confirmation is not ready.

### 2.3 Repo structure

If current repo is static-root Cloudflare Pages:

```txt
/
├── index.html
├── style.css
├── app.js
├── site.js
├── _headers
├── _redirects
├── robots.txt
├── sitemap.xml
├── content/
│   ├── vi.json
│   ├── en.json
│   ├── lessons/
│   │   ├── 90-day-vi.json
│   │   ├── 120-day-vi.json
│   │   └── yearly-map-vi.json
│   ├── emails/
│   │   ├── onboarding-vi.json
│   │   ├── paid-journey-vi.json
│   │   └── retention-vi.json
│   └── seo/
│       └── articles-index-vi.json
├── functions/
│   └── api/
│       ├── health.ts
│       ├── me.ts
│       ├── checkout/
│       ├── webhooks/
│       ├── learning/
│       ├── checkins/
│       ├── reports/
│       ├── admin/
│       └── automation/
├── src/
│   ├── api/
│   ├── auth/
│   ├── billing/
│   ├── content/
│   ├── email/
│   ├── learning/
│   ├── reports/
│   ├── ui/
│   └── utils/
├── migrations/
│   ├── 001_create_core_tables.sql
│   ├── 002_create_learning_tables.sql
│   ├── 003_create_email_automation_tables.sql
│   ├── 004_create_payment_tables.sql
│   ├── 005_create_report_tables.sql
│   └── 006_create_admin_audit_tables.sql
├── scripts/
│   ├── seed-plans.mjs
│   ├── seed-90-day-content.mjs
│   ├── seed-email-templates.mjs
│   ├── smoke-auth.mjs
│   ├── smoke-payment.mjs
│   ├── smoke-email.mjs
│   └── smoke-learning.mjs
├── docs/
│   ├── NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
│   └── NGUYENLANANH_TEAM_DEV_EXECUTION_PLAN_2026.md
└── package.json
```

If current repo is Next.js, map the same concept to:

```txt
/app
/components
/lib
/content
/migrations
/scripts
/docs
```

But do not force Next.js migration if the current static-root deployment is already stable.

---

## 3. Team roles

### 3.1 Founder / Product owner

Owns:

1. Final direction.
2. Pricing approval.
3. Program naming.
4. Content tone.
5. Legal disclaimers.
6. 1:1 escalation rules.
7. Launch approval.

### 3.2 Product manager

Owns:

1. Sprint planning.
2. Scope control.
3. Acceptance criteria.
4. Bug triage.
5. Launch checklist.
6. Risk register.
7. Weekly delivery report.

### 3.3 Tech lead

Owns:

1. Architecture.
2. Data model.
3. API conventions.
4. Payment security.
5. Auth and access rules.
6. Code review.
7. Deployment readiness.

### 3.4 Frontend developer

Owns:

1. Public pages.
2. Member dashboard.
3. Lesson UI.
4. Check-in UI.
5. Progress UI.
6. Billing UI.
7. Admin basic UI.
8. Mobile-first responsive behavior.

### 3.5 Backend developer

Owns:

1. API endpoints.
2. Provider adapters.
3. Webhooks.
4. Automation jobs.
5. Report generation.
6. Audit logs.
7. Error logging.

### 3.6 Database developer

Owns:

1. Schema.
2. Migrations.
3. Seed data.
4. Row-level access.
5. Backup and restore plan.
6. Data integrity constraints.

### 3.7 Content editor

Owns:

1. Lessons.
2. Check-in questions.
3. Email templates.
4. SEO articles.
5. Image prompts.
6. Audio/video metadata.
7. Content QA.

### 3.8 QA engineer

Owns:

1. Test plan.
2. Smoke tests.
3. Manual regression.
4. Payment sandbox test.
5. Email test.
6. Auth test.
7. Launch gate report.

### 3.9 Support / operations

Owns:

1. User support.
2. Failed payment cases.
3. QR payment verification if manual.
4. Refund request triage.
5. 1:1 application handling.
6. Member feedback.

---

## 4. Sprint plan

### Sprint 0 — Repo audit and lock

Duration: 2 to 3 days.

Tasks:

1. Confirm current repo structure.
2. Confirm deployment platform.
3. Confirm whether current build is static-root or framework-based.
4. Confirm domain routing for `nguyenlananh.com`.
5. Confirm if `/app` and `/admin` are currently available.
6. Confirm current language files.
7. Confirm existing payment code.
8. Confirm existing auth code.
9. Confirm current analytics.
10. Confirm current email sending method.

Deliverables:

1. `REPO_AUDIT_NGUYENLANANH_2026.md`
2. `TECH_DECISION_RECORD_001_ARCHITECTURE.md`
3. Updated `.env.example`
4. Updated `README.md` quick start.

Acceptance criteria:

1. Team knows exact repo structure.
2. Team knows exact deployment command.
3. No one assumes a `/public` folder unless it exists.
4. No secret is committed.
5. Health route is planned or available.

---

### Sprint 1 — Core database, auth and public onboarding

Duration: 5 to 7 days.

Tasks:

1. Create core user profile tables.
2. Set up Supabase Auth or existing auth provider.
3. Implement magic link login.
4. Implement Google login.
5. Create free member flow.
6. Create `/join`.
7. Create `/app` protected shell.
8. Create `/app/today` placeholder.
9. Create `/api/health`.
10. Create `/api/me`.

Deliverables:

1. Auth working in staging.
2. Free user can register.
3. Free user can log in.
4. Free user lands in dashboard.
5. Admin can see basic user record.

Acceptance criteria:

1. Magic link works.
2. Google login works.
3. Logged-out users cannot access `/app`.
4. User profile is created once.
5. API returns correct current user.
6. Session expires safely.
7. Logout works.

---

### Sprint 2 — Pricing, plans and payments

Duration: 7 to 10 days.

Tasks:

1. Create plans table.
2. Seed 7-day, 30-day, 90-day, 1-year and 3-year plan records.
3. Implement Stripe checkout.
4. Implement Stripe webhook.
5. Implement PayPal checkout.
6. Implement PayPal webhook.
7. Implement Vietnam QR order creation.
8. Create payment order status.
9. Create billing page.
10. Create admin payment event view.

V1 payment behavior:

1. Stripe is the primary recurring payment provider.
2. PayPal is secondary.
3. QR Việt Nam is V1 invoice/order based unless automatic confirmation is configured.
4. Paid access is activated only after payment confirmation.
5. All payment provider events must be logged.

Deliverables:

1. `/pricing`
2. `/app/billing`
3. `/api/checkout/stripe`
4. `/api/checkout/paypal`
5. `/api/checkout/vietqr`
6. `/api/webhooks/stripe`
7. `/api/webhooks/paypal`
8. `/admin/payments`

Acceptance criteria:

1. Stripe sandbox subscription creates membership access.
2. Stripe cancellation removes future access after current period.
3. Stripe failed payment does not immediately delete data.
4. PayPal sandbox payment creates membership access.
5. QR order creates a unique payment reference.
6. Admin can manually mark QR payment as paid if V1 manual.
7. All webhooks verify signatures.
8. No provider secret is exposed to frontend.

---

### Sprint 3 — Learning engine and 90-day content unlock

Duration: 7 to 10 days.

Tasks:

1. Create programs.
2. Create courses.
3. Create lessons.
4. Create lesson assets.
5. Create check-in templates.
6. Seed 90-day content map.
7. Create unlock rules.
8. Implement today lesson API.
9. Implement lesson complete event.
10. Implement progress calculation.

Deliverables:

1. `/app/today`
2. `/app/library`
3. `/app/progress`
4. `/api/learning/today`
5. `/api/learning/complete`
6. `/api/progress`
7. Admin lesson manager.

Acceptance criteria:

1. Free users see only free lessons.
2. 7-day users see day 1 to day 7.
3. 30-day users see day 1 to day 30.
4. 90-day users see day 1 to day 90.
5. Future lessons are locked.
6. Completion is stored.
7. Progress updates after completion.
8. Returning user sees correct next lesson.

---

### Sprint 4 — Check-in, journal and reminder logic

Duration: 7 to 10 days.

Tasks:

1. Create check-in API.
2. Create daily check-in UI.
3. Create weekly check-in UI.
4. Create monthly check-in UI.
5. Store structured answers.
6. Store free text journal.
7. Add streak calculation.
8. Add missed-check-in rules.
9. Add 1-day, 3-day and 7-day reminder triggers.
10. Add 1:1 escalation signal if needed.

Deliverables:

1. `/app/check-in`
2. `/app/journal`
3. `/api/checkins`
4. `/api/checkins/today`
5. `/api/checkins/streak`
6. `/admin/check-ins`

Acceptance criteria:

1. User can submit daily check-in.
2. User cannot accidentally duplicate check-in for same day unless edit is allowed.
3. Weekly check-in appears at correct time.
4. Monthly check-in appears at correct time.
5. Missing check-ins are detected.
6. Streak resets or pauses according to business rule.
7. Admin can view aggregated signals without exposing unnecessary sensitive content.

---

### Sprint 5 — Email automation through email.iai.one

Duration: 7 to 10 days.

Tasks:

1. Create email template table.
2. Create email sequence table.
3. Create email event table.
4. Create email queue.
5. Create `email.iai.one` adapter.
6. Create onboarding sequence.
7. Create paid user sequence.
8. Create reminder sequence.
9. Create weekly report email.
10. Create email webhook receiver for delivery/open/click/failure if supported.

Deliverables:

1. `/api/email/send`
2. `/api/email/queue`
3. `/api/webhooks/email`
4. `/admin/email/templates`
5. `/admin/email/sequences`
6. `/admin/automation/email-health`

Acceptance criteria:

1. New free user receives onboarding email.
2. Paid user receives purchase confirmation email.
3. Daily reminder is not sent if user has already checked in.
4. Failed email is logged.
5. Retry mechanism exists.
6. Admin can pause a sequence.
7. Email templates use variables safely.
8. Unsubscribe and notification preferences are respected.

---

### Sprint 6 — Reports and dashboard intelligence

Duration: 7 to 14 days.

Tasks:

1. Generate weekly report.
2. Generate monthly report.
3. Generate 90-day report.
4. Create report templates.
5. Create user-facing report UI.
6. Add next-step recommendation.
7. Add plan upgrade logic.
8. Add 1:1 application CTA only when needed.
9. Create PDF export if feasible.
10. Create admin report overview.

Deliverables:

1. `/app/reports`
2. `/api/reports/weekly`
3. `/api/reports/monthly`
4. `/api/reports/90-day`
5. `/api/recommendations/next-step`
6. `/api/one-to-one/apply`

Acceptance criteria:

1. Weekly report is generated after week end.
2. Monthly report is generated after month end.
3. 90-day report is generated after day 90.
4. Report uses real progress and check-in data.
5. Report language is calm and non-alarming.
6. Upgrade recommendation is logical.
7. 1:1 recommendation appears only when trigger conditions are met.

---

### Sprint 7 — Admin content studio

Duration: 10 to 14 days.

Tasks:

1. Create lesson editor.
2. Create email editor.
3. Create check-in template editor.
4. Create SEO article editor.
5. Create image prompt / asset URL fields.
6. Create publish status.
7. Create preview mode.
8. Create content versioning.
9. Create content approval flow.
10. Create audit log.

Deliverables:

1. `/admin/content/lessons`
2. `/admin/content/articles`
3. `/admin/content/checkins`
4. `/admin/content/assets`
5. `/admin/content/preview`

Acceptance criteria:

1. Editor can create a lesson without dev.
2. Editor can update lesson safely.
3. Draft content is not visible publicly.
4. Published content appears in correct user tier.
5. Audit log records who changed what.
6. Deleted content is soft-deleted or archived.
7. Preview works before publish.

---

### Sprint 8 — QA, security, SEO and launch

Duration: 7 to 10 days.

Tasks:

1. Run auth smoke tests.
2. Run payment sandbox tests.
3. Run email tests.
4. Run lesson unlock tests.
5. Run check-in tests.
6. Run mobile responsive tests.
7. Run SEO tests.
8. Run basic accessibility tests.
9. Run legal page check.
10. Prepare launch gate report.

Deliverables:

1. `QA_LAUNCH_GATE_NGUYENLANANH_2026.md`
2. `PAYMENT_SMOKE_REPORT.md`
3. `EMAIL_SMOKE_REPORT.md`
4. `AUTH_SMOKE_REPORT.md`
5. `CONTENT_QA_REPORT.md`
6. `SEO_QA_REPORT.md`

Acceptance criteria:

1. No P0 bug.
2. No broken payment flow.
3. No broken login flow.
4. No broken email queue.
5. No broken daily lesson.
6. No broken check-in.
7. No missing legal pages.
8. No secrets in repository.
9. No public page exposes internal admin labels.
10. Founder approves launch.

---

## 5. Data model

### 5.1 Core tables

#### `profiles`

Stores one profile per user.

Fields:

```txt
id uuid primary key
auth_user_id uuid unique not null
email text not null
full_name text
avatar_url text
language text default 'vi'
timezone text default 'Asia/Ho_Chi_Minh'
member_status text default 'free'
created_at timestamptz
updated_at timestamptz
```

#### `user_preferences`

```txt
id uuid primary key
profile_id uuid references profiles(id)
email_daily_enabled boolean default true
email_weekly_enabled boolean default true
email_marketing_enabled boolean default true
sms_enabled boolean default false
preferred_learning_time text
created_at timestamptz
updated_at timestamptz
```

#### `audit_logs`

```txt
id uuid primary key
actor_profile_id uuid
action text not null
entity_type text not null
entity_id text
before_json jsonb
after_json jsonb
ip_address text
user_agent text
created_at timestamptz
```

---

### 5.2 Payment and membership tables

#### `plans`

```txt
id uuid primary key
code text unique not null
name_vi text not null
name_en text
tier text not null
duration_days integer
billing_interval text
price_usd numeric
price_vnd numeric
is_recurring boolean default false
is_application_only boolean default false
stripe_price_id text
paypal_plan_id text
vietqr_enabled boolean default false
status text default 'active'
created_at timestamptz
updated_at timestamptz
```

Required plan codes:

```txt
FREE_MEMBER
START_7_DAY
FOUNDATION_30_DAY
DEEP_90_DAY
INTEGRATION_120_DAY
YEAR_1
YEAR_3
INNER_CIRCLE_APPLICATION
ONE_TO_ONE_APPLICATION
```

#### `subscriptions`

```txt
id uuid primary key
profile_id uuid references profiles(id)
plan_id uuid references plans(id)
provider text not null
provider_customer_id text
provider_subscription_id text
status text not null
current_period_start timestamptz
current_period_end timestamptz
cancel_at_period_end boolean default false
created_at timestamptz
updated_at timestamptz
```

#### `payment_orders`

```txt
id uuid primary key
profile_id uuid references profiles(id)
plan_id uuid references plans(id)
provider text not null
amount numeric not null
currency text not null
status text default 'pending'
provider_order_id text
payment_reference text unique
qr_url text
expires_at timestamptz
paid_at timestamptz
created_at timestamptz
updated_at timestamptz
```

#### `payment_events`

```txt
id uuid primary key
provider text not null
event_type text not null
provider_event_id text unique
profile_id uuid
subscription_id uuid
payment_order_id uuid
raw_payload jsonb
signature_verified boolean default false
processed boolean default false
created_at timestamptz
```

---

### 5.3 Learning tables

#### `programs`

```txt
id uuid primary key
code text unique not null
name_vi text not null
name_en text
description_vi text
description_en text
duration_days integer
status text default 'draft'
created_at timestamptz
updated_at timestamptz
```

Required program codes:

```txt
PUBLIC_CONTENT
FREE_MEMBER_14_DAY
STARTER_7_DAY
FOUNDATION_30_DAY
DEEP_JOURNEY_90_DAY
INTEGRATION_120_DAY
YEAR_1_MEMBERSHIP
THREE_YEAR_JOURNEY
```

#### `lessons`

```txt
id uuid primary key
program_id uuid references programs(id)
day_number integer
week_number integer
month_number integer
quarter_number integer
title_vi text not null
title_en text
slug text unique not null
summary_vi text
body_vi text not null
exercise_vi text
reflection_prompt_vi text
action_step_vi text
seo_title_vi text
seo_description_vi text
image_url text
audio_url text
video_url text
access_level text default 'free'
publish_status text default 'draft'
published_at timestamptz
created_at timestamptz
updated_at timestamptz
```

#### `lesson_progress`

```txt
id uuid primary key
profile_id uuid references profiles(id)
lesson_id uuid references lessons(id)
status text default 'not_started'
started_at timestamptz
completed_at timestamptz
created_at timestamptz
updated_at timestamptz
unique(profile_id, lesson_id)
```

#### `unlock_rules`

```txt
id uuid primary key
program_id uuid references programs(id)
lesson_id uuid references lessons(id)
required_plan_code text
required_day_offset integer
requires_previous_completion boolean default false
requires_checkin boolean default false
status text default 'active'
created_at timestamptz
updated_at timestamptz
```

---

### 5.4 Check-in and journal tables

#### `checkin_templates`

```txt
id uuid primary key
code text unique not null
type text not null
title_vi text not null
questions_json jsonb not null
status text default 'active'
created_at timestamptz
updated_at timestamptz
```

Types:

```txt
daily
weekly
monthly
quarterly
yearly
completion_90_day
completion_120_day
```

#### `checkins`

```txt
id uuid primary key
profile_id uuid references profiles(id)
template_id uuid references checkin_templates(id)
type text not null
checkin_date date not null
energy_score integer
mood text
answers_json jsonb
needs_support boolean default false
submitted_at timestamptz
created_at timestamptz
updated_at timestamptz
unique(profile_id, type, checkin_date)
```

#### `journal_entries`

```txt
id uuid primary key
profile_id uuid references profiles(id)
source text
source_id uuid
title text
body text not null
visibility text default 'private'
created_at timestamptz
updated_at timestamptz
```

---

### 5.5 Email automation tables

#### `email_templates`

```txt
id uuid primary key
code text unique not null
name text not null
subject_vi text not null
body_vi text not null
subject_en text
body_en text
category text
status text default 'draft'
created_at timestamptz
updated_at timestamptz
```

#### `email_sequences`

```txt
id uuid primary key
code text unique not null
name text not null
trigger_event text not null
plan_code text
status text default 'active'
created_at timestamptz
updated_at timestamptz
```

#### `email_sequence_steps`

```txt
id uuid primary key
sequence_id uuid references email_sequences(id)
template_id uuid references email_templates(id)
step_order integer not null
delay_hours integer default 0
condition_json jsonb
status text default 'active'
created_at timestamptz
updated_at timestamptz
```

#### `email_queue`

```txt
id uuid primary key
profile_id uuid references profiles(id)
template_id uuid references email_templates(id)
sequence_id uuid
to_email text not null
subject text not null
body text not null
status text default 'queued'
scheduled_at timestamptz
sent_at timestamptz
failed_at timestamptz
failure_reason text
provider_message_id text
retry_count integer default 0
created_at timestamptz
updated_at timestamptz
```

#### `email_events`

```txt
id uuid primary key
profile_id uuid
provider text
provider_message_id text
event_type text
raw_payload jsonb
created_at timestamptz
```

---

### 5.6 Reports and recommendations

#### `reports`

```txt
id uuid primary key
profile_id uuid references profiles(id)
type text not null
period_start date
period_end date
summary_vi text
metrics_json jsonb
recommendations_json jsonb
status text default 'generated'
created_at timestamptz
updated_at timestamptz
```

Types:

```txt
weekly
monthly
quarterly
ninety_day
one_twenty_day
yearly
three_year_completion
```

#### `recommendation_events`

```txt
id uuid primary key
profile_id uuid references profiles(id)
recommendation_type text not null
reason_code text
payload_json jsonb
shown_at timestamptz
clicked_at timestamptz
dismissed_at timestamptz
created_at timestamptz
```

---

### 5.7 1:1 and support

#### `one_to_one_applications`

```txt
id uuid primary key
profile_id uuid references profiles(id)
source text
reason text
answers_json jsonb
status text default 'submitted'
assigned_to text
admin_notes text
created_at timestamptz
updated_at timestamptz
```

Status values:

```txt
submitted
reviewing
approved
declined
scheduled
completed
cancelled
```

---

## 6. API contract

All API responses should use this shape:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "requestId": "req_xxx"
}
```

Error shape:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "Please sign in to continue."
  },
  "requestId": "req_xxx"
}
```

### 6.1 Health

```txt
GET /api/health
```

Response:

```json
{
  "ok": true,
  "data": {
    "service": "nguyenlananh-web",
    "status": "ok",
    "version": "2026.04",
    "time": "2026-04-25T00:00:00Z"
  },
  "error": null
}
```

### 6.2 User

```txt
GET /api/me
PATCH /api/me/preferences
```

### 6.3 Plans

```txt
GET /api/plans
GET /api/plans/:code
```

### 6.4 Checkout

```txt
POST /api/checkout/stripe
POST /api/checkout/paypal
POST /api/checkout/vietqr
```

Input:

```json
{
  "planCode": "DEEP_90_DAY",
  "successUrl": "https://nguyenlananh.com/app/billing/success",
  "cancelUrl": "https://nguyenlananh.com/pricing"
}
```

### 6.5 Webhooks

```txt
POST /api/webhooks/stripe
POST /api/webhooks/paypal
POST /api/webhooks/email
POST /api/webhooks/vietqr
```

Rules:

1. Verify signature when provider supports signatures.
2. Store raw payload.
3. Process idempotently.
4. Return 2xx only after safe logging.
5. Never trust frontend payment status.

### 6.6 Learning

```txt
GET /api/learning/today
GET /api/learning/lessons/:id
POST /api/learning/lessons/:id/start
POST /api/learning/lessons/:id/complete
GET /api/learning/library
GET /api/progress
```

### 6.7 Check-in

```txt
GET /api/checkins/today
POST /api/checkins
GET /api/checkins/streak
GET /api/checkins/history
```

### 6.8 Reports

```txt
GET /api/reports
GET /api/reports/weekly/current
GET /api/reports/monthly/current
GET /api/reports/90-day
POST /api/reports/generate
```

### 6.9 1:1

```txt
POST /api/one-to-one/apply
GET /api/one-to-one/status
```

### 6.10 Admin

```txt
GET /api/admin/users
GET /api/admin/payments
GET /api/admin/automation/status
POST /api/admin/content/lessons
PATCH /api/admin/content/lessons/:id
POST /api/admin/email/templates
PATCH /api/admin/email/templates/:id
POST /api/admin/reports/generate
```

---

## 7. Payment tiers

### 7.1 Required plans

| Code | Name | Access | Payment |
|---|---|---|---|
| `FREE_MEMBER` | Thành viên miễn phí | Free onboarding, limited lessons | None |
| `START_7_DAY` | 7 Ngày Bắt Đầu | Day 1 to 7 | One-time |
| `FOUNDATION_30_DAY` | 30 Ngày Nền Tảng | Day 1 to 30 | One-time or monthly |
| `DEEP_90_DAY` | 90 Ngày Đi Sâu | Day 1 to 90 | One-time or 3 monthly payments |
| `INTEGRATION_120_DAY` | 120 Ngày Tích Hợp | Day 1 to 120 | One-time |
| `YEAR_1` | Đồng Hành 1 Năm | 12 monthly themes | Annual or monthly |
| `YEAR_3` | Đồng Hành 3 Năm | 3-year journey | Annual, 3-year, or application |
| `INNER_CIRCLE_APPLICATION` | Nhóm Sâu | Special content and group | Application |
| `ONE_TO_ONE_APPLICATION` | 1:1 | Direct expert | Application |

### 7.2 Access rules

1. Free users can access free onboarding and selected public lessons.
2. 7-day users can access day 1 to day 7.
3. 30-day users can access day 1 to day 30.
4. 90-day users can access day 1 to day 90.
5. 120-day users can access day 1 to day 120.
6. 1-year users can access 12 monthly themes and all lower journeys.
7. 3-year users can access yearly roadmap, quarterly reports and alumni path.
8. 1:1 does not unlock everything automatically. It is a service layer, not a universal content pass.

### 7.3 Provider behavior

Stripe:

1. Use for primary recurring subscription.
2. Use Checkout or Payment Links only if it simplifies V1.
3. Use webhooks to sync subscription status.
4. Use customer portal if enabled.

PayPal:

1. Use for users who prefer PayPal.
2. Use PayPal plans and subscriptions for recurring payment.
3. Log subscription events.

QR Việt Nam:

1. V1: create order and QR with unique reference.
2. Confirm manually or via provider callback if available.
3. Grant access only after order is paid.
4. Do not treat QR as recurring subscription unless confirmation and recurring logic are implemented.

---

## 8. Email automation

### 8.1 Email provider adapter

App should call internal adapter:

```txt
email.iai.one
```

The app should not hard-code vendor-specific logic.

Internal API idea:

```txt
POST https://email.iai.one/api/send
POST https://email.iai.one/api/batch
POST https://email.iai.one/api/templates/render
POST https://email.iai.one/api/webhooks/events
```

The app only needs environment values:

```txt
EMAIL_API_BASE_URL
EMAIL_API_KEY
EMAIL_WEBHOOK_SECRET
EMAIL_FROM_DEFAULT
EMAIL_REPLY_TO_DEFAULT
```

### 8.2 Core email sequences

#### Sequence 1: Free onboarding

Trigger:

```txt
user_registered
```

Steps:

| Step | Delay | Template |
|---|---:|---|
| 1 | 0h | Welcome |
| 2 | 24h | First question |
| 3 | 48h | Why people do not change |
| 4 | 72h | Free lesson 1 |
| 5 | 96h | Check-in reminder |
| 6 | 120h | Free lesson 2 |
| 7 | 144h | Invite to 7-day starter |

#### Sequence 2: 7-day starter

Trigger:

```txt
plan_activated:START_7_DAY
```

Steps:

| Step | Delay | Template |
|---|---:|---|
| 1 | 0h | You started |
| 2 | 24h | Day 1 lesson |
| 3 | 48h | Day 2 practice |
| 4 | 72h | Missed check-in rule |
| 5 | 96h | Mid-journey support |
| 6 | 144h | Prepare next step |
| 7 | 168h | Upgrade to 30-day |

#### Sequence 3: 30-day journey

Trigger:

```txt
plan_activated:FOUNDATION_30_DAY
```

Rules:

1. Send week opening email every 7 days.
2. Send mid-week reminder if lesson completion is below 50 percent.
3. Send weekly report email every 7 days.
4. Send day-30 summary and 90-day invitation.

#### Sequence 4: 90-day journey

Trigger:

```txt
plan_activated:DEEP_90_DAY
```

Rules:

1. Send day 1 welcome.
2. Send weekly theme.
3. Send missed-check-in reminders.
4. Send day 30 report.
5. Send day 60 report.
6. Send day 90 report.
7. Suggest 120-day integration or 1-year membership.

#### Sequence 5: Retention

Trigger:

```txt
inactive_3_days
inactive_7_days
failed_payment
cancel_intent
journey_completed
```

Rules:

1. No guilt language.
2. Keep message short.
3. Give one clear return action.
4. Never shame the learner.
5. If user has very low signals, recommend gentle restart.

---

## 9. Automation jobs

### 9.1 Job list

| Job | Frequency | Purpose |
|---|---|---|
| `job_daily_unlock_lessons` | Daily 00:10 | Unlock daily lessons |
| `job_check_missed_checkins` | Daily 09:00 and 20:00 | Detect missing check-ins |
| `job_send_email_queue` | Every 5 minutes | Send queued emails |
| `job_retry_failed_emails` | Hourly | Retry failed emails |
| `job_generate_weekly_reports` | Weekly | Create weekly report |
| `job_generate_monthly_reports` | Monthly | Create monthly report |
| `job_subscription_sync` | Daily | Sync payment state |
| `job_qr_order_expiry` | Every hour | Expire unpaid QR orders |
| `job_automation_health` | Every hour | Detect broken jobs |
| `job_content_publish` | Every 15 minutes | Publish scheduled content |

### 9.2 Job safety rules

1. Jobs must be idempotent.
2. Jobs must log result.
3. Jobs must not send duplicate emails.
4. Jobs must use locking or unique keys.
5. Jobs must retry safely.
6. Jobs must alert admin if repeated failures occur.
7. Jobs must support dry-run in staging.

---

## 10. Dashboard logic

### 10.1 Dashboard cards

The member dashboard must show:

1. Today lesson.
2. Today check-in.
3. Current streak.
4. Current program.
5. Progress percentage.
6. Next report date.
7. Next recommended action.
8. Billing status.
9. Support or 1:1 option when relevant.

### 10.2 Progress formula

V1 formula:

```txt
progress_score =
  lesson_completion_rate * 0.40
+ checkin_completion_rate * 0.35
+ weekly_review_completion_rate * 0.15
+ return_consistency_score * 0.10
```

### 10.3 Recommendation rules

Recommend 7-day starter when:

1. User is free.
2. User completed at least 2 free lessons.
3. User submitted at least 1 check-in.

Recommend 30-day when:

1. User completed 7-day starter.
2. User checked in at least 3 days.
3. User opened at least 3 emails or returned to dashboard.

Recommend 90-day when:

1. User completed 30-day.
2. User has at least 12 check-ins.
3. User viewed progress report.

Recommend 1-year when:

1. User completed 90-day or 120-day.
2. User returned for at least 60 percent of weeks.
3. User wants long-term rhythm.

Recommend 1:1 when:

1. User asks for support 3 times in 7 days.
2. User selects low energy for 7 consecutive check-ins.
3. User completes 90 days and requests personal review.
4. User is high-tier and writes long reflection requiring interpretation.
5. User submits 1:1 application directly.

---

## 11. Admin content studio

### 11.1 Editor fields for lessons

Required fields:

```txt
program
day_number
week_number
month_number
title_vi
title_en
slug
summary_vi
body_vi
exercise_vi
reflection_prompt_vi
action_step_vi
seo_title_vi
seo_description_vi
image_url
audio_url
video_url
access_level
publish_status
published_at
```

### 11.2 Editor workflow

Status:

```txt
draft
ready_for_review
approved
scheduled
published
archived
```

Rules:

1. Content editor can create draft.
2. Founder or assigned approver approves.
3. Scheduled content publishes automatically.
4. Published content cannot be overwritten without version.
5. All changes create audit log.

### 11.3 SEO article requirements

Every public article needs:

1. H1.
2. SEO title.
3. SEO description.
4. Canonical slug.
5. Open Graph title.
6. Open Graph image.
7. Internal links.
8. CTA to free registration.
9. CTA to 7-day starter.
10. Related articles.

### 11.4 Asset requirements

Images:

1. Calm.
2. Real.
3. Minimal.
4. Warm.
5. Not over-designed.
6. Avoid cliché stock images.

Audio:

1. Short V1 clips.
2. Clear voice.
3. Low background noise.
4. No heavy music by default.

Video:

1. 30 to 90 seconds for public.
2. 3 to 7 minutes for paid lessons.
3. Captions required.

---

## 12. QA plan

### 12.1 Auth tests

Test cases:

1. Register with email.
2. Receive magic link.
3. Login with magic link.
4. Login with Google.
5. Logout.
6. Access `/app` while logged out.
7. Access `/admin` as non-admin.
8. Profile created after first login.
9. Email preference update.
10. Session expiry.

### 12.2 Payment tests

Stripe:

1. Successful checkout.
2. Failed payment.
3. Cancel subscription.
4. Renew subscription.
5. Upgrade plan.
6. Downgrade plan.
7. Webhook duplicate event.
8. Webhook invalid signature.

PayPal:

1. Successful subscription.
2. Cancel subscription.
3. Webhook event received.
4. Invalid webhook ignored.

QR:

1. Create QR order.
2. Unique reference generated.
3. Expired unpaid order.
4. Manual mark as paid.
5. Paid order grants access.
6. Duplicate confirmation ignored.

### 12.3 Learning tests

1. Free user sees free content.
2. Paid user sees paid content.
3. Future lesson locked.
4. Completed lesson updates progress.
5. User returns to next lesson.
6. 90-day user receives correct day content.
7. 120-day integration unlocks after day 90.
8. 1-year user sees monthly theme.
9. 3-year user sees yearly roadmap.
10. Admin preview works.

### 12.4 Email tests

1. Welcome email sent.
2. Paid confirmation sent.
3. Daily reminder not sent after check-in.
4. Reminder sent after missing check-in.
5. Failed email retries.
6. Unsubscribe respected.
7. Email event logged.
8. Template variable renders correctly.
9. No duplicate email.
10. Admin can pause sequence.

### 12.5 Security tests

1. No secrets in frontend.
2. No service role key exposed.
3. Webhook signatures verified.
4. Admin routes protected.
5. User can only read own check-ins.
6. User can only read own reports.
7. Payment status cannot be changed from frontend.
8. CORS limited to expected origins.
9. Input validation on all POST endpoints.
10. Rate limit login and high-risk endpoints.

### 12.6 SEO tests

1. Homepage metadata.
2. Pricing page metadata.
3. 90-day page metadata.
4. Article metadata.
5. Sitemap updated.
6. Robots correct.
7. Canonical URLs correct.
8. Open Graph tags.
9. Mobile speed acceptable.
10. Internal links present.

---

## 13. Environment variables

Required:

```txt
APP_ENV=staging
APP_BASE_URL=https://nguyenlananh.com
APP_API_BASE_URL=https://nguyenlananh.com/api

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_START_7_DAY=
STRIPE_PRICE_FOUNDATION_30_DAY=
STRIPE_PRICE_DEEP_90_DAY=
STRIPE_PRICE_YEAR_1=
STRIPE_PRICE_YEAR_3=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_ENV=sandbox

EMAIL_API_BASE_URL=https://email.iai.one
EMAIL_API_KEY=
EMAIL_WEBHOOK_SECRET=
EMAIL_FROM_DEFAULT=
EMAIL_REPLY_TO_DEFAULT=

VIETQR_ENABLED=true
VIETQR_PROVIDER=
VIETQR_BANK_CODE=
VIETQR_ACCOUNT_NAME=
VIETQR_ACCOUNT_NUMBER=
VIETQR_WEBHOOK_SECRET=

ADMIN_EMAILS=
JWT_SECRET=
ENCRYPTION_SECRET=
```

Rules:

1. `.env.example` must include names only, no real values.
2. Staging and production secrets must be separate.
3. Webhook secrets must not be shared across providers.
4. Bank account data must be handled as operational configuration, not hard-coded.
5. No personal account number should be committed to repo.

---

## 14. File deliverables for team

The team should create or update these files.

### 14.1 Docs

```txt
/docs/NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
/docs/NGUYENLANANH_TEAM_DEV_EXECUTION_PLAN_2026.md
/docs/REPO_AUDIT_NGUYENLANANH_2026.md
/docs/TECH_DECISION_RECORD_001_ARCHITECTURE.md
/docs/API_CONTRACT_NGUYENLANANH_2026.md
/docs/DATABASE_SCHEMA_NGUYENLANANH_2026.md
/docs/EMAIL_AUTOMATION_NGUYENLANANH_2026.md
/docs/PAYMENT_INTEGRATION_NGUYENLANANH_2026.md
/docs/QA_LAUNCH_GATE_NGUYENLANANH_2026.md
```

### 14.2 Migrations

```txt
/migrations/001_create_core_tables.sql
/migrations/002_create_payment_tables.sql
/migrations/003_create_learning_tables.sql
/migrations/004_create_checkin_tables.sql
/migrations/005_create_email_tables.sql
/migrations/006_create_report_tables.sql
/migrations/007_create_admin_audit_tables.sql
```

### 14.3 Seeds

```txt
/content/lessons/90-day-vi.json
/content/lessons/120-day-vi.json
/content/lessons/year-1-map-vi.json
/content/lessons/three-year-map-vi.json
/content/emails/free-onboarding-vi.json
/content/emails/paid-journey-vi.json
/content/emails/retention-vi.json
/content/pricing/plans.json
```

### 14.4 Scripts

```txt
/scripts/seed-plans.mjs
/scripts/seed-content.mjs
/scripts/seed-email-templates.mjs
/scripts/smoke-auth.mjs
/scripts/smoke-payment.mjs
/scripts/smoke-email.mjs
/scripts/smoke-learning.mjs
/scripts/smoke-checkin.mjs
/scripts/smoke-admin.mjs
```

---

## 15. GitHub issue breakdown

### Epic 1 — Foundation

Issues:

1. Audit current repo and deployment.
2. Add architecture decision record.
3. Add `.env.example`.
4. Add `/api/health`.
5. Add auth setup.
6. Add protected app shell.

### Epic 2 — Payment

Issues:

1. Create plans schema.
2. Seed plans.
3. Implement Stripe checkout.
4. Implement Stripe webhook.
5. Implement PayPal checkout.
6. Implement PayPal webhook.
7. Implement QR order.
8. Add billing UI.
9. Add admin payments UI.
10. Add payment smoke tests.

### Epic 3 — Learning

Issues:

1. Create program and lesson schema.
2. Add 90-day seed.
3. Add today lesson API.
4. Add lesson completion API.
5. Add lesson UI.
6. Add library UI.
7. Add progress UI.
8. Add unlock tests.

### Epic 4 — Check-in

Issues:

1. Create check-in schema.
2. Add daily check-in UI.
3. Add weekly check-in.
4. Add monthly check-in.
5. Add streak logic.
6. Add missed-check-in detection.
7. Add journal.
8. Add admin check-in view.

### Epic 5 — Email

Issues:

1. Add email template schema.
2. Add sequence schema.
3. Add email queue.
4. Add `email.iai.one` adapter.
5. Add onboarding sequence.
6. Add paid sequence.
7. Add reminder sequence.
8. Add email webhook.
9. Add email health dashboard.
10. Add email smoke tests.

### Epic 6 — Reports

Issues:

1. Weekly report generator.
2. Monthly report generator.
3. 90-day report generator.
4. Recommendation engine V1.
5. Reports UI.
6. 1:1 trigger logic.
7. PDF export if feasible.
8. Admin reports.

### Epic 7 — Admin CMS

Issues:

1. Lesson admin.
2. Email template admin.
3. SEO article admin.
4. Asset metadata admin.
5. Preview mode.
6. Publish workflow.
7. Audit logs.
8. Admin role enforcement.

### Epic 8 — Launch

Issues:

1. Legal page review.
2. SEO metadata review.
3. Mobile QA.
4. Payment sandbox evidence.
5. Email evidence.
6. Auth evidence.
7. Content QA.
8. Founder approval.
9. Production deploy.
10. Post-launch monitoring.

---

## 16. Definition of Done

A task is done only when:

1. Code is committed.
2. No secrets are committed.
3. Relevant tests pass.
4. The feature works in staging.
5. Mobile layout is checked.
6. Error state is handled.
7. Loading state is handled.
8. Empty state is handled.
9. Admin path is considered if needed.
10. Analytics or event logging is added if relevant.
11. Documentation is updated.
12. PR description includes evidence.

A sprint is done only when:

1. All P0 tasks are complete.
2. QA report exists.
3. No critical bug remains.
4. Founder can test the main flow.
5. Tech lead signs off.
6. Product manager updates the execution board.

Launch is done only when:

1. Real domain works.
2. Login works.
3. Payment works.
4. Email works.
5. Lesson works.
6. Check-in works.
7. Legal pages exist.
8. Admin can support users.
9. Monitoring is active.
10. Rollback plan exists.

---

## 17. Launch gate

### 17.1 P0 launch checklist

```txt
[ ] Domain points correctly
[ ] SSL works
[ ] Homepage loads
[ ] Join page works
[ ] Magic link works
[ ] Google login works
[ ] Free profile created
[ ] Pricing page works
[ ] Stripe sandbox works
[ ] PayPal sandbox works
[ ] QR order works
[ ] Payment webhook works
[ ] Paid access unlocks
[ ] Today lesson works
[ ] Check-in works
[ ] Email welcome works
[ ] Missed check-in email works
[ ] Weekly report job works
[ ] Admin can view user
[ ] Admin can view payment
[ ] Admin can pause email sequence
[ ] Legal pages are live
[ ] Sitemap is updated
[ ] No secrets in repo
[ ] No P0 bugs
```

### 17.2 Rollback plan

If production issue occurs:

1. Disable payment buttons.
2. Disable email automation if spam risk.
3. Keep login active if safe.
4. Show maintenance notice for `/app`.
5. Restore last stable deployment.
6. Preserve database state.
7. Export failed payment events.
8. Notify affected users manually if needed.
9. Fix in staging.
10. Redeploy only after QA.

---

## 18. 30-day build order

### Week 1

1. Repo audit.
2. Auth.
3. Free member.
4. App shell.
5. Health route.
6. Plans schema.

### Week 2

1. Payment checkout.
2. Stripe webhook.
3. QR order.
4. Billing UI.
5. Payment admin.
6. Seed pricing.

### Week 3

1. Lesson schema.
2. 30-day or 90-day seed.
3. Today lesson.
4. Check-in.
5. Progress.
6. Dashboard.

### Week 4

1. Email onboarding.
2. Email reminder.
3. Weekly report basic.
4. QA smoke tests.
5. SEO polish.
6. Launch gate.

---

## 19. 60-day build order

By day 60, the system must have:

1. Full 90-day journey available.
2. Check-in automation.
3. Email sequences for free, 7-day, 30-day and 90-day.
4. Monthly reports.
5. Admin content editing.
6. Payment cancellation handling.
7. QR payment admin workflow.
8. First 20 SEO articles.
9. Basic analytics.
10. Support and 1:1 application.

---

## 20. 90-day build order

By day 90, the system must have:

1. Full 120-day integration path.
2. 1-year membership map.
3. 3-year program map.
4. 90-day completion report.
5. Recommendation engine V1.
6. Admin automation health.
7. Improved content studio.
8. Public content hub.
9. Upgrade flows.
10. Post-launch retention dashboard.

---

## 21. Risk controls

### 21.1 Content too shallow

Controls:

1. Every paid lesson must include insight, example, exercise, check-in and action.
2. Every lesson must be manually reviewed before publish.
3. Lessons must be grouped by week and month.
4. Avoid generic motivation.
5. Use real-life language.

### 21.2 User does not check in

Controls:

1. Check-in under 2 minutes.
2. Missed-check-in email.
3. Streak.
4. Restart button.
5. No shame language.
6. Weekly report shows value.

### 21.3 Email breaks

Controls:

1. Queue.
2. Retry.
3. Webhook event.
4. Admin health screen.
5. Pause sequence.
6. Test campaign.

### 21.4 System too complex

Controls:

1. Only launch 3 first plans.
2. Keep app dashboard simple.
3. Keep admin simple.
4. Use one primary email adapter.
5. Use one primary payment provider.
6. Add optional providers only behind adapters.

### 21.5 Payment access mismatch

Controls:

1. Provider webhook is source of truth.
2. Frontend success page is not source of truth.
3. Use idempotency.
4. Log every payment event.
5. Admin can manually fix access with audit log.

### 21.6 Privacy risk

Controls:

1. Journal is private by default.
2. Admin should not read sensitive journal unless support permission is granted.
3. Reports should avoid diagnosis language.
4. Legal disclaimer must clarify educational support, not medical or psychological treatment.

---

## 22. Engineering rules

1. Do not hard-code Vietnamese or English UI strings. Use content files.
2. Do not expose internal statuses on public pages.
3. Do not commit API keys.
4. Do not use fake payment success.
5. Do not send duplicate email.
6. Do not shame users for missed check-ins.
7. Do not call the program therapy, diagnosis or treatment.
8. Do not make income, health or life-result guarantees.
9. Do not overbuild AI in V1.
10. Keep logs clear enough for support.

---

## 23. Final team instruction

Build in this order:

```txt
1. Repo audit
2. Auth
3. Plans
4. Payment
5. Learning
6. Check-in
7. Email
8. Reports
9. Admin
10. QA
11. Launch
12. Monitor
```

The first live product must prove only five things:

1. A visitor can register.
2. A user can pay.
3. A paid user can learn today’s lesson.
4. A paid user can check in.
5. The system can email and report automatically.

Everything else expands after this foundation is stable.

---

## 24. Official technical references for team

Use these official references while implementing. Check current docs before final production because provider behavior can change.

1. Stripe Billing subscriptions and webhooks.
2. PayPal REST APIs and Subscriptions API.
3. Supabase Auth, Magic Link and Google login.
4. Resend or email provider webhook documentation if `email.iai.one` uses Resend behind the scenes.
5. Cloudflare Pages Functions and Workers Cron Triggers if deploying API and automation on Cloudflare.
6. VietQR or selected Vietnam QR payment provider documentation if QR payment is automated.

---

## 25. Production lock

This document is the execution layer. The strategic layer remains:

```txt
/docs/NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
```

This document should be added as:

```txt
/docs/NGUYENLANANH_TEAM_DEV_EXECUTION_PLAN_2026.md
```

Required PR title:

```txt
docs: add nguyenlananh team dev execution plan 2026
```

Required PR labels:

```txt
docs
product
education-system
payment
email-automation
learning-engine
launch-readiness
```

Required PR checklist:

```txt
[ ] Added master dev execution plan
[ ] Linked from README
[ ] Linked from MASTER_PROJECT_INDEX if available
[ ] Linked from CANONICAL_DOCS_INDEX if available
[ ] Added follow-up GitHub issues
[ ] No secrets included
[ ] Team reviewed build order
[ ] Founder reviewed product scope
```

End of document.
