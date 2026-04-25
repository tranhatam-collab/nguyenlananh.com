-- supabase_schema_nguyenlananh_edu_v1.sql
-- Project: NGUYENLANANH_GUIDED_JOURNEY_OS
-- Apply in Supabase SQL editor or migrations. Review before production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  locale text default 'vi',
  timezone text default 'Asia/Ho_Chi_Minh',
  role text default 'member' check (role in ('member','editor','admin','owner')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  starting_point text,
  current_loop text,
  desired_change text,
  daily_time_budget text,
  practice_preference text,
  readiness_score int check (readiness_score between 1 and 5),
  profile_completed boolean default false,
  completed_at timestamptz,
  answers jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  stage text not null,
  tier_order int not null,
  access_level int not null,
  status text default 'private' check (status in ('live','private','invite_only','application','archived')),
  weekly_usd numeric(10,2),
  monthly_usd numeric(10,2),
  annual_usd numeric(10,2),
  launch_annual_usd numeric(10,2),
  stripe_price_weekly text,
  stripe_price_monthly text,
  stripe_price_annual text,
  paypal_plan_weekly text,
  paypal_plan_monthly text,
  paypal_plan_annual text,
  features jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.plans(id),
  provider text not null check (provider in ('stripe','paypal','vietqr','manual','free')),
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'incomplete' check (status in ('free','trialing','active','past_due','cancelled','expired','incomplete','pending')),
  billing_interval text check (billing_interval in ('free','weekly','monthly','annual','custom')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text references public.plans(id),
  provider text not null check (provider in ('stripe','paypal','vietqr','manual')),
  order_code text unique not null,
  amount_usd numeric(10,2),
  amount_vnd numeric(14,0),
  currency text not null default 'USD',
  transfer_content text,
  status text default 'pending' check (status in ('pending','paid','failed','expired','cancelled','refunded')),
  provider_session_id text,
  provider_payment_id text,
  qr_image_url text,
  expires_at timestamptz,
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  order_id uuid references public.payment_orders(id) on delete set null,
  provider text not null,
  provider_event_id text,
  amount numeric(12,2),
  currency text,
  status text not null check (status in ('succeeded','pending','failed','refunded','disputed')),
  raw_event jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('article','lesson','page','email')),
  status text default 'draft' check (status in ('draft','review','published','archived')),
  language text default 'vi' check (language in ('vi','en')),
  title text not null,
  slug text not null,
  seo_title text,
  seo_description text,
  excerpt text,
  body_md text,
  image_asset_id uuid,
  canonical_url text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(language, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  day_number int not null,
  stage text not null,
  path text not null,
  min_access_level int default 0,
  unlock_after_days int default 0,
  practice_minutes int default 10,
  checkin_required boolean default true,
  related_slugs text[] default array[]::text[],
  image_prompt text,
  image_alt_vi text,
  email_subject text,
  email_preview text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(day_number, path)
);

create table if not exists public.journey_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journey_key text not null default 'core_90',
  start_date date default current_date,
  current_day int default 1,
  status text default 'active' check (status in ('active','paused','completed','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, journey_key)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text default 'not_started' check (status in ('not_started','opened','completed','skipped')),
  opened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  checkin_type text default 'daily' check (checkin_type in ('daily','weekly','monthly','reentry')),
  mood_score int check (mood_score between 1 and 5),
  energy_score int check (energy_score between 1 and 5),
  practice_minutes int,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.email_templates (
  id text primary key,
  language text default 'vi' check (language in ('vi','en')),
  name text not null,
  subject text not null,
  preview text,
  body_md text not null,
  event_key text not null,
  status text default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  template_id text references public.email_templates(id),
  event_key text not null,
  provider text,
  provider_message_id text,
  status text default 'queued' check (status in ('queued','sent','delivered','opened','clicked','bounced','failed','cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  error_message text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_key text not null,
  status text default 'pending' check (status in ('pending','running','succeeded','failed','cancelled')),
  run_at timestamptz not null default now(),
  locked_at timestamptz,
  attempts int default 0,
  max_attempts int default 3,
  payload jsonb default '{}'::jsonb,
  result jsonb default '{}'::jsonb,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  type text default 'image' check (type in ('image','audio','video','document')),
  title text,
  alt_text text,
  storage_url text not null,
  prompt text,
  credit text,
  license text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_key text not null,
  properties jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

insert into public.plans (id, name, stage, tier_order, access_level, status, weekly_usd, monthly_usd, annual_usd, launch_annual_usd, features)
values
('free', 'Free Member', 'entry', 0, 0, 'live', null, 0, 0, 0, '["Magic link", "Profile", "Day 1-3 preview"]'),
('start', 'START', 'thuc_tinh', 1, 1, 'live', 7, 19, 190, 152, '["30-day journey", "Daily check-in", "Basic reminders"]'),
('foundation', 'FOUNDATION', 'thuc_tinh', 2, 2, 'live', 14, 39, 390, 312, '["90-day core journey", "Weekly report", "Practice library"]'),
('discipline', 'DISCIPLINE', 'thuc_tinh', 3, 3, 'live', 21, 59, 590, 472, '["90-day journey", "Deep discipline track", "Advanced weekly review"]'),
('rebuild', 'REBUILD', 'xay_lai', 4, 4, 'private', 35, 99, 990, 792, '["Rebuild modules", "Environment reset", "Monthly review"]'),
('inner_master', 'INNER MASTER', 'xay_lai', 5, 5, 'private', 49, 149, 1490, 1192, '["Deep inner map", "Pattern library", "Extended practices"]'),
('creator', 'CREATOR', 'xay_lai', 6, 6, 'private', 63, 199, 1990, 1592, '["Creative output path", "Project practices", "Value creation"]'),
('mentor', 'MENTOR', 'mo_rong', 7, 7, 'invite_only', null, 299, 2990, 2392, '["Mentor path", "Group review", "Small cohort"]'),
('pro_group', 'PRO GROUP', 'mo_rong', 8, 8, 'invite_only', null, 499, 4990, 3992, '["Pro group", "Cohort dashboard", "Private sessions"]'),
('inner_circle', 'INNER CIRCLE', 'mo_rong', 9, 9, 'application', null, null, null, null, '["Application only", "1:1 or private circle"]')
on conflict (id) do update set
  name = excluded.name,
  stage = excluded.stage,
  tier_order = excluded.tier_order,
  access_level = excluded.access_level,
  status = excluded.status,
  weekly_usd = excluded.weekly_usd,
  monthly_usd = excluded.monthly_usd,
  annual_usd = excluded.annual_usd,
  launch_annual_usd = excluded.launch_annual_usd,
  features = excluded.features,
  updated_at = now();

create index if not exists idx_subscriptions_user_status on public.subscriptions(user_id, status);
create index if not exists idx_lessons_day_access on public.lessons(day_number, min_access_level);
create index if not exists idx_checkins_user_created on public.checkins(user_id, created_at desc);
create index if not exists idx_email_events_status_schedule on public.email_events(status, scheduled_at);
create index if not exists idx_user_events_key_created on public.user_events(event_key, created_at desc);

alter table public.profiles enable row level security;
alter table public.member_profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.checkins enable row level security;
alter table public.user_events enable row level security;
alter table public.content_items enable row level security;
alter table public.plans enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "member_profiles_select_own" on public.member_profiles for select using (auth.uid() = user_id);
create policy "member_profiles_insert_own" on public.member_profiles for insert with check (auth.uid() = user_id);
create policy "member_profiles_update_own" on public.member_profiles for update using (auth.uid() = user_id);

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "payment_orders_select_own" on public.payment_orders for select using (auth.uid() = user_id);
create policy "payment_orders_insert_own" on public.payment_orders for insert with check (auth.uid() = user_id);

create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "lesson_progress_update_own" on public.lesson_progress for update using (auth.uid() = user_id);

create policy "checkins_select_own" on public.checkins for select using (auth.uid() = user_id);
create policy "checkins_insert_own" on public.checkins for insert with check (auth.uid() = user_id);

create policy "user_events_insert_own" on public.user_events for insert with check (auth.uid() = user_id);
create policy "user_events_select_own" on public.user_events for select using (auth.uid() = user_id);

create policy "content_public_read_published" on public.content_items for select using (status = 'published');
create policy "plans_public_read_live" on public.plans for select using (status in ('live','application'));

-- Admin policies should be implemented with JWT custom claims or security definer functions.
