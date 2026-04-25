# NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026

**Project:** nguyenlananh.com  
**Document type:** Master automation, content, product and technical plan  
**Version:** 1.0  
**Status:** Production-ready planning draft  
**Primary language:** Vietnamese  
**Secondary language:** English labels for product, API and dashboard where useful  
**Owner:** Trần Hà Tâm / NguyenLanAnh ecosystem  
**Last updated:** 2026-04-25  

---

## 0. EXECUTIVE LOCK

nguyenlananh.com cần được phát triển thành một **hệ học tập và đồng hành tự động theo nhịp sống**, không chỉ là website bán khóa học. Toàn hệ phải giúp người học đi qua các tầng:

**Đọc công khai → Đăng ký căn bản → Trải nghiệm 7 ngày → Học 30 ngày → Đi sâu 90 ngày → Tích hợp 120 ngày → Đồng hành 1 năm → Hành trình 3 năm → 1:1 khi thật sự cần.**

Nguyên tắc vận hành:

1. Người học phải luôn biết hôm nay cần làm gì.
2. Hệ thống phải tự động nhắc, mở khóa, báo cáo và gợi ý bước tiếp theo.
3. Chuyên gia không phải xử lý mọi người. Chuyên gia chỉ can thiệp ở gói 1:1, mentor, case đặc biệt hoặc khi dữ liệu check-in cho thấy người học cần hỗ trợ sâu.
4. Nội dung phải đủ sâu, không chỉ là bài truyền cảm hứng. Mỗi bài trả phí phải có nhận diện, phân tích, thực hành, câu hỏi check-in và hành động nhỏ.
5. Launch phải gọn trong 30 đến 60 ngày, nhưng kiến trúc phải mở được tới 1 năm và 3 năm.

---

## 1. PRODUCT ARCHITECTURE

### 1.1 Product ladder

| Tầng | Tên | Trạng thái | Mục tiêu chính | Tự động hóa bắt buộc |
|---|---|---|---|---|
| 0 | Public Content | Free public | Tạo niềm tin, SEO, dẫn vào đăng ký | SEO hub, newsletter, CTA |
| 1 | Free Member | Free login | Tạo hồ sơ, học thử, check-in nhẹ | Magic link, onboarding, 14-day nurture |
| 2 | 7-Day Starter | Paid low entry | Tạo trải nghiệm trả phí đầu tiên | Lesson unlock, daily email, report day 7 |
| 3 | 30-Day Foundation | Paid monthly | Hình thành thói quen học và check-in | Daily lesson, weekly report, upgrade trigger |
| 4 | 90-Day Deep Journey | Core paid product | Tạo chuyển hóa có cấu trúc | 90-day automation, monthly report, behavior triggers |
| 5 | 120-Day Integration | Extension | Biến thay đổi thành nếp sống | 30-day integration, roadmap generator |
| 6 | 1-Year Membership | Recurring | Giữ chân, học theo tháng, quý, năm | 365 content, quarterly review, yearly report |
| 7 | 3-Year Journey | Premium long-term | Đồng hành dài hạn, mentor path | 12-quarter roadmap, annual reports |
| 8 | 1:1 / Expert | Application only | Hỗ trợ cá nhân sâu | Application, scheduling, expert notes |

### 1.2 Customer segments

| Segment | Mô tả | Nội dung phù hợp | Offer phù hợp |
|---|---|---|---|
| Người đọc mới | Chưa có tài khoản, đọc bài công khai | SEO, bài ngắn, câu chuyện, bài test | Free Member |
| Người tò mò | Đã đăng ký nhưng chưa trả phí | 7 ngày miễn phí hoặc bài mở khóa | 7-Day Starter |
| Người bắt đầu | Muốn có nhịp học nhẹ | 30 ngày căn bản | 30-Day Foundation |
| Người muốn thay đổi rõ | Sẵn sàng đi sâu | 90 ngày | 90-Day Deep Journey |
| Người muốn duy trì | Đã học 90 hoặc 120 ngày | 12 tháng chủ đề | 1-Year Membership |
| Người muốn đồng hành dài | Cần hệ thống 3 năm | Year 1, Year 2, Year 3 | 3-Year Journey |
| Người cần hỗ trợ riêng | Có vấn đề cụ thể hoặc muốn lộ trình cá nhân | Case review, 1:1 notes | Expert 1:1 |

---

## 2. PAYMENT TIERS

### 2.1 Pricing model

| Tier | Product | Suggested price | Billing | Access |
|---|---|---:|---|---|
| Public | Công khai | 0 USD | None | Public pages |
| Free Member | Thành viên căn bản | 0 USD | Login required | Free dashboard, limited lessons |
| Starter | 7-Day Starter | 7 USD | One-time | 7 days |
| Foundation | 30-Day Foundation | 19–39 USD | Monthly or one-time | 30 days |
| Deep Journey | 90-Day Program | 99–199 USD | One-time or 3 monthly payments | 90 days |
| Integration | 120-Day Program | Add-on or bundle | One-time | 120 days |
| Annual | 1-Year Membership | 10 months paid, 12 months access | Yearly | 365 days |
| 3-Year | 3-Year Journey | Pay 2 years, access 3 years | Annual prepaid or installment | 1095 days |
| 1:1 | Expert Session | Application only | Per session or package | Scheduled |

### 2.2 Payment methods

| Method | Use case | Launch rule |
|---|---|---|
| Stripe | Card, subscription, recurring billing | Primary for international and recurring |
| PayPal | International payment fallback | Secondary |
| QR Việt Nam / VietQR | Vietnam one-time invoice | Use invoice/manual verification in V1 |
| Bank transfer | Premium or 1:1 | Manual approval in V1 |
| Coupon | Founder promo, seasonal campaign | Admin controlled |

### 2.3 Payment access logic

```text
payment_success
→ create_or_update_subscription
→ unlock_program_access
→ create_learning_plan
→ schedule_email_sequence
→ create_dashboard_cards
→ log_audit_event
```

### 2.4 QR Việt Nam V1 rule

QR Việt Nam should not be treated as automatic subscription in V1 unless a verified payment callback provider is integrated. Recommended flow:

```text
user_selects_qr_payment
→ create_pending_invoice
→ show_qr_code_with_amount_and_reference
→ user_uploads_payment_proof_or_admin_checks_bank
→ admin_marks_paid
→ unlock_access
→ send_payment_confirmed_email
```

---

## 3. CONTENT SYSTEM OVERVIEW

### 3.1 Content layers

