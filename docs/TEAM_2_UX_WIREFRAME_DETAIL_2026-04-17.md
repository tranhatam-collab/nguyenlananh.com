# TEAM 2 UX WIREFRAME DETAIL

Version: 1.0  
Date: 2026-04-17  
Owner: Team 2 (UX + Content + Dev)  
Status: EXECUTION READY  
Primary source: `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`  

---

## 1. Mục tiêu

Tài liệu này chuyển SSOT thành wireframe triển khai được ngay cho từng trang.

Mục tiêu không phải làm site thật nhiều khối.  
Mục tiêu là tạo một hành trình đọc:

- yên
- rõ
- sâu
- có hướng đi tiếp

Mỗi trang phải giúp người dùng đi thêm một bước vào bên trong, không bị đẩy vào cảm giác đang bị bán hàng.

---

## 2. Global UX Rules

- Mobile-first.
- Không nhồi quá nhiều section trên một màn hình đầu.
- Không dùng hero kiểu marketing.
- Không dùng testimonial, badge, slogan bar, counter bar, popup.
- Không dùng CTA dồn dập.
- Không dùng copy dài thành khối đặc.
- Không dùng hình stock.
- Không dùng animation nặng.
- Khoảng trắng phải rộng, có nhịp thở.
- Heading serif nhẹ, body sans-serif.

---

## 3. Global Navigation

## Header

Thứ tự:

1. Logo / tên site
2. Menu chính
3. Language switch
4. CTA nhẹ nếu cần

Menu chính khóa:

- Trang Chủ
- Hành Trình
- Bài Viết
- Hệ Thống
- Đồng Hành
- Kết Nối

Quy tắc:

- desktop: menu ngang, gọn
- mobile: menu drawer đơn giản, không nhiều tầng
- header có thể sticky nhẹ, nhưng không thu/phóng phức tạp

## Footer

Phải có:

- Câu chuyện
- Điều khoản
- Quyền riêng tư
- Ngôn ngữ

Có thể thêm:

- email liên hệ
- copyright ngắn

Không thêm:

- social block ồn
- nhiều cột link dày đặc

---

## 4. Route Map đề xuất

- `/`
- `/hanh-trinh/`
- `/bai-viet/`
- `/bai-viet/[slug]/`
- `/he-thong/`
- `/dong-hanh/`
- `/ket-noi/`
- `/cau-chuyen/`
- `/dieu-khoan/`
- `/quyen-rieng-tu/`

Nếu có route cũ khác tên, phải redirect về bộ route mới.

---

## 5. Trang Chủ

## Mục tiêu

- định vị site ngay lập tức
- tạo cảm giác tin cậy, yên và sâu
- dẫn người đọc sang bài viết đầu tiên

## Cấu trúc wireframe

### Section 1 - Hero

Thành phần:

- eyebrow nhỏ nếu cần: `NGUYENLANANH.COM`
- H1
- subline
- 1 CTA chính
- 1 ảnh thật hoặc khung hình thật, rất tiết chế

Nội dung khóa:

- H1 VI: `Đi vào bên trong để tái thiết cuộc đời.`
- H1 EN: `Rebuild your life from within.`
- Subline VI: `Không phải để trở nên tốt hơn. Mà để hiểu rõ mình đang sống thế nào.`
- Subline EN: `Not to become better. But to understand how you are living.`
- CTA VI: `Bắt đầu từ một bài viết`
- CTA EN: `Start with a piece`

UX note:

- hero không được giống landing page bán khóa học
- text là trọng tâm
- ảnh chỉ hỗ trợ cảm giác, không lấn át
- mobile phải nhìn thấy ngay CTA mà không cần cuộn quá sâu

### Section 2 - Vấn đề

Nội dung:

- `Con người không thiếu thông tin.`
- `Họ thiếu sự rõ ràng.`
- `Họ đọc nhiều.`
- `Nhưng không biết mình đang sống sai ở đâu.`

Layout:

- 1 block text trung tâm
- tối đa 2 cụm ngắt nhịp

### Section 3 - Cách tiếp cận

Nội dung:

- Không dạy.
- Không ép thay đổi.
- Không đưa công thức.
- Chỉ giúp bạn nhìn rõ.

Layout:

- 1 cột text
- có thể dùng divider nhẹ giữa các dòng

### Section 4 - 4 trục

4 item:

- Quan sát / Observation
- Cảm nhận / Feeling
- Hành động / Action
- Chuyển hóa / Shift

Layout:

- mobile: 2 x 2
- desktop: 4 cột

UX note:

- mỗi item cực gọn
- không viết thêm mô tả dài ở home

