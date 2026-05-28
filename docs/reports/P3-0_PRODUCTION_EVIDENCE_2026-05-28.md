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

**Problem**: Custom domain (`nguyenlananh.com`) is serving static content but **NOT routing to Functions**. API endpoints return 404/405 instead of proper responses.

**Evidence**:
- Deployment URL (`pages.dev`) → Functions work ✅
- Custom domain → Functions fail ❌

**Likely Cause**:
1. Custom domain DNS pointing to older deployment
2. Cloudflare Pages routing not updated for custom domain
3. Functions bundle not deployed to custom domain edge

**Impact**:
- `/admin/` middleware not protecting routes on custom domain
- `/api/auth/*` endpoints not accessible on custom domain
- Member login/payment flows will fail on production domain

**Required Action**:
- Investigate Cloudflare Pages custom domain configuration
- Verify Functions are deployed to custom domain edge
- May need to re-deploy or force sync custom domain

---

## 7. Conclusion

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