| Layer | Visibility | Content types |
|---|---|---|
| Public | Everyone | SEO articles, short reflections, videos, audio, public quiz |
| Free Member | Logged-in users | 14-day nurture, 3–7 free lessons, basic check-in |
| Starter | 7-day paid | 7 lessons, 7 practices, 7 emails, day 7 report |
| Foundation | 30-day paid | 30 lessons, 4 weekly reports, month report |
| Deep Journey | 90-day paid | 90 lessons, 13 weekly arcs, 3 monthly reports |
| Integration | 120-day paid | 30 extra lessons, roadmap builder, integration report |
| Annual | 1-year paid | 12 monthly themes, 52 weekly arcs, 365 daily prompts |
| 3-Year | Premium | 3 annual journeys, 12 quarters, mentor path |
| 1:1 | Application | Case notes, personalized roadmap, session summary |

### 3.2 Standard lesson format

Every paid lesson must include:

1. **Opening insight:** 150–250 words.
2. **Deep explanation:** 500–900 words.
3. **Real-life example:** 150–300 words.
4. **Practice:** one practical exercise.
5. **Check-in:** 3–5 questions.
6. **Small action:** one action under 15 minutes.
7. **Journal prompt:** one reflective writing prompt.
8. **Next step:** continue lesson, unlock report, or upgrade suggestion.
9. **Asset:** image, audio, worksheet or short video.
10. **Internal links:** at least 2 related lessons or public articles.

### 3.3 Content depth standard

Do not publish a paid lesson if it is only inspirational. A lesson is valid only if it answers:

1. What problem does the learner recognize today?
2. What pattern can they observe?
3. What can they do in less than 15 minutes?
4. What should they write in check-in?
5. What data should the system store?
6. What should the next automation do?

---

## 4. 90-DAY CONTENT SYSTEM

### 4.1 90-day program phases

| Phase | Days | Theme | Goal |
|---|---:|---|---|
| Phase 1 | 1–30 | Nhận diện lại chính mình | Understand current life, emotion, rhythm and patterns |
| Phase 2 | 31–60 | Xây lại nhịp sống và nội lực | Build soft discipline, energy, morning rhythm |
| Phase 3 | 61–90 | Ứng dụng vào đời sống thật | Apply awareness to relationships, work, money, choices |

### 4.2 13 weekly arcs

| Week | Days | Theme | Automation focus |
|---:|---:|---|---|
| 1 | 1–7 | Bắt đầu quay về | Onboarding, first check-in streak |
| 2 | 8–14 | Quan sát bản thân | Behavior tracking |
| 3 | 15–21 | Cảm nhận sâu hơn | Journal activation |
| 4 | 22–30 | Hành động nhỏ | First month report |
| 5 | 31–37 | Xây lại buổi sáng | Morning practice badge |
| 6 | 38–44 | Xây lại năng lượng | Energy score trigger |
| 7 | 45–51 | Xây lại kỷ luật | Streak and restart flow |
| 8 | 52–60 | Quan hệ với chính mình | Month 2 report |
| 9 | 61–67 | Quan hệ với người khác | Relationship segment |
| 10 | 68–74 | Công việc | Career clarity segment |
| 11 | 75–81 | Tiền bạc và lựa chọn | Decision clarity segment |
| 12 | 82–88 | Tầm nhìn dài hạn | Roadmap draft |
| 13 | 89–90 | Tổng kết 90 ngày | 90-day report and next offer |

### 4.3 90-day lesson map

