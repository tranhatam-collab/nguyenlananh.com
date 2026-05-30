# 🚀 KIMI — FINISH PRODUCTION (verified 2026-05-31)

> Bộ lệnh chi tiết cho Kimi K2 hoàn tất phần còn lại. Mọi chẩn đoán dưới đây đã được
> Claude VERIFY bằng curl thật + Git preview build thật. Kimi cứ theo đúng thứ tự.
> **Branch nguồn:** `auto/overnight-2026-05-30` (HEAD `6117ec1`, đã push origin).

---

## A. TRẠNG THÁI ĐÃ VERIFY (đọc để khỏi chẩn đoán lại)

| Hạng mục | Trạng thái thực tế (đo bằng curl 2026-05-31) |
|---|---|
| error 1014 | ✅ HẾT. `nguyenlananh.com`, `www`, `admin.nguyenlananh.com` đều 200, SSL active. |
| Custom domains | ✅ Đã attach đúng account `62d57eaa…`. |
| Secrets production | ✅ Đã set đủ: `GOOGLE_CLIENT_ID/SECRET/STATE_SECRET/REDIRECT_URI`, `MAGIC_LINK_SECRET`, `MAIL_API_*`, `PAYMENTS_ADMIN_KEY`, `PAY_IAI_ONE_API_KEY`, `PAYPAL_MERCHANT_EMAIL`, `VIETQR_TEMPLATE`… |
| D1 binding | ✅ `PAYMENTS_DB → nguyenlananh-payments-prod`. |
| **Functions trên prod** | ⚠️ CHẠY nhưng **STALE** ở commit trước P2. `google/start`→302 (Google URL thật), `google/callback`→422, `magic-links/consume`→400 đều SỐNG. NHƯNG `session`→**404**, `logout`→**405**, `magic-links/request`→**405**, `/admin/`→**200** (admin gate `_middleware.js` CHƯA deploy). |
| Nguyên nhân | Production deploy đứng ở commit **trước P2 `68eafef`** — thiếu `session.js`, `logout.js`, `magic-links/request.js`, `_middleware.js`. KHÔNG phải lỗi build output dir (functions khác vẫn compile). |
| **Bằng chứng fix** | Git preview build của branch `auto/overnight-2026-05-30` tại `https://auto-overnight-2026-05-30.nguyenlananh-com.pages.dev` cho **TẤT CẢ route xanh**: session 401, /admin/ 302, logout 200, magic-request 422. → Merge branch này vào `main` sẽ fix production. |

---

## B. P0 — DEPLOY HEAD VÀO ĐÚNG PROJECT (việc quan trọng nhất)

> ⚠️ CẬP NHẬT 2026-05-31 (sau khi push main thất bại): **`git push origin main` KHÔNG fix
> được** vì tồn tại **HAI project Pages** trong account `62d57eaa…`:
>
> | Project | pages.dev | Build mới (main) | Secrets | Domains + D1 |
> |---|---|---|---|---|
> | `nguyenlananh-com` | nguyenlananh-com.pages.dev | ✅ session 401 | ❌ google 501 | ❌ không |
> | `nguyenlananh-com-63s` | nguyenlananh-com-63s.pages.dev | ❌ session 404 (cũ) | ✅ google 302 | ✅ **nguyenlananh.com/www/admin + D1** |
>
> Git auto-deploy đẩy code mới vào `nguyenlananh-com` (rỗng), còn **domain thật + secrets +
> D1 nằm ở `nguyenlananh-com-63s`** và project này KHÔNG nhận build mới. → Phải deploy HEAD
> THẲNG vào `nguyenlananh-com-63s`.

### Cách A — Direct upload vào đúng project (cần wrangler auth) ✅ ưu tiên, chắc chắn
```bash
cd <repo>
wrangler login            # đăng nhập Anhhatam@gmail.com (account 62d57eaa…)
# hoặc headless: export CLOUDFLARE_API_TOKEN=<token Pages:Edit + D1:Edit + DNS:Edit>
bash scripts/deploy-prod-official.sh      # đã set PROJECT=nguyenlananh-com-63s
# Script tự deploy --branch=main vào project có domain + chạy smoke-production.
```
**Kỳ vọng:** smoke ALL PASS (/admin/ **302**, session **401**, logout **200**,
magic-request **422**, google-start **302**).

