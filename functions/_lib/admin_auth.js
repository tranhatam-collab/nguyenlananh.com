// ============================================================
// Admin RBAC — per-user auth + permission enforcement
// nguyenlananh.com
// ============================================================

import { requireDb, } from "./db.js";
import { requireTurnstile } from "./turnstile.js";
import {
  assert,
  errorResponse,
  json,
  normalizeEmail,
  nowIso,
  randomId,
  randomToken,
  readJson,
  sha256Hex,
  timingSafeEqualHex,
} from "./utils.js";

// ============================================================
// Permission matrix
// ============================================================

const ROLE_PERMISSIONS = {
  super_admin: [
    "dashboard.view",
    "content.view",
    "content.manage",
    "content.image",
    "members.view",
    "members.manage",
    "payments.view",
    "payments.confirm",
    "payments.refund",
    "settings.view",
    "settings.manage",
    "admin_users.manage",
    "ops.queue",
    "audit.view",
    "events.view",
    "errors.view",
    "errors.resolve",
    "learning.view",
    "learning.manage",
  ],
  ops_manager: [
    "dashboard.view",
    "content.view",
    "members.view",
    "members.manage",
    "payments.view",
    "payments.confirm",
    "settings.view",
    "ops.queue",
    "audit.view",
    "events.view",
    "errors.view",
    "learning.view",
  ],
  finance: [
    "dashboard.view",
    "content.view",
    "members.view",
    "payments.view",
    "payments.confirm",
    "payments.refund",
  ],
  content_editor: [
    "dashboard.view",
    "content.view",
    "content.manage",
    "content.image",
  ],
};

const VALID_ROLES = new Set(Object.keys(ROLE_PERMISSIONS));

export function rolePermissions(role) {
  return ROLE_PERMISSIONS[String(role || "")] || [];
}

export function hasPermission(role, permission) {
  const perms = rolePermissions(role);
  return perms.includes(permission);
}

export function isValidRole(role) {
  return VALID_ROLES.has(role);
}

export function allRoles() {
  return Object.entries(ROLE_PERMISSIONS).map(([id, perms]) => ({
    id,
    name: ROLE_NAMES[id] || id,
    permissions: perms,
  }));
}

const ROLE_NAMES = {
  super_admin: "Toàn quyền",
  ops_manager: "Điều hành",
  finance: "Tài chính",
  content_editor: "Biên tập nội dung",
};

// ============================================================
// Password hashing (PBKDF2 via WebCrypto)
// ============================================================

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256
  );
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
  const hashHex = Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`;
}

async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const saltHex = parts[2];
  const expectedHash = parts[3];
  if (!iterations || !saltHex || !expectedHash) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  const actualHash = Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
  return timingSafeEqualHex(actualHash, expectedHash);
}

// ============================================================
// Session management
// ============================================================

const ADMIN_SESSION_COOKIE = "__nla_admin";
const ADMIN_SESSION_TTL_HOURS = 8;

export function adminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function adminSessionTtlHours() {
  return ADMIN_SESSION_TTL_HOURS;
}

async function createAdminSession(db, adminUser, context) {
  const token = randomToken(48);
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const ip = clientIp(context);
  const userAgent = String(context.request.headers.get("User-Agent") || "").slice(0, 500);

  await db.prepare(
    `INSERT INTO admin_sessions (token_hash, admin_user_id, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(tokenHash, adminUser.id, expiresAt, ip, userAgent).run();

  await db.prepare(
    `UPDATE admin_users SET last_login_at = ?, last_login_ip = ?, failed_attempts = 0, locked_until = NULL, updated_at = ?
     WHERE id = ?`
  ).bind(nowIso(), ip, nowIso(), adminUser.id).run();

  return { token, tokenHash, expiresAt };
}

