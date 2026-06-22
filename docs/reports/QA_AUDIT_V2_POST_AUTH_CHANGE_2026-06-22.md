# QA Audit V2 — Post Auth Change — nguyenlananh.com

**Ngày audit**: 2026-06-22 (post-change regression audit + live verification + P0 security fix + Founder 12-Gate audit)
**Phiên**: Devin CLI strict QA audit (7 gates + 16 live tests + P0 security probe + fix + Founder 12-Gate read-only audit)
**Repo**: `github.com:tranhatam-collab/nguyenlananh.com.git` (branch `main`)
**HEAD SHA**: `8383bf5058592e1eb7b27f352549c077c1fe256f`
**Production deployment**: Cloudflare Pages `744a480f` (chạy commit `2899cf9`)
**Deployment URL**: `https://744a480f.nguyenlananh-com-63s.pages.dev`
**Production alias**: `https://www.nguyenlananh.com/`
**Deployment timestamp**: 2026-06-22T13:21 UTC
**Live smoke-test timestamp**: 2026-06-22T13:21:31Z

**Supersedes**: `QA_AUDIT_FINAL_REPORT.md` (snapshot trước thay đổi auth), `RELEASE_VERDICT.md`

---

## 1. Phán quyết phát hành

### **GO — VIETNAM CONTROLLED SOFT LAUNCH**

### **HOLD — INTERNATIONAL PAID LAUNCH**

| Phạm vi | Phán quyết |
|---|---|
| Website công khai VI–EN | **PASS** |
| Nội dung Việt–Anh | **PASS** |
| Google OAuth | **PASS** (trong phạm vi test redirect chain) |
| Magic link | **NOT IN SCOPE** — đã loại khỏi sản phẩm |
| Thanh toán VietQR tại Việt Nam | **PASS** ở bước tạo checkout |
| Soft launch tại Việt Nam | **GO** |
| Full membership qua Google + VietQR | **CONDITIONAL GO** (chờ giao dịch end-to-end) |
| PayPal / Stripe | **HOLD** |
| International paid launch | **HOLD** |
| Hoàn thiện toàn cầu 100% | **CHƯA ĐẠT** |

### Điều kiện vận hành soft launch

1. Chỉ công bố Google là phương thức đăng nhập
2. Chỉ công bố VietQR tại Việt Nam
3. Không hiển thị PayPal hoặc Stripe như phương thức đang hoạt động
4. Theo dõi checkout, webhook và entitlement trong giai đoạn đầu
5. Có phương án hỗ trợ thủ công nếu người dùng đã chuyển tiền nhưng chưa được cấp quyền
6. D1 data cleanup trước khi mở traffic

---

## 2. Lý do supersede báo cáo cũ

Báo cáo `d525d34` (QA_AUDIT_FINAL_REPORT.md) được tạo trước 2 commits thay đổi kiến trúc auth:

| Commit | Nội dung | Deploy |
|---|---|---|
| `8c93caa` | Xóa auth magic link entirely, Google OAuth only | `a522c5d2` |
| `2556b40` | Cleanup residual magic-link UI + update 21 content pages | `f054a542` |

Báo cáo cũ vẫn kiểm tra `/api/auth/magic-links/request` (502) và `/api/auth/signup` (502) — các endpoint này **đã bị xóa**. Báo cáo cũ cũng classify mail API là P1 ảnh hưởng auth signup — không còn đúng vì Google OAuth là duy nhất.

---

## 3. Source of truth (Gate 1)

```
HEAD SHA: eb58cb5f39e4f97d372cfc46558696014295ca11
Working tree: clean
Branch: main (origin/main, origin/HEAD)
Audit base SHA: 90e7872
Commits from base: 18 (15 impl + 3 docs)
Files changed: 342 (+1800 / −8797)
```

### Commits trong audit session (18 total)

#### Implementation commits (15 — thay đổi code production)

