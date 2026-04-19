# Docs Handoff Index

Bộ tài liệu này dùng để triển khai website `nguyenlananh.com` theo đúng định vị đã khóa.

## Thứ tự đọc đề xuất

1. `TEAM_EXECUTION_PACKET_2026-04-19.md`
2. `I18N_EXPANSION_FOUNDATION_2026-04-19.md`
3. `LOGIC_AUDIT_FULL_SITE_2026-04-14.md`
4. `TEAM_MASTERPLAN_LOGIC_REBUILD_2026-04-14.md`
5. `TEAM_1_SECURITY_AUTH_PAYMENT_PLAN_2026-04-14.md`
6. `TEAM_2_MEMBERSHIP_DELIVERY_ACCESS_PLAN_2026-04-14.md`
7. `TEAM_3_I18N_QA_RELEASE_PLAN_2026-04-14.md`
8. `NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md`
9. `NGUYENLANANH_ONE_PAGE_MASTER_HANDOFF.md`
10. `TEAM_1_PUBLIC_CONVERSION_LIVE_TODAY.md`
11. `TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md`
12. `INTEGRATION_RELEASE_CHECKLIST_TODAY.md`
13. `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`
12. `NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md`
13. `NGUYENLANANH_CONTENT_SYSTEM_99_DAYS_2026-04-17.md`
14. `TEAM_2_REWRITE_CONTENT_PLAN_2026-04-17.md`
15. `TEAM_2_UX_WIREFRAME_DETAIL_2026-04-17.md`
16. `TEAM_2_CODEX_AI_WRITING_WORKFLOW_2026-04-17.md`
17. `NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md`
18. `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`
19. `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`
20. `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`
21. `DEV_EXECUTION_PLAN.md`
22. `CMS_CONTENT_MODEL.md`
23. `CONTENT_BACKLOG.md`
24. `CONTENT_AUDIT_2026-04-09.md`
25. `CONTENT_DIRECTION_SOUND_SELF_PRACTICE.md`
26. `SEO_IMPLEMENTATION_CHECKLIST.md`
27. `QA_ACCEPTANCE_CHECKLIST.md`
28. `MEMBERSHIP_SYSTEM_MASTER.md`
29. `MEMBERSHIP_DB_SCHEMA.sql`
30. `MEMBERSHIP_DEEP_CONTENT_ROADMAP.md`
31. `MEMBERSHIP_TOPIC_SOUND_SELF_PRACTICE_MASTER_PLAN.md`
32. `MEMBERSHIP_TOPIC_LOOP_MAP_MASTER_PLAN.md`
33. `MEMBERSHIP_TOPIC_FAMILY_ROOTS_MASTER_PLAN.md`
34. `MEMBERSHIP_TOPIC_CHILD_GROWTH_MASTER_PLAN.md`
35. `MANUAL_DEPLOY_RUNBOOK.md`
36. `ARTICLE_IMAGE_SEO_SYSTEM.md`
37. `FOUNDATION_ARTICLE_IMAGE_PROMPTS.md`
38. `PUBLIC_ARTICLE_SOUND_SELF_PRACTICE_FULL_COPY.md`
39. `MEMBERS_DEEP_SOUND_SELF_PRACTICE_FULL_COPY.md`
40. `SOUND_SELF_PRACTICE_FINAL_DEV_HANDOFF.md`
41. `contracts/paypal-membership-openapi.yaml`
42. `contracts/paypal-event-email-map.json`
43. `contracts/paypal-membership-implementation-notes.md`
44. `contracts/paypal-membership-schema-patch.sql`
45. `contracts/paypal-api-examples.http`
46. `contracts/paypal-backend-test-matrix.md`
47. `contracts/paypal-backend-smoke.sh`
48. `contracts/reference-backend/README.md`
49. `contracts/reference-backend/event-router-skeleton.mjs`
50. `contracts/reference-backend/service-skeleton.mjs`

## Mục đích từng file

- `LOGIC_AUDIT_FULL_SITE_2026-04-14.md`: audit logic mới nhất cho toàn site, chốt 3 blocker P0 về protected delivery, fallback auth/payment và race fulfill.
- `TEAM_MASTERPLAN_LOGIC_REBUILD_2026-04-14.md`: masterplan điều phối mới cho 3 team, chia lane rõ theo security/payment, membership delivery và i18n/QA/release.
- `TEAM_1_SECURITY_AUTH_PAYMENT_PLAN_2026-04-14.md`: plan chuyên sâu cho team backend/payment/auth để khóa state machine, magic link và observability.
- `TEAM_2_MEMBERSHIP_DELIVERY_ACCESS_PLAN_2026-04-14.md`: plan chuyên sâu cho team membership để chuyển protected content khỏi HTML public và cleanup route/runtime.
- `TEAM_3_I18N_QA_RELEASE_PLAN_2026-04-14.md`: plan chuyên sâu cho team public/i18n/QA để chốt ngôn ngữ, metadata, smoke test và release gate.
- `NGUYENLANANH_DEV_MASTERPLAN_UNIFIED_2026-04.md`: master plan hợp nhất cuối cùng cho phase nâng cấp mới, gồm homepage chuyển đổi, menu final, membership guided journey, creator layer nội bộ, admin toàn quyền, PayPal-first và sprint triển khai.
- `TEAM_1_PUBLIC_CONVERSION_LIVE_TODAY.md`: lane thực thi cho Team 1, phụ trách public surface, homepage, join page, CTA và ngôn ngữ public để live trong hôm nay.
- `TEAM_2_MEMBERSHIP_ADMIN_LIVE_TODAY.md`: lane thực thi cho Team 2, phụ trách membership flow, member routes, creator layer nội bộ, admin foundation và PayPal/member activation để live trong hôm nay.
- `INTEGRATION_RELEASE_CHECKLIST_TODAY.md`: checklist điều phối release trong ngày, gồm freeze window, ownership, smoke matrix, commit tách lane, handoff và deploy snapshot an toàn.
- `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`: tài liệu chiến lược gốc (brand, UX, content, SEO, conversion).
- `NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md`: launch pack cho content production nhanh, gồm 10 bài bilingual publish-ready, prompt locked và launch CMS schema để nhập live.
- `NGUYENLANANH_CONTENT_SYSTEM_99_DAYS_2026-04-17.md`: editorial calendar 99 ngày theo cùng giọng viết, dùng để chạy lịch đăng và AI generation dài hạn.
- `TEAM_2_REWRITE_CONTENT_PLAN_2026-04-17.md`: playbook thực thi để Team 2 rewrite toàn bộ bài viết, khóa queue ưu tiên, format bàn giao và definition of done cho content + SEO.
- `TEAM_2_UX_WIREFRAME_DETAIL_2026-04-17.md`: wireframe chi tiết từng trang theo menu mới, section order, CTA rule, route map và component inventory cho UX/dev triển khai.
- `TEAM_2_CODEX_AI_WRITING_WORKFLOW_2026-04-17.md`: workflow chuẩn để Codex AI rewrite bài cũ và viết toàn bộ bài còn thiếu mà không lệch giọng, kèm prompt khung và rubric review.
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
