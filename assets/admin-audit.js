/**
 * Admin audit dashboard — loads aggregated metrics.
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
      const res = await fetch("/api/admin/audit");
      if (!res.ok) {
        document.body.insertAdjacentHTML("afterbegin", "<div class='statusBanner error' style='margin:12px;'>Không tải được audit data.</div>");
        return;
      }
      const data = await res.json();
      if (!data.ok) return;
      const a = data.audit;

      document.getElementById("statUsers").textContent = fmtNum(a.users);
      document.getElementById("statOrders").textContent = fmtNum(a.orders);
      document.getElementById("statPaidOrders").textContent = fmtNum(a.paid_orders);
      document.getElementById("statContentAccess").textContent = fmtNum(a.content_access);
      document.getElementById("statLessonCompleted").textContent = fmtNum(a.lesson_completed);
      document.getElementById("statPractice").textContent = fmtNum(a.practice_submissions);
      document.getElementById("statAssessments").textContent = fmtNum(a.assessment_attempts);
      document.getElementById("statExams").textContent = fmtNum(a.exam_attempts);
      document.getElementById("statCheckins").textContent = fmtNum(a.checkins);

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
