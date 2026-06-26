# KẾ HOẠCH TỔNG THỂ — BỎ ÉP PROFILE SAU LOGIN, VÀO THẲNG DASHBOARD

**Trạng thái:** CHỜ DUYỆT AUDIT (v2 — đã tiếp nhận 4 hiệu chỉnh)
**Source of truth tại thời điểm lập plan:** HEAD `69bcce9` (working tree sạch, 0 dirty)
**Vai thực thi:** Team Dev AI
**Vai duyệt:** Audit-QA
**Posture:** Chờ duyệt → mới làm. Không tự sửa code/commit/deploy trước khi có xác nhận.

---

## 0. BỐI CẢNH

- Gate 10 (Google login) đã PASS. `error=5` (btoa Latin1 crash) đã fix ở commit `69bcce9`.
- Working tree sạch: 0 dirty files, HEAD = origin/main = `69bcce9`.
- Deploy qua GitHub Actions (không deploy tay).
- Vấn đề còn lại: sau login Google, user đáp `/members/start/` (form Profile) thay vì `/members/dashboard/`. Free member bị ép quay về `/start` khi duyệt. `/start` không có lối thoát.

---

## 1. YÊU CẦU SẢN PHẨM (ĐÃ KHÓA)

Sau Google login → đáp **`/members/dashboard/`** (khu thành viên miễn phí, xem/mua sản phẩm).
Form Profile **không ép**; chỉ liên quan ở bước thanh toán/verify khi nghiệp vụ cụ thể cần.

---

## 2. PHẠM VI (LOCKED — 4 file code + test/docs)

| File | Loại | Thay đổi |
|---|---|---|
| `functions/_lib/auth.js` | code | B1 — dùng `localeToDashboardPath()` có sẵn, đổi 2 fallback |
| `assets/members.js` | code | B2 — `redirectFreeMemberToStart()` return false (KHÔNG xóa call site) |
| `members/start/index.html` | code | B3 — thêm nút "Để sau" + sửa copy |
| `en/members/start/index.html` | code | B3 — thêm nút "Skip for now" + sửa copy |
| `scripts/test-skip-profile.mjs` | test | 8 nhóm test (~24-35 assertions) |
| `docs/reports/QA_FLOW_SKIP_PROFILE_2026-06-26/` | docs | Evidence pack (sau verify) |

**KHÔNG ĐỤNG:** `_middleware.js`, payment, entitlement, DB migrations, pricing, admin auth, creator auth, certification logic.

---

## 3. CHỈ ĐẠO ĐÃ TIẾP NHẬN

### ĐC1 — B2: KHÔNG xóa call site
- Chỉ cho `redirectFreeMemberToStart()` `return false`.
- Call site duy nhất (dòng 1464: `if (redirectFreeMemberToStart(session)) return;`) trở thành no-op an toàn.
- Giữ hàm + call site nguyên trạng.

### ĐC2 — AC10: verify-không-được-phá, KHÔNG làm mới
- AC10 = chỉ kiểm tra luồng certification/contextual gate **không vỡ** sau thay đổi.
- **KHÔNG** làm mới hành vi contextual gate trong PR này.

### ĐC3 — B1: dùng `localeToDashboardPath()` có sẵn, không tạo helper trùng
- `utils.js:127` đã có `localeToDashboardPath(locale)` → trả `/members/dashboard/` hoặc `/en/members/dashboard/`.
- `normalizeNextPath()` (utils.js:181-187) đã dùng nó làm fallback.
- **KHÔNG tạo `membersHomePath()` mới.** Import `localeToDashboardPath` vào auth.js và dùng trực tiếp.

### ĐC4 — Evidence: deployment SHA, không hash server source từ live
- Không cố hash `functions/_lib/auth.js` từ live (Pages không serve source file).
- Dùng deployment ID + commit SHA + Actions run ID làm evidence.
- Static assets (members.js, HTML) có thể hash từ live nếu cần.

---

## 4. ROUTE ACCESS INVENTORY (BẮT BUỘC — theo yêu cầu Audit-QA)

### 4.1. Server-gated routes (middleware _middleware.js)

