# AUDIT GAP — Kế hoạch 45 bài · 45 commercial offers · 4 membership · Creator · Audit Report

> Ngày: 2026-06-25 (cập nhật)
> HEAD: `9ed0258`
> Mục tiêu: 45 bài viết, 45 commercial offers, 4 gói thành viên, nhà sáng tạo nội dung, thống kê báo cáo audit

---

## Hiện trạng tổng quan

| Mục tiêu | Hiện có | Thiếu | Phán quyết |
|---|---|---|---|
| 45 bài viết | ~82 bài viết thực tế | ✅ Đã vượt | PASS số lượng, cần quality audit |
| 45 commercial offers | 26 plan codes, 13 product families, 22 landing pages | ~19–23 offers | IN PROGRESS — 3 pilot products đã build xong |
| 4 gói thành viên | 5 gói (year1, year2, year3, lifetime, monthly_practice) | ✅ Đã đủ | PASS (monthly chưa public cho đến khi recurring hoàn chỉnh) |
| Nhà sáng tạo nội dung | `/creators/`, `/creators/apply/`, `/creators/:slug/`, `/members/creator-dashboard/` + admin | IP/consent/revenue share | BUILD REQUIRED (routing đã fix) |
| Thống kê báo cáo audit | `/admin/audit/` + API + inventory API + content stats | funnel analytics, MRR/ARR, export | P1 — cần mở rộng tiếp |
| Giá mỗi offer | 26 plan codes, mỗi cái 1 giá | ✅ CI gate `validate:prices` | PASS |
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

### Plan codes hiện có (26)

| Nhóm | Số lượng | Plan codes |
|---|---|---|
| Membership | 5 | year1, year2, year3, lifetime, monthly_practice |
| Micro products | 5 | micro_life_reset, micro_inner_listening, micro_one_corner, micro_7day_rhythm, micro_companion |
| Premium offers | 13 | asmt_avoidance_self, asmt_avoidance_review, diag_capital_self, diag_capital_expert, diag_capital_biz, prog_rhythm_lab, prog_emo_block, prog_family_pattern, prog_space_reset, prog_creative_studio, cert_boundary_found, cert_companion_l1, cert_method_designer |
| Pilot programs | 3 | self_trust_evidence_builder, open_loop_closure_sprint, personal_after_action_review |
| **Tổng** | **26** | — |

**Phân nhóm premium (13):**
- Assessments (5): asmt_avoidance_self, asmt_avoidance_review, diag_capital_self, diag_capital_expert, diag_capital_biz
- Guided programs (5): prog_rhythm_lab, prog_emo_block, prog_family_pattern, prog_space_reset, prog_creative_studio
- Certifications (3): cert_boundary_found, cert_companion_l1, cert_method_designer

**Phân nhóm pilot (3):**
- self_trust_evidence_builder — Self-Trust Practice Lab ($39)
- open_loop_closure_sprint — Open Loop Closure Sprint ($19)
- personal_after_action_review — Personal After-Action Review ($29)

### Product families hiện có (13)

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
11. Self-Trust Practice Lab (pilot)
12. Open Loop Closure Sprint (pilot)
13. Personal After-Action Review (pilot)

### Landing pages hiện có (22)

| Nhóm | Số | Ghi chú |
|---|---|---|
| /products/ | 6 | 5 micro + 1 index |
| /assessments/ | 5 | index + 2 core + 2 tier |
| /programs/ | 10 | 6 core + 3 pilot + 1 index |
| /certification/ | 3 | 2 core + 1 index |
| **Tổng** | **22** | — |

### Không tính thiếu bằng 45 − 19 landing pages

Mục tiêu đúng là **~45 commercial offers trong khoảng 25–30 product families**. Đang còn cách rất xa nếu tính theo landing pages, nhưng gần hơn nếu tính theo offers.

### 3 pilot products — ĐÃ BUILD ✅