| Ngày | Tên bài | Trọng tâm nội dung | Thực hành | Check-in chính |
|---:|---|---|---|---|
| 1 | Tôi đang ở đâu trong cuộc đời mình? | Người học nhìn lại trạng thái hiện tại mà không vội kết luận đúng sai. | Viết 10 dòng mô tả đời sống hiện tại. | Hôm nay điều gì trong tôi cần được nhìn thấy? |
| 2 | Điều gì đang làm tôi mệt? | Nhận diện nguồn tiêu hao năng lượng trong sinh hoạt, công việc, quan hệ. | Khoanh 3 nguồn làm mất năng lượng nhất. | Tôi đang để điều gì lấy quá nhiều sức của mình? |
| 3 | Tôi đã bỏ quên điều gì trong chính mình? | Nhìn lại nhu cầu, sở thích, giấc mơ hoặc phẩm chất đã bị trì hoãn. | Viết một điều từng quan trọng nhưng đã bị bỏ quên. | Điều gì trong tôi vẫn còn chờ được quay lại? |
| 4 | Nhịp sống hiện tại đang kéo tôi đi đâu? | Quan sát nhịp ngày, nhịp tuần, nhịp tiêu thụ thông tin. | Vẽ một ngày điển hình từ sáng đến tối. | Nếu cứ sống như hiện tại, tôi sẽ đi về đâu? |
| 5 | Tôi phản ứng nhiều hơn hay đang thật sự sống? | Phân biệt sống chủ động với phản ứng theo áp lực bên ngoài. | Ghi lại 3 phản ứng thường lặp lại. | Hôm nay tôi đã phản ứng hay đã chọn lựa? |
| 6 | Điều gì tôi cần dừng lại? | Chọn một thói quen, mối bận tâm hoặc hành động cần tạm dừng. | Dừng 1 hành vi nhỏ trong 24 giờ. | Tôi có đủ can đảm dừng một điều không còn nuôi mình không? |
| 7 | Tổng kết tuần đầu tiên | Kết nối 6 ngày đầu thành một bản nhìn lại ngắn. | Viết 5 nhận ra lớn nhất của tuần. | Tuần này tôi đã thấy mình rõ hơn ở đâu? |
| 8 | Quan sát không phán xét | Học cách quan sát mình mà không tự trách hoặc biện minh. | Dành 5 phút ngồi yên và ghi lại điều xuất hiện. | Tôi có thể nhìn mình mà không vội kết án không? |
| 9 | Cảm xúc đến từ đâu? | Nhìn cảm xúc như tín hiệu, không phải kẻ thù. | Chọn một cảm xúc hôm nay và truy về hoàn cảnh sinh ra nó. | Cảm xúc này đang báo cho tôi điều gì? |
| 10 | Thói quen lặp lại trong tôi | Nhận diện vòng lặp hành vi, suy nghĩ, lựa chọn. | Ghi 1 vòng lặp: kích hoạt, phản ứng, hậu quả. | Tôi đang lặp lại điều gì dù biết không còn phù hợp? |
| 11 | Tôi thường né tránh điều gì? | Đi vào vùng né tránh nhẹ nhàng, không ép người học đối diện quá nhanh. | Viết tên một việc đang né tránh và bước nhỏ nhất để chạm vào nó. | Điều tôi né tránh đang giữ tôi ở đâu? |
| 12 | Tôi đang sợ mất điều gì? | Làm rõ nỗi sợ phía sau việc giữ chặt, kiểm soát hoặc trì hoãn. | Viết 3 điều tôi sợ mất và kiểm tra điều nào là thật. | Nỗi sợ nào đang lái lựa chọn của tôi? |
| 13 | Tôi muốn được nhìn thấy như thế nào? | Nhận diện nhu cầu được công nhận, yêu thương, tôn trọng. | Viết một câu: Tôi muốn người khác hiểu rằng... | Tôi có đang sống để được nhìn thấy thay vì sống thật không? |
| 14 | Tổng kết tuần 2 | Tổng hợp các quan sát thành bản đồ nội tâm ban đầu. | Chọn 1 vòng lặp cần theo dõi tuần tới. | Tôi đã quan sát được điều gì lặp lại rõ nhất? |
| 15 | Tôi thật sự cần gì? | Phân biệt nhu cầu thật với mong muốn nhất thời. | Viết 5 điều muốn và 3 điều thật sự cần. | Điều tôi cần nhất hôm nay là gì? |
| 16 | Cơ thể đang nói gì với tôi? | Liên kết thân thể, giấc ngủ, nhịp ăn, căng thẳng với đời sống nội tâm. | Chấm điểm ngủ, ăn, vận động, căng thẳng. | Cơ thể đang nhắc tôi điều gì mà tôi thường bỏ qua? |
| 17 | Trái tim tôi đang mỏi ở đâu? | Nhìn lại điểm mỏi trong tình cảm, trách nhiệm, kỳ vọng. | Viết một đoạn không gửi cho ai. | Tôi đã mỏi vì điều gì quá lâu? |
| 18 | Tôi có đang sống theo kỳ vọng của người khác? | Tách mong muốn của mình khỏi khuôn mẫu của gia đình, xã hội, môi trường. | Liệt kê 3 kỳ vọng đang ảnh hưởng đến mình. | Điều gì là của tôi, điều gì là của người khác? |
| 19 | Tôi có đang tử tế với chính mình? | Xây lại giọng nói bên trong, giảm tự công kích. | Viết lại một câu tự trách thành câu tử tế hơn. | Hôm nay tôi có thể nói với mình nhẹ hơn không? |
| 20 | Điều gì làm tôi mềm lại? | Nhận diện nguồn nuôi dưỡng: âm nhạc, thiên nhiên, viết, im lặng, người thân. | Chọn 1 điều làm mình dịu và làm trong 15 phút. | Điều gì giúp tôi trở lại với phần người hơn? |
| 21 | Tổng kết tuần 3 | Kết lại phần cảm nhận bằng một bản ghi sâu. | Viết thư cho chính mình ở hiện tại. | Sau 21 ngày, tôi nghe được điều gì rõ hơn? |
| 22 | Một hành động nhỏ có thể đổi nhịp sống | Tập trung vào hành động nhỏ, bền, có thể làm ngay. | Chọn một hành động 5 phút mỗi ngày. | Hành động nhỏ nào có thể thay đổi ngày hôm nay? |
| 23 | Dọn một góc đời sống | Dọn không gian bên ngoài để tác động đến không gian bên trong. | Dọn một góc bàn, góc phòng hoặc thư mục điện thoại. | Không gian nào đang phản ánh sự bừa bộn bên trong tôi? |
| 24 | Nói thật với chính mình | Viết một sự thật nhẹ nhưng rõ về đời sống hiện tại. | Hoàn thành câu: Sự thật là... | Tôi đã né tránh sự thật nào quá lâu? |
| 25 | Chọn một điều cần làm mỗi ngày | Đặt một hành động nền để giữ nhịp. | Cam kết một việc nhỏ trong 7 ngày. | Điều gì nếu làm mỗi ngày sẽ giúp tôi vững hơn? |
| 26 | Chọn một điều cần ngừng lại | Đặt ranh giới với thói quen tiêu hao. | Chọn 1 hành vi cần giảm trong 7 ngày. | Tôi sẽ ngừng nuôi điều gì trong mình? |
| 27 | Viết lại cam kết với bản thân | Tạo cam kết không quá lớn, không hứa quá mức. | Viết cam kết 30 chữ. | Tôi muốn cam kết điều gì một cách thật lòng? |
| 28 | Tổng kết tuần 4 | Đo lại hành động, cảm xúc, check-in và sự thay đổi nhỏ. | Chọn 3 bằng chứng cho thấy mình đã dịch chuyển. | Tuần này tôi đã sống chủ động hơn ở đâu? |
| 29 | Tôi đã thay đổi điều gì sau 30 ngày? | Nhìn lại tiến trình đầu tiên và chuẩn bị bước sâu hơn. | Viết trước và sau: ngày 1 khác ngày 29 ở đâu. | Tôi có thấy mình rõ hơn không? |
| 30 | Tôi có sẵn sàng đi sâu hơn không? | Chuyển tầng từ nhận diện sang xây lại nhịp sống. | Chọn mục tiêu 30 ngày tiếp theo. | Tôi muốn xây lại điều gì trước tiên? |
| 31 | Buổi sáng quyết định nhịp sống | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 32 | Không chạm điện thoại trong 20 phút đầu | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 33 | Viết 3 dòng trước khi bắt đầu ngày mới | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 34 | Hơi thở và sự hiện diện | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 35 | Chọn một việc quan trọng nhất hôm nay | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 36 | Dọn tâm trí trước khi làm việc | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 37 | Tổng kết tuần 5 | Thiết kế lại buổi sáng như điểm neo của ngày, giảm nhiễu, tăng hiện diện và chọn việc quan trọng. | Thực hiện một nghi thức sáng dưới 20 phút và ghi nhận tác động. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 38 | Điều gì đang rút năng lượng của tôi? | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 39 | Người nào làm tôi mất mình? | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 40 | Không gian sống ảnh hưởng đến tâm trí | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 41 | Ăn, ngủ, đi lại và cảm xúc | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 42 | Cơ thể không nói dối | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 43 | Tôi cần bảo vệ năng lượng của mình như thế nào? | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 44 | Tổng kết tuần 6 | Quan sát năng lượng sống, nguồn tiêu hao và cách bảo vệ năng lượng mà không đóng kín. | Chấm điểm năng lượng, tìm một nguồn tiêu hao và điều chỉnh một hành vi nhỏ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 45 | Kỷ luật không phải là ép mình | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 46 | Một việc nhỏ mỗi ngày | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 47 | Lịch học không cần hoàn hảo | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 48 | Khi tôi thất hứa với chính mình | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 49 | Quay lại sau khi bỏ lỡ | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 50 | Tạo hệ thống thay vì chỉ dùng ý chí | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 51 | Tổng kết tuần 7 | Xây kỷ luật mềm: bền hơn, ít tự trách hơn, có hệ thống thay vì chỉ dựa vào ý chí. | Thiết lập một hành động nhỏ có lịch, dấu hiệu kích hoạt và phần thưởng đơn giản. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 52 | Tôi nói với mình bằng giọng nào? | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 53 | Tôi có đang tự trừng phạt mình? | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 54 | Tha thứ cho phiên bản cũ | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 55 | Không phải lúc nào mạnh mẽ cũng là tốt | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 56 | Cho phép mình bắt đầu lại | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 57 | Một lời hứa tử tế với chính mình | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 58 | Tổng kết tuần 8 | Xây lại quan hệ với chính mình qua ngôn ngữ bên trong, sự tha thứ và khả năng bắt đầu lại. | Viết lại một câu tự công kích thành câu nâng đỡ thực tế. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 59 | Tôi đã xây lại điều gì? | Tổng kết tháng thứ hai, đo sự thay đổi trong nhịp sống, năng lượng và kỷ luật. | Hoàn thành bản tự đánh giá tháng 2 và chọn một điều cần giữ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 60 | Tôi có đang sống khác đi không? | Tổng kết tháng thứ hai, đo sự thay đổi trong nhịp sống, năng lượng và kỷ luật. | Hoàn thành bản tự đánh giá tháng 2 và chọn một điều cần giữ. | Hôm nay tôi đã xây lại được điều gì dù rất nhỏ? |
| 61 | Tôi đang lặp lại kiểu quan hệ nào? | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 62 | Tôi mong người khác hiểu điều gì ở mình? | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 63 | Ranh giới là sự tử tế với cả hai bên | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 64 | Khi tôi im lặng quá lâu | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 65 | Khi tôi nói ra nhưng không được nghe | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 66 | Một cuộc trò chuyện cần có | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 67 | Tổng kết tuần 9 | Đưa nhận thức vào quan hệ: ranh giới, giao tiếp, nhu cầu được lắng nghe và trách nhiệm với lời nói. | Chọn một mối quan hệ và viết điều cần nói rõ hơn. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 68 | Tôi đang làm việc vì điều gì? | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 69 | Công việc nào làm tôi cạn kiệt? | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 70 | Công việc nào làm tôi có giá trị? | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 71 | Tôi có đang sống bằng lịch của người khác? | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 72 | Làm ít hơn nhưng rõ hơn | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 73 | Một quyết định nghề nghiệp cần nhìn lại | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 74 | Tổng kết tuần 10 | Đưa nhận thức vào công việc: năng lượng, giá trị, lịch sống, quyết định nghề nghiệp. | Rà lại một ngày làm việc và bỏ một việc không còn cần thiết. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 75 | Tiền bạc phản ánh điều gì trong đời sống? | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 76 | Tôi tiêu tiền để lấp khoảng trống nào? | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 77 | Tôi có đang sợ thiếu? | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 78 | Giá trị thật của tôi nằm ở đâu? | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 79 | Một lựa chọn tài chính tỉnh táo | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 80 | Làm chủ ham muốn tức thời | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 81 | Tổng kết tuần 11 | Đưa nhận thức vào tiền bạc và lựa chọn: kỷ luật, thiếu đủ, ham muốn tức thời và giá trị thật. | Ghi lại một quyết định tài chính nhỏ và lý do phía sau. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 82 | Tôi muốn sống thế nào trong 1 năm tới? | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 83 | Điều gì không còn phù hợp? | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 84 | Điều gì cần được nuôi dưỡng? | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 85 | Tôi muốn trở thành người như thế nào? | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 86 | Một kế hoạch 30 ngày tiếp theo | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 87 | Một kế hoạch 12 tháng | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 88 | Tổng kết tuần 12 | Xây tầm nhìn dài hạn: 30 ngày, 12 tháng, điều cần giữ, điều cần buông. | Viết một bản kế hoạch 12 tháng ở dạng đơn giản. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 89 | Nhìn lại con người cũ | Kết thúc 90 ngày, tạo báo cáo cá nhân và chọn lộ trình tiếp theo. | Hoàn thành bản phản chiếu 90 ngày và chọn hành trình 120 ngày, 1 năm hoặc 3 năm. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |
| 90 | Bước tiếp theo của tôi là gì? | Kết thúc 90 ngày, tạo báo cáo cá nhân và chọn lộ trình tiếp theo. | Hoàn thành bản phản chiếu 90 ngày và chọn hành trình 120 ngày, 1 năm hoặc 3 năm. | Điều gì trong đời sống thật hôm nay cho thấy tôi đã thay đổi? |

