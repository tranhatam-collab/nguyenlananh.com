// ============================================================
// Site Logger — unified event logging cho toàn bộ website
// Tự động ghi mọi event vào D1 site_events + site_errors
// ============================================================

import { nowIso, randomId } from "./utils.js";

// ============================================================
// Path filtering — không log static assets, chỉ log meaningful requests
// ============================================================

const SKIP_PREFIXES = [
  "/assets/",
  "/_headers",
  "/_redirects",
  "/_routes.json",
  "/favicon",
  "/robots.txt",
  "/sitemap",
  "/.well-known/",
  "/brand/",
  "/og/",
  "/css/",
  "/js/",
  "/fonts/",
  "/images/",
];

const SKIP_EXTENSIONS = [
  ".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map", ".json",
];

function shouldLog(path) {
  if (!path) return false;
  for (const prefix of SKIP_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }
  const lower = path.toLowerCase();
  for (const ext of SKIP_EXTENSIONS) {
    if (lower.endsWith(ext)) return false;
  }
  return true;
}

// ============================================================
// Categorize — tự động phân loại event dựa trên path
// ============================================================

function categorize(path, method, status) {
  if (!path) return "system";
  if (path.startsWith("/api/auth/")) return "auth";
  if (path.startsWith("/api/admin/")) return "admin";
  if (path.startsWith("/api/payments/")) return "payment";
  if (path.startsWith("/api/contact")) return "system";
  if (path.startsWith("/api/")) return "system";
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/members/deep/")) return "content";
  if (path.startsWith("/members/")) return "auth";
  if (path.startsWith("/join/")) return "payment";
  if (status >= 500) return "system";
  return "request";
}

function levelFromStatus(status) {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  if (status >= 300) return "info";
  return "info";
}

function actionFromPath(path, method, status) {
  if (!path) return "unknown";
  // Auth actions
  if (path.includes("/auth/google/start")) return "google_oauth_start";
  if (path.includes("/auth/google/callback")) return "google_oauth_callback";
  if (path.includes("/auth/login")) return "login";
  if (path.includes("/auth/logout")) return "logout";
  if (path.includes("/auth/session")) return "session_check";
  if (path.includes("/auth/magic-link")) return "magic_link";
  // Payment actions
  if (path.includes("/payments/vietqr/create")) return "order_created";
  if (path.includes("/payments/vietqr/mark-pending")) return "payment_pending";
  if (path.includes("/vietqr-confirm")) return "payment_confirmed";
  if (path.includes("/payments/vietqr/orders")) return "orders_listed";
  if (path.includes("/payments/create-checkout")) return "checkout_created";
  if (path.includes("/payments/webhook")) return "webhook_received";
  // Admin actions
  if (path.includes("/admin/users") && method === "POST") return "admin_user_created";
  if (path.includes("/admin/users") && method === "GET") return "admin_users_listed";
  if (path.includes("/admin/audit")) return "audit_log_viewed";
  if (path.includes("/admin/ops/queue")) return "ops_queue_accessed";
  if (path.includes("/admin/events")) return "events_viewed";
  // Content
  if (path.includes("/members/deep/")) return "deep_content_accessed";
  if (path.includes("/members/start")) return "member_start";
  if (path.includes("/members/dashboard")) return "member_dashboard";
  if (path.includes("/join/")) return "join_page";
  if (path.includes("/tai-lieu/")) return "docs_hub";
  // Contact
  if (path.includes("/api/contact")) return "contact_submitted";
  // Error
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "request";
}

// ============================================================
// Client info extraction
// ============================================================

function clientIp(request) {
  return String(
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    ""
  ).split(",")[0].trim().slice(0, 100);
}

function userAgent(request) {
  return String(request.headers.get("User-Agent") || "").slice(0, 500);
}

function country(request) {
  return String(request.headers.get("CF-IPCountry") || "").slice(0, 10);
}

// ============================================================
// Core logging — write to D1 site_events
// ============================================================

