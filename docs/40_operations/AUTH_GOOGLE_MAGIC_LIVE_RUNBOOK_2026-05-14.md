# AUTH_GOOGLE_MAGIC_LIVE_RUNBOOK_2026-05-14

Status: ACTIVE  
Scope: `nguyenlananh.com` production (`Cloudflare Pages project: nguyenlananh-com`)  
Owner lane: Team 2 runtime auth

## 1) Current truth (2026-05-14)

- Google auth runtime routes are deployed and reachable:
  - `GET /api/auth/google/start`
  - `GET /api/auth/google/callback`
- Current response is `501 GOOGLE_NOT_CONFIGURED` (expected until Google secrets are set).
- Magic-link runtime routes are reachable:
  - `POST /api/auth/signup`
  - `POST /api/auth/magic-links/consume`
- Current signup probe returns `delivery_status=failed`, so inbox proof is still missing.

## 2) Required secrets for Google login

Set these in Cloudflare Pages **production** env for project `nguyenlananh-com`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_OAUTH_STATE_SECRET`

Optional fallback (if architecture decides to reuse):

- `MAGIC_LINK_SECRET` (only if intentionally shared with OAuth state signing)

Google OAuth callback URI to register in Google Cloud Console:

- `https://www.nguyenlananh.com/api/auth/google/callback`

## 3) Secret set commands (values must come from founder/operator)

Do not paste secret values into repo files or logs.

```bash
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com

printf "%s" "<GOOGLE_CLIENT_ID_VALUE>" | \
CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
wrangler pages secret put GOOGLE_CLIENT_ID --project-name nguyenlananh-com

printf "%s" "<GOOGLE_CLIENT_SECRET_VALUE>" | \
CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name nguyenlananh-com

printf "%s" "<GOOGLE_OAUTH_STATE_SECRET_VALUE>" | \
CLOUDFLARE_ACCOUNT_ID=62d57eaa548617aeecac766e5a1cb98e \
wrangler pages secret put GOOGLE_OAUTH_STATE_SECRET --project-name nguyenlananh-com
```

## 4) Redeploy after secrets update

```bash
cd /Users/tranhatam/Documents/Devnewproject/nguyenlananh.com
./scripts/deploy_cloudflare.sh
```

## 5) Live verification checklist

### 5.1 Route readiness

```bash
curl -i https://www.nguyenlananh.com/api/auth/google/start
curl -i https://www.nguyenlananh.com/api/auth/google/callback
```

Expected:

- No `404`.
- No `GOOGLE_NOT_CONFIGURED` after secrets are set.
- `google/start` should return redirect (`302`) to Google OAuth.

### 5.2 Google login real proof

1. Open `https://www.nguyenlananh.com/api/auth/google/start` in browser.
2. Complete real Google consent with approved test account.
3. Confirm callback returns to site flow and session can be established.
4. Capture proof artifacts:
   - timestamp
   - account alias (masked)
   - callback status
   - post-login user/session check

### 5.3 Magic-link real inbox proof

1. `POST /api/auth/signup` with test email (Gmail alias allowed).
2. Confirm provider status is `sent` (or provider-delivered equivalent).
3. Confirm inbox message exists with message id evidence.
4. Use received magic link and verify `POST /api/auth/magic-links/consume` success.

## 6) Closeout gates for this web

`nguyenlananh.com` is considered auth-complete only when all are true:

1. Google OAuth start + callback live pass.
2. Magic-link send + inbox + consume live pass.
3. Public legal URLs pass:
   - `/privacy`, `/terms`, `/support`, `/contact`
4. Deploy evidence packet and run-log entry are updated with timestamps and commands.

## 7) Security notes

- Never print raw secrets in shell history snapshots or docs.
- Never commit provider tokens, session cookies, or private keys.
- Keep only masked evidence in reports.
