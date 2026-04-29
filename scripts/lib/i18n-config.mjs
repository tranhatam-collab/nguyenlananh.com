export const DOMAIN = "https://www.nguyenlananh.com";
export const DEFAULT_LOCALE_CODE = "vi";

export const LOCALE_REGISTRY = [
  {
    code: "vi",
    htmlLang: "vi",
    pathSegment: "",
    switchLabel: "🇻🇳 Tiếng Việt",
    browserCodes: ["vi", "vi-vn"],
    hreflangs: ["vi"],
    live: true,
    autoGenerateFromDefault: false
  },
  {
    code: "en",
    htmlLang: "en-US",
    pathSegment: "en",
    switchLabel: "🇺🇸 English",
    browserCodes: ["en", "en-us", "en-gb", "en-au"],
    hreflangs: ["en-US", "en"],
    live: true,
    autoGenerateFromDefault: true
  },
  {
    code: "fr",
    htmlLang: "fr-FR",
    pathSegment: "fr",
    switchLabel: "FR",
    browserCodes: ["fr", "fr-fr"],
    hreflangs: ["fr-FR", "fr"],
    live: false,
    autoGenerateFromDefault: false
  },
  {
    code: "ja",
    htmlLang: "ja-JP",
    pathSegment: "ja",
    switchLabel: "JA",
    browserCodes: ["ja", "ja-jp"],
    hreflangs: ["ja-JP", "ja"],
    live: false,
    autoGenerateFromDefault: false
  },
  {
    code: "ko",
    htmlLang: "ko-KR",
    pathSegment: "ko",
    switchLabel: "KO",
    browserCodes: ["ko", "ko-kr"],
    hreflangs: ["ko-KR", "ko"],
    live: false,
    autoGenerateFromDefault: false
  }
];

export const AUTO_REDIRECT_RULES = {
  allowedBasePrefixes: ["/", "/hanh-trinh/", "/phuong-phap/", "/bai-viet/", "/gioi-thieu/", "/du-an/"],
  blockedBasePrefixes: [
    "/join/",
    "/members/",
    "/admin/",
    "/faq/",
    "/lien-he/",
    "/chinh-sach-bao-mat/",
    "/dieu-khoan/",
    "/mien-tru-trach-nhiem/",
    "/api/"
  ]
};

export function getAllLocales() {
  return LOCALE_REGISTRY.slice();
}

export function getLiveLocales() {
  return LOCALE_REGISTRY.filter((locale) => locale.live);
}

export function localeByCode(code, { includePlanned = false } = {}) {
  const pool = includePlanned ? LOCALE_REGISTRY : getLiveLocales();
  return pool.find((locale) => locale.code === code) || null;
}

export function defaultLocale() {
  return localeByCode(DEFAULT_LOCALE_CODE, { includePlanned: true });
}

export function localizedRoute(baseRoute, localeCode) {
  const locale = localeByCode(localeCode, { includePlanned: true });
  const normalized = normalizeRoute(baseRoute);
  if (!locale || !locale.pathSegment) return normalized;
  if (normalized === "/") return `/${locale.pathSegment}/`;
  return `/${locale.pathSegment}${normalized}`;
}

export function normalizeRoute(route) {
  let value = String(route || "/").trim() || "/";
  if (!value.startsWith("/")) value = `/${value}`;
  if (value === "/") return value;
  if (!value.endsWith("/") && !/\.[a-z0-9]+$/i.test(value)) value = `${value}/`;
  return value;
}

export function stripLocalePrefix(route) {
  const normalized = normalizeRoute(route);

  for (const locale of getAllLocales()) {
    if (!locale.pathSegment) continue;
    const prefix = `/${locale.pathSegment}/`;
    if (normalized === prefix) return "/";
    if (normalized.startsWith(prefix)) {
      return normalizeRoute(`/${normalized.slice(prefix.length)}`);
    }
  }

  return normalized;
}

export function localeFromRoute(route) {
  const normalized = normalizeRoute(route);

  for (const locale of getAllLocales()) {
    if (!locale.pathSegment) continue;
    const prefix = `/${locale.pathSegment}/`;
    if (normalized === prefix || normalized.startsWith(prefix)) {
      return locale;
    }
  }

  return defaultLocale();
}

export function localeFileFromDefaultFile(defaultFile, localeCode) {
  const locale = localeByCode(localeCode, { includePlanned: true });
  if (!locale || !locale.pathSegment) return defaultFile;
  if (defaultFile === "index.html") return `${locale.pathSegment}/index.html`;
  return `${locale.pathSegment}/${defaultFile}`;
}

export function buildAlternateLinks(baseRoute) {
  const normalized = normalizeRoute(baseRoute);
  const links = [];

  for (const locale of getLiveLocales()) {
    const href = `${DOMAIN}${localizedRoute(normalized, locale.code)}`;
    for (const hreflang of locale.hreflangs) {
      links.push(`  <link rel="alternate" hreflang="${hreflang}" href="${href}" />`);
    }
  }

  links.push(`  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${localizedRoute(normalized, DEFAULT_LOCALE_CODE)}" />`);
  return links.join("\n");
}

export function buildBrowserI18nConfigSource() {
  const browserConfig = {
    defaultLocale: DEFAULT_LOCALE_CODE,
    locales: getLiveLocales().map((locale) => ({
      code: locale.code,
      htmlLang: locale.htmlLang,
      pathSegment: locale.pathSegment,
      switchLabel: locale.switchLabel,
      browserCodes: locale.browserCodes
    })),
    autoRedirect: AUTO_REDIRECT_RULES,
    switch: {
      floatingDefault: true,
      disableWhenEmbedded: true
    }
  };

  return `window.NLA_I18N_CONFIG = ${JSON.stringify(browserConfig, null, 2)};\n`;
}
