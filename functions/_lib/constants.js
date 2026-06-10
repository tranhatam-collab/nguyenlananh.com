export const PLANS = {
  year1: {
    code: "year1",
    label: "Core Access",
    priceUsd: 2,
    priceVnd: 49000,
    durationDays: 365
  },
  year2: {
    code: "year2",
    label: "Year 2 Continuity",
    priceUsd: 60,
    priceVnd: 1490000,
    durationDays: 365
  },
  year3: {
    code: "year3",
    label: "Year 3+ Mastery",
    priceUsd: 99,
    priceVnd: 2490000,
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
  },
  {
    code: "vietqr",
    label: "VietQR",
    region: "vietnam",
    methods: ["bank_transfer_qr", "manual_confirm"],
    currencies: ["VND"],
    requiredSecrets: ["VIETQR_BANK_BIN", "VIETQR_ACCOUNT_NO", "VIETQR_ACCOUNT_NAME"]
  }
];

export const TEMPLATE_IDS = {
  welcome: "T01_WELCOME_MAGIC_LINK",
  resend: "T02_MAGIC_LINK_RESEND",
  receipt: "T03_PAYMENT_RECEIPT",
  failed: "T04_PAYMENT_FAILED",
  refunded: "T11_REFUND_NOTICE",
  security: "T14_INTERNAL_WEBHOOK_SECURITY",
  contact: "T15_CONTACT_FORM",
  product_loop_welcome: "T20_LOOP_WELCOME",
  product_loop_day3: "T21_LOOP_DAY3",
  product_loop_day7: "T22_LOOP_DAY7",
  product_space_welcome: "T30_SPACE_WELCOME",
  product_space_day3: "T31_SPACE_DAY3",
  product_space_day7: "T32_SPACE_DAY7",
  product_capital_welcome: "T40_CAPITAL_WELCOME",
  product_capital_day3: "T41_CAPITAL_DAY3",
  product_capital_day7: "T42_CAPITAL_DAY7",
  product_creative_welcome: "T50_CREATIVE_WELCOME",
  product_creative_day3: "T51_CREATIVE_DAY3",
  product_creative_day7: "T52_CREATIVE_DAY7",
  product_family_welcome: "T60_FAMILY_WELCOME",
  product_family_day3: "T61_FAMILY_DAY3",
  product_family_day7: "T62_FAMILY_DAY7"
};

export function planByCode(planCode) {
  return PLANS[planCode] || null;
}

export function providerByCode(providerCode) {
  return PROVIDER_CATALOG.find((provider) => provider.code === providerCode) || null;
}
