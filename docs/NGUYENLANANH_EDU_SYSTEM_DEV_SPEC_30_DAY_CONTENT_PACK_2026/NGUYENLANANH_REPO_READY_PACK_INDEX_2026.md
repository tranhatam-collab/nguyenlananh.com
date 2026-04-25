# NGUYENLANANH_REPO_READY_PACK_INDEX_2026.md

Gói này gồm 5 file để team dev triển khai hệ học tập động cho nguyenlananh.com.

## 1. Files

1. `NGUYENLANANH_EDU_SYSTEM_DEV_SPEC_2026.md`  
   Master dev spec: chiến lược, architecture, pricing, UX, DB/API, payment, email, check-in, KPI, roadmap.

2. `NGUYENLANANH_30_DAY_CONTENT_SYSTEM_2026.md`  
   30 ngày nội dung đầu tiên: title, SEO, lesson, practice, check-in, image prompt, email subject.

3. `NGUYENLANANH_EMAIL_AUTOMATION_TEMPLATES_2026.md`  
   Event matrix và templates email cho onboarding, lesson, check-in, payment, weekly report, upgrade.

4. `supabase_schema_nguyenlananh_edu_v1.sql`  
   SQL schema cho Supabase: profiles, plans, subscriptions, payments, lessons, check-ins, email events, automation jobs.

5. `pricing_seed_nguyenlananh_edu_v1.json`  
   Seed pricing chuẩn hóa 9 tier.

## 2. Build order

1. Apply DB schema.
2. Configure Supabase Auth magic link and Google.
3. Seed plans.
4. Build public routes.
5. Build member app routes.
6. Seed 30-day lessons.
7. Implement check-in.
8. Implement Stripe.
9. Implement PayPal.
10. Implement VietQR order flow.
11. Implement email.iai.one adapter.
12. Implement automation jobs.
13. Implement admin dashboard.
14. Run QA smoke tests.
15. Soft launch with limited users.

## 3. Launch rule

Launch không được bật tier 4-9 ngay. Chỉ bật:

- Free
- START
- FOUNDATION
- DISCIPLINE

Các tier còn lại để private hoặc invite only.

## 4. Founder approval checklist

- Pricing wording approved.
- Tone approved.
- First 30 days content approved.
- Email wording approved.
- Bank account/QR payment info approved.
- Refund/terms/legal pages approved.
- Production payment keys approved.
- Sender domain email.iai.one verified.
