# Reference Backend Skeleton (PayPal Membership)

This folder provides implementation-ready skeleton code for backend teams.

## Files
- `service-skeleton.mjs`: handler skeleton for:
  - `POST /api/paypal/create-order`
  - `POST /api/paypal/capture-order`
  - `POST /api/paypal/webhook`
  - `POST /api/auth/magic-links/resend`
- `event-router-skeleton.mjs`: map PayPal/internal events to email/template actions.

## How to use
1. Keep API request/response shapes aligned with:
   - `docs/contracts/paypal-membership-openapi.yaml`
2. Keep event behavior aligned with:
   - `docs/contracts/paypal-event-email-map.json`
3. Replace adapters (`paypal`, `db`, `emails`, `idempotency`, `webhooks`) with your real implementations.

## Notes
- This is a skeleton contract implementation, not production-ready runtime.
- Signature verification, idempotency, and fulfillment lock are mandatory.
