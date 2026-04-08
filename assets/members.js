(() => {
  const STORAGE = {
    session: "nla_member_session",
    progress: "nla_member_progress",
    pending: "nla_member_magic_pending"
  };

  const PLANS = {
    year1: {
      code: "year1",
      label: "Year 1 Entry",
      priceUsd: 3,
      durationDays: 365,
      note: "3 USD = entry decision"
    },
    year2: {
      code: "year2",
      label: "Year 2 Continuity",
      priceUsd: 60,
      durationDays: 365,
      note: "Giữ nhịp và đi sâu"
    },
    year3: {
      code: "year3",
      label: "Year 3+ Mastery",
      priceUsd: 99,
      durationDays: 365,
      note: "Cam kết dài hạn"
    }
  };

  const PAYPAL_BUSINESS = "lienhe@nguyenlananh.com";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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

  function randomToken() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function safeNextPath(pathname) {
    if (!pathname || typeof pathname !== "string") return "/members/dashboard/";
    if (!pathname.startsWith("/members")) return "/members/dashboard/";
    return pathname;
  }

  function getPendingStore() {
    return readJSON(STORAGE.pending, {});
  }

  function savePendingStore(data) {
    writeJSON(STORAGE.pending, data);
  }

  function createMagicEntry({ email, planCode, nextPath }) {
    const token = randomToken();
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;

    const pending = getPendingStore();
    pending[token] = {
      token,
      email,
      planCode,
      nextPath: safeNextPath(nextPath),
      createdAt: now,
      expiresAt,
      used: false
    };
    savePendingStore(pending);
    return pending[token];
  }

  function consumeMagicEntry(token) {
    const pending = getPendingStore();
    const entry = pending[token];
    if (!entry) {
      return { ok: false, reason: "Không tìm thấy magic link." };
    }

    if (entry.used) {
      return { ok: false, reason: "Magic link đã được dùng." };
    }

    if (Date.now() > entry.expiresAt) {
      delete pending[token];
      savePendingStore(pending);
      return { ok: false, reason: "Magic link đã hết hạn (15 phút)." };
    }

    entry.used = true;
    pending[token] = entry;
    savePendingStore(pending);
    return { ok: true, entry };
  }

  function planByCode(code) {
    return PLANS[code] || PLANS.year1;
  }

  function createSessionFromEntry(entry) {
    const plan = planByCode(entry.planCode);
    const now = Date.now();
    const expiresAt = now + plan.durationDays * 24 * 60 * 60 * 1000;
    const session = {
      id: randomToken(),
      email: entry.email,
      membershipType: plan.code,
      membershipLabel: plan.label,
      startedAt: now,
      expiresAt
    };
    writeJSON(STORAGE.session, session);
    return session;
  }

  function getSession() {
    const session = readJSON(STORAGE.session, null);
    if (!session) return null;

    if (Date.now() > Number(session.expiresAt || 0)) {
      localStorage.removeItem(STORAGE.session);
      return null;
    }
    return session;
  }

  function clearSession() {
    localStorage.removeItem(STORAGE.session);
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
    $$('[data-member-email]').forEach((el) => {
      el.textContent = session.email;
    });
    $$('[data-member-plan]').forEach((el) => {
      el.textContent = `${session.membershipLabel} ($${planByCode(session.membershipType).priceUsd})`;
    });
    $$('[data-member-expire]').forEach((el) => {
      const date = new Date(session.expiresAt);
      el.textContent = date.toLocaleDateString("vi-VN");
    });
  }

  function renderProgress() {
    const progress = getProgress();
    const percent = completionPercent(progress);
    $$('[data-progress-percent]').forEach((el) => {
      el.textContent = `${percent}%`;
    });
    $$('[data-progress-bar]').forEach((el) => {
      el.style.width = `${percent}%`;
    });
  }

  function initJourneyPage() {
    const progress = getProgress();
    $$('[data-journey-stage]').forEach((btn) => {
      const stage = btn.getAttribute("data-journey-stage");
      if (progress.journey[stage]) {
        btn.textContent = "Đã hoàn thành";
        btn.closest("li")?.classList.add("done");
      }

      btn.addEventListener("click", () => {
        progress.journey[stage] = true;
        saveProgress(progress);
        btn.textContent = "Đã hoàn thành";
        btn.closest("li")?.classList.add("done");
        renderProgress();
      });
    });

    const doneCount = Object.values(progress.journey).filter(Boolean).length;
    const upgradeBlock = $("#upgradeTrigger");
    if (upgradeBlock) {
      upgradeBlock.classList.toggle("hidden", doneCount < 3);
    }
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

    $$('[data-practice-key]').forEach((input) => {
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
    const progress = getProgress();
    const list = $("#journalList");
    const form = $("#journalForm");
    const textarea = $("#journalText");

    function draw() {
      if (!list) return;
      list.innerHTML = "";
      const notes = progress.experience.notes || [];
      if (!notes.length) {
        list.innerHTML = '<li class="checkItem">Chưa có nhật ký. Viết một dòng thật để bắt đầu.</li>';
        return;
      }
      notes.slice().reverse().forEach((item) => {
        const li = document.createElement("li");
        li.className = "checkItem";
        li.textContent = `${item.date} — ${item.text}`;
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

  function initJoinPage() {
    const session = getSession();
    const activeBlock = $("#alreadyMember");
    const joinBlock = $("#joinFlow");
    if (session && activeBlock && joinBlock) {
      activeBlock.classList.remove("hidden");
      joinBlock.classList.add("hidden");
      renderSessionInfo(session);
      return;
    }

    const emailInput = $("#joinEmail");
    const planInput = $("#joinPlan");
    const payNowLink = $("#payNowLink");
    const afterPay = $("#afterPay");
    const joinForm = $("#joinForm");
    const pricingCards = $$('[data-plan-card]');
    const confirmBtn = $("#confirmPaid");
    const magicBox = $("#magicBox");
    const magicOutput = $("#magicOutput");
    const copyMagic = $("#copyMagic");

    function updateCardState() {
      const code = planInput?.value || "year1";
      pricingCards.forEach((card) => {
        card.classList.toggle("active", card.getAttribute("data-plan-card") === code);
      });
    }

    function updatePayLink() {
      const email = (emailInput?.value || "").trim() || "member@nguyenlananh.com";
      const plan = planByCode(planInput?.value || "year1");
      const href = buildPayPalUrl(plan, email);
      if (payNowLink) payNowLink.href = href;
      updateCardState();
    }

    emailInput?.addEventListener("input", updatePayLink);
    planInput?.addEventListener("change", updatePayLink);

    joinForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      updatePayLink();
      afterPay?.classList.remove("hidden");
      magicBox?.classList.add("hidden");
    });

    confirmBtn?.addEventListener("click", () => {
      const email = (emailInput?.value || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        alert("Vui lòng nhập email hợp lệ để nhận magic link.");
        return;
      }

      const nextFromQuery = new URLSearchParams(window.location.search).get("next");
      const entry = createMagicEntry({
        email,
        planCode: planInput?.value || "year1",
        nextPath: safeNextPath(nextFromQuery)
      });

      const loginUrl = `${window.location.origin}/members/?magic=${entry.token}&next=${encodeURIComponent(entry.nextPath)}`;
      if (magicOutput) magicOutput.textContent = loginUrl;
      magicBox?.classList.remove("hidden");
    });

    copyMagic?.addEventListener("click", async () => {
      const text = magicOutput?.textContent?.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyMagic.textContent = "Đã sao chép";
        setTimeout(() => {
          copyMagic.textContent = "Sao chép magic link";
        }, 1200);
      } catch (_err) {
        copyMagic.textContent = "Không thể sao chép";
      }
    });

    updatePayLink();
  }

  function handleMagicLogin() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("magic");
    if (!token) return;

    const result = consumeMagicEntry(token);
    if (!result.ok) {
      const errorBox = $("#magicError");
      if (errorBox) {
        errorBox.textContent = result.reason;
        errorBox.classList.remove("hidden");
      }
      params.delete("magic");
      const cleaned = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
      window.history.replaceState({}, "", cleaned);
      return;
    }

    const session = createSessionFromEntry(result.entry);
    renderSessionInfo(session);

    const next = safeNextPath(params.get("next") || result.entry.nextPath);
    window.location.replace(next || "/members/dashboard/");
  }

  function attachLogout() {
    const logout = $("#logoutBtn");
    logout?.addEventListener("click", () => {
      clearSession();
      window.location.href = "/join/";
    });
  }

  function initMembersArea() {
    const session = getSession();
    if (!session) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/join/?next=${next}`;
      return;
    }

    renderSessionInfo(session);
    renderProgress();
    attachLogout();

    const page = document.body.getAttribute("data-page");
    if (page === "members-journey") initJourneyPage();
    if (page === "members-practice") initPracticePage();
    if (page === "members-experience") initExperiencePage();
  }

  function init() {
    handleMagicLogin();

    const page = document.body.getAttribute("data-page");
    if (page === "join") {
      initJoinPage();
      return;
    }

    if (window.location.pathname.startsWith("/members")) {
      initMembersArea();
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
