# PAY_TEAM_NGUYENLANANH_RECEIVER_PACKET_2026-05-09

Date: 2026-05-09  
Source: Founder-provided personal QR image (secure founder channel)  
Scope: VN VND checkout routing via `pay.iai.one` for `nguyenlananh.com`

---

## 1) Receiver packet for Team Pay

- Domain: `nguyenlananh.com`
- Tenant code: `nguyenlananh`
- Site code: `nguyenlananh`
- Preferred VN provider lane: `payos` via `pay.iai.one`
- Receiver type: `personal` (phase-1 launch)

Receiver identity (from founder QR):
- Bank name: `Techcombank`
- Account holder: `NGUYEN LAN ANH`
- Account number (masked in repo): `***********0017`
- Full account number: **already provided by founder via secure channel** (do not copy to repo/docs)

Compliance rule:
- No public exposure of full account number on site, reports, or logs.
- Full account details stay in secure operations channel only.

---

## 2) Team Pay required actions

1. Bind this receiver into `pay.iai.one` production mapping for:
   - `tenant=nguyenlananh`
   - `site=nguyenlananh`
   - `provider=payos`
2. Confirm provider channel is active and can create checkout sessions.
3. Return a live key for this tenant/site mapping:
   - `PAY_IAI_ONE_API_KEY`
4. (Optional but recommended) return canonical site key/header contract if required:
   - `PAY_IAI_ONE_SITE_KEY`
   - `PAY_IAI_ONE_API_KEY_HEADER` (default is `x-api-key`)
5. Share confirmation evidence:
   - one successful checkout session creation response
   - non-empty `checkout_url`
   - non-empty provider order/payment reference

---

## 3) Runtime secrets required on `nguyenlananh.com`

Minimum for VN live lane:

```txt
PAY_IAI_ONE_API_KEY
PAYMENTS_ADMIN_KEY
MAIL_API_KEY
MAIL_API_WORKSPACE_ID
MAIL_API_WEBHOOK_SECRET
EMAIL_FROM_SYSTEM
EMAIL_FROM_PAY
EMAIL_REPLY_TO_SUPPORT
```

Optional (if Team Pay enforces these):

```txt
PAY_IAI_ONE_SITE_KEY
PAY_IAI_ONE_API_KEY_HEADER
PAY_IAI_ONE_BASE_URL=https://pay.iai.one
PAY_IAI_ONE_TENANT_CODE=nguyenlananh
PAY_IAI_ONE_SITE_CODE=nguyenlananh
VIETQR_PROVIDER_MODE=pay_iai_one
```

---

## 4) Gate status impact

Current blocker that this packet addresses:
- `vietqr enabled=false (mode=setup_required)` due to missing `PAY_IAI_ONE_API_KEY`

Expected after Team Pay + secret provision:
- `/api/payments/providers` => `vietqr enabled=true`
- `/api/payments/vietqr/create-order` => checkout payload returned from `pay.iai.one`

