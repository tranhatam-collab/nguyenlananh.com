/**
 * Product checkout — dual rail: VietQR (VND, VN) + PayPal (USD, quốc tế)
 * Merchant: Công Ty Tnhh Thành Tâm Phát
 */
(function () {
  function randomId(prefix) {
    return (prefix || "id") + "_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function setBanner(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = "statusBanner " + (type || "");
    el.classList.remove("hidden");
  }
  function hide(el) { if (el) el.classList.add("hidden"); }
  function show(el) { if (el) el.classList.remove("hidden"); }
  function isQrImageUrl(value) {
    const url = String(value || "").trim();
    if (!url) return false;
    if (/^data:image\//i.test(url)) return true;
    if (/^https:\/\/img\.vietqr\.io\/image\//i.test(url)) return true;
    return /^https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url);
  }
  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value || "-";
  }
  function setRowVisible(id, value) {
    const el = $(id);
    if (!el) return;
    const row = el.closest("p") || el.parentElement;
    if (row) row.style.display = value ? "" : "none";
  }

  function loadScriptOnce(src, ready) {
    if (ready && ready()) return Promise.resolve();
    return new Promise(function(resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (ready && ready()) return resolve();
        existing.addEventListener("load", function(){ resolve(); }, { once: true });
        existing.addEventListener("error", function(){ reject(new Error("Unable to load " + src)); }, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = function(){ resolve(); };
      script.onerror = function(){ reject(new Error("Unable to load " + src)); };
      document.head.appendChild(script);
    });
  }

  function getCurrentPlan() {
    return document.body.dataset.plan || "";
  }
  if (!getCurrentPlan()) return;
  const isEnglishPage = /^\/en\//.test(window.location.pathname);

  const buyNow = $("#buyNow");
  const emailInput = $("#buyerEmail");
  const checkoutStatus = $("#checkoutStatus");
  const vietqrBox = $("#vietqrBox");
  const payNowLink = $("#payNowLink");
  if (!buyNow) return;
  let turnstileWidgetId = null;
  let turnstileReady = null;
  let sessionEmail = null;

  // Check if user is logged in via session API
  async function checkSession() {
    try {
      var resp = await fetch("/api/auth/session", { method: "GET", credentials: "same-origin" });
      if (resp.ok) {
        var data = await resp.json();
        if (data.ok && data.session && data.session.email) {
          sessionEmail = data.session.email;
        }
      }
    } catch (_) {}
    if (sessionEmail && emailInput) {
      // Authenticated user: hide email field, show session email
      var emailDisplay = emailInput.closest(".field");
      if (emailDisplay) emailDisplay.style.display = "none";
      var info = document.createElement("div");
      info.className = "field";
      info.style.cssText = "padding:8px 12px;background:rgba(34,197,94,.08);border-radius:8px;font-size:14px;";
      info.innerHTML = '<span style="opacity:.6;">Email:</span> <strong>' + sessionEmail + '</strong>';
      if (emailInput.parentNode) emailInput.parentNode.insertBefore(info, emailInput.closest(".field").nextSibling);
    }
  }
  void checkSession();

  // Detect country for default provider
  function guessProvider() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = navigator.language || "";
    if (tz.includes("Asia/Ho_Chi_Minh") || tz.includes("Asia/Bangkok") || lang === "vi" || lang.startsWith("vi-")) {
      return "vietqr";
    }
    return "paypal";
  }

  // Build provider selector UI
  function buildProviderSelector() {
    const container = document.createElement("div");
    container.className = "provider-selector";
    container.style.cssText = "margin:12px 0; display:flex; gap:8px; flex-wrap:wrap;";
    container.innerHTML = `
      <label style="display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid rgba(148,163,184,.35);border-radius:8px;cursor:pointer;">
        <input type="radio" name="provider" value="vietqr" checked />
        <span>🇻🇳 VietQR (Chuyển khoản VND)</span>
      </label>
      <label style="display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid rgba(148,163,184,.35);border-radius:8px;cursor:pointer;">
        <input type="radio" name="provider" value="paypal" />
        <span>🌐 PayPal (Thẻ quốc tế USD)</span>
      </label>
    `;
    return container;
  }

  // Insert provider selector before email field
  const checkoutBox = $("#checkoutBox");
  if (checkoutBox) {
    const firstField = checkoutBox.querySelector(".field");
    if (firstField) {
      checkoutBox.insertBefore(buildProviderSelector(), firstField);
    }
  }

  function setupCheckoutModal() {
    if (!checkoutBox || checkoutBox.dataset.checkoutModalReady === "1") return;
    checkoutBox.dataset.checkoutModalReady = "1";

    const launchRow = document.createElement("div");
    launchRow.className = "actionsRow";
    launchRow.style.cssText = "margin-top:12px;";
    const launch = document.createElement("button");
    launch.id = "openCheckoutModal";
    launch.className = "cta";
    launch.type = "button";
    launch.textContent = isEnglishPage ? "Open checkout window" : "Mở cửa sổ checkout";
    launchRow.appendChild(launch);
    checkoutBox.parentNode.insertBefore(launchRow, checkoutBox);

    const overlay = document.createElement("div");
    overlay.id = "productCheckoutOverlay";
    overlay.className = "hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", isEnglishPage ? "Checkout" : "Cửa sổ checkout");
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.48);display:none;align-items:center;justify-content:center;padding:16px;";

    const modal = document.createElement("div");
    modal.style.cssText = "background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.25);max-width:560px;width:min(100%,560px);max-height:90vh;overflow:auto;padding:22px;";
    const head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;";
    head.innerHTML = '<div><h3 style="margin:0 0 4px;">Checkout</h3><p style="margin:0;color:rgba(15,23,42,.62);font-size:14px;">' + (isEnglishPage ? "Choose VietQR or PayPal to complete payment." : "Chọn VietQR hoặc PayPal để hoàn tất thanh toán.") + '</p></div>';
    const close = document.createElement("button");
    close.type = "button";
    close.className = "ghost";
    close.textContent = isEnglishPage ? "Close" : "Đóng";
    close.setAttribute("aria-label", isEnglishPage ? "Close checkout" : "Đóng checkout");
    head.appendChild(close);
    modal.appendChild(head);
    modal.appendChild(checkoutBox);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function open() {
      overlay.classList.remove("hidden");
      overlay.style.display = "flex";
      renderTurnstile();
      const firstControl = overlay.querySelector('input[name="provider"]:checked') || overlay.querySelector("button, input, a");
      if (firstControl && typeof firstControl.focus === "function") firstControl.focus();
    }
    function closeModal() {
      overlay.classList.add("hidden");
      overlay.style.display = "none";
      launch.focus();
    }

    launch.addEventListener("click", open);
    close.addEventListener("click", closeModal);
    overlay.addEventListener("click", function(event) {
      if (event.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape" && !overlay.classList.contains("hidden")) closeModal();
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "1") open();
  }

  function ensureTurnstileContainer() {
    if (!checkoutBox) return null;
    let container = $("#turnstile-product-checkout", checkoutBox);
    if (container) return container;
    container = document.createElement("div");
    container.id = "turnstile-product-checkout";
    container.className = "cf-turnstile";
    container.style.cssText = "margin:10px 0;";
    const actions = checkoutBox.querySelector(".actionsRow");
    if (actions) checkoutBox.insertBefore(container, actions);
    else checkoutBox.appendChild(container);
    return container;
  }

  function renderTurnstile() {
    if (turnstileReady) return turnstileReady;
    turnstileReady = (async function() {
      await loadScriptOnce("/api/turnstile/config?v=20260628a", function(){ return Boolean(window.TURNSTILE_SITE_KEY_CONFIGURED); });
      await loadScriptOnce("/assets/turnstile.js?v=20260627c", function(){ return Boolean(window.TurnstileHelper); });
      if (!window.TurnstileHelper || !window.TurnstileHelper.isConfigured()) return null;
      const container = ensureTurnstileContainer();
      if (!container) return null;
      turnstileWidgetId = await window.TurnstileHelper.render(container);
      return turnstileWidgetId;
    })().catch(function(){ return null; });
    return turnstileReady;
  }

  async function getTurnstileToken() {
    await renderTurnstile();
    if (!window.TurnstileHelper) return "";
    return String(window.TurnstileHelper.getToken(turnstileWidgetId) || "").trim();
  }

  function resetTurnstile() {
    if (window.TurnstileHelper) window.TurnstileHelper.reset(turnstileWidgetId);
  }

  setupCheckoutModal();
  void renderTurnstile();

  // Set default based on country
  const defaultProvider = guessProvider();
  const defaultRadio = document.querySelector(`input[name="provider"][value="${defaultProvider}"]`);
  if (defaultRadio) defaultRadio.checked = true;

  function getSelectedProvider() {
    const radio = document.querySelector('input[name="provider"]:checked');
    return radio ? radio.value : "vietqr";
  }

  buyNow.addEventListener("click", async () => {
    const planCode = getCurrentPlan();
    if (!planCode) {
      setBanner(checkoutStatus, "Không tìm thấy gói sản phẩm.", "error");
      return;
    }

    const email = sessionEmail || String(emailInput?.value || "").trim();
    if (!email || !email.includes("@")) {
      setBanner(checkoutStatus, "Vui lòng nhập email hợp lệ.", "warning");
      return;
    }

    const provider = getSelectedProvider();
    const isPayPal = provider === "paypal";
    const isVietQR = provider === "vietqr";

    setBanner(checkoutStatus, isPayPal ? "Đang kết nối PayPal..." : "Đang tạo thanh toán VietQR...", "warning");
    hide(vietqrBox);
    hide(payNowLink);

    let usedTurnstile = false;
    try {
      const turnstileToken = await getTurnstileToken();
      if (!turnstileToken) {
        setBanner(checkoutStatus, "Vui lòng hoàn tất xác minh bảo mật Turnstile rồi thử lại.", "warning");
        return;
      }
      usedTurnstile = true;
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": randomId("chk")
        },
        body: JSON.stringify({
          email: sessionEmail ? undefined : email,
          plan_code: planCode,
          provider: provider,
          locale: isPayPal ? "en" : "vi",
          product_source: planCode,
          identity_country: isPayPal ? "INTL" : "VN",
          "cf-turnstile-response": turnstileToken
        })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setBanner(checkoutStatus, body.message || "Không thể tạo thanh toán. Thử lại sau.", "error");
        return;
      }

      if (isPayPal && body.checkout_url) {
        // PayPal: redirect to approval URL
        setBanner(checkoutStatus, "Đang chuyển sang PayPal...", "success");
        window.location.href = body.checkout_url;
        return;
      }

      if (isVietQR) {
        const manual = body.manual_transfer || {};
        const checkoutUrl = String(body.checkout_url || "").trim();
        const qrUrl = isQrImageUrl(manual.qr_url) ? manual.qr_url : (isQrImageUrl(checkoutUrl) ? checkoutUrl : "");
        const hostedPaymentUrl = checkoutUrl && !isQrImageUrl(checkoutUrl) ? checkoutUrl : "";

        show(vietqrBox);
        setText("#vietqrTransferNote", manual.transfer_note || body.provider_order_id || body.internal_order_id || "");
        setText("#vietqrAmount", manual.amount ? manual.amount.toLocaleString("vi-VN") + " VND" : "");
        setText("#vietqrAccountName", manual.account_name || "");
        setText("#vietqrAccountNo", manual.account_no || "");
        setText("#vietqrBankBin", manual.bank_bin || "");
        setRowVisible("#vietqrAccountName", manual.account_name || manual.account_no || manual.bank_bin);

        const qrImage = $("#vietqrImage");
        if (qrImage) {
          qrImage.onerror = function() {
            qrImage.removeAttribute("src");
            qrImage.style.display = "none";
          };
          if (qrUrl) {
            qrImage.src = qrUrl;
            qrImage.style.display = "";
          } else {
            qrImage.removeAttribute("src");
            qrImage.style.display = "none";
          }
        }

        if (hostedPaymentUrl && payNowLink) {
          show(payNowLink);
          payNowLink.href = hostedPaymentUrl;
          payNowLink.textContent = "Mở cửa sổ thanh toán VietQR";
          payNowLink.classList.remove("hidden");
          setBanner(checkoutStatus, "Đã tạo thanh toán. Hãy bấm mở cổng thanh toán để lấy mã VietQR trực tiếp.", "success");
        } else if (qrUrl) {
          hide(payNowLink);
          setBanner(checkoutStatus, "Đã tạo mã VietQR. Vui lòng quét mã hoặc chuyển khoản.", "success");
        } else {
          hide(payNowLink);
          setBanner(checkoutStatus, "Đã tạo thanh toán. Vui lòng chuyển khoản theo thông tin hiển thị.", "success");
        }
      }
    } catch (e) {
      setBanner(checkoutStatus, "Lỗi kết nối. Vui lòng thử lại.", "error");
    } finally {
      if (usedTurnstile) resetTurnstile();
    }
  });
})();
