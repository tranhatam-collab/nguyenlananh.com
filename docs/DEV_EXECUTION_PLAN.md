# DEV_EXECUTION_PLAN.md

Version: 1.0  
Input Source: NGUYENLANANH_MASTER_WEBSITE_SPEC.md  
Goal: Chuyển tài liệu chiến lược thành backlog triển khai rõ người làm, rõ đầu ra, rõ điều kiện nghiệm thu.

---

## 1. Team Roles

- `Product/Owner`: khóa scope, duyệt copy, duyệt UX.
- `Tech Lead`: quyết định stack, architecture, coding standards.
- `Frontend Dev`: triển khai UI, responsive, components, accessibility.
- `CMS Dev`: model content, taxonomies, dynamic blocks, editorial workflow.
- `SEO`: metadata, schema, internal link rules, sitemap, robots.
- `Content`: xuất bản 10 bài nền + page trụ cột.
- `QA`: test flow mobile/desktop, CTA, form, link integrity.

---

## 2. Milestones (4 phases)

## Phase 1 - Lock nền (tuần 1)

### Deliverables
- Setup sitemap routes theo spec.
- Setup layout khung: header/footer.
- Setup content model CMS.
- Setup homepage bản static theo 9 sections.
- Setup template bài viết + template chuyên mục.
- Setup trường SEO cơ bản.

### Definition of Done
- Tất cả route chính truy cập được, không 404 nội bộ.
- Mobile menu hoạt động đúng.
- CMS tạo được bài viết với đầy đủ fields bắt buộc.
- Lighthouse mobile tối thiểu 75 cho trang chủ.

---

## Phase 2 - Đưa nội dung lõi lên (tuần 2)

### Deliverables
- Publish 10 bài nền ưu tiên.
- Tạo đầy đủ category pages.
- Tạo page: `/gioi-thieu`, `/hanh-trinh`, `/phuong-phap`, `/chuong-trinh`.
- Cấu hình series hiển thị đúng thứ tự.

### Definition of Done
- 10/10 bài có slug chuẩn, SEO title/description, category, series.
- Mỗi bài có ít nhất 3 internal links theo rule.
- Category pages hiển thị lọc đúng taxonomy.

---

## Phase 3 - Tối ưu chuyển đổi (tuần 3)

### Deliverables
- Contact form tối giản + trạng thái submit thành công/thất bại.
- CTA modules theo ngữ cảnh nội dung.
- Khối bài liên quan, featured series, FAQ.
- Schema: Organization, Person, Website, Article, BreadcrumbList, FAQPage.

### Definition of Done
- Form gửi thành công và có log theo dõi.
- Tỷ lệ click CTA đo được qua analytics event.
- Structured data valid trên Rich Results Test.

---

## Phase 4 - Tối ưu sâu (tuần 4)

### Deliverables
- Tối ưu tốc độ và hình ảnh.
- Hoàn thiện responsive toàn bộ pages.
- Setup analytics + search console.
- Hoàn thiện `sitemap.xml`, `robots.txt`.

### Definition of Done
- Không có lỗi crawl nghiêm trọng.
- Core template pages pass QA checklist.
- Tốc độ mobile ổn định cho trang chủ + bài viết.

---

## 3. Sprint Backlog Gợi Ý

- Sprint 1: Routing + templates + CMS model.
- Sprint 2: Homepage hoàn chỉnh + 4 trang trụ cột.
- Sprint 3: 10 bài nền + series + category pages.
- Sprint 4: SEO/schema + conversion modules + QA/perf.

---

## 4. Risks và cách chặn sớm

- `Risk`: Nội dung đăng trước khi khóa taxonomy.
- `Mitigation`: khóa danh sách category/series trong CMS admin.

- `Risk`: Blog list hiển thị hỗn tạp, lệch định vị.
- `Mitigation`: ưu tiên sort theo pillar -> signature -> practice -> project.

- `Risk`: CTA mang tính bán hàng lộ liễu.
- `Mitigation`: dùng whitelist CTA từ spec, không dùng từ cấm.

- `Risk`: Không đồng nhất tone giữa pages.
- `Mitigation`: checklist tone review trước publish.

---

## 5. Final Handover Checklist

- [ ] Route map đúng sitemap đã khóa.
- [ ] Menu desktop/mobile đúng 6 mục chính.
- [ ] 10 bài nền đã publish + internal links đầy đủ.
- [ ] Schema đầy đủ và valid.
- [ ] Trang pháp lý: privacy, terms, disclaimer có đủ.
- [ ] Contact form hoạt động và có điểm nhận thông tin rõ ràng.
- [ ] Mobile reading experience đạt chuẩn (font, spacing, line-height).
