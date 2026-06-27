// Turnstile client-side helper
// Loads Turnstile widget, provides token for form submission
// Requires: <div class="cf-turnstile" data-sitekey="..."></div> in HTML
// Or programmatically via window.Turnstile.render()

(function () {
  "use strict";

  const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  const SITE_KEY = window.TURNSTILE_SITE_KEY || "";
  let loaded = false;
  let loadPromise = null;

  function loadScript() {
    if (loaded) return Promise.resolve();
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_URL + "?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => { loaded = true; resolve(); };
      s.onerror = () => reject(new Error("Failed to load Turnstile script"));
      document.head.appendChild(s);
    });
    return loadPromise;
  }

  function isConfigured() {
    return Boolean(SITE_KEY);
  }

  // Render widget into a container element, returns widget ID
  async function render(container, options) {
    if (!isConfigured()) return null;
    if (!container) return null;
    if (container.dataset.turnstileWidgetId) return container.dataset.turnstileWidgetId;
    await loadScript();
    if (!window.turnstile) return null;
    const widgetId = window.turnstile.render(container, Object.assign({
      sitekey: SITE_KEY,
      theme: "light",
      size: "normal",
      retry: "auto",
    }, options || {}));
    if (widgetId != null) {
      container.dataset.turnstileWidgetId = String(widgetId);
    }
    return widgetId;
  }

  // Get token from a rendered widget by ID, or from hidden input
  function getToken(widgetId) {
    if (widgetId != null && window.turnstile) {
      return window.turnstile.getResponse(widgetId);
    }
    // Fallback: read from hidden input
    const input = document.querySelector('input[name="cf-turnstile-response"]');
    return input ? input.value : "";
  }

  // Reset widget for retry
  function reset(widgetId) {
    if (widgetId != null && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
  }

  // Remove widget
  function remove(widgetId) {
    if (widgetId != null && window.turnstile) {
      window.turnstile.remove(widgetId);
    }
  }

  // Auto-render all .cf-turnstile elements on page
  async function autoRender() {
    if (!isConfigured()) return;
    const containers = document.querySelectorAll(".cf-turnstile");
    if (!containers.length) return;
    await Promise.all(Array.from(containers).map((el) => {
      if (!el.dataset.sitekey) el.dataset.sitekey = SITE_KEY;
      return render(el);
    }));
  }

  window.TurnstileHelper = {
    isConfigured,
    render,
    getToken,
    reset,
    remove,
    autoRender,
    loadScript,
    SITE_KEY,
  };

  // Auto-render on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoRender);
  } else {
    autoRender();
  }
})();
