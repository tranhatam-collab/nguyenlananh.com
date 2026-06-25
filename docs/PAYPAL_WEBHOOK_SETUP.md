# PayPal Webhook Setup

## Webhook Endpoint

```
https://www.nguyenlananh.com/api/payments/paypal/webhook
```

## Required Event Types

In PayPal Developer Dashboard → Live App → Webhooks, subscribe to:

- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.PENDING`
- `CHECKOUT.ORDER.APPROVED`
- `CHECKOUT.ORDER.COMPLETED`

## Steps

1. Log in to https://developer.paypal.com/
2. Go to **Apps & Credentials** → select your **Live** app
3. Click **Add Webhook**
4. Enter URL: `https://www.nguyenlananh.com/api/payments/paypal/webhook`
5. Select event types above
6. Save and copy the **Webhook ID**
7. Set Cloudflare Pages secret:

```bash
export CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com
npx wrangler pages secret put PAYPAL_WEBHOOK_ID --project-name=nguyenlananh-com
```

Paste the Webhook ID when prompted.

## After Setting Webhook ID

Redeploy:

```bash
npx wrangler pages deploy . --project-name=nguyenlananh-com --branch=main
```

## Verification

After PayPal payment completes, the webhook will automatically fulfill the order
(grant `content_access` and send welcome email).

Until webhook is set, orders must be confirmed manually via admin dashboard.