| Route pattern | Server gate | Anonymous status | Free member status |
|---|---|---|---|
| `/members/deep/*` (except index) | ✅ session + entitlement/membership | 302 → landing | 302 → landing |
| `/en/members/deep/*` (except index) | ✅ same | 302 → landing | 302 → landing |
| `/members/academy/*` | 301 → `/members/deep/*` (then gated) | 301 → 302 | 301 → 302 |

### 4.2. Already publicly accessible (200 to anonymous, NO server gate)

| Route | HTTP (anon) | Content type | Risk |
|---|---|---|---|
| `/members/` | 200 | Public landing | None — intended public |
| `/members/dashboard/` | 200 | Member dashboard | None — intended destination |
| `/members/start/` | 200 | Profile form | None — intended accessible |
| `/members/journey/` | 200 | Free journey content | None — free content |
| `/members/journey/day-1/` | 200 | Free journey day | None — free content |
| `/members/journey/day-2/` | 200 | Free journey day | None — free content |
| `/members/journey/day-7/` | 200 | Free journey day | None — free content |
| `/members/practice/` | 200 | Daily practice structure | None — free content |
| `/members/experience/` | 200 | Experience layer | None — free content |
| `/members/pilot/` | 200 | Pilot programs list | None — free content |
| `/members/reflection/` | 200 | Reflection page | None — free content |
| `/members/circle/` | 200 | Circle page | None — free content |
| `/members/security/` | 200 | Security settings | None — member settings |
| `/members/verify-2fa/` | 200 | 2FA verify page | None — auth flow |
| `/members/pro/` | 200 | **Premium layer index** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/reset/` | 200 | **Premium content (full modules)** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/inner/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/discipline/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/environment/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/creation/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/wealth/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/family/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/pro/children/` | 200 | **Premium content** | ⚠️ **PRE-EXISTING GAP** |
| `/members/creator-dashboard/` | 200 | Creator dashboard | None — creator flow |
| `/members/creator/` | 200 | Creator hub | None — creator flow |
| `/members/creator/guidelines/` | 200 | Creator guidelines | None — public docs |
| `/members/creator/library/` | 200 | Creator library | None — creator flow |
| `/members/creator/revenue-share/` | 200 | Revenue share info | None — public docs |
| `/members/creator/submit/` | 200 | Creator submit | None — creator flow |

### 4.3. EN parity

All `/en/members/**` routes mirror VI routes. Same classification applies.

### 4.4. Finding: `/members/pro/*` pre-existing security gap

**`/members/pro/*` (9 routes) chứa nội dung premium ("8 gói nâng cấp") nhưng KHÔNG có server-side gate.** Anonymous users (no cookies, no session) get HTTP 200 with full content right now, before any change.

`redirectFreeMemberToStart()` là client-side JS — không phải gate thật vì:
1. Anonymous (chưa login) → 200 + full content (không qua JS gate)
2. Content là static HTML → curl/view-source thấy hết
3. JS có thể disable

**No-op `redirectFreeMemberToStart()` KHÔNG thay đổi security posture** của `/members/pro/*` vì content đã public từ trước. Gap này pre-exist và nên fix trong PR riêng (thêm middleware gate cho `/members/pro/*`).

### 4.5. Conclusion for B2

No-op `redirectFreeMemberToStart()` is safe because:
- `/members/deep/*` (real paid content) → server-gated, unaffected
- `/members/pro/*` (premium content) → already 200 to anonymous, no-op doesn't change
- Other `/members/*` routes → free content, intended accessible

**Recommendation:** Separate PR to add server-side gates for `/members/pro/*` (out of scope here).

---

## 5. THỨ TỰ THỰC THI (6 bước)

### Bước 1 — Pre-flight check
- `git status` = 0 dirty
- `node --check functions/_lib/auth.js` + `assets/members.js` (baseline)
- Ghi SHA gốc: `69bcce9`

### Bước 2 — Sửa B1 (`functions/_lib/auth.js`)
- Import `localeToDashboardPath` từ `./utils.js` (thêm vào import list dòng 54)
- Dòng **156**: đổi `membersStartPath(locale)` → `localeToDashboardPath(locale)`
- Dòng **255**: đổi `membersStartPath(locale)` → `localeToDashboardPath(locale)`
- Giữ nguyên `membersStartPath` (vẫn dùng khi `next_path` chỉ định `/start`)
- `next_path` validation (`normalizeNextPath`) giữ nguyên — đã chặn open redirect
- `node --check`

