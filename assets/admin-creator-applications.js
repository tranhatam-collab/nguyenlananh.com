/**
 * Admin creator applications review.
 */
(function () {
  "use strict";

  const list = document.getElementById("applicationsList");

  async function load() {
    if (!list) return;
    try {
      const res = await fetch("/api/admin/creators/applications");
      const data = await res.json();
      if (!data.ok) {
        list.innerHTML = "<p class='note'>Không tải được.</p>";
        return;
      }
      const apps = data.applications || [];
      if (!apps.length) {
        list.innerHTML = "<p class='note'>Chưa có đơn nào.</p>";
        return;
      }
      list.innerHTML = apps.map(a => `
        <div class="app-card" data-id="${a.id}">
          <h4>${a.name} <span class="meta">${a.email}</span></h4>
          <p class="meta">${a.submitted_at} · ${a.status}</p>
          <p>${a.bio || ""}</p>
          <p class="meta">${a.motivation || ""}</p>
          <p class="meta">${a.experience || ""}</p>
          ${a.sample_work_url ? `<p><a href="${a.sample_work_url}" target="_blank" rel="noopener">Sample work</a></p>` : ""}
          <div class="actions">
            <button class="btn approve" type="button">Approve</button>
            <button class="ghost reject" type="button">Reject</button>
            <input type="text" class="reviewNote" placeholder="Ghi chú review" style="margin-left:8px;" />
          </div>
        </div>
      `).join("");

      list.querySelectorAll(".approve").forEach(btn => {
        btn.addEventListener("click", e => {
          if (!confirm("Bạn có chắc muốn phê duyệt đơn này?")) return;
          update(e.target.closest(".app-card").dataset.id, "approved");
        });
      });
      list.querySelectorAll(".reject").forEach(btn => {
        btn.addEventListener("click", e => {
          if (!confirm("Bạn có chắc muốn từ chối đơn này?")) return;
          update(e.target.closest(".app-card").dataset.id, "rejected");
        });
      });
    } catch (e) {
      console.error("Applications load failed", e);
      list.innerHTML = "<p class='note'>Lỗi kết nối.</p>";
    }
  }

  async function update(id, status) {
    const card = document.querySelector(`.app-card[data-id="${id}"]`);
    const note = card?.querySelector(".reviewNote")?.value || "";
    try {
      const res = await fetch("/api/admin/creators/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, review_note: note })
      });
      const data = await res.json();
      if (data.ok) load();
      else alert(data.message || "Không cập nhật được.");
    } catch (e) {
      alert("Lỗi kết nối.");
    }
  }

  document.getElementById("refreshBtn")?.addEventListener("click", load);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
