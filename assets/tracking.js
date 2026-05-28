(() => {
  const STORAGE_KEY = "nla_events";
  const MAX_QUEUE = 100;

  function getQueue() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (_e) {
      return [];
    }
  }

  function saveQueue(q) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
    } catch (_e) {}
  }

  function push(event) {
    const q = getQueue();
    q.push({ ...event, t: Date.now(), url: location.href });
    saveQueue(q);
    if (typeof gtag === "function") {
      gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
    if (typeof console !== "undefined" && console.log) {
      console.log("[track]", event.category, event.action, event.label);
    }
  }

  function track(category, action, label, value) {
    push({ category, action, label, value });
  }

  function bind(selector, category, action, labelResolver) {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("click", () => {
        const label =
          typeof labelResolver === "function"
            ? labelResolver(el)
            : labelResolver || el.textContent?.trim() || el.getAttribute("aria-label") || selector;
        track(category, action, label);
      });
    });
  }

  function init() {
    bind('a[href="/join/"]', "cta", "click", "join_membership");
    bind('a[href="/lien-he/"]', "cta", "click", "contact");
    bind("#quickStation", "cta", "click", "quick_station");
    bind("a[href^='/hanh-trinh/']", "nav", "click", "journey");
    bind("a[href^='/phuong-phap/']", "nav", "click", "method");
    bind("a[href^='/bai-viet/']", "nav", "click", "articles");
    bind("a[href^='/members/']", "nav", "click", "members");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.NLA_TRACK = { track, bind, getQueue };
})();