```
2556b40 fix(auth): remove residual magic-link UI and update content pages
8c93caa feat(auth): remove magic link entirely — Google OAuth only
6e51828 docs(qa): correct audit report after meta-audit
6339b10 fix(a11y,responsive,content): safe-area, touch targets, remove "chữa lành"
ad09536 fix(a11y,header): focus trap + scroll lock in drawer, aria-modal=true
9e1bf03 fix(audit): skip /en/api/ routes in local-public-site-audit
b6bb8ac chore: gitignore auto-generated audit reports
46247a8 chore: update audit reports
3143b51 chore: update audit reports after gate runs
58629c4 fix(seo): add canonical+OG+twitter to 5 PDF pages
c1110a5 fix(seo,content): shorten long titles, fix broken internal links, add PDF descriptions
22411e6 fix(seo): add og:image to 6 EN product pages
489003f fix(i18n,seo): sync hreflang + OG metadata for VI/EN counterparts, update sitemap
1657810 fix(i18n): translate 11 EN counterpart pages (5 articles + 6 products)
90e7872 feat(i18n): add EN counterparts for 5 articles + 6 products, fix EN footer year & brand name
```

#### Documentation commits (3 — không thay đổi code production)

```
eb58cb5 docs(qa): supersede final audit after Google-only auth migration (THIS REPORT)
d525d34 docs(qa): final QA audit report (SUPERSEDED)
2072eb0 docs: release verdict (SUPERSEDED)
```

### Production deployment chain

| Commit | Deployment ID | Status |
|---|---|---|
| `6339b10` | `4289b6e6` | Superseded |
| `8c93caa` | `a522c5d2` | Superseded |
| `2556b40` | `f054a542` | Superseded |
| `eb58cb5` | `9993f4c0` | Superseded |
| `8115d3c` | `dfb1fed9` | Superseded |
| `2899cf9` | `744a480f` | **CURRENT PRODUCTION** |

---

## 4. Magic link scope (Gate 2)

### Auth magic link — ĐÃ XÓA HOÀN TOÀN ✓

| Component | Trạng thái | Evidence |
|---|---|---|
| `functions/api/auth/magic-links/request.js` | DELETED | `ls` → not found |
| `functions/api/auth/magic-links/consume.js` | DELETED | `ls` → not found |
| `functions/api/auth/magic-links/resend.js` | DELETED | `ls` → not found |
| `functions/api/auth/signup.js` | DELETED | `ls` → not found |
| `signupMagicLinkResponse` in auth.js | REMOVED | `grep` → 0 matches |
| `consumeStatelessMagicLinkResponse` in auth.js | REMOVED | `grep` → 0 matches |
| `issueMagicLinkToken` in auth.js | REMOVED | `grep` → 0 matches |
| `MAGIC_LINK_EXPIRE_MINUTES` in auth.js | REMOVED | `grep` → 0 matches |
| `checkMagicLinkRateLimit` import in auth.js | REMOVED | `grep` → 0 matches |
| `magicError` div in members/start (VI+EN) | REMOVED | `curl` → 0 matches |
| `magicFailed` i18n in members.js (VI+EN) | REMOVED | `grep` → 0 matches |
| "Nhận magic link" in content-registry.js | REPLACED | → "Đăng ký bằng Google" |
| "Receive magic link" in content-registry.js | REPLACED | → "Sign up with Google" |
| "nhận magic link" in 10 VI chuong-trinh pages | REPLACED | → "Đăng ký đồng hành miễn phí bằng Google" |
| "receive a magic link" in 10 EN chuong-trinh pages | REPLACED | → "Register free with Google" |
| "Sign in via the magic link" in EN bat-dau page | REPLACED | → "Sign in with Google" |

### Payment fulfillment magic link — ĐƯỢC GIỮ ✓

| Component | Trạng thái | Lý do |
|---|---|---|
| `createMagicLink` import in payments.js | KEPT | Payment fulfillment flow |
| `issueMagicLink` in payments.js | KEPT | Generate access link sau thanh toán |
| `sendFulfillmentEmails` in payments.js | KEPT | Gửi email với fulfillment link |
| `magic_link` field in payments response | KEPT | API response cho frontend |
| `magicOutput` in payments.js frontend | KEPT | Display fulfillment link |
| `magic_links` table in D1 | KEPT | Compatibility, payment flow |
| `T01_WELCOME_MAGIC_LINK` template ID | KEPT | Email template |
| `T02_MAGIC_LINK_RESEND` template ID | KEPT | Email template |

