import { requireAdminPermission } from "../../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../../_lib/utils.js";

// GET /api/admin/audit
// Returns aggregated audit metrics for the site.
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "audit.view");

    const [
      userCount,
      orderCount,
      revenueByProvider,
      revenueByPlan,
      paidOrders,
      certifications,
      lessonCompleted,
      practiceSubmitted,
      assessments,
      exams,
      checkins,
      contentAccess,
    ] = await Promise.all([
      db.prepare("SELECT COUNT(*) as total FROM users").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders").first(),
      db.prepare("SELECT provider, SUM(amount) as total, COUNT(*) as cnt FROM orders WHERE payment_status IN ('paid','captured','completed') GROUP BY provider").all(),
      db.prepare("SELECT plan_code, SUM(amount) as total, COUNT(*) as cnt FROM orders WHERE payment_status IN ('paid','captured','completed') GROUP BY plan_code").all(),
      db.prepare("SELECT COUNT(*) as total FROM orders WHERE payment_status IN ('paid','captured','completed')").first(),
      db.prepare("SELECT status, COUNT(*) as cnt FROM certifications GROUP BY status").all(),
      db.prepare("SELECT COUNT(*) as total FROM lesson_progress WHERE status = 'completed'").first(),
      db.prepare("SELECT COUNT(*) as total FROM practice_submissions").first(),
      db.prepare("SELECT COUNT(*) as total FROM assessment_attempts").first(),
      db.prepare("SELECT COUNT(*) as total FROM exam_attempts").first(),
      db.prepare("SELECT COUNT(*) as total FROM checkins").first(),
      db.prepare("SELECT COUNT(*) as total FROM content_access").first(),
    ]);

    return json({
      ok: true,
      audit: {
        users: userCount?.total || 0,
        orders: orderCount?.total || 0,
        paid_orders: paidOrders?.total || 0,
        revenue_by_provider: revenueByProvider.results || [],
        revenue_by_plan: revenueByPlan.results || [],
        certifications: certifications.results || [],
        lesson_completed: lessonCompleted?.total || 0,
        practice_submissions: practiceSubmitted?.total || 0,
        assessment_attempts: assessments?.total || 0,
        exam_attempts: exams?.total || 0,
        checkins: checkins?.total || 0,
        content_access: contentAccess?.total || 0,
      },
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load audit data.");
  }
}
