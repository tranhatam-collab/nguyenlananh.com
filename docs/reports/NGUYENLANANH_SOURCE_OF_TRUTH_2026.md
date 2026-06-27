# NGUYENLANANH.COM — SOURCE OF TRUTH

Audit date: 2026-06-27
Verified by: Cascade AI
Repository: tranhatam-collab/nguyenlananh.com
Branch: main
Commit: 5bebfa8 (HEAD -> main, origin/main)
Commit message: docs(sot): mark Resend verification complete with test email success
Working tree: clean
Git remote: git@github.com:tranhatam-collab/nguyenlananh.com.git

## Cloudflare
- Account ID: 62d57eaa548617aeecac766e5a1cb98e
- Pages project name: nguyenlananh-com
- Custom domain: nguyenlananh.com (www.nguyenlananh.com)
- D1 binding: PAYMENTS_DB
- D1 database name: nguyenlananh-payments-prod (per wrangler.toml)
- D1 database ID: 16dfc26d-ed33-4dc1-a349-6e216860ae05
- Mail API base: https://api.mail.iai.one/v1
- Fallback email provider: Resend (temporary)
- Provider selection: auto-detected by code based on available secrets. If `EMAIL_PROVIDER` is unset and both `MAIL_API_KEY` and `RESEND_API_KEY` exist, code tries `mail_iai_one` first and falls back to Resend if the primary send fails.
- Resend setup guide: docs/RESEND_SETUP_GUIDE.md
- User email onboarding guide: docs/USER_EMAIL_ONBOARDING_GUIDE.md

## Production Domain
- Primary: https://www.nguyenlananh.com/
- Redirect: https://nguyenlananh.com/ → https://www.nguyenlananh.com/
- Verified: homepage returns HTTP 200

## Deployment
- Source of truth branch: main
- Production deployment preview: https://5eed9da9.nguyenlananh-com-63s.pages.dev (canonical: https://www.nguyenlananh.com/)
- Last verified commit: 5bebfa8
- Email migration commit: 94af663 (feat(email): complete product templates, login_url instead of magic_link, payment notifications, Resend-ready config)
- Previous commits in this audit: 2c98cff (baseline), dfdbac1 (price fix), 876822a (smoke test fix), a9d6272 (audit docs), 51ae2f3 (payment fix), aa031a1 (SOT update), f5cd30ab (Phase 2 audit report), c83bb27 (SOT update), fa4a991 (SEO fix), a07590e (SOT update), 76e89ab (final report), aa6a345 (SOT update), 51e8cdd (final SOT lock), 4ddbd37 (email migration), 94af663 (email binding fix), a6c384e (provider selection fix), a68f3da (admin email test endpoint), c5c8231 (x-admin-key auth for test), 5d8a35b (EN homepage CSS fix), b44b1e7 (ADMIN_TEST_EMAIL_KEY + clearer invalid-key error), 5bebfa8 (Resend verification SOT update)

## Superseded Documents
- Any older audit or deployment note referencing a different project, database, or account is marked SUPERSEDED and no longer source of truth.

## Verification Commands Run
```bash
git status           # clean (after SOT commit)
git branch --show-current   # main
git log -1 --oneline        # 5bebfa8...
```

## Status: RESEND VERIFIED + GIT SYNC FIXED + EN CSS FIXED
`origin/main` is now in sync with local HEAD (`5bebfa8`). The English homepage (`/en/`) loads `/assets/site.css` correctly. Resend fallback test email sent successfully from production:
- Endpoint: `POST /api/admin/email/test`
- Provider: `resend`
- Status: `sent`
- Provider message ID: `09772e91-3ce2-4e5d-a9b7-0b7bc81dcda0`
- Admin test key secret: `ADMIN_TEST_EMAIL_KEY`

## Codex Verification Note — 2026-06-27
- Production Pages latest deployment checked with Cloudflare account `62d57eaa548617aeecac766e5a1cb98e`: deployment `5eed9da9-076c-47e1-8900-d0f9e6d7e2b1`, source `5bebfa8`.
- Production secret names include `ADMIN_TEST_EMAIL_KEY`, `MAIL_API_KEY`, and `RESEND_API_KEY`; `EMAIL_PROVIDER` is not currently listed.
- `POST /api/admin/email/test` is protected: no auth returns `401 ADMIN_SESSION_REQUIRED`, invalid `x-admin-key` returns `403 ADMIN_KEY_INVALID`.
- D1 `site_events` shows one successful production request to `/api/admin/email/test` at `2026-06-27T11:20:55.103Z` with status `200`.
- The direct admin email test endpoint returns the provider message ID in its HTTP response; it does not persist that provider message ID to `email_jobs`.
