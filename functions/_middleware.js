import { parseSessionCookie } from "./_lib/session.js";
import { getUserById } from "./_lib/db.js";
import { logWarn } from "./_lib/log.js";

const ADMIN_PATHS = ["/admin", "/en/admin"];

// Paths under /members/ that require active paid membership.
// /members/ itself, /members/start/, /members/dashboard/ stay public.
const GATED_MEMBER_PREFIXES = ["/members/deep/", "/en/members/deep/"];

// Paths under /members/ that are public (no session needed).
const PUBLIC_MEMBER_PATHS = [
  "/members/",
  "/members/start/",
  "/members/index.html",
  "/en/members/",
  "/en/members/start/",
  "/en/members/index.html",
];

function isAdminPath(pathname) {
  return ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isGatedMemberPath(pathname) {
  return GATED_MEMBER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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
  // Check expiry
  if (user.expires_at) {
    const exp = new Date(user.expires_at).getTime();
    if (Number.isFinite(exp) && exp < Date.now()) return false;
  }
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // docs.nguyenlananh.com → serve /tai-lieu/ (rewrite, giữ URL subdomain)
  // _redirects 200/301 cho root path trên custom domain bị static index.html
  // override, nên dùng middleware để rewrite trước khi static serving.
  const host = request.headers.get("Host") || "";
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
    // Rewrite internal path — Pages sẽ serve file tại targetPath
    const newUrl = new URL(targetPath, url.origin);
    const newReq = new Request(newUrl, request);
    return context.next(newReq);
  }

  // Gating: /members/deep/* requires active paid membership
  if (isGatedMemberPath(url.pathname)) {
    const cookieHeader = request.headers.get("Cookie");
    const session = await parseSessionCookie(env, cookieHeader);

    const en = isEnglishPath(url.pathname);
    const joinUrl = en ? "/en/join/" : "/join/";
    const membersUrl = en ? "/en/members/" : "/members/";

    if (!session) {
      logWarn({ route: url.pathname, code: "MEMBER_DENY_NO_SESSION", msg: "Gated content access denied — no session" });
      return new Response(null, {
        status: 302,
        headers: { Location: joinUrl, "Cache-Control": "no-store" },
      });
    }

    const db = env.PAYMENTS_DB;
    if (db) {
      const user = await getUserById(db, session.sub);
      if (!isMembershipActive(user)) {
        logWarn({
          route: url.pathname,
          code: "MEMBER_DENY_NO_MEMBERSHIP",
          msg: "Gated content access denied — no active paid membership",
          email: user?.email,
          membership_type: user?.membership_type,
        });
        // Has session but no paid membership → redirect to members hub (upgrade prompt)
        return new Response(null, {
          status: 302,
          headers: { Location: membersUrl, "Cache-Control": "no-store" },
        });
      }
      // Active paid member — pass session data downstream
      context.data = context.data || {};
      context.data.session = session;
      context.data.user = user;
    }
    return context.next();
  }

  if (!isAdminPath(url.pathname)) {
    return context.next();
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = await parseSessionCookie(env, cookieHeader);

  if (!session) {
    logWarn({ route: url.pathname, code: "ADMIN_DENY_NO_SESSION", msg: "Admin access denied — no session" });
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/members/",
        "Cache-Control": "no-store"
      }
    });
  }

  const db = env.PAYMENTS_DB;
  if (db) {
    const user = await getUserById(db, session.sub);
    if (!user || user.role !== "admin") {
      logWarn({ route: url.pathname, code: "ADMIN_DENY_ROLE", msg: "Admin access denied — insufficient role", email: user?.email });
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/members/",
          "Cache-Control": "no-store"
        }
      });
    }
  }

  context.data = context.data || {};
  context.data.session = session;
  return context.next();
}