---

## 5. 120-DAY EXTENSION SYSTEM

### 5.1 Positioning

The 120-day extension should be named:

**30 Ngày Tích Hợp Sau Hành Trình 90 Ngày**  
**30-Day Integration After the 90-Day Journey**

Goal:

1. Prevent drop-off after day 90.
2. Convert learning into routines.
3. Build a practical 3-month life plan.
4. Move qualified learners into annual membership.

### 5.2 120-day content map

| Ngày | Tên bài | Mục tiêu | Thực hành | Automation |
|---:|---|---|---|---|
| 91 | Tôi không muốn quay lại phiên bản cũ nào? | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 92 | Điều gì cần trở thành nếp sống? | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 93 | Một thói quen cần giữ | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 94 | Một thói quen cần bỏ | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 95 | Một mối quan hệ cần nhìn lại | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 96 | Một mục tiêu cần tinh chỉnh | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 97 | Tổng kết tuần 14 | Chống quay lại nếp cũ sau 90 ngày và biến nhận ra thành nếp sống. | Chọn một điều cần giữ hoặc bỏ trong tuần tích hợp đầu tiên. | Nếu hoàn thành 5/7 ngày, mở worksheet tích hợp. |
| 98 | Tôi làm việc tốt nhất trong điều kiện nào? | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 99 | Tôi đang lãng phí thời gian ở đâu? | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 100 | Cách tôi ra quyết định | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 101 | Cách tôi xử lý áp lực | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 102 | Cách tôi nói không | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 103 | Cách tôi giữ lời hứa | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 104 | Tổng kết tuần 15 | Đưa sự rõ ràng vào công việc, thời gian, quyết định và áp lực. | Rà lại lịch tuần và bỏ một việc không tạo giá trị. | Nếu chọn chủ đề công việc nhiều lần, gợi ý lộ trình Career Clarity. |
| 105 | Tôi cần ai trong hành trình này? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 106 | Tôi không cần chứng minh với ai nữa? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 107 | Quan hệ nào cần ranh giới? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 108 | Quan hệ nào cần được nuôi dưỡng? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 109 | Tôi muốn trao đi điều gì? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 110 | Tôi cần nhận lại điều gì? | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 111 | Tổng kết tuần 16 | Đưa sự rõ ràng vào quan hệ, ranh giới, trao nhận và kết nối. | Viết một ranh giới cần thiết và một kết nối cần nuôi dưỡng. | Nếu user cần hỗ trợ quan hệ, gợi ý bài chuyên sâu hoặc 1:1. |
| 112 | Kế hoạch sống 3 tháng tới | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 113 | Kế hoạch học 3 tháng tới | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 114 | Kế hoạch làm việc 3 tháng tới | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 115 | Kế hoạch chăm sóc bản thân | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 116 | Kế hoạch quan hệ | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 117 | Kế hoạch tài chính cá nhân | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 118 | Viết cam kết 120 ngày | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 119 | Báo cáo 120 ngày | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |
| 120 | Chọn hành trình 1 năm | Khóa cam kết 120 ngày và chuyển vào hành trình 1 năm. | Tạo kế hoạch 3 tháng và chọn gói tiếp theo. | Tự động tạo báo cáo 120 ngày và offer gói năm. |

