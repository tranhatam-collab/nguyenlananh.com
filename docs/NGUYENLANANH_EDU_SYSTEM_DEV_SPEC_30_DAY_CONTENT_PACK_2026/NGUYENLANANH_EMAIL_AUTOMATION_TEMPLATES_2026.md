# NGUYENLANANH_EMAIL_AUTOMATION_TEMPLATES_2026.md

**Dự án:** nguyenlananh.com  
**Mục tiêu:** Email automation 100% theo gói, theo hành vi, theo check-in và theo thanh toán.  
**Sender đề xuất:** Nguyễn Lan Anh <hanhtrinh@email.iai.one>  
**Tone:** Nhắc nhẹ, rõ, không tạo cảm giác tội lỗi, không bán gấp.

---

## 0. Nguyên tắc email

1. Không quá 2 email/ngày/user trong launch.
2. Không dùng từ ngữ gây áp lực như “bạn thất bại”, “bạn đã bỏ cuộc”.
3. Nếu user bỏ check-in, email phải mở đường quay lại bằng một bước nhỏ.
4. Mọi email phải có unsubscribe.
5. Email không được hứa kết quả tuyệt đối.
6. Payment email phải rõ số tiền, gói, trạng thái, thời hạn.
7. QR Việt Nam phải ghi rõ nội dung chuyển khoản.
8. Daily email chỉ dẫn user quay lại app, không nhồi toàn bộ bài học vào email.

---

## 1. Event matrix

| Event key | Khi nào gửi | Template | Ghi chú |
|---|---|---|---|
| auth.magic_link | User nhập email | AUTH_MAGIC_LINK_VI | Bắt buộc |
| onboarding.day0 | Sau login lần đầu | ONBOARDING_DAY0_VI | Bắt buộc |
| profile.incomplete_24h | Chưa hoàn thiện profile sau 24h | PROFILE_INCOMPLETE_VI | Nhắc nhẹ |
| lesson.daily | Mỗi ngày 07:00 | LESSON_DAILY_VI | Theo lesson hiện tại |
| checkin.same_day | 19:00 chưa check-in | CHECKIN_SAME_DAY_VI | Nhắc trong ngày |
| checkin.missed_1d | Lỡ 1 ngày | CHECKIN_MISSED_1D_VI | Quay lại nhẹ |
| checkin.missed_3d | Lỡ 3 ngày | CHECKIN_MISSED_3D_VI | Reset bước nhỏ |
| checkin.missed_7d | Lỡ 7 ngày | CHECKIN_MISSED_7D_VI | Re-entry |
| report.weekly | Chủ nhật 19:30 | WEEKLY_REPORT_VI | Tóm tắt |
| payment.success | Thanh toán thành công | PAYMENT_SUCCESS_VI | Bắt buộc |
| payment.pending_qr | Tạo QR pending | PAYMENT_PENDING_QR_VI | Bắt buộc |
| payment.failed | Payment failed | PAYMENT_FAILED_VI | Bắt buộc |
| upgrade.soft | Đủ điều kiện upgrade | UPGRADE_SOFT_VI | Không ép mua |
| subscription.renewal | Trước renewal 7 ngày | RENEWAL_REMINDER_VI | Minh bạch |
| subscription.cancelled | Sau khi hủy | CANCELLED_VI | Giữ quan hệ |

---

## 2. Variables chung

