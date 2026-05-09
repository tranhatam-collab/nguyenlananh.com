# Pay-Owner — Requests to Other Teams (nguyenlananh.com)

Date: 2026-05-09
Owner: Pay-Owner agent

---

## REQ-N-001 — VietQR bank credentials + core env secrets [OPEN]

**To:** Founder / Operations
**Priority:** BLOCKER for VN payment live

VietQR is the only payment method for Vietnamese users. The worker reads
these secrets at runtime; without them the provider is disabled.

Please provide:

```
VIETQR_BANK_BIN=<6-digit bank BIN e.g. 970415 for Vietinbank>
VIETQR_ACCOUNT_NO=<account number>
VIETQR_ACCOUNT_NAME=<account holder name — shown on QR>
PAYMENTS_ADMIN_KEY=<a strong random secret for admin panel access>
API_BASE_URL=https://www.nguyenlananh.com/api
ENV_DEPLOY_TARGET=cloudflare-pages
REFUND_POLICY=manual_review
```

Then run:
```bash
cd /path/to/nguyenlananh.com
REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 \
bash scripts/provision-payment-live-secrets.sh
```

Once secrets are set, `vietqr` will appear as `enabled=true` in
`/api/payments/providers` and the admin panel becomes operational.

---

## REQ-N-002 — Email provider secrets [OPEN]

**To:** Founder / Operations
**Priority:** BLOCKER for auth (magic links = member login)

Magic links (login emails) require an email provider. The system uses
`mail.iai.one` by default.

Please provide:
```
EMAIL_PROVIDER=mail_iai_one
MAIL_API_BASE_URL=https://api.mail.iai.one/v1
MAIL_API_KEY=<API key from mail.iai.one>
MAIL_API_WORKSPACE_ID=<workspace ID>
MAIL_API_WEBHOOK_SECRET=<webhook signing secret>
EMAIL_FROM_SYSTEM=noreply@nguyenlananh.com
EMAIL_FROM_PAY=pay@nguyenlananh.com
EMAIL_REPLY_TO_SUPPORT=support@nguyenlananh.com
```

These are added alongside the VietQR secrets in the same
`provision-payment-live-secrets.sh` run (the script already prompts for them).

---

## REQ-N-003 — PayPal merchant account [DEFERRED — Phase 2]

**To:** Founder
**Priority:** Not blocking VN launch; required for international members

When ready:
```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_MERCHANT_EMAIL=pay@nguyenlananh.com
```

Webhook URL to register at PayPal developer dashboard:
```
https://www.nguyenlananh.com/api/payments/paypal/webhook
```

Events to subscribe:
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

---

## Resolved

_(none yet)_