### 5.3 Day 120 conversion

At day 120, the system must generate:

1. 120-day completion report.
2. Habit stability score.
3. Energy trend.
4. Check-in consistency.
5. Top 3 recurring themes.
6. Suggested annual path.
7. Suggested 1:1 only if trigger conditions are met.

---

## 6. 12-MONTH CONTENT SYSTEM

### 6.1 Annual theme map

| Month | Theme | Weekly arcs | Core deliverable |
|---:|---|---|---|
| 1 | Nhận diện bản thân | Current state, patterns, emotions, small actions | Self-map report |
| 2 | Xây lại nhịp sống | Morning, energy, discipline, self-relationship | Rhythm report |
| 3 | Ứng dụng vào đời sống | Relationships, work, money, vision | 90-day report |
| 4 | Tích hợp | Habits, decisions, relationships, 3-month plan | 120-day roadmap |
| 5 | Quan hệ | Boundaries, communication, family, intimacy | Relationship map |
| 6 | Công việc | Meaning, capacity, focus, work rhythm | Work clarity plan |
| 7 | Tiền bạc | Spending, sufficiency, discipline, value | Personal finance reflection |
| 8 | Cơ thể và sức sống | Sleep, food, movement, recovery | Energy care plan |
| 9 | Sáng tạo | Writing, speaking, making, sharing | Creative output |
| 10 | Gia đình và quá khứ | Memory, responsibility, freedom, acceptance | Family reflection |
| 11 | Tầm nhìn cá nhân | 1-year, 3-year, 10-year, identity | Personal vision draft |
| 12 | Tổng kết và tái cam kết | Review, renewal, next year design | Annual report |

### 6.2 Monthly automation

Each month must include:

1. Month opening email.
2. 4 weekly lesson arcs.
3. 4 weekly check-in reports.
4. 1 monthly review.
5. 1 worksheet.
6. 1 audio guide.
7. 1 public SEO article linked to the theme.
8. 1 upgrade or retention offer.
9. 1 dashboard milestone.
10. 1 admin analytics snapshot.

### 6.3 52-week structure

| Quarter | Weeks | Theme | Outcome |
|---|---:|---|---|
| Q1 | 1–13 | Foundation | Complete 90-day journey |
| Q2 | 14–26 | Integration and relationships | Stable routines and clearer boundaries |
| Q3 | 27–39 | Work, money, body, creativity | Applied life system |
| Q4 | 40–52 | Family, vision, annual renewal | Annual report and next-year plan |

---

## 7. 3-YEAR JOURNEY

### 7.1 Positioning

Do not position this as “a long course”. Position it as:

**Hành Trình Đồng Hành 3 Năm**  
**The 3-Year Inner Life Program**

The 3-year product is for learners who want long-term continuity, not only lessons.

### 7.2 Year architecture

| Year | Name | Main goal | Core outcome |
|---:|---|---|---|
| Year 1 | Xây nền | Understand self, rebuild rhythm, apply awareness | Stable personal rhythm |
| Year 2 | Làm chủ | Make better choices, work deeply, mature relationships | Personal operating system |
| Year 3 | Trao đi | Create value, mentor others, build meaningful contribution | Contribution and mentor path |

### 7.3 12-quarter roadmap

| Quarter | Theme | Main content | Deliverable |
|---:|---|---|---|
| Q1 | Return to self | 90-day journey | 90-day report |
| Q2 | Integration | Habits, energy, relationship, work | 6-month review |
| Q3 | Applied life | Work, money, body, creativity | Life system map |
| Q4 | Annual renewal | Family, vision, year review | Year 1 report |
| Q5 | Decision mastery | Values, priorities, trade-offs | Decision framework |
| Q6 | Relationship maturity | Communication, boundaries, responsibility | Relationship practice plan |
| Q7 | Work and value | Skill, depth, contribution | Work value map |
| Q8 | Life operating system | Calendar, finance, health, learning | Year 2 report |
| Q9 | Creative contribution | Writing, teaching, sharing | Public or private project |
| Q10 | Community and service | Group practice, mentoring basics | Mentor readiness review |
| Q11 | Legacy and long-term life | 3-year, 10-year vision | Long-term roadmap |
| Q12 | Completion and continuation | Review, renewal, alumni | 3-year completion report |

### 7.4 Mentor path

A learner can be invited into mentor/community role only if:

1. Completed at least 1 year.
2. Check-in consistency above 60%.
3. Completed quarterly reports.
4. Demonstrates stable communication.
5. Passes manual review by admin or expert.
6. Accepts community guidelines.
7. Does not present themselves as therapist, doctor, financial advisor or legal advisor unless separately licensed.

---

## 8. PUBLIC CONTENT SYSTEM

### 8.1 Public content goals

Public content must do 5 things:

1. Build trust before selling.
2. Create SEO surface area.
3. Give real value without login.
4. Lead to free registration.
5. Prepare the learner for paid depth.

### 8.2 Weekly public publishing rhythm

| Content type | Frequency | Purpose |
|---|---:|---|
| SEO article | 2 per week | Organic traffic and authority |
| Short reflection | 3 per week | Social and newsletter |
| Video short | 1 per week | Human presence |
| Audio short | 1 per week | Calm daily engagement |
| Public quiz | 1 per month | Lead capture |
| Newsletter | 1 per week | Relationship and conversion |
| Story article | 2 per month | Trust and retention |

### 8.3 12 public content pillars

1. Sống rõ hơn mỗi ngày.
2. Hiểu bản thân mà không tự trách.
3. Cảm xúc và năng lượng sống.
4. Quan hệ và ranh giới.
5. Công việc và nhịp sống.
6. Gia đình, ký ức và trách nhiệm.
7. Kỷ luật mềm.
8. Tự học và tự quan sát.
9. Sống có kế hoạch.
10. Phụ nữ và đời sống nội tâm.
11. Hành trình 90 ngày.
12. Đồng hành dài hạn.

### 8.4 SEO article template

Each SEO article must include:

1. H1 with main keyword.
2. Opening problem in real-life language.
3. Explanation without exaggerated claims.
4. 3–5 practical steps.
5. One reflective question.
6. Internal links to related articles.
7. CTA to free member registration.
8. CTA to 7-day or 30-day program.
9. Image with alt text.
10. FAQ block.

---

## 9. EMAIL AUTOMATION

### 9.1 Email principles

1. No spam tone.
2. No pressure.
3. No exaggerated promise.
4. Always tie email to next action.
5. Every behavioral trigger must be logged.
6. Every paid user must receive progress emails.
7. Every failed email must retry.
8. Unsubscribe must be clear.
9. User can reduce frequency.
10. Admin can preview every email sequence.

### 9.2 Core sequences

| Sequence | Audience | Length | Goal |
|---|---|---:|---|
| Public newsletter | Public subscribers | Weekly | Trust and return visits |
| Free onboarding | Free members | 14 days | Convert to Starter |
| 7-day starter | Starter users | 7 days | Convert to 30-day |
| 30-day foundation | Paid users | 30 days | Build habit and convert to 90-day |
| 90-day journey | Core users | 90 days | Retain and complete |
| 120-day integration | Advanced users | 30 days | Convert to annual |
| Annual membership | Annual users | 12 months | Retain and deepen |
| 3-year journey | Premium users | 12 quarters | Long-term continuity |
| Re-engagement | Inactive users | Behavior-based | Bring user back |
| 1:1 application | Qualified users | Behavior-based | Expert session conversion |

### 9.3 Behavior triggers

| Trigger | Condition | Email/action |
|---|---|---|
| no_checkin_1_day | missed daily check-in | Gentle reminder |
| no_checkin_3_days | missed 3 days | Return without guilt |
| no_checkin_7_days | missed 7 days | Restart flow |
| complete_7_days | 7-day streak | Badge and bonus lesson |
| complete_30_days | Month 1 complete | 30-day report and 90-day offer |
| complete_60_days | Month 2 complete | Month 2 report |
| complete_90_days | 90-day complete | Full report and next path |
| energy_low_5_days | low energy check-in 5 days | Suggest recovery content |
| needs_support_3_times | support selected 3 times | Suggest 1:1 application |
| upgrade_interest | clicked pricing 3 times | Send pricing explainer |
| payment_failed | payment failed | Payment recovery |
| subscription_cancel | cancellation started | Save offer or pause option |

### 9.4 Required email templates

1. Welcome free member.
2. Magic link login.
3. Free day 1.
4. Free day 3.
5. Free day 7.
6. Starter purchase confirmation.
7. Starter day 1.
8. Starter day 3 reminder.
9. Starter day 7 report.
10. 30-day purchase confirmation.
11. Weekly opening email.
12. Weekly report email.
13. Missed check-in 1 day.
14. Missed check-in 3 days.
15. Missed check-in 7 days.
16. Month 1 report.
17. Month 2 report.
18. 90-day completion.
19. 120-day offer.
20. Annual membership welcome.
21. Quarterly report.
22. Yearly report.
23. 3-year journey welcome.
24. 1:1 invitation.
25. Payment failed.
26. Subscription renewal.
27. Cancellation confirmation.
28. Re-engagement.
29. Newsletter weekly.
30. Admin test email.

---

## 10. DASHBOARD LOGIC

### 10.1 Dashboard surfaces

| Surface | Purpose | User types |
|---|---|---|
| Today | Shows lesson and action for today | All logged-in users |
| Practice | Shows exercise and small action | Paid users |
| Check-in | Daily, weekly, monthly answers | All logged-in users |
| Progress | Streak, completion, unlocked content | Paid users |
| Journal | Saved reflections | Paid users |
| Reports | Weekly, monthly, quarterly, yearly | Paid users |
| Library | Unlocked lessons and assets | Paid users |
| Next Step | Recommended path | All users |
| Support / 1:1 | Application and guidance | Qualified users |
| Account | Subscription, billing, profile | All users |

### 10.2 Home dashboard decision tree

```text
IF user_has_no_account:
  show_public_cta

IF user_is_free_member:
  show_free_day_sequence
  show_basic_checkin
  show_starter_offer

IF user_has_active_program:
  show_today_lesson
  show_today_practice
  show_checkin
  show_progress
  show_next_unlock

IF user_missed_checkin:
  show_return_card

IF user_completed_program:
  show_completion_report
  show_next_path

IF user_triggered_support:
  show_1_to_1_application_card
```

### 10.3 Progress score

Recommended V1 scoring:

```text
completion_score = lessons_completed / lessons_available
checkin_score = checkins_submitted / checkins_expected
practice_score = practices_completed / practices_expected
consistency_score = active_days / program_days

overall_progress = 
  completion_score * 0.35
+ checkin_score * 0.30
+ practice_score * 0.20
+ consistency_score * 0.15
```

### 10.4 Reports

| Report | Timing | Content |
|---|---|---|
| Weekly report | Every 7 days | lessons, check-ins, recurring themes |
| Monthly report | Every 30 days | progress, energy trend, strongest topic |
| 90-day report | Day 90 | full journey, recommendations |
| 120-day report | Day 120 | integration and annual path |
| Quarterly report | Every 90 days in annual/3-year | deeper review |
| Yearly report | Every 12 months | annual completion and renewal |
| 3-year report | End of 36 months | full journey archive |

---

## 11. API AND DATABASE ADDITIONS

### 11.1 Required database tables

#### users_profile

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| auth_user_id | uuid | Supabase auth user id |
| full_name | text | optional |
| email | text | unique |
| locale | text | vi/en |
| timezone | text | default Asia/Ho_Chi_Minh |
| onboarding_status | text | pending/complete |
| created_at | timestamptz | auto |

#### programs

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| slug | text | starter-7-day, foundation-30-day, deep-90-day |
| title | text | public title |
| duration_days | int | 7, 30, 90, 120, 365, 1095 |
| status | text | draft/live/archived |

#### program_tiers

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| program_id | uuid | FK programs |
| tier_slug | text | free/starter/foundation/deep/annual |
| price_usd | numeric | base price |
| billing_type | text | free/one_time/monthly/yearly/manual |
| access_days | int | access duration |

#### lessons

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| program_id | uuid | FK |
| day_number | int | unlock day |
| title | text | lesson title |
| body_md | text | full markdown |
| practice_md | text | exercise |
| asset_url | text | image/audio/video |
| status | text | draft/review/live |

#### checkin_questions

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| lesson_id | uuid | FK |
| question_text | text | prompt |
| question_type | text | scale/text/select |
| required | boolean | true/false |

#### checkin_responses

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| lesson_id | uuid | FK |
| response_json | jsonb | answers |
| energy_score | int | optional |
| needs_support | boolean | trigger |
| created_at | timestamptz | auto |