### Bước 3 — Sửa B2 (`assets/members.js`)
- `redirectFreeMemberToStart()` → `return false` (dòng 1443-1454)
- **KHÔNG** tìm/xóa call sites — để nguyên (theo ĐC1)
- `node --check`

### Bước 4 — Sửa B3 (2 file HTML)
- `members/start/index.html`:
  - Thêm `<a class="ghost" href="/members/dashboard/">Để sau → vào khám phá</a>` cạnh nút Lưu
  - Sửa copy: "Profile đồng hành — tùy chọn. Bạn có thể bổ sung profile để hệ thống cá nhân hóa trải nghiệm và nhịp nhắc. Bạn cũng có thể để sau và vào thẳng khu thành viên. Một số nghiệp vụ thanh toán, xác minh hoặc chương trình chuyên biệt có thể yêu cầu thông tin riêng tại đúng thời điểm cần thiết."
- `en/members/start/index.html`:
  - Thêm `<a class="ghost" href="/en/members/dashboard/">Skip for now → explore</a>` cạnh nút Lưu
  - Sửa copy: "Companion profile — optional. You may complete your profile to personalize the experience and reminder settings, or skip it and continue to the member area. Certain payments, verification steps, or specific programs may request additional information only when required."

### Bước 5 — Test tự động (8 nhóm, ~24-35 assertions)
Tạo `scripts/test-skip-profile.mjs`:

**Nhóm 1 — OAuth destination (VI + EN)**
- Test helper `localeToDashboardPath("vi")` = `/members/dashboard/`
- Test helper `localeToDashboardPath("en-US")` = `/en/members/dashboard/`
- Test `normalizeNextPath(null, "vi")` = `/members/dashboard/`
- Test `normalizeNextPath(null, "en-US")` = `/en/members/dashboard/`

**Nhóm 2 — Valid next_path**
- `normalizeNextPath("/members/dashboard/", "vi")` = `/members/dashboard/`
- `normalizeNextPath("/members/deep/life-system-map/", "vi")` = `/members/deep/life-system-map/`
- `normalizeNextPath("/en/members/dashboard/", "en-US")` = `/en/members/dashboard/`
- `normalizeNextPath("/en/members/deep/life-system-map/", "en-US")` = `/en/members/deep/life-system-map/`

**Nhóm 3 — Open redirect (AC4)**
- `normalizeNextPath("https://evil.example", "vi")` = `/members/dashboard/`
- `normalizeNextPath("javascript:alert(1)", "vi")` = `/members/dashboard/`
- `normalizeNextPath("data:text/html,<x>", "vi")` = `/members/dashboard/`
- `normalizeNextPath("//evil.example", "vi")` = `/members/dashboard/`
- `normalizeNextPath("/\\evil.example", "vi")` = `/members/dashboard/`
- `normalizeNextPath("/members.evil.example/", "vi")` = `/members/dashboard/`
- `normalizeNextPath("/members/../../admin/", "vi")` = `/members/dashboard/`
- `normalizeNextPath("/%2f%2fevil.example", "vi")` = `/members/dashboard/`

**Nhóm 4 — No-op redirect (B2)**
- Source check: `redirectFreeMemberToStart` returns `false`
- Source check: call site at line 1464 still exists (no-op branch)

**Nhóm 5 — Free member navigation (live)**
- `curl /members/dashboard/` → 200 (not 302 to /start)
- `curl /members/journey/` → 200
- `curl /members/practice/` → 200
- `curl /members/experience/` → 200

**Nhóm 6 — Paid gate (live, specific status per route)**
- `curl /members/deep/rhythm-design-lab/` (anon) → 302 (to /programs/rhythm-design-lab/)
- `curl /members/deep/space-reset-practitioner/` (anon) → 302 (to /programs/space-reset-practitioner/)
- `curl /api/auth/session` (anon) → 401
- `curl /members/deep/` (index) → 200 (public index)

