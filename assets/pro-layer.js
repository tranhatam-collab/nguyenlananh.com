(function () {
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  var cards = $$(".pricingCard[data-plan]");
  if (!cards.length) return;

  var userPlans = [];
  var loggedIn = false;
  var sessionEmail = null;

  var isEn = window.location.pathname.indexOf("/en/") === 0;
  var proBase = isEn ? "/en/members/pro/" : "/members/pro/";
  var joinBase = isEn ? "/en/join/" : "/join/";

  var urlParams = new URLSearchParams(window.location.search);
  var checkoutSlug = urlParams.get("checkout") || "";
  var checkoutPlan = urlParams.get("plan") || "";

  function updateButtons() {
    cards.forEach(function (card) {
      var plan = card.getAttribute("data-plan") || "";
      var slug = card.getAttribute("data-slug") || "";
      var link = card.querySelector(".actionsRow a");
      if (!link) return;

      if (loggedIn && userPlans.indexOf(plan) !== -1) {
        link.textContent = isEn ? "Enter track" : "V\u00E0o g\u00F3i";
        link.href = proBase + slug + "/";
        link.className = "btn";
      } else if (loggedIn) {
        link.textContent = isEn ? "Buy track" : "Mua g\u00F3i";
        link.href = proBase + slug + "/";
        link.className = "btn";
      } else {
        link.textContent = isEn ? "Sign in to purchase" : "\u0110\u0103ng nh\u1EADp \u0111\u1EC3 m\u1EDF g\u00F3i";
        link.href = joinBase + "?next_path=" + encodeURIComponent(proBase + slug + "/");
        link.className = "ghost";
      }
    });

    if (checkoutSlug && loggedIn && checkoutPlan) {
      var targetCard = cards.filter(function (c) { return c.getAttribute("data-slug") === checkoutSlug; })[0];
      if (targetCard) {
        if (userPlans.indexOf(checkoutPlan) !== -1) {
          window.location.href = proBase + checkoutSlug + "/";
          return;
        }
        openCheckout(targetCard, checkoutPlan, checkoutSlug);
      }
    }
  }

  function openCheckout(card, planCode, slug) {
    var existing = $("#proCheckoutOverlay");
    if (existing) existing.remove();

    var overlay = document.createElement("div");
    overlay.id = "proCheckoutOverlay";
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;";

    var box = document.createElement("div");
    box.style.cssText = "background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.15);";
    box.innerHTML =
      '<div style="margin-bottom:16px;">' +
        '<h3 style="margin:0 0 4px;">' + (card.querySelector("h3") ? card.querySelector("h3").textContent : "Pro Pack") + '</h3>' +
        '<p style="margin:0;font-size:14px;color:#64748b;">' + (card.querySelector(".price") ? card.querySelector(".price").textContent : "") + '</p>' +
      '</div>' +
      '<div style="margin-bottom:12px;display:flex;gap:8px;">' +
        '<label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid rgba(148,163,184,.35);border-radius:8px;cursor:pointer;">' +
          '<input type="radio" name="checkoutProvider" value="vietqr" checked />' +
          '<span>VietQR (VND)</span>' +
        '</label>' +
        '<label style="flex:1;display:flex;align-items:center;gap:6px;padding:8px 12px;border:1px solid rgba(148,163,184,.35);border-radius:8px;cursor:pointer;">' +
          '<input type="radio" name="checkoutProvider" value="paypal" />' +
          '<span>PayPal (USD)</span>' +
        '</label>' +
      '</div>' +
      '<div id="proCheckoutStatus" class="hidden" style="margin-bottom:8px;padding:8px 12px;border-radius:8px;font-size:14px;"></div>' +
      '<div id="proTurnstile" style="margin-bottom:12px;"></div>' +
      '<button id="proBuyNow" class="btn" style="width:100%;">' + (isEn ? "Buy now" : "Mua ngay") + '</button>' +
      '<button id="proCloseCheckout" class="ghost" style="width:100%;margin-top:8px;">' + (isEn ? "Close" : "\u0110\u00F3ng") + '</button>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    var statusEl = box.querySelector("#proCheckoutStatus");
    var buyBtn = box.querySelector("#proBuyNow");
    var closeBtn = box.querySelector("#proCloseCheckout");

    closeBtn.addEventListener("click", function () { overlay.remove(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });

    function setStatus(text, type) {
      statusEl.textContent = text;
      statusEl.className = type || "";
      statusEl.classList.remove("hidden");
    }

    function loadScript(src) {
      return new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    var turnstileRendered = false;
    loadScript("/api/turnstile/config?v=20260628a").then(function () {
      if (!window.TURNSTILE_SITE_KEY_CONFIGURED) return;
      return loadScript("/assets/turnstile.js?v=20260627c");
    }).then(function () {
      if (!window.TurnstileHelper || !window.TurnstileHelper.isConfigured()) return;
      var container = box.querySelector("#proTurnstile");
      if (container) {
        window.TurnstileHelper.render(container).then(function (wid) {
          turnstileRendered = true;
          window.__proTurnstileWidget = wid;
        });
      }
    });

    buyBtn.addEventListener("click", async function () {
      var provider = box.querySelector('input[name="checkoutProvider"]:checked');
      var providerVal = provider ? provider.value : "vietqr";

      if (!sessionEmail) {
        setStatus(isEn ? "Please sign in before purchasing." : "Vui l\u00F2ng \u0111\u0103ng nh\u1EADp tr\u01B0\u1EDBc khi mua.", "error");
        return;
      }

      var token = "";
      if (window.TurnstileHelper && window.__proTurnstileWidget) {
        token = String(window.TurnstileHelper.getToken(window.__proTurnstileWidget) || "").trim();
        if (!token) {
          setStatus(isEn ? "Please complete security verification." : "Vui l\u00F2ng ho\u00E0n t\u1EA5t x\u00E1c minh b\u1EA3o m\u1EADt.", "warning");
          return;
        }
      }

      setStatus(isEn ? "Creating payment..." : "\u0110ang t\u1EA1o thanh to\u00E1n...", "warning");

      try {
        var resp = await fetch("/api/payments/create-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Idempotency-Key": "pro_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36)
          },
          body: JSON.stringify({
            plan_code: planCode,
            provider: providerVal,
            locale: providerVal === "vietqr" ? "vi" : "en",
            product_source: planCode,
            identity_country: providerVal === "vietqr" ? "VN" : "INTL",
            "cf-turnstile-response": token
          })
        });
        var data = await resp.json();
        if (!resp.ok || !data.ok) {
          setStatus(data.message || (isEn ? "Unable to create payment." : "Kh\u00F4ng th\u1EC3 t\u1EA1o thanh to\u00E1n."), "error");
          return;
        }

        if (providerVal === "paypal" && data.checkout_url) {
          window.location.href = data.checkout_url;
          return;
        }

        if (providerVal === "vietqr") {
          if (data.checkout_url) {
            var qrImg = document.createElement("div");
            qrImg.style.cssText = "text-align:center;margin:12px 0;";
            qrImg.innerHTML = '<img src="' + data.checkout_url + '" alt="QR" style="max-width:240px;border-radius:8px;" />';
            box.insertBefore(qrImg, buyBtn);
            setStatus(isEn ? "Scan QR to pay." : "Qu\u00E9t m\u00E3 QR \u0111\u1EC3 thanh to\u00E1n.", "success");
            buyBtn.style.display = "none";
          } else if (data.manual_transfer) {
            var mt = data.manual_transfer;
            var info = document.createElement("div");
            info.style.cssText = "padding:12px;background:#f8fafc;border-radius:8px;margin:12px 0;font-size:14px;";
            info.innerHTML =
              "<div>" + (isEn ? "Account:" : "S\u1ED1 t\u00E0i kho\u1EA3n:") + " <strong>" + (mt.account_no || "-") + "</strong></div>" +
              "<div>" + (isEn ? "Bank:" : "Ng\u00E2n h\u00E0ng:") + " <strong>" + (mt.bank_bin || "-") + "</strong></div>" +
              "<div>" + (isEn ? "Holder:" : "Ch\u1EE7 t\u00E0i kho\u1EA3n:") + " <strong>" + (mt.account_name || "-") + "</strong></div>" +
              "<div>" + (isEn ? "Amount:" : "S\u1ED1 ti\u1EC1n:") + " <strong>" + (mt.amount || 0).toLocaleString("vi-VN") + " VND</strong></div>" +
              "<div>" + (isEn ? "Ref:" : "N\u1ED9i dung:") + " <strong>" + (mt.transfer_note || "-") + "</strong></div>";
            box.insertBefore(info, buyBtn);
            setStatus(isEn ? "Please transfer using details above." : "Vui l\u00F2ng chuy\u1EC3n kho\u1EA3n theo th\u00F4ng tin tr\u00EAn.", "success");
            buyBtn.style.display = "none";
          }
        }
      } catch (e) {
        setStatus(isEn ? "Connection error. Try again." : "L\u1ED7i k\u1EBFt n\u1ED1i. Vui l\u00F2ng th\u1EED l\u1EA1i.", "error");
      }

      if (window.TurnstileHelper && window.__proTurnstileWidget) {
        try { window.TurnstileHelper.reset(window.__proTurnstileWidget); } catch (_) {}
      }
    });
  }

  fetch("/api/auth/session", { method: "GET", credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && data.ok && data.session) {
        loggedIn = true;
        sessionEmail = data.session.email;
        if (data.session.contentAccess) {
          userPlans = data.session.contentAccess.map(function (a) { return a.planCode; });
        }
      }
      updateButtons();
    })
    .catch(function () { updateButtons(); });
})();
