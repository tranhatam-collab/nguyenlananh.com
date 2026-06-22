# Release Verdict — nguyenlananh.com

> **⚠️ SUPERSEDED — Verdict này không còn đại diện cho trạng thái HEAD sau commit 8c93caa (xóa auth magic link) và 2556b40 (cleanup residual UI).**
> **Verdict thay thế: `QA_AUDIT_V2_POST_AUTH_CHANGE_2026-06-22.md`**
> **Verdict này được giữ lại làm tài liệu lịch sử.**

**Date**: 2026-06-22
**Audit session**: Devin CLI full-site audit (Phases 0-20)
**Production deployment**: `6339b10` → Cloudflare Pages `074d28b4`
**Live URL**: https://www.nguyenlananh.com/

---

## Verdict: **CONDITIONAL PASS** — ready for soft launch with 1 P1 infrastructure follow-up

---

## Evidence Pack

### Phase 0-1: Source of truth & baseline
- Repo: `github.com:tranhatam-collab/nguyenlananh.com.git` (branch `main`)
- Cloudflare Pages project: `nguyenlananh-com` (account `62d57eaa`)
- D1: `nguyenlananh-payments-prod` (`16dfc26d-ed33-4dc1-a349-6e216860ae05`)
- Domains: `nguyenlananh.com`, `www.nguyenlananh.com`, `admin.nguyenlananh.com`

### Phase 2: P0 truth fixes (ALL FIXED)
| Issue | Status | Evidence |
|---|---|---|
| "500+ đang đồng hành" unverified claim | REMOVED | Live: 0 matches |
| Placeholder testimonials | REMOVED | Live: 0 matches |
| Footer year missing | FIXED | Live: "© 2026" |
| Price discrepancy ($2 vs $3) | LOCKED $3/75.000 VND | constants.js, payments.js, live CTA |

### Phase 3: Header/menu/language
- Focus trap + body scroll lock in drawer ✓
- aria-modal="true" on all 318 pages ✓
- Language selector cloned to drawer on mobile ≤480px ✓
- Hamburger + Escape + click-outside dismiss ✓

### Phase 4: Responsive
- `viewport-fit=cover` + `env(safe-area-inset-*)` for iOS notch ✓
- `min-height:44px` touch targets on mobile (WCAG 2.2 AA) ✓
- CTA hidden on ≤919px, only hamburger in actions ✓
- `overflow-x:hidden` on body ✓

### Phase 5: Content & positioning
- No "chữa lành" in public keywords ✓
- All "trị liệu" mentions in "KHÔNG thay thế" context ✓
- Member page title neutralized ✓

### Phase 6: SEO
- All release gates PASS (human-text, bilingual, content-audit, homepage-refresh, local-public-site-audit)
- 341 HTML files, 0 content-audit issues
- 334 URLs bilingual-validated, 0 issues
- hreflang EN links on all VI pages with EN counterparts
- OG/Twitter metadata on all pages
- 11 EN counterpart pages fully translated

### Phase 7: Auth & session
| Endpoint | Status | Notes |
|---|---|---|
| GET /api/auth/session | 401 ✓ | Correct (no session) |
| GET /api/auth/google/start | 302 ✓ | Redirect to Google OAuth |
| POST /api/auth/logout | 200 ✓ | Clears cookie |
| POST /api/auth/magic-links/request | **502 P1** | Email delivery failed (mail API provider) |
| POST /api/auth/signup | **502 P1** | Same email delivery issue |

- Session: JWT HMAC-SHA256, HttpOnly+Secure+SameSite=Lax, 30-day TTL ✓
- Google OAuth: client_id `496670862618-...`, signed state, correct redirect_uri ✓

### Phase 8: Payment & entitlement
| Provider | Status | Notes |
|---|---|---|
| VietQR | **LIVE** ✓ | PayOS integration, 75.000 VND for year1 |
| PayPal | setup_required | Implemented, not enabled |
| Stripe | setup_required | Implemented, not enabled |
| MoMo/VNPay/ZaloPay | planned | Not implemented |

- Checkout test: `ord_8b70566004934156ab05253bdb28d756`, 75,000 VND, PayOS URL generated ✓

### Phase 9: Email automation
- Mail provider: `api.mail.iai.one/v1` — **currently failing (P1 infrastructure)**
- All secrets configured: MAIL_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO_SUPPORT ✓
- 15 email templates defined in constants.js ✓
- Fallback to Resend configured (if RESEND_API_KEY set) ✓

