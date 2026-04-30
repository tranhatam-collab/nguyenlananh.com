# PAYMENT_RAILS_INDEPENDENT_GATE

- generated_at_utc: 2026-04-30T11:39:39Z
- generated_at_local: 2026-04-30 18:39:39 +0700
- base_url: `https://www.nguyenlananh.com`
- require_rail_guard: `1`
- require_provider_ready: `0`
- require_completed: `0`

## Summary

- failures: `0`
- warnings: `2`

## Health

```json
{
  "ok": true,
  "providers": [
    {
      "code": "paypal",
      "label": "PayPal",
      "region": "international",
      "methods": [
        "paypal_balance",
        "card"
      ],
      "currencies": [
        "USD"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": true,
      "mode": "setup_required"
    },
    {
      "code": "stripe",
      "label": "Stripe",
      "region": "international",
      "methods": [
        "card",
        "apple_pay",
        "google_pay"
      ],
      "currencies": [
        "USD"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": false,
      "mode": "setup_required"
    },
    {
      "code": "momo",
      "label": "MoMo",
      "region": "vietnam",
      "methods": [
        "wallet",
        "banking_app"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned"
    },
    {
      "code": "vnpay",
      "label": "VNPay",
      "region": "vietnam",
      "methods": [
        "atm_card",
        "banking_app",
        "qr"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned"
    },
    {
      "code": "zalopay",
      "label": "ZaloPay",
      "region": "vietnam",
      "methods": [
        "wallet",
        "qr"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned"
    },
    {
      "code": "vietqr",
      "label": "VietQR",
      "region": "vietnam",
      "methods": [
        "bank_transfer_qr",
        "manual_confirm"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": false,
      "mode": "setup_required"
    }
  ],
  "environment": {
    "api_base_url": "https://www.nguyenlananh.com/api",
    "deploy_target": "cloudflare-pages",
    "email_provider": "mail_iai_one",
    "refund_policy": "manual_review",
    "db_ready": true
  },
  "plans": [
    {
      "code": "year1",
      "price_usd": 2,
      "price_vnd": 49000,
      "duration_days": 365
    },
    {
      "code": "year2",
      "price_usd": 60,
      "price_vnd": 1490000,
      "duration_days": 365
    },
    {
      "code": "year3",
      "price_usd": 99,
      "price_vnd": 2490000,
      "duration_days": 365
    }
  ]
}
```

## Providers

```json
{
  "ok": true,
  "providers": [
    {
      "code": "paypal",
      "label": "PayPal",
      "region": "international",
      "methods": [
        "paypal_balance",
        "card"
      ],
      "currencies": [
        "USD"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": true,
      "mode": "setup_required",
      "public": {
        "merchant_email": "pay@nguyenlananh.com"
      }
    },
    {
      "code": "stripe",
      "label": "Stripe",
      "region": "international",
      "methods": [
        "card",
        "apple_pay",
        "google_pay"
      ],
      "currencies": [
        "USD"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": false,
      "mode": "setup_required",
      "public": {
        "publishable_key": null
      }
    },
    {
      "code": "momo",
      "label": "MoMo",
      "region": "vietnam",
      "methods": [
        "wallet",
        "banking_app"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned",
      "public": {}
    },
    {
      "code": "vnpay",
      "label": "VNPay",
      "region": "vietnam",
      "methods": [
        "atm_card",
        "banking_app",
        "qr"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned",
      "public": {}
    },
    {
      "code": "zalopay",
      "label": "ZaloPay",
      "region": "vietnam",
      "methods": [
        "wallet",
        "qr"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": false,
      "enabled": false,
      "manual_fallback": false,
      "mode": "planned",
      "public": {}
    },
    {
      "code": "vietqr",
      "label": "VietQR",
      "region": "vietnam",
      "methods": [
        "bank_transfer_qr",
        "manual_confirm"
      ],
      "currencies": [
        "VND"
      ],
      "implemented": true,
      "enabled": false,
      "manual_fallback": false,
      "mode": "setup_required",
      "public": {
        "bank_bin": null,
        "account_no": null,
        "account_name": null,
        "template": "compact2"
      }
    }
  ],
  "environment": {
    "api_base_url": "https://www.nguyenlananh.com/api",
    "deploy_target": "cloudflare-pages",
    "email_provider": "mail_iai_one",
    "refund_policy": "manual_review",
    "db_ready": true
  }
}
```

