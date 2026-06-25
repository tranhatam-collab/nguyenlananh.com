# AUDIT GAP — Kế hoạch 45 bài · 45 commercial offers · 4 membership · Creator · Audit Report

> Ngày: 2026-06-25
> HEAD: `55d2f00`
> Mục tiêu: 45 bài viết, 45 commercial offers, 4 gói thành viên, nhà sáng tạo nội dung, thống kê báo cáo audit

---

## Hiện trạng tổng quan

| Mục tiêu | Hiện có | Thiếu | Phán quyết |
|---|---|---|---|
| 45 bài viết | ~82 bài viết thực tế | ✅ Đã vượt | PASS số lượng, cần quality audit |
| 45 commercial offers | 22 plan codes, 10 product families, 19 landing pages | ~24–30 offers | HOLD — cần inventory chính xác + product taxonomy |
| 4 gói thành viên | 5 gói (year1, year2, year3, lifetime, monthly_practice) | ✅ Đã đủ | PASS (monthly chưa public cho đến khi recurring hoàn chỉnh) |
| Nhà sáng tạo nội dung | 10 chương trình + admin/creators | public creator pages | BUILD REQUIRED |
| Thống kê báo cáo audit | `/admin/audit/` + API | advanced analytics | P0 — cần mở rộng |
| Giá mỗi offer | 22 plan codes, mỗi cái 1 giá | ✅ | PASS |
| PayPal checkout | checkout URL trả về | ✅ | PASS |
| PayPal fulfillment | webhook endpoint tồn tại | webhook ID + end-to-end test | HOLD |

---

## 1. Bài viết — 45/45 ✅

**Hiện có:** 89 thư mục con trong `/bai-viet/`, 82 bài viết thực tế (trừ 7 trang chuyên mục).

**Đánh giá:** Đã vượt mục tiêu. Cần rà soát chất lượng:
- Đảm bảo mỗi bài có CTA đúng landing (funnel)
- Kiểm tra duplicate content giữa các bài
- Mỗi bài nên đạt 1.500–2.400 từ, H1/H2 rõ ràng

**Không cần viết thêm bài cho đủ số lượng.**

---

## 2. Sản phẩm — Inventory chưa chính xác 🔴

### Phân biệt taxonomy

| Khái niệm | Ý nghĩa | Ví dụ |
|---|---|---|
| Product family | Dòng sản phẩm cốt lõi | Avoidance Map, Personal Capital |
| Commercial offer | Tier/phiên bản bán | Self, Review, Expert, Business |
| Landing page | Trang public bán | /assessments/avoidance-map/ |
| Plan code | Mã checkout | asmt_avoidance_self |
| Entitlement | Quyền truy cập | content_access |

### Plan codes hiện có (22)

| Nhóm | Số lượng | Plan codes |
|---|---|---|
| Membership | 5 | year1, year2, year3, lifetime, monthly_practice |
| Micro products | 5 | micro_life_reset, micro_inner_listening, micro_one_corner, micro_7day_rhythm, micro_companion |
| Premium offers | 12 | asmt_avoidance_self, asmt_avoidance_review, prog_rhythm_lab, prog_emo_block, cert_boundary_found, prog_family_pattern, prog_space_reset, prog_creative_studio, diag_capital_self, diag_capital_expert, diag_capital_biz, cert_companion_l1, cert_method_designer |
| **Tổng** | **22** | — |

### Product families hiện có (10)

1. Avoidance Map
2. Personal Capital
3. Rhythm Design Lab
4. Emotional Block Mapping
5. Boundary Foundation
6. Family Pattern Mapping
7. Space Reset Practitioner
8. Creative Practice Studio
9. Practice Companion L1
10. Practice Method Designer

### Landing pages hiện có (19)

| Nhóm | Số | Ghi chú |
|---|---|---|
| /products/ | 6 | 5 micro + 1 index |
| /assessments/ | 5 | index + 2 core + 2 tier |
| /programs/ | 7 | 6 core + 1 index |
| /certification/ | 3 | 2 core + 1 index |
| **Tổng** | **19** | — |

### Không tính thiếu bằng 45 − 19 landing pages

Mục tiêu đúng là **~45 commercial offers trong khoảng 25–30 product families**. Đang còn cách rất xa nếu tính theo landing pages, nhưng gần hơn nếu tính theo offers.

### 3 pilot products đề xuất đầu tiên

| # | Product family | Offer | Giá gợi ý |
|---|---|---|---|
| 1 | Self-Trust Practice | self_trust_evidence_builder | 990.000 VND / $39 |
| 2 | Open Loop Closure | open_loop_closure_sprint | 490.000 VND / $19 |
| 3 | Personal After-Action Review | personal_after_action_review | 750.000 VND / $29 |

Mỗi pilot phải có: pre-assessment, 6 lessons, quiz, 2 labs, 2 submissions, final output, rubric, report, entitlement, welcome template, refund/revoke, versioning.

