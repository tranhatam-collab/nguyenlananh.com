import { requireAdminPermission } from "../../../_lib/admin_auth.js";
import { json, errorResponse } from "../../../_lib/utils.js";

// GET /api/admin/audit
// Returns aggregated audit metrics for the site.
export async function onRequestGet(context) {
  try {
    const { db } = await requireAdminPermission(context, "audit.view");

    const [
      userCount,
      memberCount,
      orderCount,
      paidOrders,
      pendingOrders,
      failedOrders,
      refundedOrders,
      revenueByProvider,
      revenueByPlan,
      contentAccess,
      activeContentAccess,
      lessonCompleted,
      lessonOpened,
      practiceSubmitted,
      assessments,
      exams,
      checkins,
      certifications,
      creatorApplications,
      creatorSubmissions,
      events,
      webhookErrors,
      contentStats,
    ] = await Promise.all([
      db.prepare("SELECT COUNT(*) as total FROM users").first(),
      db.prepare("SELECT COUNT(*) as total FROM users WHERE membership_type IS NOT NULL AND membership_type != 'free'").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders WHERE payment_status IN ('paid','captured','completed')").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders WHERE payment_status IN ('pending','created','waiting')").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders WHERE payment_status IN ('failed','denied','canceled')").first(),
      db.prepare("SELECT COUNT(*) as total FROM orders WHERE payment_status IN ('refunded','reversed')").first(),
      db.prepare("SELECT provider, SUM(amount) as total, COUNT(*) as cnt FROM orders WHERE payment_status IN ('paid','captured','completed') GROUP BY provider").all(),
      db.prepare("SELECT plan_code, SUM(amount) as total, COUNT(*) as cnt FROM orders WHERE payment_status IN ('paid','captured','completed') GROUP BY plan_code").all(),
      db.prepare("SELECT COUNT(*) as total FROM content_access").first(),
      db.prepare("SELECT COUNT(*) as total FROM content_access WHERE expires_at IS NULL OR expires_at > datetime('now')").first(),
      db.prepare("SELECT COUNT(*) as total FROM lesson_progress WHERE status = 'completed'").first(),
      db.prepare("SELECT COUNT(*) as total FROM lesson_progress WHERE status IS NOT NULL").first(),
      db.prepare("SELECT COUNT(*) as total FROM practice_submissions").first(),
      db.prepare("SELECT COUNT(*) as total FROM assessment_attempts").first(),
      db.prepare("SELECT COUNT(*) as total FROM exam_attempts").first(),
      db.prepare("SELECT COUNT(*) as total FROM checkins").first(),
      db.prepare("SELECT status, COUNT(*) as cnt FROM certifications GROUP BY status").all(),
      db.prepare("SELECT status, COUNT(*) as cnt FROM creator_applications GROUP BY status").all().catch(() => ({ results: [] })),
      db.prepare("SELECT COUNT(*) as total FROM creator_submissions").first().catch(() => ({ total: 0 })),
      db.prepare("SELECT COUNT(*) as total FROM site_events WHERE created_at >= datetime('now', '-7 days')").first().catch(() => ({ total: 0 })),
      db.prepare("SELECT COUNT(*) as total FROM webhook_events WHERE status IN ('failed','error') AND created_at >= datetime('now', '-7 days')").first().catch(() => ({ total: 0 })),
      fetchContentStats(context),
    ]);

    return json({
      ok: true,
      audit: {
        users: userCount?.total || 0,
        paid_members: memberCount?.total || 0,
        orders: orderCount?.total || 0,
        paid_orders: paidOrders?.total || 0,
        pending_orders: pendingOrders?.total || 0,
        failed_orders: failedOrders?.total || 0,
        refunded_orders: refundedOrders?.total || 0,
        revenue_by_provider: revenueByProvider.results || [],
        revenue_by_plan: revenueByPlan.results || [],
        content_access: contentAccess?.total || 0,
        active_content_access: activeContentAccess?.total || 0,
        lesson_completed: lessonCompleted?.total || 0,
        lesson_opened: lessonOpened?.total || 0,
        practice_submissions: practiceSubmitted?.total || 0,
        assessment_attempts: assessments?.total || 0,
        exam_attempts: exams?.total || 0,
        checkins: checkins?.total || 0,
        certifications: certifications.results || [],
        creator_applications: creatorApplications.results || [],
        creator_submissions: creatorSubmissions?.total || 0,
        site_events_7d: events?.total || 0,
        webhook_errors_7d: webhookErrors?.total || 0,
        content_stats: contentStats,
      },
    });
  } catch (err) {
    return errorResponse(err.status || 500, err.code || "ERROR", err.message || "Failed to load audit data.");
  }
}

// Fetch pre-computed content stats from the static JSON asset.
// Workers/Pages Functions cannot read the static filesystem, so content stats
// are built by `scripts/build-content-stats.mjs` into assets/content-stats.json
// and served as a static file alongside the site.
async function fetchContentStats(context) {
  try {
    const url = new URL("/assets/content-stats.json", context.request.url);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      generated_at: data.generated_at || null,
      min_words: data.min_words || 1500,
      vi: data.vi ? {
        total_articles: data.vi.total_articles || 0,
        category_pages: data.vi.category_pages || 0,
        under_standard: data.vi.under_standard || 0,
        missing_cta: data.vi.missing_cta || 0,
        missing_metadata: data.vi.missing_metadata || 0,
      } : null,
      en: data.en ? {
        total_articles: data.en.total_articles || 0,
        category_pages: data.en.category_pages || 0,
        under_standard: data.en.under_standard || 0,
        missing_cta: data.en.missing_cta || 0,
        missing_metadata: data.en.missing_metadata || 0,
      } : null,
      vi_en_coverage: data.vi_en_coverage ? {
        both: data.vi_en_coverage.both || 0,
        vi_only: data.vi_en_coverage.vi_only || 0,
        en_only: data.vi_en_coverage.en_only || 0,
      } : null,
    };
  } catch (_e) {
    return null;
  }
}
