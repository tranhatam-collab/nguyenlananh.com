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

function parseVietQrOrder(row) {
  if (!row) return null;
  return {
    ...row,
    amount: Number(row.amount)
  };
}

export async function createVietQrOrder(db, record) {
  await db
    .prepare(
      `INSERT INTO vietqr_orders (
        internal_order_id,
        email,
        locale,
        plan_code,
        amount,
        currency,
        transfer_note,
        bank_bin,
        account_no,
        account_name,
        qr_url,
        status,
        provider_ref,
        confirmed_by,
        confirmation_note,
        created_at,
        awaiting_confirmation_at,
        confirmed_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      record.internal_order_id,
      record.email,
      record.locale || "vi",
      record.plan_code,
      record.amount,
      record.currency || "VND",
      record.transfer_note,
      record.bank_bin,
      record.account_no,
      record.account_name,
      record.qr_url,
      record.status || "pending",
      record.provider_ref || null,
      record.confirmed_by || null,
      record.confirmation_note || null,
      record.created_at || nowIso(),
      record.awaiting_confirmation_at || null,
      record.confirmed_at || null,
      record.updated_at || nowIso()
    )
    .run();
}

export async function getVietQrOrderByInternalOrderId(db, internalOrderId) {
  const row = await db.prepare("SELECT * FROM vietqr_orders WHERE internal_order_id = ?").bind(internalOrderId).first();
  return parseVietQrOrder(row);
}

export async function listVietQrOrders(db, { status = null, limit = 50 } = {}) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(200, Number(limit))) : 50;
  if (status) {
    const result = await db
      .prepare("SELECT * FROM vietqr_orders WHERE status = ? ORDER BY created_at DESC LIMIT ?")
      .bind(status, safeLimit)
      .all();
    return (result.results || []).map(parseVietQrOrder);
  }

  const result = await db.prepare("SELECT * FROM vietqr_orders ORDER BY created_at DESC LIMIT ?").bind(safeLimit).all();
  return (result.results || []).map(parseVietQrOrder);
}

export async function updateVietQrOrder(db, internalOrderId, patch) {
  const keys = Object.keys(patch || {}).filter((key) => patch[key] !== undefined);
  if (!keys.length) return;
  const sql = `UPDATE vietqr_orders SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE internal_order_id = ?`;
  const values = keys.map((key) => patch[key]);
  await db.prepare(sql).bind(...values, internalOrderId).run();
}

let adminOpsSchemaReady = false;

async function ensureAdminOpsSchema(db) {
  if (adminOpsSchemaReady) return;
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS admin_member_snapshot_queue (
        email TEXT PRIMARY KEY,
        full_name TEXT,
        profile_ready INTEGER NOT NULL DEFAULT 0,
        latest_practice_state TEXT,
        latest_practice_line TEXT,
        latest_practice_day TEXT,
        reminder_paused_until TEXT,
        has_saved_handoff INTEGER NOT NULL DEFAULT 0,
        queue_recommended_route TEXT NOT NULL DEFAULT 'reflection',
        queue_priority_code TEXT NOT NULL DEFAULT 'missing_handoff',
        queue_last_routed_to TEXT,
        queue_last_routed_at TEXT,
        payload_json TEXT NOT NULL,
        source TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    ),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_member_snapshot_queue_route ON admin_member_snapshot_queue(queue_recommended_route, updated_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_member_snapshot_queue_priority ON admin_member_snapshot_queue(queue_priority_code, updated_at DESC)")
  ]);
  adminOpsSchemaReady = true;
}

function parseAdminMemberSnapshot(row) {
  if (!row) return null;
  return {
    ...row,
    profile_ready: Boolean(row.profile_ready),
    has_saved_handoff: Boolean(row.has_saved_handoff),
    payload_json: safeJsonParse(row.payload_json, {})
  };
}

export async function upsertAdminMemberSnapshot(db, record) {
  await ensureAdminOpsSchema(db);
  await db
    .prepare(
      `INSERT INTO admin_member_snapshot_queue (
        email,
        full_name,
        profile_ready,
        latest_practice_state,
        latest_practice_line,
        latest_practice_day,
        reminder_paused_until,
        has_saved_handoff,
        queue_recommended_route,
        queue_priority_code,
        queue_last_routed_to,
        queue_last_routed_at,
        payload_json,
        source,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        full_name = excluded.full_name,
        profile_ready = excluded.profile_ready,
        latest_practice_state = excluded.latest_practice_state,
        latest_practice_line = excluded.latest_practice_line,
        latest_practice_day = excluded.latest_practice_day,
        reminder_paused_until = excluded.reminder_paused_until,
        has_saved_handoff = excluded.has_saved_handoff,
        queue_recommended_route = excluded.queue_recommended_route,
        queue_priority_code = excluded.queue_priority_code,
        queue_last_routed_to = excluded.queue_last_routed_to,
        queue_last_routed_at = excluded.queue_last_routed_at,
        payload_json = excluded.payload_json,
        source = excluded.source,
        updated_at = excluded.updated_at`
    )
    .bind(
      record.email,
      record.full_name || null,
      record.profile_ready ? 1 : 0,
      record.latest_practice_state || null,
      record.latest_practice_line || null,
      record.latest_practice_day || null,
      record.reminder_paused_until || null,
      record.has_saved_handoff ? 1 : 0,
      record.queue_recommended_route || "reflection",
      record.queue_priority_code || "missing_handoff",
      record.queue_last_routed_to || null,
      record.queue_last_routed_at || null,
      JSON.stringify(record.payload_json || {}),
      record.source || "api",
      record.created_at || nowIso(),
      record.updated_at || nowIso()
    )
    .run();
}

export async function clearAdminMemberSnapshots(db) {
  await ensureAdminOpsSchema(db);
  await db.prepare("DELETE FROM admin_member_snapshot_queue").run();
}

export async function listAdminMemberSnapshots(db, { route = "all", handoff = "all", priority = "all", limit = 100 } = {}) {
  await ensureAdminOpsSchema(db);
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(300, Number(limit))) : 100;
  const where = [];
  const params = [];

  if (route !== "all") {
    where.push("queue_recommended_route = ?");
    params.push(route);
  }

  if (handoff === "routed") {
    where.push("queue_last_routed_to IS NOT NULL AND queue_last_routed_to != ''");
  } else if (handoff === "unrouted") {
    where.push("(queue_last_routed_to IS NULL OR queue_last_routed_to = '')");
  }

  if (priority !== "all") {
    where.push("queue_priority_code = ?");
    params.push(priority);
  }

  const sql = `SELECT * FROM admin_member_snapshot_queue${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY updated_at DESC LIMIT ?`;
  const result = await db.prepare(sql).bind(...params, safeLimit).all();
  return (result.results || []).map(parseAdminMemberSnapshot);
}

export async function summarizeAdminMemberSnapshots(db) {
  await ensureAdminOpsSchema(db);
  const result = await db
    .prepare(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN queue_recommended_route = 'reflection' THEN 1 ELSE 0 END) AS reflection_count,
        SUM(CASE WHEN queue_recommended_route = 'pilot' THEN 1 ELSE 0 END) AS pilot_count,
        SUM(CASE WHEN queue_last_routed_to IS NOT NULL AND queue_last_routed_to != '' THEN 1 ELSE 0 END) AS routed_count,
        SUM(CASE WHEN queue_priority_code = 'reflection_now' THEN 1 ELSE 0 END) AS reflection_now_count,
        SUM(CASE WHEN queue_priority_code = 'avoiding' THEN 1 ELSE 0 END) AS avoiding_count,
        SUM(CASE WHEN queue_priority_code = 'missing_handoff' THEN 1 ELSE 0 END) AS missing_handoff_count,
        SUM(CASE WHEN queue_priority_code = 'pilot_ready' THEN 1 ELSE 0 END) AS pilot_ready_count,
        SUM(CASE WHEN queue_priority_code = 'paused' THEN 1 ELSE 0 END) AS paused_count,
        SUM(CASE WHEN queue_priority_code = 'pilot_later' THEN 1 ELSE 0 END) AS pilot_later_count,
        SUM(CASE WHEN queue_priority_code = 'routed' THEN 1 ELSE 0 END) AS routed_priority_count
      FROM admin_member_snapshot_queue`
    )
    .first();

  return {
    total: Number(result?.total || 0),
    routes: {
      reflection: Number(result?.reflection_count || 0),
      pilot: Number(result?.pilot_count || 0),
      routed: Number(result?.routed_count || 0)
    },
    priorities: {
      reflection_now: Number(result?.reflection_now_count || 0),
      avoiding: Number(result?.avoiding_count || 0),
      missing_handoff: Number(result?.missing_handoff_count || 0),
      pilot_ready: Number(result?.pilot_ready_count || 0),
      paused: Number(result?.paused_count || 0),
      pilot_later: Number(result?.pilot_later_count || 0),
      routed: Number(result?.routed_priority_count || 0)
    }
  };
}
