# NGUYENLANANH CONTENT SYSTEM - 99 NGAY

Version: 1.0  
Date: 2026-04-17  
Status: EXECUTION READY  
Owner: Team 2 (Content + SEO + AI)  
Primary source: `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`  

---

## 1. Mục đích

Tài liệu này là content system 99 ngày cho `nguyenlananh.com`, dùng để:

- đăng bài đều theo lịch
- giữ một logic viết thống nhất cho cả team
- giúp AI viết không lệch giọng
- tạo nhịp SEO organic mà không phá tinh thần nội dung

Tài liệu này không thay thế SSOT.  
Nếu có mâu thuẫn, ưu tiên `NGUYENLANANH_MASTER_WEBSITE_SPEC.md`.

---

## 2. Ghi chú quan trọng trước khi triển khai

Khối nội dung dưới đây rất phù hợp để làm editorial calendar và AI generation source.

Tuy nhiên:

- trong file này, 10 bài ở phần mở đầu vẫn được giữ như `core notes` và topic source
- bản full publish-ready của 10 bài mở đầu đã nằm ở `NGUYENLANANH_LAUNCH_CONTENT_PACK_2026-04-17.md`
- một số tiêu đề đang khác với backlog cũ đã có trong repo
- trước khi dùng làm backlog chính, Team 2 phải quyết định rõ: `giữ backlog cũ` hay `chuyển sang series 99 ngày`

Trong lúc chưa thay thế chính thức:

- dùng file này như lịch biên tập và source để viết mới
- lấy launch pack làm nguồn publish cho 10 bài đầu
- không tự xóa các title cũ trong `CONTENT_BACKLOG.md`

---

## 3. Bộ 10 bài mở đầu

Đây là 10 bài mở đầu dùng để:

- khóa giọng cho toàn series
- làm mẫu cho SEO + AI + CMS
- làm nguồn cho 10 bài đầu đã được viết full ở launch pack

## Bài 1

### H1

`Bạn không thiếu kiến thức, bạn thiếu sự rõ ràng`

### Meta Title

`Bạn không thiếu kiến thức | Nguyễn Lan Anh`

### Meta Description

`Bạn không thiếu thông tin, bạn thiếu sự rõ ràng về cách mình đang sống và quyết định mỗi ngày.`

### Core note

Bạn đọc rất nhiều. Bạn hiểu nhiều thứ. Nhưng khi cần quyết định, bạn vẫn lúng túng.

Không phải vì bạn thiếu kiến thức.  
Mà vì bạn không biết kiến thức nào đang thực sự liên quan đến cuộc đời mình.

Sự rõ ràng không đến từ việc đọc thêm.  
Nó đến từ việc dừng lại và nhìn vào chính cách bạn đang sống.

## Bài 2

### H1

`Bạn đang sống theo thói quen, không phải lựa chọn`

### Meta Title

`Sống theo thói quen hay lựa chọn?`

### Meta Description

`Phần lớn cuộc sống của bạn được quyết định bởi thói quen, không phải bởi ý thức.`

### Core note

Bạn nghĩ mình đang chọn.  
Nhưng thật ra bạn chỉ đang lặp lại.

Bạn thức dậy, làm việc, phản ứng, và kết thúc ngày giống hôm qua.

Không có gì sai.  
Nhưng nếu bạn không nhận ra điều này, bạn sẽ sống cả đời trong một vòng lặp.

## Bài 3

### H1

`Không phải bạn không giỏi, bạn chỉ đang sống sai chỗ`

### Meta Title

`Bạn không kém | bạn sai môi trường`

### Meta Description

`Bạn không thất bại, bạn chỉ đang ở sai môi trường để phát triển.`

### Core note

Một cái cây không lớn không phải vì nó yếu.  
Mà vì đất không phù hợp.

Con người cũng vậy.  
Bạn không cần cố giỏi hơn.  
Bạn cần tìm đúng nơi mình có thể sống đúng.

## Bài 4

### H1

`Bạn không mệt vì làm nhiều, bạn mệt vì sống sai nhịp`

### Meta Title

`Vì sao bạn luôn mệt?`

### Meta Description

`Mệt mỏi không đến từ công việc, mà từ nhịp sống không phù hợp.`

## Bài 5

### H1

`Bạn không cần thay đổi cuộc đời, bạn cần hiểu nó`

## Bài 6

### H1

`Điều bạn đang tránh chính là điều bạn cần nhìn`

## Bài 7

### H1

`Bạn không mất phương hướng, bạn chưa từng có hướng`

## Bài 8

### H1

`Bạn không thiếu động lực, bạn thiếu sự thật`

## Bài 9

### H1

`Không phải ai cũng cần phát triển, có người cần dừng lại`

## Bài 10

### H1

`Cuộc đời bạn không cần tối ưu, chỉ cần đúng`

## Ghi chú sử dụng

Bộ 10 bài trên đủ tốt để:

