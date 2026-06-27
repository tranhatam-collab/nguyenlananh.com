# Resend Temporary Email Setup Guide

Use this guide to switch the site from `api.mail.iai.one` to **Resend** while the original mail VPS is down.

## 1. Create a Resend account

1. Go to https://resend.com
2. Sign up with your email.
3. Verify your account.

## 2. Add and verify your domain

1. In Resend dashboard, go to **Domains** → **Add domain**.
2. Enter `nguyenlananh.com` (or `www.nguyenlananh.com` if you prefer a subdomain).
3. Resend will give you DNS records (DKIM, SPF, MX).
4. Add those records to your Cloudflare DNS for `nguyenlananh.com`.
5. Wait for Resend to show status **Verified** (usually 5–30 minutes).

## 3. Get an API key

1. In Resend dashboard, go to **API Keys** → **Create API Key**.
2. Choose **Sending access**.
3. Copy the key (starts with `re_`).

## 4. Set the secret in Cloudflare Pages

Run this command from the project root:

```bash
export CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e
npx wrangler pages secret put RESEND_API_KEY --project-name=nguyenlananh-com
```

Paste the `re_...` key when prompted.

## 5. Deploy with Resend auto-detected

The code will automatically use Resend when `RESEND_API_KEY` is set and `MAIL_API_KEY` is not set. Just deploy:

```bash
export CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e
npx wrangler pages deploy . --project-name nguyenlananh-com --branch main --commit-dirty=true
```

To force Resend even if both keys exist, set the `EMAIL_PROVIDER` secret:

```bash
npx wrangler pages secret put EMAIL_PROVIDER --project-name=nguyenlananh-com
# Enter: resend
```

## 6. Test sending an email

Use the test endpoint or trigger a real VietQR payment. You can also test locally with Wrangler dev:

```bash
export RESEND_API_KEY=re_xxxxxxxxxxxx
npx wrangler pages dev . --local
```

## 7. Switch back to mail.iai.one later

When the original VPS is restored:

1. Delete the `EMAIL_PROVIDER` secret if you set it to `resend`:

```bash
npx wrangler pages secret delete EMAIL_PROVIDER --project-name=nguyenlananh-com
```

2. Ensure `MAIL_API_KEY` secret is set:

```bash
npx wrangler pages secret put MAIL_API_KEY --project-name=nguyenlananh-com
```

3. Re-deploy.
4. Optionally delete the `RESEND_API_KEY` secret:

```bash
npx wrangler pages secret delete RESEND_API_KEY --project-name=nguyenlananh-com
```

## Important notes

- Resend free tier: 100 emails/day. Upgrade if you need more.
- `noreply@nguyenlananh.com` and `pay@nguyenlananh.com` must be from the verified domain.
- Keep `EMAIL_FROM_PAY`, `EMAIL_FROM_SYSTEM`, `EMAIL_REPLY_TO_SUPPORT` unchanged in `wrangler.toml`.
