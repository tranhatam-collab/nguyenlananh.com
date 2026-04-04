# NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md

Version: 1.0  
Status: FINAL DEPLOY CHECKLIST  
Purpose: DEV làm tuần tự từ content → SEO → routes → CTA → publish → deploy  
Rule: Không tự ý đổi cấu trúc, không tự viết lại positioning, không thêm section ngoài spec nếu chưa được duyệt

---

## 1. MỤC TIÊU FILE

Checklist này khóa toàn bộ thứ tự triển khai để DEV chỉ việc làm đúng tuần tự, tránh:
- dựng UI trước khi khóa content
- publish bài viết lộn xộn
- thiếu SEO technical
- internal link không có logic
- homepage đẹp nhưng không chuyển đổi
- deploy xong mới phát hiện thiếu route, thiếu schema, thiếu CTA

Website Nguyenlananh.com phải được deploy như một hệ hoàn chỉnh:
- đúng định vị
- đúng nội dung
- đúng luồng user
- đúng SEO
- đúng CTA
- đúng logic publish

---

## 2. NGUYÊN TẮC KHÓA TRƯỚC KHI BUILD

### 2.1. Không được làm sai 4 điểm này
- Không biến web thành blog cá nhân đơn thuần
- Không biến web thành landing page bán khóa học rẻ
- Không làm UI kiểu “coach truyền cảm hứng”
- Không đổi logic nội dung đã khóa

### 2.2. Trục định vị bắt buộc giữ nguyên
- Đi vào bên trong
- Giá trị nội tại
- Môn học dọn dẹp
- Lao động – sáng tạo – trưởng thành
- Đầu tư cho chính mình

### 2.3. Tông nội dung bắt buộc giữ nguyên
- sâu
- thật
- bình tĩnh
- có chiều nội tâm
- không phô trương
- không giảng đạo
- không màu mè

---

## 3. PHASE 0 — FILES DEV PHẢI CÓ TRƯỚC

DEV phải có đủ 4 file nền sau trước khi code:

- `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`
- `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`
- `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`
- `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`

### Check
- [ ] Đã đọc toàn bộ 4 file
- [ ] Đã hiểu homepage không phải sales page
- [ ] Đã hiểu site structure không phải blog thường
- [ ] Đã khóa menu chính
- [ ] Đã khóa content hubs
- [ ] Đã khóa CTA system

---

## 4. PHASE 1 — ROUTES & SITE STRUCTURE

### 4.1. Tạo toàn bộ routes bắt buộc

```txt
/
 /gioi-thieu
 /hanh-trinh
 /phuong-phap
 /chuong-trinh
 /bai-viet
 /bai-viet/[slug]
 /bai-viet/di-vao-ben-trong
 /bai-viet/gia-tri-noi-tai
 /bai-viet/mon-hoc-don-dep
 /bai-viet/lao-dong-sang-tao
 /bai-viet/dau-tu-ban-than
 /bai-viet/du-an-nhat-ky
 /du-an
 /du-an/du-an-buoc
 /du-an/du-an-37-ngay
 /lien-he
 /faq
 /chinh-sach-bao-mat
 /dieu-khoan
```

Check
- Route homepage chạy
- Route bài viết list chạy
- Route bài viết chi tiết chạy
- Route category chạy
- Route chương trình chạy
- Route pháp lý chạy
- Không có route chết
- Không có link # giả

---

## 5. PHASE 2 — GLOBAL LAYOUT

### 5.1. Header

Menu bắt buộc:
- Trang chủ
- Hành trình
- Phương pháp
- Chương trình
- Bài viết
- Liên hệ

Check
- Header desktop rõ
- Header mobile rõ
- Logo click về homepage
- Menu mobile mở/đóng mượt
- CTA header có thể là “Bắt đầu từ đây” hoặc “Liên hệ”

### 5.2. Footer

Footer bắt buộc:
- Giới thiệu
- Hành trình
- Phương pháp
- Chương trình
- Bài viết
- Liên hệ
- Chính sách bảo mật
- Điều khoản sử dụng