### Section 5 - Featured Writings

Mục tiêu:

- cho người đọc một nơi bắt đầu thật cụ thể

Thành phần:

- title section ngắn
- 3 bài viết ưu tiên
- 1 CTA sang `/bai-viet/`

Gợi ý 3 bài đầu:

- Điều đáng tiếc nhất khi kết thúc một kiếp sống
- Hành trình đi vào bên trong
- Đi vào bên trong - giải mã những gì đang vận hành bạn

### Section 6 - Closing CTA

Nội dung:

- CTA chính sang trang bài viết hoặc hành trình
- 1 câu ngắn, không thúc ép

Không dùng form ở cuối home.

---

## 6. Trang Hành Trình

## Mục tiêu

- kể phần người thật, không kể thành tích
- giúp người đọc hiểu vì sao site này tồn tại
- dẫn sang bài viết hoặc hệ thống

## Cấu trúc wireframe

### Section 1 - Intro

- H1: `Hành Trình`
- đoạn mở 2-3 nhịp ngắn

### Section 2 - Những lệch hướng đã từng có

Nội dung nên xoay quanh:

- đã từng sai thế nào
- đã từng sống lệch ra sao
- đã từng không hiểu mình thế nào

Layout:

- 3 block dọc
- mỗi block 1 heading ngắn + 1-2 đoạn

### Section 3 - Điều bắt đầu thay đổi

Không kể thành công.  
Chỉ kể khoảnh khắc bắt đầu nhìn ra.

Layout:

- 1 narrative block dài vừa
- có khoảng nghỉ rõ giữa các đoạn

### Section 4 - Từ trải nghiệm sang cách nhìn

Mục tiêu:

- nối Journey với trang System

CTA:

- `Xem hệ thống`
- `Đọc bài viết đầu tiên`

### Section 5 - Closing

- 1 câu chốt nhẹ
- 1 CTA duy nhất

Không thêm timeline thành tích.  
Không thêm logos, milestone, press mention.

---

## 7. Trang Bài Viết

## Mục tiêu

- giúp người đọc chọn một điểm vào phù hợp
- không biến thành trang blog dày đặc
- làm rõ các cụm nội dung mà không quá kỹ thuật

## Cấu trúc wireframe

### Section 1 - Intro

- H1: `Bài Viết`
- subline ngắn giải thích đây là nơi để đọc, không phải feed tin

### Section 2 - Featured Pillar

- 1 bài pillar nổi bật
- headline + 2 dòng dẫn + CTA `Đọc bài`

### Section 3 - Reading Paths

3 đường đọc gợi ý:

- bắt đầu nhìn lại mình
- nhìn lại quan hệ và công việc
- đi sâu hơn vào những gì đang lặp lại

Layout:

- mobile: xếp dọc
- desktop: 3 khối ngang

### Section 4 - All Writings List

Hiển thị dạng:

- danh sách dọc
- mỗi item gồm title, subline ngắn, theme, thời gian đọc

Không ưu tiên grid card dày.

### Section 5 - CTA sang Hệ Thống hoặc Đồng Hành

Tùy mức đọc sâu:

- `Xem hệ thống`
- `Tìm cách đi tiếp`

---

## 8. Template Trang Chi Tiết Bài Viết

## Mục tiêu

- tạo trải nghiệm đọc yên
- giữ nhịp đều
- kết bài bằng một hướng đi tiếp tự nhiên

## Cấu trúc wireframe

### Block 1 - Article Header

- breadcrumb rất nhẹ nếu dùng
- H1
- subline
- metadata tối giản: ngày, thời gian đọc, hub

### Block 2 - Body

- 5-10 đoạn
- line-length thoáng
- khoảng cách giữa đoạn rộng
- không xen quá nhiều quote box

### Block 3 - Conclusion

- 1 câu kết
- không sermon

### Block 4 - Related Reading

- 3 bài liên quan
- ưu tiên theo `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`

### Block 5 - CTA cuối

Một trong các hướng:

- sang `/hanh-trinh/`
- sang `/he-thong/`
- sang `/ket-noi/`

Không dùng popup subscribe giữa bài.

---

## 9. Trang Hệ Thống

## Mục tiêu

- giải thích cách nhìn của site
- cho người đọc thấy đây không phải hệ thống đóng
- chuyển từ cảm nhận sang cấu trúc

## Cấu trúc wireframe

### Section 1 - Intro

- H1: `Hệ Thống`
- đoạn mở ngắn

### Section 2 - Đây không phải là gì

3 ý khóa:

- không phải triết lý
- không phải phương pháp
- không phải hệ thống đóng

