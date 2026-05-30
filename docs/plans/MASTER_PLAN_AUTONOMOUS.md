# MASTER PLAN — Autonomous Overnight Dev Loop (Kimi K2)

> **Đây là SINGLE SOURCE OF TRUTH.** Mọi agent (Kimi K2) đọc file này đầu mỗi vòng lặp.
> **Mục tiêu:** Hoàn thành 90–98% Tổng Kế Hoạch trong đêm, KHÔNG hỏi user, KHÔNG dừng, KHÔNG kẹt.
> **Ngày tạo:** 2026-05-30 · **Base commit:** `0e4ffb5` · **Branch làm việc:** `auto/overnight-2026-05-30`
> **Repo:** `git@github.com:tranhatam-collab/nguyenlananh.com.git` · **Remote:** `origin`

---

## 0. LUẬT TỐI CAO (đọc trước, không vi phạm)

1. **KHÔNG BAO GIỜ HỎI USER.** User đang ngủ. Mọi quyết định dùng "Decision Defaults" ở §4. Nếu vẫn mơ hồ → chọn phương án ÍT RỦI RO NHẤT, ghi log, đi tiếp.
2. **KHÔNG DỪNG VÒNG LẶP** cho tới khi đạt điều kiện STOP ở §6. Xong 1 task → ngay lập tức bắt đầu task kế.
3. **KHÔNG KẸT.** Nếu 1 task bị chặn (thiếu quyền/secret/dashboard) → đánh dấu `BLOCKED`, ghi handover chi tiết vào `PROGRESS.md`, **bỏ qua, làm task khác**. Tuyệt đối không loop chết trên 1 task.
4. **AN TOÀN PRODUCTION TUYỆT ĐỐI:**
   - KHÔNG deploy production custom domain (`nguyenlananh.com`).
   - KHÔNG chạy `scripts/publish_prod.sh`, `scripts/*go-live*`, `scripts/*live*`.
   - KHÔNG `git push origin main`. Chỉ push branch `auto/overnight-2026-05-30`.
   - KHÔNG đụng tới Cloudflare account/DNS/secrets.
   - KHÔNG xoá file/data. KHÔNG `rm -rf`, KHÔNG `wrangler d1 execute` lên prod DB.
   - Deploy được phép: CHỈ tới **preview** (`wrangler pages deploy . --branch=preview --commit-dirty`) để verify, và CHỈ khi task yêu cầu.
5. **COMMIT NHỎ, THƯỜNG XUYÊN.** Mỗi task xong = 1 commit. Message theo Conventional Commits. Cuối mỗi commit thêm:
   `Co-Authored-By: Kimi K2 <noreply@moonshot.ai>`
6. **CẬP NHẬT `PROGRESS.md` SAU MỖI TASK** — đây là báo cáo sống cho user đọc buổi sáng.
7. **MỌI THAY ĐỔI PHẢI CÓ BẰNG CHỨNG TEST.** Không commit thứ chưa verify (lint/test/curl/grep).

---

## 1. BỐI CẢNH DỰ ÁN (đọc 1 lần, đủ để không phải hỏi)

- **Stack:** Static HTML site + Cloudflare Pages Functions (`functions/`) + D1 (SQLite) cho membership/payment.
- **Không có** `package.json` / `node_modules` ở root → các script là `.mjs` chạy bằng `node` trực tiếp. **Chưa có test framework.**
- **Auth:** magic-link (D1-backed) + Google OAuth (chưa cấu hình secret). Session = signed cookie (`functions/_lib/session.js`).
- **Admin gate:** `functions/_middleware.js` chặn `/admin*`, `/en/admin*` → 302 `/members/` nếu không có session hoặc `role != admin`.
- **D1 prod:** `nguyenlananh-payments-prod` id `2f3a3331-546b-44f1-9992-57d18705afd5`. Bảng `users` đã có đủ cột `membership_label, preferred_language, role, active` (xác nhận trong P3-0 evidence).
- **Preview env KHÔNG có D1 binding** (xem `wrangler.toml`) → API cần D1 sẽ lỗi trên preview là BÌNH THƯỜNG; test các API D1 chỉ tới mức validation (4xx) hoặc dùng mock.
- **Preview URL:** `https://preview.nguyenlananh-com.pages.dev` (alias). **Prod custom domain đang HỎNG** (error 1014, xem §3 BLOCKER).
- **CSP/headers:** file `_headers` (root). CSP hiện `script-src 'self' 'unsafe-inline'`.
- **i18n:** `assets/i18n-config.js` + `lang-routing.js` + `content-registry.js` + `assets/site.js` (drawer, localize chrome). VI mặc định, EN ở `/en/`.

