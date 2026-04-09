# PayPal Backend Test Matrix (Phase 2)
Date: 2026-04-09

## A. Create Order
1. Valid create request -> `201` + `internal_order_id` + `approve_url`.
2. Same `X-Idempotency-Key` + same body -> replay same response.
3. Same `X-Idempotency-Key` + different body -> `409 IDEMPOTENCY_CONFLICT`.
4. Invalid plan_code -> `422`.

## B. Capture Order
1. Valid capture after approval -> `capture_status=COMPLETED`, `fulfillment_status=FULFILLED`.
2. Duplicate capture call -> no double charge, return previous result.
3. Capture denied -> queue `T04_PAYMENT_FAILED`.
4. Capture success but DB fail -> queue `T15_INTERNAL_MANUAL_REVIEW`.

## C. Webhook Security
1. Valid signature -> `202`, process async.
2. Invalid signature -> `401`, queue `T14_INTERNAL_WEBHOOK_SECURITY`.
3. Duplicate `event.id` -> ignore reprocessing.
4. Unknown event_type -> store as ignored, no crash.

## D. Membership Fulfillment
1. On `PAYMENT.CAPTURE.COMPLETED`:
   - upsert user
   - upsert payment record
   - set membership `expires_at`
   - queue `T03` + `T01`
2. Fulfillment occurs only when capture is truly `COMPLETED`.
3. On refund (`PAYMENT.CAPTURE.REFUNDED`) -> revoke membership + queue `T11`.

## E. Email Dispatch & Locale
1. User preferred `vi` -> send `subject_vi/body_vi`.
2. User preferred `en-US` -> send `subject_en/body_en`.
3. No preferred locale -> fallback `Accept-Language`, then `vi`.
4. Dedupe key works: `template_id + recipient + order_id + capture_id`.

## F. Scheduled Lifecycle
1. Day 1 event queues `T05` at +24h.
2. Day 3 event queues `T06` at +72h.
3. Weekly event queues `T07`.
4. Expiry D-14 queues `T08`; D-3 queues `T09`; expiry day queues `T10`.