### Phase 12: D1 audit
- 16 tables: users, entitlements, payment_orders, magic_links, email_jobs, etc. ✓
- 15 indexes on critical query paths ✓
- Data: 1 test user, 59 payment orders (58 created, 1 pending), 0 entitlements (pre-launch) ✓

### Phase 13: Security OWASP
| Header | Value |
|---|---|
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| Content-Security-Policy | default-src 'self'; frame-ancestors 'none'; object-src 'none' |
| Permissions-Policy | geolocation=(), microphone=(), camera=() |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |

- Session cookies: HttpOnly, Secure, SameSite=Lax ✓
- No secrets in repo ✓
- Admin routes protected by middleware (session + role check) ✓

### Phase 14: Privacy/legal/trust
| Page | VI | EN |
|---|---|---|
| Privacy policy | 200 ✓ | 200 ✓ (translated) |
| Terms | 200 ✓ | 200 ✓ (translated) |
| Disclaimer | 200 ✓ | 200 ✓ (translated) |

- Footer links correct on both VI and EN ✓
- Legal pages noindex,follow ✓

### Phase 15: Accessibility WCAG 2.2 AA
- Skip link ✓
- ARIA labels on all interactive elements ✓
- Alt text on all images (decorative: alt="" + aria-hidden) ✓
- Heading hierarchy: 1×h1 → 18×h2 → 32×h3 ✓
- Focus visible: 3px outline ✓
- Focus trap in modal drawer ✓
- Touch targets ≥44px on mobile ✓
- Color contrast: ~6.3:1 (muted on cream) ✓
- No aria-hidden with focusable children ✓
- No duplicate IDs ✓
- lang attribute: vi / en-US ✓

### Phase 16: Performance
- Brotli compression on all assets ✓
- Total CSS+JS: ~50KB uncompressed (~15KB with br) ✓
- Caching: CSS/JS 4h + stale-while-revalidate=86400 ✓
- HTML: no-cache (must-revalidate) ✓
- Images: SVG (vector, lightweight) ✓

### Phase 17: Observability & analytics
- Privacy-first analytics via D1 `analytics_events` (29 events recorded) ✓
- Structured logging: logInfo/logWarn/logError ✓
- No third-party trackers (no GA, no Facebook Pixel) ✓

### Phase 18: Automated test suite
- 33 tests, all passing ✓
- Coverage: session JWT (sign/verify/tamper/expire), utils (email/locale/json/crypto)
- `node --test tests/lib-session.test.mjs tests/lib-utils.test.mjs` → 33 pass, 0 fail

### Phase 19-20: Deploy & live verification
- Commit `6339b10` pushed to GitHub main ✓
- Deployed to Cloudflare Pages `074d28b4` ✓
- All 6 release gates PASS ✓
- Live verification: P0 fixes confirmed on production ✓

---

## P1 Follow-up Items (do not block soft launch)

1. **Mail API provider down** — `api.mail.iai.one` returning errors. Magic link email delivery broken. Google OAuth works as alternative. Action: check mail API key validity, contact provider, or configure Resend fallback.

2. **PayPal/Stripe not enabled** — Both implemented but `setup_required`. Action: complete provider onboarding when ready for international payments.

---

## Commits in this audit session (12 commits)
```
6339b10 fix(a11y,responsive,content): safe-area, touch targets, remove "chữa lành" from public keywords
ad09536 fix(a11y,header): focus trap + scroll lock in drawer, aria-modal=true, mobile lang selector
9e1bf03 fix(audit): skip /en/api/ routes in local-public-site-audit (Functions routes)
b6bb8ac chore: gitignore auto-generated audit reports to keep working tree clean
58629c4 fix(seo): add canonical+OG+twitter to 5 PDF pages, fix 5 minor title/desc lengths
c1110a5 fix(seo,content): shorten long titles, fix broken internal links, add PDF descriptions
22411e6 fix(seo): add og:image to 6 EN product pages
489003f fix(i18n,seo): sync hreflang + OG metadata for VI/EN counterparts, update sitemap
1657810 fix(i18n): translate 11 EN counterpart pages (5 articles + 6 products) to English
90e7872 feat(i18n): add EN counterparts for 5 articles + 6 products, fix EN footer year & brand name
+ 2 chore commits for audit reports
```

---

## Conclusion

The site is **ready for soft launch** with VietQR payments and Google OAuth. The only P1 issue (mail API provider) does not block the primary user flows (Google sign-in + VietQR payment). All P0 truth issues are fixed and verified live. All release gates pass. The site meets WCAG 2.2 AA, has excellent security headers, and is performance-optimized.
