# NGUYENLANANH.COM — Audit QA Report Phase 2

**Date:** 2026-06-27
**Auditor:** Cascade AI
**Repository:** tranhatam-collab/nguyenlananh.com
**Branch:** main
**Commit:** aa031a1
**Production domain:** https://www.nguyenlananh.com/

---

## 1. Phase 2 — Security Audit

### 1.1 HTTP Security Headers

Verified live headers on `https://www.nguyenlananh.com/`:

| Header | Value | Status |
|--------|-------|--------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | ✅ |
| Content-Security-Policy | `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; upgrade-insecure-requests` | ✅ |
| X-Frame-Options | `DENY` | ✅ |
| X-Content-Type-Options | `nosniff` | ✅ |
| Referrer-Policy | `strict-origin-when-cross-origin` | ✅ |
| Permissions-Policy | `geolocation=(), microphone=(), camera=()` | ✅ |
| Cross-Origin-Opener-Policy | `same-origin` | ✅ (via _headers) |
| Cross-Origin-Resource-Policy | `same-origin` | ✅ (via _headers) |

### 1.2 Static config (`_headers`)

- `/docs/*` correctly blocked with `X-Robots-Tag: noindex, nofollow`.
- Cache rules split correctly for HTML (revalidate) and assets (stale-while-revalidate).

### 1.3 Secret scan

- GitHub Advanced Security **not enabled** on repository → could not use native secret scanning.
- Manual grep scan across JS/HTML/TOML/JSON/SH/MD found **no hardcoded API keys, tokens, or passwords** in source.
- Session cookies (`__nla_session` and admin session) are **HttpOnly, Secure, SameSite=Lax, Domain=.nguyenlananh.com**.
- Admin session uses server-side token hash, revocable, with `Max-Age`.

### 1.4 OWASP findings

| ID | Risk | Finding | Status |
|----|------|---------|--------|
| SEC-001 | P1 | Admin payment confirmation endpoint falls back to a shared `x-admin-key` (`PAYMENTS_ADMIN_KEY` / `ADMIN_PAYMENT_CONFIRM_KEY`). If leaked, an attacker can confirm payments. | OPEN |
| SEC-002 | P2 | Magic links table still exists in D1 and code still references it in `db.js`, though magic-link auth was removed by design. Dead data. | OPEN |
| SEC-003 | P2 | Payment creation endpoint is protected by Turnstile token (good), but cannot be fully tested from CLI. | OPEN |

---

## 2. Phase 3 — SEO Full-Site Audit

Ran `scripts/seo-audit.mjs` over 430 HTML files.

### 2.1 Results

| Check | Count | Public pages affected |
|-------|-------|---------------------|
| Missing hreflang | 74 | 63 |
| Missing Open Graph | 41 | 37 |
| Missing description | 8 | 3 |
| Missing canonical | 6 | 2 |
| Missing schema (JSON-LD) | 257 | mostly admin/template |
| Duplicate titles | 14 | mostly VI/EN academy pairs |

### 2.2 Public pages missing hreflang (sample)

- `assessments/avoidance-map/index.html`
- `assessments/personal-capital/index.html`
- `certification/index.html`
- `creators/apply/index.html`
- `members/academy/37-day-project-charter/index.html`
- `bai-viet/ban-do-he-thong-doi-song-ca-nhan/index.html`

Full list: `docs/reports/NGUYENLANANH_SEO_AUDIT.csv`

### 2.3 Robots / Sitemap

- `robots.txt`: present, allows `/`, points to sitemap.
- `sitemap.xml`: present, 200+ URLs.

---

## 3. Phase 4 — Accessibility (WCAG 2.2 AA) — Source Review

Ran `scripts/a11y-audit.mjs` over 430 HTML files.

### 3.1 Results

| Check | Count | Notes |
|-------|-------|-------|
| Missing skip link | 8 | 404, admin/login, PDF guides, verify-2fa |
| Missing `h1` | 3 | likely false positives due to `<br>` inside `h1` |
| Inputs without label | 41 | mostly admin search/filter inputs and assessments |

### 3.2 Positive findings

- `aria-label` present on navigation and mobile drawer.
- `skip` link present on most pages.
- `role="main"`, `role="banner"`, `role="dialog"` used.
- `alt` text present on most content images.

### 3.3 Limitations

- No automated color-contrast scan.
- No keyboard-focus order verification.
- No screen-reader test.

---

## 4. Phase 5 — Payment End-to-End (VietQR + Entitlement)

### 4.1 Code review

- `createVietQrOrderResponse` → creates `payment_orders` + `vietqr_orders` with unique `transfer_note`.
- `confirmVietQrOrderResponse` → requires `payments.confirm` permission; calls `finalizeProviderPayment`.
- `fulfillOrder` →
  - Core membership: upserts `users` with `membership_type` and `expires_at`.
  - Premium products: keeps membership, grants `content_access`.
  - Micro products: creates user with `micro_purchase` but does NOT grant `content_access`.
  - Sends receipt + product welcome + welcome emails.

### 4.2 P0 fix applied

**Issue:** Fulfillment emails contained a magic link, but magic-link authentication was removed by design. Users who paid would receive a broken login link.

**Fix:** `functions/_lib/payments.js` now builds a Google OAuth join/login URL instead of a magic link.

- `issueMagicLink` removed.
- `buildLoginUrl` added.
- `sendFulfillmentEmails` uses `login_url` instead of `magic_link`.
- `consumeMagicLinkResponse` now returns `410 MAGIC_LINK_DEPRECATED` with a redirect to `/join/`.

**Commit:** `51ae2f3`

### 4.3 Live test limitations