- khóa voice
- mở organic cluster đầu tiên
- tạo trust ban đầu

Nhưng để publish thật, mỗi bài vẫn phải đi qua:

- full draft
- SEO check
- internal link check
- human tone review

---

## 4. Prompt nền cho AI viết bài

Prompt này dùng làm bản ngắn gọn, có thể dán trực tiếp cho AI:

```text
Write a Vietnamese article for nguyenlananh.com.

Rules:
- Vietnamese first
- Calm, reflective tone
- No marketing language
- No motivation language
- No coaching tone
- No promises of change

Structure:
- Title (6–10 words)
- Subline (1–2 sentences)
- 6–10 short paragraphs
- Final closing sentence

Content:
- Focus on inner clarity
- Focus on real life confusion
- Focus on awareness, not advice

Style:
- Simple
- Deep
- Quiet
- Human
- Honest

Avoid:
- inspiration
- transformation
- breakthrough
- success
- healing
```

---

## 5. Cấu trúc toàn bộ 99 ngày

99 bài chia thành 9 nhóm.  
Mỗi nhóm 11 bài.

1. Nhận ra mình đang sống sai
2. Những điều bạn luôn tránh
3. Nhận thức về bản thân
4. Công việc và ý nghĩa sống
5. Cảm xúc và nội tâm
6. Quan hệ và con người
7. Thói quen và nhịp sống
8. Sự thật khó chấp nhận
9. Đi vào bên trong và chuyển hóa

---

## 6. Nguyên tắc viết cho toàn bộ 99 bài

Mỗi bài:

- 600-900 chữ
- 6-10 đoạn
- 1 câu kết mạnh nhưng không gồng
- không giải pháp
- không dạy
- không kết luận ép

Mỗi bài phải đọc như:

- một người thật đang nhìn lại
- không giảng giải
- không tư vấn
- không cố truyền động lực

---

## 7. 99 chủ đề

## Nhóm 1 - Nhận ra mình đang sống sai

1. Bạn không thiếu kiến thức, bạn thiếu sự rõ ràng
2. Bạn đang sống theo thói quen, không phải lựa chọn
3. Bạn không kém, bạn chỉ đang ở sai chỗ
4. Bạn không bận, bạn đang lạc hướng
5. Bạn không thiếu thời gian, bạn thiếu ưu tiên
6. Bạn không sai, bạn chưa nhìn đủ
7. Bạn không cần cố gắng hơn, bạn cần dừng lại
8. Bạn không bị tụt lại, bạn đang đi sai nhịp
9. Bạn không thiếu cơ hội, bạn thiếu hiểu mình
10. Bạn không mất phương hướng, bạn chưa từng có hướng
11. Bạn không mệt vì cuộc đời, bạn mệt vì cách sống

## Nhóm 2 - Những điều bạn luôn tránh

12. Điều bạn tránh luôn quay lại
13. Bạn không sợ thất bại, bạn sợ nhìn thấy mình
14. Bạn không bận, bạn đang né
15. Bạn sợ dừng lại vì sẽ thấy sự thật
16. Bạn tránh im lặng vì không chịu được suy nghĩ
17. Bạn chạy vì không muốn đối diện
18. Bạn lấp đầy để không thấy trống
19. Bạn cố tốt để không bị bỏ rơi
20. Bạn cố giỏi để không bị xem thường
21. Bạn cố mạnh vì sợ yếu
22. Bạn cố hiểu để không phải cảm nhận

## Nhóm 3 - Nhận thức về bản thân

23. Bạn không phải những gì bạn nghĩ
24. Bạn không phải quá khứ của mình
25. Bạn không phải vai trò của bạn
26. Bạn không phải thành tích
27. Bạn không phải cảm xúc
28. Bạn không phải suy nghĩ
29. Bạn không phải câu chuyện bạn kể
30. Bạn không phải những gì người khác nói
31. Bạn không phải phiên bản bạn đang cố
32. Bạn không phải hình ảnh bạn giữ
33. Bạn là thứ bạn chưa dám nhìn

## Nhóm 4 - Công việc và ý nghĩa

34. Bạn không làm việc sai, bạn sống sai
35. Công việc không làm bạn mệt, cách bạn sống mới làm
36. Bạn không cần công việc tốt hơn, bạn cần hiểu mình
37. Bạn không cần thành công, bạn cần ý nghĩa
38. Công việc chỉ là bề mặt của cuộc đời
39. Bạn không cần làm nhiều, bạn cần làm đúng
40. Bạn không cần đam mê, bạn cần rõ ràng
41. Bạn không cần đổi việc, bạn cần đổi cách nhìn
42. Bạn không cần phát triển, bạn cần ổn định
43. Bạn không cần mục tiêu lớn, bạn cần hướng đúng
44. Bạn không cần hơn người, bạn cần đúng mình

## Nhóm 5 - Cảm xúc

