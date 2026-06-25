# CANONICAL PRODUCT MAP — 1:1 (Bài viết ↔ Landing bán ↔ plan_code ↔ Lesson)

> Nguồn duy nhất chống mâu thuẫn 4 lớp. Ngày 2026-06 · HEAD `108ede8`.
> **Quy tắc:** mỗi sản phẩm dùng **1 canonical slug** xuyên suốt 4 lớp. Landing slug + plan_code là gốc (gắn giá). Lesson gộp về **`/members/deep/<canonical-slug>/`** (bỏ `/members/academy/` — Contract §E.2). CTA bài → **landing bán** (không trỏ gated).

## A. BẢNG MAP CANONICAL (10 sản phẩm)

| # | Canonical slug | plan_code | Giá (₫) | Landing bán (route) | Bài viết gateway | Lesson hiện tại (academy→deep) | Khớp |
|---|---|---|---|---|---|---|---|
| 1 | `rhythm-design-lab` | `prog_rhythm_lab` | 2.500.000 | /programs/rhythm-design-lab/ | thiet-ke-nhip-song-ben-vung | 7-day-rhythm-audit | ✅ rõ |
| 2 | `space-reset-practitioner` | `prog_space_reset` | 12.700.000 | /programs/space-reset-practitioner/ | khong-gian-song-va-nang-luc-hanh-dong | space-friction-map | ✅ rõ |
| 3 | `family-pattern-mapping` | `prog_family_pattern` | 10.000.000 | /programs/family-pattern-mapping/ | he-gia-dinh-va-quyen-lua-chon | family-role-boundary-map | ✅ rõ |
| 4 | `creative-practice-studio` | `prog_creative_studio` | 10.000.000 | /programs/creative-practice-studio/ | he-van-hanh-lao-dong-sang-tao | creative-workflow-audit | ✅ rõ |
| 5 | `personal-capital` | `diag_capital_self` | 1.250.000 | /assessments/personal-capital/ | kinh-te-noi-tai-va-nguon-luc-ca-nhan | personal-resource-audit | ✅ rõ |
| 6 | `practice-companion-level-1` | `cert_companion_l1` | 30.000.000 | /certification/practice-companion-level-1/ | cong-dong-dong-hanh-va-truong-thanh | community-fit-assessment | ✅ rõ |
| 7 | `practice-method-designer` | `cert_method_designer` | 76.000.000 | /certification/practice-method-designer/ | du-an-doi-song-37-ngay | 37-day-project-charter | ✅ rõ |
| 8 | `avoidance-map` | `asmt_avoidance_self` | 490.000 | /assessments/avoidance-map/ | ⚠️ **lang-nghe-va-ra-quyet-dinh-ro-rang** (?) | decision-clarity-sheet | ⚠️ lệch chủ đề |
| 9 | `emotional-block-mapping` | `prog_emo_block` | 6.300.000 | /programs/emotional-block-mapping/ | ❌ **chưa có bài** | ❌ chưa có lesson | 🔴 GAP |
| 10 | `boundary-foundation` | `cert_boundary_found` | 7.600.000 | /programs/boundary-foundation/ | ❌ **chưa có bài** | ❌ chưa có lesson | 🔴 GAP |

## B. LỆCH / MỒ CÔI cần team quyết

### B.1 — Bài/lesson KHÔNG có landing tương ứng (orphan content)
| Bài viết | Lesson | Vấn đề |
|---|---|---|
| `ban-do-he-thong-doi-song-ca-nhan` | life-system-map-v1 | Chủ đề "hệ thống đời sống" — KHÔNG có sản phẩm. → Quyết: (a) tạo sản phẩm "Life System Map" mới, HOẶC (b) map vào `avoidance-map` (#8) làm bài entry, HOẶC (c) để pure-public CTA→/join. |
| `thiet-ke-moi-truong-song-phu-hop` | environmental-influence-map | Trùng chủ đề với #2 `space-reset`. → Gộp vào #2 (cùng sản phẩm) hoặc tách sản phẩm "Environment" riêng. |
| `lang-nghe-va-ra-quyet-dinh-ro-rang` | decision-clarity-sheet | Chủ đề "ra quyết định" — không có sản phẩm "decision". Tạm gán #8 avoidance-map nhưng **lệch**. → Tạo sản phẩm decision, hoặc đổi bài #8. |

### B.2 — Landing bán KHÔNG có bài/lesson funnel (orphan product — KHÔNG bán được qua nội dung)
| Landing | plan_code | Cần |
|---|---|---|
| /assessments/avoidance-map/ | asmt_avoidance_self | Viết bài "né tránh" đúng founder A.III#1 (hiện chưa có bài né-tránh thật) |
| /programs/emotional-block-mapping/ | prog_emo_block | Viết bài + lesson "điểm nghẽn cảm xúc" (founder A.III#3) |
| /programs/boundary-foundation/ | cert_boundary_found | Viết bài + lesson "ranh giới cá nhân" (founder A.III#4) |

> Ghi chú: hiện có **2 tier thiếu landing**: `asmt_avoidance_review`, `diag_capital_expert`, `diag_capital_biz` (plan_code có trong constants nhưng landing chỉ bán tier `self`). Team thêm tier selector trên landing hoặc tạo trang riêng.

## C. HÀNH ĐỘNG ÁP MAP (theo thứ tự)

1. **Đổi CTA 7 bài rõ ràng (#1–#7)** → trỏ **landing bán** tương ứng (cột "Landing bán"), bỏ link gated trực tiếp. *(C1 trong QA report)*
2. **Đổi tên lesson** academy→ `/members/deep/<canonical-slug>/` cho khớp slug landing; cập nhật `_middleware` + entitlement. *(C3)*
3. **Gate entitlement theo plan_code cụ thể** (M1): lesson `<canonical>` chỉ mở khi `content_access.plan_code = <plan_code của sản phẩm đó>` (hoặc membership year2/3). KHÔNG mở-tất-cả.
4. **Xử 3 lệch (B.1)** + **3 landing mồ côi (B.2)** — quyết tạo sản phẩm/bài mới hay gộp.
5. **Surface landing** vào `/products` index + nav + footer (M2/M3) để public tìm được.
6. **Verify funnel:** public click bài #1–7 → landing → (mua) → lesson `<canonical>` mở đúng; chưa mua → thấy landing bán (giá + nút), không phải /join trống.

## D. SLUG CANONICAL (khóa — mọi lớp dùng chung)
`rhythm-design-lab · space-reset-practitioner · family-pattern-mapping · creative-practice-studio · personal-capital · practice-companion-level-1 · practice-method-designer · avoidance-map · emotional-block-mapping · boundary-foundation`

→ Bài viết giữ slug tiếng Việt riêng (SEO), nhưng **CTA + plan_code + lesson + landing** dùng đúng canonical slug ở trên. Mọi sản phẩm/bài thêm sau phải đăng ký 1 dòng vào Bảng A trước khi build.
