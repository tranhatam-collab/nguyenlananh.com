# Docs Handoff Index

Bộ tài liệu này dùng để triển khai website `nguyenlananh.com` theo đúng định vị đã khóa.

## Thứ tự đọc đề xuất

1. `NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md`
2. `NGUYENLANANH_ONE_PAGE_MASTER_HANDOFF.md`
3. `TEAM_1_PUBLIC_CONVERSION_LIVE_TODAY.md`
4. `TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md`
5. `INTEGRATION_RELEASE_CHECKLIST_TODAY.md`
6. `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`
7. `NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md`
8. `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`
9. `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`
10. `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`
11. `DEV_EXECUTION_PLAN.md`
11. `CMS_CONTENT_MODEL.md`
12. `CONTENT_BACKLOG.md`
13. `CONTENT_AUDIT_2026-04-09.md`
14. `CONTENT_DIRECTION_SOUND_SELF_PRACTICE.md`
15. `SEO_IMPLEMENTATION_CHECKLIST.md`
16. `QA_ACCEPTANCE_CHECKLIST.md`
17. `MEMBERSHIP_SYSTEM_MASTER.md`
18. `MEMBERSHIP_DB_SCHEMA.sql`
19. `MEMBERSHIP_DEEP_CONTENT_ROADMAP.md`
20. `MEMBERSHIP_TOPIC_SOUND_SELF_PRACTICE_MASTER_PLAN.md`
21. `MEMBERSHIP_TOPIC_LOOP_MAP_MASTER_PLAN.md`
22. `MEMBERSHIP_TOPIC_FAMILY_ROOTS_MASTER_PLAN.md`
23. `MEMBERSHIP_TOPIC_CHILD_GROWTH_MASTER_PLAN.md`
24. `MANUAL_DEPLOY_RUNBOOK.md`
25. `ARTICLE_IMAGE_SEO_SYSTEM.md`
26. `FOUNDATION_ARTICLE_IMAGE_PROMPTS.md`
27. `PUBLIC_ARTICLE_SOUND_SELF_PRACTICE_FULL_COPY.md`
28. `MEMBERS_DEEP_SOUND_SELF_PRACTICE_FULL_COPY.md`
29. `SOUND_SELF_PRACTICE_FINAL_DEV_HANDOFF.md`
30. `contracts/paypal-membership-openapi.yaml`
31. `contracts/paypal-event-email-map.json`
32. `contracts/paypal-membership-implementation-notes.md`
33. `contracts/paypal-membership-schema-patch.sql`
34. `contracts/paypal-api-examples.http`
35. `contracts/paypal-backend-test-matrix.md`
36. `contracts/paypal-backend-smoke.sh`
37. `contracts/reference-backend/README.md`
38. `contracts/reference-backend/event-router-skeleton.mjs`
39. `contracts/reference-backend/service-skeleton.mjs`

## Mục đích từng file

