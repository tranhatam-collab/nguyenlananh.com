-- Migration: Add role column to users table for admin role gate (P1-3)
-- Applied: 2026-05-28
-- Target: nguyenlananh-payments-prod (D1)
-- Note: membership_label, preferred_language, active already existed on production
-- Only role column was missing

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