**Nhóm 7 — Profile skip button (live)**
- `curl /members/start/` → 200, contains `href="/members/dashboard/"`
- `curl /en/members/start/` → 200, contains `href="/en/members/dashboard/"`
- VI text contains "Để sau"
- EN text contains "Skip for now"

**Nhóm 8 — Checkout without profile (live)**
- `curl -X POST /api/payments/create-checkout` with dummy token → `TURNSTILE_FAILED` (correct fail-closed, no profile dependency in error)

Chạy local: `node scripts/test-skip-profile.mjs`

### Bước 6 — Commit + push + deploy qua Actions
- `git diff --check` (no conflict markers)
- `git status --short` (chỉ 4 file code + test/docs)
- Commit: `fix(auth): land Google users on member dashboard`
- Push main → GitHub Actions deploy (KHÔNG deploy tay)

---

## 6. ACCEPTANCE CRITERIA (12 điểm — phải đạt hết)

| AC | Mô tả | Verify method |
|---|---|---|
| AC1 | OAuth VI: state mặc định + callback cuối cùng đến `/members/dashboard/` | Live test: login Google ẩn danh → URL cuối = `/members/dashboard/` |
| AC2 | OAuth EN: đến `/en/members/dashboard/`, không bị đẩy về VI | Live test: login Google EN → URL cuối = `/en/members/dashboard/` |
| AC3 | Internal member `next_path` hợp lệ được giữ | Unit test `normalizeNextPath` |
| AC4 | External, encoded, traversal path đều không thoát member scope → fallback Dashboard | Unit test 8 cases (nhóm 3) |
| AC5 | Free member vào các route free/authenticated mà không tới `/start` | Live test: `curl /members/dashboard/` → 200 (không 302) |
| AC6 | Profile VI/EN render, lưu được, optional copy rõ, skip link đúng | Live test: `curl /members/start/` + `/en/members/start/` → 200 + contains skip link |
| AC7 | Mỗi paid route/API trả đúng status đã khóa (không dùng tập hợp 302/401/403 chung) | Live test per route (nhóm 6) |
| AC8 | Entitled user vào đúng lesson, không qua profile | Live test (cần user có entitlement — manual) |
| AC9 | Checkout → payment → entitlement không phụ thuộc profile | Live test: checkout API with dummy token → TURNSTILE_FAILED (no profile error) |
| AC10 | Certification gates trước/sau PR có cùng behavior | Live test: `/members/deep/practice-companion-level-1/` + `/members/deep/practice-method-designer/` (VI+EN) → same 302 as before |
| AC11 | Route inventory hoàn tất, pre-existing gaps documented, no-op không thay đổi security posture | Inventory §4 + finding §4.4 |
| AC12 | Deployment runtime SHA khớp commit được duyệt | GitHub Actions run SHA + Cloudflare deployment ID |

### AC7 — Expected status per route (không dùng tập hợp chung)

| Route | Caller | Expected |
|---|---|---|
| `/members/deep/rhythm-design-lab/` | anonymous | 302 → `/programs/rhythm-design-lab/` |
| `/members/deep/space-reset-practitioner/` | anonymous | 302 → `/programs/space-reset-practitioner/` |
| `/members/deep/practice-companion-level-1/` | anonymous | 302 → `/certification/practice-companion-level-1/` |
| `/members/deep/practice-method-designer/` | anonymous | 302 → `/certification/practice-method-designer/` |
| `/members/deep/` | anonymous | 200 (public index) |
| `/api/auth/session` | anonymous | 401 |
| `/api/payments/create-checkout` | anonymous, no token | 403 |

---

## 7. VERIFY §2 SAU DEPLOY (bắt buộc trước khi báo xong)

| Lớp | Check | Method |
|---|---|---|
| (a) Deployment | HEAD = origin/main, Actions success, 0 dirty | `git status` + GitHub API |
| (b) Assertions | Login VI → `/members/dashboard/` (không `/start`, không `?error=`) | Live browser test ẩn danh |
| (c) Hash | Static assets (members.js, 2 HTML) = HEAD = LIVE | `curl` + `shasum` |
| (d) Deployment SHA | Actions run SHA = Cloudflare deployment SHA = commit SHA | GitHub API + wrangler deployment list |

