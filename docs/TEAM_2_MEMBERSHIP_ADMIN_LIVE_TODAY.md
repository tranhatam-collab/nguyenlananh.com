# TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md

Version: 1.0
Status: EXECUTE TODAY
Owner lane: Team 2
Mission: khóa toàn bộ lớp thành viên, PayPal flow hiện tại, member journey và admin foundation để site live hôm nay không bị đứt sau khi user đăng ký

---

## 1. Vai trò của Team 2

Team 2 chịu trách nhiệm mọi thứ sau khi user bấm `Bắt đầu`:

- landing `Thành viên`
- join flow kết nối sang membership
- members area
- journey / start / practice / deep
- PayPal logic hiện tại
- admin foundation và content governance
- nội dung quyền creator nội bộ

Mục tiêu:

- user đăng ký xong không bị cụt luồng
- membership được hiểu là hành trình, không phải paywall
- admin có roadmap rõ để chủ quản không phụ thuộc code gốc

---

## 2. Output bắt buộc phải live hôm nay

### 2.1. Thành viên public landing

Hoàn thiện:

- `/members/`
- `/en/members/`

Landing này phải:

- giải thích vào hệ là gì
- nối được sang `/join/`
- nối được sang dashboard/start sau login
- nói rõ đây là guided journey

### 2.2. Member journey cơ bản

Phải hoàn chỉnh và đọc được tốt:

- `/members/start/`
- `/members/journey/day-1/`
- `/members/journey/day-2/`
- `/members/journey/day-7/`
- `/members/practice/`
- `/members/deep/`

và bản EN tương ứng.

### 2.3. Deep layer hiện có

Phải rà toàn bộ:

- sound self practice
- loop map
- family roots
- child growth
- living environment
- gentle discipline
- labor/objects/growth

Mục tiêu:

- điều hướng đúng
- CTA nội bộ đúng
- không 404
- bản EN không lỗi UI

### 2.4. PayPal flow hiện tại

Giữ PayPal làm flow chính ở phase này.

Phải chốt:

- wording thanh toán rõ
- trạng thái sau thanh toán rõ
- magic link / redirect không cụt
- tài liệu vận hành vẫn bám PayPal-first

### 2.5. Admin foundation

Hôm nay chưa cần build full admin thật, nhưng bắt buộc phải chốt và bàn giao được:

- information architecture admin
- module admin bắt buộc
- role matrix
- content workflow
- creator submission workflow

Nếu kịp, dựng skeleton route hoặc placeholder an toàn cho:

```txt
/admin/
/admin/dashboard/
/admin/content/
/admin/members/
/admin/creators/
/admin/settings/
```

---

## 3. File ownership của Team 2

Team 2 được sửa:

```txt
/members/index.html
/en/members/index.html
/members/dashboard/index.html
/en/members/dashboard/index.html
/members/start/index.html
/en/members/start/index.html
/members/journey/**
/en/members/journey/**
/members/practice/index.html
/en/members/practice/index.html
/members/deep/**
/en/members/deep/**
/members/pro/**
/en/members/pro/**
/assets/members.js
/docs/contracts/*
/docs/MEMBERSHIP*
/docs/TEAM_EMAIL_NOTIFICATION_2026-04-09.md
/docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md
```

Team 2 không tự ý sửa:

```txt
/index.html
/en/index.html
/join/index.html
/en/join/index.html
/assets/site.css
/assets/site.js
```

Nếu cần chạm các file public, phải sync với Team 1 trước.

---

## 4. Những gì Team 2 không làm hôm nay

Không mở thêm scope:

- không public quyền revenue-share ra homepage/join
- không chuyển qua Stripe
- không build cộng đồng sâu full feature
- không làm dashboard phức tạp vượt quá member activation MVP
- không build admin backend hoàn chỉnh nếu chưa đủ thời gian

---

## 5. Creator layer nội bộ bắt buộc phải chốt

Đây là điểm mới rất quan trọng.

Sau khi là thành viên chính thức, thành viên phù hợp có thể:

