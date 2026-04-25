import fs from "node:fs";
import path from "node:path";

const CONTENT_FILES = {
  vi: "content/vi.json",
  en: "content/en.json"
};

export function loadContentRegistry(root = process.cwd()) {
  const registry = {};

  for (const [locale, relPath] of Object.entries(CONTENT_FILES)) {
    const absPath = path.join(root, relPath);
    const raw = fs.readFileSync(absPath, "utf8");
    registry[locale] = JSON.parse(raw);
  }

  return registry;
}

export function validateContentRegistry(registry) {
  const errors = [];
  const requiredLocales = ["vi", "en"];
  const requiredNavRoutes = [
    "/",
    "/hanh-trinh/",
    "/phuong-phap/",
    "/chuong-trinh/",
    "/bai-viet/",
    "/lien-he/"
  ];

  for (const locale of requiredLocales) {
    const entry = registry[locale];
    if (!entry) {
      errors.push(`Missing locale registry: ${locale}`);
      continue;
    }

    if (!entry.brand?.name) errors.push(`Missing brand.name for locale: ${locale}`);
    if (!entry.brand?.tagline) errors.push(`Missing brand.tagline for locale: ${locale}`);
    if (!entry.brand?.signature) errors.push(`Missing brand.signature for locale: ${locale}`);
    if (!entry.chrome?.nav) errors.push(`Missing chrome.nav for locale: ${locale}`);
    if (!entry.chrome?.footerLegal) errors.push(`Missing chrome.footerLegal for locale: ${locale}`);
    if (!entry.cta?.joinNav) errors.push(`Missing cta.joinNav for locale: ${locale}`);
    if (!entry.cta?.joinPrimary) errors.push(`Missing cta.joinPrimary for locale: ${locale}`);

    for (const route of requiredNavRoutes) {
      if (!entry.chrome?.nav?.[route]) {
        errors.push(`Missing nav label for ${route} in locale: ${locale}`);
      }
    }
  }

  return errors;
}

export function buildBrowserContentRegistrySource(registry) {
  return `window.NLA_CONTENT_REGISTRY = ${JSON.stringify(registry, null, 2)};\n`;
}