| # | Product family | Offer | Giá | Curriculum | Landing | Email |
|---|---|---|---|---|---|---|
| 1 | Self-Trust Practice | self_trust_evidence_builder | $39 | ✅ 6 lessons + pre-assessment + quiz + 2 labs + rubric + report | ✅ /programs/self-trust-practice-lab/ | ✅ T90 |
| 2 | Open Loop Closure | open_loop_closure_sprint | $19 | ✅ 6 lessons + pre-assessment + quiz + 2 labs + rubric + report | ✅ /programs/open-loop-closure-sprint/ | ✅ T91 |
| 3 | Personal After-Action Review | personal_after_action_review | $29 | ✅ 6 lessons + pre-assessment + quiz + 2 labs + rubric + report | ✅ /programs/personal-after-action-review/ | ✅ T92 |

Mỗi pilot đã có: pre-assessment, 6 lessons, quiz, 2 labs, 2 submissions, rubric, report template, landing page, welcome email (T90-T92), content gating (DEEP_LESSON_PLAN_MAP), sitemap entry, price validation PASS.

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

## 4. Nhà sáng tạo nội dung — Đã có cơ bản ✅, cần hoàn thiện 🟡

**Hiện có:**
- 10 chương trình trong `/chuong-trinh/`
- `/admin/creators/` — admin review
- `/creators/` — public directory
- `/creators/apply/` — application form
- `/creators/:slug/` — public profile (routing đã fix tại `d349134`)
- `/members/creator-dashboard/` — creator dashboard
- API: apply, profiles list, profile by slug, submissions, admin applications
- DB schema: `creator_profiles`, `creator_applications`, `creator_submissions`

**Thiếu:**
- IP, consent, revenue share policy
- Public submission → review → publish workflow end-to-end test
- Creator onboarding email template

**Trạng thái:** BUILD REQUIRED (còn lại policy + onboarding).

---

## 5. Thống kê báo cáo audit — Đã có cơ bản ✅, cần mở rộng 🟡

**Hiện có:**
- `/admin/audit/` dashboard
- `/api/admin/audit` JSON endpoint
- `/api/admin/inventory` JSON endpoint (product taxonomy)
- Quyền `audit.view` cho super_admin + ops_manager
- Các chỉ số: users, paid members, orders, revenue by provider/plan, content access, lesson completed, practice submissions, assessments, exams, checkins, certifications, creator applications, webhook errors
- Product inventory: product families, offer counts, plan code counts theo nhóm
- Content stats: tổng bài, bài public, category pages, bài dưới chuẩn độ dài, missing CTA, missing metadata (đang build)

**Cần mở rộng tiếp:**
- Funnel analytics: conversion rate, top pages, top products
- Webhook event viewer
- MRR / ARR dashboard
- Export PDF/Excel
- Duplicate risk, broken links

**Trạng thái:** P1 — đang mở rộng content stats.

---

## 6. Giá sản phẩm — Mỗi offer có giá khác nhau ✅

**Hiện có 26 plan codes với giá USD riêng biệt.**

**Đã đồng bộ:**
- asmt_avoidance_review: 1.950.000 VND / $79
- diag_capital_expert: 15.000.000 VND / $600
- diag_capital_biz: 30.000.000 VND / $1.200

**CI gate:** `npm run validate:prices` — script `scripts/validate-prices.mjs` scan mọi landing page `data-plan` / `data-price` và so sánh với `functions/_lib/constants.js`. Exit 1 nếu drift. Kết quả hiện tại: 31 attrs checked, PASS.

**Trạng thái:** PASS.

---

## 7. PayPal — Checkout PASS, Fulfillment READY TO TEST

