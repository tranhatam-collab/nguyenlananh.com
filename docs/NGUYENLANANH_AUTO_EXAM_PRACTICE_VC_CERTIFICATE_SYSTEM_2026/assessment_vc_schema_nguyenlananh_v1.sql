-- assessment_vc_schema_nguyenlananh_v1.sql
-- Project: nguyenlananh.com
-- Module: Auto Assessment, Practice, Grading and VC Certificate System
-- Version: 1.0
-- Date: 2026-04-25

-- NOTE:
-- This schema assumes existing profiles, plans, subscriptions, programs, lessons,
-- lesson_progress, checkins, reports and audit_logs tables exist.
-- Adjust uuid generation function based on the actual database environment.

create table if not exists assessment_templates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  program_id uuid,
  lesson_id uuid,
  type text not null check (type in (
    'placement',
    'lesson_quick_check',
    'read_back',
    'practice',
    'weekly',
    'monthly',
    'quarterly',
    'milestone_90_day',
    'milestone_120_day',
    'yearly',
    'three_year'
  )),
  title_vi text not null,
  title_en text,
  description_vi text,
  time_limit_minutes integer default 30,
  passing_score numeric default 70,
  max_certificate_counted_attempts_per_day integer default null,
  unlimited_retries boolean default true,
  access_level text default 'free',
  certificate_contribution boolean default false,
  status text default 'draft' check (status in ('draft','active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_template_id uuid not null references assessment_templates(id) on delete cascade,
  item_order integer not null,
  item_type text not null check (item_type in (
    'single_choice',
    'multiple_choice',
    'true_false',
    'short_answer',
    'long_answer',
    'read_back',
    'practice_upload',
    'checklist',
    'scale'
  )),
  question_vi text not null,
  question_en text,
  options_json jsonb,
  correct_answer_json jsonb,
  rubric_code text,
  points numeric default 1,
  required boolean default true,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists rubrics (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_vi text not null,
  description_vi text,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references rubrics(id) on delete cascade,
  criterion_order integer not null,
  name_vi text not null,
  description_vi text,
  weight numeric not null,
  min_score numeric default 0,
  max_score numeric default 100,
  auto_signal_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  assessment_template_id uuid not null references assessment_templates(id),
  lesson_id uuid,
  attempt_number integer not null default 1,
  status text default 'in_progress' check (status in (
    'in_progress',
    'submitted',
    'graded',
    'passed',
    'not_passed',
    'needs_review',
    'voided'
  )),
  started_at timestamptz default now(),
  submitted_at timestamptz,
  graded_at timestamptz,
  total_score numeric,
  passed boolean default false,
  is_best_verified_attempt boolean default false,
  certificate_counted boolean default false,
  time_spent_seconds integer,
  suspicious_flag boolean default false,
  suspicious_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references assessment_attempts(id) on delete cascade,
  item_id uuid not null references assessment_items(id),
  answer_json jsonb,
  answer_text text,
  attachment_url text,
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(attempt_id, item_id)
);

create table if not exists grading_results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references assessment_attempts(id) on delete cascade,
  answer_id uuid references assessment_answers(id) on delete cascade,
  grading_mode text not null check (grading_mode in (
    'deterministic',
    'rubric',
    'ai_assisted',
    'human_review'
  )),
  score numeric not null,
  max_score numeric default 100,
  passed boolean default false,
  feedback_vi text,
  feedback_en text,
  criteria_scores_json jsonb,
  ai_confidence numeric,
  grader_profile_id uuid,
  raw_grading_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists practice_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid,
  assessment_template_id uuid references assessment_templates(id),
  title text,
  body text,
  attachment_url text,
  status text default 'submitted' check (status in (
    'draft',
    'submitted',
    'graded',
    'passed',
    'not_passed',
    'needs_review',
    'archived'
  )),
  score numeric,
  feedback_vi text,
  retry_of_submission_id uuid references practice_submissions(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists certificate_definitions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name_vi text not null,
  name_en text,
  description_vi text,
  program_id uuid,
  eligibility_json jsonb not null,
  public_record_template_json jsonb,
  status text default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists issued_certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_definition_id uuid not null references certificate_definitions(id),
  profile_id uuid not null references profiles(id) on delete cascade,
  certificate_code text unique not null,
  status text default 'draft' check (status in (
    'draft',
    'eligible',
    'issued',
    'active',
    'revoked',
    'expired',
    'reissued'
  )),
  issue_date date,
  issued_at timestamptz,
  expires_at timestamptz,
  completion_rate numeric,
  assessment_score numeric,
  practice_evidence_score numeric,
  consistency_score numeric,
  final_score numeric,
  evidence_hash text,
  public_record_json jsonb,
  private_evidence_json jsonb,
  verification_url text,
  learner_consent_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  reissued_from_certificate_id uuid references issued_certificates(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists vc_sync_events (
  id uuid primary key default gen_random_uuid(),
  issued_certificate_id uuid not null references issued_certificates(id) on delete cascade,
  certificate_code text not null,
  action text not null check (action in ('create','update','revoke','reissue','verify')),
  status text default 'pending' check (status in ('pending','success','failed')),
  request_json jsonb,
  response_json jsonb,
  failure_reason text,
  synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists grading_disputes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  attempt_id uuid references assessment_attempts(id),
  practice_submission_id uuid references practice_submissions(id),
  issued_certificate_id uuid references issued_certificates(id),
  reason text not null,
  status text default 'submitted' check (status in (
    'submitted',
    'reviewing',
    'resolved',
    'declined',
    'cancelled'
  )),
  admin_notes text,
  resolved_by_profile_id uuid,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists anti_abuse_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  severity text default 'low' check (severity in ('low','medium','high')),
  reason text,
  raw_json jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_assessment_templates_program on assessment_templates(program_id);
create index if not exists idx_assessment_templates_lesson on assessment_templates(lesson_id);
create index if not exists idx_assessment_attempts_profile on assessment_attempts(profile_id);
create index if not exists idx_assessment_attempts_template on assessment_attempts(assessment_template_id);
create index if not exists idx_assessment_attempts_status on assessment_attempts(status);
create index if not exists idx_practice_submissions_profile on practice_submissions(profile_id);
create index if not exists idx_issued_certificates_profile on issued_certificates(profile_id);
create index if not exists idx_issued_certificates_code on issued_certificates(certificate_code);
create index if not exists idx_vc_sync_events_certificate on vc_sync_events(issued_certificate_id);
