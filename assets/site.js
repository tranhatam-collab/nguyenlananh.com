(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const drawer = $("#drawer");
  const hamburger = $("#hamburger");
  const closeDrawer = $("#closeDrawer");

  if (drawer && hamburger) {
    function openDrawer() {
      drawer.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "Đóng menu");
    }

    function shutDrawer() {
      drawer.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Mở menu");
    }

    hamburger.addEventListener("click", () => {
      if (drawer.classList.contains("open")) shutDrawer();
      else openDrawer();
    });

    closeDrawer?.addEventListener("click", shutDrawer);
    $$("[data-close]", drawer).forEach((a) => a.addEventListener("click", shutDrawer));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") shutDrawer();
    });

    document.addEventListener("click", (e) => {
      if (!drawer.classList.contains("open")) return;
      const insideDrawer = drawer.contains(e.target);
      const insideBtn = hamburger.contains(e.target);
      if (!insideDrawer && !insideBtn) shutDrawer();
    });
  }
})();
