# SYNC UPDATE PLAN — 2026-04-25

Status: DRAFT FOR REVIEW
Purpose: đồng bộ lại trạng thái nâng cấp `nguyenlananh.com` sau lượt bổ sung lớn vừa thêm vào working tree (admin console, launch articles, functions backend, audit scripts) — chốt việc cần làm để đưa toàn bộ thành commit/deploy sạch.

---

## 1. Bối cảnh

Sau commit `7eff74f` (Lock i18n release foundation), working tree còn 318 file thay đổi/đợi commit gồm:

- 1 lane mới: **Admin Team 3 Action Plan** (xác minh `/admin/settings` content account flow)
- Admin console JS thật + `admin/site-config.json` + launch article collection JSON
- 10 bài viết launch mới (VI + EN) + 50+ hero SVG
- Flow PayPal trả về: `join/{success,retry,cancel}` (VI/EN)
- Backend foundation: `functions/`, `database/`
- 7 scripts QA/build mới (`audit-bilingual-site`, `build-launch-articles`, `validate-bilingual-release`, `smoke-launch-articles`, `smoke-admin-content-accounts`)
- 15+ docs mới (90-day automation, payment gateway runbook, admin operation guide, bilingual codex, content system 99 days)

Bản plan này đảm bảo các phần thêm trên không bị tách rời khỏi master plan + run lane đã khóa.

---

## 2. Đồng bộ lại lane theo Team Execution Packet 2026-04-19

Team Execution Packet vẫn là SSOT cho phân lane. Bản cập nhật này phân loại các thay đổi mới vào đúng lane.

### 2.1. Team 1 — Public + SEO

Thêm vào ownership:

- 10 bài viết launch mới ở `bai-viet/` và `en/bai-viet/`
- `admin/content/articles-launch-collection.json` (data source cho launch collection)
- `assets/content-registry.js` + `scripts/lib/content-registry.mjs`
- 50+ hero SVG ở `assets/images/articles/`
- `assets/images/articles/article-slug-image-map.json`

Việc phải làm:

1. chạy `node scripts/build-launch-articles.mjs` để xác nhận 10 bài launch khớp registry
2. chạy `node scripts/smoke-launch-articles.mjs` để đảm bảo route VI/EN lên 200
3. rà metadata + canonical + hreflang cho 10 bài mới (cả 2 locale)
4. confirm hero SVG có alt text + dimension + lazy load chuẩn theo `docs/ARTICLE_IMAGE_SEO_SYSTEM.md`

### 2.2. Team 2 — Membership + Auth + Payment + Admin

Thêm vào ownership:

- `functions/**` (Cloudflare Pages Functions)
- `database/**` (D1 schema/seed)
- `assets/admin-console.js`
- `assets/payments.js`
- `admin/site-config.json`
- `join/{success,retry,cancel}/` + `en/join/{success,retry,cancel}/`
- `NGUYENLANANH_ADMIN_TEAM3_ACTION_PLAN.md` (thực ra là content-account QA, nên gắn vào Team 2)
- `scripts/smoke-admin-content-accounts.sh`

Việc phải làm:

1. xác nhận `functions/` đã bind đúng D1 + biến môi trường PayPal trên Cloudflare Pages
2. áp `database/` schema vào D1 production (theo `docs/contracts/paypal-membership-schema-patch.sql`)
3. chạy `bash scripts/smoke-admin-content-accounts.sh` với `ADMIN_SMOKE_BASE` trỏ về preview URL — pass create/edit/delete tài khoản nội dung
4. test tay 3 trạng thái return: `join/success`, `join/retry`, `join/cancel` (VI + EN)
5. dọn rác trước khi commit: `members/index 3.html`, `members/index 4.html`, `assets/members 2.js`

### 2.3. Team 3 — I18n + QA + Release

Thêm vào ownership:

- `scripts/audit-bilingual-site.mjs`
- `scripts/validate-bilingual-release.mjs`
- `scripts/lib/bilingual-audit.mjs`
- `docs/BILINGUAL_LANGUAGE_CODEX.md`

Việc phải làm:

1. chạy `node scripts/audit-bilingual-site.mjs` để quét text Việt còn lẫn trong `/en/`
2. chạy `node scripts/validate-bilingual-release.mjs` ngay trước deploy
3. khi 2 script trên pass, chạy `node scripts/prepare_release_dist.mjs` — confirm rác `* 2.*` không vào dist
4. cập nhật `docs/I18N_EXPANSION_FOUNDATION_2026-04-19.md` để tham chiếu 2 script audit/validate mới (hiện chưa nhắc)

---

## 3. Cleanup bắt buộc trước commit

Các file rác vẫn nằm trong working tree, dễ vô tình commit:

```
NGUYENLANANH_MEMBERSHIP_SYSTEM_MASTER 2.md
docs/MEMBERSHIP_DB_SCHEMA 2.sql
docs/MEMBERSHIP_SYSTEM_MASTER 2.md
assets/members 2.js
members/index 3.html
members/index 4.html
```

Hành động: kiểm tra diff với bản gốc, nếu là duplicate macOS thì xóa hẳn trước khi `git add`.

---

