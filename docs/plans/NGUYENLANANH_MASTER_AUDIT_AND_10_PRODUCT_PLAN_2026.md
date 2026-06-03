# NGUYENLANANH.COM — MASTER AUDIT + 10-PRODUCT CHAIN + DEV PLAN

Version: 1.0 · Date: 2026-06-03 · Status: Ready for dev
Official account: `62d57eaa548617aeecac766e5a1cb98e` (Anhhatam@gmail.com)
Dashboard: <https://dash.cloudflare.com/62d57eaa548617aeecac766e5a1cb98e/nguyenlananh.com>

> Tài liệu này là single source of truth. Mọi ID, mọi deploy, mọi sản phẩm
> mới đều phải chạy trên đúng account ở trên. Không tạo project/account khác.

---

## PHẦN 0 — TÓM TẮT ĐIỀU HÀNH

Website hiện tại là nền tảng nội dung + membership "đi vào bên trong". Hạ tầng
backend đã tốt (D1, payments PayPal/Stripe/VietQR, magic-link, email jobs, admin).
Vấn đề duy nhất chặn 100% production là **deploy nhầm project**. Sau khi sửa,
ta nâng tầm web bằng **chuỗi 10 sản phẩm số** đơn giản, đúng xu hướng, dễ kiếm
tiền — biến web từ "blog + membership" thành **một hệ sản phẩm chuyển hoá có
doanh thu nhiều tầng**.

Ba việc lớn:

1. **Khoá đúng ID + sửa deploy** → site chạy thật 100%.
2. **10 sản phẩm số** → mỗi sản phẩm là 1 cửa vào + 1 dòng tiền.
3. **Kế hoạch dev theo sprint** → team làm được ngay.

---

## PHẦN 1 — AUDIT & KHOÁ ID (PHẢI ĐÚNG 100%)

### 1.1. Bảng ID chính thức (CANONICAL)

| Hạng mục | Giá trị đúng | Nguồn / ghi chú |
|---|---|---|
| Cloudflare Account ID | `62d57eaa548617aeecac766e5a1cb98e` | Anhhatam@gmail.com — sở hữu DNS zone |
| Account email | Anhhatam@gmail.com | Dùng cho `wrangler login` |
| Pages project (CANONICAL) | `nguyenlananh-com-63s` | Sở hữu domain + D1 + secrets |
| Pages project (CŨ, bỏ) | `nguyenlananh-com` | Rỗng, KHÔNG có domain — gây sự cố stale build |
| Custom domains | `nguyenlananh.com`, `www.nguyenlananh.com`, `admin.nguyenlananh.com` | Gắn vào project `-63s` |
| D1 binding | `PAYMENTS_DB` | Trong `[env.production]` |
| D1 database name | `nguyenlananh-payments-prod` | |
| D1 database_id | `2f3a3331-546b-44f1-9992-57d18705afd5` | wrangler.toml dòng 22 |
| Git remote | `git@github.com:tranhatam-collab/nguyenlananh.com.git` | |
| Production branch | `main` | |
| compatibility_date | `2026-02-09` | |

### 1.2. Đã sửa trong audit này

- ✅ `wrangler.toml` → `name = "nguyenlananh-com-63s"` (trước là `nguyenlananh-com`).
  Từ nay direct-upload mặc định vào đúng project có domain.

### 1.3. Trạng thái LIVE (xác minh 2026-06-03)

| Endpoint | Code | Kết luận |
|---|---|---|
| `GET /` | 200 | OK — domain phục vụ project `-63s` |
| `GET /api/auth/google/start` | 302 | OK — secrets Google có mặt |
| `GET /bat-dau/` | 200 | OK |
| `GET /members/start/` | 200 | OK |
| `GET /api/auth/session` | **404** | ❌ Build CŨ — thiếu endpoint session.js |

**Chẩn đoán:** Domain phục vụ `nguyenlananh-com-63s` (có secrets → Google 302),
nhưng project này đang serve **build cũ pre-P2** (thiếu `/api/auth/session`).
Code HEAD đã có endpoint này. → Chỉ cần deploy HEAD vào `-63s`.

### 1.4. Secrets cần có trên project `-63s` (Dashboard → Settings → Variables)

```text
GOOGLE_CLIENT_ID            GOOGLE_CLIENT_SECRET       GOOGLE_OAUTH_STATE_SECRET
GOOGLE_REDIRECT_URI=https://www.nguyenlananh.com/api/auth/google/callback
MAGIC_LINK_SECRET          RESEND_API_KEY (hoặc MAIL_API_*)
CONTACT_NOTIFICATION_EMAIL PAYPAL_CLIENT_ID/SECRET/WEBHOOK_ID
STRIPE_SECRET_KEY/WEBHOOK_SECRET   VIETQR_BANK_BIN/ACCOUNT_NO/ACCOUNT_NAME
PAYMENTS_ADMIN_KEY         API_BASE_URL=https://www.nguyenlananh.com
```