### File/đường dẫn quan trọng
| Vai trò | Path |
|---|---|
| Admin middleware | `functions/_middleware.js` |
| Session sign/verify | `functions/_lib/session.js` |
| DB helpers | `functions/_lib/db.js` |
| Auth flows | `functions/_lib/auth.js` |
| Utils (json, errorResponse, normalizeEmail…) | `functions/_lib/utils.js` |
| Magic link request | `functions/api/auth/magic-links/request.js` → `signupMagicLinkResponse` |
| Magic link consume | `functions/api/auth/magic-links/consume.js` → `consumeStatelessMagicLinkResponse` |
| Frontend chrome/drawer | `assets/site.js` |
| Security headers | `_headers` |
| Schema canonical | `docs/MEMBERSHIP_DB_SCHEMA.sql` |
| Migrations | `docs/migrations/` |
| Wrangler config | `wrangler.toml` |

---

## 2. ĐÃ XONG (DONE — đừng làm lại)

| ID | Việc | Bằng chứng |
|---|---|---|
| A1/A1b | `site.js` thêm vào homepage VI + EN | `index.html:1238`, `en/index.html:1194` (đã deploy preview) |
| A2 | Schema canonical đồng bộ 4 cột mới | `docs/MEMBERSHIP_DB_SCHEMA.sql` |
| A2b | Migration `add-role` + comment giải thích | `docs/migrations/2026-05-28-add-role.sql` |
| B2 | Push origin main | `0e4ffb5` |
| SMOKE-16 | 16 route/endpoint smoke pass trên preview | session 401, logout 200, google 501, magic request 422, consume 422, admin API 503, EN parity 200×4, hero asset 200 |
| P3-0 | D1 binding id fix + schema verify prod | `docs/reports/P3-0_PRODUCTION_EVIDENCE_2026-05-28.md` |

---

## 3. BLOCKED — HUMAN REQUIRED (Kimi KHÔNG được làm, chỉ ghi handover)

> Các việc này cần thao tác Cloudflare Dashboard / secrets / tiền thật. Kimi **bỏ qua**, ghi rõ trong `PROGRESS.md` mục "Human Handover".

| ID | Việc bị chặn | Lý do Kimi không làm được | Ghi gì cho user |
|---|---|---|---|
| **HB1** | **error 1014** — `nguyenlananh.com` + `www` trả 403 `CNAME Cross-User Banned` | DNS zone & Pages project khác Cloudflare account. Cần login Dashboard `Anhhatam@gmail.com` (`62d57eaa…`), attach custom domain đúng account, xoá project trùng ở 2 account kia. | Đã có quy trình 7 bước ở §3.1. |
| **HB2** | Promote → prod custom domain | Phụ thuộc HB1 | Chờ HB1 |
| **HB3** | Tạo user `role=admin` trong D1 prod (để test admin gate end-to-end) | Cần wrangler ghi vào prod DB — vi phạm Luật §0.4 | Cung cấp sẵn câu SQL ở §3.1 cho user chạy |
| **HB4** | P3-2 Payment proof (VietQR/pay.iai.one real order) | Cần tiền thật + secret keys | Cung cấp sẵn checklist test ở `docs/plans/PROGRESS.md` |
| **HB5** | Provision secrets: `GOOGLE_CLIENT_ID/SECRET/STATE_SECRET`, `RESEND_*`, `ADMIN_*_KEY` | Secrets do user giữ | Liệt kê đầy đủ secret cần thiết |

