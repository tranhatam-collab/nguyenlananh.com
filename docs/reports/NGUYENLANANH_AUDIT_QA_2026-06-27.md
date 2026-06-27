# NGUYENLANANH.COM — Audit QA Report

**Date:** 2026-06-27
**Auditor:** Cascade AI
**Repository:** tranhatam-collab/nguyenlananh.com
**Branch:** main
**Source-of-truth commit:** 876822a
**Production domain:** https://www.nguyenlananh.com/

---

## 1. Phase 0 — Source of Truth (LOCKED)

| Item | Verified | Evidence |
|------|----------|----------|
| Repository | ✅ | `tranhatam-collab/nguyenlananh.com` |
| Branch | ✅ | `main` |
| Latest commit | ✅ | `876822a` |
| Working tree | ✅ | clean after commit |
| Cloudflare account | ✅ | `62d57eaa...` from `wrangler.toml` |
| Pages project | ✅ | `nguyenlananh-com` |
| D1 database | ✅ | `nguyenlananh-payments` (`16dfc26d...`) |
| Custom domain | ✅ | `www.nguyenlananh.com` live |
| Mail API | ✅ | `api.mail.iai.one` (VPS external issue noted) |

Source of truth file: `docs/reports/NGUYENLANANH_SOURCE_OF_TRUTH_2026.md`

---

## 2. Phase 1 — Baseline & Inventory

| Category | Count |
|----------|-------|
| Total HTML files | 430 |
| Internal links checked | 12,167 |
| VI articles | 87 |
| EN articles | 74 |
| VI/EN paired | 74 |
| VI-only | 13 |

Scripts run:
- `scripts/validate-prices.mjs` → PASS
- `scripts/check-broken-links.mjs` → PASS
- `scripts/build-content-stats.mjs` → generated `assets/content-stats.json`
- `scripts/smoke-production.sh` → 7/7 PASS

---

## 3. Phase 2 — P0 Truth Fixes

### 3.1 Price registry locked

**Issue:** English article CTA stated "Start from 3 USD" while source registry (`functions/_lib/constants.js`) defines `year1` at `2 USD`.

**File:** `en/bai-viet/dieu-tre-em-can-khong-chi-la-day-dung/index.html:112`

**Fix:** Changed to "Start from 2 USD".

**Verification:**
- `node scripts/validate-prices.mjs --fail` → PASS
- Live check: `curl https://www.nguyenlananh.com/en/bai-viet/dieu-tre-em-can-khong-chi-la-day-dung/ | grep "Start from"` → `Start from 2 USD`

**Status:** ✅ FIXED

### 3.2 Unverified claims

Searched the entire repository for:
- `500+` / `500 đang đồng hành` → **not found** in any HTML/JS/CSS
- `đang cập nhật bản xác thực` / `bản xác thực` → **not found** in any HTML/JS/CSS

**Status:** ⚠️ CHƯA XÁC MINH — these claims do not exist in current source. If they appear in production, they must be rendered dynamically or injected outside the repository.

### 3.3 Footer copyright

**Status:** ✅ ĐÃ XÁC MINH — footer displays `© 2026` on both VI and EN homepages.

Some member/admin pages omit the full copyright footer; this is acceptable for private/admin routes but should be normalized for public member pages.

### 3.4 Language / brand lock

Brand name in source:
- VI: `Nguyễn Lan Anh`
- EN: `Nguyen Lan Anh` / `Lan Anh Nguyen` (footer)

No mixed-language brand name detected on homepage.

---

## 4. Phase 3 — Auth & Session

**Discovery:** Magic link form and endpoint were removed by design in commit `8c93caae`. Google OAuth is now the sole auth method.

**Smoke test updated:** `scripts/smoke-production.sh`
- `/admin/` → expects `302` (redirect when unauthenticated)
- Removed `/api/auth/magic-links/request` test
- `/api/auth/google/start` → `302`

**Payment API:** `POST /api/payments/vietqr/create-order` now requires Turnstile token (returns `TURNSTILE_FAILED` without frontend token). This is expected behavior.

---

## 5. Phase 20 — Live Verification

Verified from public network:

| Route | HTTP | Status |
|-------|------|--------|
| / | 200 | ✅ |
| /en/ | 200 | ✅ |
| /members/ | 200 | ✅ |
| /admin/ | 302 | ✅ (unauthenticated redirect) |
| /api/auth/session | 401 | ✅ |
| /api/auth/logout | 200 | ✅ |
| /api/auth/google/start | 302 | ✅ |
| /en/bai-viet/dieu-tre-em-can-khong-chi-la-day-dung/ | 200 | ✅ price fixed |

---

## 6. Open Issues

| ID | Priority | Area | Description | Owner | Status |
|----|----------|------|-------------|-------|--------|
| AUD-001 | P0 | Content | Unverified claims "500+" / "đang cập nhật bản xác thực" — not found in source; need Founder confirmation | Founder | CHƯA XÁC MINH |
| AUD-002 | P2 | SEO | 66 VI + 74 EN articles marked "under-standard" in content stats | Content team | BACKLOG |
| AUD-003 | P2 | SEO | 3 VI articles missing metadata | Content team | BACKLOG |
| AUD-004 | P2 | DevEx | Module type warning when importing `functions/_lib/constants.js` | Dev | BACKLOG |
| AUD-005 | P2 | UX | Some public member pages lack full copyright footer | Dev | BACKLOG |

---

## 7. Release Verdict

**Current verdict: HOLD**

Reason: A full master-command audit covers 20 phases and many gates. In this first pass we have:
- ✅ Locked source of truth
- ✅ Fixed P0 price mismatch
- ✅ Updated smoke tests to match production
- ✅ Verified no broken links and price consistency
- ⚠️ Not yet completed: full responsive screenshots, full SEO audit, full accessibility audit, full security scan, full payment flow end-to-end, full D1 integrity audit, full email delivery verification

The site is NOT declared 100% complete. The next audit loop must cover the remaining gates before GO verdict.

---

## 8. Evidence

- `docs/reports/NGUYENLANANH_SOURCE_OF_TRUTH_2026.md`
- `assets/content-stats.json`
- `scripts/smoke-production.sh` (updated)
- Git commit: `dfdbac1` (price fix), `876822a` (smoke test fix)
