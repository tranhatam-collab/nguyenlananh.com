/**
 * Product checkout — dual rail: VietQR (VND, VN) + PayPal (USD, quốc tế)
 * Merchant: Công Ty Tnhh Thành Tâm Phát
 */
(function () {
  // Auto-load Turnstile if not already loaded
  if (!window.TurnstileHelper) {
    var configScript = document.createElement("script");
    configScript.src = "/assets/turnstile-config.js";
    configScript.async = false;
    var tsScript = document.createElement("script");
    tsScript.src = "/assets/turnstile.js";
    tsScript.async = false;
    document.head.appendChild(configScript);
    document.head.appendChild(tsScript);
  }

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

  function getCurrentPlan() {
    return document.body.dataset.plan || "";
  }
  if (!getCurrentPlan()) return;

  const buyNow = $("#buyNow");
  const emailInput = $("#buyerEmail");
  const checkoutStatus = $("#checkoutStatus");
  const vietqrBox = $("#vietqrBox");
  const payNowLink = $("#payNowLink");
  if (!buyNow) return;

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

    const email = String(emailInput?.value || "").trim();
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

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": randomId("chk")
        },
        body: JSON.stringify({
          email,
          plan_code: planCode,
          provider: provider,
          locale: isPayPal ? "en" : "vi",
          product_source: planCode,
          identity_country: isPayPal ? "INTL" : "VN",
          "cf-turnstile-response": window.TurnstileHelper ? window.TurnstileHelper.getToken() : ""
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
        setBanner(checkoutStatus, "Đã tạo thanh toán. Vui lòng quét mã hoặc chuyển khoản.", "success");
        if (body.manual_transfer) {
          show(vietqrBox);
          const tn = $("#vietqrTransferNote"); if (tn) tn.textContent = body.manual_transfer.transfer_note || "-";
          const am = $("#vietqrAmount"); if (am) am.textContent = (body.manual_transfer.amount || 0).toLocaleString("vi-VN") + " VND";
          const an = $("#vietqrAccountName"); if (an) an.textContent = body.manual_transfer.account_name || "-";
          const ac = $("#vietqrAccountNo"); if (ac) ac.textContent = body.manual_transfer.account_no || "-";
          const bb = $("#vietqrBankBin"); if (bb) bb.textContent = body.manual_transfer.bank_bin || "-";
          const vi = $("#vietqrImage"); if (vi) vi.src = body.manual_transfer.qr_url || "";
        }
        if (body.checkout_url) {
          show(vietqrBox);
          if (String(body.checkout_url).startsWith("https://img.vietqr.io")) {
            const vi = $("#vietqrImage"); if (vi) vi.src = body.checkout_url;
          } else {
            show(payNowLink);
            if (payNowLink) {
              payNowLink.href = body.checkout_url;
              payNowLink.textContent = "Mở trang thanh toán pay.iai.one";
              payNowLink.classList.remove("hidden");
            }
          }
        }
      }
    } catch (e) {
      setBanner(checkoutStatus, "Lỗi kết nối. Vui lòng thử lại.", "error");
    }
  });
})();
