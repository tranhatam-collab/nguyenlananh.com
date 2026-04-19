# Team Execution Packet - 2026-04-19

Status: ACTIVE  
Purpose: gói nhiệm vụ ngắn, rõ, để giao việc ngay cho các team sau khi web đã chuyển sang funnel membership mới.

---

## Mục tiêu chung

1. giữ public surface đúng tinh thần: vào nhẹ, không marketing, không ép mua
2. hoàn tất auth / profile / payment state machine thật
3. khóa nền mở rộng đa ngôn ngữ và release process để scale tiếp

---

## Flow đã khóa để mọi team bám theo

1. homepage chỉ mời `Đăng ký thành viên`
2. user vào `join`
3. đăng ký bằng email duy nhất
4. xác nhận qua magic link trong email
5. vào `members/start`
6. hoàn thiện profile đồng hành cơ bản
7. sau đó mới nhìn thấy bước mở khóa `2 USD qua PayPal`
8. mở khóa xong mới thấy toàn bộ quyền lợi lõi của tầng thành viên đã trả phí
9. từ trong tầng này mới tiếp cận các chuỗi chuyên sâu hơn nếu muốn đi tiếp

Rule cứng:

- không nhắc `3 USD` ở homepage
- không đặt hook giá trên public surface
- không cho payment xuất hiện trước khi profile hoàn tất
- không cho locale mới bật live khi chưa đủ content + legal + QA

---

## Team 1 - Public Experience + SEO

### Ownership

- `index.html`
- `bai-viet/**`
- `en/bai-viet/**`
- `phuong-phap/**`
- `en/phuong-phap/**`
- `chuong-trinh/**`
- `en/chuong-trinh/**`
- `assets/site.css`
- `assets/site.js`

### Nhiệm vụ

1. rà toàn bộ public copy để loại bỏ câu còn cứng, còn bán hàng, hoặc lẫn ngôn ngữ
2. khóa menu/footer/CTA thống nhất giữa VI và EN
3. rà schema/meta/canonical/OG cho homepage + article hub + 10 launch articles
4. rà internal linking giữa:
   - homepage
   - article hub
   - 10 launch articles
   - members public
5. tối ưu lại phần public CTA:
   - homepage chỉ mời đăng ký thành viên
   - article pages dẫn về đúng điểm vào
   - không để route public nào còn hook giá

### Deliverables

- 1 file audit P0/P1 public surface
- 1 pass cleanup HTML/CSS/JS public
- 1 smoke checklist VI/EN public

### Definition of done

- không còn CTA public nào nhắc giá sớm
- không còn EN page lẫn text Việt ở state live
- article hub + homepage + members public liền mạch về giọng và CTA

---

## Team 2 - Membership + Auth + Payment + Admin

### Ownership

- `join/**`
- `members/**`
- `en/join/**`
- `en/members/**`
- `assets/members.js`
- `assets/payments.js`
- `functions/**`
- `admin/**`

### Nhiệm vụ

1. thay local/session fallback bằng state thật trên backend:
   - signup
   - magic link consume
   - session lookup
   - profile persistence
2. bind D1 production và hoàn chỉnh schema
3. khóa flow:
   - free member
   - profile completed
   - pending paid unlock
   - paid member active
4. PayPal:
   - create order
   - finalize / capture
   - webhook verify
   - receipt / failure / resend
5. admin:
   - tra cứu member theo email
   - xem trạng thái profile / payment / access
   - manual override có log

### Deliverables

- backend state machine rõ
- D1 schema live
- PayPal production-ready flow
- admin member lookup tối thiểu

### Definition of done

- member state không còn phụ thuộc local-only fallback
- payment unlock có bằng chứng server-side
- admin xem được member thật, không phải mock

---

## Team 3 - I18n + QA + Release Foundation

### Ownership

- `scripts/lib/i18n-config.mjs`
- `scripts/sync-i18n.mjs`
- `scripts/prepare_release_dist.mjs`
- `scripts/deploy_cloudflare.sh`
- `assets/i18n-config.js`
- `assets/lang-routing.js`
- `_headers`
- `_redirects`
- `sitemap.xml`
- docs release / i18n

### Nhiệm vụ

1. giữ registry locale làm SSOT
2. chuẩn hóa rule:
   - live locale
   - planned locale
   - auto redirect
   - floating switch
3. build smoke matrix cho:
   - public VI
   - public EN
   - locale future readiness
   - guest member
   - auth error states
   - payment return states
4. khóa safe deploy:
   - clean release dist
   - strip draft files
   - deploy bằng allowlist
5. chuẩn bị phase mở rộng locale mới:
   - FR
   - JA
   - KO

### Deliverables

- locale expansion foundation doc
- release dist script
- smoke matrix trước deploy
- rollback note ngắn

### Definition of done

- deploy không còn phụ thuộc publish từ root bừa
- locale mới có nơi khai báo duy nhất
- QA/release có checklist đủ để team khác tự chạy

---

## Chuỗi ưu tiên nên chạy

1. Team 2 khóa state thật cho membership + payment
2. Team 1 làm sạch toàn bộ public surface theo flow mới
3. Team 3 khóa i18n/release/smoke để không vỡ khi mở rộng

---

## Lệnh bàn giao ngắn cho từng team

### Gửi Team 1

“Rà toàn bộ public surface VI/EN, bỏ mọi CTA giá sớm, khóa giọng và metadata, rồi nộp lại public smoke checklist.”

### Gửi Team 2

“Chuyển membership flow từ local fallback sang backend state thật, bind D1, hoàn tất PayPal unlock và admin lookup.”

### Gửi Team 3

“Giữ locale registry làm SSOT, khóa release dist sạch, hoàn tất smoke matrix và chuẩn bị nền mở thêm locale mới.”
