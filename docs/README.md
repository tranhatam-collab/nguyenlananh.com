# Docs Handoff Index

Bộ tài liệu này dùng để triển khai website `nguyenlananh.com` theo đúng định vị đã khóa.

## Thứ tự đọc đề xuất

1. `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`
2. `NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md`
3. `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`
4. `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`
5. `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`
6. `NGUYENLANANH_ONE_PAGE_MASTER_HANDOFF.md`
7. `DEV_EXECUTION_PLAN.md`
8. `CMS_CONTENT_MODEL.md`
9. `CONTENT_BACKLOG.md`
10. `SEO_IMPLEMENTATION_CHECKLIST.md`
11. `QA_ACCEPTANCE_CHECKLIST.md`
12. `MEMBERSHIP_SYSTEM_MASTER.md`
13. `MEMBERSHIP_DB_SCHEMA.sql`

## Mục đích từng file

- `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`: tài liệu chiến lược gốc (brand, UX, content, SEO, conversion).
- `NGUYENLANANH_DEPLOY_LOCK_CHECKLIST.md`: checklist triển khai và deploy theo phase.
- `NGUYENLANANH_HOMEPAGE_FULL_COPY_FINAL.md`: full copy homepage (dev copy/paste trực tiếp).
- `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`: map bài viết, thứ tự publish, và internal linking.
- `NGUYENLANANH_HOMEPAGE_SEO_FULL_FINAL.md`: khóa SEO homepage (meta/OG/schema/heading).
- `NGUYENLANANH_ONE_PAGE_MASTER_HANDOFF.md`: file chỉ huy một trang để bàn giao nhanh cho dev.
- `DEV_EXECUTION_PLAN.md`: milestone theo phase + definition of done.
- `CMS_CONTENT_MODEL.md`: schema CMS, taxonomy, quy tắc biên tập.
- `CONTENT_BACKLOG.md`: danh sách 10 bài nền và pipeline xuất bản.
- `SEO_IMPLEMENTATION_CHECKLIST.md`: checklist triển khai SEO kỹ thuật + on-page.
- `QA_ACCEPTANCE_CHECKLIST.md`: checklist nghiệm thu trước khi launch.
- `MEMBERSHIP_SYSTEM_MASTER.md`: kiến trúc membership, flow join/pay/magic-link, khóa route và roadmap phase 2.
- `MEMBERSHIP_DB_SCHEMA.sql`: schema DB chuẩn cho backend membership (users/payments/sessions/content_access/magic_links).

## Ghi chú

- Membership MVP đã được dựng trên static routes để test flow end-to-end; phase 2 sẽ chuyển logic auth/payment sang backend.
