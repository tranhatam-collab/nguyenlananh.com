-- Creator system schema
-- Run in D1 to enable creator applications, profiles, submissions and review workflow.

CREATE TABLE IF NOT EXISTS creator_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  social_links TEXT,
  specialties TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_profiles_user ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_status ON creator_profiles(status);

CREATE TABLE IF NOT EXISTS creator_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  motivation TEXT,
  sample_work_url TEXT,
  experience TEXT,
  consent_ip TEXT,
  consent_ua TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  review_note TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_creator_applications_status ON creator_applications(status);
CREATE INDEX IF NOT EXISTS idx_creator_applications_email ON creator_applications(email);

CREATE TABLE IF NOT EXISTS creator_submissions (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  content_json TEXT,
  attachments TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  reviewed_by TEXT,
  review_note TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_submissions_creator ON creator_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_submissions_status ON creator_submissions(status);
