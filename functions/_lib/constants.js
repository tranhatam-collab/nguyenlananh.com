// ============================================================
// Product taxonomy — separated by family type for inventory clarity
// ============================================================

export const MEMBERSHIP_PLANS = {
  year1: {
    code: "year1",
    label: "Core Access",
    priceUsd: 3,
    priceVnd: 75000,
    durationDays: 365,
    tier: "paid"
  },
  year2: {
    code: "year2",
    label: "Year 2 Continuity",
    priceUsd: 60,
    priceVnd: 1490000,
    durationDays: 365,
    tier: "paid"
  },
  year3: {
    code: "year3",
    label: "Year 3+ Mastery",
    priceUsd: 99,
    priceVnd: 2490000,
    durationDays: 365,
    tier: "paid"
  },
  lifetime: {
    code: "lifetime",
    label: "Lifetime Founding Member",
    priceUsd: 299,
    priceVnd: 7600000,
    durationDays: 36500,
    tier: "paid"
  },
  monthly_practice: {
    code: "monthly_practice",
    label: "Practice Monthly",
    priceUsd: 9,
    priceVnd: 225000,
    durationDays: 31,
    tier: "paid",
    status: "draft" // not public until recurring billing is ready
  }
};

export const MICRO_PRODUCTS = {
  micro_life_reset: {
    code: "micro_life_reset",
    label: "Life Reset Mini",
    priceUsd: 7,
    priceVnd: 175000,
    durationDays: 36500,
    family: "life-reset"
  },
  micro_inner_listening: {
    code: "micro_inner_listening",
    label: "Inner Listening Kit",
    priceUsd: 5,
    priceVnd: 125000,
    durationDays: 36500,
    family: "inner-listening"
  },
  micro_one_corner: {
    code: "micro_one_corner",
    label: "One Corner Reset",
    priceUsd: 3,
    priceVnd: 75000,
    durationDays: 36500,
    family: "space-reset"
  },
  micro_7day_rhythm: {
    code: "micro_7day_rhythm",
    label: "7-Day True Rhythm",
    priceUsd: 9,
    priceVnd: 225000,
    durationDays: 36500,
    family: "rhythm-design"
  },
  micro_companion: {
    code: "micro_companion",
    label: "Companion Circle",
    priceUsd: 9,
    priceVnd: 225000,
    durationDays: 36500,
    family: "community"
  }
};

export const ASSESSMENTS = {
  asmt_avoidance_self: {
    code: "asmt_avoidance_self",
    label: "Avoidance Map — Self Assessment",
    priceUsd: 19,
    priceVnd: 490000,
    durationDays: 36500,
    family: "avoidance-map",
    offer: "self"
  },
  asmt_avoidance_review: {
    code: "asmt_avoidance_review",
    label: "Avoidance Map — With Expert Review",
    priceUsd: 79,
    priceVnd: 1950000,
    durationDays: 36500,
    family: "avoidance-map",
    offer: "review"
  },
  diag_capital_self: {
    code: "diag_capital_self",
    label: "Personal Capital Diagnostic — Self",
    priceUsd: 49,
    priceVnd: 1250000,
    durationDays: 36500,
    family: "personal-capital",
    offer: "self"
  },
  diag_capital_expert: {
    code: "diag_capital_expert",
    label: "Personal Capital Diagnostic — Expert Reviewed",
    priceUsd: 600,
    priceVnd: 15000000,
    durationDays: 36500,
    family: "personal-capital",
    offer: "expert"
  },
  diag_capital_biz: {
    code: "diag_capital_biz",
    label: "Personal Capital Diagnostic — Founder/Business",
    priceUsd: 1200,
    priceVnd: 30000000,
    durationDays: 36500,
    family: "personal-capital",
    offer: "business"
  }
};

export const GUIDED_PROGRAMS = {
  prog_rhythm_lab: {
    code: "prog_rhythm_lab",
    label: "Rhythm Design Lab — 21 Days",
    priceUsd: 99,
    priceVnd: 2500000,
    durationDays: 365,
    family: "rhythm-design"
  },
  prog_emo_block: {
    code: "prog_emo_block",
    label: "Emotional Block Mapping Intensive — 30 Days",
    priceUsd: 249,
    priceVnd: 6300000,
    durationDays: 365,
    family: "emotional-block"
  },
  prog_family_pattern: {
    code: "prog_family_pattern",
    label: "Family Pattern Mapping Program — 6 Weeks",
    priceUsd: 399,
    priceVnd: 10000000,
    durationDays: 365,
    family: "family-pattern"
  },
  prog_space_reset: {
    code: "prog_space_reset",
    label: "Space Reset Practitioner Program",
    priceUsd: 499,
    priceVnd: 12700000,
    durationDays: 365,
    family: "space-reset"
  },
  prog_creative_studio: {
    code: "prog_creative_studio",
    label: "Creative Practice Studio — 8 Weeks",
    priceUsd: 399,
    priceVnd: 10000000,
    durationDays: 365,
    family: "creative-practice"
  }
};

