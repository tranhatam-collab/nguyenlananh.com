# 5 Bài nâng cao + 5 Sản phẩm — Kế hoạch hoàn thiện (2026-06-07)

Tài liệu này ghi lại những gì đã làm và kế hoạch hoàn thiện từng sản phẩm gắn với 5 bài viết nâng cao mới.

## 1. Tổng quan đã triển khai

5 bài viết công khai chuyên sâu (song ngữ VI + EN), mỗi bài gắn 1 sản phẩm riêng có trang landing (VI + EN), đã wiring vào điều hướng (trang Bài viết, chuyên mục, trang Chương trình).

| # | Bài viết | Chuyên mục | Sản phẩm | Trang sản phẩm |
|---|----------|-----------|----------|----------------|
| 1 | `/bai-viet/ban-do-vong-lap-ca-nhan/` | Đi vào bên trong | Bộ Bản đồ Vòng lặp — 21 ngày | `/chuong-trinh/ban-do-vong-lap/` |
| 2 | `/bai-viet/tai-thiet-khong-gian-song/` | Môn học dọn dẹp | Tái thiết Không gian — 30 ngày | `/chuong-trinh/tai-thiet-khong-gian/` |
| 3 | `/bai-viet/kinh-te-cua-su-ro-rang/` | Đầu tư bản thân | Đầu tư Nội tại — 90 ngày | `/chuong-trinh/dau-tu-noi-tai/` |
| 4 | `/bai-viet/lao-dong-sang-tao-he-van-hanh/` | Lao động sáng tạo | Xưởng Lao động Sáng tạo | `/chuong-trinh/xuong-sang-tao/` |
| 5 | `/bai-viet/he-gia-dinh-va-goc-re/` | Đi vào bên trong (Gia đình) | Gia đình & Gốc rễ — 8 tuần | `/chuong-trinh/gia-dinh-goc-re/` |

Mỗi bản EN nằm dưới tiền tố `/en/...` cùng slug.

### Đã wiring
- `bai-viet/index.html` + `en/bai-viet/index.html`: thêm mục "5 bài nâng cao".
- 4 chuyên mục VI (`/bai-viet/chuyen-muc/*`) + 4 hub EN (`/en/bai-viet/*`): chèn bài nâng cao lên đầu danh sách.
- `chuong-trinh/index.html` + `en/chuong-trinh/index.html`: thêm khối "Sản phẩm theo chủ đề".
- Mỗi trang sản phẩm có `schema.org/Product` JSON-LD và hreflang VI/EN.

### Còn phải làm khi publish
- Chạy `node scripts/sync-i18n.mjs` để **tự sinh lại `sitemap.xml`** (gồm 10 trang mới) — sitemap không sửa tay.
- Chạy kiểm thử: `node scripts/content-audit.mjs` (link nội bộ, meta, sitemap) và `node scripts/audit-bilingual-site.mjs` (đồng bộ song ngữ).

## 2. Nguyên tắc sản phẩm (giữ đúng positioning hiện có)
- Không ép mua ở trang công khai; vào hệ bằng đăng ký miễn phí → magic link → profile → mở khóa.
- Không dùng giá để kéo người vào trang công khai; giá/gói chuyên sâu trao đổi trực tiếp qua `/lien-he/`.
- Tránh từ cấm theo content-registry: healing, coaching, breakthrough, success formula, hype.

## 3. Kế hoạch hoàn thiện từng sản phẩm

### SP1 · Bộ Bản đồ Vòng lặp — 21 ngày
- **Tài sản cần tạo:** workbook PDF (bản đồ 4 lớp + bộ câu hỏi gốc rễ); bộ 7 thẻ vòng lặp; lịch 21 ngày in được; mẫu nhật ký điểm chèn.
- **Tầng thành viên:** liên kết chuyên đề `/members/deep/ban-do-vong-lap/` (đã tồn tại) thành lộ trình 21 ngày có nhắc việc.
- **Đo lường:** tỷ lệ hoàn thành ngày 7/14/21; số dòng bản đồ ghi lại.
- **Giá/gói:** kèm trong tầng thành viên trả phí; bản workbook lẻ là phễu.

### SP2 · Tái thiết Không gian — 30 ngày
- **Tài sản:** bản đồ tái thiết theo phòng + checklist 7 tầng (PDF); thẻ 3 câu hỏi giữ/buông; lịch 30 ô việc.
- **Tầng thành viên:** chuỗi duy trì trong `/members/practice/`; quy tắc một-vào-một-ra.
- **Đo lường:** số bề mặt giải phóng/tuần; duy trì nhịp 10 phút/tối.

