# Bilingual Language Rebuild Report

- Generated at: 2026-05-08T22:34:14.682Z
- Status: BLOCKED
- Total URLs audited: 244
- Pages with issues: 1
- Total issues: 1
- Blocking issues: 1
- Images checked: 299
- Alt text present: 75
- Figures checked: 73
- Figure captions present: 46
- SVG descriptions present: 280

## Summary

- Locale split: {"vi":122,"en":122}
- Severity split: {"medium":1}
- Category split: {"vi":1}

## Blocking Pages

- None

## Locked Decisions

- Vietnamese is the source language for meaning and structure.
- English must read as native international US English, not line-by-line translation.
- Shared UI text must come from /content/vi.json and /content/en.json through assets/content-registry.js.
- A page cannot be considered release-ready when title, description, H1, canonical, OG, alt text, or locale counterpart is missing.
- Image descriptions are part of release scope: alt text on page, figcaption when used, and accessible descriptions inside local SVG assets.