## Rails

```json
{
  "ok": true,
  "rails": [
    {
      "rail": "VN_VND",
      "required_identity_country": "VN",
      "currency": "VND",
      "providers": [
        {
          "provider": "vietqr",
          "code": "vietqr",
          "label": "VietQR",
          "region": "vietnam",
          "methods": [
            "bank_transfer_qr",
            "manual_confirm"
          ],
          "currencies": [
            "VND"
          ],
          "implemented": true,
          "enabled": false,
          "manual_fallback": false,
          "mode": "setup_required"
        },
        {
          "provider": "momo",
          "code": "momo",
          "label": "MoMo",
          "region": "vietnam",
          "methods": [
            "wallet",
            "banking_app"
          ],
          "currencies": [
            "VND"
          ],
          "implemented": false,
          "enabled": false,
          "manual_fallback": false,
          "mode": "planned"
        },
        {
          "provider": "vnpay",
          "code": "vnpay",
          "label": "VNPay",
          "region": "vietnam",
          "methods": [
            "atm_card",
            "banking_app",
            "qr"
          ],
          "currencies": [
            "VND"
          ],
          "implemented": false,
          "enabled": false,
          "manual_fallback": false,
          "mode": "planned"
        },
        {
          "provider": "zalopay",
          "code": "zalopay",
          "label": "ZaloPay",
          "region": "vietnam",
          "methods": [
            "wallet",
            "qr"
          ],
          "currencies": [
            "VND"
          ],
          "implemented": false,
          "enabled": false,
          "manual_fallback": false,
          "mode": "planned"
        }
      ]
    },
    {
      "rail": "INTL_USD",
      "required_identity_country": "INTL",
      "currency": "USD",
      "providers": [
        {
          "provider": "paypal",
          "code": "paypal",
          "label": "PayPal",
          "region": "international",
          "methods": [
            "paypal_balance",
            "card"
          ],
          "currencies": [
            "USD"
          ],
          "implemented": true,
          "enabled": false,
          "manual_fallback": true,
          "mode": "setup_required"
        },
        {
          "provider": "stripe",
          "code": "stripe",
          "label": "Stripe",
          "region": "international",
          "methods": [
            "card",
            "apple_pay",
            "google_pay"
          ],
          "currencies": [
            "USD"
          ],
          "implemented": true,
          "enabled": false,
          "manual_fallback": false,
          "mode": "setup_required"
        }
      ]
    }
  ],
  "policy": {
    "vn_identity_requires": {
      "currency": "VND",
      "providers": [
        "vietqr",
        "momo",
        "vnpay",
        "zalopay"
      ]
    },
    "intl_identity_requires": {
      "currency": "USD",
      "providers": [
        "paypal",
        "stripe"
      ]
    }
  }
}
```

## Probes

### VN identity + PayPal (must block)
```json
{
  "ok": false,
  "code": "VN_ID_REQUIRES_VND",
  "message": "Vietnam ID requires VND checkout."
}
```

### INTL identity + VietQR (must block)
```json
{
  "ok": false,
  "code": "INTERNATIONAL_ID_REQUIRES_USD",
  "message": "International ID requires USD checkout."
}
```

### VN identity + VietQR
```json
{
  "ok": false,
  "code": "PROVIDER_NOT_READY",
  "message": "VietQR is not configured yet."
}
```

### INTL identity + paypal
```json
{
  "ok": false,
  "code": "PROVIDER_NOT_READY",
  "message": "PayPal is not configured yet."
}
```
