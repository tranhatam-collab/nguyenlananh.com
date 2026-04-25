# Logic Audit Full Site - 2026-04-14

## Muc tieu

Kiem tra logic van hanh toan bo `nguyenlananh.com` theo 4 lop:

1. Public surface
2. Membership access
3. Payment + magic link
4. i18n + release readiness

Audit nay tap trung vao logic, blast radius va kha nang live an toan, khong di sau vao design polish.

## Ket luan dieu hanh

Website da co khung public, membership, payment backend va admin placeholder, nhung hien chua dat muc "members-only" va chua dat muc "payment-safe" cho production.

Co 3 blocker P0:

1. Membership content dang duoc phat ra duoi dang HTML tinh truoc khi auth xay ra.
2. Client-side fallback van co the tu cap magic link va session khi backend loi hoac khi user bam "Toi da thanh toan".
3. Luong fulfill co the bi chay 2 lan khi `finalize` va webhook ve gan nhau, dan den nguy co gia han membership nhieu hon 1 lan.

Neu muon live membership that su cho tra phi va noi dung sau paywall, can xu ly xong 3 diem nay truoc.

## Pham vi da kiem tra

- Public routes: `index.html`, `join/`, `members/`, `en/`
- Frontend runtime: `assets/site.js`, `assets/lang-routing.js`, `assets/members.js`, `assets/payments.js`
- Backend runtime: `functions/_lib/payments.js`, `functions/_lib/db.js`, `functions/_lib/email.js`
- Payment schema: `database/payment_gateway_d1.sql`
- Membership and admin route samples

## Phat hien chi tiet

### P0-1. Membership content hien dang public ve mat giao hang

**Bang chung**

- `members/deep/am-thanh-tu-than/index.html:1-195` chua full noi dung chuyen de trong HTML tinh.
- `members/dashboard/index.html:1-42` chua full dashboard shell trong HTML tinh.
- `assets/members.js:530-559` chi redirect o client sau khi page da duoc tai.

**Tac dong**

- Bat ky ai biet URL deu co the lay noi dung bang browser co tat JS, `curl`, view-source, bot khong chay JS, hoac cache trung gian.
- `noindex` khong phai la co che bao ve truy cap.
- Toan bo lop `members/*` hien tai la "hidden by client redirect", khong phai "protected content".

**Danh gia**

Day la blocker cao nhat vi no lam sai dinh nghia membership tra phi.

### P0-2. Client fallback hien van cho phep bypass auth/payment

**Bang chung**

- `join/index.html:152-168` hien thi fallback "Mở PayPal" + "Tôi đã thanh toán".
- `assets/members.js:418-435` tao local magic link khi bam `confirmPaid`.
- `assets/members.js:490-508` neu API consume magic link loi ngoai 4 ma loi cu the, code se fallback sang `consumeMagicEntry(...)` trong localStorage.
- `assets/members.js:531-539` chap nhan session tu localStorage, khong co server verification.

**Tac dong**

- User co the vao he neu backend consume bi loi tam thoi, DB mat binding, network loi, hoac function rollout gap su co.
- Manual fallback hien tai dua vao self-attestation "Toi da thanh toan", khong can bang chung giao dich.
- Session local co the bi tao hoac sua truc tiep o browser.

**Danh gia**

Stop-ship cho membership co thanh toan that. Neu can giu fallback thu cong trong giai doan transition, fallback phai chay qua admin verification o server, khong duoc tao token tren client.

### P0-3. Race giua `finalize` va webhook co the fulfill 2 lan

**Bang chung**

- `functions/_lib/payments.js:526-600` xu ly `fulfillOrder(...)` dua tren snapshot `order.fulfillment_status`.
- `functions/_lib/payments.js:812-820` goi `fulfillOrder` tu `finalizeCheckoutResponse`.
- `functions/_lib/payments.js:1008-1016` va `1093-1100` goi `fulfillOrder` tu PayPal/Stripe webhook.
- `functions/_lib/email.js:132-179` co dedupe email, nhung dedupe nay khong khoa viec gia han membership.

**Tac dong**