### 3.1 Handover scripts sẵn cho user (Kimi chỉ COPY vào PROGRESS, không chạy)

**Fix HB1 (Dashboard, ~45 phút):**
1. Login Cloudflare Dashboard bằng `Anhhatam@gmail.com` (account `62d57eaa548617aeecac766e5a1cb98e` — account giữ DNS zone).
2. Workers & Pages → kiểm tra project `nguyenlananh-com`. Nếu chưa có → Create → Connect to Git → repo `tranhatam-collab/nguyenlananh.com`, production branch = `main`.
3. Re-deploy đúng account:
   ```bash
   CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
     wrangler pages deploy . --project-name=nguyenlananh-com --branch=main
   ```
4. Pages project → Custom domains → add `nguyenlananh.com` + `www.nguyenlananh.com`.
5. Ở account `f3f9e76…` và `93112cc8…`: xoá Pages project trùng tên `nguyenlananh-com`.
6. Verify:
   ```bash
   curl -sI https://nguyenlananh.com/                # expect 200
   curl -sI https://nguyenlananh.com/api/auth/session # expect 401
   curl -sI https://nguyenlananh.com/admin/           # expect 302 -> /members/
   ```

**HB3 SQL (user chạy sau khi HB1 xong):**
```bash
wrangler d1 execute nguyenlananh-payments-prod --command="UPDATE users SET role='admin' WHERE email='<ADMIN_EMAIL>';"
wrangler d1 execute nguyenlananh-payments-prod --command="PRAGMA table_info(users);"
```

---

## 4. DECISION DEFAULTS (gặp fork → theo bảng này, KHÔNG hỏi)

| Tình huống | Mặc định BẮT BUỘC |
|---|---|
| Không chắc đụng prod hay không | Coi như ĐỤNG → không làm, chuyển task khác |
| `site.js` defer convention | **(ĐÃ XONG T1)** Thực tế: 2 homepage có thứ tự SAI (`content-registry.js` đứng CUỐI). Fix đúng = **reorder về canonical** `content-registry.js → site.js → i18n-config.js → lang-routing.js` rồi mới bỏ `defer`. KHÔNG bỏ defer trần (sẽ vỡ localize). |
| Rate-limit cần store nhưng preview không có D1 | Code phải **degrade gracefully**: nếu `env.PAYMENTS_DB` thiếu → bỏ qua rate-limit (fail-open) + log warn. Bảng tự tạo `CREATE TABLE IF NOT EXISTS`. |
| CSP siết có thể vỡ inline script | KHÔNG flip CSP enforce. Thêm `Content-Security-Policy-Report-Only` mới (an toàn) + viết audit doc. |
| Migration prod cần chạy | Chỉ TẠO file `.sql` + ghi handover. KHÔNG execute lên prod. |
| Test cần D1 | Viết unit test cho **pure functions** (không cần D1). Integration D1 → mock hoặc skip có ghi chú. |
| Commit message ngôn ngữ | Tiếng Anh, Conventional Commits. |
| Branch | Luôn `auto/overnight-2026-05-30`. Tạo nếu chưa có. |
| Lint/format tool không có | Bỏ qua, chỉ cần `node --check <file>` (syntax) + test pass. |
| Gặp lỗi không sửa nổi sau 2 lần thử | `BLOCKED`, ghi handover, đi tiếp. |

---

## 5. BACKLOG TỰ CHỦ (Kimi làm hết — đây là phần "dev liên tục")

> Thứ tự ưu tiên từ trên xuống. Mỗi task có **Acceptance** rõ ràng. Làm xong → tick trong `PROGRESS.md`.
> Tất cả task dưới đây 100% an toàn: chỉ đụng code/test/doc + preview, KHÔNG đụng prod/dashboard/secret.