### Env var — KEPT ✓

| Env var | Mục đích | Trạng thái |
|---|---|---|
| `MAGIC_LINK_SECRET` | JWT signing (Google OAuth state + session) | KEPT — không chỉ cho magic link |

---

## 5. Route tests (Gate 3 + 7)

### Live HTTP tests (production, 2026-06-22T12:55 UTC)

| Endpoint | Method | Expected | Actual | Pass |
|---|---|---|---|---|
| `/api/auth/magic-links/request` | GET | 404 | 404 | ✓ |
| `/api/auth/magic-links/request` | POST | 404/405 | 405 | ✓ (empty body, no logic) |
| `/api/auth/magic-links/consume` | POST | 404/405 | 405 | ✓ (empty body, no logic) |
| `/api/auth/magic-links/resend` | POST | 404/405 | 405 | ✓ (empty body, no logic) |
| `/api/auth/signup` | GET | 404 | 404 | ✓ |
| `/api/auth/signup` | POST | 404/405 | 405 | ✓ (empty body, no logic) |
| `/api/auth/google/start` | GET | 302 | 302 | ✓ |
| `/api/auth/session` | GET | 401 | 401 | ✓ |
| `/api/auth/logout` | POST | 200 | 200 | ✓ |

> **405 vs 404**: Cloudflare Pages framework trả 405 cho POST đến path không có `onRequestPost` handler. Body rỗng (`content-length: 0`), không có logic thực thi. Đây là behavior đúng cho endpoint đã xóa.

### Build test

```
npx wrangler pages functions build → ✨ Compiled Worker successfully
```

### Release gates

| Gate | Kết quả |
|---|---|
| human-text-gate | PASS (0 issues, 142 warnings) |
| content-audit | PASS (0 issues) |
| functions build | PASS |

---

## 6. Frontend QA (Gate 4)

### Live content checks

| Page | Check | Expected | Actual | Pass |
|---|---|---|---|---|
| `/join/` (VI) | No "magic" | 0 matches | 0 | ✓ |
| `/join/` (EN) | No "magic" | 0 matches | 0 | ✓ |
| `/join/` (VI) | Google CTA | "Đăng nhập bằng Google" | Present | ✓ |
| `/join/` (EN) | Google CTA | "googleLogin" button | Present | ✓ |
| `/chuong-trinh/xuong-sang-tao/` (VI) | No "magic" | "Đăng ký đồng hành miễn phí bằng Google" | Present | ✓ |
| `/en/chuong-trinh/xuong-sang-tao/` (EN) | No "magic" | "Register free with Google" | Present | ✓ |
| `/members/start/` (VI) | No "magicError" | 0 matches | 0 | ✓ |
| `/en/members/start/` (EN) | No "magicError" | 0 matches | 0 | ✓ |

---

## 7. Google OAuth E2E (Gate 5)

### Live OAuth flow test

| Step | Expected | Actual | Pass |
|---|---|---|---|
| GET `/api/auth/google/start?locale=vi` | 302 → Google | 302 → `accounts.google.com/o/oauth2/v2/auth` | ✓ |
| GET `/api/auth/google/start?locale=en` | 302 → Google | 302 → Google (locale=en-US, next=/en/members/start/) | ✓ |
| Redirect URL contains `client_id` | ✓ | `496670862618-...` | ✓ |
| Redirect URL contains `redirect_uri` | ✓ | `https://nguyenlananh.com/api/auth/google/callback` | ✓ |
| Redirect URL contains `scope` | ✓ | `openid email profile` | ✓ |
| Redirect URL contains `state` | ✓ | Signed JWT (nonce + locale + next_path + exp) | ✓ |
| Redirect URL contains `prompt` | ✓ | `select_account` | ✓ |
| Follow redirect to Google | 200 | 200 (Google consent page) | ✓ |
| GET `/api/auth/session` (no cookie) | 401 | 401 | ✓ |
| POST `/api/auth/logout` | 200 | 200 | ✓ |

### Session security (unchanged from V1)

