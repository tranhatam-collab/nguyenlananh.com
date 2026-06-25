import { parseSessionCookie } from "./_lib/session.js";
import { getUserById } from "./_lib/db.js";
import { parseAdminSession, hasPermission } from "./_lib/admin_auth.js";
import { logWarn, setLogDbRef } from "./_lib/log.js";
import { logSiteEvent, logSiteError } from "./_lib/site_logger.js";
import { randomId } from "./_lib/utils.js";

const ADMIN_PATHS = ["/admin", "/en/admin"];
const ADMIN_LOGIN_PATHS = ["/admin/login", "/en/admin/login", "/admin/login/", "/en/admin/login/"];

// Paths under /members/ that require active paid membership OR content_access.
// /members/ itself, /members/start/, /members/dashboard/ stay public.
// /members/deep/ index is public (shows list), individual lessons require entitlement.
const GATED_MEMBER_PREFIXES = ["/members/deep/", "/en/members/deep/"];

// Paths under /members/ that are public (no session needed).
const PUBLIC_MEMBER_PATHS = [
  "/members/",
  "/members/start/",
  "/members/index.html",
  "/members/deep/",
  "/members/deep/index.html",
  "/en/members/",
  "/en/members/start/",
  "/en/members/index.html",
  "/en/members/deep/",
  "/en/members/deep/index.html",
];

// Map: deep lesson slug → required plan_code for content_access.
// If a lesson is listed here, it requires a specific product purchase.
// Lessons NOT listed here require active paid membership (year1/2/3) only.
const DEEP_LESSON_PLAN_MAP = {
  "rhythm-design-lab": "prog_rhythm_lab",
  "space-reset-practitioner": "prog_space_reset",
  "family-pattern-mapping": "prog_family_pattern",
  "creative-practice-studio": "prog_creative_studio",
  "personal-capital": "diag_capital_self",
  "practice-companion-level-1": "cert_companion_l1",
  "practice-method-designer": "cert_method_designer",
  "avoidance-map": "asmt_avoidance_self",
  "emotional-block-mapping": "prog_emo_block",
  "boundary-foundation": "cert_boundary_found",
  // Pilot programs
  "self-trust-practice-lab": "self_trust_evidence_builder",
  "open-loop-closure-sprint": "open_loop_closure_sprint",
  "personal-after-action-review": "personal_after_action_review",
  // These lessons are free-tier (no specific product needed, just membership)
  "life-system-map": null,
  "decision-clarity": null,
  "environmental-influence": null,
};

function getLandingUrlForLesson(lessonSlug, isEn) {
  const prefix = isEn ? "/en" : "";
  const map = {
    "life-system-map": `${prefix}/members/deep/`,
    "rhythm-design-lab": `${prefix}/programs/rhythm-design-lab/`,
    "space-reset-practitioner": `${prefix}/programs/space-reset-practitioner/`,
    "family-pattern-mapping": `${prefix}/programs/family-pattern-mapping/`,
    "creative-practice-studio": `${prefix}/programs/creative-practice-studio/`,
    "personal-capital": `${prefix}/assessments/personal-capital/`,
    "decision-clarity": `${prefix}/members/deep/`,
    "environmental-influence": `${prefix}/programs/space-reset-practitioner/`,
    "practice-companion-level-1": `${prefix}/certification/practice-companion-level-1/`,
    "practice-method-designer": `${prefix}/certification/practice-method-designer/`,
    "avoidance-map": `${prefix}/assessments/avoidance-map/`,
    "emotional-block-mapping": `${prefix}/programs/emotional-block-mapping/`,
    "boundary-foundation": `${prefix}/programs/boundary-foundation/`,
    "self-trust-practice-lab": `${prefix}/programs/self-trust-practice-lab/`,
    "open-loop-closure-sprint": `${prefix}/programs/open-loop-closure-sprint/`,
    "personal-after-action-review": `${prefix}/programs/personal-after-action-review/`,
  };
  return map[lessonSlug] || `${prefix}/join/`;
}

// Admin pages that map to a required permission.
// Pages not listed here default to "dashboard.view" (minimum for any admin).
const ADMIN_PAGE_PERMISSIONS = {
  "/admin/dashboard": "dashboard.view",
  "/admin/content": "content.view",
  "/admin/members": "members.view",
  "/admin/creators": "members.view",
  "/admin/payments": "payments.view",
  "/admin/settings": "settings.view",
  "/admin/pilot": "ops.queue",
  "/admin/reflection": "ops.queue",
  "/admin/events": "events.view",
  "/admin/learning": "learning.view",
  "/admin/audit": "audit.view",
  "/admin/inventory": "audit.view",
  "/admin/creator-applications": "members.manage",
};

