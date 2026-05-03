# NGUYENLANANH.COM — BILINGUAL EMAIL AUTOMATION TEMPLATES
Date: 2026-04-09
Status: Production-ready copy (VI default + EN-US fallback)

## 1) Language Policy (lock)
- Default send language: `vi`.
- If user profile has `preferred_language=en-US` -> send EN.
- If chưa có profile language -> fallback theo `Accept-Language` tại thời điểm đăng ký.
- Mọi email bắt buộc có:
  - `subject_vi`, `subject_en`
  - `body_text_vi`, `body_text_en`
  - `body_html_vi`, `body_html_en` (nếu hệ thống có HTML mode)

## 2) Sender Matrix
- `noreply@nguyenlananh.com`: system, auth, journey, reminder
- `support@nguyenlananh.com`: contact form auto-reply, support follow-up
- `pay@nguyenlananh.com`: payment receipt, failed payment, renewal, invoice
- `refund@nguyenlananh.com`: refund & dispute emails

Nếu chưa tạo đủ mailbox, tạm dùng:
- system/support -> `lienhe@nguyenlananh.com`
- payment/refund -> `pay@nguyenlananh.com`

## 3) Required Variables
- `{{first_name}}`
- `{{email}}`
- `{{magic_link}}`
- `{{magic_link_expire_minutes}}` (default `15`)
- `{{plan_name}}`
- `{{amount}}`
- `{{currency}}` (USD)
- `{{order_id}}`
- `{{capture_id}}`
- `{{next_step_url}}`
- `{{support_email}}`
- `{{contact_url}}`
- `{{dashboard_url}}`
- `{{unsubscribe_url}}` (with retention emails)
- `{{reminder_pause_url}}`
- `{{reminder_settings_url}}`
- `{{five_minute_step}}`

---

## TEMPLATE 01 — Welcome + Magic Link
Trigger: user completed payment + membership created
From: `noreply@...`

Subject VI:
`[Nguyenlananh.com] Chào mừng bạn vào hệ hành trình — Magic link của bạn`

Subject EN:
`[Nguyenlananh.com] Welcome to your journey system — Your magic link`

Body VI (text):
Chào {{first_name}},

Bạn đã vào hệ thành viên thành công.
Gói hiện tại: {{plan_name}}

Magic link đăng nhập (hiệu lực {{magic_link_expire_minutes}} phút):
{{magic_link}}

Sau khi vào hệ, bạn có thể bắt đầu tại:
{{dashboard_url}}

Nếu bạn không thực hiện hành động này, vui lòng liên hệ {{support_email}}.

Nguyenlananh.com

Body EN (text):
Hi {{first_name}},

Your membership is now active.
Current plan: {{plan_name}}

Your login magic link (valid for {{magic_link_expire_minutes}} minutes):
{{magic_link}}

Start here:
{{dashboard_url}}

If this was not you, contact us at {{support_email}}.

Nguyenlananh.com

---

## TEMPLATE 02 — Magic Link Resend
Trigger: user clicks “resend magic link”
From: `noreply@...`

Subject VI:
`[Nguyenlananh.com] Magic link mới của bạn`

Subject EN:
`[Nguyenlananh.com] Your new magic link`

Body VI:
Chào {{first_name}},

Đây là magic link mới để đăng nhập:
{{magic_link}}

Link có hiệu lực trong {{magic_link_expire_minutes}} phút và chỉ dùng 1 lần.

Body EN:
Hi {{first_name}},

Here is your new login magic link:
{{magic_link}}

This link expires in {{magic_link_expire_minutes}} minutes and can be used once.

---

## TEMPLATE 03 — Payment Received (Receipt)
Trigger: `PAYMENT.CAPTURE.COMPLETED`
From: `pay@...`

Subject VI:
`[Biên nhận] Thanh toán thành công #{{order_id}}`

Subject EN:
`[Receipt] Payment successful #{{order_id}}`

Body VI:
Chào {{first_name}},

Chúng tôi đã nhận thanh toán thành công.
- Gói: {{plan_name}}
- Số tiền: {{amount}} {{currency}}
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}

Quyền truy cập của bạn đã được kích hoạt.
Vào hệ tại: {{dashboard_url}}

Body EN:
Hi {{first_name}},