### T1 — Defer convention cleanup `[S]`
- **Làm:** Bỏ `defer` ở `index.html` + `en/index.html` (tag `site.js`). Giữ vị trí sau `content-registry.js`.
- **Acceptance:** `grep -c 'site.js" defer' index.html en/index.html` = 0. `node --check` không áp dụng (HTML) → thay bằng: deploy preview, `curl preview/ | grep site.js` thấy tag, không còn `defer`. Drawer vẫn render (grep `id="drawer"`).
- **Commit:** `fix(html): unify site.js loading convention across homepages`

### T2 — Smoke test scripts tự động `[M]`
- **Làm:** Tạo `scripts/smoke-preview.sh` và `scripts/smoke-production.sh` (POSIX bash, `set -euo pipefail`).
  - Cover ≥16 check đã biết (§2 SMOKE-16) + cho phép `BASE_URL` qua env.
  - Mỗi check in `PASS/FAIL` + tổng kết; `exit 1` nếu có FAIL.
  - `smoke-production.sh` mặc định `BASE_URL=https://nguyenlananh.com`, in cảnh báo nếu gặp 1014.
- **Acceptance:** `bash scripts/smoke-preview.sh` chạy được, exit 0 trên preview hiện tại. `chmod +x`.
- **Commit:** `test(smoke): add automated preview + production smoke scripts`

### T3 — Vitest harness + unit test cho `_lib` pure functions `[L]`
- **Làm:** Thêm `package.json` tối thiểu (chỉ devDeps: `vitest`) + `vitest.config.js`. Viết test cho các pure function KHÔNG cần D1/env:
  - `utils.js`: `normalizeEmail`, `json`, `errorResponse`, `nowIso` (shape).
  - `session.js`: `parseSessionCookie` với cookie sai/thiếu → null; round-trip sign/verify nếu có secret mock.
  - `auth.js`: `normalizeNextPath`, `getLocale`, `membersStartPath` (nếu export; nếu không export → bỏ qua, ghi chú).
- **Acceptance:** `npx vitest run` PASS (≥8 test). Nếu môi trường offline không cài được vitest → fallback: viết `scripts/test-lib.mjs` dùng `node:assert` + `node:test`, chạy `node --test`. Ghi rõ cách chọn trong PROGRESS.
- **Commit:** `test(lib): add unit tests for auth/session/utils pure helpers`

### T4 — Rate limit `/api/auth/magic-links/request` `[L]`
- **Làm:** Thêm rate-limit (vd. 5 request / email / giờ, 20 / IP / giờ) trong `signupMagicLinkResponse` (hoặc helper `functions/_lib/ratelimit.js`).
  - Store: D1 bảng `rate_limits(key TEXT, window_start TEXT, count INTEGER, PRIMARY KEY(key))` — `CREATE TABLE IF NOT EXISTS` lazy.
  - **Fail-open** nếu `env.PAYMENTS_DB` thiếu (preview) → chỉ log.
  - Vượt giới hạn → `429 RATE_LIMITED` (dùng `errorResponse`).
  - Lấy IP từ `request.headers.get('CF-Connecting-IP')`.
- **Acceptance:** `node --check` các file JS sửa. Thêm unit test logic window (T3 harness). Migration file `docs/migrations/2026-05-30-rate-limits.sql` (CREATE TABLE) + handover (KHÔNG execute prod).
- **Commit:** `feat(auth): add fail-open rate limiting to magic-link request`

### T5 — CSP hardening (Report-Only, an toàn) `[M]`
- **Làm:**
  - Thêm header `Content-Security-Policy-Report-Only` siết hơn (loại bỏ `'unsafe-inline'` cho `script-src`, dùng hash hoặc tách inline) vào `_headers` — KHÔNG đụng `Content-Security-Policy` enforce hiện tại.
  - Viết `docs/reports/CSP_HARDENING_AUDIT_2026-05-30.md`: liệt kê mọi inline `<script>`/`<style>` trong `index.html`, `en/index.html`, đề xuất nonce/hash/extract, rủi ro & lộ trình flip enforce.
