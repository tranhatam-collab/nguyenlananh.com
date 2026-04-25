# Team 2 Membership Delivery Access Plan - 2026-04-14

## Muc tieu

Bien membership tu "HTML public + JS redirect" thanh "content gate that su".

## File ownership

- `members/**`
- `en/members/**`
- `assets/members.js`
- cac asset lien quan den members UX

## Van de can xu ly

1. Protected copy hien nam truc tiep trong file HTML public.
2. `assets/members.js` dang vua lam UI progress, vua lam auth gate, vua chua fallback cu.
3. Deep/pro/creator dang cung delivery model, nhung do nhay cam khac nhau.

## Huong kien truc de nghi

### Option uu tien

Static shell + protected payload fetch sau auth.

Dieu nay giu duoc loi the static cho public layout, nhung khong phat ra full noi dung protected trong response dau tien.

### Option chap nhan duoc

Render protected route qua Functions/Worker sau khi session hop le.

## Cong viec chi tiet

### Block A - Content inventory

1. Liet ke tat ca route:
   - `members/journey/*`
   - `members/practice/`
   - `members/deep/*`
   - `members/pro/*`
   - `members/creator/*`
2. Danh dau route nao:
   - shell only
   - protected narrative
   - operational/internal

### Block B - Split content va shell

1. Tach public shell ra khoi protected article body.
2. Dua protected body vao data payload, CMS, hoac server-rendered template.
3. Day du version EN/VI cua protected payload.

**Acceptance**

- `curl /members/deep/am-thanh-tu-than/` khong thay module body protected nua

### Block C - JS simplification

1. Tach `assets/members.js` thanh:
   - session/bootstrap
   - progress tracking
   - page-specific enhancers
2. Go bo local fallback cu.
3. Chi giu localStorage cho progress/thoi quen, khong cho auth.

### Block D - Route sensitivity model

1. `members/public landing` co the public
2. `dashboard/journey/practice` chi shell sau auth
3. `deep/pro/creator` protected
4. `admin` tach rieng, khong di chung lane members neu co auth rieng

## Cleanup repo can lam cung luc

1. Xoa hoac co lap file clone:
   - `assets/members 2.js`
   - `members/index 3.html`
   - `members/index 4.html`
2. Xac minh thu muc `nguyenlananh.com/` long ben trong root co con duoc dung hay khong.
3. Chot 1 source of truth cho members routes.

## Verification

1. Guest mo protected URL -> thay shell hoac bi redirect truoc khi noi dung protected duoc tra ve
2. Member hop le -> thay dung noi dung
3. Member het han -> khong thay protected payload
4. EN members va VI members dong bo route va behavior

## Definition of done

1. Protected content khong con nam trong HTML public
2. Auth khong dua vao localStorage
3. `assets/members.js` don gian hon va co ownership ro
4. Repo khong con file members clone gay nham
