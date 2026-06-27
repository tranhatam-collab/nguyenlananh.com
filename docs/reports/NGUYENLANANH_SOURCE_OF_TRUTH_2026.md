# NGUYENLANANH.COM — SOURCE OF TRUTH

Audit date: 2026-06-27
Verified by: Cascade AI
Repository: tranhatam-collab/nguyenlananh.com
Branch: main
Commit: f5cd30ab (HEAD -> main)
Commit message: docs(audit): add Phase 2 audit report (security, SEO, a11y, D1, payment, email, admin RBAC)
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

## Production Domain
- Primary: https://www.nguyenlananh.com/
- Redirect: https://nguyenlananh.com/ → https://www.nguyenlananh.com/
- Verified: homepage returns HTTP 200

## Deployment
- Source of truth branch: main
- Production deployment preview: https://4e3e408a.nguyenlananh-com-63s.pages.dev
- Production domain: https://www.nguyenlananh.com/
- Last verified commit: f5cd30ab
- Previous commits in this audit: 2c98cff (baseline), dfdbac1 (price fix), 876822a (smoke test fix), a9d6272 (audit docs), 51ae2f3 (payment fix), aa031a1 (SOT update)

## Superseded Documents
- Any older audit or deployment note referencing a different project, database, or account is marked SUPERSEDED and no longer source of truth.

## Verification Commands Run
```bash
git status           # clean
git branch --show-current   # main
git log -1 --oneline        # f5cd30ab...
```

## Status: BASELINE LOCKED
This file must be updated before any further source changes.
