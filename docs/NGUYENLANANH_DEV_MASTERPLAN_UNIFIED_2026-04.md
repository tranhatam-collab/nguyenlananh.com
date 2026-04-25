# NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md

Version: 1.0
Status: FINAL MASTER PLAN FOR DEV
Scope: brand, homepage, menu, membership, admin, content, monetization
Date: 2026-04

---

## 1. Mục tiêu file

Đây là file kế hoạch hợp nhất cuối cùng cho team dev triển khai `nguyenlananh.com` ở giai đoạn tiếp theo.

File này kết hợp:

- bản kế hoạch mở rộng toàn diện
- bản tối ưu hóa rút gọn theo hướng chuyển đổi mạnh hơn
- cập nhật mới về quyền đồng hành kiếm tiền của thành viên
- yêu cầu bắt buộc về trang admin toàn quyền

Nguyên tắc:

- không xây website như một blog đẹp hơn
- không xây homepage quá triết lý mà thiếu hành động
- không biến membership thành paywall đọc bài
- không mở quá nhiều lớp public menu làm người mới rối

Mục tiêu đúng:

- homepage rõ trong 30 giây
- kéo quyết định trong 3 phút
- membership được hiểu là guided journey
- hệ đủ nhẹ để build trong 2-4 tuần đầu
- đủ đúng để scale trong 6-12 tháng

---

## 2. Kết luận chiến lược đã chốt

### 2.1. Giữ nguyên

- thương hiệu `Nguyễn Lan Anh`
- tên tiếng Anh `Lan Anh Nguyen`
- tagline VI: `Đi vào bên trong để làm chủ lại cuộc đời`
- tagline EN: `Go within to take back your life`
- trục nội dung cốt lõi:
  - đi vào bên trong
  - phương pháp 4 bước
  - môn học dọn dẹp
  - cái chổi
  - lao động sáng tạo
  - giá trị nội tại
- tone viết:
  - sâu
  - thật
  - bình tĩnh
  - không ép bán

### 2.2. Phải sửa ngay

- homepage đang chạm đúng nhưng chưa kéo hành động đủ mạnh
- `/join/` chưa nói rõ người dùng nhận gì
- membership đang dễ bị hiểu là “đọc sâu hơn” thay vì “được dẫn đi”
- header/menu chưa phản ánh logic phát triển dài hạn của hệ
- thiếu social proof thật
- thiếu lead magnet để thu email

### 2.3. Quyết định chiến lược

Phase hiện tại phải ưu tiên:

1. clarity
2. conversion
3. member activation
4. retention
5. scale

Không mở quá nhiều mặt trận cùng lúc.

---

## 3. Brand Lock

### 3.1. Tên hiển thị chuẩn

- VI: `Nguyễn Lan Anh`
- EN: `Lan Anh Nguyen`
- system/domain: `Nguyenlananh.com`

### 3.2. Positioning một câu

`Một hệ hành trình giúp con người thoát khỏi vòng lặp và xây lại cuộc đời từ bên trong.`

### 3.3. Quy tắc dùng tên

- public VI dùng `Nguyễn Lan Anh`
- public EN dùng `Lan Anh Nguyen`
- không trộn `Join` vào menu tiếng Việt
- không để page EN còn block UI-facing bằng tiếng Việt

---

## 4. Menu Final

### 4.1. Menu public phase 1

Menu chính phải giản lược để người mới không bị overload.

Final:

- `Trang chủ`
- `Hành trình`
- `Phương pháp`
- `Bài viết`
- `Thành viên`
- `Bắt đầu`

CTA accent:

- `Bắt đầu 3 USD`

### 4.2. Điều bị bỏ khỏi menu public top-level

- `Môn học`
- `Cộng đồng`
- `Đầu tư bản thân`
- `Dự án`
- `Về Lan Anh`

Các mục này không biến mất.
Chúng chuyển thành:

- page cấp 2
- hub content
- footer
- dashboard/member navigation

### 4.3. Menu EN phase 1

- `Home`
- `Journey`
- `Method`
- `Articles`
- `Membership`
- `Start`

---

## 5. Site Architecture Final

### 5.1. Public core

```txt
/
/hanh-trinh/
/hanh-trinh/phuong-phap/
/hanh-trinh/series/
/bai-viet/
/bai-viet/[slug]/
/thanh-vien/ hoặc /members/ (public membership landing)
/join/
/ve-lan-anh/
/faq/
/lien-he/
/tai-nguyen/
```