Google 302 đã chứng minh nhóm GOOGLE_* + MAGIC_LINK_SECRET có mặt. Cần xác minh
lại PAYPAL/STRIPE/VIETQR trước khi bật bán hàng thật.

---

## PHẦN 2 — RUNBOOK SỬA PRODUCTION (1 LẦN)

### Bước 0 — Auth (chọn 1)

```bash
# A) Trình duyệt (đơn giản nhất) — đăng nhập Anhhatam@gmail.com
wrangler login

# B) API token (CI) — tạo tại dash.cloudflare.com/profile/api-tokens
#    Quyền: Pages:Edit, D1:Edit, Zone DNS:Edit (zone nguyenlananh.com)
export CLOUDFLARE_API_TOKEN=<token>
```

### Bước 1 — Deploy HEAD vào project đúng

```bash
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com
git checkout main && git pull
bash scripts/deploy-prod-official.sh    # PROJECT mặc định = nguyenlananh-com-63s
```

### Bước 2 — Verify (kỳ vọng)

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://nguyenlananh.com/api/auth/session
# Kỳ vọng: 401 (KHÔNG còn 404) → build mới đã lên
BASE_URL=https://nguyenlananh.com bash scripts/smoke-production.sh
```

### Bước 3 — Dọn nợ kỹ thuật

- Xoá/lưu trữ project rỗng `nguyenlananh-com` (account `f3f9...` cũ) để hết nhầm lẫn.
- Trỏ Git auto-deploy (nếu dùng) vào project `nguyenlananh-com-63s`.
- Tạo admin: `wrangler d1 execute nguyenlananh-payments-prod --remote \
  --command="UPDATE users SET role='admin' WHERE email='<ADMIN_EMAIL>';"`

**Định nghĩa "100% chạy thật":** `/`, `/bat-dau/`, `/members/start/` = 200;
`/api/auth/session` = 401; `/api/auth/google/start` = 302; smoke-production all PASS;
1 giao dịch thật mỗi cổng (PayPal/Stripe/VietQR) ghi đúng vào D1.

---

## PHẦN 3 — NGHIÊN CỨU 10 SẢN PHẨM (ĐƠN GIẢN · ĐÚNG XU HƯỚNG · DỄ KIẾM TIỀN)

Nguyên tắc chọn: (1) đúng ADN thương hiệu "đi vào bên trong"; (2) sản xuất 1 lần,
bán nhiều lần (digital, biên lợi nhuận cao); (3) khớp xu hướng 2026 — self-guided
journeys, micro-tools, AI-assisted reflection, cộng đồng nhỏ trả phí; (4) tận dụng
hạ tầng đã có (D1, payments, magic-link, email).

| # | Sản phẩm | Mô tả 1 dòng | Mô hình giá | Độ khó dev | Ưu tiên |
|---|---|---|---|---|---|
| P1 | **37 Ngày Làm Chủ** (cohort/self-paced) | Hành trình 37 ngày email + practice mỗi ngày | One-time $19–$39 | Thấp | 🔥 1 |
| P2 | **Bộ Workbook PDF "Cái Chổi"** | Workbook in/điền: dọn dẹp → nội tâm | One-time $7–$12 | Rất thấp | 🔥 1 |
| P3 | **Nhật ký Vòng Lặp** (web tool) | Tool ghi & nhận diện vòng lặp, nhắc theo ngày | Freemium → $4/tháng | Trung bình | 🔥 1 |
| P4 | **Thư viện Thiền Dẫn (audio)** | Bộ audio dẫn thiền/quan sát nội tâm | $9 mua trọn / membership | Thấp | 2 |
| P5 | **Membership "Đồng Hành"** (đã có khung) | Truy cập members + deep tracks 90 ngày | $9/tháng hoặc $60/năm | Thấp (nâng cấp) | 🔥 1 |
| P6 | **AI Soi Chiếu** (reflection prompt) | Người dùng viết → AI đặt câu hỏi đào sâu | $5/tháng add-on | Trung bình | 2 |
| P7 | **Khoá học video "Phương Pháp 4 Lớp"** | Video + bài tập theo 4 giai đoạn | $49–$99 | Trung bình | 2 |
| P8 | **Bộ thẻ phản tỉnh (digital + bản in POD)** | 52 thẻ câu hỏi/tuần, dùng app + đặt in | $12 digital / POD | Thấp | 3 |
| P9 | **Chương trình Sâu 1-1 / nhóm nhỏ** | Đồng hành cao cấp (đã có 55–99tr) | 55–99tr VND, ghế giới hạn | Thấp (form+lịch) | 2 |
| P10 | **Quà tặng / Tài trợ ghế học** | Mua tặng người khác / quỹ học bổng | Linh hoạt | Thấp | 3 |

### 3.1. Vì sao đúng xu hướng

- **Self-paced + email drip (P1)**: mô hình "challenge" đang thắng trên Substack/Gumroad.
- **Micro-tools giữ chân (P3, P6)**: tool nhỏ → recurring revenue + dữ liệu hành vi.
- **Audio (P4)**: thị trường thiền/âm thanh chữa lành tăng mạnh, sản xuất rẻ.
- **POD thẻ (P8)**: không tồn kho, in theo yêu cầu (Printful/Gelato).
- **Membership (P5)**: dòng tiền định kỳ — xương sống doanh thu.

### 3.2. Thứ tự ra mắt khuyến nghị (theo tiền/đầu tư)

Wave 1 (tiền nhanh, dev ít): **P2 → P1 → P5**.
Wave 2 (giữ chân + định kỳ): **P3 → P4 → P9**.
Wave 3 (giá trị cao): **P7 → P6 → P8 → P10**.

---

## PHẦN 4 — KIẾN TRÚC HOÀN THIỆN CHO CHUỖI 10 SẢN PHẨM

### 4.1. Mô hình "1 phễu — nhiều tầng giá"

```text
Nội dung free (SEO, bài viết)
   ↓ chạm