```json
{
  "first_name": "Lan",
  "magic_link_url": "https://www.nguyenlananh.com/auth/callback?...",
  "site_url": "https://www.nguyenlananh.com",
  "app_today_url": "https://www.nguyenlananh.com/app/today",
  "profile_url": "https://www.nguyenlananh.com/app/profile",
  "lesson_title": "Nhìn lại điểm đang đứng",
  "lesson_day": 1,
  "lesson_preview": "Bạn không thể đi tiếp nếu vẫn giả vờ rằng mình không đang mắc kẹt.",
  "checkin_url": "https://www.nguyenlananh.com/app/check-in",
  "progress_url": "https://www.nguyenlananh.com/app/progress",
  "billing_url": "https://www.nguyenlananh.com/app/billing",
  "plan_name": "START",
  "amount": "$19",
  "amount_vnd": "490000",
  "billing_interval": "monthly",
  "period_end": "2026-05-25",
  "renewal_date": "2026-05-25",
  "order_code": "NLA-START-8F3K2",
  "qr_image_url": "https://...",
  "transfer_content": "NLA-START-8F3K2",
  "lessons_opened": 5,
  "checkins_count": 4,
  "practice_minutes": 55,
  "strongest_pattern": "Bạn thường đi tốt hơn khi thực hành buổi sáng.",
  "next_week_focus": "Giữ một nhịp nhỏ mỗi tối.",
  "unsubscribe_url": "https://www.nguyenlananh.com/email/unsubscribe?token=..."
}
```

---

## 3. Templates

### 3.1 AUTH_MAGIC_LINK_VI

**Subject:** Link vào hành trình của bạn  
**Preview:** Bấm một lần để vào nguyenlananh.com, không cần mật khẩu.

```md
Chào bạn,

Bạn vừa yêu cầu vào hệ hành trình tại nguyenlananh.com.

Bấm vào link bên dưới để vào hệ:

{{magic_link_url}}

Link này chỉ nên dùng bởi chính bạn. Nếu bạn không yêu cầu email này, bạn có thể bỏ qua.

Đi chậm. Đi thật. Đi tiếp.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.2 ONBOARDING_DAY0_VI

**Subject:** Bạn đã vào hệ. Bước đầu tiên rất nhẹ.  
**Preview:** Không cần trả tiền ngay. Hãy hoàn thiện điểm bắt đầu của bạn trước.

```md
Chào {{first_name}},

Bạn đã vào hệ hành trình.

Bước đầu tiên không phải là mua một gói. Bước đầu tiên là để hệ hiểu bạn đang ở đâu, đang lặp điều gì, và cần bắt đầu bằng nhịp nào.

Hãy hoàn thiện profile đồng hành tại đây:

{{profile_url}}

Sau đó, bạn sẽ thấy bài học đầu tiên và lộ trình 30 ngày mở ra theo đúng thứ tự.

Không cần hoàn hảo. Chỉ cần bắt đầu thật.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.3 PROFILE_INCOMPLETE_VI

**Subject:** Bạn còn một bước nhỏ để hệ hiểu bạn hơn  
**Preview:** Hoàn thiện profile để mở bài học đầu tiên.

```md
Chào {{first_name}},

Bạn đã vào hệ, nhưng profile đồng hành của bạn vẫn chưa hoàn tất.

Profile này không dùng để đánh giá bạn. Nó giúp hệ đặt bạn vào đúng điểm bắt đầu, để bạn không bị thả vào một thư viện quá rộng.

Bạn có thể hoàn thiện tại đây:

{{profile_url}}

Nếu hôm nay bạn bận, chỉ cần trả lời thật ngắn. Điều quan trọng là bắt đầu bằng sự thật, không phải bằng câu trả lời đẹp.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.4 LESSON_DAILY_VI

**Subject:** Ngày {{lesson_day}}: {{lesson_title}}  
**Preview:** {{lesson_preview}}

```md
Chào {{first_name}},

Bài học hôm nay đã mở:

**Ngày {{lesson_day}}: {{lesson_title}}**

Hôm nay bạn không cần làm nhiều. Chỉ cần đọc, làm một bước nhỏ, rồi check-in để hệ biết bạn vẫn đang đi tiếp.

Mở bài học hôm nay:

{{app_today_url}}

Một hành trình thật không cần bạn hoàn hảo. Nó chỉ cần bạn quay lại đều hơn hôm qua.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.5 CHECKIN_SAME_DAY_VI

**Subject:** Còn một check-in nhỏ cho hôm nay  
**Preview:** Chỉ cần 90 giây để giữ dấu vết hôm nay.

