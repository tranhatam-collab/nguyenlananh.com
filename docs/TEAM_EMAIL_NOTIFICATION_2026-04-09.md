# TEAM EMAIL NOTICE — NGUYENLANANH.COM
Date: 2026-04-09
Status: Ready to send

## Recipients
- dev@internal (hoặc nhóm kỹ thuật)
- content@internal (hoặc nhóm nội dung)
- seo@internal (hoặc nhóm SEO)
- ops@internal (hoặc nhóm vận hành)

## Subject
[NLA] Mail + Payment + Bilingual Email Automation Lock (2026-04-09)

## Body (VI)
Chào team,

Đã khóa trạng thái hệ mail và checkout cho nguyenlananh.com ngày 09/04/2026:
- Mailbox hoạt động: lienhe@nguyenlananh.com, pay@nguyenlananh.com
- Alias hoạt động:
  - contact@ -> lienhe@
  - admin@ -> lienhe@
  - billing@ -> pay@
  - payments@ -> pay@
- DNS mail chuẩn: MX mail.iai.one, SPF/DKIM/DMARC OK
- Smoke test gửi mail tới pay/billing/payments đã thành công

Cập nhật kỹ thuật vừa áp dụng trên web:
- Checkout PayPal trên frontend đã đổi business receiver sang pay@nguyenlananh.com (không dùng lienhe@ nữa).

Hạng mục bắt buộc để chạy checkout tự động production (không manual confirm):
1) PayPal Business (pay@...) verify email + KYC + bank đầy đủ
2) REST App Live + cấp biến môi trường:
   - PAYPAL_CLIENT_ID
   - PAYPAL_CLIENT_SECRET
3) Backend endpoint bắt buộc:
   - POST /api/paypal/create-order
   - POST /api/paypal/capture-order
   - POST /api/paypal/webhook
4) Webhook security:
   - verify chữ ký webhook trước khi xử lý
   - idempotency chống double-capture
5) Event bắt buộc subscribe:
   - CHECKOUT.ORDER.APPROVED
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - PAYMENT.CAPTURE.REFUNDED
6) Fulfillment rule:
   - chỉ cấp quyền membership sau khi capture COMPLETED

Đề xuất tách mailbox vận hành:
- noreply@nguyenlananh.com (email hệ thống)
- support@nguyenlananh.com (CSKH)
- refund@nguyenlananh.com (hoàn tiền/đối soát)

Bộ mẫu email tự động song ngữ đã chốt tại:
- docs/BILINGUAL_EMAIL_AUTOMATION_TEMPLATES.md

Thanks team.