- `NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md`: master plan hợp nhất cuối cùng cho phase nâng cấp mới, gồm homepage chuyển đổi, menu final, membership guided journey, creator layer nội bộ, admin toàn quyền, PayPal-first và sprint triển khai.
- `TEAM_1_PUBLIC_CONVERSION_LIVE_TODAY.md`: lane thực thi cho Team 1, phụ trách public surface, homepage, join page, CTA và ngôn ngữ public để live trong hôm nay.
- `TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md`: lane thực thi cho Team 2, phụ trách membership flow, member routes, creator layer nội bộ, admin foundation và PayPal/member activation để live trong hôm nay.
- `INTEGRATION_RELEASE_CHECKLIST_TODAY.md`: checklist điều phối release trong ngày, gồm freeze window, ownership, smoke matrix, commit tách lane, handoff và deploy snapshot an toàn.
- `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`: tài liệu chiến lược gốc (brand, UX, content, SEO, conversion).
- `NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md`: checklist triển khai và deploy theo phase.
- `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`: full copy homepage (dev copy/paste trực tiếp).
- `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`: map bài viết, thứ tự publish, và internal linking.
- `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`: khóa SEO homepage (meta/OG/schema/heading).
- `NGUYENLANANH_ONE_PAGE_MASTER_HANDOFF.md`: file chỉ huy một trang để bàn giao nhanh cho dev, đọc sau master plan hợp nhất.
- `DEV_EXECUTION_PLAN.md`: milestone theo phase + definition of done.
- `CMS_CONTENT_MODEL.md`: schema CMS, taxonomy, quy tắc biên tập.
- `CONTENT_BACKLOG.md`: danh sách 10 bài nền và pipeline xuất bản.
- `CONTENT_AUDIT_2026-04-09.md`: ảnh chụp nhanh hiện trạng độ sâu nội dung trước khi PR và trước khi mở vòng viết tiếp.
- `CONTENT_DIRECTION_SOUND_SELF_PRACTICE.md`: khóa hướng biên tập cho cụm chủ đề âm thanh tự thân trước khi viết bài publish.
- `SEO_IMPLEMENTATION_CHECKLIST.md`: checklist triển khai SEO kỹ thuật + on-page.
- `QA_ACCEPTANCE_CHECKLIST.md`: checklist nghiệm thu trước khi launch.
- `MEMBERSHIP_SYSTEM_MASTER.md`: kiến trúc membership, flow join/pay/magic-link, khóa route và roadmap phase 2.
- `MEMBERSHIP_DB_SCHEMA.sql`: schema DB chuẩn cho backend membership (users/payments/sessions/content_access/magic_links).
- `MEMBERSHIP_DEEP_CONTENT_ROADMAP.md`: roadmap hoàn chỉnh cho lớp `members/deep`, gồm thứ tự chuyên đề cá nhân -> thân tâm -> gia đình -> trẻ em.
- `MEMBERSHIP_TOPIC_SOUND_SELF_PRACTICE_MASTER_PLAN.md`: master plan cho chuyên đề membership âm thanh tự thân + bài public ngắn + roadmap cá nhân/gia đình/trẻ em.
- `MEMBERSHIP_TOPIC_LOOP_MAP_MASTER_PLAN.md`: master plan cho chuyên đề thành viên về vòng lặp, trigger, phản ứng và điểm nghẽn sâu.
- `MEMBERSHIP_TOPIC_FAMILY_ROOTS_MASTER_PLAN.md`: master plan cho chuyên đề gia đình, vai trò sống và những điều đang truyền qua nhau.
- `MEMBERSHIP_TOPIC_CHILD_GROWTH_MASTER_PLAN.md`: master plan cho chuyên đề đồng hành cùng trẻ em bằng môi trường sống, nhịp sống và sự hiện diện.
- `MANUAL_DEPLOY_RUNBOOK.md`: runbook ngắn để publish production bằng 1 lệnh an toàn từ root repo.
- `ARTICLE_IMAGE_SEO_SYSTEM.md`: quy chuẩn hình ảnh minh họa và image SEO cho toàn bộ bài viết.
- `FOUNDATION_ARTICLE_IMAGE_PROMPTS.md`: bộ prompt minh họa chuẩn SEO cho bài mới và các bài nền còn thiếu.
- `PUBLIC_ARTICLE_SOUND_SELF_PRACTICE_FULL_COPY.md`: full copy hoàn chỉnh cho bài public mở đầu của chuyên đề.
- `MEMBERS_DEEP_SOUND_SELF_PRACTICE_FULL_COPY.md`: full module copy cho route thành viên `/members/deep/am-thanh-tu-than/`.
- `SOUND_SELF_PRACTICE_FINAL_DEV_HANDOFF.md`: file handoff cuối để team dev/content/SEO dựng route và lên nội dung đồng bộ.
- `contracts/paypal-membership-openapi.yaml`: skeleton API contract cho create-order/capture-order/webhook/magic-link resend.
- `contracts/paypal-event-email-map.json`: mapping chuẩn từ PayPal/internal events sang email template IDs.
- `contracts/paypal-membership-implementation-notes.md`: state machine, idempotency, webhook security, test matrix.
- `contracts/paypal-membership-schema-patch.sql`: patch schema cho paypal_orders/webhook_events/idempotency/email_jobs.
- `contracts/paypal-api-examples.http`: ví dụ request/response để dev import vào REST Client/Postman.
- `contracts/paypal-backend-test-matrix.md`: ma trận test bắt buộc trước khi bật live checkout auto.
- `contracts/paypal-backend-smoke.sh`: script smoke test endpoint khi backend staging đã bật.
- `contracts/reference-backend/*`: skeleton code tham chiếu cho handler create/capture/webhook/resend + event router.

## Ghi chú

- Membership MVP đã được dựng trên static routes để test flow end-to-end; phase 2 sẽ chuyển logic auth/payment sang backend.
