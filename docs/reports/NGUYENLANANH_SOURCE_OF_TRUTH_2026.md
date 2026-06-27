# NGUYENLANANH.COM — SOURCE OF TRUTH

Audit date: 2026-06-27
Verified by: Cascade AI
Repository: tranhatam-collab/nguyenlananh.com
Branch: main
Commit: 94af663 (HEAD -> main)
Commit message: fix(email): remove EMAIL_PROVIDER from wrangler.toml to avoid binding conflict; rely on auto-detection by secret
Working tree: clean
Git remote: git@github.com:tranhatam-collab/nguyenlananh.com.git

## Cloudflare
- Account ID: 62d57eaa548617aeecac766e5a1cb98e
- Pages project name: nguyenlananh-com
- Custom domain: nguyenlananh.com (www.nguyenlananh.com)
- D1 binding: PAYMENTS_DB
- D1 database name: nguyenlananh-payments-prod (per wrangler.toml)
- D1 database ID: 16dfc26d-ed33-4dc1-a349-6e216860ae05
- Mail API base: https://api.mail.iai.one/v1 (primary, currently unavailable)
- Fallback email provider: Resend (temporary)
- Provider selection: auto-detected by code based on available secrets (MAIL_API_KEY or RESEND_API_KEY)
- Resend setup guide: docs/RESEND_SETUP_GUIDE.md
- User email onboarding guide: docs/USER_EMAIL_ONBOARDING_GUIDE.md

## Production Domain
- Primary: https://www.nguyenlananh.com/
- Redirect: https://nguyenlananh.com/ → https://www.nguyenlananh.com/
- Verified: homepage returns HTTP 200

## Deployment
- Source of truth branch: main
- Production deployment preview: https://950de60a.nguyenlananh-com-63s.pages.dev
- Production domain: https://www.nguyenlananh.com/
- Last verified commit: 94af663
- Email migration commit: 94af663 (feat(email): complete product templates, login_url instead of magic_link, payment notifications, Resend-ready config)
- Previous commits in this audit: 2c98cff (baseline), dfdbac1 (price fix), 876822a (smoke test fix), a9d6272 (audit docs), 51ae2f3 (payment fix), aa031a1 (SOT update), f5cd30ab (Phase 2 audit report), c83bb27 (SOT update), fa4a991 (SEO fix), a07590e (SOT update), 76e89ab (final report), aa6a345 (SOT update), 51e8cdd (final SOT lock), 4ddbd37 (email migration), 94af663 (email binding fix)

## Superseded Documents
- Any older audit or deployment note referencing a different project, database, or account is marked SUPERSEDED and no longer source of truth.

## Verification Commands Run
```bash
git status           # clean (after SOT commit)
git branch --show-current   # main
git log -1 --oneline        # 94af663...
```

## Status: EMAIL MIGRATION IN PROGRESS
Primary mail service (api.mail.iai.one) is currently unavailable. Resend is configured as a temporary fallback once the `RESEND_API_KEY` secret is added. All product-specific and user notification email templates are complete and deployed. See docs/RESEND_SETUP_GUIDE.md for next steps.