- tạo nội dung
- tạo video
- tạo tài liệu
- gửi bài viết
- cùng bán / cùng vận hành

Nhưng:

- chỉ mở trong lớp thành viên
- chỉ sau duyệt
- không dùng để bán public

### 5.1. Creator routes cần chuẩn bị

```txt
/members/creator/
/members/creator/guidelines/
/members/creator/submit/
/members/creator/revenue-share/
/members/creator/library/
```

### 5.2. Creator workflow

1. thành viên đủ điều kiện vào creator layer
2. đọc guideline
3. nộp nội dung / file / video / bài viết
4. admin review
5. approved / revision / reject
6. publish vào library hoặc chương trình phù hợp
7. ghi nhận doanh thu / chia sẻ / payout

### 5.3. Điều phải ẩn ở public layer

Không public:

- commission %
- payout terms
- creator recruitment copy
- quyền lợi kiếm tiền như hook marketing

---

## 6. Checklist triển khai theo giờ

### Block 1 - 09:00-11:00

- khóa luồng `members -> start -> journey -> practice -> deep`
- rà redirect logic trong `assets/members.js`
- khóa CTA nội bộ

### Block 2 - 11:00-13:00

- hoàn thiện landing `/members/`
- hoàn thiện `/members/start/`
- hoàn thiện 3 route day 1 / day 2 / day 7

### Block 3 - 13:00-15:00

- rà toàn bộ `members/deep/*`
- rà EN `en/members/*`
- sửa copy/heading/CTA còn lệch logic

### Block 4 - 15:00-16:30

- khóa creator layer docs/routes/spec nội bộ
- khóa admin modules + role matrix

### Block 5 - 16:30-18:00

- rà PayPal wording + post-payment behavior
- rà dashboard/member entry points
- smoke test toàn bộ members routes

### Block 6 - 18:00-19:30

- integration pass với Team 1
- xác nhận CTA public sang member/join khớp nhau
- chốt deploy candidate

---

## 7. Definition of Done cho Team 2

Chỉ được coi là xong khi đủ:

- members area có đường đi rõ sau khi user đăng ký
- `/members/` không còn là trang mơ hồ
- các route `start`, `day-1`, `day-2`, `day-7`, `practice`, `deep` dùng được
- EN members layer không vỡ logic
- `assets/members.js` không làm redirect sai
- creator layer đã được khóa trong plan nội bộ
- admin foundation đủ rõ để bắt đầu build thật ngay sau live

---

## 8. Smoke test bắt buộc

Test tối thiểu:

- `/members/`
- `/en/members/`
- `/members/dashboard/`
- `/members/start/`
- `/members/journey/day-1/`
- `/members/journey/day-2/`
- `/members/journey/day-7/`
- `/members/practice/`
- `/members/deep/`
- 3 route deep bất kỳ
- bản EN tương ứng

Phải kiểm:

- CTA sang `/join/`
- CTA nội bộ sang bước tiếp theo
- logic login/logout
- redirect sau magic link
- mobile readability

---

## 9. Điểm chốt cần nhận từ Team 1

Team 2 phải nhận:

- copy cuối cùng của pricing tiers
- public CTA wording cuối cùng
- route ưu tiên Team 1 dùng để kéo vào member layer
- wording trust ở `/join/`

Nếu chưa nhận đủ, không được hardcode copy tạm khác tinh thần brand.

---

## 10. Rủi ro cần tránh

- member flow hay nhưng rời rạc
- CTA public nói một kiểu, member landing nói kiểu khác
- creator layer bị lộ ở public layer
- admin chỉ viết trong docs mà không có ownership rõ
- EN members bị dịch máy hoặc lẫn tiếng Việt

---

## 11. Kết quả cuối Team 2 phải tạo ra

Một lớp thành viên đủ sống để:

- đỡ được conversion mà Team 1 kéo vào
- giữ user qua ngày 1
- làm rõ hành trình
- chuẩn bị nền admin và creator economy nội bộ cho giai đoạn tăng trưởng tiếp theo