- `POST /api/payments/vietqr/create-order` requires a valid Turnstile token from the frontend.
- Full end-to-end payment (create order → QR → bank transfer → admin confirm → entitlement) must be run manually through the browser.
- 6 VietQR orders exist in production D1 backup: 3 pending, 2 confirmed, 1 awaiting_confirmation.

---

## 5. Phase 6 — Email Automation

- Mail provider: `api.mail.iai.one` (external VPS).
- **External blocker:** Mail VPS reported down. Cannot verify live email delivery.
- `email_jobs` table has 4 queued records in D1 backup.
- `queueAndSendEmail` uses deduplication by `dedupe_key`.

**Status:** Cannot fully verify without mail service restoration.

---

## 6. Phase 7 — D1 Schema & Data Integrity

### 6.1 Schema review

Reviewed:
- `database/payment_gateway_d1.sql`
- `database/admin_rbac.sql`
- `database/site_events.sql`
- `database/learning_platform.sql`

Findings:
- Foreign keys present where appropriate.
- Unique constraints on emails, order IDs, idempotency keys, event IDs, transfer notes.
- Indexes for common lookups.
- `admin_sessions` is revocable.
- `admin_audit_log` records every admin action.

### 6.2 Data integrity (from backup `backups/d1-prod-backup-20260623T013418Z.sql`)

| Table | Rows | Integrity note |
|-------|------|----------------|
| users | 4 | 0 duplicate emails |
| payment_orders | 64 | 0 duplicate idempotency keys |
| vietqr_orders | 6 | 3 pending, 2 confirmed, 1 awaiting_confirmation |
| webhook_events | 31 | - |
| idempotency_keys | 74 | - |
| email_jobs | 4 | - |
| magic_links | 7 | 7 expired unused tokens |

### 6.3 Issue

| ID | Priority | Finding |
|----|----------|---------|
| D1-001 | P2 | 7 expired unused magic links in `magic_links` table should be cleaned up. |

---

## 7. Phase 8 — Admin RBAC

### 7.1 Roles defined

- `super_admin` — all permissions
- `ops_manager` — dashboard, content view, members, payments, ops queue, audit, events
- `finance` — dashboard, content view, members view, payments view/confirm/refund
- `content_editor` — dashboard, content view/manage/image

### 7.2 Enforcement

- `requireAdminPermission` checks session + permission in `admin_auth.js`.
- Admin payment endpoints use `requireAdminPaymentAccess` which tries RBAC first, then falls back to shared key.
- Password hashing: PBKDF2, 100,000 iterations, random salt.

### 7.3 Issue

- Shared admin key fallback (SEC-001) weakens RBAC for payment confirmation.

---

## 8. Phase 1 — Responsive

### 8.1 Source review

- Viewport meta present on all pages.
- `site.css` has media queries at breakpoints:
  - `max-width: 640px`
  - `max-width: 919px`
  - `min-width: 720px`
  - `min-width: 920px`
  - `min-width: 900px`

### 8.2 Limitations

- No visual screenshots taken across 320px → 1920px due to lack of automated browser/screenshot tooling.
- Manual browser verification needed.

---

## 9. Open Issues

| ID | Priority | Area | Description | Status |
|----|----------|------|-------------|--------|
| AUD-001 | P0 | Content | Unverified claims "500+" / "bản xác thực" not found in source | OPEN |
| AUD-002 | P2 | SEO | 63 public pages missing hreflang | OPEN |
| AUD-003 | P2 | SEO | 37 public pages missing Open Graph | OPEN |
| AUD-004 | P2 | SEO | 3 public pages missing description | OPEN |
| AUD-005 | P2 | SEO | 2 public pages missing canonical | OPEN |
| AUD-006 | P2 | SEO | 66 VI + 74 EN articles under-standard | OPEN |
| AUD-007 | P2 | SEO | 3 VI articles missing metadata | OPEN |
| AUD-008 | P2 | A11y | Missing skip links on 404, admin/login, verify-2fa | OPEN |
| AUD-009 | P2 | A11y | 41 inputs without labels | OPEN |
| AUD-010 | P2 | A11y | No automated contrast/focus test | OPEN |
| AUD-011 | P1 | Security | Admin payment shared key fallback | OPEN |
| AUD-012 | P2 | Security | Dead magic_links table / expired rows | OPEN |
| AUD-013 | P2 | D1 | 7 expired unused magic links | OPEN |
| AUD-014 | P1 | Payment | Full VietQR end-to-end not verified due to Turnstile | OPEN |
| AUD-015 | P1 | Email | Email delivery not verified (mail VPS down) | OPEN |
| AUD-016 | P2 | UX | Responsive visual screenshots not produced | OPEN |

---

## 10. Release Verdict

**Current verdict: HOLD**

Reason: P0 payment fulfillment bug was fixed and deployed. However, multiple P0/P1 items remain unverified:
- Full payment end-to-end (blocked by Turnstile CLI limitation)
- Email delivery (blocked by external mail VPS downtime)
- Unverified claims need Founder confirmation
- Security shared-key fallback
- SEO hreflang/OG gaps on public pages
- Accessibility contrast and visual tests

The site is NOT declared 100% complete.

---

## 11. Evidence

- `docs/reports/NGUYENLANANH_SOURCE_OF_TRUTH_2026.md`
- `docs/reports/NGUYENLANANH_SEO_AUDIT.csv`
- `docs/reports/NGUYENLANANH_DUPLICATE_TITLES.json`
- `docs/reports/NGUYENLANANH_A11Y_AUDIT.csv`
- `scripts/seo-audit.mjs`
- `scripts/analyze-seo-csv.mjs`
- `scripts/a11y-audit.mjs`
- `scripts/smoke-production.sh`
- Git commit: `51ae2f3` (payment fix), `aa031a1` (source of truth update)
