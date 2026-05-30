# CSP Hardening Audit Report

**Date:** 2026-05-30
**Scope:** `index.html` (VI), `en/index.html` (EN)
**Action:** Added `Content-Security-Policy-Report-Only` to `_headers` for monitoring.

---

## Current State

The enforced CSP in `_headers` allows `'unsafe-inline'` for both `script-src` and `style-src`:

```
Content-Security-Policy: default-src 'self'; ... ; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; ...
```

This is necessary because the homepages contain inline scripts and inline `style="..."` attributes.

---

## Inline Scripts Found

### 1. JSON-LD Structured Data (`<script type="application/ld+json">`)
- **Files:** `index.html:36-97`, `en/index.html:36-97`
- **Type:** Non-executable JSON-LD
- **CSP Impact:** `type="application/ld+json"` is NOT blocked by `script-src` (browser treats it as data, not script)
- **Action needed:** None

### 2. Main Inline JavaScript (`<script>`)
- **Files:** `index.html:1031-1237`, `en/index.html:~1031-1237`
- **Size:** ~200 lines
- **Functionality:**
  - Drawer toggle (hamburger, close, Escape key, click-outside)
  - Scroll reveal observer
  - Copy email to clipboard
  - Local-first note (localStorage save/load/export)
  - Section view tracking + CTA click tracking
  - Year update in footer
- **CSP Impact:** **BLOCKED** by report-only CSP (`script-src 'self'` without `'unsafe-inline'`)
- **Remediation options:**
  1. **Extract to external file** (RECOMMENDED): Move to `assets/home-inline.js`, load with `<script src>`
  2. **Add hash**: Compute SHA-256 hash of script body, add `'sha256-xxx...'` to CSP
  3. **Add nonce**: Requires server-side rendering (not applicable for static Pages)

### 3. Tracking Script (`<script src="/assets/tracking.js" defer>`)
- **Files:** `index.html:102`, `en/index.html:102`
- **Type:** External file
- **CSP Impact:** None (external, allowed by `'self'`)

---

## Inline Styles Found

### `style="..."` Attributes (many across both pages)
- **Examples:**
  - `index.html:966` - paragraph margin/color/font-size
  - `index.html:978` - label display/margin/font-size/color
  - `index.html:979-989` - textarea width/border/padding/background
  - `index.html:1008` - footer font-weight/color
  - `index.html:1012` - footer flex layout
  - `index.html:1022` - legal section margin/color
  - `index.html:1024-1026` - link padding
  - `index.html:135` - drawer header font-weight/font-size
  - `en/index.html` — similar patterns
- **CSP Impact:** Currently allowed by `style-src 'self' 'unsafe-inline'`
- **Remediation:** Difficult to remove all inline styles without significant refactoring. Recommend keeping `'unsafe-inline'` for `style-src` until major redesign.

---

## Report-Only CSP Added

```
Content-Security-Policy-Report-Only: default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; upgrade-insecure-requests
```

Key differences from enforced CSP:
- `script-src 'self'` — NO `'unsafe-inline'` (will report violations)
- `img-src 'self' data: https:` — added `https:` for OG images (already served from same origin, but safer)

## Next Steps to Flip to Enforce

1. **Extract main inline script** (`index.html:1031-1237`) to `assets/home-main.js`
2. **Update both HTML files** to load `<script src="/assets/home-main.js"></script>` instead of inline
3. **Verify** report-only violations drop to zero (check browser dev tools or set up a report collector)
4. **Remove** `Content-Security-Policy-Report-Only` line and tighten the enforced `Content-Security-Policy` line
5. **Consider** adding `report-uri` or `report-to` directive for production monitoring

## Risk Assessment

| Item | Severity | Notes |
|------|----------|-------|
| Inline script in homepage | Medium | Large ~200-line script; extraction is straightforward |
| Inline styles everywhere | Low | Common pattern; `'unsafe-inline'` for styles acceptable |
| `'unsafe-inline'` in script-src (enforced) | Medium | XSS vector if attacker can inject inline script |
| No CSP report endpoint | Low | Added report-only; consider adding `report-uri` later |

---

*Report generated during autonomous overnight run (T5).*
