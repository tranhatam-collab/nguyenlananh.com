# ADMIN_OPERATION_GUIDE.md

Version: 1.0  
Ap dung tu ngay: 2026-04-10  
Trang thai: Active runbook

---

## 1. Muc tieu tai lieu

Tai lieu nay la huong dan van hanh cho Admin trong phase hien tai:

- membership da live
- creator layer noi bo da co route
- admin route dang o muc skeleton an toan
- PayPal-first flow dang duoc su dung

Muc tieu la giup admin:

- kiem soat duoc luong member sau dang ky
- xu ly duoc review content va creator submission
- phat hien loi nhanh va phoi hop release on dinh

---

## 2. Pham vi admin hien tai

### 2.1. Admin routes

- `/admin/`
- `/admin/dashboard/`
- `/admin/content/`
- `/admin/members/`
- `/admin/creators/`
- `/admin/settings/`

Ban EN:

- `/en/admin/`
- `/en/admin/dashboard/`
- `/en/admin/content/`
- `/en/admin/members/`
- `/en/admin/creators/`
- `/en/admin/settings/`

Luu y:

- cac route tren hien la placeholder noindex
- chua co backend auth/RBAC that
- dung de chot quy trinh va ownership truoc khi build admin backend

### 2.2. Membership routes can theo doi

- `/members/`, `/en/members/`
- `/members/dashboard/`, `/en/members/dashboard/`
- `/members/start/`, `/en/members/start/`
- `/members/journey/day-1/`, `/day-2/`, `/day-7/` va ban EN
- `/members/practice/`, `/en/members/practice/`
- `/members/deep/`, `/en/members/deep/`
- `/members/creator/*`, `/en/members/creator/*`

---

## 3. Checklist dau ngay (10-15 phut)

1. Kiem tra nhanh cac route trong nhom public va members (HTTP 200).
2. Kiem tra route admin placeholder con hoat dong (HTTP 200).
3. Xac nhan khong co 404 o:
   - `/members/start/`
   - `/members/journey/day-1/`
   - `/en/members/start/`
4. Kiem tra copy EN khong bi lan tieng Viet o nhom members/admin EN.
5. Ghi snapshot ngan: `OK/Issue` vao kenh van hanh.

---

## 4. Quy trinh content admin

Trang thai content chuan:

- `draft`
- `in_review`
- `approved`
- `published`
- `archived`

Quy trinh:

1. Nhan bai moi hoac yeu cau cap nhat.
2. Gan owner va route muc tieu.
3. Review chat luong + dung tinh than brand.
4. Approve/Request revision.
5. Publish va ghi change log.
6. Smoke test CTA + language + route sau publish.

Khong duoc bo qua:

- owner ro rang
- version ro rang
- ly do thay doi ro rang

---

## 5. Quy trinh member ops

Moc activation can theo doi:

1. Join page vao flow thanh toan
2. Nhan magic link
3. Vao dashboard thanh cong
4. Cham Day 1
5. Cham Day 7

Khi co su co:

- Neu user bao khong vao duoc members route:
  - kiem tra redirect co ve `join` dung khong
  - kiem tra trang thai magic link
  - huong dan user tao lai link moi neu link het han

- Neu user bao sai ngon ngu EN:
  - ghi lai route cu the
  - mo issue copy-fix theo lane Team 2

---

## 6. Quy trinh creator ops (noi bo)

Route:

- `/members/creator/` va cac sub-routes
- `/en/members/creator/` va cac sub-routes

Workflow:

1. Creator doc guideline
2. Creator submit noi dung
3. Admin triage
4. Reviewer quyet dinh:
   - `approved`
   - `revision_requested`
   - `rejected`
5. Noi dung duoc dua vao library neu dat chuan
6. Ghi nhan van hanh doanh thu theo policy noi bo

Rule bat buoc:

- khong public commission %
- khong public payout terms
- khong public recruitment copy creator ra homepage/join

---

## 7. PayPal-first van hanh

Trong phase hien tai:

- checkout flow chinh la PayPal
- post-payment can ro next-step:
  - magic link
  - vao dashboard/start

Admin can dam bao:

1. wording khong gay hieu nham (khong noi da active neu chua qua flow)
2. khong mo Stripe scope trong phase nay
3. tai lieu van hanh tiep tuc bam PayPal-first

---

## 8. Xu ly su co nhanh

### 8.1. 404 route

1. Ghi route bi loi
2. Xac nhan co file route trong source
3. Kiem tra commit/deploy gan nhat
4. Redeploy snapshot commit neu can

### 8.2. CTA di sai dich

1. Xac nhan CTA o route nao
2. Chot dich den dung theo master flow
3. Patch nhanh + smoke test lai

### 8.3. EN route lan tieng Viet

1. Chup route va doan copy loi
2. Tao copy-fix patch theo lane Team 2
3. Retest route EN lien quan

---

## 9. Quy tac release cho admin

1. Khong tron lane public va lane members trong 1 commit neu khong co blocker.
2. Commit message theo lane:
   - `feat(team2): ...`
   - `fix(integration): ...`
3. Deploy tu snapshot commit da duyet.
4. Sau deploy bat buoc chay smoke test lai.
5. Bao cao ngan sau release:
   - commit
   - deploy url
   - route matrix pass/fail

---

## 10. Bao cao cuoi ngay (mau ngan)

- Public smoke: PASS/FAIL
- Members smoke: PASS/FAIL
- Admin placeholder routes: PASS/FAIL
- Creator flow placeholders: PASS/FAIL
- Issues mo:
  - issue 1
  - issue 2
- Ke hoach ngay mai:
  - item 1
  - item 2

---

## 11. Tai lieu lien quan

- `docs/MEMBERSHIP_ADMIN_CREATOR_FOUNDATION_LIVE_TODAY.md`
- `docs/MEMBERSHIP_SYSTEM_MASTER.md`
- `docs/INTEGRATION_RELEASE_CHECKLIST_TODAY.md`
- `docs/TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md`