```md
Chào {{first_name}},

Hôm nay bạn đã có bài học, nhưng check-in vẫn chưa được ghi lại.

Check-in không phải bài kiểm tra. Nó chỉ là một dấu vết nhỏ để bạn không trôi qua ngày mà không nhìn lại.

Bạn có thể check-in tại đây:

{{checkin_url}}

Nếu hôm nay quá mệt, chỉ cần viết một câu thật nhất.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.6 CHECKIN_MISSED_1D_VI

**Subject:** Hôm qua lỡ cũng không sao. Quay lại bằng một bước nhỏ.  
**Preview:** Bạn không cần bắt đầu lại từ đầu.

```md
Chào {{first_name}},

Bạn đã lỡ một ngày check-in.

Điều này không làm hỏng hành trình. Điều quan trọng là bạn quay lại bằng một bước nhỏ, thay vì biến một ngày lỡ thành một tuần biến mất.

Hôm nay hãy mở lại bài học hiện tại và chỉ trả lời một câu:

“Hôm nay tôi có thể làm một điều nhỏ nào?”

Quay lại tại đây:

{{app_today_url}}

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.7 CHECKIN_MISSED_3D_VI

**Subject:** Mình thu nhỏ lại. Chỉ một bước trong 5 phút.  
**Preview:** Khi nhịp bị đứt, đừng cố quay lại bằng việc quá lớn.

```md
Chào {{first_name}},

Bạn đã vắng 3 ngày.

Có thể bạn bận. Có thể bạn mệt. Có thể một vòng lặp cũ đã kéo bạn đi. Hệ không ở đây để trách bạn.

Hôm nay mình thu nhỏ lại:

1. Mở dashboard.
2. Đọc câu nhắc hôm nay.
3. Viết một check-in ngắn.
4. Làm một hành động 5 phút.

Quay lại tại đây:

{{app_today_url}}

Bạn không cần làm lại tất cả. Bạn chỉ cần nối lại nhịp.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.8 CHECKIN_MISSED_7D_VI

**Subject:** Nếu bạn muốn quay lại, bắt đầu từ đây  
**Preview:** Không cần giải thích. Chỉ cần chọn lại một bước.

```md
Chào {{first_name}},

Bạn đã vắng 7 ngày.

Khi một người rời nhịp, thường không phải vì họ không muốn đi tiếp. Nhiều khi đời sống kéo họ về vòng cũ quá nhanh.

Nếu bạn muốn quay lại, hệ đã chuẩn bị một lối vào nhẹ:

{{app_today_url}}

Bạn không cần giải thích. Không cần bù đủ. Không cần đọc lại tất cả.

Chỉ cần mở lại, chọn một bước nhỏ, và để hôm nay là ngày nối lại.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.9 WEEKLY_REPORT_VI

**Subject:** Báo cáo tuần của bạn: điều đã thấy, điều cần giữ  
**Preview:** Một bản nhìn lại ngắn để bạn không đi trong mơ hồ.

```md
Chào {{first_name}},

Đây là bản nhìn lại tuần của bạn.

- Số ngày mở bài: {{lessons_opened}}
- Số check-in: {{checkins_count}}
- Số phút thực hành: {{practice_minutes}}
- Nhịp nổi bật: {{strongest_pattern}}
- Gợi ý tuần tới: {{next_week_focus}}

Điều đáng giữ lại không phải là con số đẹp. Điều đáng giữ lại là việc bạn đã có dữ liệu thật về mình.

Mở báo cáo đầy đủ:

{{progress_url}}

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.10 PAYMENT_SUCCESS_VI

**Subject:** Thanh toán thành công: {{plan_name}} đã được mở khóa  
**Preview:** Hệ đã cập nhật quyền truy cập cho bạn.

```md
Chào {{first_name}},

Thanh toán của bạn đã thành công.

Gói: {{plan_name}}  
Số tiền: {{amount}}  
Chu kỳ: {{billing_interval}}  
Hiệu lực đến: {{period_end}}

Bạn có thể tiếp tục hành trình tại đây:

{{app_today_url}}

Nếu có bất kỳ sai lệch nào về gói hoặc thời hạn, hãy phản hồi email này để được kiểm tra.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.11 PAYMENT_PENDING_QR_VI

