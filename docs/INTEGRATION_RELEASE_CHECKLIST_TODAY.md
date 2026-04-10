# INTEGRATION_RELEASE_CHECKLIST_TODAY.md

Version: 1.0
Status: TODAY RELEASE CHECKLIST
Scope: phối hợp Team 1 + Team 2, nhập lane an toàn, deploy production không đạp nhau
Date: 2026-04-10

---

## 1. Mục tiêu

Checklist này là nhịp điều phối cuối để:

- nhập lại thay đổi của Team 1 và Team 2 đúng thứ tự
- tránh conflict ở vùng file giao nhau
- khóa quality gate trước khi bấm deploy
- deploy từ snapshot commit đã chốt, không kéo nhầm file chưa duyệt

---

## 2. Vai trò release trong hôm nay

- `Release Lead`: 1 người chịu trách nhiệm nhập lane, smoke test, deploy, xác nhận live
- `Team 1`: public conversion layer
- `Team 2`: membership + admin foundation layer

Nguyên tắc:

- chỉ `Release Lead` được bấm deploy production
- chỉ deploy khi đã qua đủ gate phần 5 và phần 6

---

## 3. Freeze window và nhịp nhập lane

### 3.1. Freeze trước integration

- Team 1 dừng chỉnh file lúc `T0`
- Team 2 dừng chỉnh file lúc `T0 + 15m`
- Sau mốc này chỉ được sửa nếu có issue blocker

### 3.2. Thứ tự nhập lane bắt buộc

1. nhập `Team 1` trước
2. smoke test lớp public
3. nhập `Team 2`
4. smoke test lớp member
5. integration smoke test end-to-end
6. deploy production

---

## 4. File ownership và vùng cấm đạp nhau

### 4.1. Team 1 ownership

```txt
/index.html
/en/index.html
/join/index.html
/en/join/index.html
/bai-viet/**
/en/bai-viet/**
/assets/site.css
/assets/site.js
/assets/lang-routing.js
```

### 4.2. Team 2 ownership

```txt
/members/**
/en/members/**
/assets/members.js
/docs/contracts/**
/docs/MEMBERSHIP*
```

### 4.3. Nếu có file giao nhau

- không tự merge tay ngay
- Release Lead gọi sync 10 phút với 2 team
- chốt bản cuối theo rule:
  - public UI ưu tiên Team 1
  - member flow ưu tiên Team 2
  - CTA wording thống nhất theo master plan

---

## 5. Gate trước commit lane

## 5.1. Gate Team 1

- homepage có hero + proof + timeline + membership block
- `/join/` rõ pricing, rõ benefit, giữ PayPal-first
- CTA thống nhất:
  - `Bắt đầu từ 3 USD`
  - `Bạn có thể đọc tiếp hoặc bắt đầu hành trình thật`
- EN public không còn UI tiếng Việt ở:
  - `/en/`
  - `/en/join/`
  - `/en/bai-viet/`

## 5.2. Gate Team 2

- `/members/` dẫn đúng vào start/journey
- route `start/day-1/day-2/day-7/practice/deep` chạy
- `assets/members.js` không redirect cụt
- creator layer ở lớp nội bộ, không lộ public
- admin foundation đã chốt module + role

---

## 6. Smoke test matrix bắt buộc

### 6.1. Public smoke

```bash
curl -I https://www.nguyenlananh.com/
curl -I https://www.nguyenlananh.com/en/
curl -I https://www.nguyenlananh.com/join/
curl -I https://www.nguyenlananh.com/en/join/
curl -I https://www.nguyenlananh.com/bai-viet/
curl -I https://www.nguyenlananh.com/en/bai-viet/
```

### 6.2. Member smoke

```bash
curl -I https://www.nguyenlananh.com/members/
curl -I https://www.nguyenlananh.com/en/members/
curl -I https://www.nguyenlananh.com/members/start/
curl -I https://www.nguyenlananh.com/members/journey/day-1/
curl -I https://www.nguyenlananh.com/members/practice/
curl -I https://www.nguyenlananh.com/members/deep/
```

### 6.3. Pass condition

- HTTP `200` với các route public/members yêu cầu
- không có `404` ở CTA mới
- không có link language sai (`/en/` về nhầm VI)

---

## 7. Quy trình commit lane riêng

### 7.1. Commit Team 1 riêng

- chỉ stage file Team 1
- commit message rõ:
  - `feat(team1): public conversion pass for today release`

### 7.2. Commit Team 2 riêng

- chỉ stage file Team 2
- commit message rõ:
  - `feat(team2): membership and admin foundation pass for today release`

### 7.3. Cấm commit trộn lane

- không tạo commit vừa public vừa members nếu chưa có reason rõ
- nếu phải hotfix giao nhau, commit riêng:
  - `fix(integration): cross-lane sync for release blocker`

---

## 8. Deploy an toàn từ snapshot commit

Vì repo có thể còn file lane chưa chốt trong working tree, deploy production phải đi từ snapshot commit đã duyệt.

### 8.1. Tạo snapshot build

```bash
rm -rf /tmp/nla-release-dist
mkdir -p /tmp/nla-release-dist
git archive --format=tar HEAD | tar -xf - -C /tmp/nla-release-dist
```

### 8.2. Deploy snapshot

```bash
wrangler pages deploy /tmp/nla-release-dist --project-name nguyenlananh-com --branch main
```

Ghi chú:

- giữ `PayPal-first` như plan hiện tại
- không bật flow Stripe trong release hôm nay

---

## 9. Post-deploy verification

Sau deploy, chạy lại smoke test phần 6.

Thêm 1 vòng click test tay:

- homepage CTA hero -> `/join/`
- article CTA -> `/join/`
- `/members/` -> `/members/start/`
- EN homepage CTA -> `/en/join/`

Nếu lỗi:

- rollback bằng deploy lại commit trước đó
- ghi incident note ngắn trong thread release

---

## 10. Handoff Team 2 sau Team 1

Team 1 phải bàn giao cho Team 2 trước khi merge lane cuối:

- wording cuối của pricing tier trên `/join/`
- CTA cuối đã chốt
- danh sách route public đã đổi
- danh sách file Team 1 đã commit

Team 2 chỉ bắt đầu final integration sau khi nhận đủ 4 mục trên.

---

## 11. Definition of done cho release hôm nay

Release chỉ được coi là xong khi đủ:

- Team 1 commit riêng đã push
- Team 2 commit riêng đã push
- integration smoke test pass
- deploy production thành công
- smoke test production pass
- đã có báo cáo handoff ngắn cho 2 team