P2 Workbook $7  ·  P8 Thẻ $12        ← tripwire (mua lần đầu, rào thấp)
   ↓ tin
P1 37 Ngày $29  ·  P4 Audio $9        ← core offer
   ↓ thuộc về
P5 Membership $9/th  ·  P3 Tool $4/th  ← recurring (xương sống)
   ↓ cam kết sâu
P7 Khoá $99  ·  P6 AI $5/th add-on    ← upsell
   ↓ chuyển hoá tối đa
P9 Đồng hành 55–99tr                   ← high-ticket
P10 Tặng/Quỹ                            ← lan toả
```

### 4.2. Sơ đồ route (bổ sung vào sitemap hiện tại)

```text
/san-pham/                      (hub trưng bày 10 sản phẩm)
/san-pham/37-ngay/              P1  → checkout → email drip
/san-pham/workbook-cai-choi/    P2  → checkout → tải PDF
/cong-cu/nhat-ky-vong-lap/      P3  (tool, gated freemium)
/thu-vien/thien-dan/            P4  (audio, gated membership/mua)
/dong-hanh/                     P5  (membership = /join nâng cấp)
/cong-cu/ai-soi-chieu/          P6  (gated add-on)
/khoa-hoc/phuong-phap-4-lop/    P7  (video LMS nhẹ)
/san-pham/the-phan-tinh/        P8  (digital + POD)
/dong-hanh-sau/                 P9  (apply form + lịch)
/tang-mot-ghe/                  P10 (gift checkout)
```

### 4.3. Data model — mở rộng D1 (KHÔNG phá bảng cũ)

Tận dụng `payment_orders.plan_code` cho mọi sản phẩm. Thêm 3 bảng:

```sql
-- Catalog sản phẩm (nguồn sự thật cho giá + quyền truy cập)
CREATE TABLE IF NOT EXISTS products (
  code TEXT PRIMARY KEY,            -- 'p1_37ngay', 'p2_workbook', ...
  title TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'one_time' | 'subscription' | 'high_ticket'
  price_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  access_grant TEXT,              -- entitlement key cấp khi mua
  active INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Quyền truy cập của user (entitlements)
CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active|expired|revoked
  granted_at TEXT NOT NULL,
  expires_at TEXT,                         -- NULL = vĩnh viễn
  source_order_id TEXT,
  UNIQUE(user_id, product_code),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tiến trình drip/khoá học (P1, P7)
CREATE TABLE IF NOT EXISTS enrollment_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_code TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  last_activity_at TEXT,
  completed_at TEXT,
  state_json TEXT,
  UNIQUE(user_id, product_code),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active, type);
