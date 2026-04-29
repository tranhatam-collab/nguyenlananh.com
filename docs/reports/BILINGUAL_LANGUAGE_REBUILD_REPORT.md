# Bilingual Language Rebuild Report

- Generated at: 2026-04-25T13:04:39.564Z
- Status: BLOCKED
- Total URLs audited: 214
- Pages with issues: 10
- Total issues: 10
- Blocking issues: 10
- Images checked: 75
- Alt text present: 75
- Figures checked: 75
- Figure captions present: 48
- SVG descriptions present: 56

## Summary

- Locale split: {"vi":107,"en":107}
- Severity split: {"high":10}
- Category split: {"en":10}

## Blocking Pages

- /en/bai-viet/ban-khong-thieu-kien-thuc/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/chi-can-dung/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/chua-tung-co-huong/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/co-nguoi-can-dung-lai/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/dieu-ban-dang-tranh/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/hieu-cuoc-doi-minh/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/sai-moi-truong/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/song-sai-nhip/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/song-theo-thoi-quen/ [en] -> english_page_contains_vietnamese_diacritics
- /en/bai-viet/thieu-su-that/ [en] -> english_page_contains_vietnamese_diacritics

## Locked Decisions

- Vietnamese is the source language for meaning and structure.
- English must read as native international US English, not line-by-line translation.
- Shared UI text must come from /content/vi.json and /content/en.json through assets/content-registry.js.
- A page cannot be considered release-ready when title, description, H1, canonical, OG, alt text, or locale counterpart is missing.
- Image descriptions are part of release scope: alt text on page, figcaption when used, and accessible descriptions inside local SVG assets.