export async function logSiteEvent(db, event) {
  if (!db) return;
  try {
    await db.prepare(
      `INSERT INTO site_events (ts, level, category, action, method, path, status, duration_ms, user_email, admin_email, ip, user_agent, country, detail, request_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      nowIso(),
      String(event.level || "info").slice(0, 20),
      String(event.category || "request").slice(0, 30),
      String(event.action || "").slice(0, 60),
      String(event.method || "").slice(0, 10),
      String(event.path || "").slice(0, 500),
      Number(event.status) || 0,
      Number(event.durationMs) || 0,
      String(event.userEmail || "").slice(0, 300),
      String(event.adminEmail || "").slice(0, 300),
      String(event.ip || "").slice(0, 100),
      String(event.userAgent || "").slice(0, 500),
      String(event.country || "").slice(0, 10),
      String(event.detail || "").slice(0, 4000),
      String(event.requestId || "").slice(0, 60)
    ).run();
  } catch (_e) {
    // Logging must never break the request
  }
}

export async function logSiteError(db, error) {
  if (!db) return;
  try {
    await db.prepare(
      `INSERT INTO site_errors (ts, request_id, status, code, message, path, method, stack, ip, user_email, admin_email, request_body)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      nowIso(),
      String(error.requestId || "").slice(0, 60),
      Number(error.status) || 0,
      String(error.code || "").slice(0, 100),
      String(error.message || "").slice(0, 1000),
      String(error.path || "").slice(0, 500),
      String(error.method || "").slice(0, 10),
      String(error.stack || "").slice(0, 4000),
      String(error.ip || "").slice(0, 100),
      String(error.userEmail || "").slice(0, 300),
      String(error.adminEmail || "").slice(0, 300),
      String(error.requestBody || "").slice(0, 2000)
    ).run();
  } catch (_e) {
    // Logging must never break the request
  }
}

// ============================================================
// Middleware wrapper — tự động log mọi request
// ============================================================

export function createRequestLogger(db, session, adminSession) {
  return async function logRequest(request, response, durationMs, requestId) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (!shouldLog(path)) return;

    const status = response.status;
    const level = levelFromStatus(status);
    const category = categorize(path, request.method, status);
    const action = actionFromPath(path, request.method, status);

    const event = {
      level,
      category,
      action,
      method: request.method,
      path,
      status,
      durationMs,
      userEmail: session?.email || "",
      adminEmail: adminSession?.email || "",
      ip: clientIp(request),
      userAgent: userAgent(request),
      country: country(request),
      detail: "",
      requestId,
    };

    await logSiteEvent(db, event);

    // Log errors (4xx + 5xx) to site_errors table with more detail
    if (status >= 400) {
      let errorDetail = "";
      try {
        const cloned = response.clone();
        const body = await cloned.text();
        errorDetail = body.slice(0, 2000);
      } catch (_e) {}

      await logSiteError(db, {
        requestId,
        status,
        code: action,
        message: `${request.method} ${path} → ${status}`,
        path,
        method: request.method,
        stack: errorDetail,
        ip: event.ip,
        userEmail: event.userEmail,
        adminEmail: event.adminEmail,
        requestBody: "",
      });
    }
  };
}

// ============================================================
// Manual event logging — for use in endpoints
// ============================================================

export async function trackEvent(db, {
  level = "info",
  category = "system",
  action = "",
  path = "",
  method = "",
  status = 0,
  userEmail = "",
  adminEmail = "",
  ip = "",
  userAgent = "",
  country = "",
  detail = "",
  requestId = "",
} = {}) {
  await logSiteEvent(db, {
    level, category, action, method, path, status,
    durationMs: 0, userEmail, adminEmail, ip, userAgent, country,
    detail: typeof detail === "object" ? JSON.stringify(detail) : String(detail),
    requestId,
  });
}

export async function trackError(db, {
  status = 500,
  code = "",
  message = "",
  path = "",
  method = "",
  stack = "",
  ip = "",
  userEmail = "",
  adminEmail = "",
  requestBody = "",
  requestId = "",
} = {}) {
  await logSiteError(db, {
    status, code, message, path, method, stack,
    ip, userEmail, adminEmail, requestBody, requestId,
  });
}