**Subject:** Mã QR thanh toán của bạn đã sẵn sàng  
**Preview:** Vui lòng chuyển đúng nội dung để hệ xác nhận nhanh hơn.

```md
Chào {{first_name}},

Mã QR cho gói {{plan_name}} đã được tạo.

Số tiền: {{amount_vnd}} VND  
Nội dung chuyển khoản bắt buộc: **{{transfer_content}}**

Vui lòng quét QR tại đây:

{{qr_image_url}}

Sau khi thanh toán được xác nhận, hệ sẽ mở quyền truy cập cho bạn. Nếu chuyển khoản nhưng chưa thấy cập nhật, hãy gửi lại biên lai kèm mã đơn:

{{order_code}}

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.12 PAYMENT_FAILED_VI

**Subject:** Thanh toán chưa hoàn tất  
**Preview:** Bạn có thể thử lại hoặc chọn phương thức khác.

```md
Chào {{first_name}},

Thanh toán cho gói {{plan_name}} chưa hoàn tất.

Bạn có thể thử lại tại đây:

{{billing_url}}

Nếu thẻ hoặc PayPal không phù hợp, bạn có thể chọn QR Việt Nam nếu phương thức này đang được bật cho tài khoản của bạn.

Không có nội dung nào bị mất. Hành trình của bạn vẫn được giữ lại.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.13 UPGRADE_SOFT_VI

**Subject:** Bạn đã đi đủ xa để mở lớp tiếp theo  
**Preview:** Không cần vội. Đây chỉ là một lời mời đúng thời điểm.

```md
Chào {{first_name}},

Bạn đã hoàn thành một số bước quan trọng trong hành trình hiện tại.

Nếu bạn muốn đi sâu hơn, lớp tiếp theo đã sẵn sàng để mở. Lớp này phù hợp khi bạn không chỉ muốn đọc và check-in, mà muốn giữ nhịp dài hơn, có báo cáo rõ hơn, và đi sâu vào các vòng lặp đang lặp lại.

Xem lựa chọn phù hợp:

{{billing_url}}

Bạn không cần nâng cấp nếu chưa sẵn sàng. Điều quan trọng nhất vẫn là giữ một nhịp thật.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.14 RENEWAL_REMINDER_VI

**Subject:** Gói {{plan_name}} sẽ gia hạn trong 7 ngày  
**Preview:** Kiểm tra lại trước khi hệ tự gia hạn.

```md
Chào {{first_name}},

Gói {{plan_name}} của bạn dự kiến gia hạn vào ngày {{renewal_date}}.

Số tiền dự kiến: {{amount}}  
Chu kỳ: {{billing_interval}}

Bạn có thể quản lý gói tại đây:

{{billing_url}}

Email này chỉ để minh bạch trước kỳ gia hạn.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

### 3.15 CANCELLED_VI

**Subject:** Gói của bạn đã được hủy  
**Preview:** Hành trình và dữ liệu của bạn vẫn được giữ theo chính sách tài khoản.

```md
Chào {{first_name}},

Gói {{plan_name}} của bạn đã được hủy.

Nếu gói còn thời hạn, bạn vẫn có thể sử dụng đến ngày:

{{period_end}}

Bạn có thể quay lại hành trình miễn phí bất cứ lúc nào:

{{app_today_url}}

Cảm ơn bạn đã từng đi cùng hệ. Dù bạn tiếp tục ở đây hay tự giữ nhịp bên ngoài, mong bạn vẫn giữ một bước thật mỗi ngày.

Nguyễn Lan Anh

Hủy nhận email: {{unsubscribe_url}}
```

---

## 4. Admin QA cho email

Trước launch, dev phải test:

- Magic link đến inbox.
- Magic link không vào spam.
- SPF/DKIM/DMARC đã pass.
- Daily lesson gửi đúng user.
- Reminder không gửi cho user đã check-in.
- Missed 3d không gửi nếu user đã quay lại.
- Payment success không gửi khi webhook fail signature.
- QR pending có đúng order code.
- Unsubscribe hoạt động.
- Admin nhìn được log từng email.
