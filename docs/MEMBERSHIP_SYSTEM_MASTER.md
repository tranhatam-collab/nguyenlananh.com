# NGUYENLANANH Membership System

Version: 1.0
Status: Day-1 build complete (MVP)

## 1. Positioning Lock

- Not a paywall
- Not a course store
- Not a paid blog
- This is a paid transformation journey system

Model:

- Content -> Awareness
- Membership -> Access
- Journey -> Transformation
- Community -> Retention
- Upgrade -> Revenue

## 2. Implemented Routes

Public:

- `/join/`

Locked layer:

- `/members/`
- `/members/dashboard/`
- `/members/journey/`
- `/members/practice/`
- `/members/deep/`
- `/members/experience/`

Premium layer (Phase 2 structure):

- `/members/pro/`
- `/members/pro/reset/`
- `/members/pro/inner/`
- `/members/pro/discipline/`
- `/members/pro/environment/`
- `/members/pro/creation/`
- `/members/pro/wealth/`

## 3. Day-1 Features (Implemented)

- Join page with 3 pricing levels (3, 60, 99 USD)
- PayPal link generator (simple mode)
- Magic link system (client-side MVP)
  - one-time token
  - 15-minute expiration
- Session-based lock for `/members/*`
- Members dashboard and progress tracking
- Journey stage completion (3 phases)
- Daily practice checklist persistence
- Experience journal (local persistence)

## 4. Tech Notes

Current MVP uses local storage for speed-to-launch. This is good for rapid validation, not final security.

Storage keys:

- `nla_member_session`
- `nla_member_progress`
- `nla_member_magic_pending`

Core script:

- `/assets/members.js`

## 5. Required Upgrade for Production-grade Backend

- Move magic token issuance/validation to server
- Add real user table + payment webhook processing
- Replace manual "I paid" button with payment verification
- Add signed session cookie / JWT with server validation
- Add email sender (welcome, day 1, day 3)

## 6. Conversion Copy Lock (Applied)

- "Mở khóa toàn bộ hành trình"
- "Bắt đầu từ 3 USD"
- "Không đọc thêm. Bắt đầu."

## 7. SEO / Indexing Policy

- `/join/` indexable
- `/members/*` set to `noindex,follow`
- locked routes not included in sitemap

## 8. Next Build Blocks

1. Server webhook + database write on successful PayPal payment
2. True magic-email delivery (no manual copy)
3. Retention emails (welcome / day 1 / day 3 / weekly)
4. Upgrade triggers tied to behavior events

## 9. Deep Topic Tracks (next content layer)

Membership không chỉ là quyền truy cập. Về nội dung, hệ này sẽ mở dần các chuyên đề sâu trong `members/deep`.

Lộ trình khóa hiện tại:

- `Bản đồ vòng lặp và điểm nghẽn sâu`
  - route: `/members/deep/ban-do-vong-lap/`
  - vai trò: chuyên đề gốc để gọi tên trigger, phản ứng, cách tự bảo vệ và cái giá đang trả
- `Âm thanh tự thân và tiếng nói bên trong`
  - route: `/members/deep/am-thanh-tu-than/`
  - public teaser trên homepage + 1 bài public ngắn đã có
  - mở rộng theo 3 nhánh: `ca-nhan`, `gia-dinh`, `tre-em`
- `Gia đình và những điều đang truyền qua nhau`
  - route: `/members/deep/gia-dinh-va-goc-re/`
  - vai trò: nhìn lại hệ gia đình như môi trường đầu tiên của niềm tin, phản xạ và vai trò sống
- `Đồng hành cùng trẻ em mà không làm gãy tự nhiên`
  - route: `/members/deep/tre-em-va-khong-gian-lon-len/`
  - vai trò: mở hướng cá nhân -> gia đình -> trẻ em bằng môi trường sống, vật thể, nhịp sống và hành động thật

Thứ tự đi vào bắt buộc:

1. `Bản đồ vòng lặp và điểm nghẽn sâu`
2. `Âm thanh tự thân và tiếng nói bên trong`
3. `Gia đình và những điều đang truyền qua nhau`
4. `Đồng hành cùng trẻ em mà không làm gãy tự nhiên`

Nguyên tắc khóa:

- không biến members area thành thư viện bài đọc rời rạc
- mỗi chuyên đề phải có: intro, modules, practice, caution note, CTA quay về dashboard
- các chuyên đề liên quan thân tâm phải có disclaimer rõ: không thay thế chăm sóc y tế hay trị liệu chuyên môn
- lớp `members/deep/` phải thể hiện đây là một roadmap 90 ngày, không phải danh sách bài đọc ngẫu nhiên