#### subscriptions

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| tier_id | uuid | FK |
| provider | text | stripe/paypal/qr/manual |
| provider_subscription_id | text | nullable |
| status | text | active/past_due/cancelled/expired |
| access_start | timestamptz | |
| access_end | timestamptz | |

#### payment_events

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| provider | text | stripe/paypal/qr/manual |
| event_type | text | checkout_success/payment_failed/refund |
| amount | numeric | |
| currency | text | USD/VND |
| raw_payload | jsonb | webhook payload |
| created_at | timestamptz | auto |

#### email_templates

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| slug | text | unique |
| subject | text | |
| body_md | text | |
| audience | text | free/paid/all |
| status | text | draft/live |

#### email_events

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| template_id | uuid | FK |
| trigger_key | text | |
| status | text | queued/sent/failed/opened/clicked |
| provider_message_id | text | |
| error_message | text | |
| created_at | timestamptz | |
| sent_at | timestamptz | |

#### progress_events

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| lesson_id | uuid | nullable |
| event_type | text | lesson_viewed/practice_done/checkin_done/report_generated |
| metadata | jsonb | |
| created_at | timestamptz | |

#### reports

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| report_type | text | weekly/monthly/90_day/120_day/quarterly/yearly |
| report_md | text | generated report |
| report_json | jsonb | structured metrics |
| created_at | timestamptz | |

#### one_to_one_applications

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK |
| reason | text | |
| status | text | submitted/reviewed/accepted/declined |
| admin_notes | text | internal |
| created_at | timestamptz | |

#### admin_audit_logs

| Field | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| admin_user_id | uuid | |
| action | text | |
| entity_type | text | lesson/email/subscription/report |
| entity_id | uuid | nullable |
| before_json | jsonb | |
| after_json | jsonb | |
| created_at | timestamptz | |

### 11.2 API endpoints

#### Auth and profile

```text
POST /api/auth/magic-link
GET  /api/me
PATCH /api/me
POST /api/onboarding/complete
```

#### Programs and lessons

```text
GET  /api/programs
GET  /api/programs/:slug
GET  /api/my/lesson/today
GET  /api/my/lessons
POST /api/my/lessons/:lessonId/complete
```

#### Check-in

```text
GET  /api/my/checkin/today
POST /api/my/checkin
GET  /api/my/checkins
GET  /api/my/checkins/summary
```

#### Progress and reports

```text
GET  /api/my/progress
GET  /api/my/reports
POST /api/my/reports/generate
GET  /api/my/recommendations
```

#### Payment

```text
POST /api/payments/stripe/checkout
POST /api/payments/paypal/create
POST /api/payments/qr/create-invoice
POST /api/webhooks/stripe
POST /api/webhooks/paypal
POST /api/admin/payments/qr/mark-paid
```

#### Email automation

```text
POST /api/cron/email-daily
POST /api/cron/checkin-reminders
POST /api/cron/report-generation
GET  /api/admin/email-events
POST /api/admin/email/test
```

#### Admin content studio

```text
GET    /api/admin/lessons
POST   /api/admin/lessons
PATCH  /api/admin/lessons/:id
POST   /api/admin/lessons/:id/publish
GET    /api/admin/email-templates
POST   /api/admin/email-templates
PATCH  /api/admin/email-templates/:id
GET    /api/admin/reports
GET    /api/admin/analytics
```

---

## 12. ADMIN CONTENT STUDIO

### 12.1 Admin roles

| Role | Permissions |
|---|---|
| Founder | approve content, pricing, strategic direction |
| Content Editor | create/edit lessons, SEO, email copy |
| Program Manager | manage program structure and calendar |
| Support Manager | review 1:1 applications and support cases |
| Developer Admin | manage schema, integrations, logs |
| Finance Admin | verify QR/bank transfer and refunds |

### 12.2 Content workflow

```text
draft
→ editorial_review
→ founder_review
→ scheduled
→ live
→ archived
```

### 12.3 Lesson editor fields

1. Program.
2. Day number.
3. Title.
4. Short summary.
5. Full lesson markdown.
6. Practice.
7. Check-in questions.
8. Small action.
9. Journal prompt.
10. Asset URL.
11. SEO title.
12. SEO description.
13. Internal links.
14. Access tier.
15. Publish date.
16. Status.

### 12.4 Email editor fields

1. Sequence.
2. Trigger key.
3. Subject.
4. Preview text.
5. Body markdown.
6. CTA label.
7. CTA URL.
8. Audience.
9. Send delay.
10. Status.
11. Test recipient.
12. Last tested at.

### 12.5 Admin analytics

Admin dashboard must show:

1. New users.
2. Free to paid conversion.
3. Active paid users.
4. Daily check-in rate.
5. Lesson completion rate.
6. Email sent/open/click/fail.
7. Payment success/fail.
8. Churn/cancel.
9. Upgrade rate.
10. 1:1 application count.
11. Most viewed lessons.
12. Lessons with high drop-off.
13. Segments with low energy.
14. QR pending invoices.
15. Content publishing status.

---

## 13. 1:1 ESCALATION LOGIC

### 13.1 When to suggest 1:1

The system can show a 1:1 card if one or more conditions are met:

1. User selects “I need support” at least 3 times in 7 days.
2. User has low energy score for 5–7 consecutive days.
3. User completes 90-day program and asks for personal roadmap.
4. User is in annual or 3-year tier.
5. User submits long journal entries and clicks “review with expert”.
6. User has repeated relationship, work or life direction concerns.
7. User manually requests expert support.

### 13.2 1:1 copy rule

Use gentle language:

> Dựa trên hành trình bạn đã ghi lại, hệ thống nhận thấy bạn có thể cần một buổi đồng hành sâu hơn với chuyên gia. Đây không phải bước bắt buộc. Bạn chỉ nên chọn khi thật sự muốn được nhìn lại lộ trình cá nhân.

### 13.3 Safety disclaimer

1:1 support must not be presented as medical, psychological, legal, tax or financial treatment/advice unless handled by a separately qualified professional. For urgent safety situations, show emergency/local support guidance rather than internal coaching.

---

## 14. TECHNICAL ARCHITECTURE

### 14.1 Recommended stack

| Layer | Recommended choice |
|---|---|
| Frontend | Next.js |
| Backend/API | Next.js API routes or separate Node/Edge API |
| Auth | Supabase Auth: Magic link + Google |
| Database | Supabase Postgres |
| Payment | Stripe + PayPal + QR Việt Nam invoice |
| Email | email.iai.one integration, backed by SMTP/API provider |
| File storage | Supabase Storage or Cloudflare R2 |
| Analytics | PostHog, Plausible or custom event table |
| Cron | Supabase scheduled functions, Vercel cron, Cloudflare Workers cron |
| Admin | Protected admin dashboard |
| Reports | Server-side generator from progress/check-in data |