export const CERTIFICATIONS = {
  cert_boundary_found: {
    code: "cert_boundary_found",
    label: "Boundary Practice Certification — Foundation",
    priceUsd: 299,
    priceVnd: 7600000,
    durationDays: 365,
    family: "boundary-foundation"
  },
  cert_companion_l1: {
    code: "cert_companion_l1",
    label: "Certified Practice Companion — Level 1",
    priceUsd: 1200,
    priceVnd: 30000000,
    durationDays: 365,
    family: "practice-companion"
  },
  cert_method_designer: {
    code: "cert_method_designer",
    label: "Practice Method Designer Certification",
    priceUsd: 3000,
    priceVnd: 76000000,
    durationDays: 365,
    family: "practice-method"
  }
};

// ============================================================
// Pilot programs — first wave of new product families (P2)
// Each pilot has scaffold (landing + checkout + entitlement).
// Curriculum (lessons, quizzes, labs) will be added in a follow-up wave.
// ============================================================

export const PRO_PLANS = {
  pro_reset: {
    code: "pro_reset",
    label: "Pro — Reset Life",
    priceUsd: 29,
    priceVnd: 740000,
    durationDays: 365,
    family: "pro"
  },
  pro_inner: {
    code: "pro_inner",
    label: "Pro — Nội Tâm",
    priceUsd: 29,
    priceVnd: 740000,
    durationDays: 365,
    family: "pro"
  },
  pro_discipline: {
    code: "pro_discipline",
    label: "Pro — Discipline",
    priceUsd: 29,
    priceVnd: 740000,
    durationDays: 365,
    family: "pro"
  },
  pro_environment: {
    code: "pro_environment",
    label: "Pro — Environment",
    priceUsd: 29,
    priceVnd: 740000,
    durationDays: 365,
    family: "pro"
  },
  pro_creation: {
    code: "pro_creation",
    label: "Pro — Creation",
    priceUsd: 29,
    priceVnd: 740000,
    durationDays: 365,
    family: "pro"
  },
  pro_wealth: {
    code: "pro_wealth",
    label: "Pro — Wealth",
    priceUsd: 39,
    priceVnd: 990000,
    durationDays: 365,
    family: "pro"
  },
  pro_family: {
    code: "pro_family",
    label: "Pro — Family",
    priceUsd: 39,
    priceVnd: 990000,
    durationDays: 365,
    family: "pro"
  },
  pro_children: {
    code: "pro_children",
    label: "Pro — Children",
    priceUsd: 39,
    priceVnd: 990000,
    durationDays: 365,
    family: "pro"
  }
};

export const PILOT_PROGRAMS = {
  self_trust_evidence_builder: {
    code: "self_trust_evidence_builder",
    label: "Self-Trust Practice Lab — Evidence Builder",
    priceUsd: 39,
    priceVnd: 990000,
    durationDays: 365,
    family: "self-trust-practice",
    status: "pilot"
  },
  open_loop_closure_sprint: {
    code: "open_loop_closure_sprint",
    label: "Open Loop Closure Sprint — 7 Days",
    priceUsd: 19,
    priceVnd: 490000,
    durationDays: 365,
    family: "open-loop-closure",
    status: "pilot"
  },
  personal_after_action_review: {
    code: "personal_after_action_review",
    label: "Personal After-Action Review System",
    priceUsd: 29,
    priceVnd: 750000,
    durationDays: 365,
    family: "after-action-review",
    status: "pilot"
  }
};

