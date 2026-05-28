-- Migration: Add membership_label, preferred_language, role, active columns to users table (P1-3)
-- Applied: 2026-05-28
-- Target: nguyenlananh-payments-prod (D1)

ALTER TABLE users ADD COLUMN membership_label TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'vi';
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
