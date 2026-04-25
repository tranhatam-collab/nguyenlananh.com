# Team 3 i18n QA Release Plan - 2026-04-14

## Muc tieu

Chot lai trai nghiem song ngu, legal/SEO EN, va release gate de sau khi Team 1 + Team 2 sua xong co the launch an toan.

## File ownership

- `index.html`
- `en/**`
- `join/**`
- `en/join/**`
- `assets/lang-routing.js`
- `_redirects`
- `_headers`
- `robots.txt`
- `sitemap.xml`

## Cong viec bat buoc

### Block A - i18n readiness audit

1. Quet toan bo `en/**` de tach 3 nhom:
   - da dich xong
   - da co route nhung copy con lai tieng Viet
   - chua nen live EN
2. Uu tien xu ly:
   - `en/dieu-khoan/index.html`
   - `en/chinh-sach-bao-mat/index.html`
   - `en/mien-tru-trach-nhiem/index.html`
   - join/payment/member legal states

### Block B - Language switch logic

1. `assets/lang-routing.js` khong duoc auto inject floating switch neu page da co switch rieng.
2. Khong auto redirect sang counterpart neu counterpart chua dat `ready`.
3. Chot 1 rule:
   - public homepage co the auto-redirect 1 lan
   - legal/payment/member pages uu tien explicit user choice

### Block C - SEO and metadata hygiene

1. Canonical/hreflang phai tro toi trang da san sang.
2. Title/meta EN khong de lai tieng Viet.
3. `x-default` phai ro rang va nhat quan.
4. Xac minh sitemap khong dua route placeholder vao index neu chua san sang.

### Block D - QA release matrix

1. Public smoke:
   - homepage
   - article hub
   - join
   - legal
2. Payment smoke:
   - success
   - cancel
   - retry
3. Membership smoke:
   - guest
   - active member
   - expired member
4. EN/VI smoke:
   - direct EN URL
   - switch EN -> VI
   - switch VI -> EN

## Regression checklist

1. Khong duplicate language switch
2. Khong trang EN nao hien footer/button/subtitle tieng Viet o state live
3. Khong trang return nao mac ket voi status mo ho
4. Khong route placeholder nao lo ra trong internal links chinh

## Definition of done

1. Song ngu nhat quan
2. Metadata EN sach
3. Release checklist chay duoc thanh tung buoc
4. Team co file smoke matrix va rollback note ro rang