**Live test bắt buộc:**
- VI: `/join/` → Google → `/members/dashboard/`
- EN: `/en/join/` → Google → `/en/members/dashboard/`
- `/members/start/` → "Để sau" → `/members/dashboard/`
- `/members/deep/<paid>` ẩn danh → 302 (chưa lộ)
- Free member duyệt dashboard + products → không bị đá về `/start`

**Evidence method (ĐC4):**
- GitHub Actions run ID + checked-out SHA + deployment ID
- Không hash server source từ live (không khả thi)
- Static assets (members.js, HTML) có thể hash từ live
- Optional: `/api/version` endpoint hoặc deployment manifest

---

## 8. GUARDRAILS (chống "lỗi hoài")

1. Chỉ sửa 4 file code + test/docs — không đụng `_middleware.js`
2. Paid content gating server-side giữ nguyên (`/members/deep/*`)
3. Commit sạch → push → Actions deploy — **cấm deploy tay**
4. `git status` phải sạch trước commit
5. Không bulk replace, không đụng file ngoài scope
6. VI + EN parity bắt buộc
7. Không tuyên bố xong trước live verification
8. Không biến Profile thành security gate
9. Không dùng client-side redirect để bảo vệ paid content
10. Mọi DOM access phải có null safety nếu element không tồn tại trên mọi trang
11. Pre-existing gap `/members/pro/*` documented, not fixed in this PR
12. Evidence phân biệt REMOTE_GITHUB_VERIFIED / LOCAL_WORKTREE_REPORTED / CI_VERIFIED / LIVE_VERIFIED

---

## 9. RỦI RO + MITIGATION

| Rủi ro | Mitigation |
|---|---|
| `next_path` validation bị break → open redirect | Giữ nguyên `normalizeNextPath` logic, chỉ đổi fallback input |
| EN file không có nút Lưu cùng cấu trúc → layout hỏng | Đọc cả 2 file trước khi sửa, match DOM structure |
| Call site `redirectFreeMemberToStart` còn hoạt động | No-op `return false` → call site trở thành dead branch an toàn (ĐC1) |
| `/members/pro/*` lộ premium content | Pre-existing gap — content đã 200 cho anonymous từ trước. No-op không thay đổi. Document + recommend separate PR. |
| Dashboard trang rỗng → UX tệ | Scope này chỉ đổi landing, không redesign dashboard |

---

## 10. COMMIT MESSAGE

```
fix(auth): land Google users on member dashboard

- change default OAuth destination from profile start to dashboard
  (use existing localeToDashboardPath helper, no duplicate)
- stop client-side free-member redirects to profile onboarding (no-op)
- add optional skip links to VI and EN profile pages
- update profile copy to clarify it is optional
- preserve server-side entitlement gates for paid content

Note: /members/pro/* has pre-existing server-side gate gap
(documented in route inventory, not fixed in this PR).

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
```

---

## 11. EVIDENCE PACK (sau khi verify pass)

Tạo `docs/reports/QA_FLOW_SKIP_PROFILE_2026-06-26/`:
- commit SHA, deployment ID, Actions run ID, URL, timestamp
- HTTP status per route (nhóm 6)
- redirect chain sau login
- paid gate test
- checkout test
- git status sạch
- Evidence tags: REMOTE_GITHUB_VERIFIED / LOCAL_WORKTREE_REPORTED / CI_VERIFIED / LIVE_VERIFIED

---

## 12. ĐIỀU KIỆN DUYỆT

Tôi sẽ **chỉ bắt đầu làm** khi Audit-QA xác nhận:
- [ ] Phạm vi 4 file code OK
- [ ] Thứ tự 6 bước OK
- [ ] ĐC1 (B2 no-op, không xóa call site) OK
- [ ] ĐC2 (AC10 verify-only, không làm mới) OK
- [ ] ĐC3 (dùng `localeToDashboardPath` có sẵn, không tạo helper trùng) OK
- [ ] ĐC4 (deployment SHA evidence, không hash server source) OK
- [ ] Route inventory §4 OK (incl. pre-existing `/members/pro/*` gap documented)
- [ ] AC tăng từ 10 → 12 OK
- [ ] Guardrails OK
- [ ] Không redesign dashboard trong scope này

**Chờ duyệt. Không làm gì cho đến khi có xác nhận.**
