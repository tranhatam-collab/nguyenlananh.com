/**
 * Public creator profile page.
 */
(function () {
  "use strict";

  async function loadProfile() {
    const container = document.getElementById("profileContainer");
    if (!container) return;

    // Support /creators/profile/?slug=abc or /creators/abc/
    const parts = window.location.pathname.split("/").filter(Boolean);
    let slug = parts.length >= 2 && parts[0] === "creators" ? parts[1] : null;
    if (!slug) slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug || slug === "profile") {
      container.innerHTML = "<p class='note'>Không tìm thấy creator.</p>";
      return;
    }

    try {
      const res = await fetch(`/api/creators/profiles/${slug}`);
      const data = await res.json();
      if (!data.ok || !data.profile) {
        container.innerHTML = "<p class='note'>Không tìm thấy creator.</p>";
        return;
      }
      const p = data.profile;
      const subs = data.submissions || [];
      const specialties = p.specialties ? JSON.parse(p.specialties).join(" · ") : "";
      const links = p.social_links ? JSON.parse(p.social_links) : [];

      container.innerHTML = `
        <section class="pageHead">
          <h1>${p.name}</h1>
          <p class="sub">${specialties}</p>
        </section>
        <section class="panel">
          <p>${p.bio || ""}</p>
          ${p.website ? `<p><a href="${p.website}" target="_blank" rel="noopener">Website</a></p>` : ""}
          ${links.length ? `<p>${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(" · ")}</p>` : ""}
        </section>
        <section class="panel">
          <h3>Nội dung đã xuất bản</h3>
          ${subs.length ? subs.map(s => `<p><a href="#">${s.title}</a> <span class="note">(${s.type})</span></p>`).join("") : "<p class='note'>Chưa có nội dung công khai.</p>"}
        </section>
      `;
      document.title = p.name + " | Nguyễn Lan Anh";
    } catch (e) {
      console.error("Profile load failed", e);
      container.innerHTML = "<p class='note'>Không tải được hồ sơ.</p>";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProfile);
  } else {
    loadProfile();
  }
})();
