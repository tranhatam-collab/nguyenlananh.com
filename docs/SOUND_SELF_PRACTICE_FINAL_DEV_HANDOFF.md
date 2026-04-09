# SOUND_SELF_PRACTICE_FINAL_DEV_HANDOFF.md

Version: 1.0  
Status: FINAL HANDOFF FOR DEV + CONTENT + SEO  
Purpose: bàn giao trọn gói chuyên đề `Âm thanh tự thân` để team dựng route, lên bài, gắn image SEO, và giữ logic thống nhất với Nguyenlananh.com.

---

## 1. Scope phải làm

Team cần triển khai 3 phần:

1. 1 bài public ngắn:
- `/bai-viet/am-thanh-tu-than-khi-mot-tieng-hat-tro-thanh-cach-tro-ve/`

2. 1 featured block trên homepage:
- teaser ngắn + link sang bài public hoặc `join`

3. 1 route locked trong membership:
- `/members/deep/am-thanh-tu-than/`

---

## 2. File nguồn nội dung phải đọc

1. [MEMBERSHIP_TOPIC_SOUND_SELF_PRACTICE_MASTER_PLAN.md](/Users/tranhatam/Documents/New%20project/nguyenlananh.com/docs/MEMBERSHIP_TOPIC_SOUND_SELF_PRACTICE_MASTER_PLAN.md)
2. [PUBLIC_ARTICLE_SOUND_SELF_PRACTICE_FULL_COPY.md](/Users/tranhatam/Documents/New%20project/nguyenlananh.com/docs/PUBLIC_ARTICLE_SOUND_SELF_PRACTICE_FULL_COPY.md)
3. [MEMBERS_DEEP_SOUND_SELF_PRACTICE_FULL_COPY.md](/Users/tranhatam/Documents/New%20project/nguyenlananh.com/docs/MEMBERS_DEEP_SOUND_SELF_PRACTICE_FULL_COPY.md)
4. [ARTICLE_IMAGE_SEO_SYSTEM.md](/Users/tranhatam/Documents/New%20project/nguyenlananh.com/docs/ARTICLE_IMAGE_SEO_SYSTEM.md)

---

## 3. Build order

### Phase A - Content + CMS

- tạo bài public trong CMS
- nhập đủ title, excerpt, content, SEO meta
- tạo featured image theo image brief
- gắn alt text, caption, filename SEO

### Phase B - Homepage

- thêm 1 featured block `Âm thanh tự thân`
- ưu tiên đặt trong cụm bài viết nổi bật hoặc sau khối `Lao động - sáng tạo - dòng sống`
- CTA:
  - `Đọc bài mở đầu`
  - `Mở khóa toàn bộ hành trình`

### Phase C - Membership

- tạo route `/members/deep/am-thanh-tu-than/`
- render hero + 5 module + support blocks
- gắn CTA về `/members/practice/`, `/members/deep/`, `/members/dashboard/`, `/lien-he/`

### Phase D - SEO + QA

- kiểm tra canonical bài public
- kiểm tra alt text ảnh
- kiểm tra filename SEO
- kiểm tra hiển thị mobile
- kiểm tra flow `homepage -> bài public -> join`

---

## 4. Homepage block copy

Headline:

`Âm thanh tự thân`

Copy:

`Không phải để hát cho hay. Mà để nghe ra nơi mình đang nín lại, co lại, và bắt đầu mở lại tiếng nói bên trong.`

Buttons:

- `Đọc bài mở đầu`
- `Mở khóa toàn bộ hành trình`

Links:

- `/bai-viet/am-thanh-tu-than-khi-mot-tieng-hat-tro-thanh-cach-tro-ve/`
- `/join/`

---

## 5. Image requirements bắt buộc

### Public article

Phải có:
- featured image
- alt text
- caption
- seo filename
- og image

### Homepage block

Phải có:
- ảnh hoặc visual background cùng mood với bài public
- không dùng visual khác tông

### Members route

Phải có:
- 1 ảnh hero tĩnh hoặc background image nhẹ
- ưu tiên reuse visual system từ bài public để giữ đồng bộ

---

## 6. SEO rules riêng cho topic này

- không dùng keyword kiểu `chữa bệnh bằng âm thanh`
- không dùng title clickbait kiểu `trị liệu tức thì`
- giữ semantic hướng:
  - âm thanh tự thân
  - tiếng nói bên trong
  - giọng hát như một cách trở về
  - hơi thở, hiện diện, cảm nhận

---

## 7. UI rules riêng cho topic này

- không dùng icon chakra, aura, hiệu ứng phát sáng quá đà
- không dùng visual concert / ca sĩ sân khấu
- không dùng layout nặng marketing
- ưu tiên chữ, khoảng trắng, ảnh tĩnh, các block rõ

---

## 8. QA checklist

- [ ] Bài public đã lên đúng slug
- [ ] Featured image đã có alt text
- [ ] SEO meta bài public đã đủ
- [ ] Homepage block đã hiển thị đúng
- [ ] CTA từ homepage sang bài public hoạt động
- [ ] CTA từ bài public sang `join` hoạt động
- [ ] Route `/members/deep/am-thanh-tu-than/` đã render đúng
- [ ] 5 module đã đủ nội dung
- [ ] Disclaimer đã có trên bài public và members route
- [ ] Không có claim chữa bệnh hoặc trị liệu quá mức

---

## 9. Bilingual note

Ưu tiên thực hiện:
- xuất bản bản `vi` trước
- sau khi duyệt `vi`, mới tạo bản `en-US` mirror

Khi làm EN:
- không dịch literal các khái niệm giàu tính cảm nhận
- giữ tone calm, deep, grounded
- giữ disclaimer tương đương

---

## 10. Definition of done

Chỉ coi là xong khi:

- bài public đã live với hình minh họa chuẩn SEO
- homepage đã có teaser block
- route members deep đã có đủ 5 module
- CTA không cụt
- disclaimer đúng
- visual tone đúng brand

Nếu thiếu phần hình ảnh SEO, chưa coi là handoff hoàn chỉnh.
