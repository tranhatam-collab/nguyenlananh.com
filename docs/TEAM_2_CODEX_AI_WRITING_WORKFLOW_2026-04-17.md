# TEAM 2 CODEX AI WRITING WORKFLOW

Version: 1.0  
Date: 2026-04-17  
Owner: Team 2 (AI + Content + SEO)  
Status: EXECUTION READY  
Primary source: `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`  

---

## 1. Vai trò của Codex AI trong dự án này

Codex AI chịu trách nhiệm:

- rewrite toàn bộ bài viết cũ lệch giọng
- viết toàn bộ bài còn thiếu trong queue đã khóa
- tạo bản nháp có thể đưa thẳng sang vòng review
- không để giọng viết của site bị lệch giữa các bài

Codex AI không tự quyết định lại:

- định vị site
- menu
- tone khóa
- tên 4 trục
- ngôn ngữ khóa của trang Đồng Hành

Các phần đó đã bị khóa trong SSOT.

---

## 2. Bộ nguồn mà Codex AI phải đọc trước khi viết

Theo thứ tự:

1. `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`
2. `TEAM_2_REWRITE_CONTENT_PLAN_2026-04-17.md`
3. `NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md`
4. `NGUYENLANANH_CONTENT_SYSTEM_99_DAYS_2026-04-17.md`
5. `NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md`
6. `CONTENT_BACKLOG.md`
7. `ARTICLE_IMAGE_SEO_SYSTEM.md`
8. `FOUNDATION_ARTICLE_IMAGE_PROMPTS.md`

Nếu thiếu một trong các nguồn trên, không được nhảy thẳng vào viết final.

---

## 3. Các loại tác vụ Codex AI được phép làm

### 3.1. Rewrite

Dùng khi:

- bài cũ có ý đúng nhưng giọng sai
- bài cũ quá dài
- bài cũ giống blog cá nhân hoặc bài truyền cảm hứng

Quy tắc:

- giữ lại trục ý chính
- viết lại từ đầu theo format locked
- không vá từng đoạn rời rạc

### 3.2. Refresh

Dùng khi:

- bài gần đúng
- chỉ cần chỉnh subline, SEO, CTA, internal link

### 3.3. New Write

Dùng khi:

- bài chưa có bản usable
- backlog đã khóa nhưng chưa có draft đạt chuẩn

---

## 4. Guardrails bắt buộc

## Về giọng

- nhẹ
- thấm
- rõ
- không dạy đời
- không giải thích quá nhiều

## Về ngôn ngữ cấm hoặc phải tránh mạnh

- chữa lành
- coaching
- tư vấn
- truyền cảm hứng
- lột xác
- phiên bản tốt hơn
- thức tỉnh
- năng lượng vũ trụ
- chữa bệnh
- đả thông

Nếu cần nhắc tới cảm xúc, thân thể hay hồi phục:

- chỉ viết như trải nghiệm tự quan sát
- không viết như lời khuyên chuyên môn
- không thay thế hỗ trợ y tế hoặc trị liệu

## Về cấu trúc

- mỗi bài phải có H1
- mỗi bài phải có subline
- mỗi bài phải có 5-10 đoạn
- mỗi bài phải có 1 câu kết

---

## 5. Workflow chuẩn cho một bài

1. Chọn bài từ queue đã khóa.
2. Xác định loại tác vụ: `rewrite`, `refresh`, `new`.
3. Xác định hub và reading intent.
4. Xác định CTA cuối bài.
5. Viết outline ngắn 5-10 đoạn.
6. Viết H1 và subline.
7. Viết draft 1.
8. Tạo SEO title, meta description, slug.
9. Gắn internal links.
10. Viết image brief và alt text.
11. Chạy self-review bằng rubric.
12. Bàn giao cho human editor duyệt.

Không bỏ qua bước self-review.

---

## 6. Output package bắt buộc của Codex AI

```md
Title locked:
Task type: rewrite | refresh | new
Hub:
Series name:
Series order:
Primary keyword:
Secondary keywords:
Slug:
SEO title:
SEO description:
CTA variant:

H1:
Subline:

Body:
- Đoạn 1
- Đoạn 2
- Đoạn 3
- Đoạn 4
- Đoạn 5

Conclusion line:

Internal links:
- same hub:
- cross hub:
- page link:
- final CTA:

Featured image brief:
Featured image alt:
Tone check:
SEO check:
Editor note:
```

Codex AI không được trả ra chỉ riêng phần thân bài nếu thiếu metadata và linking.

---

## 7. Cách Codex AI phải nghĩ trước khi viết

Trước mỗi bài, Codex AI phải tự trả lời:

1. Người đọc bài này đang mơ hồ ở điểm nào?
2. Bài này giúp họ nhìn rõ điều gì?
3. Sau khi đọc xong, hướng đi tiếp tự nhiên là gì?
4. Bài này thuộc hub nào?
5. Bài này có đang lặp lại bài khác trong cùng hub không?

Nếu chưa trả lời được 5 câu này, chưa được viết final.

---

## 8. Rubric tự kiểm cho Codex AI

Cho điểm từng mục từ 0 đến 2:

- đúng tinh thần SSOT
- không marketing
- không dạy đời
- không quá nhiều giải thích
- có nhịp đọc nhẹ
- có độ rõ
- có độ sâu
- SEO title tự nhiên
- meta description đúng ý
- CTA cuối bài tự nhiên

