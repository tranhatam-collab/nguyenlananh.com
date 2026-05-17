# PAYMENT_RAILS_INDEPENDENT_GATE

- generated_at_utc: 2026-05-09T05:39:10Z
- generated_at_local: 2026-05-09 12:39:10 +0700
- base_url: `https://www.nguyenlananh.com`
- require_intl_provider: `0`
- intl_provider: `paypal`
- require_rail_guard: `1`
- require_provider_ready: `0`
- require_completed: `0`

## Summary

- failures: `5`
- warnings: `2`

## Health

```json
```

## Providers

```json
```

## Rails

```json
```

## Probes

### VN identity + PayPal (must block)
```json
```

### INTL identity + VietQR (must block)
```json
```

### VN identity + VietQR
```json
```

### INTL identity + paypal
```json
{
  "ok": false,
  "code": "DEFERRED_PHASE",
  "message": "INTL provider readiness deferred in this phase."
}
```