Check
- Footer có line thương hiệu
- Footer links đủ
- Footer legal links hoạt động
- Footer không rối

---

## 6. PHASE 3 — HOMEPAGE BUILD

### 6.1. Dựng đúng thứ tự section

Thứ tự bắt buộc:
1. Hero
2. Vấn đề thật
3. Con đường này là gì
4. Phương pháp
5. Môn học dọn dẹp
6. Cái chổi
7. Lao động – quét lá – dòng chảy
8. Giá trị nội tại
9. Đầu tư cho chính mình
10. Môi trường học tập và đồng hành
11. Bài viết nổi bật
12. Lời mời cuối
13. Footer

Check
- Chỉ có 1 H1
- Tất cả section dùng H2 rõ
- Paragraph ngắn, dễ đọc mobile
- CTA có ở hero
- CTA có ở giữa trang
- CTA có ở cuối trang
- Không bỏ section signature “Môn học dọn dẹp”
- Không bỏ section “Cái chổi”
- Không viết lại copy sai tinh thần đã khóa

---

## 7. PHASE 4 — PAGE BUILD

### 7.1. Trang /gioi-thieu

Check
- Có phần giới thiệu người sáng lập / người viết
- Có phần vì sao web này tồn tại
- Có phần hành trình thật
- Không thần tượng hóa cá nhân
- Có CTA sang /hanh-trinh hoặc /lien-he

### 7.2. Trang /hanh-trinh

Check
- Giải thích rõ “đi vào bên trong”
- Có nỗi đau → con đường → thành quả
- Có CTA sang /phuong-phap
- Có CTA sang /chuong-trinh

### 7.3. Trang /phuong-phap

Check
- Có 4 lớp: Quan sát / Cảm nhận / Hành động / Chuyển hóa
- Có logic nội tâm ↔ môi trường sống ↔ vật thể ↔ hành vi
- Có CTA sang môn học dọn dẹp
- Có CTA liên hệ

### 7.4. Trang /chuong-trinh

Check
- Không trình bày kiểu bảng giá thô
- Có mô tả rõ chương trình nào dành cho ai
- Có logic đầu tư cho chính mình
- Có form hoặc CTA liên hệ
- Không dùng ngôn ngữ hứa hẹn quá mức

### 7.5. Trang /bai-viet

Check
- Có list bài viết mới
- Có list bài nổi bật
- Có filter theo category
- Có card bài viết rõ
- Có excerpt
- Có breadcrumb nếu cần

### 7.6. Trang /du-an

Check
- Có Dự án BƯỚC
- Có Dự án 37 ngày
- Có mô tả dự án rõ
- Có CTA liên hệ / đồng hành

---

## 8. PHASE 5 — CMS / CONTENT MODEL

### 8.1. Tạo content model bắt buộc

Field chuẩn cho bài viết:
- title
- slug
- excerpt
- content
- category
- tags
- featured_image
- featured
- pillar_post
- series_name
- series_order
- seo_title
- seo_description
- og_image
- published_at
- updated_at

Check
- CMS đã có field title
- CMS đã có field slug
- CMS đã có field excerpt
- CMS đã có field content
- CMS đã có field category
- CMS đã có field SEO
- CMS đã có field featured/pillar
- CMS đã có field published date

### 8.2. Category lock

Phải có đúng các category:
- di-vao-ben-trong
- gia-tri-noi-tai
- mon-hoc-don-dep
- lao-dong-sang-tao
- dau-tu-ban-than
- du-an-nhat-ky

Check
- Tạo đủ category
- Slug category chuẩn không dấu
- Category page render đúng
- Không tạo category thừa linh tinh

---

## 9. PHASE 6 — CONTENT IMPORT

### 9.1. Import 10 bài bắt buộc trước

Thứ tự bắt buộc:
1. Điều đáng tiếc nhất khi kết thúc một kiếp sống
2. Hành trình đi vào bên trong
3. Đi vào bên trong – giải mã những gì đang vận hành bạn
4. Trưởng thành thông qua môn học dọn dẹp
5. Cái chổi
6. Quét lá và việc học
7. Giá trị nào là vĩnh cửu trước sóng gió
8. Đầu tư bản thân – học tập nhận thức cao hơn
9. Đầu tư hiện tại – tự do tương lai
10. Kiến tạo một đời sống ý nghĩa