---

## 3. Gói thành viên — 4/4 ✅

**Hiện có:**
- year1: $3 / 75.000 VND
- year2: $60 / 1.490.000 VND
- year3: $99 / 2.490.000 VND
- lifetime: $299 / 7.600.000 VND — vĩnh viễn
- monthly_practice: $9 / 225.000 VND — chưa public cho đến khi recurring hoàn chỉnh

**Trạng thái:** Đã đủ 4 gói. ✅

**Khuyến nghị:** Nếu anh muốn thay lifetime bằng monthly, em có thể đổi. Monthly cần recurring payment, cancel, failed renewal, grace period, entitlement expiry, billing page trước khi public.

---

## 4. Nhà sáng tạo nội dung — Chưa hoàn chỉnh 🟡

**Hiện có:**
- 10 chương trình trong `/chuong-trinh/`
- `/admin/creators/`

**Thiếu:**
- `/creators/` — public directory
- `/creators/apply/` — application form
- `/creators/{slug}/` — public profile
- `/members/creator-dashboard/` — creator dashboard
- Submission → review → publish workflow
- IP, consent, revenue share

**Trạng thái:** BUILD REQUIRED.

---

## 5. Thống kê báo cáo audit — Đã có cơ bản ✅, cần mở rộng 🟡

**Hiện có:**
- `/admin/audit/` dashboard
- `/api/admin/audit` JSON endpoint
- Quyền `audit.view` cho super_admin + ops_manager
- Các chỉ số: users, paid members, orders, revenue by provider/plan, content access, lesson completed, practice submissions, assessments, exams, checkins, certifications, creator applications, webhook errors

**Cần mở rộng:**
- Content stats: tổng bài, bài dưới chuẩn, duplicate risk, missing CTA, broken links
- Product inventory: product family count, offer count, landing page count, price mismatch, entitlement mismatch
- Funnel analytics: conversion rate, top pages, top products
- Webhook event viewer
- MRR / ARR dashboard
- Export PDF/Excel

**Trạng thái:** P0 — cần tiếp tục mở rộng.

---

## 6. Giá sản phẩm — Mỗi offer có giá khác nhau ✅

**Hiện có 22 plan codes với giá USD riêng biệt.**

**Đã đồng bộ:**
- asmt_avoidance_review: 1.950.000 VND / $79
- diag_capital_expert: 15.000.000 VND / $600
- diag_capital_biz: 30.000.000 VND / $1.200

**Trạng thái:** PASS.

---

## 7. PayPal — Checkout PASS, Fulfillment HOLD

| Hạng mục | Trạng thái |
|---|---|
| Live creds (CLIENT_ID, CLIENT_SECRET) | ✅ validated |
| Checkout URL creation | ✅ PASS |
| Webhook endpoint `/api/payments/paypal/webhook` | ✅ tồn tại |
| WEBHOOK_ID production | ❌ chưa có bằng chứng |
| End-to-end fulfillment | ❌ chưa xác minh |
| Secret rotation | ⚠️ cần làm (secret đã lộ trong chat) |

**Cần từ anh:**
1. Email PayPal Business của Thành Tâm Phát → set `PAYPAL_MERCHANT_EMAIL`
2. Secret PayPal mới (sau khi rotate) → update `PAYPAL_CLIENT_SECRET`

---

## 8. Thứ tự ưu tiên đúng

### P0 — Khóa nền quản trị
1. ✅ Hoàn thiện inventory và báo cáo audit (đang làm)
2. ✅ Thêm gói membership thứ tư (đã làm)
3. ✅ Xây `/admin/audit/` cơ bản (đã làm)
4. Tách product family, offer, membership registry
5. Xác minh PayPal webhook end-to-end (cần email + secret mới)

### P1 — Creator foundation
6. `/creators/`
7. `/creators/apply/`
8. `/creators/{slug}/`
9. `/members/creator-dashboard/`
10. Submission/review workflow

### P2 — Ba sản phẩm pilot
11. Self-Trust Practice Lab
12. Open Loop Closure Sprint
13. Personal After-Action Review System

---

## 9. Phán quyết cuối

| Hạng mục | Phán quyết |
|---|---|
| Tier price fixes | ✅ VERIFIED |
| Plan code count | 22 |
| 45-product claim | HOLD — cần taxonomy rõ ràng |
| Monthly membership | APPROVED (chưa public) |
| Lifetime membership | DEPLOYED (có thể thay bằng monthly nếu anh muốn) |
| Admin audit | P0 — cần mở rộng |
| Creator public system | P1 — BUILD REQUIRED |
| PayPal checkout | PASS |
| PayPal end-to-end fulfillment | HOLD |
| Build 26 products at once | REJECTED |
| Build 3 pilot products first | APPROVED |

---

*Generated with [Devin](https://devin.ai) · 2026-06-25*
