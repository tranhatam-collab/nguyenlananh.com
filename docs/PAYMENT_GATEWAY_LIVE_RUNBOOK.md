# PAYMENT_GATEWAY_LIVE_RUNBOOK.md

Updated: 2026-04-11
Status: payment stack wired into repo, waiting for production secrets + merchant onboarding

## 1. Kien truc da duoc gan vao repo

Repo hien tai van la static site tren Cloudflare Pages, nhung da co them payment backend bang `functions/` de chay cung domain:

- `GET /api/payments/providers`
- `POST /api/payments/create-checkout`
- `POST /api/payments/finalize`
- `POST /api/payments/paypal/webhook`
- `POST /api/payments/stripe/webhook`
- `POST /api/auth/magic-links/resend`
- `POST /api/auth/magic-links/consume`

Thanh phan chinh:

- frontend checkout: `join/`, `en/join/`, `join/success/`, `join/cancel/`, `join/retry/`
- backend runtime: `functions/**`
- database schema: `database/payment_gateway_d1.sql`

## 2. Payment stack hien tai

### Da build xong runtime

1. `PayPal`
2. `Stripe`

### Da co cho cam vao UI/API registry, chua viet adapter runtime

1. `MoMo`
2. `VNPay`
3. `ZaloPay`

Nghia la:

- trang join da cho chon nhieu cong
- runtime live thuc su hien tai san sang cho `PayPal + Stripe`
- cong Viet Nam se bat tiep theo merchant va docs API ma ban mo duoc

## 3. Domain API production

Khuyen nghi chot:

```txt
API_BASE_URL=https://www.nguyenlananh.com/api
ENV_DEPLOY_TARGET=cloudflare-pages
```

Vi repo nay dang deploy bang Cloudflare Pages, route API production se la:

- `https://www.nguyenlananh.com/api/payments/create-checkout`
- `https://www.nguyenlananh.com/api/payments/finalize`
- `https://www.nguyenlananh.com/api/payments/paypal/webhook`
- `https://www.nguyenlananh.com/api/payments/stripe/webhook`

## 4. URLs chuan da chot

Tieng Viet:

- success: `https://www.nguyenlananh.com/join/success/`
- cancel: `https://www.nguyenlananh.com/join/cancel/`
- retry: `https://www.nguyenlananh.com/join/retry/`

Tieng Anh:

- success: `https://www.nguyenlananh.com/en/join/success/`
- cancel: `https://www.nguyenlananh.com/en/join/cancel/`
- retry: `https://www.nguyenlananh.com/en/join/retry/`

## 5. Rule nghiep vu de xai production

### Plan mapping

```txt
year1 = 3 USD
year2 = 60 USD
year3 = 99 USD
```

### Quyen kich hoat membership

Chot: `CHI cap quyen khi payment da COMPLETED`

Trong code hien tai:

- PayPal: chi fulfill khi `PAYMENT.CAPTURE.COMPLETED` hoac finalize tra ve `COMPLETED`
- Stripe: chi fulfill khi session co `payment_status=paid`

### Refund policy

Khuyen nghi production phase 1:

```txt
REFUND_POLICY=manual_review
```

Ly do:

- an toan hon trong giai doan dau
- tranh revoke nham khi webhook refund/dispute chua du context
- ops co the review tay truoc khi thu hoi membership

Khi quy trinh refund da on, co the doi sang:

```txt
REFUND_POLICY=revoke_immediately
```

## 6. Database can co

### Bang `payment_orders`

Bang nay da luu du cac truong user dang yeu cau:

- `internal_order_id`
- `provider_order_id`
- `provider_capture_id`
- `provider_session_id`
- `plan_code`
- `payment_status`
- `fulfillment_status`
- `paid_at`
- `refunded_at`

### Bang `users`

- `email`
- `membership_type`
- `membership_label`
- `expires_at`
- `active`

### Bang `magic_links`

- token hash
- redirect path
- expires_at
- used_at

### Danh gia `DB_READY`

`DB_READY=yes` khi:

1. da tao D1 database
2. da run file `database/payment_gateway_d1.sql`
3. da bind vao Pages Functions voi ten `PAYMENTS_DB`

## 7. Env production can set

### PayPal live

```txt
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_MERCHANT_EMAIL=pay@nguyenlananh.com
```

### Stripe live

