# P3-0 Production Evidence Packet
**Date**: 2026-05-28
**Deployment**: `b8e3199` (fix D1 database_id)
**Pages URL**: `https://94fa3a18.nguyenlananh-com.pages.dev`
**Custom Domain**: `https://nguyenlananh.com`, `https://www.nguyenlananh.com`

---

## 1. Domain Reachability

| Domain | HTTP Status | Notes |
|--------|-------------|-------|
| `https://nguyenlananh.com/` | 200 | ✅ Custom domain reachable |
| `https://www.nguyenlananh.com/` | 200 | ✅ Custom domain reachable |
| `https://94fa3a18.nguyenlananh-com.pages.dev/` | 200 | ✅ Deployment URL reachable |

---

## 2. SEO / Robots

| Domain | `x-robots-tag` | Notes |
|--------|----------------|-------|
| `https://94fa3a18.nguyenlananh-com.pages.dev/` | `noindex` | ✅ Expected for preview/deployment URLs |
| `https://nguyenlananh.com/` | (none) | ✅ Custom domain not noindexed |

---

## 3. Functions/API Endpoints

### Deployment URL (`94fa3a18.nguyenlananh-com.pages.dev`)

| Endpoint | Method | Expected | Actual | Status |
|----------|--------|----------|--------|--------|
| `/api/auth/session` | GET | 401 `SESSION_INVALID` | 401 ✅ | ✅ PASS |
| `/admin/` | GET | 302 → `/members/` | 200 | ❌ FAIL |
| `/api/auth/logout` | POST | 200 | 200 ✅ | ✅ PASS |

### Custom Domain (`nguyenlananh.com`)

| Endpoint | Method | Expected | Actual | Status |
|----------|--------|----------|--------|--------|
| `/api/auth/session` | GET | 401 `SESSION_INVALID` | 404 (HTML 404 page) | ❌ FAIL |
| `/admin/` | GET | 302 → `/members/` | 200 (serves static) | ❌ FAIL |
| `/api/auth/logout` | POST | 200 | 405 Method Not Allowed | ❌ FAIL |

---

## 4. D1 Binding Configuration

**File**: `wrangler.toml`
```toml
[[env.production.d1_databases]]
binding = "PAYMENTS_DB"
database_name = "nguyenlananh-payments-prod"
database_id = "2f3a3331-546b-44f1-9992-57d18705afd5"
```

**Verification**:
```bash
wrangler d1 list | grep nguyenlananh-payments-prod
# Result: 2f3a3331-546b-44f1-9992-57d18705afd5 | nguyenlananh-payments-prod
```
✅ Database ID matches configuration

---

## 5. D1 Schema (`users` table)

**Migration Applied**: `docs/migrations/2026-05-28-add-role.sql`
```sql
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
```

**Production Schema** (verified via `PRAGMA table_info(users)`):
- `membership_label` ✅ (existed before)
- `preferred_language` ✅ (existed before)
- `role` ✅ (added by migration)
- `active` ✅ (existed before)

---

## 6. Critical Issue: Custom Domain Functions Not Routing

**Problem**: Custom domain (`nguyenlananh.com`) is returning Cloudflare error 1014 for API endpoints.

**Evidence (after re-deploy `fda878d3`)**:

| Endpoint | Custom Domain | Deployment URL |
|----------|---------------|----------------|
| `/api/auth/session` | Error 1014 | 401 ✅ |
| `/admin/` | 403 | 200 (should be 302) ❌ |
| `/api/auth/logout` | 403 | 200 ✅ |

**Error 1014**: "Origin is unreachable" - Cloudflare infrastructure issue indicating the origin server cannot be reached.

**Likely Causes**:
1. Custom domain SSL/TLS configuration mismatch (Full vs Full Strict)
2. DNS propagation issue
3. Cloudflare Pages custom domain not properly activated
4. Origin SSL certificate issue

**Impact**:
- All API endpoints blocked on custom domain
- Member login/payment flows will fail on production domain
- Admin middleware not accessible on custom domain

**Required Action**:
- Check Cloudflare Pages dashboard → Custom Domains → Verify SSL mode
- Check DNS records for `nguyenlananh.com` and `www.nguyenlananh.com`
- Verify custom domain is "Active" in Pages project settings

---

## 7. Secondary Issue: `/admin/` Middleware Not Redirecting

**Problem**: On deployment URL (`pages.dev`), `/admin/` returns 200 instead of 302 redirect to `/members/`.

**Evidence**:
- `/admin/` → 200 (serves static `admin/index.html`)
- Expected: 302 → `/members/` (middleware redirect)

**Likely Cause**:
- Static `admin/index.html` is being served directly without invoking `_middleware.js`
- Cloudflare Pages may prioritize static files over Functions middleware
- Middleware path matching issue

**Impact**:
- Admin console accessible without authentication on deployment URL
- Security bypass on preview/deployment URLs (though custom domain is blocked by error 1014)

**Required Action**:
- Verify `_middleware.js` is in correct location (`functions/_middleware.js`)
- Check if Pages Functions middleware is properly configured
- May need to move admin console to Functions-only routing

---

## 8. Conclusion

**Status**: ⚠️ **PARTIAL** — Custom domain reachable but Functions not routing

| Category | Status |
|----------|--------|
| Domain reachability | ✅ PASS |
| SEO/robots | ✅ PASS |
| D1 binding | ✅ PASS |
| D1 schema | ✅ PASS |
| Functions on deployment URL | ⚠️ PARTIAL (2/3 pass) |
| Functions on custom domain | ❌ FAIL (0/3 pass) |

**Blocking P3-1 (Admin/member workflow)**: Custom domain Functions must work before testing real user flows.

---

## 8. Next Steps

1. **Investigate custom domain Functions routing** — Check Cloudflare Pages dashboard for custom domain configuration
2. **Re-deploy if needed** — Force re-deploy to sync Functions to custom domain
3. **Re-run evidence packet** — Verify custom domain Functions work
4. **Then proceed to P3-1** — Admin/member real workflow test