Check
- Import đủ 10 bài
- Title chuẩn
- Slug chuẩn
- Excerpt có
- Category đúng
- SEO title/description có
- Related posts có
- CTA cuối bài có

### 9.2. Import nhóm 2

11. Môn học dọn dẹp tổng quan  
12. Kết nối linh hồn vật thể  
13. Kết nối sáng tạo  
14. Hồi sinh sự sống từ sự sáng tạo nguyên sơ  
15. Dòng chảy sáng tạo – dòng chảy sự sống  
16. Mình đang đi con đường gì  
17. Giá trị cuộc đời bạn đáng giá bao nhiêu  
18. Từ 55 triệu đến tự do  
19. Học tập – sáng tạo – trưởng thành  
20. Dự án BƯỚC

Check
- Import xong nhóm 2
- Featured đúng bài trụ cột
- Hub signature đã đủ chiều sâu

---

## 10. PHASE 7 — INTERNAL LINKING

### 10.1. Mỗi bài bắt buộc phải có
- 1 link cùng hub
- 1 link sang hub khác
- 1 link sang page chính
- 1 CTA cuối bài

Check
- Bài “Điều đáng tiếc nhất…” link đúng
- Bài “Hành trình đi vào bên trong” link đúng
- Bài “Môn học dọn dẹp” link đúng
- Bài “Cái chổi” link đúng
- Bài “Đầu tư bản thân” link đúng

### 10.2. Related posts block

Phải có cuối mỗi bài:
- Bài liên quan
- Bắt đầu từ đây / CTA mềm

Check
- Related posts hoạt động
- Không hiện bài rác
- Ưu tiên bài cùng hub
- Có thể hiện 3 bài liên quan

---

## 11. PHASE 8 — CTA SYSTEM

### 11.1. CTA chính toàn site

Chỉ dùng các nhóm CTA đã khóa:

CTA mềm
- Đọc hành trình
- Xem phương pháp
- Tìm con đường của mình

CTA trung bình
- Xem chương trình
- Bắt đầu từ đây
- Để lại lời nhắn

CTA mạnh hơn
- Liên hệ đồng hành
- Khi bạn sẵn sàng, hãy bước
- Bắt đầu hành trình cùng chúng tôi

Check
- Hero CTA đúng
- Mid-page CTA đúng
- End-page CTA đúng
- End-of-article CTA đúng
- Không dùng CTA sales rẻ tiền

### 11.2. Không được dùng
- Mua ngay
- Đăng ký ngay để đổi đời
- Số lượng có hạn
- Cam kết thành công
- Giá sốc
- Chốt sale kiểu khóa học

Check
- Đã rà toàn bộ CTA
- Không có ngôn ngữ sai định vị

---

## 12. PHASE 9 — SEO ON-PAGE

### 12.1. Homepage

Check
- SEO title đúng
- Meta description đúng
- OG title đúng
- OG description đúng
- Canonical đúng
- 1 H1 duy nhất
- H2 có logic
- Internal links đủ

### 12.2. Từng bài viết

Check
- SEO title riêng
- Meta description riêng
- Slug ngắn
- Có H1
- Có H2/H3
- Có excerpt
- Có internal links
- Có related posts
- Có CTA cuối bài

### 12.3. Category pages

Check
- Có intro text riêng
- Có meta title riêng
- Có meta description riêng
- Không để trang category rỗng
- Có article cards chuẩn

---

## 13. PHASE 10 — SEO TECHNICAL

Check
- sitemap.xml có generate
- robots.txt có
- canonical tags có
- Open Graph tags có
- Twitter tags có nếu dùng
- structured data có
- breadcrumb schema nếu có
- article schema trên bài viết
- website schema
- organization/person schema nếu phù hợp

Core web & technical
- Ảnh nén tốt
- Lazy load ảnh
- Font không quá nặng
- Mobile load nhanh
- Không CLS lớn
- Không JS thừa làm chậm web