### 5.2. Logged-in member

```txt
/members/dashboard/
/members/journey/
/members/check-in/
/members/library/
/members/community/
/members/progress/
```

### 5.3. Premium / advanced

```txt
/chuong-trinh/
/chuong-trinh/so-sanh/
/chuong-trinh/premium/
```

### 5.4. English phase

```txt
/en/
/en/join/
/en/about/
/en/articles/
/en/membership/
```

Ghi chú:

- nếu đang dùng `/members/` cho route nội bộ, phase này nên tách rõ:
  - `/members/` = landing công khai
  - `/members/dashboard/` = sau login
- nếu cần giữ backward compatibility, có thể dùng redirect hoặc alias

---

## 6. Homepage Final

Nguyên tắc:

- mỗi section trả lời một câu hỏi duy nhất
- user phải hiểu site trong 30 giây
- user phải bị kéo click `join` trong 3 phút

### 6.1. Section 1 - Hero

Mục tiêu:
- hiểu ngay đây là gì
- hiểu mình có phù hợp không
- thấy CTA rõ

Copy khóa:

H1

`Bạn không thiếu khả năng`
`Bạn đang mắc kẹt trong những vòng lặp chưa được nhìn thấy`

Sub:

`Nếu bạn không thay đổi cách bạn sống`
`Bạn sẽ tiếp tục lặp lại cuộc đời này`

CTA:

- `Bắt đầu từ 3 USD`
- `Xem hành trình`

Visual:

- không dùng ảnh stock
- dùng ảnh thật / video loop thật
- ưu tiên các motif:
  - phòng bừa -> sạch
  - bàn làm việc rối -> gọn
  - ánh sáng chuyển

### 6.2. Section 2 - Bạn đang gặp gì

4 card:

- mệt nhưng không biết vì sao
- làm nhiều nhưng không tiến
- biết nhưng không làm
- muốn thay đổi nhưng không bắt đầu

### 6.3. Section 3 - Con đường này

Không viết triết lý dài.

Chỉ rõ:

- nhìn
- gỡ
- xây

### 6.4. Section 4 - Signature DNA

Không được bỏ:

- Môn học dọn dẹp
- Cái chổi
- Quét lá

Đây là phần giữ user lại vì nó tạo khác biệt thương hiệu.

### 6.5. Section 5 - Social proof

Phải thêm:

- 5 testimonial thật
- ảnh thật
- trước/sau

Nguyên tắc:

- tuyệt đối không fake testimonial
- nếu chưa có quote được duyệt, hiển thị structural placeholder ở design file, không đẩy fake content lên production

### 6.6. Section 6 - Hành trình 90 ngày

Timeline:

- Day 1-7: nhìn
- Day 7-21: gỡ
- Day 21-90: xây

### 6.7. Section 7 - Membership

Title:

`Bắt đầu hành trình thật của bạn`

Giải thích rõ:

- lộ trình 90 ngày
- bài tập mỗi ngày
- hệ nhận thức
- môi trường đúng

Pricing giữ:

- Year 1: 3 USD
- Year 2: 60 USD
- Year 3+: 99 USD

CTA:

- `Bắt đầu ngay`

### 6.8. Section 8 - Community / Check-in preview

Mục tiêu:

- biến website từ content site thành living system

Hiển thị:

- topic hôm nay
- số người check-in
- preview lịch tuần

### 6.9. Section 9 - Final CTA + lead magnet

Thông điệp:

`Nếu bạn đọc tới đây, bạn đã biết mình không thể sống như cũ.`

2 đường vào:

- `Bắt đầu 3 USD`
- nhận lead magnet qua email

---

## 7. Join Page Final

`/join/` không còn là trang treo giá.

Nó phải là:

- pricing clarity page
- giải thích được gì ở từng tier
- có trust
- có visual
- có FAQ ngắn

### 7.1. Join page phải có

- hero ngắn
- giải thích membership là guided journey
- 3 tier rõ ràng
- premium 1:1 là application-based
- FAQ
- trust elements:
  - payment trust
  - testimonial thật
  - hành trình 90 ngày
  - lợi ích cụ thể

### 7.2. Payment

Hiện tại chốt:

- vẫn dùng `PayPal`
- chưa chuyển sang `Stripe` ở phase này

Nhưng dev phải chuẩn bị kiến trúc để sau này đổi được sang:

- Stripe auto
- webhook auto-create member
- role-based gating

PayPal hiện tại là giải pháp vận hành tạm thời, không phải đích cuối.