export async function parseAdminSession(db, cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = String(cookieHeader).split(";").map((c) => c.trim());
  let token = null;
  for (const cookie of cookies) {
    if (cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`)) {
      token = decodeURIComponent(cookie.slice(`${ADMIN_SESSION_COOKIE}=`.length));
      break;
    }
  }
  if (!token) return null;

  const tokenHash = await sha256Hex(token);
  const row = await db.prepare(
    `SELECT s.*, u.email, u.role, u.display_name, u.active, u.must_change_password
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.token_hash = ? AND s.revoked = 0 AND s.expires_at > datetime('now')
     LIMIT 1`
  ).bind(tokenHash).first();

  if (!row) return null;
  if (!row.active) return null;

  return {
    adminUserId: row.admin_user_id,
    email: row.email,
    role: row.role,
    displayName: row.display_name,
    mustChangePassword: Boolean(row.must_change_password),
    tokenHash: row.token_hash,
  };
}

export async function revokeAdminSession(db, tokenHash) {
  await db.prepare(`UPDATE admin_sessions SET revoked = 1 WHERE token_hash = ?`).bind(tokenHash).run();
}

export function adminSessionCookieHeaders(token, options = {}) {
  const secure = options.secure !== false ? "; Secure" : "";
  const sameSite = options.sameSite || "Lax";
  const httpOnly = options.httpOnly !== false ? "; HttpOnly" : "";
  const domain = options.domain !== false ? `; Domain=${options.domain || ".nguyenlananh.com"}` : "";
  const maxAge = ADMIN_SESSION_TTL_HOURS * 60 * 60;
  return {
    "Set-Cookie": `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}${httpOnly}${secure}${domain}; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}`,
  };
}

export function adminLogoutCookieHeaders() {
  return {
    "Set-Cookie": `${ADMIN_SESSION_COOKIE}=; HttpOnly; Secure; Domain=.nguyenlananh.com; Path=/; Max-Age=0; SameSite=Lax`,
  };
}

// ============================================================
// Audit log
// ============================================================

export async function auditLog(db, session, action, detail = {}) {
  const entry = {
    id: randomId("audit"),
    admin_user_id: session.adminUserId,
    admin_email: session.email,
    action: String(action).slice(0, 100),
    resource: String(detail.resource || "").slice(0, 100),
    resource_id: String(detail.resourceId || "").slice(0, 200),
    detail: JSON.stringify(detail).slice(0, 4000),
    ip: String(detail.ip || "").slice(0, 100),
    user_agent: String(detail.userAgent || "").slice(0, 500),
  };
  await db.prepare(
    `INSERT INTO admin_audit_log (id, admin_user_id, admin_email, action, resource, resource_id, detail, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    entry.id, entry.admin_user_id, entry.admin_email, entry.action,
    entry.resource, entry.resource_id, entry.detail, entry.ip, entry.user_agent
  ).run();
}

// ============================================================
// Auth helpers for API endpoints
// ============================================================

function clientIp(context) {
  return String(
    context.request.headers.get("CF-Connecting-IP") ||
    context.request.headers.get("X-Forwarded-For") ||
    ""
  ).split(",")[0].trim().slice(0, 100);
}

export async function requireAdminSession(context) {
  const db = requireDb(context.env);
  const cookieHeader = context.request.headers.get("Cookie");
  const session = await parseAdminSession(db, cookieHeader);
  if (!session) {
    const error = new Error("Admin session required.");
    error.code = "ADMIN_SESSION_REQUIRED";
    error.status = 401;
    throw error;
  }
  return { db, session };
}

export async function requireAdminPermission(context, permission) {
  const { db, session } = await requireAdminSession(context);
  if (!hasPermission(session.role, permission)) {
    const error = new Error(`Permission denied: ${permission}`);
    error.code = "ADMIN_PERMISSION_DENIED";
    error.status = 403;
    throw error;
  }
  return { db, session };
}

// ============================================================
// D1 queries for admin users
// ============================================================

export async function getAdminUserById(db, id) {
  return db.prepare(`SELECT * FROM admin_users WHERE id = ?`).bind(id).first();
}

export async function getAdminUserByEmail(db, email) {
  return db.prepare(`SELECT * FROM admin_users WHERE email = ?`).bind(email).first();
}

export async function listAdminUsers(db) {
  const result = await db.prepare(
    `SELECT id, email, role, display_name, active, must_change_password, last_login_at, last_login_ip, created_at
     FROM admin_users ORDER BY created_at ASC`
  ).all();
  return result.results || [];
}