// ============================================================
// Request logging — skip static assets
// ============================================================

const SKIP_LOG_PREFIXES = [
  "/assets/", "/_headers", "/_redirects", "/_routes.json",
  "/favicon", "/robots.txt", "/sitemap", "/.well-known/",
  "/brand/", "/og/", "/css/", "/js/", "/fonts/", "/images/",
];

const SKIP_LOG_EXTENSIONS = [
  ".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map",
];

function shouldLogPath(path) {
  if (!path) return false;
  for (const prefix of SKIP_LOG_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }
  const lower = path.toLowerCase();
  for (const ext of SKIP_LOG_EXTENSIONS) {
    if (lower.endsWith(ext)) return false;
  }
  return true;
}

function categorizeRequest(path, status) {
  if (!path) return "system";
  if (path.startsWith("/api/auth/")) return "auth";
  if (path.startsWith("/api/admin/")) return "admin";
  if (path.startsWith("/api/payments/")) return "payment";
  if (path.startsWith("/api/")) return "system";
  if (path.startsWith("/admin/")) return "admin";
  if (path.startsWith("/members/deep/")) return "content";
  if (path.startsWith("/members/")) return "auth";
  if (path.startsWith("/join/")) return "payment";
  if (status >= 500) return "system";
  return "request";
}

function actionFromRequest(path, method, status) {
  if (!path) return "unknown";
  if (path.includes("/auth/google/start")) return "google_oauth_start";
  if (path.includes("/auth/google/callback")) return "google_oauth_callback";
  if (path.includes("/auth/login")) return "login";
  if (path.includes("/auth/logout")) return "logout";
  if (path.includes("/auth/session")) return "session_check";
  if (path.includes("/payments/vietqr/create")) return "order_created";
  if (path.includes("/vietqr-confirm")) return "payment_confirmed";
  if (path.includes("/payments/vietqr/orders")) return "orders_listed";
  if (path.includes("/payments/webhook")) return "webhook_received";
  if (path.includes("/admin/users") && method === "POST") return "admin_user_created";
  if (path.includes("/admin/users") && method === "GET") return "admin_users_listed";
  if (path.includes("/admin/audit")) return "audit_log_viewed";
  if (path.includes("/admin/events")) return "events_viewed";
  if (path.includes("/admin/ops/queue")) return "ops_queue_accessed";
  if (path.includes("/members/deep/")) return "deep_content_accessed";
  if (path.includes("/members/start")) return "member_start";
  if (path.includes("/members/dashboard")) return "member_dashboard";
  if (path.includes("/join/")) return "join_page";
  if (path.includes("/tai-lieu/")) return "docs_hub";
  if (path.includes("/api/contact")) return "contact_submitted";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  return "request";
}

function levelFromStatus(status) {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  return "info";
}

function clientIp(request) {
  return String(
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    ""
  ).split(",")[0].trim().slice(0, 100);
}

function countryFromRequest(request) {
  return String(request.headers.get("CF-IPCountry") || "").slice(0, 10);
}

function uaFromRequest(request) {
  return String(request.headers.get("User-Agent") || "").slice(0, 500);
}

// ============================================================
// Helper functions
// ============================================================

