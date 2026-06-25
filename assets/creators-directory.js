/**
 * Public creators directory — loads approved creators.
 */
(function () {
  "use strict";

  async function loadCreators() {
    const list = document.getElementById("creatorsList");
    if (!list) return;
    try {
      const res = await fetch("/api/creators/profiles");
      const data = await res.json();
      if (!data.ok || !data.creators || data.creators.length === 0) {
        list.innerHTML = "<p class='note'>Chưa có creator công khai nào. Hãy quay lại sau.</p>";
        return;
      }
      list.innerHTML = data.creators.map(c => `
        <div class="panel" style="margin-bottom:10px;">
          <h4><a href="/creators/${c.slug}/">${c.name}</a></h4>
          <p class="note">${c.bio || ""}</p>
          <p class="note">${c.specialties ? JSON.parse(c.specialties).join(" · ") : ""}</p>
        </div>
      `).join("");
    } catch (e) {
      console.error("Creators load failed", e);
      list.innerHTML = "<p class='note'>Không tải được danh sách.</p>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCreators);
  } else {
    loadCreators();
  }
})();
