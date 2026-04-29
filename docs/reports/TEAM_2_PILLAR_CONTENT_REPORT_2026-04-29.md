# Team 2 Pillar Content Report — 2026-04-29

## 2026-04-29 13:42:43 +0700

Scope: content canon + static HTML build for NguyenLanAnh.com pillar articles.

What changed:

- Locked Pillar 01 refinements in `docs/PILLAR_ARTICLES_BATCH_2026-04-29.md`.
- Saved Pillar 02 + 03 as standalone canon docs:
  - `docs/PILLAR_02_CAI_CHOI.md`
  - `docs/PILLAR_03_VONG_LAP.md`
- Expanded/saved remaining pillar docs:
  - `docs/PILLAR_06_CO_DON.md`
  - `docs/PILLAR_07_MOI_TRUONG.md`
  - `docs/PILLAR_08_TRE_EM.md`
  - `docs/PILLAR_09_LAO_DONG_SANG_TAO.md`
  - `docs/PILLAR_10_DAU_TU_BAN_THAN.md`
- Kept Pillar 04 + 05 canon docs intact, used them as render sources:
  - `docs/PILLAR_04_IM_LANG.md`
  - `docs/PILLAR_05_HE_GIA_DINH.md`
- Added `scripts/build-pillar-articles.mjs` to generate bilingual HTML from docs canon.
- Generated/updated 20 public article pages under `bai-viet/` and `en/bai-viet/`.
- Added `admin/content/pillar-articles-collection.json` manifest.
- Updated article index pages to expose the 2026 pillar sequence:
  - `bai-viet/index.html`
  - `en/bai-viet/index.html`
- Updated article image fallback map:
  - `assets/site.js`
  - `assets/images/articles/article-slug-image-map.json`
- Updated `sitemap.xml` with new pillar routes.

Voice/content checks:

- Internal content links kept to stable routes only: `/phuong-phap/`, `/hanh-trinh/`, `/bai-viet/`, `/join/`.
- Removed remaining Pillar 01 wording tied to "healing/chữa lành" and old "not a method" excerpt.
- Pillar 06-10 VI word counts are now in pillar range:
  - Pillar 06 VI 1804 / EN 1057
  - Pillar 07 VI 1831 / EN 1057
  - Pillar 08 VI 1973 / EN 1224
  - Pillar 09 VI 1963 / EN 1138
  - Pillar 10 VI 1904 / EN 1283

Build/verification:

- `node scripts/build-pillar-articles.mjs` -> built 10 pillar articles.
- Manifest route check -> 10 routes, 0 missing generated pages.
- Sitemap + image map parse check -> passed.
- Generated pillar pages checked for `undefined`, invalid EN category breadcrumbs, and blocked tone terms -> no matches.

Coordination note:

- Runtime/live-gate scripts were not deleted or rolled back:
  - `scripts/payment-live-proof-smoke.sh`
  - `scripts/provision-payment-live-secrets.sh`
  - `scripts/deploy_cloudflare.sh`

Pending:

- Commit attempt.

## 2026-04-29 13:53:50 +0700

Commit:

- Standard `git commit -m "Add pillar article canon and pages"` hung with no output after staging, matching the local git/index instability already seen during deploy (`unable to read tree ...` warning).
- Avoided reset/checkout/rollback.
- Completed commit via low-level git flow after `git write-tree` succeeded:
  - tree: `0dd6127ea2815ced59331d9abcfb35e2f916451d`
  - parent: `d8c84a6a9944cd4dd5252f6a475622dc82d38b74`
  - commit: `b8f081e6da4703bd5f312687a7c693c648fc23bf`
- Updated `refs/heads/main` to `b8f081e6da4703bd5f312687a7c693c648fc23bf`.

Final state:

- Docs canon saved.
- HTML built.
- Production deployed.
- Commit created.
- Production deploy.
- Post-deploy route smoke check.

## 2026-04-29 13:46:59 +0700

Deploy:

- Built release dist with `node scripts/prepare_release_dist.mjs`.
- Deployed to Cloudflare Pages project `nguyenlananh-com` under account `62d57eaa548617aeecac766e5a1cb98e`.
- Deployment URL: `https://178475d8.nguyenlananh-com-63s.pages.dev`
- Wrangler emitted the known local git tree warning (`fatal: unable to read tree ...`) before deploy, but upload/deploy completed successfully.

Production smoke:

- `https://nguyenlananh.com/bai-viet/moi-truong-la-nguoi-thay-vo-hinh/` -> HTTP 200.
- `https://nguyenlananh.com/en/bai-viet/dau-tu-ban-than-khong-ao-tuong-doi-doi/` -> HTTP 200.
- `https://nguyenlananh.com/bai-viet/` -> HTTP 200 and contains `Loạt 10 pillar 2026`.
- Deployment preview `https://178475d8.nguyenlananh-com-63s.pages.dev/bai-viet/bon-truc-thay-doi/` -> HTTP 200.

Content smoke:

- Production VI pillar route contains `Môi Trường — Người Thầy Vô Hình`.
- Production EN pillar route contains `Investing in Yourself Without the Life-Change Illusion`.

Pending:

- Commit attempt.