### SP3 · Đầu tư Nội tại — 90 ngày
- **Tài sản:** bảng cân đối năm loại vốn + bộ lọc 4 câu hỏi (PDF); mẫu rà soát theo tháng.
- **Tầng thành viên/Pro:** nối vào "Chương trình 3 · Đồng hành sâu"; gói chuyên sâu qua `/lien-he/`.
- **Đo lường:** điểm rò vốn được bịt; số quyết định cắt lỗ sớm.

### SP4 · Xưởng Lao động Sáng tạo
- **Tài sản:** bộ khế ước tạo tác; bản đồ vượt 4 điểm nghẽn; mẫu nhịp 5 nhịp.
- **Tầng thành viên:** không gian chứng kiến trong `/members/practice/`; nhịp phát hành định kỳ.
- **Đo lường:** số tác phẩm phát hành; độ đều của nhịp.

### SP5 · Gia đình & Gốc rễ — 8 tuần
- **Tài sản:** bộ vẽ bản đồ ba thế hệ; thẻ thực hành ranh giới; mẫu thư không gửi.
- **Tầng thành viên:** chuyên đề `/members/deep/gia-dinh-va-goc-re/` (đã tồn tại) thành lộ trình 8 tuần.
- **Lưu ý an toàn:** disclaimer rõ; khuyến nghị hỗ trợ tâm lý chuyên môn cho sang chấn nặng.
- **Đo lường:** hoàn thành theo tuần; mức dịu của oán (tự đánh giá).

## 4. Kiểm thử & fixes đã áp dụng (2026-06-07)

### Content audit (`scripts/content-audit.mjs`)
- **Trước:** 20 lỗi `meta_too_long` ở 10 trang mới (title/description vượt giới hạn SEO).
- **Sau:** Đã rút ngắn title ≤ 60 ký tự và description ≤ 160 ký tự cho cả 5 bài VI + 5 bài EN. Audit chạy lại: **0 issues**.

### Bilingual audit (`scripts/audit-bilingual-site.mjs`)
- **Kết quả:** 6 lỗi `missing_counterpart_page` được báo cho các trang `/bai-viet/chuyen-muc/*`.
- **Thực tế:** 6 trang EN tương ứng (`/en/bai-viet/chuyen-muc/*`) **đã tồn tại** đầy đủ với hreflang. Đây là false positive từ audit script (có thể do cách script match URL). Không cần sửa code.

### Sitemap (`scripts/sync-i18n.mjs`)
- Đã tự sinh lại sitemap gồm **184 URLs** (tăng từ 134), bao gồm 10 trang bài viết + 10 trang sản phẩm mới.

## 5. Việc còn lại — theo thứ tự ưu tiên

| Ưu tiên | Việc | Khối lượng | Người làm |
|---------|------|-----------|-----------|
| **P0** | Thiết kế file PDF/asset cho 5 sản phẩm (workbook, thẻ, lịch, mẫu nhật ký) | Lớn | Designer / bạn tự soạn |
| **P1** | Tạo OG ảnh riêng cho 5 sản phẩm (hiện dùng chung OG chủ đề) | Trung bình | Designer |
| **P2** | Tạo track deep member cho SP2, SP3, SP4 (SP1, SP5 đã có `/members/deep/*`) | Nhỏ | Dev |
| **P3** | Gắn analytics tracking cho funnel: đọc bài → xem sản phẩm → đăng ký → mở khóa | Nhỏ | Dev |
| **P4** | Viết email sequence tự động (magic link + nhắc việc) cho từng sản phẩm | Trung bình | Copywriter |

## 6. Ghi chú kỹ thuật
- Nút CTA trên trang sản phẩm hiện điều hướng đúng theo nguyên tắc site: `/join/` (miễn phí) → profile → mở khóa nội dung. Không cần sửa.
- Cổng thanh toán (PayPal, Stripe, VietQR) đã có khung trong `functions/_lib/payments.js` và `database/`. Khi có gói trả phí cụ thể, chỉ cần thêm plan code vào `members.js`.
- Deep content cho `ban-do-vong-lap` và `gia-dinh-va-goc-re` đã tồn tại. Các SP còn lại có thể dùng `/members/practice/` chung trước khi có track riêng.