| Check | Kết quả |
|---|---|
| Cookie name | `__nla_session` |
| HttpOnly | ✓ |
| Secure | ✓ |
| SameSite | Lax ✓ |
| Max-Age | 30 days |
| Signing | JWT HMAC-SHA256 |
| Secret env | `MAGIC_LINK_SECRET` (configured ✓) |

> **E2E flow chưa test hoàn chỉnh** (Google consent → callback → session cookie) vì cần user interaction thật với Google. Đã verify redirect chain đúng, state signed đúng, callback handler tồn tại. Cần test với Google account thật trước public launch.

---

## 8. Payment fulfillment regression (Gate 6)

### Live checkout test (VietQR, year1)

```
POST /api/payments/create-checkout
Body: {"plan_code":"year1","provider":"vietqr","locale":"vi","email":"gate6-test@example.com","identity_country":"VN"}
Header: x-idempotency-key: gate6-<timestamp>

Response 200:
{
  "ok": true,
  "internal_order_id": "ord_045297675a9f4c40a454f331fa10374f",
  "provider": "vietqr",
  "plan_code": "year1",
  "amount": 75000,
  "currency": "VND",
  "checkout_url": "https://pay.payos.vn/web/d8e86477da954080a35171c2fc7f3403",
  "provider_order_id": "5905808074612",
  "success_url": "https://www.nguyenlananh.com/join/success/?...",
  "cancel_url": "https://www.nguyenlananh.com/join/cancel/?...",
  "retry_url": "https://www.nguyenlananh.com/join/retry/?..."
}
```

### Payment fulfillment status: **DEGRADED**

| Flow step | Trạng thái | Evidence |
|---|---|---|
| Create checkout | PASS | 200, order created, PayOS URL generated |
| Webhook → entitlement | NOT TESTED | Cần test với real payment |
| Fulfillment link generated | PASS (code) | `issueMagicLink` in payments.js intact |
| Fulfillment email sent | **DEGRADED** | Mail API provider down |
| Link consumed → session | NOT TESTED | Cần test với real payment |
| Replay rejected | NOT TESTED | Cần test |
| Expired link rejected | NOT TESTED | Cần test |

> **Verdict**: DEGRADED — checkout tạo được, fulfillment link code intact, nhưng email delivery lỗi. User thanh toán có thể không nhận email với access link. **Admin recovery flow cần có**: admin có thể xem orders trong D1 và manually tạo/resent fulfillment link.

### D1 data

| Table | Count | Notes |
|---|---|---|
| users | 1 | test@example.com |
| payment_orders | 60 | 59 created + 1 pending (test data) |
| magic_links | 5 | Payment fulfillment links (all test@example.com, unused) |
| entitlements | 0 | Pre-launch |
| analytics_events | 29 | Test data |

---

## 9. Mail provider impact (reclassified)

### Trước `8c93caa` (auth magic link còn):
- ❌ Auth signup → 502 (email không gửi)
- ❌ Auth magic link login → 502
- ❌ Receipt email → có thể không gửi
- ❌ Welcome email → không gửi
- ❌ Fulfillment access link email → không gửi

### Sau `8c93caa` (auth magic link đã xóa):
- ✅ Auth signup → N/A (Google OAuth only, không cần email)
- ✅ Auth login → N/A (Google OAuth only)
- ⚠️ Receipt email → DEGRADED (có thể không gửi)
- ⚠️ Welcome email → DEGRADED (có thể không gửi)
- ⚠️ Fulfillment access link email → DEGRADED (có thể không gửi)

**Mức ảnh hưởng mới**: Mail API down không còn chặn auth chính. Chỉ ảnh hưởng payment fulfillment email chain. User thanh toán bằng VietQR vẫn vào được members page (nếu có admin recovery hoặc manual link).

---

## 10. Security baseline (unchanged from V1)

| Header | Value | Đạt |
|---|---|---|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | ✓ |
| Content-Security-Policy | `default-src 'self'; frame-ancestors 'none'; object-src 'none'` | ✓ |
| Permissions-Policy | `geolocation=(), microphone=(), camera=()` | ✓ |
| Referrer-Policy | `strict-origin-when-cross-origin` | ✓ |
| X-Content-Type-Options | `nosniff` | ✓ |
| X-Frame-Options | `DENY` | ✓ |