export const PRODUCT_FAMILIES = [
  {
    slug: "avoidance-map",
    name: "Avoidance Map",
    category: "assessment",
    offers: ["asmt_avoidance_self", "asmt_avoidance_review"],
    landing: "/assessments/avoidance-map/"
  },
  {
    slug: "personal-capital",
    name: "Personal Capital",
    category: "diagnostic",
    offers: ["diag_capital_self", "diag_capital_expert", "diag_capital_biz"],
    landing: "/assessments/personal-capital/"
  },
  {
    slug: "rhythm-design",
    name: "Rhythm Design Lab",
    category: "program",
    offers: ["prog_rhythm_lab", "micro_7day_rhythm"],
    landing: "/programs/rhythm-design-lab/"
  },
  {
    slug: "emotional-block",
    name: "Emotional Block Mapping",
    category: "program",
    offers: ["prog_emo_block"],
    landing: "/programs/emotional-block-mapping/"
  },
  {
    slug: "boundary-foundation",
    name: "Boundary Practice",
    category: "certification",
    offers: ["cert_boundary_found"],
    landing: "/programs/boundary-foundation/"
  },
  {
    slug: "family-pattern",
    name: "Family Pattern Mapping",
    category: "program",
    offers: ["prog_family_pattern"],
    landing: "/programs/family-pattern-mapping/"
  },
  {
    slug: "space-reset",
    name: "Space Reset Practitioner",
    category: "program",
    offers: ["prog_space_reset", "micro_one_corner"],
    landing: "/programs/space-reset-practitioner/"
  },
  {
    slug: "creative-practice",
    name: "Creative Practice Studio",
    category: "program",
    offers: ["prog_creative_studio"],
    landing: "/programs/creative-practice-studio/"
  },
  {
    slug: "practice-companion",
    name: "Certified Practice Companion",
    category: "certification",
    offers: ["cert_companion_l1"],
    landing: "/certification/practice-companion-level-1/"
  },
  {
    slug: "practice-method",
    name: "Practice Method Designer",
    category: "certification",
    offers: ["cert_method_designer"],
    landing: "/certification/practice-method-designer/"
  },
  {
    slug: "self-trust-practice",
    name: "Self-Trust Practice Lab",
    category: "program",
    offers: ["self_trust_evidence_builder"],
    landing: "/programs/self-trust-practice-lab/"
  },
  {
    slug: "open-loop-closure",
    name: "Open Loop Closure Sprint",
    category: "program",
    offers: ["open_loop_closure_sprint"],
    landing: "/programs/open-loop-closure-sprint/"
  },
  {
    slug: "after-action-review",
    name: "Personal After-Action Review",
    category: "program",
    offers: ["personal_after_action_review"],
    landing: "/programs/personal-after-action-review/"
  }
];

// Backward-compatible unified PLANS object (used by checkout, fulfillment, middleware)
export const PLANS = {
  ...MEMBERSHIP_PLANS,
  ...MICRO_PRODUCTS,
  ...ASSESSMENTS,
  ...GUIDED_PROGRAMS,
  ...CERTIFICATIONS,
  ...PRO_PLANS,
  ...PILOT_PROGRAMS
};

export const PROVIDER_CATALOG = [
  {
    code: "paypal",
    label: "PayPal",
    region: "international",
    methods: ["paypal_balance", "card"],
    currencies: ["USD"],
    requiredSecrets: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_MERCHANT_EMAIL"]
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
  product_family_day7: "T62_FAMILY_DAY7",
  product_micro_life_reset_welcome: "T70_LIFE_RESET_WELCOME",
  product_micro_inner_listening_welcome: "T71_INNER_LISTENING_WELCOME",
  product_micro_one_corner_welcome: "T72_ONE_CORNER_WELCOME",
  product_micro_7day_rhythm_welcome: "T73_7DAY_RHYTHM_WELCOME",
  product_micro_companion_welcome: "T74_COMPANION_WELCOME",
  // Premium product welcome emails
  product_asmt_avoidance_welcome: "T80_AVOIDANCE_WELCOME",
  product_prog_rhythm_lab_welcome: "T81_RHYTHM_LAB_WELCOME",
  product_prog_emo_block_welcome: "T82_EMO_BLOCK_WELCOME",
  product_cert_boundary_welcome: "T83_BOUNDARY_WELCOME",
  product_prog_family_welcome: "T84_FAMILY_PATTERN_WELCOME",
  product_prog_space_reset_welcome: "T85_SPACE_PRACTITIONER_WELCOME",
  product_prog_creative_studio_welcome: "T86_CREATIVE_STUDIO_WELCOME",
  product_diag_capital_welcome: "T87_CAPITAL_DIAGNOSTIC_WELCOME",
  product_cert_companion_welcome: "T88_COMPANION_L1_WELCOME",
  product_cert_method_designer_welcome: "T89_METHOD_DESIGNER_WELCOME",
  // Pilot program welcome emails
  product_self_trust_welcome: "T90_SELF_TRUST_WELCOME",
  product_open_loop_welcome: "T91_OPEN_LOOP_WELCOME",
  product_after_action_welcome: "T92_AFTER_ACTION_WELCOME",
  // Payment notifications
  payment_pending: "T96_PAYMENT_PENDING",
  payment_confirmed: "T97_PAYMENT_CONFIRMED",
  // Creator onboarding
  creator_onboarding: "T93_CREATOR_ONBOARDING",
  creator_approved: "T94_CREATOR_APPROVED",
  creator_rejected: "T95_CREATOR_REJECTED"
};

export function planByCode(planCode) {
  return PLANS[planCode] || null;
}

export function providerByCode(providerCode) {
  return PROVIDER_CATALOG.find((provider) => provider.code === providerCode) || null;
}