// ============================================================
// Query helpers for admin API
// ============================================================

export async function listSiteEvents(db, {
  limit = 100,
  level = null,
  category = null,
  action = null,
  path = null,
  status = null,
  userEmail = null,
  adminEmail = null,
  requestId = null,
  since = null,
  until = null,
} = {}) {
  const conditions = [];
  const values = [];
  if (level) { conditions.push("level = ?"); values.push(level); }
  if (category) { conditions.push("category = ?"); values.push(category); }
  if (action) { conditions.push("action = ?"); values.push(action); }
  if (path) { conditions.push("path LIKE ?"); values.push(`%${path}%`); }
  if (status) { conditions.push("status = ?"); values.push(Number(status)); }
  if (userEmail) { conditions.push("user_email = ?"); values.push(userEmail); }
  if (adminEmail) { conditions.push("admin_email = ?"); values.push(adminEmail); }
  if (requestId) { conditions.push("request_id = ?"); values.push(requestId); }
  if (since) { conditions.push("ts >= ?"); values.push(since); }
  if (until) { conditions.push("ts <= ?"); values.push(until); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const safeLimit = Math.max(1, Math.min(1000, Number(limit) || 100));
  const result = await db.prepare(
    `SELECT * FROM site_events ${where} ORDER BY ts DESC LIMIT ?`
  ).bind(...values, safeLimit).all();
  return result.results || [];
}

export async function listSiteErrors(db, {
  limit = 100,
  status = null,
  code = null,
  resolved = null,
  since = null,
  until = null,
} = {}) {
  const conditions = [];
  const values = [];
  if (status) { conditions.push("status = ?"); values.push(Number(status)); }
  if (code) { conditions.push("code LIKE ?"); values.push(`%${code}%`); }
  if (resolved !== null) { conditions.push("resolved = ?"); values.push(resolved ? 1 : 0); }
  if (since) { conditions.push("ts >= ?"); values.push(since); }
  if (until) { conditions.push("ts <= ?"); values.push(until); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
  const result = await db.prepare(
    `SELECT * FROM site_errors ${where} ORDER BY ts DESC LIMIT ?`
  ).bind(...values, safeLimit).all();
  return result.results || [];
}

export async function siteEventsSummary(db) {
  const totalResult = await db.prepare(`SELECT COUNT(*) as total FROM site_events`).first();
  const errorResult = await db.prepare(`SELECT COUNT(*) as total FROM site_events WHERE level IN ('error','critical')`).first();
  const warnResult = await db.prepare(`SELECT COUNT(*) as total FROM site_events WHERE level = 'warn'`).first();
  const unresolvedResult = await db.prepare(`SELECT COUNT(*) as total FROM site_errors WHERE resolved = 0`).first();
  const byCategory = await db.prepare(
    `SELECT category, COUNT(*) as count FROM site_events GROUP BY category ORDER BY count DESC`
  ).all();
  const byStatus = await db.prepare(
    `SELECT status, COUNT(*) as count FROM site_events WHERE status > 0 GROUP BY status ORDER BY status`
  ).all();
  const last24h = await db.prepare(
    `SELECT COUNT(*) as total FROM site_events WHERE ts > datetime('now', '-1 day')`
  ).first();
  const lastHour = await db.prepare(
    `SELECT COUNT(*) as total FROM site_events WHERE ts > datetime('now', '-1 hour')`
  ).first();
  return {
    total: totalResult?.total || 0,
    errors: errorResult?.total || 0,
    warnings: warnResult?.total || 0,
    unresolvedErrors: unresolvedResult?.total || 0,
    last24h: last24h?.total || 0,
    lastHour: lastHour?.total || 0,
    byCategory: byCategory.results || [],
    byStatus: byStatus.results || [],
  };
}

export async function resolveSiteError(db, id, resolvedBy) {
  await db.prepare(
    `UPDATE site_errors SET resolved = 1, resolved_at = ?, resolved_by = ? WHERE id = ?`
  ).bind(nowIso(), String(resolvedBy || "").slice(0, 300), Number(id)).run();
}