---

## 14. PHASE 11 — FORM / CONTACT / CONVERSION

### 14.1. Trang /lien-he

Check
- Form đơn giản
- Tên
- Email hoặc số điện thoại
- Nội dung lời nhắn
- CTA gửi rõ ràng
- Có text dẫn nhẹ, không sales

### 14.2. Conversion paths

Phải có đường đi từ:
- Homepage → Hành trình → Chương trình → Liên hệ
- Bài viết → Bài liên quan → Chương trình → Liên hệ
- Category → Article → CTA → Liên hệ

Check
- Các luồng click hoạt động
- Không cụt luồng
- Không có trang đọc xong bế tắc

---

## 15. PHASE 12 — UI / RESPONSIVE / FINAL REVIEW

Desktop
- Header đẹp, rõ
- Typography dễ đọc
- Khoảng trắng tốt
- CTA không quá gắt
- Bài viết hiển thị đẹp

Mobile
- Menu mobile ổn
- Hero không vỡ
- Paragraph dễ đọc
- CTA bấm được
- Card bài viết không lỗi
- Footer không quá dài dòng

Visual lock
- Không màu mè
- Không “coach style”
- Không hiệu ứng vô nghĩa
- Có chiều sâu, sạch, tĩnh, trưởng thành

---

## 16. PHASE 13 — PRE-PUBLISH QA

### 16.1. QA content
- Không lỗi chính tả lớn
- Không trùng title
- Không category sai
- Không excerpt thiếu
- Không bài nào thiếu CTA
- Không bài nào thiếu meta

### 16.2. QA links
- Header links đúng
- Footer links đúng
- Internal article links đúng
- CTA buttons đúng
- Không có 404

### 16.3. QA SEO
- Homepage indexable
- Bài viết indexable
- Legal pages có thể index hoặc noindex tùy lựa chọn
- Noindex những gì không cần public nếu có
- Sitemap submit được

---

## 17. PHASE 14 — DEPLOY

### 17.1. Trước deploy production
- Backup code
- Backup content
- Confirm env production
- Confirm domain chính
- Confirm canonical domain
- Confirm analytics ID
- Confirm Search Console setup

### 17.2. Sau deploy
- Test homepage
- Test 5 bài viết đầu
- Test category pages
- Test form liên hệ
- Test mobile thực tế
- Test tốc độ cơ bản
- Submit sitemap vào Search Console
- Kiểm tra index

---

## 18. DANH SÁCH ƯU TIÊN 1 → 20 CHO DEV

1. Dựng routes
2. Dựng layout global
3. Dựng homepage theo spec
4. Dựng article template
5. Dựng category template
6. Dựng page hành trình
7. Dựng page phương pháp
8. Dựng page chương trình
9. Dựng page liên hệ
10. Tạo CMS fields
11. Tạo category chuẩn
12. Import 10 bài đầu
13. Gắn internal links
14. Gắn CTA blocks
15. Gắn related posts
16. Gắn meta/OG/canonical
17. Gắn schema
18. Tạo sitemap/robots
19. QA desktop/mobile
20. Deploy production

---

## 19. ĐIỀU KIỆN ĐƯỢC COI LÀ “DEPLOY XONG THẬT”

Website chỉ được coi là xong khi:
- homepage đã đúng content
- 10 bài đầu đã publish
- category pages đã có bài
- CTA đã chạy
- internal links đã có
- meta SEO đã đủ
- sitemap đã có
- form liên hệ đã test
- mobile đã ổn
- không còn route chết

Nếu thiếu 1 trong các điểm này, chưa được coi là deploy xong.

---

## 20. KẾT LUẬN

DEV không cần sáng tác thêm định hướng.

Chỉ cần làm đúng tuần tự:

structure → pages → content → CTA → internal links → SEO → QA → deploy

Nguyenlananh.com phải lên production như một hệ nội dung hoàn chỉnh, có chiều sâu, có logic hành trình, có khả năng giữ người đọc, và có đường dẫn rõ ràng từ chạm đến hành động.

---

END
