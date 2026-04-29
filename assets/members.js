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
      durationDays: 365,
      tier: "paid"
    },
    year2: {
      code: "year2",
      label: "Đồng hành chuyên sâu",
      priceUsd: 60,
      durationDays: 365,
      tier: "paid"
    },
    year3: {
      code: "year3",
      label: "Chương trình chuyên sâu",
      priceUsd: 99,
      durationDays: 365,
      tier: "paid"
    }
  };

  const PAYPAL_BUSINESS = "pay@nguyenlananh.com";

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
        paymentReminder: "Open PayPal, finish the 2 USD step, then confirm here to unlock the full paid member benefits.",
        alreadyFree: "Continue free companionship",
        alreadyPaid: "Open paid member dashboard"
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
      paymentReminder: "Mở PayPal, hoàn tất bước 2 USD, rồi quay lại bấm xác nhận để mở toàn bộ quyền lợi của gói đã trả phí.",
      alreadyFree: "Tiếp tục đồng hành miễn phí",
      alreadyPaid: "Mở dashboard thành viên đã trả phí"
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

  function saveProfileForEmail(email, profile) {
    if (!email) return null;
    const store = getProfilesStore();
    store[email] = {
      fullName: String(profile.fullName || "").trim(),
      currentState: String(profile.currentState || "").trim(),
      desiredShift: String(profile.desiredShift || "").trim(),
      companionRhythm: String(profile.companionRhythm || "").trim(),
      updatedAt: new Date().toISOString()
    };
    saveProfilesStore(store);
    return store[email];
  }

  function profileIsComplete(profile) {
    if (!profile) return false;
    return ["fullName", "currentState", "desiredShift", "companionRhythm"].every((key) => String(profile[key] || "").trim().length > 0);
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

  function upgradeCurrentSession(planCode = "year1") {
    const session = getSession();
    if (!session) return null;
    const plan = planByCode(planCode);

    return writeSession({
      ...session,
      membershipType: plan.code,
      membershipLabel: plan.label,
      expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  function buildPayPalUrl(plan, email) {
    const item = `Nguyenlananh Membership ${plan.label}`;
    const custom = `${email}|${plan.code}`;
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: PAYPAL_BUSINESS,
      item_name: item,
      currency_code: "USD",
      amount: String(plan.priceUsd),
      custom
    });
    return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
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
    const totalPoints = 7;
    const score = journeyDone + practiceDone;
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
    const progress = getProgress();
    const key = todayKey();

    if (!progress.practice.days[key]) {
      progress.practice.days[key] = {
        observe: false,
        clean: false,
        write: false,
        act: false
      };
      saveProgress(progress);
    }

    $$("[data-practice-key]").forEach((input) => {
      const pKey = input.getAttribute("data-practice-key");
      input.checked = Boolean(progress.practice.days[key][pKey]);
      input.addEventListener("change", () => {
        progress.practice.days[key][pKey] = input.checked;
        saveProgress(progress);
        renderProgress();
      });
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
    const unlockPayNow = $("#unlockPayNow");
    const confirmUnlock = $("#confirmPaid");
    const unlockStatus = $("#unlockStatus");

    const params = new URLSearchParams(window.location.search);
    if (params.get("gate") === "paid" && gateNotice) {
      gateNotice.textContent = strings.gateReason;
      gateNotice.classList.remove("hidden");
    }

    attachCopy($("#copyUpgradeEmail"), () => session.email);

    function draw() {
      const profile = getProfileForEmail(session.email) || {
        fullName: "",
        currentState: "",
        desiredShift: "",
        companionRhythm: ""
      };
      const complete = profileIsComplete(profile);
      const paid = isPaidMembership(session);

      const fullName = $("#profileFullName");
      const currentState = $("#profileCurrentState");
      const desiredShift = $("#profileDesiredShift");
      const companionRhythm = $("#profileCompanionRhythm");

      if (fullName && !fullName.value) fullName.value = profile.fullName || "";
      if (currentState && !currentState.value) currentState.value = profile.currentState || "";
      if (desiredShift && !desiredShift.value) desiredShift.value = profile.desiredShift || "";
      if (companionRhythm && !companionRhythm.value) companionRhythm.value = profile.companionRhythm || "";

      profileGate?.classList.toggle("hidden", complete);
      previewBlock?.classList.toggle("hidden", !complete);
      unlockBlock?.classList.toggle("hidden", !complete || paid);
      paidBlock?.classList.toggle("hidden", !paid);

      if (unlockPayNow) {
        unlockPayNow.href = buildPayPalUrl(planByCode("year1"), session.email);
      }

      renderProfileInfo(session);
      renderSessionInfo(session);
    }

    profileForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = saveProfileForEmail(session.email, {
        fullName: $("#profileFullName")?.value,
        currentState: $("#profileCurrentState")?.value,
        desiredShift: $("#profileDesiredShift")?.value,
        companionRhythm: $("#profileCompanionRhythm")?.value
      });

      renderProfileInfo(session);
      if (profileIsComplete(profile)) {
        setBanner(profileStatus, strings.profileSaved, "success");
      }
      draw();
    });

    confirmUnlock?.addEventListener("click", () => {
      const updated = upgradeCurrentSession("year1");
      if (!updated) return;
      session = updated;
      setBanner(unlockStatus, strings.unlockReady, "success");
      draw();
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
