# Bilingual Language Codex

This document is the locked language reference for Nguyenlananh.com while the bilingual rebuild is in progress.

## Source Of Truth

- Source language: Vietnamese
- Secondary language: International US English
- Shared UI registry: `/content/vi.json` and `/content/en.json`
- Browser delivery artifact: `/assets/content-registry.js`

## Vietnamese Rules

- Full Vietnamese diacritics at all times
- Clear, short, serious sentences
- No slang
- No marketing voice
- No preachy phrasing
- No social-post style shortcuts

## English Rules

- Native-feeling international US English
- Meaning-aligned with the Vietnamese source
- No literal line-by-line translation
- No hype
- No cheap sales copy
- No coaching or healing tone

## Locked Terms

- `Hành trình` -> `Journey`
- `Hệ thống` -> `System`
- `Bài viết` -> `Writings`
- `Thành viên` -> `Members`
- `Đồng hành miễn phí` -> `Free companionship`
- `Kết nối` -> `Contact`

## Forbidden Words

- `healing`
- `coaching`
- `breakthrough`
- `success formula`
- `hype`

## Image Language Rules

- Every public image must have localized `alt` text on the page where it appears.
- If a `figure` uses a visible caption, that caption must follow the same language and tone rules as body copy.
- Local SVG assets used as public illustrations must include an internal accessible description with `aria-label` or `aria-labelledby` plus a real `<title>`.
- Image description text is part of SEO, accessibility, and QA scope. It is not optional.

## Release Rule

No page can be considered live-ready when title, description, H1, canonical, OG metadata, alt text, language counterpart, or shared UI text fails bilingual validation.