- **Acceptance:** `_headers` valid (preview vẫn 200, `curl -sI preview/ | grep -i report-only`). Doc đầy đủ bảng inline.
- **Commit:** `feat(security): add report-only CSP + hardening audit doc`

### T6 — Observability helper `[M]`
- **Làm:** `functions/_lib/log.js` — structured JSON logger (`logInfo/logWarn/logError` in `console.log(JSON.stringify({ts,level,route,code,msg}))`). Gắn vào `_middleware.js` (log admin-deny) + `signupMagicLinkResponse` catch.
- **Acceptance:** `node --check` pass. Unit test logger shape (T3 harness). Không đổi response bytes.
- **Commit:** `feat(obs): add structured logging helper and wire critical paths`

### T7 — UI verify trên PREVIEW (best-effort) `[M]`
- **Làm:** Nếu có browser tool (Playwright/Puppeteer/MCP): mở `preview/` + `preview/en/` ở 375px, test:
  - Hamburger toggle drawer (class `open` thêm/bớt).
  - CTA panel (`assets/cta-modules.js`) render text đúng locale + self-filter (không link tới chính trang).
  - Console không error.
  - Chụp screenshot lưu `docs/reports/ui-verify/`.
- **Nếu KHÔNG có browser tool:** fallback static — `curl preview/ | grep` xác nhận `#hamburger`, `#drawer`, `cta-modules.js` tồn tại; ghi rõ "cần human browser verify" cho phần runtime. KHÔNG coi đây là blocker.
- **Acceptance:** Báo cáo `docs/reports/UI_VERIFY_2026-05-30.md` có kết luận PASS/PARTIAL + bằng chứng.
- **Commit:** `test(ui): preview drawer + CTA verification report`

### T8 — Self code-review + simplify diff `[M]`
- **Làm:** Review toàn bộ diff `auto/overnight-2026-05-30` vs `0e4ffb5`: tìm bug, dead code, lặp, lỗi async/floating promise, lỗ hổng. Sửa các lỗi chắc chắn. Ghi findings không sửa được vào report.
- **Acceptance:** `docs/reports/SELF_REVIEW_2026-05-30.md`. Mọi `node --check` pass. Test vẫn xanh.
- **Commit:** `refactor: address self-review findings`

### T9 — Security review (read-only) auth/session/payment `[M]`
- **Làm:** Đọc `functions/_lib/{auth,session,db,payments}.js` + routes auth/admin. Soát: session cookie signing (timing-safe?), magic-link token entropy & single-use, SQL injection (parametrized?), open-redirect ở `normalizeNextPath`, admin gate bypass, secret leakage trong response/log. Viết report + sửa lỗ hổng RÕ RÀNG, AN TOÀN (không đổi hành vi lớn).
- **Acceptance:** `docs/reports/SECURITY_REVIEW_2026-05-30.md` với severity table. Fix nhỏ có test.
- **Commit:** `docs(security): auth/session/payment security review + safe fixes`

### T10 — Cập nhật handover + final report `[S]` (chạy CUỐI hoặc khi STOP)
- **Làm:** Tổng hợp `docs/plans/PROGRESS.md` → `docs/reports/OVERNIGHT_FINAL_2026-05-30.md`: % hoàn thành từng phase, mọi commit, mọi BLOCKED + handover, việc còn lại buổi sáng.
- **Acceptance:** Report đủ để user audit trong 5 phút. Push branch lần cuối.
- **Commit:** `docs: overnight autonomous run final report`

