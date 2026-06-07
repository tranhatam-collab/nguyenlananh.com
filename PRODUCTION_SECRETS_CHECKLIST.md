# Production Secrets Checklist — nguyenlananh.com

## D1 Database Migration (CẦN LÀM TRƯỚC KHI DEPLOY)

```bash
# Apply schema update cho member_progress table
wrangler d1 execute nguyenlananh-payments-prod --env=production --file=database/payment_gateway_d1.sql
```

---

## Secrets cần cấu hình qua Wrangler hoặc Cloudflare Dashboard

### Email (BẮT BUỘC — chọn 1 trong 2)
- [ ] `MAIL_API_KEY` — API key từ mail.iai.one
- [ ] `RESEND_API_KEY` — API key từ Resend

### PayPal (BẮT BUỘC cho thanh toán USD)
- [ ] `PAYPAL_CLIENT_ID`
- [ ] `PAYPAL_CLIENT_SECRET`
- [ ] `PAYPAL_WEBHOOK_ID`
- [ ] `PAYPAL_MERCHANT_EMAIL`

### Stripe (BẮT BUỘC cho thanh toán USD)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

### VietQR (BẮT BUỘC cho thanh toán VND)
- [ ] `VIETQR_BANK_BIN`
- [ ] `VIETQR_ACCOUNT_NO`
- [ ] `VIETQR_ACCOUNT_NAME`

### Google OAuth (BẮT BUỘC cho đăng nhập Google)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI` (ví dụ: `https://www.nguyenlananh.com/api/auth/google/callback`)
- [ ] `GOOGLE_OAUTH_STATE_SECRET` (tự tạo, 32+ bytes)

### Auth & Session (BẮT BUỘC)
- [ ] `MAGIC_LINK_SECRET` (tự tạo, 32+ bytes — dùng cho cả magic link và session JWT)

### Admin (BẮT BUỘC cho xác nhận VietQR thủ công)
- [ ] `PAYMENTS_ADMIN_KEY` (tự tạo, 32+ bytes)

### Optional — Các cổng thanh toán VN khác (nếu cần)
- [ ] `MOMO_PARTNER_CODE`
- [ ] `MOMO_ACCESS_KEY`
- [ ] `MOMO_SECRET_KEY`
- [ ] `VNPAY_TMN_CODE`
- [ ] `VNPAY_HASH_SECRET`
- [ ] `ZALOPAY_APP_ID`
- [ ] `ZALOPAY_KEY1`
- [ ] `ZALOPAY_KEY2`

---

## Test checklist sau khi cấu hình secrets

### Auth
- [ ] Magic link: đăng ký → nhận email → click magic link → vào `/members/start/`
- [ ] Google OAuth: click nút Google → đăng nhập → callback → vào `/members/start/`
- [ ] Logout: click Đăng xuất → redirect về join/

### Payment
- [ ] Chọn gói year1 → tạo checkout VietQR → hiển thị QR
- [ ] Chọn gói year2 → tạo checkout Stripe → redirect Stripe test
- [ ] Chọn gói year3 → tạo checkout PayPal → redirect PayPal test
- [ ] Webhook: test payment với Stripe/PayPal test mode → verify order fulfilled
- [ ] Admin confirm: vào `/admin/payments/` → nhập admin key → confirm VietQR order

### Progress Sync
- [ ] Check-in practice → reload page → progress vẫn giữ
- [ ] Đổi thiết bị (hoặc xóa localStorage) → load lại → progress từ server vẫn còn

---

## Lệnh Wrangler để set secret

```bash
wrangler secret put <SECRET_NAME> --env=production
```
