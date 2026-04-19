(() => {
  const STORAGE_KEY = "nla_lang_pref";
  const REDIRECT_ONCE_KEY = "nla_lang_redirect_once";
  const FALLBACK_CONFIG = {
    defaultLocale: "vi",
    locales: [
      { code: "vi", htmlLang: "vi", pathSegment: "", switchLabel: "VI", browserCodes: ["vi", "vi-vn"] },
      { code: "en", htmlLang: "en-US", pathSegment: "en", switchLabel: "EN-US", browserCodes: ["en", "en-us", "en-gb"] }
    ],
    autoRedirect: {
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
    },
    switch: {
      floatingDefault: true,
      disableWhenEmbedded: true
    }
  };

  const CONFIG = window.NLA_I18N_CONFIG || FALLBACK_CONFIG;
  const LOCALES = Array.isArray(CONFIG.locales) && CONFIG.locales.length > 0 ? CONFIG.locales : FALLBACK_CONFIG.locales;
  const DEFAULT_LOCALE = CONFIG.defaultLocale || FALLBACK_CONFIG.defaultLocale;
  const AUTO_REDIRECT = CONFIG.autoRedirect || FALLBACK_CONFIG.autoRedirect;
  const SWITCH_OPTIONS = CONFIG.switch || FALLBACK_CONFIG.switch;

  const path = normalizePath(window.location.pathname || "/");
  if (path.startsWith("/cdn-cgi/")) return;

  function normalizePath(value) {
    let next = String(value || "/").trim() || "/";
    if (!next.startsWith("/")) next = `/${next}`;
    if (next !== "/" && !next.endsWith("/") && !/\.[a-z0-9]+$/i.test(next)) next = `${next}/`;
    return next;
  }

  function localeByCode(code) {
    return LOCALES.find((locale) => locale.code === code) || null;
  }

  function currentLocale() {
    for (const locale of LOCALES) {
      if (!locale.pathSegment) continue;
      const prefix = `/${locale.pathSegment}/`;
      if (path === prefix || path.startsWith(prefix)) return locale;
    }
    return localeByCode(DEFAULT_LOCALE) || LOCALES[0];
  }

  function stripLocalePrefix(pathname) {
    const normalized = normalizePath(pathname);
    for (const locale of LOCALES) {
      if (!locale.pathSegment) continue;
      const prefix = `/${locale.pathSegment}/`;
      if (normalized === prefix) return "/";
      if (normalized.startsWith(prefix)) {
        return normalizePath(`/${normalized.slice(prefix.length)}`);
      }
    }
    return normalized;
  }

  function localizedPath(basePath, localeCode) {
    const locale = localeByCode(localeCode) || localeByCode(DEFAULT_LOCALE) || LOCALES[0];
    const normalized = normalizePath(basePath);
    if (!locale.pathSegment) return normalized;
    if (normalized === "/") return `/${locale.pathSegment}/`;
    return `/${locale.pathSegment}${normalized}`;
  }

  function detectBrowserLang() {
    const browserLangs = [];
    if (Array.isArray(navigator.languages)) browserLangs.push(...navigator.languages);
    if (navigator.language) browserLangs.push(navigator.language);

    for (const raw of browserLangs) {
      const value = String(raw || "").toLowerCase();
      const match = LOCALES.find((locale) => (locale.browserCodes || []).some((candidate) => value.startsWith(candidate)));
      if (match) return match.code;
    }

    return DEFAULT_LOCALE;
  }

  function counterpart(localeCode) {
    return localizedPath(stripLocalePrefix(path), localeCode);
  }

  function goTo(localeCode) {
    const locale = localeByCode(localeCode);
    if (!locale) return;
    try {
      localStorage.setItem(STORAGE_KEY, locale.code);
    } catch (_error) {}
    const target = counterpart(locale.code);
    if (!target || target === path) return;
    window.location.href = `${target}${window.location.search || ""}${window.location.hash || ""}`;
  }

  function hasEmbeddedSwitch() {
    return Boolean(document.querySelector("[data-lang]"));
  }

  function shouldInstallFloatingSwitch() {
    if (SWITCH_OPTIONS.floatingDefault === false) return false;
    if (document.body?.dataset.langSwitch === "off") return false;
    if (SWITCH_OPTIONS.disableWhenEmbedded !== false && hasEmbeddedSwitch()) return false;
    return true;
  }

  function canAutoRedirect(basePath) {
    if (window.location.search.includes("lang=")) return false;
    if (sessionStorage.getItem(REDIRECT_ONCE_KEY) === "1") return false;

    const normalizedBase = normalizePath(basePath);
    if ((AUTO_REDIRECT.blockedBasePrefixes || []).some((prefix) => normalizedBase.startsWith(prefix))) {
      return false;
    }
    return (AUTO_REDIRECT.allowedBasePrefixes || []).some((prefix) => prefix === "/" ? normalizedBase === "/" : normalizedBase.startsWith(prefix));
  }

  function autoRedirect() {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (_error) {}

    if (!stored) {
      stored = detectBrowserLang();
      try {
        localStorage.setItem(STORAGE_KEY, stored);
      } catch (_error) {}
    }

    const current = currentLocale();
    if (!stored || stored === current.code) return;

    const basePath = stripLocalePrefix(path);
    if (!canAutoRedirect(basePath)) return;

    const target = counterpart(stored);
    if (!target || target === path) return;

    sessionStorage.setItem(REDIRECT_ONCE_KEY, "1");
    window.location.replace(`${target}${window.location.search || ""}${window.location.hash || ""}`);
  }

  function wireExistingButtons() {
    const current = currentLocale();
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const code = (button.getAttribute("data-lang") || "").toLowerCase();
      const active = code === current.code;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.classList.toggle("active", active);
      button.addEventListener("click", () => {
        if (localeByCode(code)) goTo(code);
      });
    });
  }

  function installFloatingSwitch() {
    if (!shouldInstallFloatingSwitch()) return;

    const current = currentLocale();
    const wrapper = document.createElement("div");
    wrapper.setAttribute("aria-label", "Language switch");
    wrapper.style.position = "fixed";
    wrapper.style.right = "14px";
    wrapper.style.bottom = "14px";
    wrapper.style.zIndex = "9999";
    wrapper.style.display = "flex";
    wrapper.style.gap = "6px";
    wrapper.style.padding = "6px";
    wrapper.style.border = "1px solid rgba(15,23,42,.18)";
    wrapper.style.borderRadius = "999px";
    wrapper.style.background = "rgba(255,255,255,.92)";
    wrapper.style.backdropFilter = "blur(8px)";
    wrapper.style.boxShadow = "0 10px 22px rgba(2,6,23,.12)";

    for (const locale of LOCALES) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = locale.switchLabel || locale.code.toUpperCase();
      button.style.border = "1px solid rgba(15,23,42,.18)";
      button.style.borderRadius = "999px";
      button.style.padding = "6px 10px";
      button.style.fontSize = "12px";
      button.style.cursor = "pointer";
      button.style.background = current.code === locale.code ? "rgba(15,23,42,.9)" : "rgba(255,255,255,.95)";
      button.style.color = current.code === locale.code ? "#fff" : "#111827";
      button.addEventListener("click", () => goTo(locale.code));
      wrapper.appendChild(button);
    }

    document.body.appendChild(wrapper);
  }

  document.addEventListener("DOMContentLoaded", () => {
    autoRedirect();
    wireExistingButtons();
    installFloatingSwitch();
  });
})();
