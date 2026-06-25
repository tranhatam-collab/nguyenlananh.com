# CANONICAL PRODUCT MAP — 1:1 (Bài viết ↔ Landing bán ↔ plan_code ↔ Lesson)

> Nguồn duy nhất chống mâu thuẫn 4 lớp. Ngày 2026-06-26 · HEAD `29ba372`.
> **Quy tắc:** mỗi sản phẩm dùng **1 canonical slug** xuyên suốt 4 lớp. Landing slug + plan_code là gốc (gắn giá). Lesson gộp về **`/members/deep/<canonical-slug>/`** (bỏ `/members/academy/` — Contract §E.2). CTA bài → **landing bán** (không trỏ gated).
> **Cập nhật 2026-06-26:** Thêm 13 plan code còn thiếu (membership, micro, pilot) — Bảng A giờ phủ 100% PLANS (26/26).

## A. BẢNG MAP CANONICAL — 26 plan codes (10 sản phẩm chính + 3 tier + 5 membership + 5 micro + 3 pilot)

### A.1 Sản phẩm chính (10 + 3 tier)

| # | Canonical slug | plan_code | Giá (₫) | Landing bán (route) | Bài viết gateway | Lesson | Khớp |
|---|---|---|---|---|---|---|---|
| 1 | `rhythm-design-lab` | `prog_rhythm_lab` | 2.500.000 | /programs/rhythm-design-lab/ | thiet-ke-nhip-song-ben-vung | rhythm-design-lab | ✅ |
| 2 | `space-reset-practitioner` | `prog_space_reset` | 12.700.000 | /programs/space-reset-practitioner/ | khong-gian-song-va-nang-luc-hanh-dong | space-reset-practitioner | ✅ |
| 3 | `family-pattern-mapping` | `prog_family_pattern` | 10.000.000 | /programs/family-pattern-mapping/ | he-gia-dinh-va-quyen-lua-chon | family-pattern-mapping | ✅ |
| 4 | `creative-practice-studio` | `prog_creative_studio` | 10.000.000 | /programs/creative-practice-studio/ | he-van-hanh-lao-dong-sang-tao | creative-practice-studio | ✅ |
| 5 | `personal-capital` | `diag_capital_self` | 1.250.000 | /assessments/personal-capital/ | kinh-te-noi-tai-va-nguon-luc-ca-nhan | personal-capital | ✅ |
| 5b | `personal-capital` | `diag_capital_expert` | 15.000.000 | /assessments/personal-capital/expert/ | kinh-te-noi-tai-va-nguon-luc-ca-nhan | personal-capital | ✅ tier |
| 5c | `personal-capital` | `diag_capital_biz` | 30.000.000 | /assessments/personal-capital/business/ | kinh-te-noi-tai-va-nguon-luc-ca-nhan | personal-capital | ✅ tier |
| 6 | `practice-companion-level-1` | `cert_companion_l1` | 30.000.000 | /certification/practice-companion-level-1/ | cong-dong-dong-hanh-va-truong-thanh | practice-companion-level-1 | ✅ |
| 7 | `practice-method-designer` | `cert_method_designer` | 76.000.000 | /certification/practice-method-designer/ | du-an-doi-song-37-ngay | practice-method-designer | ✅ |
| 8 | `avoidance-map` | `asmt_avoidance_self` | 490.000 | /assessments/avoidance-map/ | ban-do-ne-tranh | decision-clarity | ✅ |
| 8b | `avoidance-map` | `asmt_avoidance_review` | 1.950.000 | /assessments/avoidance-map/review/ | ban-do-ne-tranh | decision-clarity | ✅ tier |
| 9 | `emotional-block-mapping` | `prog_emo_block` | 6.300.000 | /programs/emotional-block-mapping/ | diem-nghen-cam-xuc | — | ✅ (bài public) |
| 10 | `boundary-foundation` | `cert_boundary_found` | 7.600.000 | /programs/boundary-foundation/ | nen-tang-ranh-gioi | — | ✅ (bài public) |

### A.2 Membership tiers (5)

| # | Canonical slug | plan_code | Giá (USD) | Giá (₫) | Landing | Ghi chú | Khớp |
|---|---|---|---|---|---|---|---|
| 11 | `core-access` | `year1` | 3 | 75.000 | /products/ | Membership năm 1 — Core Access | ✅ |
| 12 | `year-2-continuity` | `year2` | 60 | 1.490.000 | /products/ | Membership năm 2 — Continuity | ✅ |
| 13 | `year-3-mastery` | `year3` | 99 | 2.490.000 | /products/ | Membership năm 3+ — Mastery | ✅ |
| 14 | `lifetime-founding` | `lifetime` | 299 | 7.600.000 | /products/ | Lifetime Founding Member | ✅ |
| 15 | `practice-monthly` | `monthly_practice` | 9 | 225.000 | /products/ | Practice Monthly (subscription) | ✅ |

### A.3 Micro products (5)

