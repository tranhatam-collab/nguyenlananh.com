# MEMBERSHIP_DEEP_CONTENT_ROADMAP.md

Version: 1.0  
Status: READY FOR DEV + CONTENT + CMS  
Purpose: khóa toàn bộ lộ trình nội dung chuyên sâu cho thành viên sau khi đăng ký, đúng logic của Nguyenlananh.com.

---

## 1. Mục tiêu file

File này dùng để team dev, content, CMS và vận hành nhìn cùng một bản đồ cho lớp `members/deep`.

Mục tiêu không phải thêm thật nhiều topic rời rạc.

Mục tiêu đúng là:

- xây một hệ nội dung chuyên sâu đi theo hành trình sau đăng ký
- giữ cho thành viên không bị cụt sau khi vào dashboard
- mở dần từ cá nhân -> thân tâm -> gia đình -> trẻ em
- giữ đúng tinh thần web: thật, sâu, bình tĩnh, có đường đi tiếp, có hành động nhỏ nhưng thật

---

## 2. Vấn đề hệ thống hiện tại

Hiện deep layer mới có một chuyên đề mở đầu là `Âm thanh tự thân và tiếng nói bên trong`.

Điều này tốt để mở một cánh cửa rất sống, nhưng chưa đủ để tạo thành một lộ trình hoàn chỉnh cho thành viên.

Các khoảng trống lớn nhất đang thiếu là:

- thiếu một chuyên đề gốc để thành viên nhìn ra vòng lặp của chính mình
- thiếu một chuyên đề đi vào hệ gia đình và những điều đang truyền qua nhau
- thiếu một chuyên đề dành riêng cho cách đồng hành cùng trẻ em mà không làm gãy tự nhiên của trẻ

Nếu không bổ sung 3 phần này, membership sẽ dễ bị hiểu là:

- một nơi đọc bài hay
- một lớp trải nghiệm riêng lẻ
- một hệ chưa đủ chiều sâu để giữ người dùng quay lại lâu dài

---

## 3. Kiến trúc deep layer hoàn chỉnh

Thứ tự ưu tiên nên khóa như sau:

### Tầng 1 - Cá nhân

1. `Bản đồ vòng lặp và điểm nghẽn sâu`
2. `Âm thanh tự thân và tiếng nói bên trong`

### Tầng 2 - Gia đình

3. `Gia đình và những điều đang truyền qua nhau`

### Tầng 3 - Trẻ em

4. `Đồng hành cùng trẻ em mà không làm gãy tự nhiên`

---

## 4. Logic lộ trình sau đăng ký

### Giai đoạn 1 - Nhìn ra mình

Thành viên cần nhìn thấy:

- vòng lặp nào đang lặp lại
- điểm nghẽn nào đang vận hành mình
- nơi nào trong thân tâm luôn co lại, nín lại, né tránh

Chuyên đề dùng:

- `Bản đồ vòng lặp và điểm nghẽn sâu`
- `Âm thanh tự thân và tiếng nói bên trong`

### Giai đoạn 2 - Mở lại thân tâm và dòng sống

Thành viên cần đi từ nhận ra sang trải nghiệm sống:

- hơi thở
- giọng nói
- hiện diện
- cảm giác an toàn khi được là mình

Chuyên đề dùng:

- `Âm thanh tự thân và tiếng nói bên trong`

### Giai đoạn 3 - Nhìn lại hệ gia đình

Khi đã có chút nền ở cá nhân, thành viên mới đủ vững để nhìn về:

- gốc rễ của phản xạ sống
- vai trò mình đang mang trong gia đình
- những điều được truyền qua im lặng, phán xét, kiểm soát, hy sinh

Chuyên đề dùng:

- `Gia đình và những điều đang truyền qua nhau`

### Giai đoạn 4 - Đồng hành với trẻ em

Đây không phải bước mở đầu.