Your payment has been successfully received.
- Plan: {{plan_name}}
- Amount: {{amount}} {{currency}}
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}

Your access is now active.
Enter your dashboard: {{dashboard_url}}

---

## TEMPLATE 04 — Payment Failed / Denied
Trigger: `PAYMENT.CAPTURE.DENIED`
From: `pay@...`

Subject VI:
`[Nguyenlananh.com] Thanh toán chưa thành công — vui lòng thử lại`

Subject EN:
`[Nguyenlananh.com] Payment not completed — please try again`

Body VI:
Chào {{first_name}},

Thanh toán cho đơn {{order_id}} chưa thành công.
Bạn có thể thử lại tại:
{{next_step_url}}

Nếu cần hỗ trợ, liên hệ {{support_email}}.

Body EN:
Hi {{first_name}},

Payment for order {{order_id}} was not completed.
You can retry here:
{{next_step_url}}

Need help? Contact {{support_email}}.

---

## TEMPLATE 05 — Day 1 Journey Start
Trigger: 24h after successful activation
From: `noreply@...`

Subject VI:
`Ngày 1: Bắt đầu từ một bước thật`

Subject EN:
`Day 1: Start with one real step`

Body VI:
Chào {{first_name}},

Hôm nay, bạn không cần làm nhiều.
Bạn chỉ cần một bước thật:
1) Quan sát
2) Dọn
3) Viết
4) Hành động

Vào dashboard:
{{dashboard_url}}

Body EN:
Hi {{first_name}},

You do not need to do a lot today.
You only need one real step:
1) Observe
2) Clean
3) Write
4) Act

Open your dashboard:
{{dashboard_url}}

---

## TEMPLATE 06 — Day 3 Retention
Trigger: Day 3 after activation
From: `noreply@...`

Subject VI:
`Ngày 3: Một bước nhỏ là đủ`

Subject EN:
`Day 3: One small step is enough`

Body VI:
Chào {{first_name}},

Nếu hôm nay bạn thấy mình đang né, đó không phải là thất bại.
Hãy làm một bước 5 phút:
{{five_minute_step}}

Check-in tại: {{dashboard_url}}
Tạm dừng nhắc 7 ngày: {{reminder_pause_url}}
Đổi mức nhắc: {{reminder_settings_url}}

Body EN:
Hi {{first_name}},

If you notice yourself avoiding today, that is not failure.
Take one 5-minute step:
{{five_minute_step}}

Check in here: {{dashboard_url}}
Pause reminders for 7 days: {{reminder_pause_url}}
Change reminder level: {{reminder_settings_url}}

---

## TEMPLATE 07 — Weekly Check-in
Trigger: every 7 days for active members
From: `noreply@...`

Subject VI:
`[Tuần này] Tiến độ hành trình của bạn`

Subject EN:
`[This week] Your journey progress`

Body VI:
Chào {{first_name}},

Đây là nhắc nhẹ theo mức bạn đã chọn.
Tuần này, chỉ cần nhìn rõ một điểm né và làm một bước thật.

Vào hệ: {{dashboard_url}}
Tạm dừng nhắc 7 ngày: {{reminder_pause_url}}
Hỗ trợ: {{support_email}}

Body EN:
Hi {{first_name}},

This is a gentle reminder based on the level you chose.
This week, notice one avoidance point and take one real step.

Open dashboard: {{dashboard_url}}
Pause reminders for 7 days: {{reminder_pause_url}}
Support: {{support_email}}

---

## TEMPLATE 08 — Renewal Reminder (14 days)
Trigger: subscription expires in 14 days
From: `pay@...`

Subject VI:
`Nhắc gia hạn: tài khoản của bạn còn 14 ngày`

Subject EN:
`Renewal reminder: your access expires in 14 days`

Body VI:
Chào {{first_name}},

Gói {{plan_name}} của bạn sẽ hết hạn sau 14 ngày.
Gia hạn tại: {{next_step_url}}

Body EN:
Hi {{first_name}},

Your {{plan_name}} access expires in 14 days.
Renew here: {{next_step_url}}

---

## TEMPLATE 09 — Renewal Reminder (3 days)
Trigger: expires in 3 days
From: `pay@...`

Subject VI:
`Nhắc gia hạn: còn 3 ngày để giữ quyền truy cập`

Subject EN:
`Renewal reminder: 3 days left to keep access`

