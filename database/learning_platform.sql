-- Learning Platform schema for Cloudflare D1
-- Assessments, exams, rubrics, practice submissions, reports, certifications
-- Apply with: wrangler d1 execute nguyenlananh-db --file=./database/learning_platform.sql --remote

-- ============================================================
-- content_access: entitlement tracking (which user can access which product)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_access (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  expires_at TEXT,
  source TEXT NOT NULL DEFAULT 'purchase',
  order_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, plan_code),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_content_access_user
  ON content_access(user_id, plan_code);

CREATE INDEX IF NOT EXISTS idx_content_access_slug
  ON content_access(content_slug);

-- ============================================================
-- assessment_definitions: question banks for assessments/tests
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_definitions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'assessment',
  description TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ============================================================
-- assessment_questions: individual questions in an assessment
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  id TEXT PRIMARY KEY,
  assessment_slug TEXT NOT NULL,
  question_index INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options_json TEXT,
  correct_answer TEXT,
  explanation TEXT,
  category TEXT,
  weight REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (assessment_slug) REFERENCES assessment_definitions(slug)
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_slug
  ON assessment_questions(assessment_slug, question_index);

-- ============================================================
-- assessment_attempts: user attempts at an assessment
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  assessment_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER,
  max_score INTEGER,
  percentage INTEGER,
  passed INTEGER NOT NULL DEFAULT 0,
  answers_json TEXT,
  result_json TEXT,
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user
  ON assessment_attempts(user_id, assessment_slug, created_at DESC);

-- ============================================================
-- practice_submissions: user-submitted practice work (evidence)
-- ============================================================
CREATE TABLE IF NOT EXISTS practice_submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  exercise_slug TEXT,
  submission_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  reviewed_by TEXT,
  review_score INTEGER,
  review_notes TEXT,
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_practice_submissions_user
  ON practice_submissions(user_id, lesson_slug, created_at DESC);

-- ============================================================
-- checkins: daily/weekly check-in for program tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  mood INTEGER,
  energy INTEGER,
  notes TEXT,
  completed_actions_json TEXT,
  checkin_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, program_slug, day_number),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_checkins_user_program
  ON checkins(user_id, program_slug, day_number);

-- ============================================================
-- exam_definitions: final exams for programs/certifications
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_definitions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  program_slug TEXT NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'final',
  question_count INTEGER NOT NULL DEFAULT 0,
  passing_score INTEGER NOT NULL DEFAULT 70,
  duration_minutes INTEGER,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ============================================================
-- exam_attempts: user attempts at an exam
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exam_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER,
  max_score INTEGER,
  percentage INTEGER,
  passed INTEGER NOT NULL DEFAULT 0,
  answers_json TEXT,
  started_at TEXT NOT NULL,
  submitted_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user
  ON exam_attempts(user_id, exam_slug, created_at DESC);

-- ============================================================
-- rubric_definitions: scoring rubrics for practice/exam evaluation
-- ============================================================
CREATE TABLE IF NOT EXISTS rubric_definitions (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  criteria_json TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ============================================================
-- rubric_scores: individual rubric scores for a submission/exam
-- ============================================================
CREATE TABLE IF NOT EXISTS rubric_scores (
  id TEXT PRIMARY KEY,
  rubric_slug TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'practice',
  target_id TEXT NOT NULL,
  criterion_key TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  reviewer_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (rubric_slug) REFERENCES rubric_definitions(slug)
);

CREATE INDEX IF NOT EXISTS idx_rubric_scores_target
  ON rubric_scores(target_type, target_id);

-- ============================================================
-- learning_reports: generated reports for users
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'assessment',
  source_slug TEXT NOT NULL,
  attempt_id TEXT,
  report_html TEXT,
  report_json TEXT,
  summary TEXT,
  recommendations_json TEXT,
  generated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_learning_reports_user
  ON learning_reports(user_id, report_type, created_at DESC);

-- ============================================================
-- certifications: issued certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cert_slug TEXT NOT NULL,
  cert_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued',
  issued_at TEXT NOT NULL,
  expires_at TEXT,
  revocable INTEGER NOT NULL DEFAULT 1,
  revoked_at TEXT,
  revoke_reason TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_certifications_user
  ON certifications(user_id, cert_slug);

CREATE INDEX IF NOT EXISTS idx_certifications_number
  ON certifications(cert_number);

-- ============================================================
-- certification_reviews: review records for cert issuance
-- ============================================================
CREATE TABLE IF NOT EXISTS certification_reviews (
  id TEXT PRIMARY KEY,
  certification_id TEXT NOT NULL,
  reviewer_id TEXT,
  review_type TEXT NOT NULL DEFAULT 'auto',
  decision TEXT NOT NULL DEFAULT 'approved',
  notes TEXT,
  evidence_json TEXT,
  reviewed_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (certification_id) REFERENCES certifications(id)
);

CREATE INDEX IF NOT EXISTS idx_cert_reviews_cert
  ON certification_reviews(certification_id);

-- ============================================================
-- lesson_progress: track per-lesson completion for academy
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  self_assessment_score INTEGER,
  self_assessment_answers_json TEXT,
  practice_submitted INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, lesson_slug),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
  ON lesson_progress(user_id, status, updated_at DESC);
