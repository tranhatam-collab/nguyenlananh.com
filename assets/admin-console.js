(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEYS = {
    session: "nla_admin_session_v2",
    launchPack: "nla_admin_launch_pack_v2",
    siteConfig: "nla_admin_site_config_v2",
    roleMatrix: "nla_admin_role_matrix_v2",
    users: "nla_admin_users_v2"
  };

  const ADMIN_PERMISSIONS = [
    "dashboard",
    "content",
    "content_manage",
    "content_image",
    "members",
    "creators",
    "settings"
  ];

  const DEFAULT_ACCOUNTS = [
    {
      username: "super.admin",
      displayName: "Super Admin",
      roleId: "super_admin",
      password: "NLA-SUPER-ADMIN-TO-CHANGE@2026",
      permissions: ["content_manage", "content_image", "members", "creators", "settings", "dashboard"],
      isSystem: true,
      mustChangePassword: true
    },
    {
      username: "content.editor",
      displayName: "Content Editor",
      roleId: "content_editor",
      password: "NLA-CONTENT-EDITOR-TO-CHANGE@2026",
      permissions: ["content_manage", "content_image", "content"],
      isSystem: true,
      mustChangePassword: true
    }
  ];

  const ADMIN_ROLES = [
    {
      id: "super_admin",
      name: "Toàn quyền",
      minLevel: 3,
      permissions: ["dashboard", "content", "content_manage", "content_image", "members", "creators", "settings"]
    },
    {
      id: "ops",
      name: "Điều hành",
      minLevel: 2,
      permissions: ["dashboard", "members", "settings"]
    },
    {
      id: "content_editor",
      name: "Biên tập nội dung",
      minLevel: 2,
      permissions: ["dashboard", "content", "content_manage", "content_image"]
    },
    {
      id: "content",
      name: "Nội dung",
      minLevel: 1,
      permissions: ["dashboard", "content"]
    },
    {
      id: "viewer",
      name: "Chỉ xem",
      minLevel: 0,
      permissions: ["dashboard"]
    }
  ];

  const DEFAULT_TTL = 480;
  const MS = { minute: 60 * 1000, day: 24 * 60 * 60 * 1000 };
  const ADMIN_HOST = "admin.nguyenlananh.com";

  const now = () => Date.now();

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed) return fallback;
      return parsed;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeAccount(input, index = 0) {
    if (!input || typeof input !== "object") return null;
    const username = String(input.username || "").trim();
    if (!username) return null;

    const passwordText = String(input.password || input.passwordHash || "");
    const passwordHash = input.passwordHash || hashToken(passwordText);
    const roleId = roleById(input.roleId || "viewer").id;
    const permissions = Array.isArray(input.permissions) ? input.permissions : [];

    return {
      id: input.id || `acct-${username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${index + 1}`,
      username,
      displayName: String(input.displayName || username),
      roleId,
      passwordHash,
      permissions: Array.from(new Set(permissions.filter(Boolean))),
      isSystem: Boolean(input.isSystem),
      mustChangePassword: Boolean(input.mustChangePassword),
      createdAt: input.createdAt || new Date().toISOString().slice(0, 10)
    };
  }

  function ensureSystemAccounts(accounts) {
    const list = Array.isArray(accounts) ? accounts.slice() : [];
    const byUsername = new Map();

    list.forEach((item) => {
      byUsername.set(item.username, item);
    });

    DEFAULT_ACCOUNTS.forEach((item, index) => {
      const normalized = normalizeAccount(item, index);
      if (!normalized) return;

      const existing = byUsername.get(normalized.username);
      if (!existing) {
        list.push(normalized);
        byUsername.set(normalized.username, normalized);
        return;
      }

      existing.isSystem = true;
      existing.roleId = normalized.roleId;
      existing.displayName = existing.displayName || normalized.displayName;
      existing.permissions = Array.from(new Set([...(existing.permissions || []), ...normalized.permissions]));
      if (!existing.passwordHash) {
        existing.passwordHash = normalized.passwordHash;
      }
      existing.mustChangePassword = true;
    });

    return list;
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem(STORAGE_KEYS.launchPack);
    localStorage.removeItem(STORAGE_KEYS.siteConfig);
    localStorage.removeItem(STORAGE_KEYS.roleMatrix);
  }

  function safeText(value) {
    if (value == null) return "";
    return String(value).replace(/[&<>"']/g, (char) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function hashToken(input) {
    let h = 0;
    const text = String(input || "");
    for (let i = 0; i < text.length; i += 1) {
      h = (h << 5) - h + text.charCodeAt(i);
      h |= 0;
    }
    return `tk-${Math.abs(h).toString(16)}`;
  }

  function roleById(roleId) {
    return ADMIN_ROLES.find((item) => item.id === roleId) || ADMIN_ROLES[ADMIN_ROLES.length - 1];
  }

  function sessionPermissions(session) {
    if (!session || !session.role) return [];
    const role = roleById(session.role);
    const directPermissions = role.permissions || [];
    const accountPermissions = Array.isArray(session.permissions) ? session.permissions : [];
    return Array.from(new Set([...directPermissions, ...accountPermissions]));
  }

  function canAccess(session, moduleName) {
    return sessionPermissions(session).includes(moduleName);
  }

  function getAccounts() {
    const stored = readJSON(STORAGE_KEYS.users, null);
    if (!Array.isArray(stored) || stored.length === 0) {
      const seeded = ensureSystemAccounts(DEFAULT_ACCOUNTS.map((account, index) => normalizeAccount(account, index)).filter(Boolean));
      writeJSON(STORAGE_KEYS.users, seeded);
      return seeded;
    }

    const list = stored
      .map((item, index) => normalizeAccount(item, index))
      .filter(Boolean);
    const withDefaults = ensureSystemAccounts(list);
    const ids = new Set();
    const usernames = new Set();

    const deduped = withDefaults.filter((item) => {
      const isUnique = !ids.has(item.id) && !usernames.has(item.username);
      if (isUnique) {
        ids.add(item.id);
        usernames.add(item.username);
      }
      return isUnique;
    });

    writeJSON(STORAGE_KEYS.users, deduped);

    return deduped;
  }

  function saveAccounts(accounts) {
    writeJSON(STORAGE_KEYS.users, accounts);
  }

  function resolveAccount(username, password) {
    const list = getAccounts();
    const identity = list.find((item) => item.username === String(username || ""));
    if (!identity) return null;
    if (!password) return null;
    return hashToken(password) === identity.passwordHash ? identity : null;
  }

  function getSession() {
    const raw = readJSON(STORAGE_KEYS.session, null);
    if (!raw || typeof raw !== "object") return null;
    if (!raw.expiresAt || raw.expiresAt <= now()) return null;
    if (!raw.role || !raw.keyHash) return null;
    return raw;
  }

  function setSession(payload) {
    const sessionMinutes = Math.max(15, Math.min(12 * 60, Number(payload.ttlMinutes) || DEFAULT_TTL));
    const startAt = now();
    const roleInfo = roleById(payload.roleId);
    const session = {
      role: roleInfo.id,
      roleName: roleInfo.name,
      rolePermissions: roleInfo.permissions || [],
      keyHash: hashToken(payload.key),
      permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
      accountId: payload.accountId || "",
      accountUsername: payload.accountUsername || "",
      startedAt: startAt,
      expiresAt: startAt + sessionMinutes * MS.minute,
      ttlMinutes: sessionMinutes,
      host: location.host,
      active: true
    };
    writeJSON(STORAGE_KEYS.session, session);
  }

  function renderStatus(el, message, variant = "info") {
    if (!el) return;
    el.textContent = message || "";
    el.className = `meta ${variant === "danger" ? "is-danger" : variant === "ok" ? "is-success" : ""}`.trim();
  }

  function updateSessionDOM(session, statusEl, logoutBtn) {
    const authBox = $("#admin-auth");
    const hostWarning = $("#admin-host-warning");
    const gateBanner = $("#admin-host-banner");
    const roleText = $("#admin-role-text");
    const timeText = $("#admin-time-left");
    const remainingMinutes = session ? Math.max(1, Math.round((session.expiresAt - now()) / MS.minute)) : 0;
    const hasAccount = Boolean(session && session.accountUsername);

    if (statusEl) {
      if (session) {
        if (hasAccount) {
          statusEl.textContent = `Phiên account: ${session.accountUsername || session.roleName || "Nội bộ"} • ${remainingMinutes} phút`;
        } else {
          statusEl.textContent = `Phiên hoạt động: ${remainingMinutes} phút • vai trò ${session.roleName || "Nội bộ"}`;
        }
      } else {
        statusEl.textContent = "Chưa có phiên nội bộ. Bấm mở khóa để tiếp tục.";
      }
    }

    if (roleText) {
      roleText.textContent = session ? `Vai trò hiện tại: ${session.roleName}${hasAccount ? ` (${session.accountUsername})` : ""}` : "";
    }
    if (timeText) timeText.textContent = session ? `Hết hạn sau ${remainingMinutes} phút` : "";

    if (authBox) {
      authBox.style.display = session ? "none" : "block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = session ? "inline-flex" : "none";
    }

    const hostNotice = gateBanner || hostWarning;
    if (hostNotice && location.host !== ADMIN_HOST) {
      const target = `https://${ADMIN_HOST}${location.pathname}`;
      hostNotice.textContent = `Khuyến nghị truy cập qua ${ADMIN_HOST} để tách luồng vận hành nội bộ.`;
      hostNotice.classList.remove("hidden");
      hostNotice.dataset.alt = target;
    } else if (hostNotice) {
      hostNotice.classList.add("hidden");
      hostNotice.textContent = "";
      hostNotice.dataset.alt = "";
    }

    $$(".admin-section").forEach((section) => {
      const requires = section.dataset.requires || "viewer";
      const allow = canAccess(session, requires);
      section.style.display = allow ? "block" : "none";
    });

    $$(".admin-only").forEach((node) => {
      node.style.display = session ? "block" : "none";
    });

    if (session && session.expiresAt <= now()) {
      renderStatus(statusEl, "Phiên nội bộ đã hết hạn. Vui lòng mở khóa lại.", "danger");
      clearSession();
      return;
    }

    window.dispatchEvent(new CustomEvent("admin-session-updated", {
      detail: { hasSession: Boolean(session), session }
    }));
  }

  function initSession() {
    const gateBtn = $("#admin-enter");
    const keyInput = $("#admin-key");
    const accountInput = $("#admin-account");
    const accountPasswordInput = $("#admin-password");
    const accountHint = $("#admin-account-hint");
    const roleSelect = $("#admin-role");
    const ttlInput = $("#admin-ttl");
    const logoutBtn = $("#admin-logout");
    const statusEl = $("#session-status");
    const language = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    ensureAuthAccountFields();

    function startFromForm() {
      const key = (keyInput?.value || "").trim();
      const account = (accountInput?.value || "").trim();
      const password = (accountPasswordInput?.value || "").trim();
      const roleId = roleSelect?.value || "viewer";

      if (account) {
        if (!password) {
          if (statusEl) {
            renderStatus(statusEl, "Nhập mật khẩu để dùng tài khoản nội bộ.", "danger");
          }
          return;
        }

        const profile = resolveAccount(account, password);
        if (!profile) {
          if (statusEl) {
            renderStatus(statusEl, "Sai tài khoản hoặc mật khẩu nội dung.", "danger");
          }
          return;
        }

        setSession({
          key: `${account}:${password}`,
          roleId: profile.roleId || roleId,
          permissions: profile.permissions,
          ttlMinutes: Number(ttlInput?.value || DEFAULT_TTL),
          accountId: profile.id,
          accountUsername: profile.username
        });
        if (statusEl) {
          renderStatus(statusEl, "Đăng nhập bằng tài khoản nội dung đã hoạt động.", "ok");
        }
        updateSessionDOM(getSession(), statusEl, logoutBtn);
        if (accountHint) {
          accountHint.textContent = language
            ? "Account mode activated."
            : "Đã dùng đăng nhập theo tài khoản nội dung.";
        }
        return;
      }

      if (!key) {
        if (statusEl) {
          renderStatus(statusEl, "Cần khóa nội bộ để khởi động phiên.", "danger");
        }
        return;
      }
      setSession({
        key,
        roleId,
        ttlMinutes: Number(ttlInput?.value || DEFAULT_TTL)
      });
      updateSessionDOM(getSession(), statusEl, logoutBtn);
      if (accountHint) {
        accountHint.textContent = language
          ? "Key mode activated."
          : "Đã đăng nhập theo khóa nội bộ.";
      }
    }

    if (gateBtn) {
      gateBtn.addEventListener("click", startFromForm);
    }
    if (keyInput) {
      keyInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          startFromForm();
        }
      });
    }
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        clearSession();
        updateSessionDOM(null, statusEl, logoutBtn);
      });
    }

    const queryAccount = new URLSearchParams(location.search).get("admin_account");
    const queryPassword = new URLSearchParams(location.search).get("admin_password");
    if (!getSession() && queryAccount && queryPassword) {
      const profile = resolveAccount(queryAccount, queryPassword);
      if (profile) {
        setSession({
          key: `${queryAccount}:${queryPassword}`,
          roleId: profile.roleId,
          permissions: profile.permissions,
          ttlMinutes: Number(new URLSearchParams(location.search).get("ttl") || DEFAULT_TTL),
          accountId: profile.id,
          accountUsername: profile.username
        });
      }
    }

    const queryToken = new URLSearchParams(location.search).get("admin_token");
    if (!getSession() && queryToken) {
      const queryRole = new URLSearchParams(location.search).get("admin_role") || "viewer";
      const ttl = new URLSearchParams(location.search).get("ttl") || DEFAULT_TTL;
      setSession({ key: queryToken, roleId: queryRole, ttlMinutes: ttl });
    }

    const existing = getSession();
    updateSessionDOM(existing, statusEl, logoutBtn);
    if (existing) {
      const refreshId = setInterval(() => {
        const current = getSession();
        updateSessionDOM(current, statusEl, logoutBtn);
        if (!current) {
          clearInterval(refreshId);
        }
      }, 30 * 1000);
    }
  }

  function ensureAuthAccountFields() {
    if ($("#admin-account") || $("#admin-password")) return;

    const roleField = $("#admin-role")?.closest(".field");
    if (!roleField) return;

    const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    const accountLabel = isEnglish ? "Account" : "Tài khoản";
    const passwordLabel = isEnglish ? "Account password" : "Mật khẩu tài khoản";
    const hint = isEnglish
      ? "Nếu bạn điền cả tài khoản + mật khẩu thì sẽ ưu tiên đăng nhập bằng tài khoản đã cấp quyền."
      : "Điền cả tài khoản + mật khẩu nếu muốn đăng nhập bằng tài khoản nội dung đã phân quyền.";

    const block = document.createElement("div");
    block.innerHTML = `<div class="field">
      <label for="admin-account">${accountLabel}</label>
      <input id="admin-account" type="text" autocomplete="username" />
    </div>
    <div class="field">
      <label for="admin-password">${passwordLabel}</label>
      <input id="admin-password" type="password" autocomplete="current-password" />
    </div>
    <p id="admin-account-hint" class="note">${hint}</p>`;
    roleField.insertAdjacentElement("beforebegin", block);
  }

  async function safeLoadJSON(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Load failed: ${url}`);
    return response.json();
  }

  function createSummaryPanel(items) {
    const total = Array.isArray(items) ? items.length : 0;
    const ok = Array.isArray(items) ? items.filter((item) => item?.status === "published").length : 0;
    const draft = Array.isArray(items) ? items.filter((item) => item?.status === "draft").length : 0;
    const inReview = Array.isArray(items) ? items.filter((item) => item?.status === "in_review" || item?.status === "review").length : 0;
    return `<div class="kpiRow">
      <article class="kpi"><strong>${total}</strong><span>Tổng mục</span></article>
      <article class="kpi"><strong>${ok}</strong><span>Published</span></article>
      <article class="kpi"><strong>${draft}</strong><span>Draft</span></article>
      <article class="kpi"><strong>${inReview}</strong><span>In Review</span></article>
    </div>`;
  }

  async function initHealth() {
    const panel = $("#health-panel");
    if (!panel) return;

    try {
      const health = await safeLoadJSON("/api/payments/health");
      const providers = Array.isArray(health.providers) ? health.providers : [];
      const enabledProviders = providers.filter((item) => item && item.enabled).map((item) => item.name || item.provider).join(", ") || "Không phát hiện";
      panel.innerHTML = `<section class="panel">
        <h3>API Health</h3>
        <ul class="list">
          <li>DB ready: <strong>${Boolean(health.environment?.db_ready) ? "true" : "false"}</strong></li>
          <li>Deploy target: <strong>${safeText(health.environment?.deploy_target || "-")}</strong></li>
          <li>Email provider: <strong>${safeText(health.environment?.email_provider || "-")}</strong></li>
          <li>Provider đang bật: <strong>${enabledProviders}</strong></li>
          <li>Timestamp: <strong>${safeText(health.timestamp || "-")}</strong></li>
        </ul>
      </section>`;
    } catch (_error) {
      panel.innerHTML = `<section class="panel">
        <h3>API Health</h3>
        <p>Không lấy được /api/payments/health. Kiểm tra deployment hoặc function chưa sẵn sàng.</p>
      </section>`;
    }
  }

  function renderTextValue(target, value) {
    if (!target) return;
    target.textContent = value || "";
  }

  async function initSettings() {
    const sourceArea = $("#site-config-json");
    const syncBtn = $("#site-config-sync");
    const saveBtn = $("#site-config-save");
    const exportBtn = $("#site-config-export");
    const clearBtn = $("#site-config-clear");
    const copyBtn = $("#site-config-copy");
    const status = $("#site-config-status");

    const roleEl = $("#admin-role-summary");
    if (roleEl) {
      roleEl.innerHTML = ADMIN_ROLES.map((item) => `<li><strong>${item.name}</strong>: ${item.permissions.join(", ")}</li>`).join("");
    }

    if (!sourceArea) return;

    try {
      const remote = await safeLoadJSON("/admin/site-config.json");
      const local = readJSON(STORAGE_KEYS.siteConfig, null);
      const merged = local && Object.keys(local).length > 0 ? { ...remote, ...local } : remote;
      sourceArea.value = JSON.stringify(merged, null, 2);
    } catch (_error) {
      sourceArea.value = JSON.stringify(readJSON(STORAGE_KEYS.siteConfig, {
        site: { brand: "Nguyễn Lan Anh", tagline: "" },
        launch: { series_code: "launch-10-inner-clarity", visibility: "published" },
        admin: { session_minutes: DEFAULT_TTL, data_ttl_days: 30 }
      }), null, 2);
    }

    function syncFromFile(payload) {
      try {
        const parsed = JSON.parse(payload || "{}");
        writeJSON(STORAGE_KEYS.siteConfig, parsed);
        renderStatus(status, "Đã lưu local-config.", "ok");
      } catch (_error) {
        renderStatus(status, "JSON config không hợp lệ.", "danger");
      }
    }

    if (syncBtn) {
      syncBtn.addEventListener("click", async () => {
        try {
          const remote = await safeLoadJSON("/admin/site-config.json");
          sourceArea.value = JSON.stringify(remote, null, 2);
          renderStatus(status, "Đã đồng bộ từ /admin/site-config.json.");
        } catch (_error) {
          renderStatus(status, "Không đồng bộ được source-config.", "danger");
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => syncFromFile(sourceArea.value));
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(sourceArea.value || "{}");
          const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `site-config-${new Date().toISOString().slice(0, 10)}.json`;
          link.click();
          URL.revokeObjectURL(link.href);
          renderStatus(status, "Đã export local config.");
        } catch (_error) {
          renderStatus(status, "Không thể xuất file config.", "danger");
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(sourceArea.value || "{}");
          renderStatus(status, "Đã copy config vào clipboard.");
        } catch (_error) {
          renderStatus(status, "Không copy được clipboard.", "danger");
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.siteConfig);
        renderStatus(status, "Đã xóa local override.");
      });
    }

    const summary = $("#site-config-summary");
    if (summary) {
      try {
        const parsed = JSON.parse(sourceArea.value || "{}");
        summary.innerHTML = `Cấu hình: ${parsed.collection || "articles"} • Domain: ${safeText(parsed.members?.free_path_note_vi || "member flow protected")}`;
      } catch (_error) {
        summary.textContent = "Chưa parse được config.";
      }
    }
  }

  async function initContent() {
    const manifestArea = $("#launch-manifest-json");
    const importBtn = $("#launch-manifest-import");
    const validateBtn = $("#launch-manifest-validate");
    const exportBtn = $("#launch-manifest-export");
    const copyBtn = $("#launch-manifest-copy");
    const clearBtn = $("#launch-manifest-clear");
    const status = $("#launch-manifest-status");
    const summary = $("#launch-manifest-summary");
    const siteConfigSync = $("#site-config-sync");
    const siteConfigSave = $("#site-config-save");
    const siteConfigExport = $("#site-config-export");
    const siteConfigCopy = $("#site-config-copy");
    const siteConfigClear = $("#site-config-clear");
    if (!manifestArea) return;

    function applyContentPermissions() {
      const session = getSession();
      const canManage = canAccess(session, "content_manage");
      [importBtn, siteConfigSync, siteConfigSave, exportBtn, copyBtn, clearBtn, siteConfigExport, siteConfigCopy, siteConfigClear].forEach((btn) => {
        if (btn) {
          btn.disabled = !canManage;
          btn.title = canManage ? "" : "Cần quyền quản trị nội dung";
        }
      });
      const canImage = canAccess(session, "content_image");
      if (canImage && !canManage) {
        if (exportBtn) exportBtn.disabled = false;
        if (copyBtn) copyBtn.disabled = false;
      }
    }

    applyContentPermissions();
    window.addEventListener("admin-session-updated", applyContentPermissions, { once: false });

    function validateManifest(items) {
      if (!Array.isArray(items)) return "Manifest phải là mảng JSON.";
      const required = ["slug", "title_vi", "title_en", "path_vi", "path_en", "status", "publish_order"];
      const missing = items.filter((item) => required.some((k) => !item?.[k]));
      if (missing.length) {
        return `Thiếu trường bắt buộc ở ${missing.length} item.`;
      }
      const slugs = items.map((item) => item.slug).filter(Boolean);
      const unique = new Set(slugs);
      if (slugs.length !== unique.size) {
        return "Trùng slug: cần sửa publish pack trước khi import.";
      }
      if (items.length !== items.filter((item) => ["draft", "in_review", "approved", "published"].includes(item.status)).length) {
        return "Có item có status không hợp lệ.";
      }
      return `Manifest hợp lệ: ${items.length} mục, status công bố: ${items.filter((i) => i.status === "published").length}.`;
    }

    try {
      const remote = await safeLoadJSON("/admin/content/articles-launch-collection.json");
      const local = readJSON(STORAGE_KEYS.launchPack, null);
      manifestArea.value = JSON.stringify(local || remote, null, 2);
      const manifest = JSON.parse(manifestArea.value);
      if (summary) summary.innerHTML = createSummaryPanel(manifest.items || manifest);
    } catch (_error) {
      const local = readJSON(STORAGE_KEYS.launchPack, []);
      manifestArea.value = JSON.stringify(local, null, 2);
      if (summary) summary.innerHTML = createSummaryPanel(local);
    }

    if (validateBtn) {
      validateBtn.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(manifestArea.value || "[]");
          const result = validateManifest(Array.isArray(parsed) ? parsed : parsed.items || []);
          renderStatus(status, result, result.startsWith("Manifest hợp") ? "ok" : "danger");
        } catch (_error) {
          renderStatus(status, "JSON manifest không hợp lệ.", "danger");
        }
      });
    }

    if (importBtn) {
      importBtn.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(manifestArea.value || "[]");
          writeJSON(STORAGE_KEYS.launchPack, parsed);
          renderStatus(status, "Đã lưu local manifest (phiên admin).");
          if (summary) summary.innerHTML = createSummaryPanel(parsed);
        } catch (_error) {
          renderStatus(status, "Manifest JSON không hợp lệ.", "danger");
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(manifestArea.value || "[]");
          const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `articles-launch-collection-${new Date().toISOString().slice(0, 10)}.json`;
          link.click();
          URL.revokeObjectURL(link.href);
          renderStatus(status, "Đã export manifest.");
        } catch (_error) {
          renderStatus(status, "Không thể export manifest.", "danger");
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(manifestArea.value || "[]");
          renderStatus(status, "Đã copy manifest.");
        } catch (_error) {
          renderStatus(status, "Không copy được clipboard.", "danger");
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.launchPack);
        renderStatus(status, "Đã xóa local manifest override.");
      });
    }

    const sample = $("#launch-manifest-sample");
    if (sample) {
      sample.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(manifestArea.value || "[]");
          const first = Array.isArray(parsed) && parsed[0] ? parsed[0] : {};
          manifestArea.value = JSON.stringify(first.internal_links || [], null, 2);
        } catch (_error) {
          manifestArea.value = "[]";
        }
      });
    }
  }

  function initDashboard() {
    const container = $("#admin-dashboard-grid");
    if (!container) return;

    const manifest = readJSON(STORAGE_KEYS.launchPack, null);
    const launchItems = Array.isArray(manifest) ? manifest : (manifest?.items || []);
    const openItems = Array.isArray(launchItems)
      ? launchItems.filter((item) => item?.status === "draft" || item?.status === "in_review" || item?.status === "review").length
      : 0;
    const published = Array.isArray(launchItems)
      ? launchItems.filter((item) => item?.status === "published").length
      : 0;

    const membersOps = [
      { label: "Ngày", value: "2", hint: "check join/login" },
      { label: "Day-1", value: "1", hint: "follow-up hành trình" },
      { label: "Day-7", value: "0", hint: "đánh giá mở rộng" }
    ];

    container.innerHTML = `<div class="grid2">
      <article class="panel">
        <h3>Release Health</h3>
        <ul class="list">
          <li>Launch items draft + review: <strong>${openItems}</strong></li>
          <li>Published: <strong>${published}</strong></li>
          <li>Live path: <strong>${location.host}</strong></li>
        </ul>
      </article>
      <article class="panel">
        <h3>Members Snapshot</h3>
        <ul class="list">
          ${membersOps.map((item) => `<li>${item.label}: <strong>${safeText(item.value)}</strong> (${safeText(item.hint)})`).join("")}
        </ul>
      </article>
    </div>`;

    const progressPanel = $("#admin-progress");
    if (progressPanel) {
      const target = 10;
      const done = Math.min((published / Math.max(target, 1)) * 100, 100);
      progressPanel.innerHTML = `<div class="progressTrack" aria-hidden="true"><span style="width:${done.toFixed(0)}%"></span></div><p class="meta">Mục publish đã đạt: ${published}/${target}</p>`;
    }
  }

  function initMembers() {
    const memberList = $("#members-list");
    const memberLog = $("#members-log");
    const memberStatus = $("#members-status");
    if (!memberList && !memberLog) return;

    const list = [
      { name: "Nút CTA join/đăng ký đã gắn magic-link", state: "live", updated: "2026-04-19" },
      { name: "Dashboard sau login tự mở theo luồng thành viên", state: "live", updated: "2026-04-19" },
      { name: "Day-1/Day-7 checklist", state: "in_progress", updated: "2026-04-19" }
    ];

    if (memberStatus) {
      memberStatus.textContent = `Đang theo dõi: ${list.length} mục vận hành (manual, không kết nối DB trực tiếp).`;
    }

    if (memberList) {
      memberList.innerHTML = `<ul class="checkList">${list.map((item) =>
        `<li class="checkItem"><input type="checkbox" disabled ${item.state === "live" ? "checked" : ""}> <div><strong>${safeText(item.name)}</strong><p class="note">${safeText(item.state)} • ${safeText(item.updated)}</p></div></li>`
      ).join("")}</ul>`;
    }

    if (memberLog) {
      memberLog.innerHTML = `<ul class="list"><li>Đề xuất: chuyển sang DB-driven theo sprint 2 để có real-time metrics.</li></ul>`;
    }
  }

  function initCreators() {
    const creators = $("#creators-list");
    const creatorsStatus = $("#creators-status");
    if (!creators) return;

    const items = [
      { slug: "guidelines", status: "approved", note: "Nhà vận hành đã đọc và khóa quyền công khai" },
      { slug: "submit", status: "review", note: "Đang nhận submission nội bộ" },
      { slug: "library", status: "in_progress", note: "Phỏng định cơ chế review" }
    ];

    creators.innerHTML = `<ul class="checkList">${items.map((item) =>
      `<li class="checkItem"><input type="checkbox" disabled ${item.status === "approved" ? "checked" : ""}> <div><strong>${safeText(item.slug)}</strong><p class="note">${safeText(item.status)} • ${safeText(item.note)}</p></div></li>`
    ).join("")}</ul>`;

    if (creatorsStatus) {
      creatorsStatus.textContent = "Pipeline: submitted → review → revision/approved → publish (mô hình nội bộ).";
    }
  }

  function initSettingsTextArea() {
    const roleArea = $("#role-policy-json");
    const status = $("#role-policy-status");
    if (!roleArea) return;

    const policy = {
      roles: ADMIN_ROLES.map((item) => ({
        role: item.id,
        name: item.name,
        can_read_admin: true,
        can_manage_dashboard: item.permissions.includes("dashboard"),
        can_manage_members: item.permissions.includes("members"),
        can_manage_content: item.permissions.includes("content"),
        can_manage_creators: item.permissions.includes("creators"),
        can_manage_settings: item.permissions.includes("settings")
      })),
      rules: [
        "Không public nội dung nội bộ",
        "Không điều chỉnh CTA marketing",
        "Mọi thay đổi quan trọng phải có owner"
      ]
    };

    roleArea.value = JSON.stringify(policy, null, 2);

    const saveBtn = $("#role-policy-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(roleArea.value || "{}");
          writeJSON(STORAGE_KEYS.roleMatrix, parsed);
          renderStatus(status, "Đã lưu role-policy cho phiên làm việc.");
        } catch (_error) {
          renderStatus(status, "Không parse được role-policy JSON.", "danger");
        }
      });
    }
    const copyBtn = $("#role-policy-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(roleArea.value || "{}");
          renderStatus(status, "Đã copy role policy.");
        } catch (_error) {
          renderStatus(status, "Không copy được clipboard.", "danger");
        }
      });
    }
  }

  function initAccountManager() {
    const panel = $("#admin-account-manager");
    if (!panel) return;

    const usernameInput = $("#admin-account-username");
    const displayInput = $("#admin-account-display");
    const passwordInput = $("#admin-account-new-password");
    const roleSelect = $("#admin-account-role");
    const saveBtn = $("#admin-account-save");
    const resetBtn = $("#admin-account-reset");
    const status = $("#admin-account-status");
    const userList = $("#admin-account-list");
    const accountHint = $("#admin-account-manager-hint");
    const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");

    const permissionDefs = [
      { id: "content", labelVi: "Truy cập Content", labelEn: "Content access" },
      { id: "content_manage", labelVi: "Đăng / sửa / xóa bài", labelEn: "Publish/edit/delete article" },
      { id: "content_image", labelVi: "Cập nhật ảnh bài viết", labelEn: "Update article image" },
      { id: "dashboard", labelVi: "Dashboard", labelEn: "Dashboard" },
      { id: "members", labelVi: "Members", labelEn: "Members" },
      { id: "creators", labelVi: "Creators", labelEn: "Creators" },
      { id: "settings", labelVi: "Settings", labelEn: "Settings" }
    ];

    function formatPermissionLabel(permission) {
      const item = permissionDefs.find((entry) => entry.id === permission);
      if (!item) return permission;
      return isEnglish ? item.labelEn : item.labelVi;
    }

    function permissionListToText(perms) {
      if (!Array.isArray(perms) || perms.length === 0) return isEnglish ? "No extra permission" : "Không có quyền bổ sung";
      return perms.map((permission) => formatPermissionLabel(permission)).join(", ");
    }

    const permWrap = $("#admin-account-permissions");
    if (permWrap) {
      permWrap.innerHTML = permissionDefs
        .map((item) =>
          `<label class="checkItem" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span>${isEnglish ? item.labelEn : item.labelVi}</span>
            <input type="checkbox" value="${item.id}" />
          </label>`
        ).join("");
    }

    function readPermissions() {
      return Array.from(permWrap?.querySelectorAll("input[type=\"checkbox\"]") || [])
        .filter((input) => input.checked)
        .map((input) => input.value)
        .filter(Boolean);
    }

    function setPermissionsFromProfile(perms) {
      if (!permWrap) return;
      const set = new Set(Array.isArray(perms) ? perms : []);
      permWrap.querySelectorAll("input[type=\"checkbox\"]").forEach((checkbox) => {
        checkbox.checked = set.has(checkbox.value);
      });
    }

    function fillRoles() {
      if (!roleSelect) return;
      roleSelect.innerHTML = ADMIN_ROLES.map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
    }

    function listAccounts() {
      const accounts = getAccounts();
      if (!userList) return;

      if (accounts.length === 0) {
        userList.innerHTML = `<li class="note">${isEnglish ? "No account found." : "Chưa có tài khoản."}</li>`;
        return;
      }

      userList.innerHTML = accounts
        .map((item) => {
          const badge = item.mustChangePassword ? (isEnglish ? "Please change password" : "Đổi mật khẩu lần đầu") : (isEnglish ? "Ready" : "Sẵn sàng");
          const label = `${safeText(item.displayName)} (${safeText(item.username)})`;
          const actions = item.isSystem
            ? (isEnglish ? "System account" : "Tài khoản hệ thống")
            : `
                <button type="button" class="ghost" data-account-id="${safeText(item.id)}" data-action="edit-account">${isEnglish ? "Edit" : "Sửa"}</button>
                <button type="button" class="ghost" data-account-id="${safeText(item.id)}" data-action="delete-account">${isEnglish ? "Delete" : "Xóa"}</button>`;
          return `<li class=\"checkItem\"><div>
            <strong>${label}</strong>
            <p class=\"note\">Role: ${safeText(roleById(item.roleId).name)} • Quyền: ${permissionListToText(item.permissions)}</p>
            <p class=\"note\">${badge}</p>
          </div><div>${actions}</div></li>`;
        })
        .join("");
    }

    function fillForm(item) {
      if (!item) return;
      if (usernameInput) usernameInput.value = item.username || "";
      if (displayInput) displayInput.value = item.displayName || "";
      if (passwordInput) passwordInput.value = "";
      if (roleSelect) roleSelect.value = item.roleId || "content";
      setPermissionsFromProfile(item.permissions);
    }

    function resetForm() {
      if (usernameInput) usernameInput.value = "";
      if (displayInput) displayInput.value = "";
      if (passwordInput) passwordInput.value = "";
      if (roleSelect) roleSelect.value = "content";
      setPermissionsFromProfile(["content", "content_manage", "content_image"]);
      if (status) status.textContent = "";
    }

    function saveAccount() {
      const username = (usernameInput?.value || "").trim();
      const displayName = (displayInput?.value || "").trim();
      const password = (passwordInput?.value || "").trim();
      const roleId = roleSelect?.value || "content";
      const permissions = readPermissions();

      if (!username || !roleId) {
        renderStatus(status, isEnglish ? "Username and role are required." : "Thiếu tên tài khoản và vai trò.", "danger");
        return;
      }

      const list = getAccounts();
      const existed = list.find((item) => item.username === username);
      const merged = {
        id: existed?.id,
        username,
        displayName: displayName || username,
        roleId,
        permissions,
        isSystem: Boolean(existed?.isSystem),
        mustChangePassword: existed?.isSystem ? Boolean(existed?.mustChangePassword) : false,
        createdAt: existed?.createdAt || new Date().toISOString().slice(0, 10),
        passwordHash: existed?.passwordHash
      };

      if (existed && existed.isSystem) {
        merged.passwordHash = existed.passwordHash;
      } else if (!existed && !password) {
        renderStatus(status, isEnglish ? "New account requires password." : "Tài khoản mới cần mật khẩu.", "danger");
        return;
      } else if (password) {
        merged.passwordHash = hashToken(password);
      } else if (!existed) {
        merged.passwordHash = hashToken("NLA-CHANGE-ME");
      }

      const normalized = normalizeAccount(merged, 0);
      if (!normalized) return;

      const next = list.filter((item) => item.username !== username);
      if (existed) {
        next.push(normalized);
      } else {
        next.push(normalized);
      }
      saveAccounts(next);
      renderStatus(status, isEnglish ? "Saved account." : "Đã lưu tài khoản.", "ok");
      listAccounts();
      resetForm();
    }

    function deleteAccount(accountId) {
      const list = getAccounts();
      const found = list.find((item) => item.id === accountId);
      if (!found || found.isSystem) {
        renderStatus(status, isEnglish ? "Cannot delete system account." : "Không thể xóa tài khoản hệ thống.", "danger");
        return;
      }
      const next = list.filter((item) => item.id !== accountId);
      saveAccounts(next);
      renderStatus(status, isEnglish ? "Deleted account." : "Đã xóa tài khoản.", "ok");
      listAccounts();
      if ((usernameInput?.value || "") === found.username) {
        resetForm();
      }
    }

    if (accountHint) {
      accountHint.textContent = isEnglish
        ? "Mở quyền cho nội dung: content_manage + content_image."
        : "Cập nhật quyền cho bài viết: content_manage + content_image.";
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", saveAccount);
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetForm);
    }

    if (userList) {
      userList.addEventListener("click", (event) => {
        const target = event.target.closest("[data-account-id]");
        if (!target) return;
        const accountId = target.getAttribute("data-account-id");
        const action = target.getAttribute("data-action");
        if (action === "delete-account") {
          if (accountId) deleteAccount(accountId);
          return;
        }
        if (action === "edit-account") {
          const found = getAccounts().find((entry) => entry.id === accountId);
          if (!found) return;
          fillForm(found);
          if (status) {
            renderStatus(
              status,
              isEnglish
                ? `Editing ${found.username}. Leave password empty to keep current.`
                : `Đang sửa ${found.username}. Để trống mật khẩu để giữ nguyên.`,
              "info"
            );
          }
        }
      });
    }

    fillRoles();
    setPermissionsFromProfile(["content", "content_manage", "content_image"]);
    listAccounts();
  }

  function initCommonFooter() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function initAdminHostNotice() {
    const alert = $("#admin-host-banner") || $("#admin-host-warning");
    if (!alert) return;
    if (location.host === ADMIN_HOST) {
      alert.classList.add("hidden");
      alert.textContent = "";
      alert.dataset.alt = "";
      return;
    }
    alert.textContent = "Vui lòng ưu tiên dùng admin.nguyenlananh.com cho vận hành nội bộ. URL này đang ở domain public.";
    alert.classList.remove("hidden");
    alert.setAttribute("role", "status");
    const quickLink = alert.dataset?.alt;
    if (quickLink && alert.tagName === "A") {
      alert.href = quickLink;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSession();
    initAdminHostNotice();
    initHealth();
    initSettings();
    initContent();
    initDashboard();
    initMembers();
    initCreators();
    initSettingsTextArea();
    initAccountManager();
    initCommonFooter();
  });
})();
