import { parseSessionCookie } from "./_lib/session.js";
import { getUserById } from "./_lib/db.js";

const ADMIN_PATHS = ["/admin", "/en/admin"];

function isAdminPath(pathname) {
  return ADMIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!isAdminPath(url.pathname)) {
    return context.next();
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = await parseSessionCookie(env, cookieHeader);

  if (!session) {
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
