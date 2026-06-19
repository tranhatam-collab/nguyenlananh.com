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

  const planCode = document.body.dataset.plan || "";
  const planPrice = document.body.dataset.price || "";
  if (!planCode) return;

  const buyNow = $("#buyNow");
  const emailInput = $("#buyerEmail");
  const checkoutStatus = $("#checkoutStatus");
  const vietqrBox = $("#vietqrBox");
  const payNowLink = $("#payNowLink");
  if (!buyNow) return;

  buyNow.addEventListener("click", async () => {
    const email = String(emailInput?.value || "").trim();
    if (!email || !email.includes("@")) {
      setBanner(checkoutStatus, "Vui lòng nhập email hợp lệ.", "warning");
      return;
    }
    setBanner(checkoutStatus, "Đang tạo thanh toán...", "warning");
    try {
      const response = await fetch("/api/payments/vietqr/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": randomId("micro")
        },
        body: JSON.stringify({
          email,
          plan_code: planCode,
          provider: "vietqr",
          locale: "vi",
          product_source: planCode,
          identity_country: "VN"
        })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setBanner(checkoutStatus, body.message || "Không thể tạo thanh toán. Thử lại sau.", "error");
        return;
      }
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
        if (String(body.checkout_url).startsWith("https://img.vietqr.io")) {
          show(vietqrBox);
          const vi = $("#vietqrImage"); if (vi) vi.src = body.checkout_url;
        } else {
          show(vietqrBox);
          show(payNowLink);
          if (payNowLink) {
            payNowLink.href = body.checkout_url;
            payNowLink.textContent = "Mở trang thanh toán pay.iai.one";
            payNowLink.classList.remove("hidden");
          }
        }
      }
    } catch (e) {
      setBanner(checkoutStatus, "Lỗi kết nối. Vui lòng thử lại.", "error");
    }
  });
})();
