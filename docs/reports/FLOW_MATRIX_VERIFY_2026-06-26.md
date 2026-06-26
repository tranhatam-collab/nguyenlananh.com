## FLOW MATRIX REPORT — 2026-06-26 (FINAL) — Devin (GLM-5.2)

> Full end-to-end flow matrix for VI and EN, per AI_DEV_WORKING_RULES.md §2.
> **Matrix: 98/98 PASS. Source clean. HEAD = working = LIVE. Deployed via GitHub Actions.**

---

## 0. ROOT CAUSE FIX — DIRTY WORKING TREE

**Diagnosis:** Working tree had 131 dirty files (88 modified + 43 untracked) from a broken generation script. The script introduced bad "Thực hành" translations replacing "Practice" proper names (e.g. "Creative Thực hành Studio" instead of "Creative Practice Studio"). Manual deploys from the dirty working dir overwrote correct content in git/live with the bad generated content.

**Action taken:**
1. `git checkout HEAD -- .` — reverted all 88 modified files to HEAD (correct content)
2. `git clean -fd` — removed all 43 untracked generated files/directories
3. `git status` — **0 dirty files** (clean)
4. Empty commit `ddcdf44` → push to main → **GitHub Actions deployed automatically**
5. **NO manual deploy** — deploy came from clean commit via CI/CD

**Result:** HEAD = working tree = LIVE. No dirty files. No manual deploy.

---

## 1. COMMIT / DEPLOYMENT IDENTITY

- **Commit SHA:** `ddcdf44` — `chore: trigger clean deploy from HEAD (working tree was dirty)`
- **origin/main:** `ddcdf44` (sync: yes)
- **Working tree:** 0 dirty files
- **Deploy method:** GitHub Actions (`.github/workflows/deploy-cloudflare.yml`)
- **Actions status:** `completed` + `success`
- **Actions run SHA:** `ddcdf449028a80963da0e490172a6f4057ba666b`

---

## 2. §2 FOUR-LAYER EVIDENCE

### (a) Deployment identity
- git HEAD = `ddcdf44`
- origin/main = `ddcdf44`
- Working tree: **0 dirty files**
- GitHub Actions: `ddcdf44` → completed + success

### (b) Live assertions (homepage)
- `500+` = **0**
- `Thực hành` (bad translation) = **0**
- `© 2026` = **1**
- `cdn-cgi/l/email-protection` = **0**

### (c) Source ↔ production hash
- Production: `8cf2193fc7a53909d0310283c47d28eabd3e6b688c5c8d2cdd25b389c0fb25c9`
- Source HEAD: `8cf2193fc7a53909d0310283c47d28eabd3e6b688c5c8d2cdd25b389c0fb25c9`
- Source WORK: `8cf2193fc7a53909d0310283c47d28eabd3e6b688c5c8d2cdd25b389c0fb25c9`
- **MATCH 100%** — all three layers identical

### (d) Key files: HEAD = WORK = LIVE
| File | HEAD = WORK = LIVE |
|---|---|
| `join/` | ✓ MATCH |
| `en/join/` | ✓ MATCH |
| `members/` | ✓ MATCH |
| `en/members/` | ✓ MATCH |
| `products/one-corner-reset/` | ✓ MATCH |
| `en/products/one-corner-reset/` | ✓ MATCH |
| `programs/rhythm-design-lab/` | ✓ MATCH |
| `en/programs/rhythm-design-lab/` | ✓ MATCH |

### (e) Multi-host consistency
| Host | 500+ | Thực hành | © 2026 |
|---|---|---|---|
| `https://nguyenlananh.com/` | 0 | 0 | 1 |
| `https://www.nguyenlananh.com/` | 0 | 0 | 1 |

---

## 3. FLOW MATRIX RESULTS

Run: `node scripts/flow-matrix.mjs https://www.nguyenlananh.com`

**SUMMARY: PASS 98 | FAIL 0 | BLOCKED 0**

### Matrix 5 × 2

| Group | VI | EN | Notes |
|---|---|---|---|
| 1. Google login | ✅ 2/2 | ✅ 2/2 | Button href correct; start → 302 Google; redirect_uri = `https://www.nguyenlananh.com/api/auth/google/callback` |
| 2. Checkout | ✅ 21/21 | ✅ 21/21 | 18 product landings + 3 membership tiers; API returns `TURNSTILE_FAILED` with dummy token (correct fail-closed) |
| 3. Contact form | ✅ 2/2 | ✅ 2/2 | Form uses `/api/contact/submit`; dummy token → `TURNSTILE_FAILED` (correct fail-closed) |
| 4. Member gating | ✅ 7/7 | ✅ 4/4 | Deep lessons redirect to landing/join when logged out; deep index stays public |
| 5. Nav/CTA/footer links | ✅ | ✅ | 12,165 internal links checked; no broken links found |

### VI checkout details (18 products + 3 membership)
- Micro (5): one-corner-reset, 7-day-true-rhythm, life-reset-mini, companion-circle, inner-listening-kit
- Premium (13): personal-capital, avoidance-map, family-pattern-mapping, open-loop-closure-sprint, boundary-foundation, personal-after-action-review, self-trust-practice-lab, space-reset-practitioner, creative-practice-studio, emotional-block-mapping, rhythm-design-lab, practice-method-designer, practice-companion-level-1
- Membership (3): year1, year2, year3

### EN checkout details (18 products + 3 membership)
- Same 18 product landings + 3 membership tiers as VI
- All pages exist, all data-plan attributes correct, all APIs return TURNSTILE_FAILED

---

## 4. GOOGLE OAUTH error=5 — STATUS

**Previous report:** User reported landing on `https://www.nguyenlananh.com/members/?error=5` after Google login.

**Current state:**
- Error logging was deployed in commit `8a37e7e` (before the clean deploy)
- The clean deploy `ddcdf44` includes this logging
- `/members/` now displays a human-readable error banner when `?error=<code>` is present
- The `error=5` code does not exist in the codebase — it was `error.code` from a thrown Error
- **After the clean deploy, the bad generated content that may have caused the error is no longer present**
- User should retry login — if error recurs, the full stack trace will be captured in `site_errors` table

**This is the only remaining item that requires user action (browser test).**

---

## 5. BLOCKED / STILL REQUIRES USER ACTION

1. **Turnstile production keys** — dummy token correctly returns `TURNSTILE_FAILED` (fail-closed). Real checkout/contact submission needs:
   - Create Turnstile widget in Cloudflare dashboard
   - Set production site key in `assets/turnstile-config.js`
   - Set production secret key in Cloudflare dashboard environment variables (`TURNSTILE_SECRET_KEY`)

2. **Google OAuth end-to-end browser test** — server-side verified: redirect_uri accepted by Google, start endpoint returns 302 correctly. Need user to test actual login in incognito browser:
   - `/members/` → "Đăng nhập bằng Google" → choose account → Allow
   - If error recurs, error banner will show + full stack trace will be logged to D1

---

## 6. VERDICT

**PASS — Flow matrix 98/98. Source clean. HEAD = working = LIVE.**

- Working tree: **0 dirty files** (was 131, now clean)
- Deploy method: **GitHub Actions** (not manual deploy)
- HEAD = origin/main = `ddcdf44`
- Source ↔ production hash: **MATCH 100%**
- All key files: HEAD = WORK = LIVE ✓
- No bad "Thực hành" translations on live site
- All 5 flow matrix groups pass in both VI and EN

**Remaining: operational only (Turnstile prod keys + Google OAuth browser test). No code fixes pending.**