export async function createAdminUser(db, input) {
  const email = normalizeEmail(input.email);
  assert(email, "EMAIL_INVALID", "A valid email is required.", 422);
  assert(isValidRole(input.role), "ROLE_INVALID", `Role must be one of: ${[...VALID_ROLES].join(", ")}`, 422);
  const existing = await getAdminUserByEmail(db, email);
  assert(!existing, "EMAIL_EXISTS", "An admin user with this email already exists.", 409);
  const password = String(input.password || "").trim();
  assert(password.length >= 8, "PASSWORD_TOO_SHORT", "Password must be at least 8 characters.", 422);
  const passwordHash = await hashPassword(password);
  const id = randomId("adm");
  await db.prepare(
    `INSERT INTO admin_users (id, email, password_hash, role, display_name, active, must_change_password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, email, passwordHash, input.role,
    String(input.display_name || "").slice(0, 200),
    input.active === false ? 0 : 1,
    input.must_change_password ? 1 : 0
  ).run();
  return getAdminUserById(db, id);
}

export async function updateAdminUser(db, id, patch) {
  const user = await getAdminUserById(db, id);
  assert(user, "USER_NOT_FOUND", "Admin user not found.", 404);
  const fields = [];
  const values = [];
  if (patch.email) {
    const email = normalizeEmail(patch.email);
    assert(email, "EMAIL_INVALID", "A valid email is required.", 422);
    fields.push("email = ?"); values.push(email);
  }
  if (patch.role) {
    assert(isValidRole(patch.role), "ROLE_INVALID", `Role must be one of: ${[...VALID_ROLES].join(", ")}`, 422);
    fields.push("role = ?"); values.push(patch.role);
  }
  if (patch.display_name !== undefined) {
    fields.push("display_name = ?"); values.push(String(patch.display_name).slice(0, 200));
  }
  if (patch.active !== undefined) {
    fields.push("active = ?"); values.push(patch.active ? 1 : 0);
  }
  if (patch.password) {
    assert(String(patch.password).length >= 8, "PASSWORD_TOO_SHORT", "Password must be at least 8 characters.", 422);
    const passwordHash = await hashPassword(patch.password);
    fields.push("password_hash = ?"); values.push(passwordHash);
    fields.push("must_change_password = ?"); values.push(0);
  }
  if (fields.length === 0) return user;
  fields.push("updated_at = ?"); values.push(nowIso());
  values.push(id);
  await db.prepare(`UPDATE admin_users SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  return getAdminUserById(db, id);
}

export async function deleteAdminUser(db, id) {
  const user = await getAdminUserById(db, id);
  assert(user, "USER_NOT_FOUND", "Admin user not found.", 404);
  await db.prepare(`DELETE FROM admin_users WHERE id = ?`).bind(id).run();
  return user;
}

export async function listAuditLog(db, { limit = 100, action = null } = {}) {
  const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
  if (action) {
    const result = await db.prepare(
      `SELECT * FROM admin_audit_log WHERE action = ? ORDER BY created_at DESC LIMIT ?`
    ).bind(action, safeLimit).all();
    return result.results || [];
  }
  const result = await db.prepare(
    `SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ?`
  ).bind(safeLimit).all();
  return result.results || [];
}

// ============================================================
// Login / logout response handlers
// ============================================================

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export async function adminLoginResponse(context) {
  try {
    const db = requireDb(context.env);
    const body = await readJson(context.request);
    assert(body, "INVALID_JSON", "Request body must be valid JSON.", 400);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    assert(email, "EMAIL_REQUIRED", "Email is required.", 422);
    assert(password, "PASSWORD_REQUIRED", "Password is required.", 422);

    // Turnstile bot verification
    const turnstileError = await requireTurnstile(body, context.request, context.env);
    if (turnstileError) {
      return json({ ok: false, error: { code: turnstileError.code, message: turnstileError.message } }, { status: turnstileError.status });
    }

    const user = await getAdminUserByEmail(db, email);
    if (!user || !user.active) {
      return json({ ok: false, error: { code: "LOGIN_FAILED", message: "Invalid credentials." } }, { status: 401 });
    }

    // Check lock
    if (user.locked_until) {
      const lockUntil = new Date(user.locked_until).getTime();
      if (Number.isFinite(lockUntil) && lockUntil > Date.now()) {
        return json({
          ok: false,
          error: {
            code: "ACCOUNT_LOCKED",
            message: `Account locked. Try again after ${new Date(lockUntil).toISOString()}.`,
          },
        }, { status: 423 });
      }
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      const attempts = Number(user.failed_attempts || 0) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString();
        await db.prepare(
          `UPDATE admin_users SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?`
        ).bind(attempts, lockUntil, nowIso(), user.id).run();
      } else {
        await db.prepare(
          `UPDATE admin_users SET failed_attempts = ?, updated_at = ? WHERE id = ?`
        ).bind(attempts, nowIso(), user.id).run();
      }
      return json({ ok: false, error: { code: "LOGIN_FAILED", message: "Invalid credentials." } }, { status: 401 });
    }

    const { token, expiresAt } = await createAdminSession(db, user, context);
    const cookieHeaders = adminSessionCookieHeaders(token);

    await auditLog(db, { adminUserId: user.id, email: user.email, role: user.role }, "login", {
      ip: clientIp(context),
      userAgent: context.request.headers.get("User-Agent") || "",
    });

    return json({
      ok: true,
      admin_user: {
        id: user.id,
        email: user.email,
        role: user.role,
        display_name: user.display_name,
        must_change_password: Boolean(user.must_change_password),
      },
      expires_at: expiresAt,
      permissions: rolePermissions(user.role),
    }, { headers: cookieHeaders });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_LOGIN_FAILED", error.message || "Login failed.");
  }
}

export async function adminLogoutResponse(context) {
  try {
    const db = requireDb(context.env);
    const cookieHeader = context.request.headers.get("Cookie");
    const session = await parseAdminSession(db, cookieHeader);
    if (session) {
      await revokeAdminSession(db, session.tokenHash);
      await auditLog(db, session, "logout", {});
    }
    return json({ ok: true }, { headers: adminLogoutCookieHeaders() });
  } catch (error) {
    return json({ ok: true }, { headers: adminLogoutCookieHeaders() });
  }
}

