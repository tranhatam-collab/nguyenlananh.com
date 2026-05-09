# Pay-Owner — Requests to Other Teams (nguyenlananh.com)

Date: 2026-05-09
Owner: Pay-Owner agent

---

## REQ-N-001 — VN rail via pay.iai.one + receiver packet [OPEN]

**To:** Founder / Team Pay / Operations
**Priority:** BLOCKER for VN payment live

VN payment runs through `pay.iai.one` checkout for `provider=payos`.
Worker runtime requires pay gateway key; receiver account is managed in Team Pay packet.

Please provide:

```
PAY_IAI_ONE_API_KEY=<live key bound to tenant/site nguyenlananh>
PAY_IAI_ONE_TENANT_CODE=nguyenlananh               # optional, default nguyenlananh
PAY_IAI_ONE_SITE_CODE=nguyenlananh                 # optional, default nguyenlananh
PAY_IAI_ONE_BASE_URL=https://pay.iai.one           # optional
VIETQR_PROVIDER_MODE=pay_iai_one                   # optional, auto by key
PAY_IAI_ONE_SITE_KEY=<optional if pay.iai.one enforces x-site-key>
PAY_IAI_ONE_API_KEY_HEADER=x-api-key               # optional, default x-api-key
PAYMENTS_ADMIN_KEY=<a strong random secret for admin panel access>
API_BASE_URL=https://www.nguyenlananh.com/api
ENV_DEPLOY_TARGET=cloudflare-pages
REFUND_POLICY=manual_review
```

Receiver packet for Team Pay mapping (founder-provided, keep private channel only):

- Bank: `Techcombank`
- Account name: `NGUYEN LAN ANH`
- Account number: `***********0017` (full number shared via secure founder channel)
- Source proof: QR image delivered on `2026-05-09` (founder channel)
- Tracking packet: `docs/reports/PAY_TEAM_NGUYENLANANH_RECEIVER_PACKET_2026-05-09.md`

Then run:
```bash
cd /path/to/nguyenlananh.com
VN_VIA_PAY_IAI_ONE=1 \
REQUIRE_PAYPAL=0 REQUIRE_STRIPE=0 \
bash scripts/provision-payment-live-secrets.sh
```

Once secrets are set, `vietqr` (routing mode `pay_iai_one`) will appear as `enabled=true` in
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
