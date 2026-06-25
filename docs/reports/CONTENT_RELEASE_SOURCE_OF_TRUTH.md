# Source of Truth Lock — 10×10×10 Release

**Date**: 2026-06-24 15:17 UTC
**Status**: LOCKED

## Repository

| Field | Value |
|---|---|
| Repo URL | `git@github.com:tranhatam-collab/nguyenlananh.com.git` |
| Branch | `main` |
| Local HEAD | `a170ca4efd2ee020a294234dc2b9cf8f5853de52` |
| Remote HEAD | `a170ca4efd2ee020a294234dc2b9cf8f5853de52` |
| Match | YES |
| Working tree | CLEAN (0 files changed) |

## Cloudflare

| Field | Value |
|---|---|
| Account ID | `62d57eaa548617aeecac766e5a1cb98e` |
| Pages project | `nguyenlananh-com` |
| D1 database | `nguyenlananh-payments-prod` |
| Custom domains | `www.nguyenlananh.com` (200), `nguyenlananh.com` (200), `admin.nguyenlananh.com` (200), `docs.nguyenlananh.com` (200) |

## D1 Tables (22)

```
_cf_KV, admin_audit_log, admin_member_snapshot_queue, admin_sessions,
admin_users, analytics_events, contact_submissions, email_jobs,
enrollment_progress, entitlements, idempotency_keys, magic_links,
member_progress, payment_orders, products, rate_limits, site_errors,
site_events, sqlite_sequence, users, vietqr_orders, webhook_events
```

## Current Content Inventory

| Type | Count |
|---|---|
| Public articles (`/bai-viet/`) | 73 existing |
| Member deep content (`/members/deep/`) | 12 existing |
| Member pro content (`/members/pro/`) | 8 existing |
| Products (`/products/`) | 5 existing |
| Sitemap URLs | 228 |

## Content Pack Location

| Pack | Path | Status |
|---|---|---|
| 10 Public Articles | `/Users/tranhatam/Downloads/NGUYENLANANH_10_PUBLIC_ARTICLES_FINAL_2026/` | **P0 BLOCKER — template content** |
| EDU System Spec | `/Users/tranhatam/Downloads/NGUYENLANANH_EDU_SYSTEM_DEV_SPEC_30_DAY_CONTENT_PACK_2026/` | Available |
| Auto Exam/Certificate | `/Users/tranhatam/Downloads/NGUYENLANANH_AUTO_EXAM_PRACTICE_VC_CERTIFICATE_SYSTEM_2026/` | Available |

## Critical Finding

**P0 — Content Quality**: 10 bài viết có 30 câu template xuất hiện trong tất cả 10 bài, chiếm 46.1% nội dung mỗi bài. Pairwise similarity 28-32% (gate: <25%). Nội dung là template fill-keyword, không phải bài viết thật. **Phải rewrite trước khi import.**

## Verdict

**RELEASE STATUS: HOLD** — pending content rewrite + learning platform build
