(() => {
  const STORAGE_KEY = "nla_checkout_context";
  const MANUAL_PAYPAL_BUSINESS = "pay@nguyenlananh.com";

  const PLANS = {
    year1: { code: "year1", priceUsd: 2, label: "Core Access" },
    year2: { code: "year2", priceUsd: 60, label: "Year 2 Continuity" },
    year3: { code: "year3", priceUsd: 99, label: "Year 3+ Mastery" }
  };

  const $ = (selector, root = document) => root.querySelector(selector);

  function isEnglishPath(pathname = window.location.pathname) {
    return pathname.startsWith("/en/");
  }

  function strings() {
    if (isEnglishPath()) {
      return {
        loadingProviders: "Checking payment providers...",
        autoModeReady: "Live checkout is ready. Your membership is activated only after the payment is confirmed.",
        manualMode: "Live API is not fully configured yet. The page stays on manual PayPal fallback.",
        setupRequired: "This provider is not ready yet. Choose PayPal or Stripe, or finish setup in production first.",
        redirecting: "Redirecting you to the payment page...",
        providerError: "Unable to start checkout right now.",
        successLoading: "Verifying payment and activating membership...",
        successDone: "Payment confirmed. Your membership is active.",
        pending: "Payment was received but is still pending final confirmation.",
        denied: "Payment was not completed. Please retry.",
        cancel: "You cancelled the payment. You can return and choose another method.",
        retry: "The previous payment attempt did not finish. Start again when ready.",
        copyDone: "Copied",
        copyFail: "Unable to copy",
        copyAction: "Copy magic link",
        missingOrder: "Missing payment context. Please start checkout again.",
        backToJoin: "Return to membership page",
        tryAgain: "Try payment again"
      };
    }

    return {
      loadingProviders: "Đang kiểm tra cổng thanh toán...",
      autoModeReady: "Checkout live đã sẵn sàng. Membership chỉ được cấp khi thanh toán được xác nhận.",
      manualMode: "API live chưa được cấu hình đầy đủ. Trang đang giữ fallback PayPal thủ công.",
      setupRequired: "Cổng này chưa sẵn sàng. Hãy chọn PayPal hoặc Stripe, hoặc cấu hình production trước.",
      redirecting: "Đang chuyển bạn đến cổng thanh toán...",
      providerError: "Chưa thể bắt đầu checkout lúc này.",
      successLoading: "Đang xác minh thanh toán và kích hoạt membership...",
      successDone: "Thanh toán đã được xác nhận. Membership của bạn đã kích hoạt.",
      pending: "Hệ thống đã nhận giao dịch nhưng đang chờ xác nhận cuối.",
      denied: "Thanh toán chưa hoàn tất. Vui lòng thử lại.",
      cancel: "Bạn đã hủy thanh toán. Bạn có thể quay lại và chọn cổng khác.",
      retry: "Lần thanh toán trước chưa hoàn tất. Bắt đầu lại khi bạn sẵn sàng.",
      copyDone: "Đã sao chép",
      copyFail: "Không thể sao chép",
      copyAction: "Sao chép magic link",
      missingOrder: "Không tìm thấy ngữ cảnh thanh toán. Hãy bắt đầu lại từ trang join.",
      backToJoin: "Quay lại trang thành viên",
      tryAgain: "Thử thanh toán lại"
    };
  }

  function readJSON(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function clearJSON(key) {
    localStorage.removeItem(key);
  }

  function randomId(prefix) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }

  function getLocale() {
    return document.documentElement.lang === "en-US" ? "en-US" : "vi";
  }

  function getPlan(planCode) {
    return PLANS[planCode] || PLANS.year1;
  }

  function buildManualPayPalUrl(plan, email) {
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: MANUAL_PAYPAL_BUSINESS,
      item_name: `Nguyenlananh Membership ${plan.label}`,
      currency_code: "USD",
      amount: String(plan.priceUsd),
      custom: `${email}|${plan.code}`
    });
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  }

  async function fetchProviders() {
    const response = await fetch("/api/payments/providers", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) {
      throw new Error("providers_unavailable");
    }
    return response.json();
  }

  async function createCheckout(payload) {
    const response = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": randomId("checkout")
      },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || body.code || "checkout_failed");
    }
    return body;
  }

  async function finalizeCheckout(payload) {
    const response = await fetch("/api/payments/finalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": randomId("finalize")
      },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || body.code || "finalize_failed");
    }
    return body;
  }

  function setStatus(element, message, tone = "info") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden", "is-success", "is-warning", "is-danger");
    if (tone === "success") element.classList.add("is-success");
    if (tone === "warning") element.classList.add("is-warning");
    if (tone === "danger") element.classList.add("is-danger");
  }

  function providerByCode(list, code) {
    return (list || []).find((item) => item.code === code) || null;
  }

  function checkoutContext() {
    return readJSON(STORAGE_KEY, null);
  }

  function saveCheckoutContext(value) {
    writeJSON(STORAGE_KEY, value);
  }

  function clearCheckoutContext() {
    clearJSON(STORAGE_KEY);
  }

  function renderProviderOptions(select, providers) {
    if (!select || !Array.isArray(providers) || !providers.length) return;
    const preferredValue = select.value || "paypal";
    select.innerHTML = "";

    providers.forEach((provider) => {
      const option = document.createElement("option");
      option.value = provider.code;
      option.textContent = provider.enabled
        ? `${provider.label}`
        : provider.manual_fallback
          ? `${provider.label} (manual fallback)`
          : `${provider.label} (setup required)`;
      option.disabled = !provider.enabled && !provider.manual_fallback;
      if (provider.code === preferredValue) option.selected = true;
      select.appendChild(option);
    });
  }

  function initJoinPage() {
    const copy = strings();
    const form = $("#joinForm");
    const emailInput = $("#joinEmail");
    const planInput = $("#joinPlan");
    const providerInput = $("#joinProvider");
    const paymentNote = $("#paymentModeNote");
    const paymentStatus = $("#paymentStatus");
    const payNowLink = $("#payNowLink");
    const afterPay = $("#afterPay");

    if (!form || !providerInput) return;

    let providers = [];

    function currentProvider() {
      return providerByCode(providers, providerInput.value);
    }

    function updateManualLink() {
      const plan = getPlan(planInput?.value || "year1");
      const email = (emailInput?.value || "").trim() || "member@nguyenlananh.com";
      if (payNowLink) payNowLink.href = buildManualPayPalUrl(plan, email);
    }

    function updateModeNote() {
      const selected = currentProvider();
      updateManualLink();
      if (!selected) {
        setStatus(paymentStatus, copy.loadingProviders, "warning");
        return;
      }

      if (selected.enabled) {
        if (paymentNote) paymentNote.textContent = copy.autoModeReady;
        if (afterPay) afterPay.classList.add("hidden");
        paymentStatus?.classList.add("hidden");
        return;
      }

      if (selected.manual_fallback) {
        if (paymentNote) paymentNote.textContent = copy.manualMode;
        return;
      }

      if (paymentNote) paymentNote.textContent = copy.setupRequired;
      setStatus(paymentStatus, copy.setupRequired, "warning");
    }

    emailInput?.addEventListener("input", updateManualLink);
    planInput?.addEventListener("change", updateModeNote);
    providerInput?.addEventListener("change", updateModeNote);

    form.addEventListener(
      "submit",
      async (event) => {
        const selected = currentProvider();
        if (!selected || (!selected.enabled && !selected.manual_fallback)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setStatus(paymentStatus, copy.setupRequired, "warning");
          return;
        }

        if (!selected.enabled) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        const email = (emailInput?.value || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
          setStatus(paymentStatus, copy.providerError, "danger");
          return;
        }

        setStatus(paymentStatus, copy.redirecting, "warning");

        try {
          const locale = getLocale();
          const checkout = await createCheckout({
            provider: selected.code,
            email,
            plan_code: planInput?.value || "year1",
            locale,
            next_path: new URLSearchParams(window.location.search).get("next") || undefined
          });

          saveCheckoutContext({
            internal_order_id: checkout.internal_order_id,
            provider: checkout.provider,
            provider_order_id: checkout.provider_order_id || null,
            provider_session_id: checkout.provider_session_id || null,
            email,
            plan_code: planInput?.value || "year1",
            locale
          });

          window.location.href = checkout.checkout_url;
        } catch (error) {
          setStatus(paymentStatus, error.message || copy.providerError, "danger");
        }
      },
      true
    );

    fetchProviders()
      .then((data) => {
        providers = Array.isArray(data?.providers) ? data.providers : [];
        renderProviderOptions(providerInput, providers);
        updateModeNote();
      })
      .catch(() => {
        providers = [
          {
            code: "paypal",
            label: "PayPal",
            enabled: false,
            manual_fallback: true
          }
        ];
        renderProviderOptions(providerInput, providers);
        if (paymentNote) paymentNote.textContent = copy.manualMode;
        updateManualLink();
      });
  }

  async function initReturnPage() {
    const copy = strings();
    const statusBox = $("#paymentReturnStatus");
    const summaryBox = $("#paymentReturnSummary");
    const magicBox = $("#magicBox");
    const magicOutput = $("#magicOutput");
    const copyMagic = $("#copyMagic");
    const actionLink = $("#paymentPrimaryLink");
    const bodyStatus = document.body.getAttribute("data-payment-status");
    const params = new URLSearchParams(window.location.search);
    const saved = checkoutContext();
    const provider = params.get("provider") || saved?.provider || "paypal";
    const internalOrderId = params.get("internal_order_id") || saved?.internal_order_id;

    copyMagic?.addEventListener("click", async () => {
      const text = magicOutput?.textContent?.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyMagic.textContent = copy.copyDone;
        setTimeout(() => {
          copyMagic.textContent = copy.copyAction;
        }, 1200);
      } catch (_error) {
        copyMagic.textContent = copy.copyFail;
      }
    });

    if (bodyStatus === "cancel") {
      setStatus(statusBox, copy.cancel, "warning");
      if (summaryBox) summaryBox.textContent = copy.tryAgain;
      return;
    }

    if (bodyStatus === "retry") {
      setStatus(statusBox, copy.retry, "warning");
      if (summaryBox) summaryBox.textContent = copy.tryAgain;
      return;
    }

    if (!internalOrderId) {
      setStatus(statusBox, copy.missingOrder, "danger");
      if (summaryBox) summaryBox.textContent = copy.backToJoin;
      return;
    }

    setStatus(statusBox, copy.successLoading, "warning");

    try {
      const result = await finalizeCheckout({
        provider,
        internal_order_id: internalOrderId,
        provider_order_id: params.get("token") || saved?.provider_order_id || undefined,
        provider_session_id: params.get("session_id") || saved?.provider_session_id || undefined,
        payer_id: params.get("PayerID") || undefined
      });

      if (result.capture_status === "COMPLETED") {
        setStatus(statusBox, copy.successDone, "success");
        if (summaryBox) {
          summaryBox.textContent = `${result.membership_type || ""} · ${result.expires_at || ""}`;
        }
        if (result.magic_link && magicOutput) {
          magicOutput.textContent = result.magic_link;
          magicBox?.classList.remove("hidden");
        }
        clearCheckoutContext();
        if (actionLink) {
          actionLink.href = result.magic_link || actionLink.href;
        }
        return;
      }

      if (result.capture_status === "DENIED") {
        setStatus(statusBox, copy.denied, "danger");
        return;
      }

      setStatus(statusBox, copy.pending, "warning");
    } catch (error) {
      setStatus(statusBox, error.message || copy.denied, "danger");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.getAttribute("data-page");
    if (page === "join") {
      initJoinPage();
    }
    if (page === "payment-return") {
      initReturnPage();
    }
  });
})();