---

## 8. Membership Value Proposition

Không dùng messaging:

- `đọc nội dung sâu hơn`

Phải dùng:

- `được dẫn đi`
- `vào một hệ`
- `có lộ trình`
- `có bài tập`
- `có chuyển hóa`

Core value proposition:

`Bạn không mua nội dung. Bạn bước vào một hệ có lộ trình, thực hành và đồng hành.`

---

## 9. Membership Tiers

### 9.1. Phase 1

- `Khởi đầu` - 3 USD năm đầu
- `Đồng hành` - 60 USD
- `Chuyển hóa` - 99 USD
- `Premium 1:1` - application-based

### 9.2. Copy logic từng gói

Khởi đầu:

- dành cho người muốn bắt đầu ngay
- có lộ trình nền
- có check-in cơ bản
- có 2 series cốt lõi

Đồng hành:

- dành cho người muốn đi sâu hơn
- có workbook / audio / group check-in
- có series mở rộng

Chuyển hóa:

- dành cho người muốn hành trình nghiêm túc hơn
- có lộ trình sâu hơn
- có phản hồi / cộng đồng sâu hơn

Premium 1:1:

- dành cho số ít người cần đồng hành trực tiếp

---

## 10. Hệ thống nội dung

### 10.1. Public content

Mỗi bài public bắt buộc có:

- 1 insight mạnh
- 1 hành động cụ thể
- 1 CTA

CTA mẫu:

`Bạn có thể đọc tiếp`
`Hoặc bắt đầu hành trình thật`

link -> `/join/`

### 10.2. Member content

Mỗi bài member-only bắt buộc có:

- 1 bài học sâu
- 1 worksheet / prompt / audio / checklist
- 1 check-in action

Nếu không có thực hành, membership sẽ bị hiểu là kho bài đọc.

### 10.3. 5 tầng nội dung

- Tầng 0: lead magnet
- Tầng 1: public free
- Tầng 2: member khởi đầu
- Tầng 3: member đồng hành
- Tầng 4: member chuyển hóa
- Tầng 5: premium 1:1

---

## 11. Quyền đồng hành kiếm tiền của thành viên

Đây là cập nhật chiến lược mới, rất quan trọng.

### 11.1. Bản chất

Sau khi là thành viên chính thức, thành viên phù hợp có thể:

- sáng tạo nội dung
- làm video
- viết bài
- tạo file / workbook / tài liệu
- cùng bán / cùng triển khai trong hệ

Điều kiện:

- có cùng tâm huyết
- đi lâu dài
- phù hợp tinh thần thương hiệu
- được duyệt

### 11.2. Quy tắc public

Quyền lợi này:

- không nói công khai ở lớp ngoài
- không dùng làm hook bán membership trên homepage
- chỉ mở ở lớp thành viên chính thức

Lý do:

- tránh làm membership bị hiểu sai thành cơ hội MMO
- giữ đúng positioning là guided journey trước
- cơ chế cộng tác là lợi ích chiều sâu, không phải front-facing promise

### 11.3. Khu vực nội bộ cần có

Trong member area nên có một lớp riêng:

```txt
/members/creator/
/members/creator/guidelines/
/members/creator/submit/
/members/creator/revenue-share/
/members/creator/library/
```

### 11.4. Revenue share policy

Dev chưa cần hardcode tỷ lệ phần trăm lúc này.

Nhưng hệ phải chuẩn bị chỗ cho:

- cấu hình tỷ lệ hoa hồng
- nội dung gửi duyệt
- trạng thái duyệt
- nội dung đã public
- doanh thu / chia sẻ / payout log

### 11.5. Vai trò admin ở layer này

Admin phải có quyền:

- duyệt / từ chối nội dung
- chỉnh sửa trước khi public
- gán mức chia sẻ
- theo dõi hiệu suất nội dung / doanh thu

---

## 12. Check-in & community

Ưu tiên rollout:

### 12.1. Phase đầu

- check-in text đơn giản
- streak
- topic of the day
- dashboard progress
- feed nhẹ

### 12.2. Phase sau

- badge
- export PDF
- comment
- leaderboard mềm
- mentor feedback

Không mở quá lớn từ đầu để tránh vỡ scope.

---

## 13. Admin System Bắt Buộc

Team dev phải hiểu rõ:

website cần một trang admin toàn quyền,
để quản lý web mà không phụ thuộc code gốc.

### 13.1. Mục tiêu admin

Admin phải có thể:

- đăng nội dung
- sửa nội dung
- duyệt nội dung
- khóa / mở nội dung theo tier
- quản lý thành viên
- quản lý check-in
- quản lý lead magnet
- quản lý homepage block
- quản lý pricing text
- quản lý testimonial
- quản lý creator submissions

### 13.2. Admin modules bắt buộc

```txt
/admin/
/admin/dashboard/
/admin/content/
/admin/content/posts/
/admin/content/pages/
/admin/content/homepage-blocks/
/admin/members/
/admin/members/tier-access/
/admin/community/checkins/
/admin/community/testimonials/
/admin/creators/
/admin/creators/submissions/
/admin/creators/revenue-share/
/admin/settings/
/admin/settings/seo/
/admin/settings/paypal/
/admin/settings/email/
```

### 13.3. Admin principles

- non-technical team dùng được
- edit không chạm code
- có draft / review / publish
- có role-based access
- có activity log

### 13.4. Role gợi ý

- `owner`
- `admin`
- `editor`
- `reviewer`
- `community-manager`

---

## 14. Tech Stack Chốt Cho Phase Này

Do user đã khóa:

- tạm thời vẫn dùng `PayPal`
- chưa dùng `Stripe`

stack phase này phải ưu tiên:

- nhanh
- ổn định
- dễ mở rộng sang admin / member / content gating

Khuyến nghị implementation:

- frontend hiện tại có thể tiếp tục
- membership/auth/gating dần đẩy về backend
- admin phải tách khỏi code content tĩnh
- PayPal giữ là payment source hiện tại
- hệ phải có chỗ để sau này cắm Stripe

Nguyên tắc:

- không khóa kiến trúc vào manual PayPal flow quá lâu

---

## 15. Traffic & growth

Không làm tất cả cùng lúc.

### 15.1. 90 ngày đầu ưu tiên

- homepage convert
- `/join/`
- email capture
- SEO bài viết
- 2 short video/tuần

### 15.2. Sau đó

- newsletter
- Facebook group
- workshop free 2 tuần/lần

### 15.3. Làm sau

- YouTube dài
- PR
- affiliate

---

## 16. KPI

Ưu tiên KPI theo thứ tự:

1. hero CTR
2. email opt-in
3. join page conversion
4. member activation tuần 1
5. 30-day retention
6. upgrade rate

Doanh thu đi theo sau clarity + retention.

Target định hướng:

- $1,000 -> $5,000 USD / tháng

Nhưng đây là mục tiêu nội bộ định hướng, không phải cam kết tài chính.

---

## 17. Sprint Plan

### Sprint 1 - Conversion foundation

- homepage final
- menu mới
- hero visual
- CTA system
- `/join/` mới
- PayPal clarity flow

### Sprint 2 - Membership clarity

- tier logic
- content gating
- FAQ
- lead magnet
- email opt-in
- welcome sequence

### Sprint 3 - Member activation

- dashboard
- check-in MVP
- progress
- library
- daily prompt

### Sprint 4 - Scale prep

- testimonials
- community feed
- creator layer foundations
- admin system
- EN audit
- performance pass

---

## 18. Việc phải làm ngay hôm nay

1. khóa menu final
2. khóa 9 section homepage final
3. viết lại `/join/` thành pricing clarity page
4. chụp ảnh thật + quay video 60 giây
5. tạo lead magnet PDF đầu tiên
6. gắn CTA thống nhất toàn site
7. chốt stack kỹ thuật phase này
8. chốt 3 tier + premium
9. chốt admin modules
10. chốt creator layer nội bộ

---

## 19. Definition Of Done

Chỉ coi phase planning này là xong khi team dev hiểu rõ:

- build homepage để convert, không chỉ để đẹp
- menu public phải giản lược
- membership là guided journey
- `/join/` phải giải thích rõ lợi ích
- content public và content member có logic khác nhau
- creator economy là internal member benefit, không public promise
- admin là bắt buộc, không phải nice-to-have
- PayPal là hiện tại, nhưng kiến trúc phải mở cho tương lai

---

## 20. Kết luận cuối cùng

Đừng nâng `nguyenlananh.com` thành một website đẹp hơn.

Hãy nâng nó thành:

- một hệ hành trình rõ hơn
- một homepage chuyển đổi tốt hơn
- một membership sống hơn
- một hệ nội dung có khả năng giữ người và mở ra đồng hành dài hạn

Quyết định trung tâm của toàn hệ vẫn chỉ là một câu:

`Bắt đầu từ đây.`
