## REPORT — 2026-06-26 — Devin (GLM-5.2)

### Việc đã làm
- **P0-1 Google OAuth redirect_uri_mismatch**: User thêm `https://www.nguyenlananh.com/api/auth/google/callback` + apex variant vào Google Cloud Console → Authorized redirect URIs. Verify: `/api/auth/google/start` → 302 tới Google (không còn mismatch). `/api/auth/google/callback` (no code) → 302 `/members/?error=GOOGLE_CODE_REQUIRED` (string code, đúng pattern app).
- **P0-2 Source↔production drift**: Verify 4 lớp §2 — production = git HEAD (hash match 100%).
- **P0-3 "500+ đang đồng hành"**: 0 matches trên production (apex + www + preview).
- **P0-4 Unverified testimonials**: 0 matches "đang cập nhật bản xác thực" trên production.
- **P0-5 Footer year**: Hardcode `2026` trong 403 HTML files. JS null-check fix trong `home.js` (nguyên nhân crash → homepage trắng).
- **P0-6 Join page contradiction**: Bỏ "Xác nhận email xong..." (Google đã verify email). Thêm "Đã có tài khoản?" + Privacy/Terms links.
- **P0-7 Join page logged-in UI leak**: Verify `#alreadyMember` có `class="hidden"` đúng, JS chỉ remove khi có session.
- **P0-8 Double h1**: Verify chỉ 1 `<h1>` trên homepage (audit trước sai).
- **P0-9 Cloudflare email obfuscation**: JS-render email trên 4 trang (homepage, /lien-he/, /tai-lieu/, /chinh-sach-bao-mat/). 3 địa chỉ (lienhe@, support@, pay@) đều không còn bị obfuscate.
- **P0-10 Navigation inconsistency**: Standardize footer trên join, members, products, lien-he → cùng nav + legal links.
- **error=5 điều tra**: Source code KHÔNG bao giờ sinh `error=5` (grep toàn bộ `functions/` — tất cả error codes đều chữ: `SESSION_CREATE_FAILED`, `GOOGLE_CODE_REQUIRED`, `google_callback_failed`). `/members/?error=5` trả 200, page ignore param. → `error=5` không phải lỗi của app.

### Commit
- `42c67e6` — P0 fixes (footer year, join page, email obfuscation, nav)
- `9bb6654` — Critical JS crash fix (#year null → home.js crash → homepage trắng)
- `9924067` — AI_DEV_WORKING_RULES.md (docs only)
- `8bf2645` — Email obfuscation fix (homepage + tai-lieu + privacy)
- `76d6f41` — Email obfuscation fix (tai-lieu support@ + pay@)
- origin/main = `76d6f41`, sync: **yes**

### Deployment
- Latest deployment ID: `c4d7dfe6` (preview: `https://c4d7dfe6.nguyenlananh-com-63s.pages.dev`)
- Deploy lúc: 2026-06-26 ~11:00 UTC
- cf-cache-status: `DYNAMIC` (no caching — mỗi request lấy bản mới)
- cf-ray: `a1197423ae55e9e3-LAX`

### Verify (§2 — 4 lớp bằng chứng)
**(a) Deployment identity**: git HEAD = origin/main = `76d6f41` ✅
**(b) Live assertions (homepage)**:
- `500+` = **0** ✅
- `đang cập nhật bản xác thực` = **0** ✅
- `© 2026` = **1** ✅
- `Sống hết một đời` = **1** ✅
- `cdn-cgi/l/email-protection` = **0** ✅
- `<h1>` = `Sống hết một đời mà chưa từng hiểu mình<br/>mới là điều đáng tiếc nhất` ✅
**(c) Hash source vs prod**:
- Production: `8cf2193fc7a53909d0310283c47d28eabd3e6b688c5c8d2cdd25b389c0fb25c9`
- Source: `8cf2193fc7a53909d0310283c47d28eabd3e6b688c5c8d2cdd25b389c0fb25c9`
- **MATCH 100%** (diff = empty) ✅
**(d) Multi-host**:
- `https://nguyenlananh.com/`: 500+=0, obfuscation=0, ©2026=1, hero=1 ✅
- `https://www.nguyenlananh.com/`: 500+=0, obfuscation=0, ©2026=1, hero=1 ✅
- `https://c4d7dfe6.nguyenlananh-com-63s.pages.dev/`: 500+=0, obfuscation=0, ©2026=1, hero=1 ✅
- **3/3 hosts nhất quán** ✅

**Email obfuscation trên tất cả trang**: `/`=0, `/lien-he/`=0, `/tai-lieu/`=0, `/chinh-sach-bao-mat/`=0 ✅

**Google OAuth**: start→302 Google ✅, callback→302 `error=GOOGLE_CODE_REQUIRED` (string, không phải số) ✅

### Còn lại / BLOCKED
- **BLOCKED: Turnstile prod keys** — User cần tạo widget thật trong Cloudflare dashboard + set production site/secret keys trong `turnstile-config.js`. Hiện tại hardening logic từ chối tất cả token nếu phát hiện test key (fail-closed). Forms không hoạt động cho đến khi có prod keys.
- **BLOCKED: Google OAuth end-to-end test** — Server-side verify OK (redirect URI accepted). Cần user test trong incognito: `/join/` → "Đăng nhập bằng Google" → chọn tài khoản → Allow → xem URL cuối + có vào members không.
- **BLOCKED: `error=5` nguồn gốc** — App không sinh error=5. Có thể từ redirect ngoài (PayPal, extension, URL cũ). Cần user test incognito để lấy URL thật.
- **PENDING (P1)**: Menu/IA mới, /bat-dau/ Start Here flow, member dashboard redesign — chờ user duyệt.

### PASS/HOLD
**PASS** cho P0-2 đến P0-10 (9 lỗi đã fix + verify 4 lớp).
**HOLD** cho P0-1 (Google OAuth) — server-side OK, cần user test end-to-end trong incognito để confirm.
**HOLD** cho Turnstile — cần user set prod keys.
**HOLD** cho `error=5` — không phải lỗi app, cần user test incognito để xác định nguồn thật.
