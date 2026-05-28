(() => {
  const STORAGE = {
    session: "nla_member_session",
    progress: "nla_member_progress",
    profiles: "nla_member_profiles",
    reflectionHandoffs: "nla_member_reflection_handoffs"
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
        practiceCheckinSaved: "Your check-in has been saved.",
        reflectionRequestSaved: "Your check-in has been saved. Open the reflection handoff so a real person can read the true point.",
        reflectionReadyTitle: "Human reflection is ready",
        reflectionReadyBody: "If you want a real person to reflect back, move the true point into the reflection handoff. Keep it short, concrete, and honest.",
        reflectionReadyAction: "Open reflection handoff",
        avoidingSupportTitle: "Name the point you are avoiding",
        avoidingSupportBody: "You do not need to solve it today. Name the point, keep one smaller step, and ask for human reflection if the same point keeps repeating.",
        avoidingSupportAction: "Open reflection handoff",
        reflectionHandoffSaved: "Your reflection handoff has been saved.",
        reflectionHandoffCopyFail: "Unable to copy the reflection handoff right now."
        ,
        memberSnapshotReady: "Your member snapshot packet is ready.",
        memberSnapshotCopyFail: "Unable to copy the member snapshot packet right now.",
        pilotPacketReady: "Your pilot readiness packet is ready.",
        pilotPacketCopyFail: "Unable to copy the pilot readiness packet right now.",
        handoffReadyStatus: "A saved 3-line handoff already exists for this point.",
        handoffNeedsUpdateStatus: "A saved handoff exists, but it does not match today's point yet.",
        handoffMissingStatus: "No saved handoff exists yet for today's point.",
        handoffOpenLabel: "Open handoff",
        handoffReviewLabel: "Review pilot readiness"
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
      practiceCheckinSaved: "Check-in của bạn đã được lưu.",
      reflectionRequestSaved: "Check-in đã được lưu. Hãy mở bước bàn giao phản hồi người thật để một người thật đọc đúng điểm này.",
      reflectionReadyTitle: "Bước phản hồi người thật đã sẵn sàng",
      reflectionReadyBody: "Nếu bạn muốn một người thật phản hồi, hãy chuyển điểm thật hôm nay sang bước bàn giao. Giữ ngắn, cụ thể và thật.",
      reflectionReadyAction: "Mở bàn giao phản hồi",
      avoidingSupportTitle: "Gọi tên đúng điểm đang né",
      avoidingSupportBody: "Hôm nay chưa cần giải quyết hết. Chỉ cần gọi tên điểm né, giữ một bước nhỏ hơn, và xin phản hồi người thật nếu điểm này lặp lại.",
      avoidingSupportAction: "Mở bàn giao phản hồi",
      reflectionHandoffSaved: "Reflection handoff của bạn đã được lưu.",
      reflectionHandoffCopyFail: "Chưa copy được reflection handoff lúc này.",
      memberSnapshotReady: "Member snapshot packet của bạn đã sẵn sàng.",
      memberSnapshotCopyFail: "Chưa copy được member snapshot packet lúc này.",
      pilotPacketReady: "Pilot readiness packet của bạn đã sẵn sàng.",
      pilotPacketCopyFail: "Chưa copy được pilot readiness packet lúc này.",
      handoffReadyStatus: "Đã có handoff 3 dòng được lưu cho đúng điểm này.",
      handoffNeedsUpdateStatus: "Đã có handoff được lưu, nhưng chưa khớp với điểm hôm nay.",
      handoffMissingStatus: "Chưa có handoff nào được lưu cho điểm hôm nay.",
      handoffOpenLabel: "Mở handoff",
      handoffReviewLabel: "Xem readiness pilot"
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

  function getReflectionHandoffsStore() {
    return readJSON(STORAGE.reflectionHandoffs, {});
  }

  function saveReflectionHandoffsStore(store) {
    writeJSON(STORAGE.reflectionHandoffs, store);
  }

  function getReflectionHandoffForEmail(email) {
    if (!email) return null;
    const store = getReflectionHandoffsStore();
    return store[email] || null;
  }

  function saveReflectionHandoffForEmail(email, handoff) {
    if (!email) return null;
    const store = getReflectionHandoffsStore();
    store[email] = {
      line1: String(handoff.line1 || "").trim(),
      line2: String(handoff.line2 || "").trim(),
      line3: String(handoff.line3 || "").trim(),
      sourceState: String(handoff.sourceState || "").trim(),
      sourceDay: String(handoff.sourceDay || "").trim(),
      sourceOneLine: String(handoff.sourceOneLine || "").trim(),
      updatedAt: new Date().toISOString()
    };
    saveReflectionHandoffsStore(store);
    return store[email];
  }

  function reflectionHandoffMatchesLatest(handoff, latest) {
    if (!handoff || !latest) return false;
    if (handoff.sourceDay && latest.dateKey && handoff.sourceDay === latest.dateKey) return true;
    if (handoff.sourceOneLine && latest.oneLine && handoff.sourceOneLine === latest.oneLine) return true;
    return false;
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

  async function refreshSessionFromServer() {
    try {
      const response = await fetch("/api/auth/session", { method: "GET", headers: { Accept: "application/json" } });
      if (!response.ok) return getSession();
      const data = await response.json().catch(() => ({}));
      if (data.ok && data.session) {
        return createSessionFromServer(data.session);
      }
    } catch (_error) {
      // Fall back to localStorage
    }
    return getSession();
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

  function getLatestPracticeEntry(progress = getProgress()) {
    const days = Object.entries(progress?.practice?.days || {});
    if (!days.length) return null;
    const [dateKey, day] = days
      .slice()
      .sort((left, right) => {
        const leftTime = new Date(left[1]?.updatedAt || left[0]).getTime();
        const rightTime = new Date(right[1]?.updatedAt || right[0]).getTime();
        return rightTime - leftTime;
      })[0];
    return {
      dateKey,
      ...(day || {})
    };
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

  function latestStateLabel(latestState, isEnglish) {
    return latestState === "human_reflection"
      ? (isEnglish ? "Human reflection" : "Cần người thật phản hồi")
      : latestState === "avoiding"
        ? (isEnglish ? "Avoiding" : "Đang né")
        : latestState === "smaller_step"
          ? (isEnglish ? "Smaller step" : "Bước nhỏ hơn")
          : latestState === "done"
            ? (isEnglish ? "Done" : "Đã làm")
            : (isEnglish ? "No check-in yet" : "Chưa có check-in");
  }

  function initDashboardPage(session) {
    const strings = memberStrings();
    const status = $("#member-ops-status");
    const summary = $("#member-ops-summary");
    const next = $("#member-ops-next");
    const output = $("#memberOpsSnapshotOutput");
    const copyBtn = $("#memberOpsSnapshotCopy");
    const packetStatus = $("#memberOpsSnapshotStatus");
    if (!status && !summary && !next) return;

    const isEnglish = document.documentElement.lang === "en-US";
    const profile = getProfileForEmail(session?.email);
    const progress = getProgress();
    const latest = getLatestPracticeEntry(progress);
    const handoff = getReflectionHandoffForEmail(session?.email);
    const profileReady = profileIsComplete(profile);
    const paused = isFutureIso(profile?.reminderPausedUntil);
    const latestState = latest?.practiceState || "";
    const latestLine = String(latest?.oneLine || "").trim();
    const hasHonestCheckin = Boolean(latestState && latestLine);
    const hasSavedHandoff = Boolean(handoff && (handoff.line1 || handoff.line2 || handoff.line3));

    let statusText = "";
    let actions = [];

    if (!profileReady) {
      statusText = isEnglish
        ? "Your base is still incomplete. Finish the companion profile so the next steps are honest and usable."
        : "Nền của bạn còn thiếu. Hãy hoàn thiện hồ sơ đồng hành để các bước tiếp theo thật và dùng được.";
      actions = [
        { href: isEnglish ? "/en/members/start/" : "/members/start/", label: isEnglish ? "Complete profile" : "Hoàn thiện profile", primary: true }
      ];
    } else if (!hasHonestCheckin) {
      statusText = isEnglish
        ? "Your profile is ready. The next real move is one honest check-in."
        : "Profile của bạn đã đủ. Bước thật kế tiếp là một check-in trung thực.";
      actions = [
        { href: isEnglish ? "/en/members/practice/" : "/members/practice/", label: isEnglish ? "Open check-in" : "Mở check-in", primary: true }
      ];
    } else if (latestState === "human_reflection" && !hasSavedHandoff) {
      statusText = isEnglish
        ? "You asked for human reflection, but the 3-line handoff is still empty."
        : "Bạn đã xin phản hồi người thật, nhưng handoff 3 dòng vẫn còn trống.";
      actions = [
        { href: isEnglish ? "/en/members/reflection/" : "/members/reflection/", label: isEnglish ? "Write handoff" : "Viết handoff", primary: true },
        { href: isEnglish ? "/en/members/practice/" : "/members/practice/", label: isEnglish ? "Return to check-in" : "Quay lại check-in" }
      ];
    } else if (paused) {
      statusText = isEnglish
        ? "Your reminder pause is still active. Keep the rhythm light until that pause clears."
        : "Pause reminder của bạn vẫn còn hiệu lực. Hãy giữ nhịp nhẹ cho tới khi khoảng tạm dừng này qua đi.";
      actions = [
        { href: isEnglish ? "/en/members/start/" : "/members/start/", label: isEnglish ? "Review reminder settings" : "Xem lại mức nhắc", primary: true },
        { href: isEnglish ? "/en/members/practice/" : "/members/practice/", label: isEnglish ? "Keep a small step" : "Giữ một bước nhỏ" }
      ];
    } else if (latestState === "avoiding") {
      statusText = isEnglish
        ? "You are still in the field, but the latest signal says avoiding. Keep the next step very small."
        : "Bạn vẫn đang ở trong trường thực hành, nhưng tín hiệu gần nhất đang là né. Hãy giữ bước kế tiếp thật nhỏ.";
      actions = [
        { href: isEnglish ? "/en/members/practice/" : "/members/practice/", label: isEnglish ? "Keep today's step small" : "Giữ bước hôm nay thật nhỏ", primary: true },
        { href: isEnglish ? "/en/members/reflection/" : "/members/reflection/", label: isEnglish ? "Ask for reflection" : "Xin phản hồi" }
      ];
    } else {
      statusText = isEnglish
        ? "Your current base is coherent: profile, check-in, and next-step rhythm are aligned."
        : "Nền hiện tại của bạn đang khá liền mạch: profile, check-in, và nhịp bước tiếp theo đang khớp nhau.";
      actions = [
        { href: isEnglish ? "/en/members/pilot/" : "/members/pilot/", label: isEnglish ? "Review pilot readiness" : "Xem readiness pilot", primary: true },
        { href: isEnglish ? "/en/members/practice/" : "/members/practice/", label: isEnglish ? "Keep daily rhythm" : "Giữ nhịp hằng ngày" }
      ];
    }

    if (status) {
      status.textContent = statusText;
    }

    if (summary) {
      summary.innerHTML = `<ul class="checkList">
        <li class="checkItem"><input type="checkbox" disabled ${profileReady ? "checked" : ""}><div><strong>${isEnglish ? "Profile is complete" : "Profile đã đủ"}</strong><p class="note">${safeText((profile?.fullName || session?.email || "-"))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${hasHonestCheckin ? "checked" : ""}><div><strong>${isEnglish ? "Honest check-in exists" : "Đã có check-in thật"}</strong><p class="note">${safeText(latest?.dateKey || "-")} • ${safeText(latestStateLabel(latestState, isEnglish))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${hasSavedHandoff ? "checked" : ""}><div><strong>${isEnglish ? "Reflection handoff is saved" : "Đã lưu reflection handoff"}</strong><p class="note">${safeText(hasSavedHandoff ? (handoff?.updatedAt || "-") : (isEnglish ? "No saved handoff yet" : "Chưa có handoff nào được lưu"))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${!paused ? "checked" : ""}><div><strong>${isEnglish ? "Reminder pause is clear" : "Không còn pause reminder"}</strong><p class="note">${safeText(paused ? (isEnglish ? "Pause is still active" : "Pause vẫn đang còn hiệu lực") : (isEnglish ? "No active pause" : "Không có pause đang mở"))}</p></div></li>
      </ul>`;
    }

    if (next) {
      next.innerHTML = actions.map((action) =>
        `<a class="${action.primary ? "cta" : "ghost"}" href="${action.href}">${safeText(action.label)}</a>`
      ).join("");
    }

    const packet = {
      packet_type: "member_ops_snapshot",
      email: session?.email || "",
      fullName: profile?.fullName || "",
      profileReady,
      reminderPausedUntil: profile?.reminderPausedUntil || "",
      latestPracticeState: latestState,
      latestPracticeDay: latest?.dateKey || "",
      latestPracticeLine: latestLine,
      hasSavedHandoff,
      currentState: profile?.currentState || "",
      updatedAt: new Date().toISOString()
    };

    if (output) {
      output.value = JSON.stringify(packet, null, 2);
    }
    if (packetStatus) {
      packetStatus.textContent = strings.memberSnapshotReady;
    }
    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output?.value || "");
        setBanner(packetStatus, strings.copied, "success");
      } catch (_error) {
        setBanner(packetStatus, strings.memberSnapshotCopyFail, "danger");
      }
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
    const reflectionPanel = $("[data-practice-reflection-panel]");
    const reflectionTitle = $("[data-practice-reflection-title]");
    const reflectionBody = $("[data-practice-reflection-body]");
    const reflectionAction = $("[data-practice-reflection-action]");
    const handoffStatus = $("[data-practice-handoff-status]");
    const handoffActions = $("[data-practice-handoff-actions]");

    function reflectionPath() {
      return isEnglishPath(window.location.pathname) ? "/en/members/reflection/" : "/members/reflection/";
    }

    function pilotPath() {
      return isEnglishPath(window.location.pathname) ? "/en/members/pilot/" : "/members/pilot/";
    }

    function updateHandoffStatus(state) {
      if (!handoffStatus && !handoffActions) return;
      const session = getSession();
      const handoff = getReflectionHandoffForEmail(session?.email);
      const latest = progress.practice.days[key];
      const matchesLatest = reflectionHandoffMatchesLatest(handoff, {
        dateKey: key,
        oneLine: String(latest?.oneLine || "").trim()
      });

      if (handoffStatus) {
        if ((state === "human_reflection" || state === "avoiding") && handoff && matchesLatest) {
          handoffStatus.textContent = strings.handoffReadyStatus;
        } else if ((state === "human_reflection" || state === "avoiding") && handoff) {
          handoffStatus.textContent = strings.handoffNeedsUpdateStatus;
        } else if (state === "human_reflection" || state === "avoiding") {
          handoffStatus.textContent = strings.handoffMissingStatus;
        } else {
          handoffStatus.textContent = "";
        }
      }

      if (handoffActions) {
        if (state === "human_reflection" || state === "avoiding") {
          handoffActions.innerHTML = `<a class="ghost" href="${reflectionPath()}">${strings.handoffOpenLabel}</a><a class="ghost" href="${pilotPath()}">${strings.handoffReviewLabel}</a>`;
        } else {
          handoffActions.innerHTML = "";
        }
      }
    }

    function updateReflectionPanel(state) {
      if (!reflectionPanel) return;
      const activeState = state || "";
      if (!activeState) {
        reflectionPanel.classList.add("hidden");
        updateHandoffStatus("");
        return;
      }

      if (activeState === "human_reflection") {
        reflectionTitle.textContent = strings.reflectionReadyTitle;
        reflectionBody.textContent = strings.reflectionReadyBody;
        reflectionAction.textContent = strings.reflectionReadyAction;
        reflectionAction.setAttribute("href", reflectionPath());
        reflectionPanel.classList.remove("hidden");
        updateHandoffStatus(activeState);
        return;
      }

      if (activeState === "avoiding") {
        reflectionTitle.textContent = strings.avoidingSupportTitle;
        reflectionBody.textContent = strings.avoidingSupportBody;
        reflectionAction.textContent = strings.avoidingSupportAction;
        reflectionAction.setAttribute("href", reflectionPath());
        reflectionPanel.classList.remove("hidden");
        updateHandoffStatus(activeState);
        return;
      }

      reflectionPanel.classList.add("hidden");
      updateHandoffStatus("");
    }

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
      input.addEventListener("change", () => {
        updateReflectionPanel(input.checked ? input.value : "");
      });
    });
    updateReflectionPanel(today.practiceState);

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
      updateReflectionPanel(selected.value);
      setBanner(
        status,
        selected.value === "human_reflection" ? strings.reflectionRequestSaved : strings.practiceCheckinSaved,
        "success"
      );
      updateHandoffStatus(selected.value);
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

  function initPilotPage(session) {
    const strings = memberStrings();
    const status = $("#pilot-readiness-status");
    const summary = $("#pilot-readiness-summary");
    const next = $("#pilot-readiness-next");
    const output = $("#pilotReadinessOutput");
    const copyBtn = $("#pilotReadinessCopy");
    const packetStatus = $("#pilotReadinessPacketStatus");
    if (!status && !summary && !next) return;

    const isEnglish = document.documentElement.lang === "en-US";
    const profile = getProfileForEmail(session?.email);
    const progress = getProgress();
    const latest = getLatestPracticeEntry(progress);
    const readyProfile = profileIsComplete(profile);
    const paused = isFutureIso(profile?.reminderPausedUntil);
    const latestState = latest?.practiceState || "";
    const latestLine = String(latest?.oneLine || "").trim();
    const hasHonestCheckin = Boolean(latestState && latestLine);

    let statusText = "";
    let nextActions = [];

    if (!readyProfile) {
      statusText = isEnglish
        ? "Your pilot base is not ready yet. Complete your companion profile first."
        : "Nền để vào pilot của bạn chưa đủ. Hãy hoàn thiện hồ sơ đồng hành trước.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/start/" : "/members/start/",
          label: isEnglish ? "Complete profile" : "Hoàn thiện profile",
          primary: true
        }
      ];
    } else if (!hasHonestCheckin) {
      statusText = isEnglish
        ? "Your profile is ready, but you still need one honest check-in before the pilot rhythm opens."
        : "Profile của bạn đã đủ, nhưng bạn còn cần một check-in thật trước khi nhịp pilot mở ra.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/practice/" : "/members/practice/",
          label: isEnglish ? "Open check-in" : "Mở check-in",
          primary: true
        }
      ];
    } else if (latestState === "human_reflection") {
      statusText = isEnglish
        ? "Your latest signal asks for a real person. Use the reflection handoff before entering the pilot rhythm."
        : "Tín hiệu gần nhất của bạn đang xin một người thật phản hồi. Hãy đi qua bước reflection trước khi vào nhịp pilot.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/reflection/" : "/members/reflection/",
          label: isEnglish ? "Open reflection" : "Mở reflection",
          primary: true
        },
        {
          href: isEnglish ? "/en/members/practice/" : "/members/practice/",
          label: isEnglish ? "Return to check-in" : "Quay lại check-in"
        }
      ];
    } else if (paused) {
      statusText = isEnglish
        ? "You are currently on a reminder pause. Respect that pause before joining the pilot rhythm."
        : "Bạn đang ở trong giai đoạn tạm dừng nhắc. Hãy tôn trọng nhịp tạm dừng đó trước khi vào pilot.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/start/" : "/members/start/",
          label: isEnglish ? "Review reminder settings" : "Xem lại mức nhắc",
          primary: true
        },
        {
          href: isEnglish ? "/en/members/practice/" : "/members/practice/",
          label: isEnglish ? "Keep a small step" : "Giữ một bước nhỏ"
        }
      ];
    } else if (latestState === "avoiding") {
      statusText = isEnglish
        ? "You have the base for pilot review, but your latest signal says you are avoiding. Keep the next step small and honest."
        : "Bạn đã có nền để được rà vào pilot, nhưng tín hiệu gần nhất cho thấy bạn đang né. Hãy giữ bước tiếp theo nhỏ và thật.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/practice/" : "/members/practice/",
          label: isEnglish ? "Keep the next check-in small" : "Giữ check-in tiếp theo thật nhỏ",
          primary: true
        },
        {
          href: isEnglish ? "/en/members/reflection/" : "/members/reflection/",
          label: isEnglish ? "Ask for reflection" : "Xin phản hồi"
        }
      ];
    } else {
      statusText = isEnglish
        ? "Your base is ready for quiet pilot review when the operations team opens the next 14-day group."
        : "Nền của bạn đã sẵn để được rà vào pilot yên khi đội vận hành mở nhóm 14 ngày tiếp theo.";
      nextActions = [
        {
          href: isEnglish ? "/en/members/practice/" : "/members/practice/",
          label: isEnglish ? "Keep daily rhythm" : "Giữ nhịp hằng ngày",
          primary: true
        },
        {
          href: isEnglish ? "/en/members/circle/" : "/members/circle/",
          label: isEnglish ? "View quiet circle" : "Xem nhóm nhỏ"
        }
      ];
    }

    if (status) {
      status.textContent = statusText;
    }

    if (summary) {
      const latestStateLabel = latestState === "human_reflection"
        ? (isEnglish ? "Human reflection" : "Cần người thật phản hồi")
        : latestState === "avoiding"
          ? (isEnglish ? "Avoiding" : "Đang né")
          : latestState === "smaller_step"
            ? (isEnglish ? "Smaller step" : "Bước nhỏ hơn")
            : latestState === "done"
              ? (isEnglish ? "Done" : "Đã làm")
              : (isEnglish ? "No check-in yet" : "Chưa có check-in");

      summary.innerHTML = `<ul class="checkList">
        <li class="checkItem"><input type="checkbox" disabled ${readyProfile ? "checked" : ""}><div><strong>${isEnglish ? "Profile is complete" : "Profile đã đủ"}</strong><p class="note">${safeText((profile?.fullName || session?.email || "-"))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${hasHonestCheckin ? "checked" : ""}><div><strong>${isEnglish ? "One honest check-in exists" : "Đã có một check-in thật"}</strong><p class="note">${safeText(latest?.dateKey || "-")} • ${safeText(latestStateLabel)}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${!paused ? "checked" : ""}><div><strong>${isEnglish ? "Reminder pause is clear" : "Không còn pause reminder"}</strong><p class="note">${safeText(paused ? (isEnglish ? "Pause is still active" : "Pause vẫn đang còn hiệu lực") : (isEnglish ? "No active pause" : "Không có pause đang mở"))}</p></div></li>
      </ul>`;
    }

    if (next) {
      next.innerHTML = nextActions.map((action) => (
        `<a class="${action.primary ? "cta" : "ghost"}" href="${action.href}">${safeText(action.label)}</a>`
      )).join("");
    }

    const packet = {
      packet_type: "member_pilot_readiness",
      email: session?.email || "",
      fullName: profile?.fullName || "",
      practiceTrack: profile?.practiceTrack || "",
      reminderIntensity: profile?.reminderIntensity || "",
      reminderPausedUntil: profile?.reminderPausedUntil || "",
      profileReady: readyProfile,
      latestPracticeState: latestState,
      latestPracticeDay: latest?.dateKey || "",
      latestPracticeLine: latestLine,
      currentState: profile?.currentState || "",
      updatedAt: new Date().toISOString()
    };

    if (output) {
      output.value = JSON.stringify(packet, null, 2);
    }

    if (packetStatus) {
      packetStatus.textContent = strings.pilotPacketReady;
    }

    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output?.value || "");
        setBanner(packetStatus, strings.copied, "success");
      } catch (_error) {
        setBanner(packetStatus, strings.pilotPacketCopyFail, "danger");
      }
    });
  }

  function initReflectionPage(session) {
    const strings = memberStrings();
    const form = $("#reflectionHandoffForm");
    const line1 = $("#reflectionLine1");
    const line2 = $("#reflectionLine2");
    const line3 = $("#reflectionLine3");
    const status = $("#reflectionHandoffStatus");
    const output = $("#reflectionHandoffOutput");
    const copyBtn = $("#reflectionHandoffCopy");
    if (!form || !line1 || !line2 || !line3 || !output) return;

    const progress = getProgress();
    const latest = getLatestPracticeEntry(progress);
    const existing = getReflectionHandoffForEmail(session?.email);

    if (!line1.value) {
      line1.value = existing?.line1 || (latest?.practiceState === "avoiding"
        ? (latest?.oneLine || "")
        : "");
    }
    if (!line2.value) {
      line2.value = existing?.line2 || (latest?.practiceState === "smaller_step"
        ? (latest?.oneLine || "")
        : "");
    }
    if (!line3.value) {
      line3.value = existing?.line3 || (latest?.practiceState === "human_reflection"
        ? (latest?.oneLine || "")
        : "");
    }

    function buildPacket(saved) {
      return {
        packet_type: "member_reflection_handoff",
        email: session?.email || "",
        track: getProfileForEmail(session?.email)?.practiceTrack || "",
        reminderIntensity: getProfileForEmail(session?.email)?.reminderIntensity || "",
        sourceState: saved?.sourceState || latest?.practiceState || "",
        sourceDay: saved?.sourceDay || latest?.dateKey || "",
        sourceOneLine: saved?.sourceOneLine || latest?.oneLine || "",
        line1: saved?.line1 || "",
        line2: saved?.line2 || "",
        line3: saved?.line3 || "",
        updatedAt: saved?.updatedAt || ""
      };
    }

    function renderPacket(packet) {
      output.value = JSON.stringify(packet, null, 2);
    }

    renderPacket(buildPacket(existing));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const saved = saveReflectionHandoffForEmail(session?.email, {
        line1: line1.value,
        line2: line2.value,
        line3: line3.value,
        sourceState: latest?.practiceState || "",
        sourceDay: latest?.dateKey || "",
        sourceOneLine: latest?.oneLine || ""
      });
      renderPacket(buildPacket(saved));
      setBanner(status, strings.reflectionHandoffSaved, "success");
    });

    copyBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(output.value || "");
        setBanner(status, strings.copied, "success");
      } catch (_error) {
        setBanner(status, strings.reflectionHandoffCopyFail, "danger");
      }
    });
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

  async function attachLogout() {
    const logout = $("#logoutBtn");
    logout?.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (_error) {
        // Proceed with local logout even if server fails
      }
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

  async function initMembersArea() {
    const session = await refreshSessionFromServer();
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
    if (page === "members-dashboard") initDashboardPage(session);
    if (page === "members-journey") initJourneyPage();
    if (page === "members-practice") initPracticePage();
    if (page === "members-pilot") initPilotPage(session);
    if (page === "members-reflection") initReflectionPage(session);
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
      await initMembersArea();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    void init();
  });
})();
