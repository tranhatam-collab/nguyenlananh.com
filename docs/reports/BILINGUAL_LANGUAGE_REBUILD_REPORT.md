# Bilingual Language Rebuild Report

- Generated at: 2026-06-07T14:21:24.764Z
- Status: PASS
- Total URLs audited: 286
- Pages with issues: 0
- Total issues: 0
- Blocking issues: 0
- Images checked: 355
- Alt text present: 85
- Figures checked: 83
- Figure captions present: 56
- SVG descriptions present: 332

## Summary

- Locale split: {"vi":143,"en":143}
- Severity split: {}
- Category split: {}

## Blocking Pages

- None

## Locked Decisions

- Vietnamese is the source language for meaning and structure.
- English must read as native international US English, not line-by-line translation.
- Shared UI text must come from /content/vi.json and /content/en.json through assets/content-registry.js.
- A page cannot be considered release-ready when title, description, H1, canonical, OG, alt text, or locale counterpart is missing.
- Image descriptions are part of release scope: alt text on page, figcaption when used, and accessible descriptions inside local SVG assets.