| Hạng mục | Trạng thái |
|---|---|
| Live creds (CLIENT_ID, CLIENT_SECRET) | ✅ set trong Cloudflare Pages secrets |
| MERCHANT_EMAIL | ✅ set (tranhatam@gmail.com) |
| Checkout URL creation | ✅ PASS |
| Webhook endpoint `/api/payments/paypal/webhook` | ✅ tồn tại |
| WEBHOOK_ID production | ✅ set (4XC48816HG326394T) |
| End-to-end fulfillment | ⏳ READY TO TEST — cần deploy + test thanh toán thật |
| Secret rotation | ⚠️ URGENT — credentials đã lộ trong chat, cần rotate sau khi verify |

**Đã set:**
- `PAYPAL_CLIENT_ID` ✅
- `PAYPAL_CLIENT_SECRET` ✅
- `PAYPAL_MERCHANT_EMAIL` ✅
- `PAYPAL_WEBHOOK_ID` ✅

**Cần làm tiếp:**
1. Deploy để secrets có hiệu lực
2. Test end-to-end: thanh toán thật (sandbox hoặc micro $3) → webhook → fulfillment → entitlement
3. **Rotate credentials** vì đã lộ trong chat history

---

## 8. Thứ tự ưu tiên đúng

### P0 — Khóa nền quản trị
1. ✅ Hoàn thiện inventory và báo cáo audit (đã làm)
2. ✅ Thêm gói membership thứ tư (đã làm)
3. ✅ Xây `/admin/audit/` cơ bản (đã làm)
4. ✅ Tách product family, offer, membership registry (đã làm)
5. ✅ Fix creator routing `/creators/:slug/` (đã làm tại `d349134`)
6. ✅ Price validation CI gate `validate:prices` (đã làm tại `d349134`)
7. Xác minh PayPal webhook end-to-end (cần email + secret mới)

### P1 — Creator foundation + audit mở rộng
8. ✅ `/creators/` (đã làm)
9. ✅ `/creators/apply/` (đã làm)
10. ✅ `/creators/{slug}/` (đã làm, routing fix)
11. ✅ `/members/creator-dashboard/` (đã làm)
12. ✅ Submission/review workflow (đã làm)
13. ⏳ IP, consent, revenue share policy
14. ⏳ Mở rộng `/api/admin/audit` content stats (đang làm)

### P2 — Ba sản phẩm pilot
14. ✅ Self-Trust Practice Lab — curriculum + landing + email T90 + gating
15. ✅ Open Loop Closure Sprint — curriculum + landing + email T91 + gating
16. ✅ Personal After-Action Review System — curriculum + landing + email T92 + gating

---

## 9. Phán quyết cuối

| Hạng mục | Phán quyết |
|---|---|
| Tier price fixes | ✅ VERIFIED |
| Plan code count | 26 (23 + 3 pilot) |
| Premium offers | 13 (5 assessments + 5 programs + 3 certifications) |
| Pilot offers | 3 (self-trust, open-loop, after-action) — ✅ BUILT |
| 45-product claim | IN PROGRESS — 26/45 plan codes, 13/25 product families |
| Monthly membership | APPROVED (chưa public) |
| Lifetime membership | DEPLOYED (có thể thay bằng monthly nếu anh muốn) |
| Admin audit | P1 — đang mở rộng content stats |
| Creator public system | ✅ Routing fix xong, còn policy + onboarding |
| Creator routing `/creators/:slug/` | ✅ FIXED tại `d349134` |
| Price validation CI | ✅ `npm run validate:prices` tại `d349134` |
| PayPal checkout | PASS (creds set) |
| PayPal end-to-end fulfillment | READY TO TEST (WEBHOOK_ID set) |
| Pilot curricula (3) | ✅ BUILT — 6 lessons + pre-assessment + quiz + 2 labs + rubric + report mỗi pilot |
| Pilot email templates T90-T92 | ✅ WIRED — render động trong email.js |
| Pilot content gating | ✅ WIRED — DEEP_LESSON_PLAN_MAP + content_access check |
| Build 26 products at once | REJECTED |
| Build 3 pilot products first | ✅ COMPLETED |

---

*Generated with [Devin](https://devin.ai) · 2026-06-25*