Body VI:
Chào {{first_name}},

Gói của bạn còn 3 ngày.
Nếu bạn muốn tiếp tục hành trình không gián đoạn, vui lòng gia hạn tại:
{{next_step_url}}

Body EN:
Hi {{first_name}},

Your plan has 3 days left.
To continue without interruption, renew at:
{{next_step_url}}

---

## TEMPLATE 10 — Membership Expired
Trigger: status changed to expired
From: `pay@...`

Subject VI:
`Quyền truy cập đã hết hạn`

Subject EN:
`Your access has expired`

Body VI:
Chào {{first_name}},

Quyền truy cập của bạn đã hết hạn.
Bạn có thể kích hoạt lại tại:
{{next_step_url}}

Body EN:
Hi {{first_name}},

Your access has expired.
You can reactivate here:
{{next_step_url}}

---

## TEMPLATE 11 — Refund Completed
Trigger: `PAYMENT.CAPTURE.REFUNDED`
From: `refund@...`

Subject VI:
`[Refund] Hoàn tiền thành công #{{order_id}}`

Subject EN:
`[Refund] Refund completed #{{order_id}}`

Body VI:
Chào {{first_name}},

Yêu cầu hoàn tiền của bạn đã được xử lý thành công.
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}
- Số tiền hoàn: {{amount}} {{currency}}

Nếu bạn cần hỗ trợ thêm, liên hệ {{support_email}}.

Body EN:
Hi {{first_name}},

Your refund has been completed.
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}
- Refunded amount: {{amount}} {{currency}}

If you need help, contact {{support_email}}.

---

## TEMPLATE 12 — Contact Form Auto-reply
Trigger: new contact form submitted
From: `support@...`

Subject VI:
`[Nguyenlananh.com] Chúng tôi đã nhận lời nhắn của bạn`

Subject EN:
`[Nguyenlananh.com] We received your message`

Body VI:
Chào {{first_name}},

Chúng tôi đã nhận được lời nhắn của bạn và sẽ phản hồi sớm.
Trong lúc chờ, bạn có thể đọc thêm:
{{contact_url}}

Body EN:
Hi {{first_name}},

We received your message and will reply soon.
Meanwhile, you can explore here:
{{contact_url}}

---

## TEMPLATE 13 — Internal Payment Alert (Ops)
Trigger: payment denied / webhook verification failed / capture mismatch
From: `noreply@...`
To: `ops@..., dev@...`

Subject:
`[ALERT][NLA-PAY] {{event_type}} - {{order_id}}`

Body:
- Event: {{event_type}}
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}
- Email: {{email}}
- Time: {{timestamp}}
- Action URL: {{next_step_url}}

---

## TEMPLATE 14 — Webhook Security Warning
Trigger: invalid PayPal webhook signature
From: `noreply@...`
To: `dev@..., ops@...`

Subject:
`[SECURITY][NLA-PAY] Invalid PayPal webhook signature`

Body:
- Endpoint: /api/paypal/webhook
- Received at: {{timestamp}}
- Transmission ID: {{transmission_id}}
- Order ID (if any): {{order_id}}
- IP: {{ip}}
- Request archived: {{log_url}}

---

## TEMPLATE 15 — Manual Review Queue Notice
Trigger: capture completed but local DB update failed
From: `noreply@...`
To: `ops@..., dev@...`

Subject:
`[ACTION REQUIRED][NLA-PAY] Manual review needed - {{order_id}}`

Body:
- Status: Payment captured, membership not fulfilled
- Order ID: {{order_id}}
- Capture ID: {{capture_id}}
- User: {{email}}
- Retry endpoint: {{next_step_url}}
- Owner: Ops on-call

---

## 4) Minimal Send Schedule (Phase 1)
- Transactional (immediate): T01, T02, T03, T04, T11, T12, T13, T14, T15
- Lifecycle:
  - Day 1: T05
  - Day 3: T06
  - Weekly: T07
  - D-14: T08
  - D-3: T09
  - Expired day: T10

## 5) Implementation Note
- Email queue key: `email_type + user_id + order_id` để chống gửi trùng.
- Mỗi email lưu `message_id`, `language`, `template_version`, `sent_at`.
- Retry policy: 3 lần (5m, 30m, 2h), sau đó alert T13.
