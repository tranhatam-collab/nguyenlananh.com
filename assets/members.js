(() => {
  const STORAGE = {
    session: "nla_member_session",
    progress: "nla_member_progress",
    profiles: "nla_member_profiles"
  };

  const PLANS = {
    free: {
      code: "free",
      label: "Đồng hành miễn phí",
      priceUsd: 0,
      durationDays: 365,
      tier: "free"
    },
    year1: {
      code: "year1",
      label: "Mở khóa lõi bên trong",
      priceUsd: 2,
      priceVnd: 49000,
      durationDays: 365,
      tier: "paid"
    },
    year2: {
      code: "year2",
      label: "Đồng hành chuyên sâu",
      priceUsd: 60,
      priceVnd: 1490000,
      durationDays: 365,
      tier: "paid"
    },
    year3: {
      code: "year3",
      label: "Chương trình chuyên sâu",
      priceUsd: 99,
      priceVnd: 2490000,
      durationDays: 365,
      tier: "paid"
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function isEnglishPath(pathname) {
    return (pathname || "").startsWith("/en/");
  }

  function memberStrings(pathname = window.location.pathname) {
    if (isEnglishPath(pathname)) {
      return {
        invalidEmail: "Please enter a valid email.",
        joinSending: "Sending your magic link...",
        joinEmailSent: "Check your inbox. Your confirmation link is on the way.",
        joinPreview: "Email delivery is not ready, so the magic link is shown here as a fallback.",
        joinError: "Unable to send the magic link right now.",
        copied: "Copied",
        copyAction: "Copy magic link",
        copyFailed: "Unable to copy",
        magicFailed: "Unable to confirm this magic link.",
        journeyDone: "Completed",
        noJournal: "No journal entries yet. Write one honest line to begin.",
        profileSaved: "Your companion profile has been saved.",
        unlockReady: "Your paid membership is now unlocked.",
        freePlan: "Free Companion",
        freeExpires: "Open now",
        gateReason: "Complete your profile first, then unlock the full member path.",
        paymentReminder: "Vietnam IDs must use VietQR (VND). International IDs must use USD checkout.",
        checkoutCreating: "Creating checkout...",
        checkoutRedirecting: "Checkout is ready. Opening payment page...",
        checkoutFailed: "Unable to create checkout right now.",
        checkoutRailError: "Your identity area does not match this payment rail.",
        transferMarked: "Transfer has been marked. The order now waits for admin confirmation.",
        transferMarkFailed: "Unable to mark transfer at this step.",
        adminConfirmHint: "Admin must confirm VietQR transfer inside /admin/payments/ before membership unlock.",
        alreadyFree: "Continue free companionship",
        alreadyPaid: "Open paid member dashboard",
        practiceTrackGentle: "Gentle Rhythm",
        practiceTrackDeep: "Deep Facing",
        reminderNone: "No reminders",
        reminderGentle: "Gentle reminder",
        reminderRhythm: "Rhythm reminder with one 5-minute step",
        reminderPausedUntil: "Paused until",
        practiceStateRequired: "Choose one check-in state.",
        practiceOneLineRequired: "Write one honest line before saving.",
        practiceCheckinSaved: "Your check-in has been saved."
      };
    }

    return {
      invalidEmail: "Vui lòng nhập email hợp lệ.",
      joinSending: "Đang gửi magic link cho bạn...",
      joinEmailSent: "Hãy kiểm tra email. Link xác nhận đang được gửi tới bạn.",
      joinPreview: "Email chưa sẵn sàng nên link đang được hiện tạm ở đây để bạn tiếp tục.",
      joinError: "Chưa thể gửi magic link lúc này.",
      copied: "Đã sao chép",
      copyAction: "Sao chép magic link",
      copyFailed: "Không thể sao chép",
      magicFailed: "Không thể xác nhận magic link này.",
      journeyDone: "Đã hoàn thành",
      noJournal: "Chưa có nhật ký. Viết một dòng thật để bắt đầu.",
      profileSaved: "Hồ sơ đồng hành đã được lưu.",
      unlockReady: "Bạn đã mở khóa thành công quyền lợi thành viên đã trả phí.",
      freePlan: "Đồng hành miễn phí",
      freeExpires: "Đang mở",
      gateReason: "Hãy hoàn thiện profile trước, rồi mới mở khóa lộ trình thành viên đầy đủ.",
      paymentReminder: "ID Việt Nam bắt buộc dùng VietQR (VND). ID ngoài Việt Nam bắt buộc dùng checkout USD.",
      checkoutCreating: "Đang tạo checkout...",
      checkoutRedirecting: "Checkout đã sẵn sàng. Đang mở trang thanh toán...",
      checkoutFailed: "Chưa thể tạo checkout lúc này.",
      checkoutRailError: "Khu vực định danh không khớp với cổng thanh toán.",
      transferMarked: "Đã ghi nhận bạn đã chuyển khoản. Đơn đang chờ admin xác nhận.",
      transferMarkFailed: "Chưa thể đánh dấu chuyển khoản ở bước này.",
      adminConfirmHint: "Admin cần xác nhận ở /admin/payments/ thì membership mới mở.",
      alreadyFree: "Tiếp tục đồng hành miễn phí",
      alreadyPaid: "Mở dashboard thành viên đã trả phí",
      practiceTrackGentle: "Nhịp nhẹ",
      practiceTrackDeep: "Đối diện sâu",
      reminderNone: "Không nhắc",
      reminderGentle: "Nhắc nhẹ",
      reminderRhythm: "Nhắc theo nhịp với một bước 5 phút",
      reminderPausedUntil: "Tạm dừng đến",
      practiceStateRequired: "Hãy chọn một trạng thái check-in.",
      practiceOneLineRequired: "Hãy viết một dòng thật trước khi lưu.",
      practiceCheckinSaved: "Check-in của bạn đã được lưu."
    };
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function randomId(prefix = "sess") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }

  function isMembersPath(pathname) {
    return /^\/(en\/)?members(\/|$)/.test(pathname || "");
  }

  function isPublicMembersLanding(pathname) {
    return ["/members", "/members/", "/en/members", "/en/members/"].includes(pathname || "");
  }

  function dashboardPathForPath(pathname) {
    return (pathname || "").startsWith("/en/") ? "/en/members/dashboard/" : "/members/dashboard/";
  }

  function startPathForPath(pathname) {
    return (pathname || "").startsWith("/en/") ? "/en/members/start/" : "/members/start/";
  }

  function joinPathForPath(pathname) {
    return (pathname || "").startsWith("/en/") ? "/en/join/" : "/join/";
  }

  function safeMembersPath(pathname, localeSource = window.location.pathname) {
    if (!pathname || typeof pathname !== "string") return dashboardPathForPath(localeSource);
    if (!isMembersPath(pathname)) return dashboardPathForPath(localeSource);
    if (isPublicMembersLanding(pathname)) return dashboardPathForPath(localeSource);
    return pathname;
  }

  function planByCode(code) {
    return PLANS[code] || PLANS.free;
  }

  function isPaidMembership(session) {
    return Boolean(session && planByCode(session.membershipType).tier === "paid");
  }

  function getProfilesStore() {
    return readJSON(STORAGE.profiles, {});
  }

  function saveProfilesStore(store) {
    writeJSON(STORAGE.profiles, store);
  }

  function getProfileForEmail(email) {
    if (!email) return null;
    const store = getProfilesStore();
    return store[email] || null;
  }

  function normalizePracticeTrack(value) {
    return ["gentle", "deep"].includes(value) ? value : "";
  }

  function normalizeReminderIntensity(value) {
    return ["none", "gentle", "rhythm"].includes(value) ? value : "";
  }

  function isFutureIso(value) {
    const time = new Date(value || 0).getTime();
    return Number.isFinite(time) && time > Date.now();
  }

  function saveProfileForEmail(email, profile) {
    if (!email) return null;
    const store = getProfilesStore();
    const existing = store[email] || {};
    store[email] = {
      fullName: String(profile.fullName || "").trim(),
      currentState: String(profile.currentState || "").trim(),
      desiredShift: String(profile.desiredShift || "").trim(),
      companionRhythm: String(profile.companionRhythm || "").trim(),
      practiceTrack: normalizePracticeTrack(String(profile.practiceTrack || "")),
      reminderIntensity: normalizeReminderIntensity(String(profile.reminderIntensity || "")),
      reminderPausedUntil: profile.reminderPausedUntil === undefined
        ? String(existing.reminderPausedUntil || "")
        : String(profile.reminderPausedUntil || ""),
      updatedAt: new Date().toISOString()
    };
    saveProfilesStore(store);
    return store[email];
  }

  function profileIsComplete(profile) {
    if (!profile) return false;
    return ["fullName", "currentState", "desiredShift", "companionRhythm", "practiceTrack", "reminderIntensity"].every((key) => String(profile[key] || "").trim().length > 0);
  }

  function getSession() {
    const session = readJSON(STORAGE.session, null);
    if (!session) return null;

    if (Date.now() > Number(new Date(session.expiresAt || 0).getTime() || 0)) {
      localStorage.removeItem(STORAGE.session);
      return null;
    }

    return session;
  }

  function writeSession(session) {
    writeJSON(STORAGE.session, session);
    return session;
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.session);
  }

  function createSessionFromServer(serverSession) {
    if (!serverSession) return null;
    const existing = getSession();
    const incomingPlan = planByCode(serverSession.membershipType || "free");

    if (
      existing &&
      existing.email === serverSession.email &&
      isPaidMembership(existing) &&
      incomingPlan.tier === "free"
    ) {
      return existing;
    }

    const expiresAt = serverSession.expiresAt
      ? new Date(serverSession.expiresAt).toISOString()
      : new Date(Date.now() + incomingPlan.durationDays * 24 * 60 * 60 * 1000).toISOString();

    return writeSession({
      id: serverSession.id || randomId(),
      email: serverSession.email,
      membershipType: serverSession.membershipType || "free",
      membershipLabel: serverSession.membershipLabel || incomingPlan.label,
      startedAt: serverSession.startedAt || new Date().toISOString(),
      expiresAt
    });
  }

  function getProgress() {
    return readJSON(STORAGE.progress, {
      journey: { look: false, release: false, build: false },
      practice: { days: {} },
      experience: { notes: [] }
    });
  }

  function saveProgress(progress) {
    writeJSON(STORAGE.progress, progress);
  }

  function completionPercent(progress) {
    const journey = progress.journey;
    const journeyDone = [journey.look, journey.release, journey.build].filter(Boolean).length;
    const daily = progress.practice.days[todayKey()] || {};
    const practiceDone = [daily.observe, daily.clean, daily.write, daily.act].filter(Boolean).length;
    const checkinDone = daily.practiceState ? 1 : 0;
    const totalPoints = 8;
    const score = journeyDone + practiceDone + checkinDone;
    return Math.round((score / totalPoints) * 100);
  }

  function renderSessionInfo(session) {
    const locale = document.documentElement.lang === "en-US" ? "en-US" : "vi-VN";
    const plan = planByCode(session.membershipType);
    const planText = plan.tier === "free" ? memberStrings().freePlan : `${session.membershipLabel} ($${plan.priceUsd})`;
    const expireText = plan.tier === "free" ? memberStrings().freeExpires : new Date(session.expiresAt).toLocaleDateString(locale);

    $$("[data-member-email]").forEach((el) => {
      el.textContent = session.email;
    });
    $$("[data-member-plan]").forEach((el) => {
      el.textContent = planText;
    });
    $$("[data-member-expire]").forEach((el) => {
      el.textContent = expireText;
    });
  }

  function renderProfileInfo(session) {
    const profile = getProfileForEmail(session?.email);
    const strings = memberStrings();
    const locale = document.documentElement.lang === "en-US" ? "en-US" : "vi-VN";
    const trackLabel = profile?.practiceTrack === "deep" ? strings.practiceTrackDeep : profile?.practiceTrack === "gentle" ? strings.practiceTrackGentle : "-";
    const reminderLabel = profile?.reminderIntensity === "rhythm"
      ? strings.reminderRhythm
      : profile?.reminderIntensity === "gentle"
        ? strings.reminderGentle
        : profile?.reminderIntensity === "none"
          ? strings.reminderNone
          : "-";
    const pauseLabel = isFutureIso(profile?.reminderPausedUntil)
      ? `${strings.reminderPausedUntil} ${new Date(profile.reminderPausedUntil).toLocaleDateString(locale)}`
      : "-";
    $$("[data-profile-name]").forEach((el) => {
      el.textContent = profile?.fullName || "-";
    });
    $$("[data-profile-state]").forEach((el) => {
      el.textContent = profile?.currentState || "-";
    });
    $$("[data-profile-shift]").forEach((el) => {
      el.textContent = profile?.desiredShift || "-";
    });
    $$("[data-profile-rhythm]").forEach((el) => {
      el.textContent = profile?.companionRhythm || "-";
    });
    $$("[data-profile-track]").forEach((el) => {
      el.textContent = trackLabel;
    });
    $$("[data-profile-reminder]").forEach((el) => {
      el.textContent = reminderLabel;
    });
    $$("[data-profile-reminder-pause]").forEach((el) => {
      el.textContent = pauseLabel;
    });
  }

  function renderProgress() {
    const progress = getProgress();
    const percent = completionPercent(progress);
    $$("[data-progress-percent]").forEach((el) => {
      el.textContent = `${percent}%`;
    });
    $$("[data-progress-bar]").forEach((el) => {
      el.style.width = `${percent}%`;
    });
  }

  function initJourneyPage() {
    const strings = memberStrings();
    const progress = getProgress();

    $$("[data-journey-stage]").forEach((btn) => {
      const stage = btn.getAttribute("data-journey-stage");
      if (progress.journey[stage]) {
        btn.textContent = strings.journeyDone;
        btn.closest("li")?.classList.add("done");
      }

      btn.addEventListener("click", () => {
        progress.journey[stage] = true;
        saveProgress(progress);
        btn.textContent = strings.journeyDone;
        btn.closest("li")?.classList.add("done");
        renderProgress();
      });
    });
  }

  function initPracticePage() {
    const strings = memberStrings();
    const progress = getProgress();
    const key = todayKey();
    const form = $("#practiceCheckinForm");
    const oneLine = $("[data-practice-one-line]");
    const status = $("#practiceCheckinStatus");

    if (!progress.practice.days[key]) {
      progress.practice.days[key] = {
        observe: false,
        clean: false,
        write: false,
        act: false,
        practiceState: "",
        oneLine: "",
        needsHumanReflection: false,
        updatedAt: ""
      };
      saveProgress(progress);
    }

    const today = progress.practice.days[key];

    $$("[data-practice-key]").forEach((input) => {
      const pKey = input.getAttribute("data-practice-key");
      input.checked = Boolean(today[pKey]);
      input.addEventListener("change", () => {
        today[pKey] = input.checked;
        today.updatedAt = new Date().toISOString();
        saveProgress(progress);
        renderProgress();
      });
    });

    if (oneLine) oneLine.value = today.oneLine || "";
    $$('input[name="practiceState"]').forEach((input) => {
      input.checked = input.value === today.practiceState;
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = $('input[name="practiceState"]:checked', form);
      const text = String(oneLine?.value || "").trim();
      if (!selected) {
        setBanner(status, strings.practiceStateRequired, "warning");
        return;
      }
      if (!text) {
        setBanner(status, strings.practiceOneLineRequired, "warning");
        return;
      }
      today.practiceState = selected.value;
      today.oneLine = text;
      today.needsHumanReflection = selected.value === "human_reflection";
      today.updatedAt = new Date().toISOString();
      saveProgress(progress);
      renderProgress();
      setBanner(status, strings.practiceCheckinSaved, "success");
    });
  }

  function initExperiencePage() {
    const strings = memberStrings();
    const progress = getProgress();
    const list = $("#journalList");
    const form = $("#journalForm");
    const textarea = $("#journalText");

    function draw() {
      if (!list) return;
      list.innerHTML = "";
      const notes = progress.experience.notes || [];
      if (!notes.length) {
        list.innerHTML = `<li class="checkItem">${strings.noJournal}</li>`;
        return;
      }
      notes
        .slice()
        .reverse()
        .forEach((item) => {
          const li = document.createElement("li");
          li.className = "checkItem";
          li.textContent = `${item.date} - ${item.text}`;
          list.appendChild(li);
        });
    }

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = (textarea?.value || "").trim();
      if (!text) return;
      if (!progress.experience.notes) progress.experience.notes = [];
      progress.experience.notes.push({ date: todayKey(), text });
      saveProgress(progress);
      textarea.value = "";
      draw();
    });

    draw();
  }

  async function requestMagicLink(payload) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || "Unable to send magic link.");
      error.code = body.code || "MAGIC_REQUEST_FAILED";
      throw error;
    }
    return body;
  }

  async function consumeServerMagicToken(token, nextPath) {
    const response = await fetch("/api/auth/magic-links/consume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        next_path: nextPath || undefined
      })
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || "Magic link was not found.");
      error.code = body.code || "MAGIC_CONSUME_FAILED";
      throw error;
    }

    return body;
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
      const error = new Error(body.message || "Unable to create checkout.");
      error.code = body.code || "CHECKOUT_CREATE_FAILED";
      throw error;
    }
    return body;
  }

  async function createVietQrOrder(payload) {
    const response = await fetch("/api/payments/vietqr/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": randomId("vietqr")
      },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || "Unable to create VietQR order.");
      error.code = body.code || "VIETQR_CREATE_FAILED";
      throw error;
    }
    return body;
  }

  async function markVietQrPending(payload) {
    const response = await fetch("/api/payments/vietqr/mark-pending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.message || "Unable to mark transfer pending.");
      error.code = body.code || "VIETQR_MARK_PENDING_FAILED";
      throw error;
    }
    return body;
  }

  function formatCurrency(amount, currency, localeHint = "vi") {
    const locale = localeHint === "en-US" ? "en-US" : "vi-VN";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: String(currency || "USD").toUpperCase(),
        maximumFractionDigits: currency === "VND" ? 0 : 2
      }).format(Number(amount || 0));
    } catch (_error) {
      return `${Number(amount || 0)} ${String(currency || "").toUpperCase()}`;
    }
  }

  function setBanner(element, message, tone = "info") {
    if (!element) return;
    element.textContent = message;
    element.classList.remove("hidden", "is-success", "is-warning", "is-danger");
    if (tone === "success") element.classList.add("is-success");
    if (tone === "warning") element.classList.add("is-warning");
    if (tone === "danger") element.classList.add("is-danger");
  }

  function attachCopy(button, source) {
    const strings = memberStrings();
    button?.addEventListener("click", async () => {
      const text = typeof source === "function" ? source() : source?.textContent?.trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = strings.copied;
        setTimeout(() => {
          button.textContent = strings.copyAction;
        }, 1200);
      } catch (_error) {
        button.textContent = strings.copyFailed;
      }
    });
  }

  function initJoinPage() {
    const strings = memberStrings();
    const session = getSession();
    const activeBlock = $("#alreadyMember");
    const joinBlock = $("#joinFlow");
    const primaryLink = $("#alreadyMemberPrimary");
    const secondaryLink = $("#alreadyMemberSecondary");

    if (session && activeBlock && joinBlock) {
      activeBlock.classList.remove("hidden");
      joinBlock.classList.add("hidden");
      renderSessionInfo(session);
      if (primaryLink) {
        primaryLink.href = isPaidMembership(session) ? dashboardPathForPath(window.location.pathname) : startPathForPath(window.location.pathname);
        primaryLink.textContent = isPaidMembership(session) ? strings.alreadyPaid : strings.alreadyFree;
      }
      if (secondaryLink) {
        secondaryLink.href = startPathForPath(window.location.pathname);
      }
      return;
    }

    const form = $("#joinForm");
    const emailInput = $("#joinEmail");
    const statusBox = $("#joinStatus");
    const successBox = $("#joinSuccess");
    const previewBox = $("#joinPreview");
    const previewOutput = $("#magicOutput");

    attachCopy($("#copyMagic"), () => previewOutput?.textContent?.trim());

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = (emailInput?.value || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        setBanner(statusBox, strings.invalidEmail, "danger");
        return;
      }

      setBanner(statusBox, strings.joinSending, "warning");
      successBox?.classList.add("hidden");
      previewBox?.classList.add("hidden");

      try {
        const result = await requestMagicLink({
          email,
          locale: document.documentElement.lang === "en-US" ? "en-US" : "vi",
          next_path: startPathForPath(window.location.pathname)
        });

        setBanner(statusBox, strings.joinEmailSent, "success");
        successBox?.classList.remove("hidden");

        if (result.preview_magic_link && previewOutput) {
          previewOutput.textContent = result.preview_magic_link;
          previewBox?.classList.remove("hidden");
          const previewNote = $("#joinPreviewNote");
          if (previewNote) previewNote.textContent = strings.joinPreview;
        }
      } catch (error) {
        setBanner(statusBox, error.message || strings.joinError, "danger");
      }
    });
  }

  async function handleMagicLogin() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("magic");
    if (!token) return false;

    const errorBox = $("#magicError");

    try {
      const serverResult = await consumeServerMagicToken(token, startPathForPath(window.location.pathname));
      const session = createSessionFromServer(serverResult.session);
      renderSessionInfo(session);
      window.location.replace(isPaidMembership(session) ? safeMembersPath(serverResult.next_path, window.location.pathname) : startPathForPath(window.location.pathname));
      return true;
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || memberStrings().magicFailed;
        errorBox.classList.remove("hidden");
      }
      params.delete("magic");
      const cleaned = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", cleaned);
      return false;
    }
  }

  function initStartPage(session) {
    const strings = memberStrings();
    const profileForm = $("#profileForm");
    const profileStatus = $("#profileStatus");
    const profileGate = $("#profileGate");
    const previewBlock = $("#sequencePreview");
    const unlockBlock = $("#unlockCore");
    const paidBlock = $("#paidMemberStart");
    const gateNotice = $("#startGateNotice");
    const unlockStatus = $("#unlockStatus");
    const unlockPayNow = $("#unlockPayNow");
    const startCheckout = $("#startCheckout");
    const territoryInput = $("#payerTerritory");
    const identityRefInput = $("#payerIdRef");
    const providerInput = $("#unlockProvider");
    const internationalProviderField = $("#internationalProviderField");
    const vietqrBox = $("#vietqrBox");
    const vietqrTransferNote = $("#vietqrTransferNote");
    const vietqrAmount = $("#vietqrAmount");
    const vietqrAccountName = $("#vietqrAccountName");
    const vietqrAccountNo = $("#vietqrAccountNo");
    const vietqrBankBin = $("#vietqrBankBin");
    const vietqrImage = $("#vietqrImage");
    const markTransferSent = $("#markTransferSent");
    const confirmUnlock = $("#confirmPaid");
    let currentVietQrOrderId = null;

    const params = new URLSearchParams(window.location.search);
    if (params.get("gate") === "paid" && gateNotice) {
      gateNotice.textContent = strings.gateReason;
      gateNotice.classList.remove("hidden");
    }

    attachCopy($("#copyUpgradeEmail"), () => session.email);

    function profileSnapshot() {
      return getProfileForEmail(session.email) || {
        fullName: "",
        currentState: "",
        desiredShift: "",
        companionRhythm: "",
        practiceTrack: "",
        reminderIntensity: "",
        reminderPausedUntil: ""
      };
    }

    function updateTerritoryUI() {
      const territory = String(territoryInput?.value || "VN").toUpperCase();
      const isVn = territory === "VN";
      internationalProviderField?.classList.toggle("hidden", isVn);
      if (isVn) {
        unlockPayNow?.classList.add("hidden");
      }
    }

    function draw() {
      const profile = profileSnapshot();
      const complete = profileIsComplete(profile);
      const paid = isPaidMembership(session);

      const fullName = $("#profileFullName");
      const currentState = $("#profileCurrentState");
      const desiredShift = $("#profileDesiredShift");
      const companionRhythm = $("#profileCompanionRhythm");
      const practiceTrack = $("#profilePracticeTrack");
      const reminderIntensity = $("#profileReminderIntensity");
      const reminderPause = $("#profileReminderPause");

      if (fullName && !fullName.value) fullName.value = profile.fullName || "";
      if (currentState && !currentState.value) currentState.value = profile.currentState || "";
      if (desiredShift && !desiredShift.value) desiredShift.value = profile.desiredShift || "";
      if (companionRhythm && !companionRhythm.value) companionRhythm.value = profile.companionRhythm || "";
      if (practiceTrack && !practiceTrack.value) practiceTrack.value = profile.practiceTrack || "";
      if (reminderIntensity && !reminderIntensity.value) reminderIntensity.value = profile.reminderIntensity || "";
      if (reminderPause) reminderPause.checked = isFutureIso(profile.reminderPausedUntil);

      profileGate?.classList.remove("hidden");
      previewBlock?.classList.toggle("hidden", !complete);
      unlockBlock?.classList.toggle("hidden", !complete || paid);
      paidBlock?.classList.toggle("hidden", !paid);

      renderProfileInfo(session);
      renderSessionInfo(session);
      updateTerritoryUI();
    }

    profileForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = saveProfileForEmail(session.email, {
        fullName: $("#profileFullName")?.value,
        currentState: $("#profileCurrentState")?.value,
        desiredShift: $("#profileDesiredShift")?.value,
        companionRhythm: $("#profileCompanionRhythm")?.value,
        practiceTrack: $("#profilePracticeTrack")?.value,
        reminderIntensity: $("#profileReminderIntensity")?.value,
        reminderPausedUntil: $("#profileReminderPause")?.checked
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : ""
      });

      renderProfileInfo(session);
      if (profileIsComplete(profile)) {
        setBanner(profileStatus, strings.profileSaved, "success");
      }
      draw();
    });

    territoryInput?.addEventListener("change", updateTerritoryUI);

    startCheckout?.addEventListener("click", async () => {
      const profile = profileSnapshot();
      if (!profileIsComplete(profile)) {
        setBanner(unlockStatus, strings.gateReason, "warning");
        return;
      }

      const territory = String(territoryInput?.value || "VN").toUpperCase();
      const identityRef = String(identityRefInput?.value || "").trim();
      const locale = document.documentElement.lang === "en-US" ? "en-US" : "vi";
      setBanner(unlockStatus, strings.checkoutCreating, "warning");
      unlockPayNow?.classList.add("hidden");

      try {
        if (territory === "VN") {
          const checkout = await createVietQrOrder({
            email: session.email,
            plan_code: "year1",
            locale,
            identity_country: "VN",
            identity_ref: identityRef || undefined,
            next_path: startPathForPath(window.location.pathname)
          });
          currentVietQrOrderId = checkout.internal_order_id;
          vietqrTransferNote.textContent = checkout.manual_transfer?.transfer_note || "-";
          vietqrAmount.textContent = formatCurrency(checkout.amount, checkout.currency, locale);
          vietqrAccountName.textContent = checkout.manual_transfer?.account_name || "-";
          vietqrAccountNo.textContent = checkout.manual_transfer?.account_no || "-";
          vietqrBankBin.textContent = checkout.manual_transfer?.bank_bin || "-";
          if (checkout.manual_transfer?.qr_url) {
            vietqrImage.src = checkout.manual_transfer.qr_url;
          }
          vietqrBox?.classList.remove("hidden");
          setBanner(unlockStatus, strings.paymentReminder, "success");
          return;
        }

        const provider = String(providerInput?.value || "stripe").toLowerCase();
        const checkout = await createCheckout({
          provider,
          email: session.email,
          plan_code: "year1",
          locale,
          identity_country: "INTL",
          identity_ref: identityRef || undefined,
          next_path: startPathForPath(window.location.pathname)
        });
        if (!checkout.checkout_url) {
          throw new Error(strings.checkoutFailed);
        }
        unlockPayNow.href = checkout.checkout_url;
        unlockPayNow.classList.remove("hidden");
        setBanner(unlockStatus, strings.checkoutRedirecting, "success");
        window.location.href = checkout.checkout_url;
      } catch (error) {
        const message = String(error?.message || "");
        if (message.includes("requires")) {
          setBanner(unlockStatus, strings.checkoutRailError, "danger");
          return;
        }
        setBanner(unlockStatus, message || strings.checkoutFailed, "danger");
      }
    });

    markTransferSent?.addEventListener("click", async () => {
      if (!currentVietQrOrderId) {
        setBanner(unlockStatus, strings.transferMarkFailed, "danger");
        return;
      }
      try {
        await markVietQrPending({
          internal_order_id: currentVietQrOrderId,
          email: session.email
        });
        setBanner(unlockStatus, strings.transferMarked, "success");
      } catch (error) {
        setBanner(unlockStatus, error.message || strings.transferMarkFailed, "danger");
      }
    });

    confirmUnlock?.addEventListener("click", () => {
      setBanner(unlockStatus, strings.adminConfirmHint, "warning");
    });

    const unlockNote = $("#unlockReminder");
    if (unlockNote) unlockNote.textContent = strings.paymentReminder;

    draw();
  }

  function attachLogout() {
    const logout = $("#logoutBtn");
    logout?.addEventListener("click", () => {
      clearSession();
      window.location.href = joinPathForPath(window.location.pathname);
    });
  }

  function redirectFreeMemberToStart(session) {
    if (!session || isPaidMembership(session)) return false;
    const pathname = window.location.pathname;
    const startPath = startPathForPath(pathname);

    if (!isMembersPath(pathname) || isPublicMembersLanding(pathname) || pathname === startPath) {
      return false;
    }

    window.location.replace(`${startPath}?gate=paid`);
    return true;
  }

  function initMembersArea() {
    const session = getSession();
    if (!session) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `${joinPathForPath(window.location.pathname)}?next=${next}`;
      return;
    }

    if (redirectFreeMemberToStart(session)) return;

    renderSessionInfo(session);
    renderProfileInfo(session);
    renderProgress();
    attachLogout();

    const page = document.body.getAttribute("data-page");
    if (page === "members-start") initStartPage(session);
    if (page === "members-journey") initJourneyPage();
    if (page === "members-practice") initPracticePage();
    if (page === "members-experience") initExperiencePage();
  }

  async function init() {
    const redirected = await handleMagicLogin();
    if (redirected) return;

    const page = document.body.getAttribute("data-page");
    if (page === "join") {
      initJoinPage();
      return;
    }

    if (isMembersPath(window.location.pathname) && !isPublicMembersLanding(window.location.pathname)) {
      initMembersArea();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
})();