Chỉ khi người lớn bắt đầu nhìn lại mình và nhìn lại hệ gia đình, họ mới có thể đi vào câu hỏi:

- mình đang dạy trẻ điều gì bằng chính cách sống của mình
- làm sao đi cùng trẻ mà không làm gãy tự nhiên của trẻ
- làm sao xây một không gian lớn lên lành mạnh hơn

Chuyên đề dùng:

- `Đồng hành cùng trẻ em mà không làm gãy tự nhiên`

---

## 5. 4 chuyên đề khóa trong deep layer

### 5.1. Chuyên đề 1

Tên:
`Bản đồ vòng lặp và điểm nghẽn sâu`

Vai trò:
- chuyên đề gốc của toàn bộ deep layer
- giúp thành viên gọi tên đúng mô thức, trigger, phản ứng, và hậu quả
- là cánh cửa bắt buộc trước khi đi sâu vào các chuyên đề khác

Route:
- `/members/deep/ban-do-vong-lap/`

Public teaser về sau:
- `Những vòng lặp bạn chưa gọi tên`

### 5.2. Chuyên đề 2

Tên:
`Âm thanh tự thân và tiếng nói bên trong`

Vai trò:
- mở lại sự hiện diện qua giọng hát, hơi thở, cảm nhận
- giúp thành viên đi từ nín lại sang cất giọng rất nhẹ

Route:
- `/members/deep/am-thanh-tu-than/`

Public teaser hiện đã có:
- `Âm thanh tự thân: khi một tiếng hát trở thành cách trở về`

### 5.3. Chuyên đề 3

Tên:
`Gia đình và những điều đang truyền qua nhau`

Vai trò:
- giúp thành viên nhìn lại hệ gia đình như môi trường đầu tiên tạo nên phản xạ sống
- mở hướng làm việc với cha mẹ, bạn đời, người thân mà không đổ lỗi và không lãng mạn hóa gia đình

Route:
- `/members/deep/gia-dinh-va-goc-re/`

Public teaser về sau:
- `Gia đình không chỉ là nơi ta lớn lên`

### 5.4. Chuyên đề 4

Tên:
`Đồng hành cùng trẻ em mà không làm gãy tự nhiên`

Vai trò:
- giúp người lớn đồng hành với trẻ em từ quan sát, môi trường, nhịp sống, vật thể, trò chơi và sự hiện diện
- đi đúng tinh thần web: không chỉ dạy, mà sống cùng, làm cùng, quan sát cùng

Route:
- `/members/deep/tre-em-va-khong-gian-lon-len/`

Public teaser về sau:
- `Điều trẻ em cần không chỉ là dạy đúng`

---

## 6. Thứ tự mở chuyên đề

Thứ tự bắt buộc:

1. `Bản đồ vòng lặp và điểm nghẽn sâu`
2. `Âm thanh tự thân và tiếng nói bên trong`
3. `Gia đình và những điều đang truyền qua nhau`
4. `Đồng hành cùng trẻ em mà không làm gãy tự nhiên`

Lý do:

- chưa nhìn ra mình thì chưa đủ nền để làm việc với gia đình
- chưa có chút hiện diện trong thân tâm thì dễ nhìn gia đình bằng phản ứng cũ
- chưa nhìn lại hệ gia đình thì rất dễ lặp lại lên trẻ em

---

## 7. Thiết kế nội dung chuẩn cho mỗi chuyên đề

Mỗi chuyên đề trong `members/deep` phải có đúng 6 lớp:

1. Intro mở chủ đề
2. 4 module nội dung chính
3. 1 module lưu ý / giới hạn / khi cần hỗ trợ chuyên môn
4. `Thực hành hôm nay`
5. `Gợi ý phản tư`
6. CTA quay lại `Practice`, `Experience`, `Dashboard`

Không được làm:

- thư viện lý thuyết dài và rời rạc
- bài đọc không có thực hành
- nội dung chỉ truyền cảm hứng mà không có bước tiếp

