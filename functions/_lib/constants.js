export const PLANS = {
  year1: {
    code: "year1",
    label: "Core Access",
    priceUsd: 2,
    durationDays: 365
  },
  year2: {
    code: "year2",
    label: "Year 2 Continuity",
    priceUsd: 60,
    durationDays: 365
  },
  year3: {
    code: "year3",
    label: "Year 3+ Mastery",
    priceUsd: 99,
    durationDays: 365
  }
};

export const PROVIDER_CATALOG = [
  {
    code: "paypal",
    label: "PayPal",
    region: "international",
    methods: ["paypal_balance", "card"],
    currencies: ["USD"],
    requiredSecrets: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID", "PAYPAL_MERCHANT_EMAIL"]
  },
  {
    code: "stripe",
    label: "Stripe",
    region: "international",
    methods: ["card", "apple_pay", "google_pay"],
    currencies: ["USD"],
    requiredSecrets: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"]
  },
  {
    code: "momo",
    label: "MoMo",
    region: "vietnam",
    methods: ["wallet", "banking_app"],
    currencies: ["VND"],
    requiredSecrets: ["MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY"]
  },
  {
    code: "vnpay",
    label: "VNPay",
    region: "vietnam",
    methods: ["atm_card", "banking_app", "qr"],
    currencies: ["VND"],
    requiredSecrets: ["VNPAY_TMN_CODE", "VNPAY_HASH_SECRET"]
  },
  {
    code: "zalopay",
    label: "ZaloPay",
    region: "vietnam",
    methods: ["wallet", "qr"],
    currencies: ["VND"],
    requiredSecrets: ["ZALOPAY_APP_ID", "ZALOPAY_KEY1", "ZALOPAY_KEY2"]
  }
];

export const TEMPLATE_IDS = {
  welcome: "T01_WELCOME_MAGIC_LINK",
  resend: "T02_MAGIC_LINK_RESEND",
  receipt: "T03_PAYMENT_RECEIPT",
  failed: "T04_PAYMENT_FAILED",
  refunded: "T11_REFUND_NOTICE",
  security: "T14_INTERNAL_WEBHOOK_SECURITY"
};

export function planByCode(planCode) {
  return PLANS[planCode] || null;
}

export function providerByCode(providerCode) {
  return PROVIDER_CATALOG.find((provider) => provider.code === providerCode) || null;
}
