import { json, errorResponse, randomId, nowIso } from "../../../_lib/utils.js";
import { getDb } from "../../../_lib/db.js";

// POST /api/creators/apply
// Public endpoint for creator applications.
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const bio = String(body.bio || "").trim();
    const motivation = String(body.motivation || "").trim();
    const sampleWorkUrl = String(body.sample_work_url || "").trim();
    const experience = String(body.experience || "").trim();

    if (!email || !email.includes("@")) {
      return errorResponse(400, "INVALID_EMAIL", "Vui lòng nhập email hợp lệ.");
    }
    if (!name || name.length < 2) {
      return errorResponse(400, "INVALID_NAME", "Vui lòng nhập tên.");
    }

    const db = getDb(context.env);
    const existing = await db
      .prepare("SELECT id FROM creator_applications WHERE email = ? AND status = 'pending' ORDER BY submitted_at DESC LIMIT 1")
      .bind(email)
      .first();
    if (existing) {
      return errorResponse(409, "ALREADY_SUBMITTED", "Bạn đã gửi đơn rồi. Chúng tôi sẽ liên hệ sớm.");
    }

    const id = randomId("cap");
    const ip = context.request.headers.get("CF-Connecting-IP") || "";
    const ua = String(context.request.headers.get("User-Agent") || "").slice(0, 500);

    await db
      .prepare(
        `INSERT INTO creator_applications
         (id, email, name, bio, motivation, sample_work_url, experience, consent_ip, consent_ua, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(id, email, name, bio, motivation, sampleWorkUrl, experience, ip, ua, nowIso())
      .run();

    return json({ ok: true, message: "Đơn đã gửi. Cảm ơn bạn." });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Không gửi được đơn.");
  }
}
