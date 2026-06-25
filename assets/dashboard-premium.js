/**
 * Dashboard premium products + certifications display.
 * Loads purchased products and certifications for the logged-in member.
 */
(function () {
  "use strict";

  // Map plan_code → product landing page
  const PLAN_TO_LANDING = {
    asmt_avoidance_self: "/assessments/avoidance-map/",
    asmt_avoidance_review: "/assessments/avoidance-map/",
    prog_rhythm_lab: "/programs/rhythm-design-lab/",
    prog_emo_block: "/programs/emotional-block-mapping/",
    cert_boundary_found: "/programs/boundary-foundation/",
    prog_family_pattern: "/programs/family-pattern-mapping/",
    prog_space_reset: "/programs/space-reset-practitioner/",
    prog_creative_studio: "/programs/creative-practice-studio/",
    diag_capital_self: "/assessments/personal-capital/",
    diag_capital_expert: "/assessments/personal-capital/",
    diag_capital_biz: "/assessments/personal-capital/",
    cert_companion_l1: "/certification/practice-companion-level-1/",
    cert_method_designer: "/certification/practice-method-designer/",
  };

  const PLAN_LABELS = {
    asmt_avoidance_self: "Avoidance Map — Self Assessment",
    asmt_avoidance_review: "Avoidance Map — With Expert Review",
    prog_rhythm_lab: "Rhythm Design Lab — 21 Days",
    prog_emo_block: "Emotional Block Mapping Intensive — 30 Days",
    cert_boundary_found: "Boundary Practice Certification — Foundation",
    prog_family_pattern: "Family Pattern Mapping Program — 6 Weeks",
    prog_space_reset: "Space Reset Practitioner Program",
    prog_creative_studio: "Creative Practice Studio — 8 Weeks",
    diag_capital_self: "Personal Capital Diagnostic — Self",
    diag_capital_expert: "Personal Capital Diagnostic — Expert Reviewed",
    diag_capital_biz: "Personal Capital Diagnostic — Founder/Business",
    cert_companion_l1: "Certified Practice Companion — Level 1",
    cert_method_designer: "Practice Method Designer Certification",
  };

  async function loadPurchasedProducts() {
    const loading = document.getElementById("premiumLoading");
    const list = document.getElementById("premiumProductsList");
    if (!list) return;

    try {
      // Fetch orders from member API
      const res = await fetch("/api/payments/vietqr/orders");
      if (!res.ok) {
        if (loading) loading.textContent = "Đăng nhập để xem sản phẩm đã mua.";
        return;
      }
      const data = await res.json();
      const orders = (data.orders || []).filter(o => o.payment_status === "captured" || o.payment_status === "confirmed");

      if (orders.length === 0) {
        if (loading) loading.textContent = "Chưa có sản phẩm nào. Khám phá assessments, programs và certification bên dưới.";
        list.innerHTML = '<div class="actionsRow"><a class="cta" href="/assessments/">Xem assessments</a><a class="ghost" href="/programs/">Xem programs</a></div>';
        return;
      }

      if (loading) loading.style.display = "none";

      const seen = new Set();
      const items = [];
      for (const o of orders) {
        if (seen.has(o.plan_code)) continue;
        seen.add(o.plan_code);
        const label = PLAN_LABELS[o.plan_code] || o.plan_code;
        const landing = PLAN_TO_LANDING[o.plan_code] || "#";
        const date = o.paid_at ? new Date(o.paid_at).toLocaleDateString("vi-VN") : "";
        items.push(`<li><strong>${label}</strong> ${date ? `<span class="note">— mua ${date}</span>` : ""} <a href="${landing}" class="note">mở</a></li>`);
      }
      list.innerHTML = `<ul class="list">${items.join("")}</ul>`;
    } catch (_e) {
      if (loading) loading.textContent = "Không thể tải dữ liệu. Vui lòng đăng nhập.";
    }
  }

  async function loadCertifications() {
    const list = document.getElementById("certificationsList");
    if (!list) return;

    try {
      const res = await fetch("/api/certifications");
      if (!res.ok) {
        list.innerHTML = '<p class="note">Đăng nhập để xem chứng nhận.</p>';
        return;
      }
      const data = await res.json();
      const certs = data.certifications || [];

      if (certs.length === 0) {
        list.innerHTML = '<p class="note">Chưa có chứng nhận. Hoàn thành chương trình certification để nhận chứng nhận.</p>';
        return;
      }

      const items = certs.map(c => {
        const issued = c.issued_at ? new Date(c.issued_at).toLocaleDateString("vi-VN") : "";
        const expires = c.expires_at ? new Date(c.expires_at).toLocaleDateString("vi-VN") : "vô thời hạn";
        return `<li><strong>${c.title}</strong><br><span class="note">Số chứng nhận: ${c.cert_number} · Cấp: ${issued} · Hết hạn: ${expires}</span></li>`;
      });
      list.innerHTML = `<ul class="list">${items.join("")}</ul>`;
    } catch (_e) {
      list.innerHTML = '<p class="note">Không thể tải chứng nhận.</p>';
    }
  }

  function init() {
    loadPurchasedProducts();
    loadCertifications();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
