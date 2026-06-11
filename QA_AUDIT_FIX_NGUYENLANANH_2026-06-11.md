# QA AUDIT + FIX — nguyenlananh.com
**Ngày:** 2026-06-11 · **Auditor:** Claude (Fable 5) · **Chuẩn:** SOP v1.1 (Gate C/U/D)
**Phương pháp:** Live curl (kiểm response body, không tin status đơn thuần) + đối chiếu source `main` HEAD `a0e86ca`.

---

## EXECUTIVE VERDICT

**🟡 CONDITIONAL PASS — site nền tảng tốt, 2 blocker P0: (1) `members/progress` deploy drift, (2) cổng thanh toán VietQR sai API key.**

Khác hẳn Gen 1/Gen 2: nguyenlananh.com **chất lượng cao** — security headers đủ 7/7, SEO đầy đủ, 404 thật, payment routing đúng VietQR-only, auth validate đúng từng lớp. Chỉ 2 điểm chặn thật, **không phải lỗi source** (source sạch) mà là **deploy + secret**. Điểm thực: **~80/100**.

---

## A. ĐÃ XÁC MINH PASS (evidence)

| Hạng mục | Evidence | Verdict |
|---|---|---|
| Pages content | `/` 200 (55KB); route con 308→trailing-slash→200 (chuẩn CF) | ✅ |
| 404 thật | `/nonexistent-xyz` → **404** (không phải 200 như Gen1/2) | ✅ |
| Security headers | **đủ 7/7**: HSTS, CSP (+report-only), X-Frame DENY, Permissions, Referrer, X-Content-Type | ✅ Xuất sắc |
| SEO | title + description + canonical + og:title; **sitemap 158 URL** | ✅ |
| Payment routing | `/api/payments/providers`: chỉ `vietqr enabled=true`, paypal/stripe/momo/vnpay/zalopay `enabled=false` (đúng chủ đích "VietQR-only") | ✅ |
| Auth validate | signup `422`, session `401`, checkout validate plan→idempotency→key (đúng thứ tự) | ✅ |
| Provider `public` field | là config object (`providerPublicConfig`), không phải cờ hiện UI — frontend lọc theo `enabled`. **Không bug** | ✅ |

---

## B. BLOCKER P0

### 🔴 G2N-P0-01 — `members/progress` DEPLOY DRIFT
- **Evidence:** `GET /api/members/progress` → **404**, `POST` → **405** — dù source `functions/api/members/progress.js` có **cả** `onRequestGet` và `onRequestPost` hợp lệ, mọi import (`requireSession`, `getMemberProgress`, `saveMemberProgress`, `json`, `errorResponse`) **đều resolve đúng**.
- **Đối chiếu:** các function khác (signup 422, checkout 422, contact 400, session 401) chạy đúng → chỉ riêng members/progress không được serve.
- **Root cause:** Live Cloudflare Pages deployment **cũ hơn `main`** — function progress-sync (thêm ở commit `340ccb1`) chưa lên production. Marker phụ: `/join/` còn 12 lần "magic-link" dù commit `b6b6203` đã ẩn → củng cố giả thuyết live tụt sau HEAD.
- **Impact:** Khu vực thành viên **không lưu/đọc được tiến độ học** → tính năng members hỏng.
- **FIX:** **Redeploy current `main`** (source đã đúng). Lệnh sanctioned (`scripts/deploy-prod-official.sh`):
  ```bash
  CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
    wrangler pages deploy . --project-name nguyenlananh-com --branch main --commit-dirty=true
  ```
- **VERIFY sau deploy:** `GET /api/members/progress` (no auth) → **401** (không còn 404); `POST` → 401/400 (không 405).

### 🔴 G2N-P0-02 — VietQR checkout sai API key (commerce chết) — EXTERNAL
- **Evidence (Gate C):** `POST /api/payments/create-checkout` với `plan_code:"year1"` + idempotency → pay.iai.one trả **`403 API_KEY_INVALID`** — "The supplied API key is invalid for this tenant/site contract."
- **Đối chiếu:** báo cáo audit pay.iai.one xác nhận **tenant `nguyenlananh` CÓ key hợp lệ** (test checkout tạo payOS URL thật ✅). Vậy key **đang set trên Cloudflare worker nguyenlananh.com bị sai/cũ**. Khớp lịch sử commit `a0e86ca`/`4069fd7` (vẫn đang loay hoay cập nhật `PAY_IAI_ONE_API_KEY`).
- **Impact:** **Không ai thanh toán được.** Toàn bộ phễu join→pay chết ở bước cuối.
- **FIX (external — Founder/Ops):** Set đúng `PAY_IAI_ONE_API_KEY` (secret) cho project `nguyenlananh-com` trên Cloudflare = key tenant `nguyenlananh` hợp lệ từ pay.iai.one. Kiểm scope đủ `internal:checkout-session:create`.
- **VERIFY:** lặp lại curl checkout → trả `checkout_url` / VietQR thật (không `API_KEY_INVALID`).

---

## C. P2 — NÊN LÀM (không chặn)
| ID | Việc | Ghi chú |
|---|---|---|
| G2N-P2-01 | Sau redeploy, chạy `scripts/smoke-production.sh` làm Gate D thường trực | chống drift tái diễn |
| G2N-P2-02 | Gỡ `_worker.bundle` (Jun 7) khỏi repo root | không phải `_worker.js` nên CF bỏ qua, nhưng gây nhầm; cũ hơn nhiều `_lib/*` |
| G2N-P2-03 | Ẩn paypal/stripe khỏi UI store nếu `enabled=false` | hiện chỉ vietqr active; tránh user thấy phương thức không dùng |

---

## D. RELEASE GATE
- [x] Pages/SEO/security/404 ✅
- [x] Payment routing VietQR-only đúng ✅
- [ ] **G2N-P0-01:** redeploy main → members/progress 401 (cần deploy)
- [ ] **G2N-P0-02:** set đúng PAY_IAI_ONE_API_KEY (external) → checkout tạo VietQR thật
- [ ] Smoke production xanh sau deploy

**Khi xong 2 P0 → PUBLIC LIVE PASS.** Site này gần production nhất trong các dự án đã audit (Gen1 ~42, Gen2 ~38, nguyenlananh ~80).

---
*Theo SOP v1.1 — mọi kết luận có evidence. Source sạch; 2 blocker là deploy-drift + secret, không phải bug code.*
