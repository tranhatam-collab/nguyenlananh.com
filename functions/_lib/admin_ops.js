import {
  clearAdminMemberSnapshots,
  listAdminMemberSnapshots,
  requireDb,
  summarizeAdminMemberSnapshots,
  upsertAdminMemberSnapshot
} from "./db.js";
import {
  assert,
  errorResponse,
  isFutureIso,
  json,
  normalizeEmail,
  nowIso,
  readJson,
  timingSafeEqualHex
} from "./utils.js";

const ROUTE_CODES = new Set(["all", "reflection", "pilot"]);
const HANDOFF_CODES = new Set(["all", "routed", "unrouted"]);
const PRIORITY_CODES = new Set(["all", "reflection_now", "avoiding", "missing_handoff", "pilot_ready", "paused", "pilot_later", "routed"]);

function requireAdminOpsAccess(context) {
  const secret = String(context.env.ADMIN_OPS_KEY || context.env.PAYMENTS_ADMIN_KEY || context.env.ADMIN_PAYMENT_CONFIRM_KEY || "");
  assert(secret, "ADMIN_KEY_NOT_CONFIGURED", "Admin ops key is missing.", 503);
  const provided = String(context.request.headers.get("x-admin-key") || "");
  assert(provided, "ADMIN_KEY_REQUIRED", "x-admin-key is required.", 401);
  assert(timingSafeEqualHex(provided, secret), "ADMIN_KEY_INVALID", "Invalid admin key.", 403);
}

function recommendedRouteForSnapshot(packet) {
  const state = String(packet?.latestPracticeState || "");
  if (state === "human_reflection" || state === "avoiding" || !packet?.hasSavedHandoff) {
    return "reflection";
  }
  return "pilot";
}

function queuePriorityCode(packet) {
  const route = String(packet?.queueRecommendedRoute || recommendedRouteForSnapshot(packet));
  const latestState = String(packet?.latestPracticeState || "");
  const routed = Boolean(packet?.queueLastRoutedTo);
  const paused = isFutureIso(packet?.reminderPausedUntil);
  const profileReady = Boolean(packet?.profileReady);
  const hasPracticeLine = Boolean(String(packet?.latestPracticeLine || "").trim());
  const hasHandoff = Boolean(packet?.hasSavedHandoff);

  if (!routed && route === "reflection" && latestState === "human_reflection") return "reflection_now";
  if (!routed && route === "reflection" && latestState === "avoiding") return "avoiding";
  if (!routed && route === "reflection" && !hasHandoff) return "missing_handoff";
  if (!routed && route === "pilot" && profileReady && hasPracticeLine && !paused) return "pilot_ready";
  if (!routed && route === "pilot" && paused) return "paused";
  if (!routed && route === "pilot") return "pilot_later";
  return "routed";
}

function normalizeQueueItem(packet, source) {
  const email = normalizeEmail(packet?.email);
  assert(email && email.includes("@"), "EMAIL_INVALID", "A valid email is required in each queue item.", 422);

  const latestPracticeState = String(packet?.latestPracticeState || "").trim().toLowerCase();
  const hasSavedHandoff = Boolean(packet?.hasSavedHandoff);
  const queueRecommendedRoute = String(packet?.queueRecommendedRoute || recommendedRouteForSnapshot(packet)).trim().toLowerCase();
  const normalizedRoute = ROUTE_CODES.has(queueRecommendedRoute) && queueRecommendedRoute !== "all" ? queueRecommendedRoute : recommendedRouteForSnapshot(packet);
  const queueLastRoutedToRaw = String(packet?.queueLastRoutedTo || "").trim().toLowerCase();
  const queueLastRoutedTo = queueLastRoutedToRaw === "reflection" || queueLastRoutedToRaw === "pilot" ? queueLastRoutedToRaw : "";
  const priority = queuePriorityCode({
    ...packet,
    queueRecommendedRoute: normalizedRoute,
    queueLastRoutedTo,
    hasSavedHandoff,
    latestPracticeState
  });

  return {
    email,
    full_name: String(packet?.fullName || "").trim().slice(0, 180),
    profile_ready: Boolean(packet?.profileReady),
    latest_practice_state: latestPracticeState.slice(0, 40),
    latest_practice_line: String(packet?.latestPracticeLine || "").trim().slice(0, 1200),
    latest_practice_day: String(packet?.latestPracticeDay || "").trim().slice(0, 40),
    reminder_paused_until: String(packet?.reminderPausedUntil || "").trim().slice(0, 80),
    has_saved_handoff: hasSavedHandoff,
    queue_recommended_route: normalizedRoute,
    queue_priority_code: priority,
    queue_last_routed_to: queueLastRoutedTo,
    queue_last_routed_at: String(packet?.queueLastRoutedAt || "").trim().slice(0, 80),
    payload_json: packet || {},
    source: String(source || "api").slice(0, 80),
    updated_at: nowIso()
  };
}

