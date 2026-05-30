# PROGRESS — Autonomous Overnight Run (live tracker)

> Kimi cập nhật file này SAU MỖI TASK. User đọc file này buổi sáng để audit nhanh.
> **Run start:** 2026-05-30 · **Branch:** `auto/overnight-2026-05-30` · **Base:** `0e4ffb5`
> **Status:** 🟢 RUNNING

---

## Bảng task (cập nhật liên tục)

| ID | Task | Trạng thái | Commit | Bằng chứng / Ghi chú |
|----|------|-----------|--------|----------------------|
| T1 | Defer convention cleanup | ✅ DONE | `3b38259` | Reorder canonical (content-registry→site→i18n→lang), bỏ defer. grep defer=0, drawer còn nguyên |
| T2 | Smoke scripts (preview+prod) | ✅ DONE | `026874b` | smoke-preview 21/21 PASS exit 0; smoke-production phát hiện 1014 exit 2. Bắt được 1 bug quoting `${body:-{}}`→`{}}` đã fix |
| T3 | Vitest/node:test unit tests `_lib` | ⬜ TODO | | |
| T4 | Rate limit magic-link request | ⬜ TODO | | |
| T5 | CSP report-only + audit doc | ⬜ TODO | | |
| T6 | Structured logging helper | ⬜ TODO | | |
| T7 | UI verify preview (best-effort) | ⬜ TODO | | |
| T8 | Self code-review + simplify | ⬜ TODO | | |
| T9 | Security review auth/payment | ⬜ TODO | | |
| T10 | Final report + push | ⬜ TODO | | chạy cuối |
| T11–T15 | Backlog mở rộng | ⬜ TODO | | chỉ nếu còn thời gian |

**Legend:** ⬜ TODO · 🔄 IN_PROGRESS · ✅ DONE · ⛔ BLOCKED

---

## % Hoàn thành (cập nhật mỗi vòng)

- **Phần tự chủ (T1–T10):** 2 / 10 = 20%
- **Tổng kế hoạch (gồm human-blocked):** ~31% _(Phase A 15% + 2 task × 5% = 25%... làm tròn theo §7)_
- **Mục tiêu đêm nay:** 100% phần tự chủ ≈ 80% tổng.

---

## 🟢 PRODUCTION STATUS (verified 2026-05-31)

- **HB1 — error 1014: ✅ RESOLVED.** User đã cập nhật DNS + attach domain đúng account `62d57eaa…`. `nguyenlananh.com`/`www`/`admin.` đều 200, SSL active, KHÔNG còn 1014.
- **Secrets production: ✅ đã set đủ** (GOOGLE_*, MAGIC_LINK_SECRET, MAIL_API_*, PAYMENTS_ADMIN_KEY, PAY_IAI_ONE_API_KEY…).
- **⚠️ PROD FUNCTIONS STALE (P0 còn lại):** production đứng ở commit trước P2 — `session`/`logout`/`magic-links/request`→404/405, `/admin/`→200 (admin gate `_middleware.js` chưa deploy). `google/*` + `consume` thì sống.
- **FIX đã chứng minh:** Git preview build của branch `auto/overnight-2026-05-30` (`https://auto-overnight-2026-05-30.nguyenlananh-com.pages.dev`) cho TẤT CẢ route xanh (session 401, /admin/ 302, logout 200, magic-request 422). → **Promote branch → main là xong.** Chi tiết lệnh: `docs/plans/KIMI_PROD_FINISH.md`.

## ⛔ BLOCKED — Human Handover

- **HB3 — tạo admin user prod D1:** cần wrangler auth. `UPDATE users SET role='admin' WHERE email='<ADMIN_EMAIL>';`
- **HB4 — payment proof:** cần tiền thật + duyệt của user. Giữ BLOCKED.
- **HB5 — (giải quyết phần lớn):** secrets đã set trên dashboard. Còn lại chỉ wrangler CLI auth nếu cần chạy `d1 execute`/direct-upload.
- **HB3 — tạo admin user prod D1:** `UPDATE users SET role='admin' WHERE email='<ADMIN_EMAIL>';`
- **HB4 — payment proof:** cần tiền thật + secrets.
- **HB5 — secrets:** `GOOGLE_CLIENT_ID/SECRET/STATE_SECRET`, `RESEND_*`, `ADMIN_*_KEY`.

---

## 📓 Nhật ký vòng lặp (Kimi append, mới nhất trên cùng)

- `2026-05-30` — **Bootstrap by Claude:** tạo branch `auto/overnight-2026-05-30`, hoàn thành T1 + T2 làm mẫu pattern. T3 trở đi giao Kimi.
- _(Kimi ghi tiếp từ đây…)_
