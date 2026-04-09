# CONTENT_AUDIT_2026-04-09.md

Date: 2026-04-09  
Status: INTERNAL REVIEW BEFORE PR  
Purpose: ghi nhận hiện trạng độ sâu nội dung trước khi mở vòng viết tiếp và trước khi PR.

---

## 1. Kết quả rà nhanh toàn bộ bài viết hiện có

Phạm vi audit:
- chỉ tính các bài trong `bai-viet/*`
- loại trừ category hub pages và route template `[slug]`

Tổng số bài đang có: `31`

Phân nhóm theo độ dài tương đối trong phần nội dung chính:
- `5` bài đã ở mức `full` (`>= 400` từ)
- `6` bài ở mức `medium` (`200 - 399` từ)
- `20` bài còn `thin` (`< 200` từ)

Kết luận quan trọng:

Website đã có cấu trúc route khá đầy, nhưng chiều sâu nội dung chưa đồng đều. Hiện trạng đúng hơn là:
- hệ nội dung đã mở khung khá rộng
- một số bài đã có hồn và có chiều sâu
- nhiều bài vẫn đang ở mức placeholder mở rộng, chưa đạt chuẩn publish mạnh theo positioning đã khóa

---

## 2. Tình trạng của 10 bài nền P0

### Đã đủ chiều sâu tương đối

- `Đi vào bên trong - giải mã những gì đang vận hành bạn`

### Đang mỏng, cần ưu tiên viết lại full copy

- `Điều đáng tiếc nhất khi kết thúc một kiếp sống`
- `Hành trình đi vào bên trong`
- `Trưởng thành thông qua môn học dọn dẹp`
- `Cái chổi`
- `Quét lá và việc học`
- `Giá trị nào là vĩnh cửu trước sóng gió`
- `Đầu tư bản thân - học tập nhận thức cao hơn`
- `Đầu tư hiện tại - tự do tương lai`
- `Kiến tạo một đời sống ý nghĩa`

Kết luận:
- mới có `1/10` bài nền đang ở mức đủ lực
- `9/10` bài nền vẫn cần nâng từ bản ngắn sang bản full copy đúng tinh thần brand

---

## 3. Những bài đã có thể dùng làm mốc tone

Các bài sau đang là mốc tham chiếu tốt hơn cho vòng viết tiếp:

- `Đi vào bên trong - giải mã những gì đang vận hành bạn`
- `Khởi từ tâm`
- `Khi môi trường không còn phù hợp`
- `Nhật ký 37 ngày làm chủ - ngày 1`
- `Ngôi nhà thứ hai nơi bạn đang sống mỗi ngày`

Điểm mạnh chung:
- câu chữ có chiều nội tâm
- không hô hào
- có tiến trình nhận ra
- đọc ra được tinh thần `đi vào bên trong -> nhìn thấy -> điều chỉnh -> đi tiếp`

---

## 4. Những khoảng trống nội dung cần bù ngay

1. Các bài P0 chưa đủ chiều sâu  
Đây là khoảng trống lớn nhất vì nó ảnh hưởng trực tiếp đến định vị toàn site.

2. Cụm `lao động - sáng tạo - dòng sống` chưa có một bài thật sự mạnh  
Nhiều bài đang có ý đúng nhưng còn quá ngắn để tạo dấu ấn signature.

3. Cụm `âm thanh tự thân` chưa có mặt trong hệ  
Ý tưởng rất hợp tinh thần web, nhưng hiện vẫn chưa được map vào queue chính thức.

4. Tỷ lệ bài `mỏng` còn cao  
Nếu PR lúc này mà không khóa rõ trạng thái, rất dễ ngộ nhận là đã hoàn thiện content depth.

---

## 5. Thứ tự ưu tiên đề xuất trước khi PR lớn về content

### Priority A - bắt buộc nâng ngay

1. Điều đáng tiếc nhất khi kết thúc một kiếp sống
2. Hành trình đi vào bên trong
3. Trưởng thành thông qua môn học dọn dẹp
4. Cái chổi
5. Quét lá và việc học
6. Giá trị nào là vĩnh cửu trước sóng gió
7. Đầu tư bản thân - học tập nhận thức cao hơn
8. Đầu tư hiện tại - tự do tương lai
9. Kiến tạo một đời sống ý nghĩa

### Priority B - khóa cụm mới trước khi viết

10. Âm thanh tự thân: khi giọng hát trở thành một cách trở về
11. Cất giọng và đi qua nỗi sợ bị phán xét

### Priority C - mở rộng sau khi P0 đủ lực

12. Kết nối sáng tạo
13. Dòng chảy sáng tạo - dòng chảy sự sống
14. Hồi sinh sự sống từ sự sáng tạo nguyên sơ
15. Kết nối linh hồn vật thể

---

## 6. Quy ước dùng cho vòng viết tiếp

- không thêm category mới
- không viết bài theo hướng `coach style`
- không dùng claim y khoa, trị liệu, chữa bệnh như lời hứa
- giữ nhịp câu chậm, thật, có lực
- mỗi bài phải có ít nhất:
  - một ý nền rõ
  - một tiến trình nhận ra
  - một bước thực hành nhỏ
  - internal links đúng hub logic

---

## 7. Chốt cho vòng tiếp theo

Trước khi viết file publish cho team dev, nên duyệt theo đúng thứ tự:

1. Duyệt hướng cụm `âm thanh tự thân`
2. Duyệt danh sách 9 bài P0 cần nâng full copy
3. Chốt thứ tự viết lại
4. Sau đó mới xuất file content handoff cho team dev lên bài
