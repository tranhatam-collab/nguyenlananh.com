# CANONICAL PRODUCT MAP — 1:1 (Bài viết ↔ Landing bán ↔ plan_code ↔ Lesson)

> Nguồn duy nhất chống mâu thuẫn 4 lớp. Ngày 2026-06 · HEAD `19e29dc`.
> **Quy tắc:** mỗi sản phẩm dùng **1 canonical slug** xuyên suốt 4 lớp. Landing slug + plan_code là gốc (gắn giá). Lesson gộp về **`/members/deep/<canonical-slug>/`** (bỏ `/members/academy/` — Contract §E.2). CTA bài → **landing bán** (không trỏ gated).

## A. BẢNG MAP CANONICAL (10 sản phẩm + 3 tier mở rộng)

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

`rhythm-design-lab · space-reset-practitioner · family-pattern-mapping · creative-practice-studio · personal-capital · practice-companion-level-1 · practice-method-designer · avoidance-map · emotional-block-mapping · boundary-foundation`

→ Bài viết giữ slug tiếng Việt riêng (SEO), nhưng **CTA + plan_code + lesson + landing** dùng đúng canonical slug ở trên. Mọi sản phẩm/bài thêm sau phải đăng ký 1 dòng vào Bảng A trước khi build.