45. Bạn không kiểm soát cảm xúc, bạn né nó
46. Bạn không buồn, bạn đang bị chặn
47. Bạn không yếu, bạn chưa hiểu cảm xúc
48. Bạn không tức giận, bạn đang bị tổn thương
49. Bạn không trống rỗng, bạn đang mất kết nối
50. Bạn không lạnh lùng, bạn đang tự bảo vệ
51. Bạn không vô cảm, bạn đang quá tải
52. Bạn không cần sửa cảm xúc
53. Bạn chỉ cần nhìn nó
54. Cảm xúc không sai
55. Bạn đang phản ứng, không phải cảm nhận

## Nhóm 6 - Quan hệ

56. Bạn không cô đơn, bạn không thật
57. Bạn không thiếu người, bạn thiếu kết nối
58. Bạn không bị hiểu sai, bạn không nói thật
59. Bạn không mất ai, bạn chưa từng có
60. Bạn không cần nhiều người, bạn cần đúng người
61. Bạn không bị bỏ rơi, bạn chưa ở lại
62. Bạn không yêu sai người, bạn chưa hiểu mình
63. Bạn không cần giữ ai
64. Bạn cần giữ mình
65. Quan hệ không khó
66. Bạn đang làm nó khó

## Nhóm 7 - Thói quen và nhịp sống

67. Bạn không thiếu kỷ luật, bạn thiếu nhịp
68. Bạn không cần cố gắng, bạn cần đều
69. Bạn không cần thay đổi lớn
70. Bạn cần thay đổi nhỏ mỗi ngày
71. Bạn không cần động lực
72. Bạn cần thói quen
73. Bạn không cần ép mình
74. Bạn cần hiểu mình
75. Bạn không cần kế hoạch hoàn hảo
76. Bạn cần bắt đầu
77. Bạn không cần nhanh
78. Bạn cần bền

## Nhóm 8 - Sự thật khó chấp nhận

79. Bạn không đặc biệt
80. Bạn không quan trọng như bạn nghĩ
81. Cuộc đời không nợ bạn điều gì
82. Không ai đến để cứu bạn
83. Bạn sẽ sai nhiều lần
84. Bạn sẽ mất nhiều thứ
85. Bạn sẽ không đạt hết
86. Bạn sẽ phải buông
87. Bạn sẽ phải chấp nhận
88. Bạn sẽ phải thay đổi
89. Bạn sẽ phải nhìn lại

## Nhóm 9 - Đi vào bên trong

90. Dừng lại không phải là thua
91. Im lặng không phải là trốn
92. Nhìn vào mình không dễ
93. Nhưng là cần
94. Bạn không cần hiểu hết
95. Chỉ cần bắt đầu
96. Bạn không cần hoàn hảo
97. Bạn cần thật
98. Bạn không cần đi xa
99. Bạn cần đi vào bên trong

---

## 8. Lịch đăng

## Option 1 - Nhanh

- 1 bài mỗi ngày
- hoàn thành trong 99 ngày

## Option 2 - Chuẩn SEO

- 5 bài mỗi tuần
- kéo dài khoảng 20 tuần

Khuyến nghị:

- dùng option 2 nếu cần giữ chất lượng và vòng review
- chỉ dùng option 1 khi AI + editor đã chạy rất ổn

---

## 9. SEO rule cho toàn bộ series

### Title

- 8-12 từ

### Description

- 140-160 ký tự

### URL

- viết thường
- không dấu
- dùng gạch nối

Ví dụ:

- `/ban-khong-thieu-kien-thuc/`

Lưu ý:

- nhiều tiêu đề trong danh sách hiện ngắn hơn cấu hình title chuẩn
- khi publish thật, Team SEO có quyền nới title để đạt 8-12 từ nhưng không làm lệch ý

---

## 10. Chuẩn giọng

Mỗi bài phải:

- đọc như một người thật
- không dạy
- không khuyên
- không kết luận ép

Không được:

- hô hào
- kết bằng lời phán
- dùng ngôn ngữ hype
- hứa hẹn biến đổi

---

## 11. Câu chốt cho toàn series

`Đây không phải nơi để bạn thay đổi.`

`Đây là nơi để bạn nhìn rõ.`

---

## 12. Cách dùng file này với Team 2

### Content

- dùng 99 topic làm calendar
- chọn 10-15 bài đầu làm wave mở

### SEO

- chuẩn hóa meta title và meta description cho từng bài trước khi publish

### AI

- dùng prompt nền ở trên
- viết draft 1 theo topic list

### Human editor

- sửa để bài nghe như người thật, không nghe như AI đang tạo hiệu ứng

---

## 13. Bước tiếp theo gợi ý

Sau file này, ba bước hiệu quả nhất là:

1. Viết full 10 bài đầu tiên hoàn chỉnh
2. Tạo template batch để AI generate đồng bộ
3. Map 99 bài vào CMS content structure

Chỉ khi hoàn tất ba bước đó, hệ content mới thật sự ở trạng thái `go live` bền vững.
