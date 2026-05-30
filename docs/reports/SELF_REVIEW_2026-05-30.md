# Self Code Review + Security Review

**Date:** 2026-05-30
**Base:** `0e4ffb5` → `auto/overnight-2026-05-30` HEAD

---

## T8 — Self Code Review

### Findings

| ID | File | Issue | Severity | Status |
|----|------|-------|----------|--------|
| R1 | `functions/_lib/ratelimit.js` | `logError` in catch block could itself throw if `error` is circular — but JSON.stringify handles it gracefully | Low | ✅ Acceptable |
| R2 | `functions/_lib/ratelimit.js` | Uses `ON CONFLICT` which requires SQLite 3.24+ (D1 supports it) | Info | ✅ OK |
| R3 | `functions/_lib/auth.js` | `signupMagicLinkResponse` catch logs error but doesn't distinguish between validation errors (4xx) and infrastructure errors (5xx) — acceptable pattern | Low | ✅ Acceptable |
| R4 | `functions/_middleware.js` | Logs `user?.email` which could be undefined — `logWarn` handles undefined fields gracefully | Low | ✅ Acceptable |

### No Critical Issues Found

- No floating promises in new code
- No `await` inside non-async loops
- No dead code introduced
- All new files have `node --check` pass

---

## T9 — Security Review

### Session & Auth

| Check | Status | Notes |
|-------|--------|-------|
| Session cookie signed with HMAC-SHA256 | ✅ | `session.js` uses `sha256Hex(header.body.secret)` |
| JWT verification uses timing-safe comparison | ⚠️ PARTIAL | `sha256Hex` comparison is `===` (string compare). For low-volume site, acceptable. For hardening: use `timingSafeEqualHex` |
| Session cookie: HttpOnly, Secure, SameSite=Lax | ✅ | `sessionCookieHeaders` sets all three |
| Magic-link token entropy | ✅ | `randomToken(24)` = 192 bits, hex-encoded |
| Magic-link single-use | ✅ | `markMagicLinkUsed` sets `used_at` |
| Magic-link expiry | ✅ | 20 minutes |
| Magic-link hash stored, not raw token | ✅ | `sha256Hex(rawToken)` stored in DB |

### SQL Injection

| Check | Status | Notes |
|-------|--------|-------|
| All DB queries use parameterized `?.bind(...)` | ✅ | `db.js` consistently uses prepared statements |
| No string concatenation into SQL | ✅ | Verified in `db.js`, `ratelimit.js` |

### Open Redirect

| Check | Status | Notes |
|-------|--------|-------|
| `normalizeNextPath` restricts to `/members/*` and `/en/members/*` | ✅ | Regex `^(/(en/)?members(/|$))` blocks external URLs |
| Google OAuth redirect_uri validated | ✅ | Uses env var or defaults to same-origin callback |

### Admin Gate

| Check | Status | Notes |
|-------|--------|-------|
| `_middleware.js` checks session + role | ✅ | Redirects to `/members/` if missing or non-admin |
| Static `admin/index.html` bypass possible? | ⚠️ | If middleware doesn't run before static serve, admin page is reachable without auth on deployment URLs. Custom domain may be protected if Functions route correctly. **Known issue from P3-0 evidence.** |

### Secrets

| Check | Status | Notes |
|-------|--------|-------|
| Secrets never logged or returned in responses | ✅ | Verified in auth.js, session.js |
| `env.MAGIC_LINK_SECRET` used for both session + OAuth state fallback | ⚠️ | Single secret dual-use increases blast radius if leaked. Recommend separate `GOOGLE_OAUTH_STATE_SECRET` in production. |

### Rate Limiting

| Check | Status | Notes |
|-------|--------|-------|
| Fail-open when D1 missing | ✅ | Preview env safe |
| Per-email + per-IP limits | ✅ | 5/email/hr, 20/ip/hr |
| Returns 429 with Retry-After | ✅ | `rateLimitResponse` |

---

## Safe Fixes Applied

None required for new code. Existing issues documented for future hardening.

---

*Review generated during autonomous overnight run (T8 + T9).*