### Backlog mở rộng (nếu xong hết T1–T10 mà chưa STOP)
- T11: Thêm test cho `db.js` mapping (mock D1 prepared-statement object).
- T12: Accessibility audit (`scripts/`): kiểm `aria-*`, alt text, heading order trên homepage; report.
- T13: Performance: kiểm preload/`fetchpriority` hero, lazy-load below-the-fold; report + safe edits.
- T14: Tạo `CONTRIBUTING.md` + `docs/RUNBOOK.md` tổng hợp deploy/rollback.
- T15: Dọn dead scripts trong `scripts/` (chỉ liệt kê + đề xuất, KHÔNG xoá).

---

## 6. ĐIỀU KIỆN STOP (chỉ dừng khi 1 trong các điều này đúng)

1. **Đạt mục tiêu:** T1–T10 đều `DONE` và % tổng kế hoạch ≥ 95% (xem công thức §7). → chạy T10, push, in "OVERNIGHT COMPLETE", dừng.
2. **Cạn task tự chủ:** Mọi task T1–T15 đều `DONE` hoặc `BLOCKED`, không còn task `TODO` nào làm được. → T10, push, dừng.
3. **Hết ngày:** Quá 06:00 sáng 2026-05-31 (giờ địa phương) → finalize T10, push, dừng.
4. **An toàn:** Phát hiện hành động sắp tới có nguy cơ phá prod/mất data mà không có cách an toàn → dừng task đó, ghi BLOCKED, **không dừng loop**, chuyển task khác. Chỉ dừng hẳn khi không còn task an toàn.

> KHÔNG dừng vì "task khó", "không chắc", "chờ user". Mọi mơ hồ → Decision Defaults §4.

---

## 7. CÔNG THỨC % HOÀN THÀNH (để báo cáo nhất quán)

Tổng kế hoạch chia trọng số:
| Khối | Trọng số | Cách tính |
|---|---|---|
| Phase A (staging) | 15% | DONE = 15 |
| Autonomous backlog T1–T10 | 50% | mỗi task 5% |
| P3-0 production live (HB1) | 15% | BLOCKED = 0 (human) |
| P3-1 workflow test | 8% | phụ thuộc HB1/HB3 |
| P3-2 payment proof (HB4) | 7% | human |
| P3-3 hardening (T4+T5+T6) | 5% | gộp vào T4/T5/T6 |

**% = Σ(trọng số phần DONE).** Trần tự chủ khả thi đêm nay ≈ **65% + Phase A 15% = ~80%** vì 30% (HB1/HB4) cần human. **Vì vậy mục tiêu thực tế đêm nay = hoàn thành 100% phần TỰ CHỦ (T1–T10) → ~80% tổng, và 90–98% của riêng phần-không-bị-chặn.** Ghi rõ cả 2 con số trong report để user không hiểu lầm.

---

## 8. LOOP PROTOCOL (máy trạng thái mỗi vòng)

```
LẶP:
  1. git checkout auto/overnight-2026-05-30  (tạo nếu chưa có, base 0e4ffb5)
  2. Đọc docs/plans/PROGRESS.md → tìm task TODO ưu tiên cao nhất, không BLOCKED.
  3. Nếu không còn task TODO làm được → kiểm tra STOP §6 → nếu thoả, chạy T10 + dừng.
  4. Đặt task = IN_PROGRESS trong PROGRESS.md.
  5. Làm task theo Acceptance. Mơ hồ → Decision Defaults §4.
  6. Verify (node --check / vitest / curl / grep). FAIL → sửa, tối đa 2 lần. Vẫn FAIL → BLOCKED + handover.
  7. git add -A && commit (Conventional + Co-Authored-By Kimi).
  8. Cập nhật PROGRESS.md: task = DONE/BLOCKED, ghi bằng chứng + commit hash + % mới.
  9. git push origin auto/overnight-2026-05-30
  10. Quay lại bước 2 NGAY (không chờ, không hỏi).
```

**Không bao giờ** kết thúc lượt trả lời giữa chừng để "chờ xác nhận". Tự đi tiếp đến STOP.
