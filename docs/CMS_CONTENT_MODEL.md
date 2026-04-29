# CMS_CONTENT_MODEL.md

Version: 1.1  
Scope: Bài viết, chuyên mục, series, chương trình, quote, FAQ.

---

## 1. Collections

- `posts`
- `categories`
- `series`
- `programs`
- `quotes`
- `faqs`
- `pages`

---

## 2. Posts Schema

## Required fields
- `title` (string)
- `slug` (string, unique)
- `excerpt` (text)
- `content` (rich text)
- `category` (relation -> categories)
- `tags` (array string)
- `featured_image` (asset)
- `featured_image_alt` (string)
- `featured_image_caption` (string)
- `featured_image_seo_filename` (string)
- `image_prompt_brief` (text)
- `featured` (boolean)
- `pillar_post` (boolean)
- `series_name` (relation -> series)
- `series_order` (number)
- `seo_title` (string)
- `seo_description` (text)
- `og_image` (asset)
- `og_image_alt` (string)
- `published_at` (datetime)
- `updated_at` (datetime)

## Optional fields (đề xuất)
- `reading_time` (number)
- `related_posts` (relation -> posts, max 4)
- `cta_variant` (enum)

## 2A. Launch bilingual article payload

Theo launch pack `NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md`, nếu team cần dựng nhanh luồng VI trước - EN sau, payload tối thiểu là:

- `title_vi`
- `title_en`
- `slug`
- `meta_title`
- `meta_description`
- `subline_vi`
- `subline_en`
- `content_vi`
- `content_en`
- `hero_image`
- `publish_date`
- `category`
- `status`

Khuyến nghị triển khai:

- nếu CMS chưa hỗ trợ localization, map `title_vi -> title`, `subline_vi -> excerpt`, `content_vi -> content`
- nếu CMS có localization, tách `title`, `subline`, `content`, `seo_title`, `seo_description` theo locale thay vì giữ field phẳng
- không bỏ các field SEO và image metadata trong schema gốc chỉ vì có launch payload rút gọn

---

## 3. Category Taxonomy (lock)

- `di-vao-ben-trong`
- `mon-hoc-don-dep`
- `lao-dong-va-sang-tao`
- `gia-tri-noi-tai`
- `dau-tu-ban-than`
- `nhat-ky-hanh-trinh`
- `du-an`

Không tạo category ngoài danh sách lock trong giai đoạn đầu.

---

## 4. Series Taxonomy (lock)

- `series-a-di-vao-ben-trong`
- `series-b-mon-hoc-don-dep`
- `series-c-lao-dong-vat-the-dong-song`
- `series-d-gia-tri-noi-tai`
- `series-e-dau-tu-cho-chinh-minh`
- `series-f-nhat-ky-lam-chu-doi-song`

---

## 5. Homepage Dynamic Blocks

- `featured_posts`: 3-6 bài nổi bật.
- `latest_posts`: 4-8 bài mới.
- `series_blocks`: danh sách series + bài đại diện.
- `featured_programs`: 1-3 chương trình.
- `featured_quote`: 1 quote trọng tâm.
- `faq_items`: 4-8 câu hỏi.

---

## 6. Editorial Rules

- Mỗi post phải có: `category`, `series_name`, `seo_title`, `seo_description`.
- Mỗi post phải có ít nhất 1 ảnh đại diện.
- Mỗi post phải có `featured_image_alt` và `featured_image_seo_filename`.
- Mỗi post handoff phải có image brief rõ để content/dev/SEO dùng cùng một hình.
- Mỗi post phải có tối thiểu 3 liên kết nội bộ:
- 1 bài cùng chuyên mục.
- 1 bài nền tảng.
- 1 page hành trình hoặc chương trình.

---

## 7. Slug Rules

- Không dấu, chữ thường, dùng `-`.
- Độ dài khuyến nghị: dưới 70 ký tự.
- Không đổi slug sau khi publish trừ khi có redirect 301.

---

## 8. API Query Priority (for listing)

Thứ tự ưu tiên khi render list bài viết:
1. `pillar_post = true`
2. `featured = true`
3. `series_order ASC`
4. `published_at DESC`
