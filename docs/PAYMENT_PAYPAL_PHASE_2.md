# PAYMENT_PAYPAL_PHASE_2.md

Updated: 2026-04-29
Status: Planned only (not gate to current live claim)

## Scope

Phase 2 mo rong lane quoc te sau khi lane VietQR + Stripe/PayPal co bang chung live day du.

Muc tieu:

1. Tang ti le thanh toan quoc te thanh cong.
2. Chuan hoa email proof cho dispute/refund.
3. Giam thao tac thu cong trong doi chieu.

## Bat buoc truoc khi mo Phase 2

1. Lane VN da co:
   - provider ref
   - mail message id
   - D1 row
   - inbox proof
2. Lane USD da co:
   - checkout_url that
   - capture that
   - webhook signed proof
   - entitlement proof

## Hanh dong trong Phase 2

1. Bật PayPal smart options theo merchant policy.
2. Theo doi reason codes fail theo tuan.
3. Run matrix:
   - success
   - cancel
   - denied
   - refunded
4. Dong bo email templates voi payment outcomes.

## Khong lam trong Phase 2

1. Khong bo qua idempotency.
2. Khong cap quyen truoc `COMPLETED`.
3. Khong claim live neu thieu evidence packet.
