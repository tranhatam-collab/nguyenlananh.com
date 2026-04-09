# ARTICLE_IMAGE_SEO_SYSTEM.md

Version: 1.0  
Status: GLOBAL IMAGE SEO LOCK  
Purpose: khóa quy chuẩn hình ảnh minh họa cho toàn bộ bài viết trên Nguyenlananh.com.

---

## 1. Mục tiêu

Từ thời điểm này, mọi bài viết public trên site đều phải có:

- 1 ảnh minh họa chính
- 1 mô tả SEO cho ảnh
- 1 alt text đúng ngữ cảnh
- 1 caption ngắn nếu hiển thị trong bài
- 1 hướng OG image nếu cần social sharing

Website này không dùng ảnh cho có.

Ảnh phải làm đúng 4 việc:
- giữ mood thương hiệu
- mở chiều cảm nhận cho bài viết
- hỗ trợ SEO hình ảnh
- làm bài viết hoàn chỉnh hơn khi lên live

---

## 2. Visual direction lock

Hình ảnh trên Nguyenlananh.com phải:

- tĩnh
- sâu
- sáng nhưng không nhợt
- tối giản nhưng không vô hồn
- có chất đời sống thật

Không dùng:
- stock photo quá rẻ tiền
- ảnh cười tạo động lực kiểu coaching
- icon thần bí, luân xa lòe loẹt, hiệu ứng năng lượng rối mắt
- ảnh quá minh họa literal nếu làm mất chiều sâu

Ưu tiên:
- không gian sống thật
- vật thể thật
- bàn tay, góc phòng, ánh sáng, cửa sổ, lá, chổi, bàn viết, mặt bàn, bóng đổ, chuyển động nhẹ
- ảnh có khoảng thở để đặt text nếu cần

---

## 3. Required fields cho mỗi bài

Mỗi bài phải có ít nhất các field sau:

- `featured_image`
- `featured_image_alt`
- `featured_image_caption`
- `featured_image_seo_filename`
- `image_prompt_brief`
- `og_image`
- `og_image_alt`

Nếu CMS chưa có, phải bổ sung trước khi scale content sâu.

---

## 4. Quy tắc SEO hình ảnh

### 4.1. Alt text

Alt text phải:
- mô tả đúng cảnh hoặc ý nghĩa chính
- ngắn gọn, rõ, tự nhiên
- không nhồi keyword
- không bắt đầu bằng `ảnh của`

Ví dụ đúng:
- `Ánh sáng sớm chiếu vào một góc bàn và quyển sổ đang mở`
- `Một người đứng yên trong căn phòng yên tĩnh, gợi cảm giác nhìn lại chính mình`

### 4.2. SEO filename

Dùng không dấu, chữ thường, nối bằng `-`.

Ví dụ:
- `am-thanh-tu-than-tieng-hat-tro-ve.jpg`
- `hanh-trinh-di-vao-ben-trong-goc-phong-sang-som.jpg`

### 4.3. Caption

Caption không bắt buộc hiển thị ở mọi bài, nhưng nếu dùng phải:
- ngắn
- không giải thích thừa
- cùng giọng thương hiệu

Ví dụ:
- `Một khoảng lặng cũng có thể là điểm bắt đầu.`

### 4.4. OG image

OG image không cần giống featured image 100%, nhưng phải cùng mood.

OG nên ưu tiên:
- bố cục thoáng
- tương phản đủ để hiển thị social
- headline ngắn nếu có text

---

## 5. Workflow bắt buộc

Mỗi bài trước khi publish phải đi qua:

1. Chốt headline / excerpt
2. Viết image brief
3. Tạo hoặc chọn hình minh họa
4. Gắn alt text + filename + caption
5. Kiểm tra hiển thị mobile
6. Kiểm tra OG preview

---

## 6. Template image brief chuẩn

Mỗi bài phải có một block brief theo mẫu:

- `image_goal`: ảnh này cần gợi cảm giác gì
- `scene`: cảnh hoặc vật thể chính
- `visual_tone`: sáng / be / yên / có chiều sâu
- `avoid`: những gì không được xuất hiện
- `alt_text`: alt đề xuất
- `caption`: caption đề xuất
- `seo_filename`: tên file đề xuất
- `og_direction`: hướng ảnh chia sẻ mạng xã hội

---

## 7. Áp dụng cho content handoff

Mọi file handoff bài viết từ nay phải có phần:

- `IMAGE BRIEF`
- `ALT TEXT`
- `CAPTION`
- `SEO FILENAME`
- `OG IMAGE DIRECTION`

Nếu thiếu 1 trong 5 phần này, chưa coi là handoff hoàn chỉnh.