export async function adminMeResponse(context) {
  try {
    const { db, session } = await requireAdminSession(context);
    return json({
      ok: true,
      admin_user: {
        id: session.adminUserId,
        email: session.email,
        role: session.role,
        display_name: session.displayName,
        must_change_password: session.mustChangePassword,
      },
      permissions: rolePermissions(session.role),
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_ME_FAILED", error.message || "Not authenticated.", 401);
  }
}

// ============================================================
// Admin users CRUD (super_admin only)
// ============================================================

export async function listAdminUsersResponse(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "admin_users.manage");
    const users = await listAdminUsers(db);
    await auditLog(db, session, "admin_users.list", { ip: clientIp(context) });
    return json({ ok: true, count: users.length, users });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_USERS_LIST_FAILED", error.message || "Unable to list admin users.");
  }
}

export async function createAdminUserResponse(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "admin_users.manage");
    const body = await readJson(context.request);
    const user = await createAdminUser(db, body);
    await auditLog(db, session, "admin_users.create", {
      resource: "admin_user",
      resourceId: user.id,
      ip: clientIp(context),
      userAgent: context.request.headers.get("User-Agent") || "",
      email: user.email,
      role: user.role,
    });
    return json({
      ok: true,
      admin_user: {
        id: user.id,
        email: user.email,
        role: user.role,
        display_name: user.display_name,
        active: Boolean(user.active),
        must_change_password: Boolean(user.must_change_password),
      },
    }, { status: 201 });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_USER_CREATE_FAILED", error.message || "Unable to create admin user.");
  }
}

export async function updateAdminUserResponse(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "admin_users.manage");
    const body = await readJson(context.request);
    const id = String(context.params.id || "").trim();
    assert(id, "USER_ID_REQUIRED", "Admin user id is required.", 422);
    const updated = await updateAdminUser(db, id, body);
    await auditLog(db, session, "admin_users.update", {
      resource: "admin_user",
      resourceId: id,
      ip: clientIp(context),
      changes: Object.keys(body || {}),
    });
    return json({
      ok: true,
      admin_user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        display_name: updated.display_name,
        active: Boolean(updated.active),
        must_change_password: Boolean(updated.must_change_password),
      },
    });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_USER_UPDATE_FAILED", error.message || "Unable to update admin user.");
  }
}

export async function deleteAdminUserResponse(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "admin_users.manage");
    const id = String(context.params.id || "").trim();
    assert(id, "USER_ID_REQUIRED", "Admin user id is required.", 422);
    assert(id !== session.adminUserId, "CANNOT_DELETE_SELF", "You cannot delete your own account.", 422);
    const deleted = await deleteAdminUser(db, id);
    await auditLog(db, session, "admin_users.delete", {
      resource: "admin_user",
      resourceId: id,
      ip: clientIp(context),
      email: deleted.email,
    });
    return json({ ok: true, deleted: true });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "ADMIN_USER_DELETE_FAILED", error.message || "Unable to delete admin user.");
  }
}

// ============================================================
// Audit log response
// ============================================================

export async function listAuditLogResponse(context) {
  try {
    const { db, session } = await requireAdminPermission(context, "audit.view");
    const url = new URL(context.request.url);
    const limit = url.searchParams.get("limit") || 100;
    const action = url.searchParams.get("action") || null;
    const entries = await listAuditLog(db, { limit, action });
    return json({ ok: true, count: entries.length, entries });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "AUDIT_LOG_FAILED", error.message || "Unable to list audit log.");
  }
}

// ============================================================
// Change own password
// ============================================================

export async function changeOwnPasswordResponse(context) {
  try {
    const { db, session } = await requireAdminSession(context);
    const body = await readJson(context.request);
    const currentPassword = String(body.current_password || "");
    const newPassword = String(body.new_password || "");
    assert(currentPassword, "CURRENT_PASSWORD_REQUIRED", "Current password is required.", 422);
    assert(newPassword.length >= 8, "PASSWORD_TOO_SHORT", "New password must be at least 8 characters.", 422);

    const user = await getAdminUserById(db, session.adminUserId);
    assert(user, "USER_NOT_FOUND", "Admin user not found.", 404);
    const valid = await verifyPassword(currentPassword, user.password_hash);
    assert(valid, "CURRENT_PASSWORD_INVALID", "Current password is incorrect.", 401);

    await updateAdminUser(db, session.adminUserId, { password: newPassword });
    await auditLog(db, session, "password.change", { ip: clientIp(context) });
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error.status || 500, error.code || "PASSWORD_CHANGE_FAILED", error.message || "Unable to change password.");
  }
}