- Neu return page va webhook cung xac nhan gan nhau, cung co the di vao nhanh fulfill truoc khi order duoc nhin thay la `fulfilled`.
- User dang co goi con han co the bi cong them 1 nam 2 lan neu race xay ra dung luc.
- Magic link moi co the duoc phat nhieu lan cho cung 1 order.

**Danh gia**

Can co co che khoa fulfill o DB: conditional update, transaction semantics, hoac state machine "capturing -> fulfilled" chi cho phep 1 writer.

### P1-1. i18n routing hien dang doi path co hoc, khong biet trang dich da san sang hay chua

**Bang chung**

- `assets/lang-routing.js:25-45` doi sang EN/VI bang cach them/bo `/en`.
- `assets/lang-routing.js:76-132` luon inject them mot floating language switch, ke ca khi page da co control ngon ngu rieng.
- Mot so trang EN van con copy tieng Viet trong title/meta/body, vi du:
  - `en/dieu-khoan/index.html`
  - `en/chinh-sach-bao-mat/index.html`
  - `en/mien-tru-trach-nhiem/index.html`
  - mot so title EN van giu "Du an", "Mon hoc", "Vu Tru Vat Chat"...

**Tac dong**

- UX song ngu khong dong nhat.
- SEO quoc te de bi pha loang vi `hreflang` tro ve EN nhung noi dung thuc te chua duoc localize day du.
- Hai bo switch ngon ngu co the xuat hien cung luc.

### P1-2. Repo dang co file du thua/ban sao, tang rui ro deploy nham

**Bang chung**

- `assets/members 2.js`
- `members/index 3.html`
- `members/index 4.html`
- thu muc long `nguyenlananh.com/...` nam ben trong root

**Tac dong**

- Team de sua nham file.
- Handoff va grep ket qua bi nhieu.
- Release diff kho doc, kho freeze lane.

### P1-3. Admin layer la placeholder public, chua co auth va role gate

**Bang chung**

- `admin/index.html:16-37`
- `admin/dashboard/index.html:11-14`
- `admin/members/index.html:4`

**Tac dong**

- Hien chua co du lieu nhay cam, nhung route admin da mo cong khai.
- Neu phase sau do them logic that ma quen doi delivery model, se lap lai van de cua membership.

## Khuyen nghi kien truc

### Quyet dinh 1

Khong giao full HTML protected content tu static route nua.

Huong uu tien:

1. Dua protected content qua Pages Function/Worker gate sau khi xac thuc.
2. Hoac giu static shell, nhung tai payload noi dung tu API sau auth server-side.

### Quyet dinh 2

Loai bo hoan toan local magic link/session fallback khoi production path.

Cho phep duy nhat:

- magic link server issue
- session duoc ky hoac cookie HttpOnly
- resend va admin approve deu di qua backend

### Quyet dinh 3

Dat state machine thanh toan ro rang:

- `created`
- `awaiting_capture`
- `captured_pending_fulfillment`
- `fulfilled`
- `denied`
- `refunded`

Va chi 1 writer duoc chuyen `captured_pending_fulfillment -> fulfilled`.

## Thu tu xu ly de nghi

1. Dong bang release membership moi.
2. Go local fallback issue token/session.
3. Doi delivery model cho `members/deep`, `members/pro`, `members/creator`, `admin`.
4. Khoa fulfill bang DB-first state transition.
5. Sau do moi cleanup i18n, legal copy EN, duplicate files, QA release.

## Smoke test bat buoc sau khi sua

1. Guest truy cap truc tiep `/members/deep/...` khong nhan noi dung protected.
2. Guest tu tao `localStorage.nla_member_session` khong vao duoc protected payload.
3. Payment PayPal/Stripe hoan tat 1 lan -> membership chi gia han 1 lan.
4. Webhook retry khong tao them expiry.
5. Magic link dung 1 lan, het han dung logic, resend hoat dong.
6. EN/VI switch khong tao duplicate control, khong dan sang page chua san sang.

## Tinh trang hien tai

- Cu phap JS da qua `node --check` cho cac file chinh.
- Van de nam o logic van hanh va mo hinh delivery, khong phai syntax.