```txt
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Email

Khuyen nghi don gian nhat:

```txt
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
EMAIL_FROM_SYSTEM=noreply@nguyenlananh.com
EMAIL_FROM_PAY=pay@nguyenlananh.com
EMAIL_REPLY_TO_SUPPORT=support@nguyenlananh.com
```

### Core app

```txt
API_BASE_URL=https://www.nguyenlananh.com/api
ENV_DEPLOY_TARGET=cloudflare-pages
REFUND_POLICY=manual_review
```

## 8. Cach set secret production tren Cloudflare Pages

Repo nay nen set secret tren chinh Pages project.

Duong di dashboard:

1. Cloudflare Dashboard
2. `Workers & Pages`
3. chon project `nguyenlananh-com`
4. `Settings`
5. `Variables and Secrets`
6. add tung secret cho `Production`

Khong commit secret vao repo.

Neu dung D1:

1. tao D1 database
2. bind database do vao Pages project voi ten `PAYMENTS_DB`

## 9. Trinh tu bat live

### B1. Tao D1

Vi du:

```bash
npx wrangler d1 create nguyenlananh-payments
```

### B2. Apply schema

```bash
npx wrangler d1 execute nguyenlananh-payments --remote --file=./database/payment_gateway_d1.sql
```

### B3. Bind `PAYMENTS_DB`

Bind vao Pages Functions bang dashboard.

### B4. Set secrets production

Set:

- PayPal live secrets
- Stripe live secrets
- email provider key
- `API_BASE_URL`
- `ENV_DEPLOY_TARGET`
- `REFUND_POLICY`

### B5. Tao PayPal webhook

Webhook URL production:

```txt
https://www.nguyenlananh.com/api/payments/paypal/webhook
```

Nen subscribe toi thieu:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

### B6. Tao Stripe webhook

Webhook URL production:

```txt
https://www.nguyenlananh.com/api/payments/stripe/webhook
```

Nen subscribe toi thieu:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`

## 10. PayPal live checklist dung theo 3 nhom

### Nhom 1: PayPal live bat buoc

1. `PAYPAL_CLIENT_ID`
2. `PAYPAL_CLIENT_SECRET`
3. `PAYPAL_WEBHOOK_ID`
4. merchant email chinh xac
5. xac nhan account:
   - Business
   - verify email
   - KYC xong
   - bank/card xong
   - nhan thanh toan live duoc

### Nhom 2: System info de noi backend

1. `API_BASE_URL=https://www.nguyenlananh.com/api`
2. `ENV_DEPLOY_TARGET=cloudflare-pages`
3. `DB_READY=yes/no`
4. `EMAIL_PROVIDER=resend`

### Nhom 3: Rule nghiep vu

1. `year1=3 USD`
2. `year2=60 USD`
3. `year3=99 USD`
4. grant access only on `PAYMENT.CAPTURE.COMPLETED`: `yes`
5. refund policy: `manual_review` khuyen nghi phase 1
6. success/cancel/retry URLs: da chot o muc 4

## 11. Momo / VNPay / ZaloPay can gi de bat tiep

### MoMo

Can toi thieu:

- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`
- callback URL production

### VNPay

Can toi thieu:

- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`
- return URL
- IPN URL

### ZaloPay

Can toi thieu:

- `ZALOPAY_APP_ID`
- `ZALOPAY_KEY1`
- `ZALOPAY_KEY2`
- callback URL

Luu y:

- UI va provider registry da san san cho nhung cong nay
- runtime adapter chua viet trong turn nay
- buoc tiep theo la viet signer + create-order + callback/webhook cho tung cong theo merchant docs thuc te cua ban

## 12. Mau gui nhanh

Xem file:

- `docs/PAYMENT_LIVE_INPUT_TEMPLATE.txt`

Hoac copy block duoi day:

```txt
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
MERCHANT_EMAIL=pay@nguyenlananh.com
API_BASE_URL=https://www.nguyenlananh.com/api
ENV_DEPLOY_TARGET=cloudflare-pages
DB_READY=yes/no
EMAIL_PROVIDER=resend
REFUND_POLICY=manual_review
SUCCESS_URL=https://www.nguyenlananh.com/join/success/
CANCEL_URL=https://www.nguyenlananh.com/join/cancel/
RETRY_URL=https://www.nguyenlananh.com/join/retry/
```