function isAdminPath(pathname) {
  return ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isAdminLoginPath(pathname) {
  return ADMIN_LOGIN_PATHS.some((p) => pathname === p || pathname === p.replace(/\/$/, ""));
}

function adminPagePermission(pathname) {
  let p = pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
  let best = null;
  for (const [prefix, perm] of Object.entries(ADMIN_PAGE_PERMISSIONS)) {
    if (p === prefix || p.startsWith(prefix + "/")) {
      if (!best || prefix.length > best.length) {
        best = { length: prefix.length, perm };
      }
    }
  }
  return best ? best.perm : "dashboard.view";
}

function isGatedMemberPath(pathname) {
  return GATED_MEMBER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getDeepLessonSlug(pathname) {
  // /members/deep/<slug>/ → <slug>
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 3 && parts[0] === "members" && parts[1] === "deep") {
    return parts[2];
  }
  // /en/members/deep/<slug>/ → <slug>
  if (parts.length >= 4 && parts[0] === "en" && parts[1] === "members" && parts[2] === "deep") {
    return parts[3];
  }
  return null;
}

function isPublicMemberPath(pathname) {
  return PUBLIC_MEMBER_PATHS.some((p) => pathname === p || pathname === p.replace(/\/$/, ""));
}

function isEnglishPath(pathname) {
  return (pathname || "").startsWith("/en/");
}

function isMembershipActive(user) {
  if (!user || !user.active) return false;
  const type = user.membership_type;
  if (!type || type === "free") return false;
  if (user.expires_at) {
    const exp = new Date(user.expires_at).getTime();
    if (Number.isFinite(exp) && exp < Date.now()) return false;
  }
  return true;
}

// ============================================================
// Main middleware
// ============================================================

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = request.headers.get("Host") || "";
  const db = env.PAYMENTS_DB;
  const requestId = randomId("req");
  const startTime = Date.now();

  // Set DB ref for log.js so logWarn/logError persist to D1
  if (db) setLogDbRef(db);

  // Parse sessions upfront for logging context
  const cookieHeader = request.headers.get("Cookie");
  let memberSession = null;
  let adminSession = null;
  let memberEmail = "";
  let adminEmail = "";
  if (db) {
    try {
      memberSession = await parseSessionCookie(env, cookieHeader);
      if (memberSession) memberEmail = memberSession.email || "";
    } catch (_e) {}
    try {
      adminSession = await parseAdminSession(db, cookieHeader);
      if (adminSession) adminEmail = adminSession.email || "";
    } catch (_e) {}
  }

  // Helper: log this request after response is sent
  async function logResponse(response) {
    if (!db) return;
    const path = url.pathname;
    if (!shouldLogPath(path)) return;
    const status = response.status;
    const durationMs = Date.now() - startTime;
    const level = levelFromStatus(status);
    const category = categorizeRequest(path, status);
    const action = actionFromRequest(path, request.method, status);

    // Log to site_events
    await logSiteEvent(db, {
      level,
      category,
      action,
      method: request.method,
      path,
      status,
      durationMs,
      userEmail: memberEmail,
      adminEmail,
      ip: clientIp(request),
      userAgent: uaFromRequest(request),
      country: countryFromRequest(request),
      detail: "",
      requestId,
    });

    // Log errors to site_errors
    if (status >= 400) {
      let errorBody = "";
      try {
        const cloned = response.clone();
        errorBody = (await cloned.text()).slice(0, 2000);
      } catch (_e) {}
      await logSiteError(db, {
        requestId,
        status,
        code: action,
        message: `${request.method} ${path} → ${status}`,
        path,
        method: request.method,
        stack: errorBody,
        ip: clientIp(request),
        userEmail: memberEmail,
        adminEmail,
        requestBody: "",
      });
    }
  }

  // Wrapper: run handler, log result, return response
  async function handleAndLog(handler) {
    let response;
    try {
      response = await handler();
    } catch (error) {
      response = new Response(JSON.stringify({ ok: false, error: { code: "MIDDLEWARE_ERROR", message: error.message } }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    // Log asynchronously (don't block response)
    if (db && context.waitUntil) {
      context.waitUntil(logResponse(response));
    } else if (db) {
      // Fallback: log synchronously (shouldn't happen on Pages)
      try { await logResponse(response); } catch (_e) {}
    }
    return response;
  }

  return handleAndLog(async () => {
    // docs.nguyenlananh.com → serve /tai-lieu/ (rewrite, giữ URL subdomain)
    if (host === "docs.nguyenlananh.com") {
      let targetPath = url.pathname;
      if (targetPath === "/" || targetPath === "") {
        targetPath = "/tai-lieu/";
      } else if (targetPath === "/en" || targetPath === "/en/") {
        targetPath = "/en/tai-lieu/";
      } else if (targetPath.startsWith("/en/")) {
        targetPath = "/en/tai-lieu" + targetPath;
      } else {
        targetPath = "/tai-lieu" + targetPath;
      }
      const newUrl = new URL(targetPath, url.origin);
      const newReq = new Request(newUrl, request);
      return context.next(newReq);
    }

    // admin.nguyenlananh.com → rewrite to /admin/ internally
    if (host === "admin.nguyenlananh.com") {
      let targetPath = url.pathname;
      if (targetPath === "/" || targetPath === "") {
        targetPath = "/admin/";
      } else if (targetPath.startsWith("/api/")) {
        // API paths stay as-is
      } else if (targetPath.startsWith("/admin") || targetPath.startsWith("/en/admin")) {
        // Already has admin prefix
      } else if (targetPath.startsWith("/en/")) {
        targetPath = "/en/admin" + targetPath.slice(3);
      } else {
        targetPath = "/admin" + targetPath;
      }
      if (targetPath !== url.pathname) {
        const newUrl = new URL(targetPath, url.origin);
        const newReq = new Request(newUrl, request);
        url.pathname = targetPath;
        // Continue with rewritten request
        const response = await context.next(newReq);
        return response;
      }
    }

    // Gating: /members/deep/* requires entitlement check
    // - /members/deep/ index → public (listed in PUBLIC_MEMBER_PATHS)
    // - /members/deep/<slug>/ → check plan_code entitlement OR active membership
    if (isGatedMemberPath(url.pathname) && !isPublicMemberPath(url.pathname)) {
      const en = isEnglishPath(url.pathname);
      const joinUrl = en ? "/en/join/" : "/join/";

      if (!memberSession) {
        const lessonSlug = getDeepLessonSlug(url.pathname);
        const landingUrl = lessonSlug ? getLandingUrlForLesson(lessonSlug, en) : joinUrl;
        logWarn({ route: url.pathname, code: "DEEP_DENY_NO_SESSION", msg: "Deep content access denied — no session, redirect to landing" });
        return new Response(null, {
          status: 302,
          headers: { Location: landingUrl, "Cache-Control": "no-store" },
        });
      }

      if (db) {
        const user = await getUserById(db, memberSession.sub);
        const lessonSlug = getDeepLessonSlug(url.pathname);
        const requiredPlan = lessonSlug ? DEEP_LESSON_PLAN_MAP[lessonSlug] : null;

        let hasAccess = false;
        if (isMembershipActive(user)) {
          // Active paid membership (year1/2/3 or premium_purchase) grants all deep content
          hasAccess = true;
        } else if (requiredPlan) {
          // Check specific content_access for this plan_code
          try {
            const access = await db
              .prepare("SELECT expires_at FROM content_access WHERE user_id = ? AND plan_code = ? AND (expires_at IS NULL OR expires_at > ?)")
              .bind(memberSession.sub, requiredPlan, new Date().toISOString())
              .first();
            hasAccess = !!access;
          } catch (e) {
            console.warn("[content-access] DB check failed:", e.message);
            hasAccess = false;
          }
        } else if (requiredPlan === null) {
          // Free-tier lesson (no specific plan needed, just logged in)
          hasAccess = true;
        }

        if (!hasAccess) {
          const landingUrl = lessonSlug ? getLandingUrlForLesson(lessonSlug, en) : (en ? "/en/join/" : "/join/");
          logWarn({
            route: url.pathname,
            code: "DEEP_DENY_NO_ENTITLEMENT",
            msg: `Gated content access denied — no entitlement for ${lessonSlug || "unknown"}`,
            email: user?.email,
            membership_type: user?.membership_type,
          });
          return new Response(null, {
            status: 302,
            headers: { Location: landingUrl, "Cache-Control": "no-store" },
          });
        }

        context.data = context.data || {};
        context.data.session = memberSession;
        context.data.user = user;
      }
      return context.next();
    }

    if (!isAdminPath(url.pathname)) {
      return context.next();
    }

    // Admin login page is public
    if (isAdminLoginPath(url.pathname)) {
      return context.next();
    }

    // Admin RBAC
    if (!db) {
      logWarn({ route: url.pathname, code: "ADMIN_DB_MISSING", msg: "PAYMENTS_DB not configured" });
      return new Response(null, {
        status: 302,
        headers: { Location: "/admin/login/", "Cache-Control": "no-store" },
      });
    }

    if (!adminSession) {
      logWarn({ route: url.pathname, code: "ADMIN_DENY_NO_SESSION", msg: "Admin access denied — no admin session" });
      const loginUrl = isEnglishPath(url.pathname) ? "/en/admin/login/" : "/admin/login/";
      return new Response(null, {
        status: 302,
        headers: { Location: loginUrl, "Cache-Control": "no-store" },
      });
    }

    const requiredPerm = adminPagePermission(url.pathname);
    if (!hasPermission(adminSession.role, requiredPerm)) {
      logWarn({
        route: url.pathname,
        code: "ADMIN_DENY_PERMISSION",
        msg: `Admin access denied — missing permission: ${requiredPerm}`,
        email: adminSession.email,
        role: adminSession.role,
      });
      const dashboardUrl = isEnglishPath(url.pathname) ? "/en/admin/dashboard/" : "/admin/dashboard/";
      return new Response(null, {
        status: 302,
        headers: { Location: dashboardUrl, "Cache-Control": "no-store" },
      });
    }

    context.data = context.data || {};
    context.data.adminSession = adminSession;
    return context.next();
  });
}
