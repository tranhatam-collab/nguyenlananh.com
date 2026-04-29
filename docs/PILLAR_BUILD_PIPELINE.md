# PILLAR BUILD PIPELINE

Status: Internal pipeline note (do NOT include in any rendered HTML)
Owner: Team 2 (Content + Build)

## Canon files

Pillar 01 is in `docs/PILLAR_ARTICLES_BATCH_2026-04-29.md`.
Pillars 02–10 are saved as separate canon docs:

- `docs/PILLAR_02_CAI_CHOI.md`
- `docs/PILLAR_03_VONG_LAP.md`
- `docs/PILLAR_04_IM_LANG.md`
- `docs/PILLAR_05_HE_GIA_DINH.md`
- `docs/PILLAR_06_CO_DON.md`
- `docs/PILLAR_07_MOI_TRUONG.md`
- `docs/PILLAR_08_TRE_EM.md`
- `docs/PILLAR_09_LAO_DONG_SANG_TAO.md`
- `docs/PILLAR_10_DAU_TU_BAN_THAN.md`

## Build flow

HTML song ngữ được build bằng `scripts/build-pillar-articles.mjs` từ chính docs canon.

Manifest nằm tại `admin/content/pillar-articles-collection.json`.

Internal links trong content giữ về route ổn định: `/phuong-phap/`, `/hanh-trinh/`, `/bai-viet/`, `/join/`.

## Build safety rule (LESSON LEARNED 2026-04-29)

**Do NOT append any markdown sections below the last `cta_block_en:` paragraph in any pillar canon file.**

Reason: The build script reads `cta_block_en:` content greedily until end of file. Anything after that block (including `---`, headings, or notes) will be pulled into the EN page output and leak Vietnamese build text into the EN locale.

If you must add internal pipeline notes:

1. Put them in this file (`PILLAR_BUILD_PIPELINE.md`), or
2. Add them ABOVE the YAML metadata block of the pillar canon file (the build script ignores anything before YAML), or
3. Use HTML comment markers `<!-- ... -->` which the build script should be patched to strip.

## Recommended build script patch

In `scripts/build-pillar-articles.mjs`, the `cta_block_*` parser should stop at:
- The next `## ` markdown heading
- The next `---` separator
- The literal marker `<!-- END_OF_PILLAR -->`
- End of file

Whichever comes first.
