# Team 2 Corrective Release Evidence — 2026-04-29

Date: 2026-04-29
Project: `nguyenlananh.com`
Release type: Corrective scope-control release
Status: DEPLOYED

## Objective

Apply DOCS_DEV execution locks to the repo, correct the unapproved Pillar 11/12/13 public expansion, preserve useful parser bugfixes, and deploy a clean production state with evidence.

## Scope In

- Activate repo-local governance files.
- Return public pillar build scope to 10.
- Remove Pillar 11/12/13 from public manifest/index/sitemap.
- Keep Pillar 11/12/13 as draft-only material.
- Add temporary redirects for accidental public routes.
- Keep `cta_block_*` parser terminator fix.

## Scope Out

- No homepage refresh.
- No payment/auth/runtime changes.
- No PayPal secret provisioning.
- No Step 2-3 paid content publication.
- No new public article expansion.

## Risk

R3: user-facing trust and content governance risk caused by prior unapproved public expansion.

## Rollback Note

Rollback path after this corrective release:

- Re-deploy previous Cloudflare Pages deployment if the corrected article index or redirects fail.
- Git rollback should use a new revert/corrective commit, not `git reset --hard`.

## 2026-04-29 16:53 +07 — Corrective Work Completed Before Deploy

Applied DOCS_DEV locks into repo-local governance:

- `docs/00_governance/PROJECT_PROTOCOL_ACTIVATION.md`
- `docs/00_governance/PROJECT_CONTEXT_ENGINE.md`
- `docs/00_governance/PROJECT_EXECUTION_BOARD.md`
- `docs/00_governance/DOMAIN_RELEASE_EVIDENCE_PACKET_TEMPLATE.md`
- `docs/00_governance/CHANGE_LOG.md`
- `docs/00_governance/DECISION_LOG.md`

Corrected public pillar scope:

- `scripts/build-pillar-articles.mjs` now builds 10 public pillars only.
- Pillar 11/12/13 source files moved to `docs/pillar-expansion-drafts/` as owner-review drafts.
- Six accidental public HTML routes for Pillar 11/12/13 removed from worktree.
- `_redirects` now sends those accidental routes to article index pages with temporary `302`.
- `bai-viet/index.html`, `en/bai-viet/index.html`, `sitemap.xml`, and `admin/content/pillar-articles-collection.json` regenerated to 10-pillar scope.

Additional release blockers fixed under the bilingual/QA locks:

- Restored 9 zero-byte VI member pages under `members/creator/*` and `members/deep/*`.
- Added deterministic repair script: `scripts/repair-member-vi-pages.mjs`.
- Repaired 2 EN article pages that had Vietnamese content leaked into `/en/bai-viet/*`.
- Added/translated `en/admin/payments/index.html` so admin payments has a tracked EN counterpart.
- Updated VI admin payments metadata so cross-locale title/description are no longer duplicated.

Verification evidence:

| Check | Result |
|---|---|
| `node scripts/build-pillar-articles.mjs` | `Built 10 pillar articles.` |
| `node scripts/sync-i18n.mjs` | `Processed default pages: 117`; `Live locales: vi, en`; `Indexed routes in sitemap: 171` |
| Zero-byte HTML scan | `0` files |
| Manifest route count | `10` routes / `10` source docs |
| Unapproved Pillar 11/12/13 sitemap hits | `0` |
| Unapproved Pillar 11/12/13 index hits | `0` |
| Unapproved Pillar 11/12/13 HTML files | absent |
| `node scripts/validate-bilingual-release.mjs` | `pass`; `232` URLs; `0` issues; `0` blockers |
| `node scripts/prepare_release_dist.mjs` | release dist created; zero-byte HTML scan `0`; accidental Pillar 11 route absent; `_redirects` present |

Git integrity note:

- `.git/index` contained a bad cache-tree reference during this correction.
- The index was rewritten with `git update-index --force-write-index` after backing up the bad index metadata.
- No worktree content was reset with destructive Git commands.

## 2026-04-29 17:06 +07 — Final Deploy Evidence

Commit:

- `c3c79a8 fix(i18n): make sync idempotent before deploy`

Cloudflare Pages:

- Project: `nguyenlananh-com`
- Account: `62d57eaa548617aeecac766e5a1cb98e`
- Preview deployment: `https://1afce40a.nguyenlananh-com-63s.pages.dev`

Deploy command:

```bash
bash scripts/deploy_cloudflare.sh
```

Deploy output:

- `Processed default pages: 117`
- `Live locales: vi, en`
- `Indexed routes in sitemap: 171`
- `Bilingual validation status: pass`
- `URLs audited: 232`
- `Issues found: 0`
- `Blocking issues: 0`
- `Uploaded 234 files (101 already uploaded)`
- `Deployment complete`

Pipeline hardening included in final commit:

- `scripts/sync-i18n.mjs` now consumes whitespace after canonical before reinserting hreflang alternates.
- Verified by running `node scripts/sync-i18n.mjs` twice: second run produced no tracked diff in the release paths.

Post-deploy smoke:

| Check | Result |
|---|---|
| Preview accidental Pillar 11 route | `HTTP/2 302`, `location: /bai-viet/` |
| Production accidental Pillar 11 route | `HTTP/2 302`, `location: /bai-viet/` |
| Production `/` | `HTTP/2 200` |
| Production `admin.nguyenlananh.com/` | `HTTP/2 200` |
| Production `/en/admin/payments/` | `HTTP/2 200` |
| Preview `/api/payments/health` | `ok: true`, `db_ready: true` |
| Production `/api/payments/health` | `ok: true`, `db_ready: true` |

Note: after successful HTTP smoke, a later local `curl` sitemap check hit transient DNS resolution failure while `dig +short nguyenlananh.com` and `dig +short www.nguyenlananh.com` still returned Cloudflare IPs (`172.67.200.73`, `104.21.68.244`). Local filesystem sitemap verification remains clean: unapproved Pillar 11/12/13 slugs have `0` hits.
