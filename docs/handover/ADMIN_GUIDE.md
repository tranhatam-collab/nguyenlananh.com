# Hướng dẫn Bàn giao Admin — NguyenLanAnh.com

> Tài liệu dành cho người tiếp quản hệ thống **không cần biết code**
> Phiên bản 1.0 — 25/06/2026

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Trước khi bắt đầu — Kiểm tra sức khỏe](#2-trước-khi-bắt-đầu)
3. [Quản trị Admin — Hướng dẫn từng bước](#3-quản-trị-admin)
4. [Quản lý thành viên](#4-quản-lý-thành-viên)
5. [Quản lý đơn hàng & thanh toán](#5-quản-lý-đơn-hàng)
6. [Quản lý nội dung](#6-quản-lý-nội-dung)
7. [Quản lý Creator](#7-quản-lý-creator)
8. [Báo cáo Audit & Thống kê](#8-báo-cáo-audit)
9. [Bảo mật — 2FA & Turnstile](#9-bảo-mật)
10. [Email & Thông báo](#10-email)
11. [Xử lý sự cố thường gặp](#11-xử-lý-sự-cố)
12. [Liên hệ kỹ thuật](#12-liên-hệ)

---

## 1. Tổng quan hệ thống

### Website của bạn gồm gì?

| Phần | Mô tả | Ai dùng? |
|---|---|---|
| **Trang public** | Trang chủ, bài viết, sản phẩm, liên hệ | Khách ghé thăm |
| **Khu thành viên** | Dashboard, bài học, thực hành, nhật ký | Người đã đăng ký |
| **Nền admin** | Quản lý user, đơn hàng, nội dung, báo cáo | Bạn (admin) |
| **Creator** | Trang cho nhà sáng tạo nội dung | Creator đã được duyệt |
| **API** | Hệ thống xử lý dữ liệu (tự động, không cần can thiệp) | Hệ thống tự chạy |

### Website chạy ở đâu?

- **Tên miền:** `www.nguyenlananh.com`
- **Hosting:** Cloudflare (miễn phí, ổn định, nhanh)
- **Database:** Cloudflare D1 (SQLite trên cloud)
- **Email:** Resend + mail.iai.one
- **Thanh toán:** VietQR (VN) + PayPal (quốc tế)

### Bạn cần biết 3 đường dẫn chính:

1. **Trang chủ:** `https://www.nguyenlananh.com`
2. **Đăng nhập admin:** `https://www.nguyenlananh.com/admin/login/`
3. **Dashboard admin:** `https://www.nguyenlananh.com/admin/`

---

## 2. Trước khi bắt đầu — Kiểm tra sức khỏe

### Bước 1: Đăng nhập admin

1. Mở trình duyệt (Chrome hoặc Safari)
2. Vào `https://www.nguyenlananh.com/admin/login/`
3. Nhập email + mật khẩu admin
4. Nhấn "Đăng nhập"
5. Nếu có widget "Tôi không phải robot" — hãy tick vào

> **Lưu ý:** Nếu sai mật khẩu 5 lần, tài khoản sẽ bị khóa 15 phút.

### Bước 2: Kiểm tra các chức năng chính

Sau khi đăng nhập, bạn sẽ thấy Dashboard admin. Kiểm tra:

| Menu | URL | Chức năng |
|---|---|---|
| Dashboard | `/admin/` | Tổng quan |
| Thành viên | `/admin/members/` | Quản lý user |
| Nội dung | `/admin/content/` | Quản lý bài viết |
| Payments | `/admin/payments/` | Đơn hàng |
| Learning | `/admin/learning/` | Tiến độ học |
| Audit | `/admin/audit/` | Báo cáo thống kê |
| Creator Apps | `/admin/creator-applications/` | Duyệt Creator |

### Bước 3: Đổi mật khẩu (QUAN TRỌNG)

1. Vào Dashboard admin
2. Tìm nút "Đổi mật khẩu"
3. Nhập mật khẩu hiện tại + mật khẩu mới
4. Mật khẩu mới nên: tối thiểu 12 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
5. Lưu mật khẩu trong password manager (1Password, Bitwarden, hoặc ghi giấy an toàn)

---

## 3. Quản trị Admin

### 3.1. Tạo tài khoản admin mới

**Khi nào cần:** Khi muốn thêm người quản trị khác.

1. Vào `/admin/`
2. Tìm form "Tạo admin user"
3. Nhập:
   - **Email:** email của người mới
   - **Tên hiển thị:** Tên gọi của họ
   - **Vai trò:** Chọn 1 trong các vai trò:
     - `super_admin` — Toàn quyền (CẨN THẬN)
     - `ops_manager` — Quản lý vận hành (user, đơn hàng, audit)
     - `content_manager` — Quản lý nội dung
     - `support_agent` — Hỗ trợ khách hàng
4. Nhấn "Tạo"
5. Hệ thống tự tạo mật khẩu tạm → gửi cho người mới qua email
6. Người mới đăng nhập → sẽ bị yêu cầu đổi mật khẩu ngay

### 3.2. Vai trò & quyền hạn

| Vai trò | Xem user | Sửa user | Xem đơn | Sửa đơn | Duyệt Creator | Xem Audit | Tạo admin |
|---|---|---|---|---|---|---|---|
| super_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ops_manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| content_manager | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| support_agent | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.3. Khóa / mở khóa tài khoản admin

1. Vào `/admin/members/`
2. Tìm user cần khóa
3. Nhấn "Lock" (khóa) hoặc "Unlock" (mở khóa)
4. User bị khóa không thể đăng nhập cho đến khi mở

---

## 4. Quản lý thành viên

### 4.1. Xem danh sách thành viên

1. Vào `/admin/members/`
2. Bạn sẽ thấy bảng gồm:
   - Email
   - Tên
   - Loại membership (free, year1, year2, year3, lifetime)
   - Ngày đăng ký
   - Trạng thái (active/inactive)
3. Có thể tìm kiếm bằng email

### 4.2. Cấp membership thủ công

**Khi nào cần:** Khi muốn tặng membership cho ai đó.

1. Vào `/admin/members/`
2. Tìm user cần cấp
3. Nhấn "Edit"
4. Đổi `membership_type` thành: `year1`, `year2`, `year3`, hoặc `lifetime`
5. Nhấn "Save"

### 4.3. Cấp quyền truy cập sản phẩm

1. Vào `/admin/members/`
2. Tìm user → nhấn "Edit"
3. Trong phần `content_access`, thêm product code:
   - `asmt_avoidance_self` — Avoidance Map Self
   - `diag_capital_self` — Personal Capital Self
   - `prog_rhythm_lab` — Rhythm Design Lab
   - (xem đầy đủ trong /admin/audit/ → Product Inventory)
4. Nhấn "Save"

### 4.4. Xóa thành viên

> **CẢNH BÁO:** Xóa user = mất toàn bộ dữ liệu. Không thể hoàn tác.

1. Vào `/admin/members/`
2. Tìm user → nhấn "Delete"
3. Xác nhận

**Khuyến nghị:** Thay vì xóa, hãy set `active = 0` (vô hiệu hóa).

---

## 5. Quản lý đơn hàng & thanh toán

### 5.1. Xem đơn hàng

1. Vào `/admin/payments/`
2. Bạn sẽ thấy:
   - Mã đơn
   - Email khách
   - Sản phẩm (plan_code)
   - Số tiền
   - Provider (VietQR/PayPal)
   - Trạng thái (pending/paid/failed/refunded)

### 5.2. Trạng thái đơn hàng

| Trạng thái | Ý nghĩa | Hành động cần làm? |
|---|---|---|
| `pending` | Đang chờ thanh toán | Không — khách đang thanh toán |
| `paid` / `captured` / `completed` | Đã thanh toán | Không — hệ thống tự cấp quyền |
| `failed` / `denied` / `canceled` | Thất bại | Liên hệ khách nếu cần |
| `refunded` / `reversed` | Đã hoàn tiền | Hệ thống tự thu hồi quyền |

### 5.3. Hoàn tiền (Refund)

1. Vào `/admin/payments/`
2. Tìm đơn hàng cần hoàn tiền
3. Nhấn "Refund"
4. Xác nhận
5. Hệ thống tự:
   - Hoàn tiền qua PayPal (nếu là PayPal)
   - Thu hồi quyền truy cập sản phẩm
   - Gửi email thông báo cho khách

### 5.4. Kiểm tra webhook

> Webhook = cách hệ thống nhận thông báo tự động từ PayPal/VietQR khi có thanh toán.

1. Vào `/admin/audit/`
2. Xem phần "Recent webhook events"
3. Nếu có event `failed` hoặc `error`:
   - Click vào để xem chi tiết
   - Liên hệ kỹ thuật nếu không tự khắc phục được

---

## 6. Quản lý nội dung

### 6.1. Bài viết

Bài viết là file HTML tĩnh trong thư mục `/bai-viet/`. Mỗi bài là 1 thư mục con.

**Để thêm bài viết mới:**
- Cần người kỹ thuật giúp (vì cần tạo file HTML)
- Hoặc dùng Creator Dashboard (xem mục 7)

### 6.2. Sản phẩm & giá

**Xem danh sách sản phẩm:**
1. Vào `/admin/audit/`
2. Xem "Product Inventory"

**Đổi giá sản phẩm:**
- Cần người kỹ thuật giúp (sửa trong `functions/_lib/constants.js`)
- Sau khi đổi, chạy `npm run validate:prices` để kiểm tra đồng bộ

### 6.3. Kiểm tra broken links

1. Mở terminal (hoặc nhờ người kỹ thuật)
2. Chạy: `npm run validate:links`
3. Nếu PASS → không có link hỏng
4. Nếu FAIL → xem danh sách link hỏng và sửa

---

## 7. Quản lý Creator

### 7.1. Duyệt đơn ứng tuyển Creator

1. Vào `/admin/creator-applications/`
2. Bạn sẽ thấy danh sách đơn ứng tuyển
3. Mỗi đơn có:
   - Tên, email, bio, motivation
   - Link sample work
   - Kinh nghiệm
4. Đọc đơn → quyết định:
   - **Approve** (duyệt) → Creator nhận email chúc mừng + link dashboard
   - **Reject** (từ chối) → Creator nhận email thông báo + lý do
   - **Request changes** (yêu cầu sửa) → Creator nhận email yêu cầu

### 7.2. Chính sách Creator

Đọc và hiểu chính sách tại `/creators/policy/`:
- **IP:** Creator giữ 100% bản quyền. Nền tảng nhận giấy phép xuất bản không độc quyền.
- **Revenue share:** 70% Creator / 30% nền tảng
- **Thanh toán:** Hàng tháng, tối thiểu 500.000 VND hoặc $20
- **Rút nội dung:** Thông báo 30 ngày trước

### 7.3. Duyệt nội dung Creator

1. Vào `/admin/content/` (hoặc /admin/creator-submissions/)
2. Xem bài nộp → kiểm tra:
   - Không đạo văn
   - Phù hợp giá trị cốt lõi
   - Ít nhất 1.500 từ
   - Có CTA rõ ràng
3. Duyệt / Từ chối / Yêu cầu sửa

---

## 8. Báo cáo Audit & Thống kê

### 8.1. Xem báo cáo tổng quan

1. Vào `/admin/audit/`
2. Bạn sẽ thấy:

**Chỉ số chính:**
- Tổng users
- Paid members
- Tổng đơn hàng
- Revenue by provider (VietQR/PayPal)
- Revenue by plan

**Chỉ số mới (đã mở rộng):**
- **MRR** (Monthly Recurring Revenue) — Doanh thu định kỳ hàng tháng
- **ARR** (Annual Recurring Revenue) — Doanh thu định kỳ/năm
- **Revenue 30 ngày** — Tổng doanh thu 30 ngày qua
- **Conversion funnel** — Tỷ lệ: user → paid → học xong → nộp bài
- **Recent webhook events** — 20 sự kiện thanh toán mới nhất
- **Revenue by month** — Doanh thu theo tháng (12 tháng)
- **New users 30d/7d** — Người dùng mới

### 8.2. Kiểm tra content stats

Trong `/admin/audit/`, xem:
- Tổng bài viết VI/EN
- Bài dưới chuẩn độ dài (< 1.500 từ)
- Bài thiếu CTA
- Bài thiếu metadata SEO

### 8.3. Khi nào cần lo?

| Chỉ số | Bình thường | Cần lo |
|---|---|---|
| Webhook errors 7 ngày | 0 | > 5 |
| Failed orders | < 10% total | > 20% |
| User → Paid conversion | 5-15% | < 2% |
| Paid → Lesson completed | 30-60% | < 10% |
| Bài dưới chuẩn | < 20% total | > 50% |

---

## 9. Bảo mật — 2FA & Turnstile

### 9.1. Bật 2FA cho tài khoản thành viên

> 2FA = Xác thực 2 bước. Bảo vệ tài khoản bằng mã OTP từ điện thoại.

1. Đăng nhập thành viên tại `/members/`
2. Vào `/members/security/`
3. Nhấn "Bật 2FA"
4. Tải app Google Authenticator (hoặc Authy, 1Password)
5. Quét mã QR bằng app
6. Nhập mã 6 số từ app
7. **Lưu mã dự phòng** ở nơi an toàn (password manager hoặc in giấy)
8. Xong! Từ giờ mỗi lần đăng nhập cần mã OTP

### 9.2. Tắt 2FA

1. Vào `/members/security/`
2. Nhấn "Tắt 2FA"
3. Nhập mã OTP hiện tại
4. Xác nhận

### 9.3. Mất điện thoại?

1. Dùng **mã dự phòng** đã lưu khi bật 2FA
2. Vào `/members/verify-2fa/`
3. Mở "Không có điện thoại? Dùng mã dự phòng"
4. Nhập 1 mã dự phòng (mỗi mã dùng 1 lần)
5. Đăng nhập thành công

> **QUAN TRỌNG:** Nếu mất cả điện thoại LẪN mã dự phòng → cần liên hệ kỹ thuật để reset thủ công.

### 9.4. Turnstile (Bot Protection)

Turnstile tự động chặn bot spam trên:
- Form đăng nhập admin
- Form liên hệ
- Form ứng tuyển Creator
- Form thanh toán

**Bạn không cần làm gì** — Turnstile chạy tự động. Nếu thấy lỗi "Bot verification failed":
- Khách có thể refresh trang và thử lại
- Nếu vẫn lỗi → liên hệ kỹ thuật

---

## 10. Email & Thông báo

### 10.1. Hệ thống email tự động

Hệ thống tự động gửi email trong các trường hợp:

| Email | Khi nào gửi | Mẫu |
|---|---|---|
| Welcome magic link | User đăng ký mới | T01 |
| Payment receipt | Khách thanh toán xong | T03 |
| Payment failed | Thanh toán thất bại | T04 |
| Refund notice | Hoàn tiền | T11 |
| Contact form | Khách gửi liên hệ | T15 |
| Product welcome | Khách mua sản phẩm | T20-T92 |
| Creator onboarding | Có người ứng tuyển Creator | T93 |
| Creator approved | Admin duyệt Creator | T94 |
| Creator rejected | Admin từ chối Creator | T95 |

### 10.2. Kiểm tra email có gửi không?

1. Vào `/admin/audit/`
2. Xem "site_events_7d" — số sự kiện 7 ngày qua
3. Nếu số = 0 → có thể email bị lỗi → liên hệ kỹ thuật

### 10.3. Đổi email người nhận thông báo

- Email nhận thông báo liên hệ: `lienhe@nguyenlananh.com` (cấu hình trong Cloudflare)
- Email gửi: `hello@nguyenlananh.com`
- Để đổi: cần người kỹ thuật sửa trong Cloudflare Pages settings

---

## 11. Xử lý sự cố thường gặp

### Sự cố 1: "Không đăng nhập được admin"

**Nguyên nhân có thể:**
1. Sai email/mật khẩu → Kiểm tra lại
2. Khóa 5 lần sai → Chờ 15 phút
3. Tài khoản bị khóa → Liên hệ super_admin khác mở khóa
4. Widget Turnstile không hiện → Tắt ad blocker, thử lại

### Sự cố 2: "Khách báo không nhận email"

**Kiểm tra:**
1. Email có vào spam không? → Khách kiểm tra thư rác
2. Email đúng không? → Kiểm tra trong `/admin/members/`
3. Hệ thống email có hoạt động không? → Xem `/admin/audit/` → site_events

### Sự cố 3: "Khách báo đã thanh toán nhưng không có quyền truy cập"

**Kiểm tra:**
1. Vào `/admin/payments/` → tìm đơn hàng
2. Trạng thái là `paid` không?
   - Nếu `pending` → chờ webhook (vài phút)
   - Nếu `paid` mà không có quyền → cấp thủ công (xem mục 4.3)
   - Nếu `failed` → khách cần thanh toán lại

### Sự cố 4: "Website chậm hoặc không mở được"

1. Kiểm tra `https://www.cloudflarestatus.com/` — xem Cloudflare có sự cố không
2. Nếu Cloudflare OK → liên hệ kỹ thuật

### Sự cố 5: "Lỗi 'TURNSTILE_FAILED' trên form"

1. Turnstile đang chặn — có thể do bot suspicion
2. Khách thử: refresh trang, tắt VPN, tắt ad blocker
3. Nếu vẫn lỗi → liên hệ kỹ thuật để kiểm tra Turnstile keys

### Sự cố 6: "Không thấy đơn hàng mới"

1. Kiểm tra `/admin/payments/` — sort theo ngày mới nhất
2. Kiểm tra `/admin/audit/` → webhook events — có event mới không?
3. Nếu không có webhook → PayPal/VietQR chưa gửi → chờ hoặc kiểm tra cấu hình webhook

### Sự cố 7: "Creator báo không nộp được bài"

1. Kiểm tra Creator đã được duyệt chưa → `/admin/creator-applications/`
2. Kiểm tra Creator đã đăng nhập chưa → `/members/creator-dashboard/`
3. Nếu vẫn lỗi → liên hệ kỹ thuật

---

## 12. Liên hệ kỹ thuật

### Khi nào cần liên hệ kỹ thuật?

- Website không hoạt động
- Lỗi không tự khắc phục được
- Cần thêm tính năng mới
- Cần đổi giá sản phẩm
- Cần tạo bài viết mới (HTML)
- Mất 2FA + mất mã dự phòng
- Cần rotate credentials (PayPal, Google OAuth)

### Thông tin cần cung cấp khi báo lỗi

1. **Bạn đang làm gì?** (ví dụ: "Tôi đang duyệt đơn Creator")
2. **Trang nào?** (ví dụ: `/admin/creator-applications/`)
3. **Lỗi hiển thị gì?** (chụp màn hình nếu được)
4. **Thời gian xảy ra?** (ngày/giờ)
5. **Email user liên quan** (nếu có)

### Bảo mật — KHÔNG BAO GIỜ

- ❌ Chia sẻ mật khẩu admin cho ai
- ❌ Gửi credentials (PayPal, Google) qua chat/email
- ❌ Cho ai khác quyền super_admin nếu không cần thiết
- ❌ Sửa code nếu không biết dev
- ✅ Đổi mật khẩu định kỳ 3 tháng/lần
- ✅ Bật 2FA cho tài khoản admin
- ✅ Kiểm tra audit log hàng tuần

---

## Phụ lục A: Danh sách URL quan trọng

| URL | Mục đích |
|---|---|
| `https://www.nguyenlananh.com` | Trang chủ |
| `https://www.nguyenlananh.com/admin/login/` | Đăng nhập admin |
| `https://www.nguyenlananh.com/admin/` | Dashboard admin |
| `https://www.nguyenlananh.com/admin/members/` | Quản lý thành viên |
| `https://www.nguyenlananh.com/admin/payments/` | Quản lý đơn hàng |
| `https://www.nguyenlananh.com/admin/audit/` | Báo cáo audit |
| `https://www.nguyenlananh.com/admin/creator-applications/` | Duyệt Creator |
| `https://www.nguyenlananh.com/admin/learning/` | Tiến độ học |
| `https://www.nguyenlananh.com/members/` | Khu thành viên |
| `https://www.nguyenlananh.com/members/dashboard/` | Dashboard thành viên |
| `https://www.nguyenlananh.com/members/security/` | Bảo mật (2FA) |
| `https://www.nguyenlananh.com/creators/` | Trang Creator |
| `https://www.nguyenlananh.com/creators/apply/` | Ứng tuyển Creator |
| `https://www.nguyenlananh.com/creators/policy/` | Chính sách Creator |
| `https://www.nguyenlananh.com/lien-he/` | Liên hệ |

## Phụ lục B: Danh sách sản phẩm (26 plan codes)

| Nhóm | Plan code | Tên | Giá USD |
|---|---|---|---|
| Membership | year1 | Năm 1 | $3 |
| Membership | year2 | Năm 2 | $60 |
| Membership | year3 | Năm 3 | $99 |
| Membership | lifetime | Trọn đời | $299 |
| Membership | monthly_practice | Thực hành hàng tháng | $9 |
| Micro | micro_life_reset | Life Reset | $15 |
| Micro | micro_inner_listening | Inner Listening | $15 |
| Micro | micro_one_corner | One Corner | $15 |
| Micro | micro_7day_rhythm | 7-Day Rhythm | $15 |
| Micro | micro_companion | Companion | $15 |
| Assessment | asmt_avoidance_self | Avoidance Map Self | $29 |
| Assessment | asmt_avoidance_review | Avoidance Map Review | $79 |
| Assessment | diag_capital_self | Personal Capital Self | $39 |
| Assessment | diag_capital_expert | Personal Capital Expert | $600 |
| Assessment | diag_capital_biz | Personal Capital Business | $1.200 |
| Program | prog_rhythm_lab | Rhythm Design Lab | $99 |
| Program | prog_emo_block | Emotional Block Mapping | $99 |
| Program | prog_family_pattern | Family Pattern Mapping | $99 |
| Program | prog_space_reset | Space Reset Practitioner | $99 |
| Program | prog_creative_studio | Creative Practice Studio | $99 |
| Certification | cert_boundary_found | Boundary Foundation | $199 |
| Certification | cert_companion_l1 | Companion L1 | $299 |
| Certification | cert_method_designer | Method Designer | $499 |
| Pilot | self_trust_evidence_builder | Self-Trust Practice Lab | $39 |
| Pilot | open_loop_closure_sprint | Open Loop Closure Sprint | $19 |
| Pilot | personal_after_action_review | After-Action Review | $29 |

## Phụ lục C: Kiểm tra định kỳ

| Tần suất | Việc cần làm | Ở đâu |
|---|---|---|
| Hàng ngày | Kiểm tra đơn hàng mới | `/admin/payments/` |
| Hàng ngày | Kiểm tra webhook errors | `/admin/audit/` |
| Hàng tuần | Xem báo cáo audit | `/admin/audit/` |
| Hàng tuần | Duyệt đơn Creator (nếu có) | `/admin/creator-applications/` |
| Hàng tháng | Kiểm tra MRR/ARR | `/admin/audit/` |
| Hàng tháng | Kiểm tra broken links | `npm run validate:links` |
| 3 tháng/lần | Đổi mật khẩu admin | `/admin/` |
| 3 tháng/lần | Kiểm tra price validation | `npm run validate:prices` |

---

*Tài liệu này được tạo bởi Devin · 25/06/2026*
*Nếu có thắc mắc về tài liệu này, liên hệ kỹ thuật.*
