# Bilingual Language Rebuild Report

- Generated at: 2026-04-25T12:27:04.335Z
- Status: PASS
- Total URLs audited: 188
- Pages with issues: 0
- Total issues: 0
- Blocking issues: 0
- Images checked: 75
- Alt text present: 75
- Figures checked: 75
- Figure captions present: 48
- SVG descriptions present: 56

## Summary

- Locale split: {"vi":94,"en":94}
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