function extractQueueItems(body) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  if (Array.isArray(body.items)) return body.items;
  return [body];
}

function routeFilterFromParams(url) {
  const route = String(url.searchParams.get("route") || "all").trim().toLowerCase();
  return ROUTE_CODES.has(route) ? route : "all";
}

function handoffFilterFromParams(url) {
  const handoff = String(url.searchParams.get("handoff") || "all").trim().toLowerCase();
  return HANDOFF_CODES.has(handoff) ? handoff : "all";
}

function priorityFilterFromParams(url) {
  const priority = String(url.searchParams.get("priority") || "all").trim().toLowerCase();
  return PRIORITY_CODES.has(priority) ? priority : "all";
}

function limitFromParams(url) {
  const value = Number(url.searchParams.get("limit") || 100);
  if (!Number.isFinite(value)) return 100;
  return Math.max(1, Math.min(300, value));
}

export async function listAdminOpsQueueResponse(context) {
  try {
    requireAdminOpsAccess(context);
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const route = routeFilterFromParams(url);
    const handoff = handoffFilterFromParams(url);
    const priority = priorityFilterFromParams(url);
    const limit = limitFromParams(url);

    const items = await listAdminMemberSnapshots(db, { route, handoff, priority, limit });
    const summary = await summarizeAdminMemberSnapshots(db);
    return json({
      ok: true,
      source: "d1_admin_ops_queue",
      filters: { route, handoff, priority, limit },
      summary,
      count: items.length,
      items
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_OPS_QUEUE_LIST_FAILED", error.message || "Unable to list admin ops queue.");
  }
}

export async function upsertAdminOpsQueueResponse(context) {
  try {
    requireAdminOpsAccess(context);
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const packetType = String(body.packet_type || "").trim();
    if (packetType) {
      assert(
        packetType === "admin_member_snapshot_queue" || packetType === "member_ops_snapshot",
        "PACKET_TYPE_INVALID",
        "packet_type must be admin_member_snapshot_queue or member_ops_snapshot.",
        422
      );
    }

    const items = extractQueueItems(body);
    assert(items.length > 0, "QUEUE_ITEMS_REQUIRED", "At least one queue item is required.", 422);
    assert(items.length <= 200, "QUEUE_ITEMS_TOO_MANY", "Maximum 200 queue items per request.", 422);

    const db = requireDb(context.env);
    const source = String(body.source || body.packet_type || "api").slice(0, 80);
    const normalized = items.map((item) => normalizeQueueItem(item, source));

    for (const item of normalized) {
      await upsertAdminMemberSnapshot(db, item);
    }

    const summary = await summarizeAdminMemberSnapshots(db);
    return json({
      ok: true,
      upserted: normalized.length,
      summary
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_OPS_QUEUE_UPSERT_FAILED", error.message || "Unable to upsert admin ops queue.");
  }
}

export async function clearAdminOpsQueueResponse(context) {
  try {
    requireAdminOpsAccess(context);
    const db = requireDb(context.env);
    await clearAdminMemberSnapshots(db);
    return json({
      ok: true,
      cleared: true
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_OPS_QUEUE_CLEAR_FAILED", error.message || "Unable to clear admin ops queue.");
  }
}
