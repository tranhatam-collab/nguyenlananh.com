# Team 1 Security Auth Payment Plan - 2026-04-14

## Muc tieu

Khoa luong auth/payment de membership chi duoc cap khi:

1. payment duoc xac nhan that
2. fulfill chi xay ra 1 lan
3. magic link va session chi do server cap

## File ownership

- `functions/_lib/payments.js`
- `functions/_lib/db.js`
- `functions/_lib/utils.js`
- `functions/_lib/email.js`
- `functions/api/payments/*`
- `functions/api/auth/magic-links/*`
- `database/payment_gateway_d1.sql`

## Cong viec bat buoc

### Block A - Remove client-authoritative auth

1. Dung chap nhan local magic link cho production path.
2. Dung tra ve session gia chi de client ghi vao localStorage.
3. Chuyen sang 1 trong 2 huong:
   - cookie HttpOnly signed session
   - signed short-lived token + server gate middleware

**Acceptance**

- Xoa duoc dependence vao `nla_member_magic_pending`
- Khong co truong hop API loi ma user van vao duoc he

### Block B - Single-writer fulfillment

1. Them cot/trang thai trung gian cho payment order:
   - `captured_pending_fulfillment`
   - `fulfilled`
2. Khi fulfill, update theo dieu kien:
   - chi `WHERE fulfillment_status != 'fulfilled'`
   - hoac transaction semantics tuong duong tren D1
3. Neu update khong an duoc row, doc lai order va return ket qua da ton tai.

**Acceptance**

- Webhook replay khong cong them expiry
- Return page + webhook ve cung luc khong extend membership 2 lan

### Block C - Magic link discipline

1. `issueMagicLink` chi chay sau khi order da o state `fulfilled`.
2. `consumeMagicLinkResponse` phai tao session theo server model moi.
3. Resend phai di kem rate limit/cooldown co ban.
4. Dedupe cho resend khong dua tren `expires_at` ngau nhien; phai dua tren cua so thoi gian hop ly.

**Acceptance**

- 1 token dung 1 lan
- token het han khong revive
- resend khong spam

### Block D - Observability

1. Them correlation id theo `internal_order_id`.
2. Ghi log cac moc:
   - create checkout
   - provider create success/fail
   - finalize hit
   - webhook hit
   - fulfill skipped/fulfilled
   - email queued/sent/failed
3. Nhanh tra ve body debug-safe cho health endpoint.

## Migration de nghi

### DB patch

Them hoac chuan hoa:

- index cho `payment_status`, `fulfillment_status`
- unique/idempotency cho fulfill event
- cot `fulfillment_attempted_at`
- cot `fulfillment_source`

### Runtime patch

1. Refactor `fulfillOrder` thanh pure service + guarded write.
2. Refactor `finalizeCheckoutResponse` va webhook deu goi cung 1 guarded service.
3. Refactor `consumeMagicLinkResponse` de attach session token/cookie server-side.

## Test matrix

1. PayPal success tu success page
2. PayPal success chi bang webhook, khong vao return page
3. Stripe success tu return page
4. Stripe async success tu webhook
5. Webhook replay 2 lan
6. Finalize goi 2 lan cung idempotency key
7. Finalize goi 2 lan khac idempotency key nhung cung order
8. Magic link resend 3 lan lien tiep
9. Membership user da con han mua them goi moi

## Definition of done

1. Khong con bypass auth/payment bang client fallback
2. Khong con double-fulfill
3. Session duoc cap va verify boi server
4. Health va logs du de debug production
