# NGUYENLANANH_FULL_SITE_CONTENT_STRUCTURE.md

Version: 1.1  
Status: CONTENT STRUCTURE LOCK  
Purpose: Map toàn bộ nội dung site theo hub, series, thứ tự publish, và internal linking.

---

## 1. Hubs (lock)

- `di-vao-ben-trong`
- `gia-tri-noi-tai`
- `mon-hoc-don-dep`
- `lao-dong-sang-tao`
- `dau-tu-ban-than`
- `du-an-nhat-ky`

---

## 2. Priority Publish Queue

## P0 - 10 bài bắt buộc
1. Điều đáng tiếc nhất khi kết thúc một kiếp sống
2. Hành trình đi vào bên trong
3. Đi vào bên trong - giải mã những gì đang vận hành bạn
4. Trưởng thành thông qua môn học dọn dẹp
5. Cái chổi
6. Quét lá và việc học
7. Giá trị nào là vĩnh cửu trước sóng gió
8. Đầu tư bản thân - học tập nhận thức cao hơn
9. Đầu tư hiện tại - tự do tương lai
10. Kiến tạo một đời sống ý nghĩa

## P1 - 10 bài mở rộng
11. Môn học dọn dẹp tổng quan
12. Kết nối linh hồn vật thể
13. Kết nối sáng tạo
14. Hồi sinh sự sống từ sự sáng tạo nguyên sơ
15. Dòng chảy sáng tạo - dòng chảy sự sống
16. Mình đang đi con đường gì
17. Giá trị cuộc đời bạn đáng giá bao nhiêu
18. Từ 55 triệu đến tự do
19. Học tập - sáng tạo - trưởng thành
20. Dự án BƯỚC

## P2 - 10 bài nâng chiều sâu
21. Dự án 37 ngày
22. Những vòng lặp bạn chưa gọi tên
23. Khi bên ngoài vẫn ổn nhưng bên trong vỡ
24. Môi trường sống phản chiếu điều gì
25. Sự trì hoãn như một tín hiệu
26. Lao động như một bài học hiện diện
27. Điều gì còn lại sau khủng hoảng
28. Kỷ luật nhẹ nhàng nhưng đều đặn
29. Điểm nghẽn sâu và cách đi qua
30. Bắt đầu lại bằng một bước thật

## P3 - Cụm chuyên sâu âm thanh tự thân (pending approval)
31. Âm thanh tự thân: khi một tiếng hát trở thành cách trở về
32. Cất giọng và đi qua nỗi sợ bị phán xét
33. Âm thanh, hơi thở và sự hiện diện trong thân thể
34. Không hát để đúng. Hát để thật
35. Nhật ký 7 ngày mở lại tiếng nói bên trong
36. Cách làm việc an toàn với cảm xúc khi thực hành âm thanh tự thân

Ghi chú khóa:
- Không tạo hub mới.
- Dùng hub hiện có: `lao-dong-sang-tao` và `di-vao-ben-trong`.
- Giữ ngôn ngữ như trải nghiệm tự thân và thực hành sống, không đi theo hướng tuyên bố trị liệu hay chữa bệnh.
- Bài `Âm thanh tự thân: khi một tiếng hát trở thành cách trở về` là bản public ngắn, ưu tiên kéo về `join`.
- Chuyên đề sâu hơn được triển khai trong membership route `/members/deep/am-thanh-tu-than/` và mở nhánh `ca-nhan`, `gia-dinh`, `tre-em` ở phase sau.

## P4 - Membership deep roadmap (locked)
37. Bản đồ vòng lặp và điểm nghẽn sâu
38. Gia đình và những điều đang truyền qua nhau
39. Đồng hành cùng trẻ em mà không làm gãy tự nhiên

Ghi chú khóa:
- đây là các chuyên đề thành viên, không phải bài public indexable
- route đang dùng:
  - `/members/deep/ban-do-vong-lap/`
  - `/members/deep/gia-dinh-va-goc-re/`
  - `/members/deep/tre-em-va-khong-gian-lon-len/`
- thứ tự vào chuyên đề phải theo roadmap trong `members/deep`

---

## 3. Internal Linking Rules (bắt buộc)

Mỗi bài phải có:
- 1 link cùng hub
- 1 link sang hub khác
- 1 link sang page chính (`/hanh-trinh/` hoặc `/chuong-trinh/`)
- 1 CTA cuối bài (`/lien-he/`)

---

## 4. Related Posts Logic

Ưu tiên theo thứ tự:
1. Cùng hub, cùng series
2. Cùng hub, khác series
3. Hub bổ sung (cross-hub)

Hiển thị: 3 bài liên quan / bài viết.

---

## 5. CTA Mapping Theo Giai Đoạn Đọc

- Early: `Đọc hành trình`, `Xem phương pháp`
- Mid: `Tìm con đường của mình`, `Bắt đầu từ đây`
- Deep: `Xem chương trình`, `Liên hệ đồng hành`

---

## 6. Category Page Composition

Mỗi category page gồm:
- Intro 80-140 từ
- 1 bài pillar
- 2 bài signature
- 3-6 bài thực hành
- CTA về `/lien-he/`

---

## 7. Publish Workflow

1. Draft content
2. Tone review
3. SEO field review
4. Internal link review
5. CTA review
6. Publish