| # | Canonical slug | plan_code | Giá (USD) | Giá (₫) | Landing | Family | Khớp |
|---|---|---|---|---|---|---|---|
| 16 | `life-reset-mini` | `micro_life_reset` | 7 | 175.000 | /products/ | life-reset | ✅ |
| 17 | `inner-listening-kit` | `micro_inner_listening` | 5 | 125.000 | /products/ | inner-listening | ✅ |
| 18 | `one-corner-reset` | `micro_one_corner` | 3 | 75.000 | /products/ | space-reset | ✅ |
| 19 | `7-day-true-rhythm` | `micro_7day_rhythm` | 9 | 225.000 | /products/ | rhythm-design | ✅ |
| 20 | `companion-circle` | `micro_companion` | 9 | 225.000 | /products/ | community | ✅ |

### A.4 Pilot programs (3)

| # | Canonical slug | plan_code | Giá (USD) | Giá (₫) | Landing | Family | Khớp |
|---|---|---|---|---|---|---|---|
| 21 | `self-trust-practice-lab` | `self_trust_evidence_builder` | 39 | 990.000 | /programs/self-trust-practice-lab/ | self-trust-practice | ✅ |
| 22 | `open-loop-closure-sprint` | `open_loop_closure_sprint` | 19 | 490.000 | /programs/open-loop-closure-sprint/ | open-loop-closure | ✅ |
| 23 | `personal-after-action-review` | `personal_after_action_review` | 29 | 750.000 | /programs/personal-after-action-review/ | after-action-review | ✅ |

## B. NỘI DUNG FREE (không có landing bán riêng)

| Bài viết | Lesson | Ghi chú |
|---|---|---|
| `ban-do-he-thong-doi-song-ca-nhan` | life-system-map | Bài public nền tảng, lesson free cho thành viên |
| `lang-nghe-va-ra-quyet-dinh-ro-rang` | decision-clarity | Bài public nền tảng, lesson free cho thành viên |
| `thiet-ke-moi-truong-song-phu-hop` | environmental-influence | Bài public nền tảng, lesson free cho thành viên |

## C. HÀNH ĐỘNG ÁP MAP (đã hoàn thành)

1. ✅ Đổi CTA 7 bài rõ ràng (#1–#7) → trỏ landing bán tương ứng.
2. ✅ Gộp academy → `/members/deep/<canonical-slug>/`; cập nhật `_middleware` + entitlement.
3. ✅ Gate entitlement theo plan_code cụ thể (mua X chỉ mở X).
4. ✅ Viết 3 bài public cho 3 landing mồ côi; tạo 3 landing tier.
5. ✅ Surface landing vào `/products` index + `/members/deep/` index.
6. ✅ Dual rail thanh toán: VietQR + PayPal (Công Ty Tnhh Thành Tâm Phát).
7. ✅ Verify funnel: public click bài → landing → (mua) → lesson mở đúng.

## D. SLUG CANONICAL (khóa — mọi lớp dùng chung)

**Sản phẩm chính (10):**
`rhythm-design-lab · space-reset-practitioner · family-pattern-mapping · creative-practice-studio · personal-capital · practice-companion-level-1 · practice-method-designer · avoidance-map · emotional-block-mapping · boundary-foundation`

**Membership (5):** `core-access · year-2-continuity · year-3-mastery · lifetime-founding · practice-monthly`

**Micro (5):** `life-reset-mini · inner-listening-kit · one-corner-reset · 7-day-true-rhythm · companion-circle`

**Pilot (3):** `self-trust-practice-lab · open-loop-closure-sprint · personal-after-action-review`

→ Bài viết giữ slug tiếng Việt riêng (SEO), nhưng **CTA + plan_code + lesson + landing** dùng đúng canonical slug ở trên. Mọi sản phẩm/bài thêm sau phải đăng ký 1 dòng vào Bảng A trước khi build.

## E. VERIFY CHECKSUM (26/26 = 100% PLANS coverage)

- Tổng plan code trong `constants.js → PLANS`: **26**
- Tổng plan code trong Bảng A (A.1 + A.2 + A.3 + A.4): **26**
- **Match: 100%** ✅

Verify script:
```bash
node -e "import('./functions/_lib/constants.js').then(({PLANS}) => { const map=['prog_rhythm_lab','prog_space_reset','prog_family_pattern','prog_creative_studio','diag_capital_self','diag_capital_expert','diag_capital_biz','cert_companion_l1','cert_method_designer','asmt_avoidance_self','asmt_avoidance_review','prog_emo_block','cert_boundary_found','year1','year2','year3','lifetime','monthly_practice','micro_life_reset','micro_inner_listening','micro_one_corner','micro_7day_rhythm','micro_companion','self_trust_evidence_builder','open_loop_closure_sprint','personal_after_action_review']; const all=Object.keys(PLANS); const missing=all.filter(k=>!map.includes(k)); console.log(missing.length===0?'PASS — 26/26':'FAIL — missing: '+missing.join(',')); });"
```
