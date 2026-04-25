import { planByCode } from "./constants.js";
import { assert, nowIso, parseIsoOrNull, randomId, safeJsonParse } from "./utils.js";

export function requireDb(env) {
  assert(env.PAYMENTS_DB, "DB_NOT_READY", "PAYMENTS_DB binding is missing.", 503);
  return env.PAYMENTS_DB;
}

export async function findIdempotency(db, route, idempotencyKey) {
  if (!idempotencyKey) return null;
  const row = await db
    .prepare(
      "SELECT route, idempotency_key, request_hash, status_code, response_json, created_at FROM idempotency_keys WHERE route = ? AND idempotency_key = ?"
    )
    .bind(route, idempotencyKey)
    .first();

  if (!row) return null;
  return {
    ...row,
    response_json: safeJsonParse(row.response_json, {})
  };
}

export async function storeIdempotency(db, record) {
  await db
    .prepare(
      `INSERT INTO idempotency_keys (
        id,
        route,
        idempotency_key,
        request_hash,
        status_code,
        response_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      randomId("idem"),
      record.route,
      record.idempotency_key,
      record.request_hash,
      record.status_code,
      JSON.stringify(record.response_json || {}),
      record.created_at || nowIso()
    )
    .run();
}

function parseOrder(row) {
  if (!row) return null;
  return {
    ...row,
    amount: Number(row.amount),
    metadata_json: safeJsonParse(row.metadata_json, {})
  };
}

export async function createOrder(db, order) {
  await db
    .prepare(
      `INSERT INTO payment_orders (
        internal_order_id,
        user_id,
        email,
        locale,
        provider,
        plan_code,
        amount,
        currency,
        provider_order_id,
        provider_capture_id,
        provider_session_id,
        payment_status,
        fulfillment_status,
        success_url,
        cancel_url,
        retry_url,
        metadata_json,
        idempotency_key_create,
        idempotency_key_finalize,
        created_at,
        updated_at,
        paid_at,
        refunded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      order.internal_order_id,
      order.user_id || null,
      order.email,
      order.locale || "vi",
      order.provider,
      order.plan_code,
      order.amount,
      order.currency || "USD",
      order.provider_order_id || null,
      order.provider_capture_id || null,
      order.provider_session_id || null,
      order.payment_status || "created",
      order.fulfillment_status || "not_fulfilled",
      order.success_url || null,
      order.cancel_url || null,
      order.retry_url || null,
      JSON.stringify(order.metadata_json || {}),
      order.idempotency_key_create || null,
      order.idempotency_key_finalize || null,
      order.created_at || nowIso(),
      order.updated_at || nowIso(),
      order.paid_at || null,
      order.refunded_at || null
    )
    .run();
}

export async function getOrderByInternalId(db, internalOrderId) {
  const row = await db.prepare("SELECT * FROM payment_orders WHERE internal_order_id = ?").bind(internalOrderId).first();
  return parseOrder(row);
}

export async function getOrderByProviderOrderId(db, provider, providerOrderId) {
  const row = await db
    .prepare("SELECT * FROM payment_orders WHERE provider = ? AND provider_order_id = ?")
    .bind(provider, providerOrderId)
    .first();
  return parseOrder(row);
}

export async function getOrderByProviderSessionId(db, provider, providerSessionId) {
  const row = await db
    .prepare("SELECT * FROM payment_orders WHERE provider = ? AND provider_session_id = ?")
    .bind(provider, providerSessionId)
    .first();
  return parseOrder(row);
}

export async function getOrderByCaptureId(db, provider, providerCaptureId) {
  const row = await db
    .prepare("SELECT * FROM payment_orders WHERE provider = ? AND provider_capture_id = ?")
    .bind(provider, providerCaptureId)
    .first();
  return parseOrder(row);
}

export async function updateOrder(db, internalOrderId, patch) {
  const keys = Object.keys(patch || {}).filter((key) => patch[key] !== undefined);
  if (!keys.length) return;

  const sql = `UPDATE payment_orders SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE internal_order_id = ?`;
  const values = keys.map((key) => {
    if (key === "metadata_json") return JSON.stringify(patch[key] || {});
    return patch[key];
  });

  await db.prepare(sql).bind(...values, internalOrderId).run();
}

function parseUser(row) {
  if (!row) return null;
  return {
    ...row,
    active: Boolean(row.active)
  };
}

export async function getUserByEmail(db, email) {
  const row = await db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  return parseUser(row);
}

export async function getUserById(db, id) {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  return parseUser(row);
}

export async function upsertUserMembership(db, input) {
  const existing = await getUserByEmail(db, input.email);
  const plan = planByCode(input.membership_type);
  const membershipLabel = input.membership_label || plan?.label || input.membership_type;
  const timestamp = input.updated_at || nowIso();

  if (!existing) {
    const user = {
      id: randomId("usr"),
      email: input.email,
      membership_type: input.membership_type,
      membership_label: membershipLabel,
      preferred_language: input.preferred_language || "vi",
      expires_at: input.expires_at,
      active: 1,
      created_at: input.created_at || timestamp,
      updated_at: timestamp
    };

    await db
      .prepare(
        `INSERT INTO users (
          id,
          email,
          membership_type,
          membership_label,
          preferred_language,
          expires_at,
          active,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.email,
        user.membership_type,
        user.membership_label,
        user.preferred_language,
        user.expires_at,
        user.active,
        user.created_at,
        user.updated_at
      )
      .run();

    return user;
  }

  const currentExpiry = parseIsoOrNull(existing.expires_at);
  const nextExpiry = parseIsoOrNull(input.expires_at);
  const expiresAt =
    currentExpiry && nextExpiry && currentExpiry.getTime() > nextExpiry.getTime() ? existing.expires_at : input.expires_at;

  await db
    .prepare(
      `UPDATE users
       SET membership_type = ?, membership_label = ?, preferred_language = ?, expires_at = ?, active = 1, updated_at = ?
       WHERE id = ?`
    )
    .bind(
      input.membership_type,
      membershipLabel,
      input.preferred_language || existing.preferred_language || "vi",
      expiresAt,
      timestamp,
      existing.id
    )
    .run();

  return {
    ...existing,
    membership_type: input.membership_type,
    membership_label: membershipLabel,
    preferred_language: input.preferred_language || existing.preferred_language || "vi",
    expires_at: expiresAt,
    active: true,
    updated_at: timestamp
  };
}

export async function revokeUserMembership(db, userId, revokedAt) {
  await db
    .prepare("UPDATE users SET active = 0, expires_at = ?, updated_at = ? WHERE id = ?")
    .bind(revokedAt, revokedAt, userId)
    .run();
}

function parseWebhook(row) {
  if (!row) return null;
  return {
    ...row,
    headers_json: safeJsonParse(row.headers_json, {}),
    payload_json: safeJsonParse(row.payload_json, {})
  };
}

export async function getWebhookByEventId(db, eventId) {
  const row = await db.prepare("SELECT * FROM webhook_events WHERE event_id = ?").bind(eventId).first();
  return parseWebhook(row);
}

export async function recordWebhook(db, record) {
  await db
    .prepare(
      `INSERT INTO webhook_events (
        id,
        provider,
        event_id,
        event_type,
        signature_valid,
        headers_json,
        payload_json,
        processed,
        received_at,
        processed_at,
        error_code,
        error_detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      randomId("wh"),
      record.provider,
      record.event_id,
      record.event_type,
      record.signature_valid ? 1 : 0,
      JSON.stringify(record.headers_json || {}),
      JSON.stringify(record.payload_json || {}),
      record.processed ? 1 : 0,
      record.received_at || nowIso(),
      record.processed_at || null,
      record.error_code || null,
      record.error_detail || null
    )
    .run();
}

export async function updateWebhook(db, eventId, patch) {
  const keys = Object.keys(patch || {}).filter((key) => patch[key] !== undefined);
  if (!keys.length) return;
  const sql = `UPDATE webhook_events SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE event_id = ?`;
  const values = keys.map((key) => {
    if (key === "headers_json" || key === "payload_json") return JSON.stringify(patch[key] || {});
    if (key === "processed" || key === "signature_valid") return patch[key] ? 1 : 0;
    return patch[key];
  });
  await db.prepare(sql).bind(...values, eventId).run();
}

function parseMagicLink(row) {
  if (!row) return null;
  return row;
}

export async function createMagicLink(db, record) {
  const id = record.id || randomId("mgl");
  await db
    .prepare(
      `INSERT INTO magic_links (
        id,
        user_id,
        email,
        token_hash,
        redirect_path,
        expires_at,
        used_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      record.user_id || null,
      record.email,
      record.token_hash,
      record.redirect_path || null,
      record.expires_at,
      record.used_at || null,
      record.created_at || nowIso()
    )
    .run();
  return { ...record, id };
}

export async function getMagicLinkByHash(db, tokenHash) {
  const row = await db
    .prepare("SELECT * FROM magic_links WHERE token_hash = ? ORDER BY created_at DESC LIMIT 1")
    .bind(tokenHash)
    .first();
  return parseMagicLink(row);
}

export async function markMagicLinkUsed(db, id, usedAt) {
  await db.prepare("UPDATE magic_links SET used_at = ? WHERE id = ?").bind(usedAt, id).run();
}

function parseEmailJob(row) {
  if (!row) return null;
  return {
    ...row,
    payload_json: safeJsonParse(row.payload_json, {})
  };
}

export async function insertEmailJob(db, record) {
  const id = record.id || randomId("eml");
  await db
    .prepare(
      `INSERT INTO email_jobs (
        id,
        provider,
        template_id,
        recipient_email,
        language,
        dedupe_key,
        payload_json,
        status,
        provider_message_id,
        error_detail,
        scheduled_for,
        sent_at,
        failed_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      record.provider || "resend",
      record.template_id,
      record.recipient_email,
      record.language || "vi",
      record.dedupe_key,
      JSON.stringify(record.payload_json || {}),
      record.status || "queued",
      record.provider_message_id || null,
      record.error_detail || null,
      record.scheduled_for || nowIso(),
      record.sent_at || null,
      record.failed_at || null,
      record.created_at || nowIso(),
      record.updated_at || nowIso()
    )
    .run();
  return { ...record, id };
}

export async function getEmailJobByDedupeKey(db, dedupeKey) {
  const row = await db.prepare("SELECT * FROM email_jobs WHERE dedupe_key = ?").bind(dedupeKey).first();
  return parseEmailJob(row);
}

export async function updateEmailJob(db, id, patch) {
  const keys = Object.keys(patch || {}).filter((key) => patch[key] !== undefined);
  if (!keys.length) return;
  const sql = `UPDATE email_jobs SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`;
  const values = keys.map((key) => {
    if (key === "payload_json") return JSON.stringify(patch[key] || {});
    return patch[key];
  });
  await db.prepare(sql).bind(...values, id).run();
}