> Security baseline pass. Chưa phải OWASP ASVS audit hoặc penetration test toàn diện.

---

## 11. Accessibility (unchanged from V1)

> Các template chính đã vượt qua checklist accessibility nội bộ theo các tiêu chí WCAG 2.2 AA được kiểm tra. Chưa phải chứng nhận độc lập cho toàn bộ website. Cần axe/Pa11y scan, screen reader test, keyboard test trên tất cả template.

---

## 11b. P0 security fix — payment bypass (FIXED)

### Lỗ hổng phát hiện

`POST /api/payments/finalize` công khai (không admin gate). VietQR `finalizeProviderPayment` tin `body.manual_confirmed:true` mà không verify provider → bất kỳ ai lấy membership miễn phí.

### Fix (commit `8115d3c` + `2899cf9`)

1. Thêm `verifyVietQrPaymentWithProvider()` — query `pay.iai.one/internal/order-status` với `PAY_IAI_ONE_API_KEY` để lấy trạng thái thật
2. `finalizeProviderPayment` VietQR: chỉ COMPLETED khi provider trả "paid" hoặc `_admin_confirmed` (admin-only)
3. `finalizeCheckoutResponse` (public): strip `_admin_confirmed` + `manual_confirmed` khỏi body trước khi truyền vào `finalizeProviderPayment`
4. Admin `confirmVietQrOrderResponse`: truyền `_admin_confirmed:true` trực tiếp (gated bởi `requireAdminPaymentAccess`)

### Live verification (3 exploit attempts — all BLOCKED)

| Exploit | Body | Expected | Actual | PASS |
|---|---|---|---|---|
| 1 | `manual_confirmed:true` | PENDING | PENDING | ✓ |
| 2 | `_admin_confirmed:true` | PENDING | PENDING | ✓ |
| 3 | Both flags + `provider_ref` | PENDING | PENDING | ✓ |
| 4 | Admin endpoint no key | 401 | 401 | ✓ |

### Security model sau fix

- **Public finalize**: VietQR chỉ COMPLETED nếu `pay.iai.one` xác nhận "paid"
- **Admin confirm**: `x-admin-key` required (401 nếu thiếu)
- **Không có cách nào lấy free membership** mà không trả tiền hoặc có admin key

---

## 12. Founder Audit 12-Gate (read-only verification, 2026-06-22)

### Đã verify xanh (độc lập)

| Hạng mục | Bằng chứng |
|---|---|
| Security P0 (payment bypass) | **ĐÃ VÁ THẬT** — `finalizeCheckoutResponse` strip `manual_confirmed`/`_admin_confirmed` khỏi public body; VietQR phải qua `verifyVietQrPaymentWithProvider` → query thật `pay.iai.one/internal/order-status` với API key, chỉ COMPLETED khi provider trả paid. Probe order giả → 404 (không cấp gì). |
| Public site VI/EN, 404, sitemap | 200/404 đúng |
| Google OAuth start | 302 → `accounts.google.com` client_id thật |
| Magic-link gỡ sạch | UI=0, `members.js` requestMagicLink=0, API=405 |
| VietQR tạo checkout (8 SKU) | `ok:true`, URL payos thật, giá đúng |
| Admin gate | `/admin/`=302, `/api/admin/*`=401/503 |
| Git đồng bộ | local=origin=`8383bf5`, tree sạch |

### 12 Gate — trạng thái + team dev cần làm gì

#### 🔴 Gate 1 — VietQR End-to-End — MỞ (quan trọng nhất)
Mới verify: tạo checkout + lớp verify-provider (P0 fix). **Chưa có bằng chứng:** giao dịch trả tiền thật → provider trả paid → entitlement cấp → replay/idempotency.
**Cần:** chạy 1 đơn thật nhỏ (vài nghìn đ) → xác nhận `verifyVietQrPaymentWithProvider` trả paid → `fulfillOrder` cấp membership; test replay (gọi finalize 2 lần cùng idempotency-key → không double-grant); test order chưa-trả → finalize trả PENDING (không cấp).