Ngưỡng đạt:

- tối thiểu 16/20

Nếu dưới ngưỡng:

- tự viết lại trước khi chuyển human review

---

## 9. Prompt khung cho tác vụ rewrite

```text
Bạn đang rewrite một bài viết cho website nguyenlananh.com.

Mục tiêu:
- giữ đúng tinh thần "đi vào bên trong"
- không marketing
- không chữa lành hóa
- không dạy đời
- không giải thích quá nhiều

Yêu cầu đầu ra:
- H1
- Subline
- 5-10 đoạn ngắn
- 1 câu kết
- SEO title 8-12 từ
- Meta description 140-160 ký tự
- Slug
- 4 internal links gợi ý
- 1 image brief
- 1 alt text

Nếu bản gốc lệch giọng, hãy viết lại từ đầu chứ không vá từng đoạn.
```

---

## 10. Prompt khung cho tác vụ viết bài mới

```text
Bạn đang viết một bài mới cho nguyenlananh.com.

Vai trò của bài:
- là một phần trong hành trình giúp người đọc nhìn rõ cách mình đang sống
- không phải blog cá nhân
- không phải bài truyền cảm hứng
- không phải trang chữa lành
- không phải sales page

Giọng bắt buộc:
- nhẹ
- thấm
- rõ
- không dạy đời
- không khẩu hiệu
- không healing tone

Cấu trúc bắt buộc:
- H1
- Subline
- 5-10 đoạn
- 1 câu kết
- SEO title
- SEO description
- Slug
- Internal links
- Image brief
- Alt text

Khi viết, hãy ưu tiên quan sát thật, diễn đạt ngắn, ít phán quyết, và luôn để lại cho người đọc một bước đi tiếp tự nhiên.
```

## 10A. Prompt locked cho batch bilingual launch

Khi cần ra bài theo đúng format launch pack VI trước, EN sau, dùng prompt này:

```text
Write an article for nguyenlananh.com.

Language:
Vietnamese first, English below.

Rules:
- calm, reflective, human tone
- no marketing
- no coaching
- no motivation language
- no promises

Structure:
- title (6–10 words)
- subline (1–2 sentences)
- 6–10 short paragraphs
- final closing sentence

Focus:
- self-awareness
- life confusion
- internal observation

Avoid:
- success
- transformation
- healing
- inspiration
- advice tone
```

---

## 11. Prompt khung cho tác vụ self-check

```text
Hãy audit lại bài viết này theo 10 tiêu chí:
1. Có bị giảng dạy không?
2. Có bị marketing không?
3. Có đoạn nào quá dài không?
4. Có câu nào giống khẩu hiệu không?
5. H1 có tự nhiên không?
6. Subline có mở đúng bài không?
7. Kết bài có quá mạnh tay không?
8. Meta description có đúng ý bài không?
9. Internal links có hợp logic đọc không?
10. Có chỗ nào nên viết ít đi để bài thấm hơn không?

Nếu có lỗi, sửa trực tiếp và trả lại bản final.
```

---

## 12. Human Review bắt buộc sau AI

Human editor phải kiểm tra:

- có chỗ nào nghe như AI đang cố làm văn không
- có chỗ nào quá tròn trịa, thiếu thật
- có câu nào chung chung đến mức áp vào bài nào cũng đúng
- có đoạn nào đang nói nhiều hơn mức cần thiết
- có đoạn nào đang đẩy người đọc thay vì mở cho họ nhìn

Nếu có một trong các lỗi trên, trả lại AI viết lại.

---

## 13. Khi nào Codex AI phải dừng và hỏi lại

Codex AI phải dừng nếu:

- title locked bị mâu thuẫn giữa nhiều file
- queue bài bị đổi nhưng chưa cập nhật SSOT
- có yêu cầu viết theo giọng mới khác SSOT
- có yêu cầu thêm claim chuyên môn về tâm lý, y tế, trị liệu

Trong các trường hợp còn lại, AI phải tiếp tục làm và bàn giao bản usable.

---

## 14. Quy chuẩn file hóa và bàn giao

Mỗi batch bài phải có:

- danh sách bài đã làm
- trạng thái từng bài
- bài nào rewrite
- bài nào new
- bài nào chờ human review
- bài nào ready for CMS

Trạng thái chuẩn:

- `todo`
- `draft_ai`
- `review_content`
- `review_seo`
- `ready_cms`
- `published`

---

## 15. Definition of Done cho Codex AI

Codex AI hoàn thành trách nhiệm khi:

- toàn bộ bài thiếu đã có draft 1 usable
- toàn bộ bài cũ lệch giọng đã được rewrite
- không còn bài nào thiếu metadata cơ bản
- mỗi bài đều có internal links và CTA
- mỗi bài đều qua self-check

Codex AI chưa hoàn thành nếu chỉ viết phần thân bài mà chưa khóa SEO và handoff.

---

## 16. Chỉ thị cuối

Codex AI không được cố viết hay hơn.

Codex AI phải viết đúng hơn.  
Đúng hơn với:

- tinh thần site
- nhịp đọc của người thật
- sự yên
- sự rõ
- sự thật

Nếu một đoạn nghe quá bóng, giảm xuống.  
Nếu một đoạn nghe quá dạy, bỏ đi.  
Nếu một đoạn nghe như bán giải pháp, viết lại.
