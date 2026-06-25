/**
 * Admin audit dashboard — loads aggregated metrics and product inventory.
 */
(function () {
  "use strict";

  function fmtMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return "-";
    return Number(n).toLocaleString("vi-VN") + " VND";
  }

  function fmtNum(n) {
    if (n === null || n === undefined || isNaN(n)) return "-";
    return Number(n).toLocaleString("vi-VN");
  }

  async function loadAudit() {
    try {
      const [auditRes, inventoryRes] = await Promise.all([
        fetch("/api/admin/audit"),
        fetch("/api/admin/inventory").catch(() => null)
      ]);

      if (!auditRes.ok) {
        document.body.insertAdjacentHTML("afterbegin", "<div class='statusBanner error' style='margin:12px;'>Không tải được audit data.</div>");
        return;
      }
      const data = await auditRes.json();
      if (!data.ok) return;
      const a = data.audit;

      document.getElementById("statUsers").textContent = fmtNum(a.users);
      document.getElementById("statPaidMembers").textContent = fmtNum(a.paid_members);
      document.getElementById("statOrders").textContent = fmtNum(a.orders);
      document.getElementById("statPaidOrders").textContent = fmtNum(a.paid_orders);
      document.getElementById("statPendingOrders").textContent = fmtNum(a.pending_orders);
      document.getElementById("statFailedOrders").textContent = fmtNum(a.failed_orders);
      document.getElementById("statRefundedOrders").textContent = fmtNum(a.refunded_orders);
      document.getElementById("statContentAccess").textContent = fmtNum(a.active_content_access);
      document.getElementById("statTotalContentAccess").textContent = fmtNum(a.content_access);
      document.getElementById("statLessonOpened").textContent = fmtNum(a.lesson_opened);
      document.getElementById("statLessonCompleted").textContent = fmtNum(a.lesson_completed);
      document.getElementById("statPractice").textContent = fmtNum(a.practice_submissions);
      document.getElementById("statAssessments").textContent = fmtNum(a.assessment_attempts);
      document.getElementById("statExams").textContent = fmtNum(a.exam_attempts);
      document.getElementById("statCheckins").textContent = fmtNum(a.checkins);
      document.getElementById("statEvents").textContent = fmtNum(a.site_events_7d);
      document.getElementById("statWebhookErrors").textContent = fmtNum(a.webhook_errors_7d);
      document.getElementById("statCreatorSubmissions").textContent = fmtNum(a.creator_submissions);

      const rpBody = document.getElementById("revenueProviderBody");
      if (rpBody) {
        rpBody.innerHTML = (a.revenue_by_provider || []).map(r =>
          `<tr><td>${r.provider || "-"}</td><td>${fmtMoney(r.total)}</td><td>${fmtNum(r.cnt)}</td></tr>`
        ).join("") || "<tr><td colspan='3'>No data</td></tr>";
      }

      const rplBody = document.getElementById("revenuePlanBody");
      if (rplBody) {
        rplBody.innerHTML = (a.revenue_by_plan || []).map(r =>
          `<tr><td>${r.plan_code || "-"}</td><td>${fmtMoney(r.total)}</td><td>${fmtNum(r.cnt)}</td></tr>`
        ).join("") || "<tr><td colspan='3'>No data</td></tr>";
      }

      const certBody = document.getElementById("certBody");
      if (certBody) {
        certBody.innerHTML = (a.certifications || []).map(c =>
          `<tr><td>${c.status || "-"}</td><td>${fmtNum(c.cnt)}</td></tr>`
        ).join("") || "<tr><td colspan='2'>No data</td></tr>";
      }

      const creatorBody = document.getElementById("creatorAppBody");
      if (creatorBody) {
        creatorBody.innerHTML = (a.creator_applications || []).map(c =>
          `<tr><td>${c.status || "-"}</td><td>${fmtNum(c.cnt)}</td></tr>`
        ).join("") || "<tr><td colspan='2'>No data</td></tr>";
      }

      if (inventoryRes?.ok) {
        const invData = await inventoryRes.json();
        const inv = invData.inventory;
        const counts = inv?.counts || {};
        const pfBody = document.getElementById("productFamilyBody");
        if (pfBody) {
          pfBody.innerHTML = (inv.product_families || []).map(f =>
            `<tr><td>${f.name}</td><td>${f.category}</td><td>${fmtNum(f.offers?.length || 0)}</td><td>${f.landing || "-"}</td></tr>`
          ).join("") || "<tr><td colspan='4'>No data</td></tr>";
        }
        const countEls = {
          "statMembershipPlans": counts.membership_plans,
          "statMicroProducts": counts.micro_products,
          "statAssessments": counts.assessments,
          "statGuidedPrograms": counts.guided_programs,
          "statCertifications": counts.certifications,
          "statTotalPlans": counts.total_plans
        };
        for (const [id, val] of Object.entries(countEls)) {
          const el = document.getElementById(id);
          if (el && val !== undefined) el.textContent = fmtNum(val);
        }
      }
    } catch (e) {
      console.error("Audit load failed", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAudit);
  } else {
    loadAudit();
  }
})();
