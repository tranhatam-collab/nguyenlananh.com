# NGUYENLANANH_DEPLOY_RUNBOOK.md

Version: 1.0
Status: DEPLOY RUNBOOK
Domain: nguyenlananh.com

Purpose: A precise, repeatable deployment playbook for Nguyenlananh.com that aligns content, CMS, SEO and engineering workflow. Used to gate production deploys and ensure consistent, high-quality releases.

---

## 1. Overview
This runbook accompanies the NGUYENLANANH_MASTER_WEBSITE_SPEC.md and NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md. It translates strategy into concrete steps for the DEV, Content, SEO, and Ops teams. The goal is to deploy in a controlled, auditable manner with clear checkpoints and rollback.

---

## 2. Scope & Assumptions
- Scope: Deploy main site content, homepage redesign, SEO enhancements, CMS scaffolding, and publishing of prioritized posts according to the master specs.
- Assumptions:
  - Production environment is behind a staging gate; hotfixes independent of this runbook may bypass some steps.
  - All content is content-reviewed and approved by Content/Brand before go-live.
  - Access to CI/CD and GitHub is available to authorized personnel.

---

## 3. Branch & PR Strategy
- Branch naming: feature/deploy-nguyenlananh-<date> (e.g., feature/deploy-nguyenlananh-20260404)
- Base branch: main
- PR target: main (or as per your standard PR flow, e.g., staging/main)
- PR body: Use NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md as the source of truth; summarize changes and include links to related master specs.
- Approval gates: Content/Brand/SEO sign-off, followed by Dev review and, if applicable, deployment approval from Ops.

---

## 4. Pre-Deployment Checklist (Automatic gates in CI preferred)
- [ ] NGUYENLANANH_MASTER_WEBSITE_SPEC.md updated and approved
- [ ] NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md approved
- [ ] NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md aligned with this runbook
- [ ] All critical content migrated to CMS draft state and reviewed
- [ ] SEO assets prepared: sitemap, robots, meta, schema
- [ ] No sensitive data present in content/public files
- [ ]Production URL map validated (redirects in place)
- [ ] Build script available (if using a framework) and passes locally
- [ ] Health checks script ready (basic curl checks for key routes)
- [ ] Rollback plan ready (git tag or release point)

---

## 5. Build & Validate (Phase-by-Phase)
- Phase A: Content & Structure
  - Ensure all 30–50 posts mapped across hubs
  - Confirm internal links map follow 7+ hub structure
  - Verify 4 primary hubs exist: Đi vào bên trong, Môn học dọn dẹp, Lao động và Đầu tư cho chính mình
- Phase B: CMS & Templates
  - Article template, category template, breadcrumbs, and breadcrumbs schema
- Phase C: SEO & Metadata
  - Production sitemap.xml, robots.txt, canonical, hreflang, and JSON-LD for Organization/WebSite/WebPage/FAQ/Article
- Phase D: Deployment & Validation
  - Build assets (if applicable) and deploy
  - Run smoke tests and validate front-end

---

## 6. Deployment Steps (Concrete Commands)
1) Create deploy branch
   git checkout main
   git pull origin main
   git checkout -b deploy/nguyenlananh-YYYYMMDD

2) Add/runbook assets
   git add NGUYENLANANH_DEPLOY_RUNBOOK.md NGUYENLANANH_MASTER_WEBSITE_SPEC.md NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md
   git commit -m "docs: add deploy runbook and lock spec references for Nguyenlananh.com"
   git push -u origin deploy/nguyenlananh-YYYYMMDD

3) Create PR (GitHub CLI)
   gh pr create --title "Deploy Runbook for Nguyenlananh.com" \
                --body "${PR_BODY}" \
                --base main --head deploy/nguyenlananh-YYYYMMDD

Where PR_BODY can be the contents of NGUYENLANANH_DEPLOY_RUNBOOK.md or summary of changes.

4) Validation in CI/CD (pseudo)
- Stage 1: Run unit/integration tests for CMS templates
- Stage 2: Build static assets if framework is used
- Stage 3: Run smoke tests on staging domain
- Stage 4: Sanity checks for sitemap/robots and 404s

5) Approve & Merge

---

## 7. Post-Deployment Validation
- Confirm production health: homepage loads, core routes respond 200
- Verify sitemap.xml served and robots.txt accessible
- Ensure internal links resolve without 4xx/5xx
- Confirm analytics events fire on key actions
- Confirm CMS content published and accessible in prod

---

## 8. Rollback Plan
- If issues detected post-deploy, revert to the commit before merge or tag a rollback release.
- Update the Runbook with root cause and remediation steps.
- Communicate to stakeholders and content teams.

---

## 9. Roles & Sign-off (RACI)
- DEV: Branch, build, deploy script, and smoke tests
- CONTENT: Final content validation and publication policy
- SEO: Metadata, sitemap, schema, and crawlability
- OPS: Deploy gates, rollback readiness, and monitoring

---

END