### 14.2 Automation flow

```text
signup
→ onboarding
→ free sequence
→ payment
→ subscription activation
→ lesson schedule
→ daily lesson unlock
→ check-in
→ progress event
→ email trigger
→ weekly/monthly report
→ recommendation
→ upgrade or 1:1 path
```

### 14.3 Launch architecture rule

V1 must stay simple:

1. One frontend.
2. One database.
3. One auth system.
4. One email automation service.
5. Stripe first, PayPal second, QR invoice third.
6. No native mobile app in V1.
7. No complex AI personalization until data quality is stable.
8. No community marketplace in V1.
9. No heavy gamification in V1.
10. No expert marketplace in V1.

---

## 15. DEV IMPLEMENTATION CHECKLIST

### Phase 0: Repo and environment

- [ ] Add this file to `/docs/NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md`.
- [ ] Add link to README.
- [ ] Add link to MASTER_PROJECT_INDEX if available.
- [ ] Confirm environment variables.
- [ ] Confirm Supabase project.
- [ ] Confirm Stripe account.
- [ ] Confirm PayPal account.
- [ ] Confirm QR Việt Nam payment process.
- [ ] Confirm email.iai.one sending path.
- [ ] Confirm admin user list.

### Phase 1: 0–30 days

- [ ] Build auth: magic link and Google.
- [ ] Build user profile.
- [ ] Build free member dashboard.
- [ ] Build program/tier tables.
- [ ] Build lesson table and today lesson API.
- [ ] Build check-in API.
- [ ] Build basic progress.
- [ ] Build Stripe checkout.
- [ ] Build PayPal checkout.
- [ ] Build QR invoice creation.
- [ ] Build email template table.
- [ ] Build onboarding email sequence.
- [ ] Build missed check-in reminder.
- [ ] Build admin lesson editor.
- [ ] Seed 30 days content.
- [ ] Test full user journey: signup → lesson → check-in → email.

### Phase 2: 31–60 days

- [ ] Add 90-day content.
- [ ] Add lesson unlock by day.
- [ ] Add weekly report.
- [ ] Add monthly report.
- [ ] Add behavior triggers.
- [ ] Add journal.
- [ ] Add badge for 7-day streak.
- [ ] Add upgrade recommendations.
- [ ] Add payment failure flow.
- [ ] Add QR admin verification.
- [ ] Add analytics dashboard.
- [ ] Add admin email test.
- [ ] Add cancellation flow.

### Phase 3: 61–90 days

- [ ] Add 90-day report.
- [ ] Add 120-day extension offer.
- [ ] Add 1-year membership product.
- [ ] Add annual content structure.
- [ ] Add SEO content hub.
- [ ] Add public quiz lead capture.
- [ ] Add 1:1 application trigger.
- [ ] Add user recommendation endpoint.
- [ ] Add export PDF report.
- [ ] Add admin content calendar.
- [ ] Test 90-day completion simulation.

### Phase 4: 91–120 days

- [ ] Add 120-day integration content.
- [ ] Add annual dashboard mode.
- [ ] Add quarterly report.
- [ ] Add 3-year product.
- [ ] Add 12-quarter roadmap logic.
- [ ] Add annual renewal email.
- [ ] Add mentor path status.
- [ ] Add admin support queue.
- [ ] Add advanced segmentation.
- [ ] Add automation health monitor.

### Phase 5: 120 days to 1 year

- [ ] Complete 365 lessons.
- [ ] Complete 52 weekly arcs.
- [ ] Complete 12 monthly reports.
- [ ] Complete annual report generator.
- [ ] Complete 100 SEO public articles.
- [ ] Complete 52 newsletters.
- [ ] Complete retention dashboard.
- [ ] Complete churn analysis.
- [ ] Complete content refresh workflow.
- [ ] Complete 3-year Year 1 content.
- [ ] Complete quarterly roadmap for Year 2 and Year 3.

---

## 16. DEFINITION OF DONE

The system is ready for launch when:

1. A new user can register by magic link.
2. A new user can complete onboarding.
3. A new user can access free content.
4. A paid user can pay by Stripe.
5. A paid user can pay by PayPal.
6. A Vietnam user can create QR invoice and be manually approved.
7. A paid user sees today lesson.
8. A paid user can check in.
9. A missed check-in triggers email.
10. A completed week generates report.
11. A completed month generates report.
12. Admin can create/edit/publish a lesson.
13. Admin can create/test an email.
14. Admin can see payment and email logs.
15. User can cancel or manage billing.
16. User can request 1:1 if eligible.
17. The first 90 days of content exist.
18. The system has no dead-end CTA.
19. Public pages link to free registration.
20. Paid dashboard always shows next action.

---

## 17. RISK CONTROL

### Risk 1: Content not deep enough

Control:

1. Enforce lesson template.
2. Require practice and check-in.
3. Founder review for paid lessons.
4. Track lesson completion and drop-off.
5. Improve lessons monthly from data.

### Risk 2: Users do not check in

Control:

1. Check-in under 2 minutes.
2. Show streak.
3. Send reminders.
4. Let user restart without guilt.
5. Unlock reports only with minimum check-ins.

### Risk 3: Email fails

Control:

1. Log every email event.
2. Retry failed events.
3. Admin email health panel.
4. Test email before publish.
5. Weekly email deliverability review.

### Risk 4: System too complex

Control:

1. Launch with 3 products first.
2. Add advanced features only after daily flow works.
3. Keep admin simple.
4. Build QR as invoice first.
5. Do not build native mobile app until retention data is proven.

---

## 18. FINAL REPO NOTE

This file is the master operating plan for the automated learning and membership system of nguyenlananh.com.

Recommended repo path:

```text
/docs/NGUYENLANANH_90_DAY_TO_3_YEAR_AUTOMATION_MASTER_PLAN_2026.md
```

Recommended next files:

```text
/docs/NGUYENLANANH_DATABASE_SCHEMA_V1.sql
/docs/NGUYENLANANH_EMAIL_TEMPLATE_LIBRARY_2026.md
/docs/NGUYENLANANH_90_DAY_CONTENT_SEED_2026.json
/docs/NGUYENLANANH_ADMIN_CONTENT_STUDIO_SPEC_2026.md
/docs/NGUYENLANANH_PAYMENT_AND_BILLING_SPEC_2026.md
```

The correct build order is:

```text
Auth
→ User Profile
→ Content
→ Check-in
→ Progress
→ Email
→ Payment
→ Reports
→ Upgrade
→ 1:1
→ Annual
→ 3-Year
```

Do not build the 3-year experience before the 90-day system works in production.
