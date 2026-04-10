# TEAM_1_PUBLIC_CONVERSION_LIVE_TODAY.md

Version: 1.0
Status: EXECUTE TODAY
Owner lane: Team 1
Mission: khóa toàn bộ public surface để `nguyenlananh.com` live hôm nay với conversion mạnh hơn, rõ hơn, đúng brand hơn

---

## 1. Vai trò của Team 1

Team 1 chịu trách nhiệm toàn bộ phần người dùng nhìn thấy trước khi đăng ký:

- homepage
- header / footer / menu
- `/join/`
- article CTA public
- trust blocks công khai
- ngôn ngữ VI/EN ở lớp public

Mục tiêu:

- trong 30 giây user hiểu đây là gì
- trong 3 phút user muốn bấm `Bắt đầu`
- public site không còn cảm giác “đọc hay nhưng chưa biết làm gì tiếp”

---

## 2. Output bắt buộc phải live hôm nay

### 2.1. Homepage

Phải hoàn thành:

- hero mới theo master plan
- menu final public
- section `Bạn đang gặp gì`
- section `Con đường này`
- section signature:
  - môn học dọn dẹp
  - cái chổi
  - quét lá
- section social proof hoặc placeholder thật có nhãn rõ `đang cập nhật`
- section timeline 90 ngày
- section membership preview
- final CTA
- lead magnet placeholder block nếu form chưa kịp nối backend

### 2.2. Join page

`/join/` phải được nâng cấp thành pricing clarity page:

- giải thích membership là guided journey
- hiển thị rõ 3 tier:
  - 3 USD năm đầu
  - 60 USD
  - 99 USD
- giải thích từng tier dành cho ai
- trust copy ngắn
- PayPal flow rõ ràng
- FAQ ngắn

### 2.3. CTA toàn site

Tối thiểu phải thêm CTA thống nhất ở:

- homepage
- join page
- article list page
- 10 bài public nền tảng ưu tiên

CTA khóa:

- `Bắt đầu từ 3 USD`
- `Xem hành trình`
- `Bạn có thể đọc tiếp hoặc bắt đầu hành trình thật`

### 2.4. Song ngữ lớp public

Phải rà:

- `index.html`
- `en/index.html`
- `join/index.html`
- `en/join/index.html`
- `bai-viet/index.html`
- `en/bai-viet/index.html`

Quy tắc:

- không còn block UI-facing tiếng Việt trong trang EN
- tên hiển thị:
  - VI: `Nguyễn Lan Anh`
  - EN: `Lan Anh Nguyen`

---

## 3. File ownership của Team 1

Team 1 được sửa:

```txt
/index.html
/en/index.html
/join/index.html
/en/join/index.html
/bai-viet/index.html
/en/bai-viet/index.html
/gioi-thieu/index.html
/en/gioi-thieu/index.html
/hanh-trinh/index.html
/en/hanh-trinh/index.html
/phuong-phap/index.html
/en/phuong-phap/index.html
/faq/index.html
/en/faq/index.html
/assets/site.css
/assets/site.js
/assets/lang-routing.js
/assets/images/*
/assets/og/*
```

Team 1 không tự ý sửa:

```txt
/members/*
/en/members/*
/assets/members.js
```

Nếu buộc phải chạm sang vùng Team 2, phải sync trước.

---

## 4. Những gì Team 1 không làm hôm nay

Không mở thêm scope:

- không build admin thật
- không build check-in backend
- không build payment automation mới
- không thêm menu public quá dày
- không public quyền creator/revenue-share ra ngoài

---

## 5. Checklist triển khai theo giờ

### Block 1 - 09:00-11:00

- khóa menu public final
- khóa hero final
- khóa section order homepage
- khóa visual style cho homepage

### Block 2 - 11:00-13:00

- build homepage desktop
- build mobile menu
- build CTA block giữa trang và cuối trang

### Block 3 - 13:00-15:00

- build `/join/`
- viết rõ benefit từng tier
- chèn PayPal trust copy

### Block 4 - 15:00-17:00

- chèn CTA thống nhất vào article list và 10 bài ưu tiên
- rà EN public

### Block 5 - 17:00-18:30

- responsive pass
- SEO pass nhẹ:
  - title
  - description
  - H1/H2
  - canonical

### Block 6 - 18:30-19:30

- smoke test toàn bộ public routes
- bàn giao cho integration

---

## 6. Definition of Done cho Team 1

Chỉ được coi là xong khi đủ:

- homepage phản ánh đúng master plan mới
- menu public final đã gọn và đúng logic
- `/join/` không còn là trang giá treo lơ lửng
- CTA đã rõ và nhất quán
- EN public không còn lẫn UI tiếng Việt
- mobile homepage đọc tốt
- không có link chết ở các CTA mới

---

## 7. Smoke test bắt buộc

Test thủ công tối thiểu:

- `/`
- `/en/`
- `/join/`
- `/en/join/`
- `/bai-viet/`
- `/en/bai-viet/`
- 5 bài public trọng điểm

Phải kiểm:

- header
- CTA hero
- CTA giữa trang
- CTA cuối trang
- footer
- ngôn ngữ
- spacing mobile

---

## 8. Điểm chốt cần bàn giao cho Team 2

Team 1 phải bàn giao:

- link CTA cuối cùng sẽ đi đến đâu
- wording cuối cùng của 3 tier trên `/join/`
- slug public nào được dùng làm teaser kéo vào member area
- section nào ở homepage sẽ dẫn vào `/members/` và section nào dẫn vào `/join/`

---

## 9. Rủi ro cần tránh

- làm homepage quá dài và quá triết lý
- nhồi thêm menu public vượt scope
- đưa community/creator economy ra mặt ngoài
- giữ nguyên copy cũ nhưng chỉ đổi màu/layout
- EN bị dịch nửa vời

---

## 10. Kết quả cuối Team 1 phải tạo ra

Một lớp public đủ mạnh để:

- giữ user ở lại
- dẫn user sang `join`
- làm rõ khác biệt thương hiệu
- chuẩn bị nền cho Team 2 kéo user vào lớp thành viên sống động hơn