### Cách B — Nối Git vào đúng project (bền vững, dashboard) ✅ làm sau để auto-deploy
1. Dashboard → Workers & Pages → **nguyenlananh-com-63s** → Settings → Builds & deployments.
2. Connect to Git → repo `tranhatam-collab/nguyenlananh.com`, production branch `main`,
   build command: (để trống), output dir: `.`.
3. Trigger "Retry deployment" / hoặc push 1 commit vào main → build vào project có domain.
4. (Tuỳ chọn) Ở project thừa `nguyenlananh-com`: ngắt Git để khỏi nhầm.

### Nếu tên project khác trên dashboard
`PROJECT=<tên-đúng> bash scripts/deploy-prod-official.sh` (override biến PROJECT).

### Kết quả mong đợi
Sau Cách A hoặc B: `BASE_URL=https://nguyenlananh.com bash scripts/smoke-production.sh` → ALL PASS.

---

## C. P1 — VERIFY PRODUCTION END-TO-END (sau promote)
```bash
# 1. Smoke toàn bộ
BASE_URL=https://nguyenlananh.com bash scripts/smoke-production.sh   # all PASS

# 2. Admin gate đã khôi phục
curl -s -o /dev/null -w "%{http_code}\n" https://nguyenlananh.com/admin/        # 302
curl -s -o /dev/null -w "%{redirect_url}\n" https://nguyenlananh.com/admin/     # .../members/

# 3. Google OAuth start dựng URL thật
curl -s -o /dev/null -w "%{redirect_url}\n" https://nguyenlananh.com/api/auth/google/start
# -> https://accounts.google.com/o/oauth2/v2/auth?... (có client_id + state ký)

# 4. admin subdomain
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://admin.nguyenlananh.com/  # 301 -> /admin/
```
Ghi kết quả vào `docs/reports/PROD_GO_LIVE_2026-05-31.md`.

---

## D. P2 — BACKLOG TỰ CHỦ T3–T10 (theo MASTER_PLAN §5, không đổi)
T3 unit tests · T4 rate-limit magic-link · T5 CSP report-only · T6 logging ·
T7 UI verify preview · T8 self-review · T9 security review · T10 final report.
→ Làm song song/độc lập với P0. KHÔNG bị chặn bởi gì.

---

## E. P3 — GIỜ ĐÃ MỞ KHOÁ (secrets + domain live), làm SAU khi P0 xong

### P3-1 — Workflow magic-link thật (an toàn, không tốn tiền)
```bash
# Gửi magic link tới email test thật của bạn:
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"<EMAIL_TEST>","locale":"vi"}' \
  https://nguyenlananh.com/api/auth/magic-links/request
# -> {"ok":true,"delivery_status":"sent",...}  (kiểm hộp thư nhận link)
# Mở link trong mail -> /api/auth/magic-links/consume -> set cookie session
# Sau đó: curl với cookie -> /api/auth/session -> 200 + thông tin user
```
Ghi vào report. Nếu email KHÔNG tới → kiểm `MAIL_API_*` secrets (BLOCKED, handover user).

### HB3 — Tạo admin user (cần wrangler auth, để test admin gate end-to-end)
```bash
wrangler d1 execute nguyenlananh-payments-prod --remote \
  --command="UPDATE users SET role='admin' WHERE email='<ADMIN_EMAIL>';"
wrangler d1 execute nguyenlananh-payments-prod --remote \
  --command="SELECT email, role, active FROM users WHERE email='<ADMIN_EMAIL>';"
```
→ Nếu chưa có wrangler auth: BLOCKED, ghi lệnh sẵn cho user.

### P3-2 — Payment proof (TIỀN THẬT — GIỮ BLOCKED trừ khi user xác nhận)
- KHÔNG tự tạo order tiền thật. Ghi checklist sẵn, chờ user duyệt.

---

## F. LƯU Ý AN TOÀN khi promote main
- Cách A chỉ là `git push` — nếu Cloudflare build FAIL thì production **giữ nguyên bản
  đang chạy** (không regression). An toàn.
- Nếu promote xong mà có sự cố: rollback trong Dashboard → Deployments → chọn bản
  trước → "Rollback to this deployment". Hoặc `wrangler pages deployment` list/rollback.
- Sau promote, các bản preview build branch vẫn tồn tại để so chiếu.