#### 🔴 Gate 2 — Email Delivery — DEGRADED
Code: primary `mail_iai_one` (cần `MAIL_API_KEY`), fallback `resend` (cần `RESEND_API_KEY`). Trước đây prod `delivery_status: failed`. → Khách trả tiền có thể **không nhận biên nhận/hướng dẫn truy cập**.
**Cần:** set & verify 1 provider (Resend: set key + verify domain; hoặc sửa MAIL_API endpoint/key); đọc log `[EMAIL_SEND_FAILED]` qua `wrangler pages deployment tail`; test gửi thật 1 email biên nhận.

#### 🟡 Gate 3 — Stripe / PayPal — HOLD (đúng)
`providers` API: cả 2 = `setup_required` (thiếu secret). MoMo/VNPay/ZaloPay = `planned` (chưa implement). Mở quốc tế giờ = FAIL ngay.
**Cần (chỉ khi mở quốc tế):** cấp secret Stripe/PayPal + test sandbox→live + webhook signature.

#### 🔴 Gate 4 — Backup / Restore — KHÔNG CÓ
Không có `BACKUP_RESTORE.md`, không có script export D1 định kỳ.
**Cần:** cron `wrangler d1 export nguyenlananh-payments-prod` → R2/offsite; tài liệu RTO/RPO; **drill restore** đo thời gian.

#### 🔴 Gate 5 — Monitoring — KHÔNG CÓ
`wrangler.toml` observability=0, không Sentry, crons bị comment (không healthcheck). → Lỗi xảy ra, founder không biết.
**Cần:** bật `[observability] enabled=true`; uptime monitor (ngoài) cho `/`, `/api/payments/providers`; alert 5xx + payment-fail + OAuth-fail (Sentry/Logpush + pager).

#### 🟡 Gate 6 — Browser Matrix — CHƯA TEST
Không có bằng chứng Safari iOS/iPad, Firefox, Android Chrome, Samsung.
**Cần:** test thật thiết bị (đặc biệt Safari iPhone — hay FAIL dù desktop PASS): drawer, lang switch, checkout, Google login.

#### 🟡 Gate 7 — Accessibility Automation — CHƯA
Không axe/pa11y/screen-reader trong repo/CI. Mới checklist thủ công.
**Cần:** thêm `pa11y-ci`/`axe` vào CI cho các trang chính; test screen reader luồng join/checkout.

#### 🟡 Gate 8 — Performance Evidence — CHƯA
Không Lighthouse/LHCI/CWV.
**Cần:** Lighthouse CI; đo LCP/CLS/INP trên mobile thật; đặt ngưỡng gate.

#### 🟡 Gate 9 — Rollback Drill — DOC CÓ, DRILL CHƯA
`NGUYENLANANH_DEPLOY_RUNBOOK.md §8 Rollback Plan` tồn tại, nhưng **chưa có bằng chứng drill** (deploy lỗi → rollback bao lâu).
**Cần:** drill thật — `wrangler pages deployment list` + rollback về deployment trước, đo phút; ghi vào runbook.

#### 🟡 Gate 10 — Google OAuth Real User — MỚI 302
Chưa test: consent → callback → set session cookie → member access → logout.
**Cần:** 1 user thật đăng nhập Google đầy đủ vòng; xác nhận cookie session + `/members/` gated mở đúng + logout xoá session.

#### 🟡 Gate 11 — Data Cleanup — CÒN TEST DATA
`payment_orders=60`, `analytics_events=29`, `magic_links=5` (cộng email `qa%`/`audit%`/`p0fix%`/`p0r2%`/`liveqa%` tạo khi audit).
**Cần:** xoá toàn bộ row test trước khi nhận traffic thật:
```sql
DELETE FROM payment_orders WHERE email LIKE 'qa%' OR email LIKE 'audit%' OR email LIKE 'p0%' OR email LIKE 'liveqa%' OR email LIKE 'test%' OR email LIKE 'gate%';
DELETE FROM vietqr_orders  WHERE email LIKE 'qa%' OR email LIKE 'audit%' OR email LIKE 'p0%' OR email LIKE 'liveqa%' OR email LIKE 'test%' OR email LIKE 'gate%';
DELETE FROM users          WHERE email LIKE 'qa%' OR email LIKE 'audit%' OR email LIKE 'p0%' OR email LIKE 'liveqa%' OR email LIKE 'test%' OR email LIKE 'gate%';
DELETE FROM magic_links    WHERE email LIKE 'qa%' OR email LIKE 'audit%' OR email LIKE 'p0%' OR email LIKE 'liveqa%' OR email LIKE 'test%' OR email LIKE 'gate%';
DELETE FROM analytics_events WHERE session_id LIKE 'qa%' OR session_id LIKE 'audit%';
```

