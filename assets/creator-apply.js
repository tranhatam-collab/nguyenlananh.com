/**
 * Creator application form.
 */
(function () {
  "use strict";

  const form = document.getElementById("creatorApplyForm");
  const status = document.getElementById("applyStatus");
  if (!form) return;

  let turnstileWidgetId = null;
  const turnstileContainer = document.getElementById("turnstile-creator-apply");
  if (turnstileContainer && window.TurnstileHelper && window.TurnstileHelper.isConfigured()) {
    window.TurnstileHelper.render(turnstileContainer).then(function(id){ turnstileWidgetId = id; });
  }

  function setBanner(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = "statusBanner " + type;
    status.classList.remove("hidden");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (window.TurnstileHelper) data["cf-turnstile-response"] = window.TurnstileHelper.getToken(turnstileWidgetId);
    setBanner("Đang gửi...", "warning");
    try {
      const res = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.ok) {
        setBanner("Đã gửi đơn. Cảm ơn bạn!", "success");
        form.reset();
      } else {
        setBanner(result.message || "Không gửi được.", "error");
      }
      if (window.TurnstileHelper) window.TurnstileHelper.reset(turnstileWidgetId);
    } catch (err) {
      setBanner("Lỗi kết nối. Vui lòng thử lại.", "error");
    }
  });
})();