## 4. Cập nhật docs/README.md (index)

Index hiện tại chưa có 4 file mới. Cần bổ sung sau mục 50:

```
51. ADMIN_OPERATION_GUIDE.md
52. BILINGUAL_LANGUAGE_CODEX.md
53. ARTICLE_VISUAL_UPGRADE_2026-04-21.md
54. ARTICLE_IMAGE_LOCAL_MAP_2026-04-21.md
55. PAYMENT_GATEWAY_LIVE_RUNBOOK.md
56. PAYMENT_LIVE_INPUT_TEMPLATE.txt
57. NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
58. NGUYENLANANH_CONTENT_SYSTEM_99_DAYS_2026-04-17.md
59. NGUYENLANANH_HOMEPAGE_BRAND_MEMBERS_MASTERPLAN_2026-04.md
60. NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md
61. NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md (đã có ở mục 8 — chỉ confirm)
62. SYNC_UPDATE_PLAN_2026-04-25.md (file này)
```

Đồng thời thêm `NGUYENLANANH_ADMIN_TEAM3_ACTION_PLAN.md` ở root vào danh mục lane Team 2.

---

## 5. Thứ tự commit khuyến nghị (tách lane, không trộn)

Theo `docs/INTEGRATION_RELEASE_CHECKLIST_TODAY.md` mục 7:

1. **Commit Team 1** — public + content
   - `bai-viet/<10 slug mới>/`
   - `en/bai-viet/<10 slug mới>/`
   - `assets/images/articles/*.svg` + `article-slug-image-map.json`
   - `assets/content-registry.js`
   - `admin/content/articles-launch-collection.json`
   - Message: `feat(team1): launch 10 new articles + bilingual hero image system`

2. **Commit Team 2** — membership + admin + payment
   - `functions/**`
   - `database/**`
   - `assets/admin-console.js`, `assets/payments.js`
   - `admin/site-config.json` + admin HTML đã sửa
   - `join/{success,retry,cancel}/` + EN
   - `NGUYENLANANH_ADMIN_TEAM3_ACTION_PLAN.md`
   - `scripts/smoke-admin-content-accounts.sh`
   - Message: `feat(team2): wire functions backend + admin console + paypal return flow`

3. **Commit Team 3** — i18n audit + release tooling
   - `scripts/audit-bilingual-site.mjs`
   - `scripts/validate-bilingual-release.mjs`
   - `scripts/lib/bilingual-audit.mjs`
   - `scripts/lib/content-registry.mjs`
   - `scripts/build-launch-articles.mjs`, `scripts/smoke-launch-articles.mjs`
   - `docs/BILINGUAL_LANGUAGE_CODEX.md`
   - Message: `feat(team3): bilingual audit + launch article smoke tooling`

4. **Commit docs** — index + plans mới
   - update `docs/README.md`
   - thêm `docs/SYNC_UPDATE_PLAN_2026-04-25.md`
   - thêm các plan mới còn lại
   - Message: `docs: index sync update plan + new operations runbooks`

---

## 6. Quality gate trước deploy

Theo trật tự bắt buộc, gate phải pass theo thứ tự:

1. ✅ working tree sạch sau 4 commit ở mục 5
2. ✅ `node scripts/audit-bilingual-site.mjs` — không còn text VI lẫn trong `/en/`
3. ✅ `node scripts/validate-bilingual-release.mjs` — pass
4. ✅ `node scripts/smoke-launch-articles.mjs` — 10 bài launch có route 200
5. ✅ `bash scripts/smoke-admin-content-accounts.sh` — admin content account CRUD pass
6. ✅ `node scripts/sync-i18n.mjs` — không tạo diff thêm
7. ✅ `node scripts/prepare_release_dist.mjs` — dist không chứa `* 2.*` `* 3.*` `* 4.*`
8. ✅ smoke matrix `INTEGRATION_RELEASE_CHECKLIST_TODAY.md` mục 6 — public + member route đều 200

Chỉ khi cả 8 gate pass mới gọi:

```bash
./scripts/publish_prod.sh
```

---

## 7. Định nghĩa hoàn tất cho đợt sync này

Coi sync xong khi:

- 4 commit ở mục 5 đã push lên `main`
- `docs/README.md` đã có toàn bộ tài liệu mới
- 8 gate ở mục 6 đều pass
- production smoke (`curl -I` cho `/`, `/en/`, `/join/`, `/en/join/`, `/bai-viet/`, `/members/`, 10 launch slug mới) đều 200
- `/admin/settings` content account CRUD pass trên production
- không còn file rác `* 2.*` trong dist

---

## 8. Việc phải làm ngay (today action)

1. dọn 6 file rác ở mục 3
2. chạy `audit-bilingual-site` + `validate-bilingual-release` + `smoke-launch-articles` để lấy báo cáo lỗi
3. fix lỗi nếu có
4. commit theo 4 lane ở mục 5
5. cập nhật `docs/README.md`
6. publish theo `docs/MANUAL_DEPLOY_RUNBOOK.md` mục 9
7. post-deploy: chạy lại smoke + 1 vòng click test tay theo `INTEGRATION_RELEASE_CHECKLIST_TODAY.md` mục 9

---

END