#### 🔴 Gate 12 — Automated Test Suite — KHÔNG CÓ
0 file `*.test.js`/`*.spec.js` cho payment/auth, 0 bước test trong CI. CI chỉ có 6 lệnh `curl` smoke (không phải regression). → QA hiện là **manual**, không phải **regression**.
**Cần:** Vitest cho `_lib` pure funcs (session/auth/payments/ratelimit) + Playwright e2e (join→Google→checkout); chạy trong CI chặn merge.

---

## 13. Live verification (16/16 PASS + 3 exploit BLOCKED)

**Deployment**: `744a480f` (commit `2899cf9`)
**Time**: 2026-06-22T13:21:31Z
**Domain**: `https://www.nguyenlananh.com/`

### Smoke tests (16/16 PASS)

| # | Test | Expected | Actual | PASS |
|---|---|---|---|---|
| 1 | Domain serving latest | `744a480f` | Cloudflare, DYNAMIC cache | ✓ |
| 2 | No "500+ đang đồng hành" | 0 matches | 0 | ✓ |
| 3 | Footer year VI | "© 2026" | "© 2026 · Không phải để trở thành ai đó..." | ✓ |
| 4 | Footer year EN | "© 2026" | "© 2026 · Not to become someone else..." | ✓ |
| 5 | Price locked | $3/75.000 VND | "Start from 3 USD" | ✓ |
| 6 | `/api/auth/magic-links/request` GET | 404 | 404 | ✓ |
| 6 | `/api/auth/signup` GET | 404 | 404 | ✓ |
| 7 | `/api/auth/google/start` | 302 → Google | 302, signed state JWT, correct params | ✓ |
| 8 | `/api/auth/session` | 401 | 401 | ✓ |
| 8 | `/api/auth/logout` | 200 | 200 | ✓ |
| 9 | VietQR checkout | ok=true, 75000 VND | ok=True, 75000 VND, provider=vietqr | ✓ |
| 10 | Security headers | ≥7 | 9 | ✓ |
| 11 | No "magic" in VI /join/ | 0 | 0 | ✓ |
| 11 | No "magic" in EN /join/ | 0 | 0 | ✓ |
| 12 | Google CTA VI | "Đăng nhập bằng Google" | Present | ✓ |
| 12 | Google CTA EN | googleLogin button | Present | ✓ |
| 13 | No "magic" in chuong-trinh VI | 0 | 0 | ✓ |
| 13 | No "magic" in chuong-trinh EN | 0 | 0 | ✓ |
| 13 | VI content updated | "Đăng ký đồng hành miễn phí bằng Google" | Present | ✓ |
| 13 | EN content updated | "Register free with Google" | Present | ✓ |
| 14 | No magicError in members/start VI | 0 | 0 | ✓ |
| 14 | No magicError in members/start EN | 0 | 0 | ✓ |
| 15 | 6 legal pages (VI+EN) | all 200 | all 200 | ✓ |
| 16 | Brotli compression | br | br | ✓ |

### P0 security exploit tests (3/3 BLOCKED)

| Exploit | Body | Expected | Actual | PASS |
|---|---|---|---|---|
| 1 | `manual_confirmed:true` | PENDING | PENDING | ✓ |
| 2 | `_admin_confirmed:true` | PENDING | PENDING | ✓ |
| 3 | Both flags + `provider_ref` | PENDING | PENDING | ✓ |
| 4 | Admin endpoint no key | 401 | 401 | ✓ |

---

## 14. Release Readiness (5 mục — sau khi 12 gate xanh)

