# PayPal Membership Backend — Implementation Notes (Skeleton)
Date: 2026-04-09
Status: Ready for backend build

## 1) Scope
This contract covers:
- PayPal create/capture/webhook endpoints
- Membership fulfillment rules
- Event-to-email template mapping (bilingual)
- Idempotency + webhook security baseline

Primary contract files:
- `docs/contracts/paypal-membership-openapi.yaml`
- `docs/contracts/paypal-event-email-map.json`

## 2) Order/Capture State Machine
Recommended order states:
- `created`
- `approved`
- `captured`
- `denied`
- `refunded`

Recommended fulfillment states:
- `not_fulfilled`
- `fulfilled`
- `revoked`

Transition lock:
- `captured` is terminal for payment capture path (no recapture).
- Fulfillment only after capture status is `COMPLETED`.

## 3) Idempotency Rules
Create order:
- key: `X-Idempotency-Key`
- scope: `(route, key)`
- if same key + same payload => return previous response
- if same key + different payload => `409`

Capture order:
- key: `X-Idempotency-Key`
- persist mapping from key -> capture result
- if already captured => return existing capture info (do not re-capture)

Email dedupe:
- dedupe key: `template_id + recipient + order_id + capture_id`

## 4) Webhook Security Rules
Required before processing:
1. Verify signature using PayPal verification API
2. Validate webhook_id exactly matches configured secret
3. Reject duplicated `event.id`
4. Persist raw payload for audit

On invalid signature:
- return `401`
- emit internal event `WEBHOOK_SIGNATURE_INVALID`
- queue template `T14_INTERNAL_WEBHOOK_SECURITY`

## 5) Fulfillment Flow (COMPLETED capture)
1. Upsert user by email
2. Create payment record with `capture_id`
3. Assign membership plan + `expires_at`
4. Generate one-time magic link (15 minutes)
5. Queue immediate emails:
   - `T03_PAYMENT_RECEIPT`
   - `T01_WELCOME_MAGIC_LINK`
6. Schedule lifecycle events:
   - Day 1 => `T05_DAY1_START`
   - Day 3 => `T06_DAY3_RETENTION`
   - Weekly => `T07_WEEKLY_CHECKIN`
   - Expiry D-14 => `T08_RENEWAL_D14`
   - Expiry D-3 => `T09_RENEWAL_D3`
   - Expired day => `T10_MEMBERSHIP_EXPIRED`

## 6) Plan Mapping
- `year1` => 365 days, amount 3 USD
- `year2` => 365 days, amount 60 USD
- `year3` => 365 days, amount 99 USD

## 7) Minimum Error Contracts
- `ORDER_NOT_FOUND`
- `PAYPAL_CAPTURE_DENIED`
- `WEBHOOK_SIGNATURE_INVALID`
- `IDEMPOTENCY_CONFLICT`
- `FULFILLMENT_FAILED`

## 8) Test Matrix (must pass)
1. Create order idempotency repeat
2. Capture duplicate request not double-charge
3. Webhook duplicate event not reprocess
4. Capture completed but DB failure => alert `T15`
5. Denied capture => user gets `T04`
6. Refunded capture => user gets `T11` and membership revoked
