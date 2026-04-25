# Team Masterplan Logic Rebuild - 2026-04-14

## Muc tieu chung

Chuyen site tu trang thai "static site co membership layer mo phong" sang trang thai "membership co gate that, payment an toan, release co quy trinh".

## Nguyen tac dieu phoi

1. Khong sua song song cung 1 file runtime neu khong co owner ro.
2. Team nao cham vao payment/auth phai review theo event-flow, khong fix tung diem don le.
3. Membership gate phai duoc xong truoc khi mo them noi dung deep/pro/creator.
4. i18n va legal polish chi chay sau khi delivery model da on.

## Phan lane

### Team 1 - Security, auth, payment runtime

Phu trach:

- `functions/_lib/payments.js`
- `functions/_lib/db.js`
- `functions/_lib/utils.js`
- `functions/_lib/email.js`
- `functions/api/**`
- `database/payment_gateway_d1.sql`

Output:

- Payment state machine on dinh
- Fulfill chi chay 1 lan
- Magic link/session khong con fallback client
- Health endpoint + log points du de debug

### Team 2 - Membership delivery va protected content

Phu trach:

- `members/**`
- `en/members/**`
- `assets/members.js`

Output:

- Protected content khong con nam full trong HTML public
- Shell membership moi phu hop model gate moi
- Creator/pro/deep/admin duoc tach muc do nhay cam ro rang

### Team 3 - Public surface, i18n, QA release

Phu trach:

- `index.html`
- `en/**`
- `assets/lang-routing.js`
- `join/**`
- `en/join/**`
- `_redirects`
- `_headers`
- `robots.txt`
- `sitemap.xml`

Output:

- EN/VI logic sach
- legal/SEO EN khong con copy tieng Viet
- smoke checklist release
- regression matrix cho payment/member/public

## Chu ky thuc hien

### Phase 0 - Containment (ngay lap tuc)

1. Freeze deploy membership/deep/pro/creator.
2. Danh dau 3 blocker P0 trong daily war-room.
3. Chon owner cho state machine payment va owner cho content gating.

### Phase 1 - Runtime hardening

1. Team 1 khoa fulfill va bo local fallback.
2. Team 2 dua protected content ra khoi static public HTML.
3. Team 3 tam tat auto-redirect neu counterpart chua dat ready.

### Phase 2 - Route cleanup va content hygiene

1. Cleanup duplicate file.
2. Chuan hoa EN legal/meta/body.
3. Khoa lai `hreflang`, canonical, and release maps.

### Phase 3 - Release gate

1. Chay smoke matrix end-to-end.
2. Chay regression guest/member/admin.
3. Chot rollback path.

## Definition of done theo toan project

1. Guest truy cap truc tiep protected URL khong thay noi dung protected.
2. Membership khong the duoc mo bang localStorage/session gia.
3. 1 giao dich thanh cong chi tao 1 lan fulfill.
4. Webhook replay idempotent.
5. Magic link issue, resend, expire, consume dung nhu spec.
6. EN/VI switch ra dung counterpart san sang.
7. Repo khong con file clone/giai doan trung lap gay nham owner.

## Release gate bat buoc

1. PayPal success
2. Stripe success
3. PayPal denied/cancel
4. Stripe expired/async failed
5. Webhook replay
6. Guest to members deep
7. Guest to admin
8. Member with expired session
9. EN join -> EN success -> EN dashboard

## Tai lieu phai doc kem

1. `LOGIC_AUDIT_FULL_SITE_2026-04-14.md`
2. `TEAM_1_SECURITY_AUTH_PAYMENT_PLAN_2026-04-14.md`
3. `TEAM_2_MEMBERSHIP_DELIVERY_ACCESS_PLAN_2026-04-14.md`
4. `TEAM_3_I18N_QA_RELEASE_PLAN_2026-04-14.md`
