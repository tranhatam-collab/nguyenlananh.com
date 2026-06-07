# Bilingual Language Rebuild Report

- Generated at: 2026-06-07T13:28:31.456Z
- Status: BLOCKED
- Total URLs audited: 260
- Pages with issues: 6
- Total issues: 6
- Blocking issues: 6
- Images checked: 319
- Alt text present: 75
- Figures checked: 73
- Figure captions present: 46
- SVG descriptions present: 300

## Summary

- Locale split: {"vi":133,"en":127}
- Severity split: {"high":6}
- Category split: {"bilingual":6}

## Blocking Pages

- /bai-viet/chuyen-muc/dau-tu-ban-than/ [vi] -> missing_counterpart_page
- /bai-viet/chuyen-muc/di-vao-ben-trong/ [vi] -> missing_counterpart_page
- /bai-viet/chuyen-muc/du-an-nhat-ky/ [vi] -> missing_counterpart_page
- /bai-viet/chuyen-muc/gia-tri-noi-tai/ [vi] -> missing_counterpart_page
- /bai-viet/chuyen-muc/lao-dong-sang-tao/ [vi] -> missing_counterpart_page
- /bai-viet/chuyen-muc/mon-hoc-don-dep/ [vi] -> missing_counterpart_page

## Locked Decisions

- Vietnamese is the source language for meaning and structure.
- English must read as native international US English, not line-by-line translation.
- Shared UI text must come from /content/vi.json and /content/en.json through assets/content-registry.js.
- A page cannot be considered release-ready when title, description, H1, canonical, OG, alt text, or locale counterpart is missing.
- Image descriptions are part of release scope: alt text on page, figcaption when used, and accessible descriptions inside local SVG assets.