```

### 4.4. Lớp truy cập (entitlement gate)

- Middleware mới `functions/_lib/entitlement.js`: `hasEntitlement(db, userId, productCode)`.
- Gate route sản phẩm trong `functions/_middleware.js` (mở rộng pattern admin/members).
- Khi webhook payment `paid` → ghi `entitlements` theo `products.access_grant`.

### 4.5. Email lifecycle (tái dùng `email_jobs`)

- Drip P1: 37 template theo ngày, enqueue khi enroll, cron quét `scheduled_for`.
- Welcome/nurture cho mỗi sản phẩm: template riêng theo `plan_code`.

### 4.6. Tech stack giữ nguyên (không thêm phụ thuộc nặng)

Cloudflare Pages + Functions, D1, static HTML + vanilla JS modules (như hiện tại),
PayPal/Stripe/VietQR đã tích hợp. Audio/PDF lưu R2 (thêm binding `MEDIA` khi tới P4/P2).
POD (P8) gọi API Printful/Gelato từ webhook.

---

## PHẦN 5 — KẾ HOẠCH DEV (ÁP DỤNG NGAY)

### Sprint 0 — Production thật 100% (1–2 ngày) · CHẶN MỌI THỨ

| Task | Mô tả | Acceptance |
|---|---|---|
| S0-1 | `wrangler login` + `deploy-prod-official.sh` | `/api/auth/session` = 401 |
| S0-2 | smoke-production all PASS | exit 0 |
| S0-3 | Tạo admin user trong D1 | login `/admin/` = 200 |
| S0-4 | Xoá project rỗng `nguyenlananh-com` | dashboard sạch |
| S0-5 | Test 1 giao dịch thật mỗi cổng | order ghi vào D1 |

### Sprint 1 — Catalog + Hub + Wave 1 (3–5 ngày)

| Task | Mô tả | Acceptance |
|---|---|---|
| S1-1 | Migration `products/entitlements/enrollment_progress` | apply remote OK |
| S1-2 | Seed `products` cho P1, P2, P5 | 3 rows active |
| S1-3 | Trang hub `/san-pham/` (static, data từ catalog API) | render 10 card |
| S1-4 | `functions/_lib/entitlement.js` + gate | user chưa mua → 302 |
| S1-5 | P2 Workbook: checkout → grant → trang tải PDF (R2) | mua xong tải được |
| S1-6 | P1 37 Ngày: enroll → enqueue 37 email + trang tiến trình | day-0 email gửi |
| S1-7 | P5: nâng `/join` → entitlement membership | member thấy deep tracks |

### Sprint 2 — Recurring + giữ chân (5–7 ngày)

| Task | Mô tả | Acceptance |
|---|---|---|
| S2-1 | P3 Tool Nhật ký Vòng Lặp (freemium gate) | free 7 entries, paid unlimited |
| S2-2 | P4 Audio library (R2 + gate membership) | stream sau khi có quyền |
| S2-3 | P9 Đồng hành sâu: apply form + email nội bộ | submission ghi D1 + email |
| S2-4 | Cron email drip + retention | job chạy đúng lịch |

### Sprint 3 — Giá trị cao + lan toả (5–7 ngày)

| Task | Mô tả | Acceptance |
|---|---|---|
| S3-1 | P7 LMS nhẹ (video + progress) | hoàn thành cấp chứng nhận |
| S3-2 | P6 AI Soi Chiếu (add-on, gọi LLM) | prompt → câu hỏi đào sâu |
| S3-3 | P8 Thẻ digital + POD webhook | mua → tạo đơn in |
| S3-4 | P10 Gift checkout | tặng → người nhận nhận magic-link |

### 5.1. Definition of Done (mỗi sản phẩm)

- Route + trang bán + checkout 3 cổng + grant entitlement + gate truy cập.
- Email xác nhận; ghi `payment_orders` + `entitlements`.
- SEO meta + sitemap; mobile tốt; smoke test endpoint thêm vào script.
- Không hardcode secret; tôn trọng CSP; có structured log (`log.js`).

### 5.2. Rủi ro & guardrail

- **Tránh tạo project/account mới** → mọi deploy vào `nguyenlananh-com-63s`.
- **Không phá schema cũ** → chỉ `CREATE TABLE IF NOT EXISTS` + cột mới nullable.
- **Tông thương hiệu**: không "bán lộ liễu", giữ chiều sâu (theo MASTER_WEBSITE_SPEC §12).
- **Pháp lý**: mỗi sản phẩm chạm thân-tâm phải có disclaimer không thay thế trị liệu.

---

## PHẦN 6 — CHECKLIST BÀN GIAO

- [ ] Sprint 0 xong → site thật 100% (5/5 acceptance).
- [ ] Migration sản phẩm applied trên D1 remote.
- [ ] Hub `/san-pham/` live với 10 card.
- [ ] Wave 1 (P1, P2, P5) bán được + grant đúng.
- [ ] Wave 2, 3 theo sprint.
- [ ] Tất cả endpoint mới có trong `smoke-production.sh`.

*Hết. Mọi ID trong tài liệu này là chính thức trên account `62d57eaa548617aeecac766e5a1cb98e`.*
