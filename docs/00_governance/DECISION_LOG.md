# NguyenLanAnh.com Decision Log

## 2026-04-29 — Public Pillar Scope Correction

Decision: Public pillar sequence remains 10 articles until owner approval explicitly changes the count.

Reason:

- Commit `ba16211` expanded public scope to 13 without a clean approval gate.
- DOCS_DEV locks prohibit silent scope drift and commit before approval.

Impact:

- Pillar 11/12/13 material is draft-only.
- Public manifest, sitemap, article index, and build source return to 10 pillars.
- Temporary redirects prevent accidental 11/12/13 live routes from becoming dead links.

Approval needed for future change:

- Owner must explicitly approve 10 -> 13 public pillar expansion before routes are reintroduced.

## 2026-04-29 16:53 +07 — Bilingual QA Gate Is Mandatory For Corrective Deploy

Decision: Corrective deployment may proceed only after `node scripts/validate-bilingual-release.mjs` passes.

Reason:

- DOCS_DEV bilingual and QA locks treat public/member language integrity as release infrastructure.
- The correction uncovered zero-byte member pages, English pages containing Vietnamese, and an untracked admin counterpart.

Impact:

- No deploy claim is allowed unless the evidence packet includes validator output.
- Current validator result: `232` URLs audited, `0` issues, `0` blockers.