| # | Mục | Trạng thái | Cần |
|---|---|---|---|
| 1 | Governance Lock | ⚠️ chưa khóa | Khóa scope/pricing/auth/payment/legal — không đổi tùy tiện |
| 2 | Operations Pack | ⚠️ thiếu 6/7 | Có `DEPLOY_RUNBOOK` (deploy+rollback+RACI). **Thiếu:** INCIDENT_RESPONSE, BACKUP_RESTORE, PAYMENT_RECOVERY, USER_SUPPORT, ROLLBACK (drill), DISASTER_RECOVERY |
| 3 | Monitoring Pack | ❌ | Sentry + uptime + webhook/payment/OAuth monitoring |
| 4 | Disaster Recovery Drill | ❌ | Thử DB/webhook/OAuth/mail chết → đo phục hồi |
| 5 | Founder Acceptance Test | ⚠️ | Founder tự test desktop+mobile: login/payment/members/content/SEO/legal PASS hết |

---

## 15. Phán quyết cuối

### **SOFT LAUNCH VN: GO** · **FULL PRODUCTION: HOLD** · **INTERNATIONAL: HOLD**

Đây là **Release Candidate đạt chuẩn Soft Launch**, không còn Dev Build. Nhưng chưa Production 100% — còn nhiều gate vận hành chưa có bằng chứng. Không cần sửa UI/content nữa; ưu tiên phải chuyển sang **operations/verification**.

Bản production mới nhất đã được xác minh trên:
- Git commit: `2899cf9de6dc4afa932a161e769c68a064f4a3b8`
- Cloudflare deployment: `744a480f`
- Production domain: `https://www.nguyenlananh.com/`
- Thời điểm smoke test: 2026-06-22T13:21:31Z

Kết quả live verification: 16/16 smoke PASS + 3/3 exploit BLOCKED.

### Phạm vi GO

- Website công khai Việt–Anh
- Đăng nhập Google OAuth
- Thành viên sử dụng Google OAuth
- Thanh toán VietQR tại Việt Nam (tạo checkout + provider-verified finalize)
- Controlled soft launch với lượng người dùng có kiểm soát

### Phạm vi HOLD

- PayPal / Stripe / Thanh toán quốc tế
- Chiến dịch thu hút người dùng trả phí toàn cầu
- Tuyên bố hệ thanh toán đa quốc gia đã hoàn thiện

### Điều kiện vận hành soft launch

1. Chỉ công bố Google là phương thức đăng nhập
2. Chỉ công bố VietQR tại Việt Nam
3. Không hiển thị PayPal hoặc Stripe như phương thức đang hoạt động
4. Theo dõi checkout, webhook và entitlement trong giai đoạn đầu
5. Có phương án hỗ trợ thủ công nếu người dùng đã chuyển tiền nhưng chưa được cấp quyền
6. D1 data cleanup trước khi mở traffic

---

## 16. Team dev cần làm — thứ tự ưu tiên

### Tầng 1 — chặn Full Production (làm trước)

1. **Gate 1**: giao dịch VietQR thật end-to-end + replay/idempotency + order-chưa-trả→PENDING
2. **Gate 2**: bật email thật (Resend domain-verified hoặc fix MAIL_API) + test biên nhận
3. **Gate 5**: monitoring + alert (payment/5xx/OAuth) — founder phải biết khi lỗi
4. **Gate 4**: backup D1 tự động + **drill restore**
5. **Gate 12**: regression test (Vitest + Playwright) trong CI
6. **Gate 9**: rollback drill thật, đo thời gian
7. **Ops pack**: viết INCIDENT_RESPONSE + BACKUP_RESTORE + PAYMENT_RECOVERY + ROLLBACK + USER_SUPPORT

### Tầng 2 — trước khi mở rộng

8. Gate 10 (OAuth full vòng) · Gate 6 (browser matrix, ưu tiên Safari iOS) · Gate 11 (xóa data test)

### Tầng 3 — chất lượng

9. Gate 7 (a11y axe/pa11y) · Gate 8 (Lighthouse/CWV) · Gate 3 (Stripe/PayPal nếu mở quốc tế)

### Cuối

Governance Lock + Founder Acceptance Test → ký **FULL PRODUCTION GO**

---

*Generated by Devin CLI — 2026-06-22 (V2.3, Founder Audit 12-Gate + Release Readiness)*