Layout:

- 3 item ngang hoặc dọc

### Section 3 - 4 trục

- Quan sát
- Cảm nhận
- Hành động
- Chuyển hóa

Mỗi trục có:

- tên VI
- tên EN
- mô tả 1-2 câu

### Section 4 - Cách áp dụng

Mục tiêu:

- nối từ lý thuyết sang đời sống

Có thể gồm:

- đọc
- quan sát
- thực hành nhỏ
- quay lại nhìn

### Section 5 - CTA

- `Xem cách áp dụng`
- `Bắt đầu từ một bài viết`

---

## 10. Trang Đồng Hành

## Mục tiêu

- mở cánh cửa cho người muốn đi nhanh hơn hoặc sâu hơn
- giữ giọng yên, thật
- không giống trang dịch vụ

## Cấu trúc wireframe

### Section 1 - Intro

Nội dung khóa:

- `Một số người cần đi nhanh hơn.`
- `Một số người cần đi sâu hơn.`
- `Trang này dành cho những người muốn làm điều đó cùng tôi.`

### Section 2 - Khi nào trang này dành cho bạn

Gợi ý nội dung:

- đã đọc nhưng vẫn chưa nhìn rõ
- đang ở ngã rẽ khó
- muốn một đồng hành có chiều sâu, không ồn

Layout:

- 3-4 dấu hiệu ngắn

### Section 3 - Cách đồng hành

Không dùng:

- coaching
- tư vấn
- chữa lành

Thay vào đó mô tả:

- gặp để nhìn rõ
- làm việc chậm nhưng thật
- đi vào điều đang vướng

### Section 4 - Mong đợi

- cách gửi form
- ai phù hợp
- ai không phù hợp
- kỳ vọng phản hồi

### Section 5 - CTA / Form entry

- nút sang form ở cuối trang

Không tạo bảng giá kiểu sales page nếu chưa có yêu cầu rõ.

---

## 11. Trang Kết Nối

## Mục tiêu

- đơn giản
- không làm người dùng ngại điền
- giữ đúng giọng site

## Cấu trúc wireframe

### Section 1 - Intro

- H1: `Kết Nối`
- 1 đoạn ngắn mở lời

### Section 2 - Form

Field khóa:

- Tên
- Email
- Bạn đang gặp điều gì
- Bạn muốn thay đổi điều gì

UX note:

- label rõ
- placeholder ngắn
- không bắt người dùng kể quá sâu
- button submit giản dị

### Section 3 - Note

Nội dung:

- không hỏi quá nhiều
- không ép
- phản hồi theo khả năng và sự phù hợp

---

## 12. Trang Footer phụ

## Câu chuyện

- ngắn hơn Journey
- mang tính nền tảng, không phải PR

## Điều khoản

- rõ, tối giản, đọc được

## Quyền riêng tư

- rõ cách dùng dữ liệu form/contact

## Ngôn ngữ

- switch VI / EN rõ ràng
- giữ cùng route nếu có thể

---

## 13. Component Inventory cho Dev

Các component cần dựng:

- `SiteHeader`
- `SiteFooter`
- `LanguageSwitch`
- `HeroBlock`
- `TextSection`
- `FourAxisGrid`
- `FeaturedWritingList`
- `WritingListItem`
- `ArticleBody`
- `RelatedPosts`
- `QuietCTA`
- `ContactForm`

Quy tắc:

- component phải dùng text từ content source, không hard-code
- hỗ trợ i18n
- giữ spacing rộng
- tránh style card lặp dày đặc

---

## 14. Mobile-first notes

- hero text không được tràn dòng khó đọc
- CTA luôn thấy được trong màn đầu hoặc ngay sau một cuộn ngắn
- list bài viết phải dễ scan bằng ngón tay
- form phải ngắn và không gây mệt
- font size không thu nhỏ quá mức

---

## 15. Definition of Done cho UX

Một page được coi là đạt khi:

- đúng mục tiêu của page
- đúng thứ tự section đã khóa
- không có khối marketing dư thừa
- CTA xuất hiện đúng lúc, không dồn dập
- nội dung đọc thoáng trên mobile
- visual đủ yên, không lạnh, không phô trương
- dev có thể map thẳng wireframe này sang component và content model

---

## 16. Chỉ thị cuối

Website này phải tạo cảm giác:

- được ở lại
- được nhìn rõ
- được đi tiếp

Không phải cảm giác:

- bị thuyết phục
- bị dạy
- bị kéo vào một funnel

Nếu một section nhìn giống marketing page, bỏ đi hoặc viết lại.