---

## 8. 3 chuyên đề mới cần triển khai ngay

### 8.1. Bản đồ vòng lặp và điểm nghẽn sâu

Thiếu gì nếu chưa có:
- thành viên không biết bắt đầu từ đâu
- mọi thực hành phía sau dễ trở thành cảm hứng ngắn hạn

Điểm cốt lõi:
- trigger
- phản ứng
- cách mình tự bảo vệ
- giá mình đang trả
- bước nhỏ để cắt nhịp lặp

### 8.2. Gia đình và những điều đang truyền qua nhau

Thiếu gì nếu chưa có:
- hệ membership không đi tới gốc các phản xạ sống
- người dùng dễ quay lại nhìn mọi vấn đề như chuyện riêng cá nhân

Điểm cốt lõi:
- vai trò trong gia đình
- trung thành vô thức
- phán xét, im lặng, kiểm soát, hy sinh
- học cách nhìn mà không đổ lỗi

### 8.3. Đồng hành cùng trẻ em mà không làm gãy tự nhiên

Thiếu gì nếu chưa có:
- hệ thống chưa mở được hướng giáo dục và nuôi dưỡng thế hệ sau
- website chưa kết nối trọn vẹn với trục `đời sống thật -> gia đình -> trẻ em`

Điểm cốt lõi:
- người lớn phải nhìn lại mình trước khi sửa trẻ
- hứng thú đến trước thành tích
- môi trường sống là người thầy vô hình
- vật thể, dọn dẹp, âm thanh, lao động có thể trở thành sân chơi trưởng thành

---

## 9. Gợi ý phát triển phase sau

Sau 4 chuyên đề lõi này, hệ members có thể mở tiếp:

- `Môi trường sống như một thân thể thứ hai`
- `Kỷ luật nhẹ và nhịp sống mới`
- `Lao động, vật thể và sự trưởng thành`
- `Đầu tư cho chính mình mà không chạy theo ảo tưởng đổi đời`

Nhưng hiện tại chưa nên mở trước khi 4 chuyên đề lõi này hoàn chỉnh.

---

## 10. UI / UX lock cho team dev

### Trang `/members/deep/`

Phải thể hiện rõ:

- đây là lộ trình nội dung
- có thứ tự đi vào
- có chuyên đề đang mở
- có chuyên đề tiếp theo

Nên có:

- 1 block `Bắt đầu từ đâu`
- 4 cards chuyên đề
- 1 block `Lộ trình 90 ngày`

### Từng route chuyên đề

Phải có:

- breadcrumb về `Deep Layer`
- headline rõ
- ảnh minh họa tĩnh đúng tinh thần
- `Thực hành hôm nay`
- `Gợi ý phản tư`
- `Lưu ý`
- `Chuyên đề liên quan`

---

## 11. CMS / SEO / image notes

Mặc dù `members/deep/*` là `noindex`, team vẫn phải chuẩn hóa content như một sản phẩm thật.

Mỗi chuyên đề cần:

- title
- description
- hero image
- alt text
- caption nếu cần
- image prompt brief
- route EN mirror

Các bài teaser public về sau phải nối sang membership bằng CTA mềm:

- `Mở khóa toàn bộ hành trình`
- `Bắt đầu từ đây`
- `Khi bạn sẵn sàng, hãy bước`

---

## 12. Kết luận

Deep layer sau đăng ký không nên phát triển kiểu ngẫu hứng.

Nó phải đi theo logic:

- nhìn ra mình
- mở lại thân tâm
- nhìn lại gia đình
- đi cùng trẻ em theo cách mới

Nếu làm đúng, membership sẽ không chỉ là quyền truy cập.

Nó sẽ trở thành một hệ học từ đời sống thật, đủ sâu để giữ người ở lại, đủ rõ để dẫn họ đi tiếp, và đủ đồng bộ với toàn bộ tinh thần của Nguyenlananh.com.
