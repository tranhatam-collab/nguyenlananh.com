import { errorResponse } from "./utils.js";

const MAGIC_EMAIL_HOURLY = 5;
const MAGIC_IP_HOURLY = 20;

function windowStartHour() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}T${String(now.getUTCHours()).padStart(2, "0")}:00:00Z`;
}

export async function checkMagicLinkRateLimit(env, email, request) {
  const db = env.PAYMENTS_DB;
  if (!db) {
    // Fail-closed: deny requests if D1 binding is missing
    console.error("[ratelimit] PAYMENTS_DB missing — rate limiting unavailable, blocking request (fail-closed)");
    return { limited: true, code: "RATE_LIMIT_UNAVAILABLE", retryAfter: 3600 };
  }

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const hour = windowStartHour();
  const emailKey = `magic_email:${email}:${hour}`;
  const ipKey = `magic_ip:${ip}:${hour}`;

  try {
    // Ensure table exists (lazy)
    await db
      .prepare(
        `CREATE TABLE IF NOT EXISTS rate_limits (
          key TEXT PRIMARY KEY,
          window_start TEXT NOT NULL,
          count INTEGER NOT NULL DEFAULT 0
        )`
      )
      .run();

    // Check + increment email counter
    const emailRow = await db.prepare("SELECT count FROM rate_limits WHERE key = ?").bind(emailKey).first();
    const emailCount = (emailRow?.count || 0) + 1;
    if (emailCount > MAGIC_EMAIL_HOURLY) {
      return { limited: true, code: "RATE_LIMIT_EMAIL", retryAfter: 3600 };
    }

    // Check + increment IP counter
    const ipRow = await db.prepare("SELECT count FROM rate_limits WHERE key = ?").bind(ipKey).first();
    const ipCount = (ipRow?.count || 0) + 1;
    if (ipCount > MAGIC_IP_HOURLY) {
      return { limited: true, code: "RATE_LIMIT_IP", retryAfter: 3600 };
    }

    // Upsert counters
    await db
      .prepare(
        `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET count = excluded.count`
      )
      .bind(emailKey, hour, emailCount)
      .run();

    await db
      .prepare(
        `INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET count = excluded.count`
      )
      .bind(ipKey, hour, ipCount)
      .run();

    return {
      limited: false,
      emailRemaining: MAGIC_EMAIL_HOURLY - emailCount,
      ipRemaining: MAGIC_IP_HOURLY - ipCount
    };
  } catch (error) {
    console.error("[ratelimit] DB error:", error.message);
    // Fail-closed on DB errors to prevent abuse during outages
    return { limited: true, code: "RATE_LIMIT_ERROR", retryAfter: 3600 };
  }
}

export function rateLimitResponse(code, retryAfter = 3600) {
  const response = errorResponse(429, code, "Too many requests. Please try again later.");
  response.headers.set("Retry-After", String(retryAfter));
  return response;
}
