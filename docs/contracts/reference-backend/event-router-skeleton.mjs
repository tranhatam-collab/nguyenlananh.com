import fs from 'node:fs';
import path from 'node:path';

const MAP_PATH = path.resolve(process.cwd(), 'docs/contracts/paypal-event-email-map.json');

export function loadEventMap() {
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
}

export function resolveEventActions({ source, eventType, map = loadEventMap() }) {
  if (source === 'paypal') {
    const hit = map.paypal_events.find((e) => e.event_type === eventType);
    return hit ? hit.actions : [];
  }

  if (source === 'internal') {
    const hit = map.internal_events.find((e) => e.event_type === eventType);
    return hit ? hit.actions : [];
  }

  return [];
}

export function resolveLocale({ preferredLanguage, acceptLanguage, map = loadEventMap() }) {
  if (preferredLanguage && map.supported_locales.includes(preferredLanguage)) {
    return preferredLanguage;
  }

  if (typeof acceptLanguage === 'string') {
    const normalized = acceptLanguage.toLowerCase();
    if (normalized.includes('en-us') || normalized.startsWith('en')) return 'en-US';
    if (normalized.includes('vi')) return 'vi';
  }

  return map.default_locale || 'vi';
}

export function buildEmailJob({ templateId, recipientEmail, locale, payload }) {
  const dedupeKey = [
    templateId,
    recipientEmail,
    payload?.order_id || 'na',
    payload?.capture_id || 'na'
  ].join(':');

  return {
    template_id: templateId,
    recipient_email: recipientEmail,
    language: locale,
    dedupe_key: dedupeKey,
    payload_json: payload,
    status: 'queued'
  };
}
