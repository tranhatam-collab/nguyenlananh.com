import { json } from "../../_lib/utils.js";

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const event = {
      type: body.type || "page_view",
      path: body.path || "/",
      referrer: body.referrer || "",
      timestamp: new Date().toISOString(),
      locale: body.locale || "vi",
      user_agent: context.request.headers.get("user-agent") || "",
      ip: context.request.headers.get("cf-connecting-ip") || "",
      country: context.request.cf?.country || "",
      session_id: body.session_id || "",
      metadata: body.metadata || {}
    };

    // Store event in D1 if available
    const db = context.env.PAYMENTS_DB;
    if (db) {
      await db.prepare(
        `INSERT INTO analytics_events (event_type, page_path, referrer, locale, user_agent, ip_hash, country, session_id, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        event.type,
        event.path,
        event.referrer,
        event.locale,
        event.user_agent,
        event.ip ? await hashIp(event.ip) : "",
        event.country,
        event.session_id,
        JSON.stringify(event.metadata),
        event.timestamp
      ).run();
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

async function hashIp(ip) {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + "nla-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}
