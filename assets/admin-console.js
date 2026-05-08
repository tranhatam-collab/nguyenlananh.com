(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STORAGE_KEYS = {
    session: "nla_admin_session_v2",
    launchPack: "nla_admin_launch_pack_v2",
    siteConfig: "nla_admin_site_config_v2",
    roleMatrix: "nla_admin_role_matrix_v2",
    users: "nla_admin_users_v2",
    memberSnapshotQueue: "nla_admin_member_snapshot_queue_v1",
    adminOpsQueueKey: "nla_admin_ops_queue_key_v1",
    pendingDashboardFilters: "nla_admin_pending_dashboard_filters_v1",
    pendingReflectionPacket: "nla_admin_pending_reflection_packet_v1",
    pendingPilotPacket: "nla_admin_pending_pilot_packet_v1",
    pendingReflectionQueuePacket: "nla_admin_pending_reflection_queue_packet_v1",
    pendingPilotQueuePacket: "nla_admin_pending_pilot_queue_packet_v1"
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

  function getMemberSnapshotQueue() {
    return readJSON(STORAGE_KEYS.memberSnapshotQueue, []);
  }

  function saveMemberSnapshotQueue(items) {
    writeJSON(STORAGE_KEYS.memberSnapshotQueue, items);
  }

  function getAdminOpsQueueKey() {
    return String(localStorage.getItem(STORAGE_KEYS.adminOpsQueueKey) || "").trim();
  }

  function saveAdminOpsQueueKey(value) {
    const normalized = String(value || "").trim();
    if (!normalized) {
      localStorage.removeItem(STORAGE_KEYS.adminOpsQueueKey);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.adminOpsQueueKey, normalized);
  }

  function normalizeQueuePacketForApi(packet) {
    if (!packet || typeof packet !== "object") return null;
    const payload = packet.payload_json && typeof packet.payload_json === "object" ? packet.payload_json : {};
    const merged = {
      ...payload,
      email: packet.email || payload.email || "",
      fullName: packet.full_name || payload.fullName || "",
      profileReady: typeof packet.profile_ready === "boolean" ? packet.profile_ready : Boolean(payload.profileReady),
      latestPracticeState: packet.latest_practice_state || payload.latestPracticeState || "",
      latestPracticeLine: packet.latest_practice_line || payload.latestPracticeLine || "",
      latestPracticeDay: packet.latest_practice_day || payload.latestPracticeDay || "",
      reminderPausedUntil: packet.reminder_paused_until || payload.reminderPausedUntil || "",
      hasSavedHandoff: typeof packet.has_saved_handoff === "boolean" ? packet.has_saved_handoff : Boolean(payload.hasSavedHandoff),
      queueRecommendedRoute: packet.queue_recommended_route || payload.queueRecommendedRoute || "",
      queueLastRoutedTo: packet.queue_last_routed_to || payload.queueLastRoutedTo || "",
      queueLastRoutedAt: packet.queue_last_routed_at || payload.queueLastRoutedAt || "",
      updatedAt: packet.updated_at || payload.updatedAt || "",
      queueSavedAt: payload.queueSavedAt || packet.created_at || packet.updated_at || new Date().toISOString()
    };
    if (!String(merged.email || "").trim()) return null;
    return normalizeMemberSnapshotQueueItem(merged, merged);
  }

  async function callAdminOpsQueue(method, adminKey, { items = null, source = "", filters = null } = {}) {
    const key = String(adminKey || "").trim();
    if (!key) {
      throw new Error("ADMIN_KEY_REQUIRED");
    }

    const url = new URL("/api/admin/ops/queue", location.origin);
    if (filters && typeof filters === "object") {
      if (filters.route) url.searchParams.set("route", String(filters.route));
      if (filters.handoff) url.searchParams.set("handoff", String(filters.handoff));
      if (filters.priority) url.searchParams.set("priority", String(filters.priority));
      if (filters.limit) url.searchParams.set("limit", String(filters.limit));
    }

    const options = {
      method,
      cache: "no-store",
      headers: {
        "x-admin-key": key
      }
    };

    if (method === "POST") {
      options.headers["content-type"] = "application/json";
      options.body = JSON.stringify({
        packet_type: "admin_member_snapshot_queue",
        source: source || "admin_home_browser_queue_sync",
        items: Array.isArray(items) ? items : []
      });
    }

    const response = await fetch(`${url.pathname}${url.search}`, options);
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    if (!response.ok) {
      const code = String(payload?.error || "ADMIN_OPS_QUEUE_REQUEST_FAILED");
      const message = String(payload?.message || `HTTP ${response.status}`);
      throw new Error(`${code}: ${message}`);
    }
    return payload || {};
  }

  function normalizedQueueItemsFromApi(items, limit = 200) {
    return sortedMemberSnapshotQueue((Array.isArray(items) ? items : [])
      .map((item) => normalizeQueuePacketForApi(item))
      .filter(Boolean))
      .slice(0, Math.max(1, Number(limit) || 200));
  }

  function buildD1QueuePacket(items, filters = {}, source = "d1_admin_ops_queue") {
    return {
      packet_type: "admin_member_snapshot_queue",
      exportedAt: new Date().toISOString(),
      source,
      applied_filters: {
        route: String(filters.route || "all"),
        handoff: String(filters.handoff || "all"),
        priority: String(filters.priority || "all")
      },
      items: Array.isArray(items) ? items : []
    };
  }

  function sanitizeQueueLimit(value, fallback = 120) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return Math.max(1, Math.min(200, Number(fallback) || 120));
    return Math.max(1, Math.min(200, Math.round(parsed)));
  }

  function recommendedRouteForSnapshot(packet) {
    const state = String(packet?.latestPracticeState || "");
    if (state === "human_reflection" || state === "avoiding" || !packet?.hasSavedHandoff) {
      return "reflection";
    }
    return "pilot";
  }

  function normalizeMemberSnapshotQueueItem(packet, existing = null) {
    return {
      ...packet,
      queueRecommendedRoute: recommendedRouteForSnapshot(packet),
      queueSavedAt: existing?.queueSavedAt || new Date().toISOString(),
      queueLastRoutedTo: existing?.queueLastRoutedTo || "",
      queueLastRoutedAt: existing?.queueLastRoutedAt || ""
    };
  }

  function queueItemPriority(packet) {
    const route = String(packet?.queueRecommendedRoute || recommendedRouteForSnapshot(packet));
    const latestState = String(packet?.latestPracticeState || "");
    const routed = Boolean(packet?.queueLastRoutedTo);
    const paused = isFutureIso(packet?.reminderPausedUntil);
    const profileReady = Boolean(packet?.profileReady);
    const hasPracticeLine = Boolean(String(packet?.latestPracticeLine || "").trim());
    const hasHandoff = Boolean(packet?.hasSavedHandoff);

    if (!routed && route === "reflection" && latestState === "human_reflection") {
      return { code: "reflection_now", score: 0, labelVi: "Cần reflection ngay", labelEn: "Needs reflection now" };
    }
    if (!routed && route === "reflection" && latestState === "avoiding") {
      return { code: "avoiding", score: 1, labelVi: "Đang né, cần giữ nhịp", labelEn: "Avoiding, needs grounding" };
    }
    if (!routed && route === "reflection" && !hasHandoff) {
      return { code: "missing_handoff", score: 2, labelVi: "Thiếu handoff 3 dòng", labelEn: "Missing 3-line handoff" };
    }
    if (!routed && route === "pilot" && profileReady && hasPracticeLine && !paused) {
      return { code: "pilot_ready", score: 3, labelVi: "Sẵn rà pilot", labelEn: "Ready for pilot review" };
    }
    if (!routed && route === "pilot" && paused) {
      return { code: "paused", score: 4, labelVi: "Đang pause nhắc", labelEn: "Reminder pause active" };
    }
    if (!routed && route === "pilot") {
      return { code: "pilot_later", score: 5, labelVi: "Pilot sau khi đủ nền", labelEn: "Pilot after more groundwork" };
    }
    return { code: "routed", score: 6, labelVi: "Đã handoff", labelEn: "Already routed" };
  }

  function queueItemSortValue(packet) {
    return Date.parse(packet?.updatedAt || packet?.queueSavedAt || 0) || 0;
  }

  function sortedMemberSnapshotQueue(items) {
    return [...(Array.isArray(items) ? items : [])]
      .map((item) => ({
        ...item,
        queuePriority: queueItemPriority(item)
      }))
      .sort((a, b) => {
        const byPriority = (a.queuePriority?.score ?? 99) - (b.queuePriority?.score ?? 99);
        if (byPriority !== 0) return byPriority;
        return queueItemSortValue(b) - queueItemSortValue(a);
      });
  }

  function summarizeQueuePriorities(items) {
    const counts = {
      reflection_now: 0,
      avoiding: 0,
      missing_handoff: 0,
      pilot_ready: 0,
      paused: 0,
      pilot_later: 0,
      routed: 0
    };
    (Array.isArray(items) ? items : []).forEach((item) => {
      const code = String(item?.queuePriority?.code || "");
      if (code && Object.prototype.hasOwnProperty.call(counts, code)) {
        counts[code] += 1;
      }
    });
    return counts;
  }

  function renderPriorityQuickFilters(counts, isEnglish) {
    const config = [
      { code: "reflection_now", label: isEnglish ? "Reflection now" : "Reflection ngay" },
      { code: "avoiding", label: isEnglish ? "Avoiding" : "Đang né" },
      { code: "missing_handoff", label: isEnglish ? "Missing handoff" : "Thiếu handoff" },
      { code: "pilot_ready", label: isEnglish ? "Pilot ready" : "Sẵn pilot" },
      { code: "paused", label: isEnglish ? "Paused" : "Pause" }
    ];
    return config.map((item) => {
      const count = Number(counts?.[item.code] || 0);
      return `<button class="ghost" type="button" data-priority-quick-filter="${item.code}" ${count === 0 ? "disabled" : ""}>${safeText(item.label)} (${count})</button>`;
    }).join("");
  }

  function describeSingleQueueFilter(type, value, isEnglish) {
    if (type === "route") {
      return value === "reflection"
        ? (isEnglish ? "reflection only" : "chỉ reflection")
        : value === "pilot"
          ? (isEnglish ? "pilot only" : "chỉ pilot")
          : (isEnglish ? "all routes" : "tất cả route");
    }
    if (type === "handoff") {
      return value === "unrouted"
        ? (isEnglish ? "not routed yet" : "chưa handoff")
        : value === "routed"
          ? (isEnglish ? "already routed" : "đã handoff")
          : (isEnglish ? "all handoff states" : "tất cả trạng thái handoff");
    }
    if (type === "priority") {
      return value === "reflection_now"
        ? (isEnglish ? "needs reflection now" : "cần reflection ngay")
        : value === "avoiding"
          ? (isEnglish ? "avoiding, needs grounding" : "đang né, cần giữ nhịp")
          : value === "missing_handoff"
            ? (isEnglish ? "missing 3-line handoff" : "thiếu handoff 3 dòng")
            : value === "pilot_ready"
              ? (isEnglish ? "ready for pilot review" : "sẵn rà pilot")
              : value === "paused"
                ? (isEnglish ? "reminder pause active" : "đang pause nhắc")
                : value === "pilot_later"
                  ? (isEnglish ? "pilot after more groundwork" : "pilot sau khi đủ nền")
                  : value === "routed"
                    ? (isEnglish ? "already routed priority" : "mức ưu tiên đã handoff")
                    : (isEnglish ? "all priority levels" : "tất cả mức ưu tiên");
    }
    return "";
  }

  function countQueueWithFilters(items, filters = {}) {
    const routeFilter = String(filters.route || "all");
    const handoffFilter = String(filters.handoff || "all");
    const priorityFilter = String(filters.priority || "all");
    return (Array.isArray(items) ? items : []).filter((packet) => {
      const routePass = routeFilter === "all" || packet.queueRecommendedRoute === routeFilter;
      const handoffPass = handoffFilter === "all"
        || (handoffFilter === "routed" && Boolean(packet.queueLastRoutedTo))
        || (handoffFilter === "unrouted" && !packet.queueLastRoutedTo);
      const priorityPass = priorityFilter === "all" || packet.queuePriority?.code === priorityFilter;
      return routePass && handoffPass && priorityPass;
    }).length;
  }

  function formatPriorityMix(counts, isEnglish, codes) {
    const labels = {
      reflection_now: isEnglish ? "reflection now" : "reflection ngay",
      avoiding: isEnglish ? "avoiding" : "đang né",
      missing_handoff: isEnglish ? "missing handoff" : "thiếu handoff",
      pilot_ready: isEnglish ? "pilot ready" : "sẵn pilot",
      paused: isEnglish ? "paused" : "pause",
      pilot_later: isEnglish ? "pilot later" : "pilot sau",
      routed: isEnglish ? "already routed" : "đã handoff"
    };
    return (Array.isArray(codes) ? codes : [])
      .map((code) => `${labels[code] || code}: ${Number(counts?.[code] || 0)}`)
      .join(" • ");
  }

  function renderImportedSubsetPriorityActions(counts, codes, isEnglish) {
    return (Array.isArray(codes) ? codes : [])
      .map((code) => {
        const count = Number(counts?.[code] || 0);
        if (count <= 0) return "";
        const label = describeSingleQueueFilter("priority", code, isEnglish);
        return `<button class="ghost" type="button" data-return-dashboard-priority="${safeText(code)}">${safeText(label)} (${count})</button>`;
      })
      .filter(Boolean)
      .join("");
  }

  function renderImportedSubsetSummary(view, isEnglish, options = {}) {
    if (view?.source !== "imported_admin_intake_queue") return "";
    const queueTotal = Number(view?.queue_total || 0);
    const queueRelevant = Number(view?.queue_relevant || 0);
    const scopeLabel = describeQueueFilters(view?.applied_filters || {}, isEnglish);
    const priorityLabel = formatPriorityMix(view?.priority_breakdown || {}, isEnglish, options.priorityCodes || []);
    const title = isEnglish ? "Imported subset summary" : "Tóm tắt subset đã nạp";
    const totalLabel = isEnglish ? "Total queue items" : "Tổng item trong queue";
    const relevantLabel = isEnglish ? "Items used here" : "Item đang dùng ở đây";
    const scopeText = isEnglish ? "Filter scope" : "Phạm vi lọc";
    const priorityText = isEnglish ? "Priority mix" : "Tương quan ưu tiên";
    const actionLabel = isEnglish ? "Open same filter on admin home" : "Mở lại filter này trên admin home";
    const priorityActionLabel = isEnglish ? "Reopen one priority slice" : "Mở lại một priority slice";
    const priorityActions = renderImportedSubsetPriorityActions(view?.priority_breakdown || {}, options.priorityCodes || [], isEnglish);
    return `<div class="note" style="margin:12px 0;">
      <strong>${safeText(title)}</strong>
      <p>${safeText(totalLabel)}: ${queueTotal} • ${safeText(relevantLabel)}: ${queueRelevant}</p>
      <p>${safeText(scopeText)}: ${safeText(scopeLabel)}</p>
      <p>${safeText(priorityText)}: ${safeText(priorityLabel)}</p>
      <div class="actionsRow" style="margin-top:8px;"><button class="ghost" type="button" data-return-dashboard-filters="true">${safeText(actionLabel)}</button></div>
      ${priorityActions ? `<div style="margin-top:8px;"><p class="note" style="margin-bottom:6px;">${safeText(priorityActionLabel)}</p><div class="actionsRow">${priorityActions}</div></div>` : ""}
    </div>`;
  }

  function describeQueueFilters(filters, isEnglish) {
    const route = String(filters?.route || "all");
    const handoff = String(filters?.handoff || "all");
    const priority = String(filters?.priority || "all");
    const routeLabel = route === "reflection"
      ? (isEnglish ? "reflection only" : "chỉ reflection")
      : route === "pilot"
        ? (isEnglish ? "pilot only" : "chỉ pilot")
        : (isEnglish ? "all routes" : "tất cả route");
    const handoffLabel = handoff === "unrouted"
      ? (isEnglish ? "not routed yet" : "chưa handoff")
      : handoff === "routed"
        ? (isEnglish ? "already routed" : "đã handoff")
        : (isEnglish ? "all handoff states" : "tất cả trạng thái handoff");
    const priorityLabel = priority === "reflection_now"
      ? (isEnglish ? "needs reflection now" : "cần reflection ngay")
      : priority === "avoiding"
        ? (isEnglish ? "avoiding, needs grounding" : "đang né, cần giữ nhịp")
        : priority === "missing_handoff"
          ? (isEnglish ? "missing 3-line handoff" : "thiếu handoff 3 dòng")
          : priority === "pilot_ready"
            ? (isEnglish ? "ready for pilot review" : "sẵn rà pilot")
            : priority === "paused"
              ? (isEnglish ? "reminder pause active" : "đang pause nhắc")
              : priority === "pilot_later"
                ? (isEnglish ? "pilot after more groundwork" : "pilot sau khi đủ nền")
                : priority === "routed"
                  ? (isEnglish ? "already routed priority" : "mức ưu tiên đã handoff")
                  : (isEnglish ? "all priority levels" : "tất cả mức ưu tiên");
    return `${routeLabel} • ${handoffLabel} • ${priorityLabel}`;
  }

  function buildMemberSnapshotQueuePacket() {
    return {
      packet_type: "admin_member_snapshot_queue",
      exportedAt: new Date().toISOString(),
      items: getMemberSnapshotQueue()
    };
  }

  function buildFilteredMemberSnapshotQueuePacket(items, filters = {}) {
    return {
      packet_type: "admin_member_snapshot_queue",
      exportedAt: new Date().toISOString(),
      source: "admin_home_filtered_queue",
      applied_filters: filters,
      items: Array.isArray(items) ? items : []
    };
  }

  function normalizePendingDashboardFilters(payload) {
    const raw = payload && typeof payload === "object" && payload.filters
      ? payload
      : { filters: payload || {} };
    return {
      filters: {
        route: String(raw.filters?.route || "all"),
        handoff: String(raw.filters?.handoff || "all"),
        priority: String(raw.filters?.priority || "all")
      },
      source: String(raw.source || ""),
      sourceLabel: String(raw.sourceLabel || ""),
      sourcePath: String(raw.sourcePath || ""),
      restoredAt: String(raw.restoredAt || "")
    };
  }

  function mergeMemberSnapshotQueueItems(items) {
    const current = getMemberSnapshotQueue();
    const merged = [];
    const seen = new Set();
    [...items, ...current].forEach((packet) => {
      if (!packet || typeof packet.email !== "string" || !packet.email.trim()) return;
      const email = packet.email.trim();
      if (seen.has(email)) return;
      seen.add(email);
      const existing = current.find((item) => item.email === email) || null;
      merged.push(normalizeMemberSnapshotQueueItem(packet, existing));
    });
    saveMemberSnapshotQueue(sortedMemberSnapshotQueue(merged).slice(0, 12));
  }

  function savePendingDashboardFilters(filters) {
    if (!filters) {
      writeJSON(STORAGE_KEYS.pendingDashboardFilters, null);
      return;
    }
    writeJSON(STORAGE_KEYS.pendingDashboardFilters, normalizePendingDashboardFilters(filters));
  }

  function getPendingDashboardFilters() {
    const raw = readJSON(STORAGE_KEYS.pendingDashboardFilters, null);
    return raw ? normalizePendingDashboardFilters(raw) : null;
  }

  function clearPendingDashboardFilters() {
    localStorage.removeItem(STORAGE_KEYS.pendingDashboardFilters);
  }

  function savePendingReflectionPacket(packet) {
    writeJSON(STORAGE_KEYS.pendingReflectionPacket, packet || null);
  }

  function getPendingReflectionPacket() {
    return readJSON(STORAGE_KEYS.pendingReflectionPacket, null);
  }

  function clearPendingReflectionPacket() {
    localStorage.removeItem(STORAGE_KEYS.pendingReflectionPacket);
  }

  function savePendingPilotPacket(packet) {
    writeJSON(STORAGE_KEYS.pendingPilotPacket, packet || null);
  }

  function getPendingPilotPacket() {
    return readJSON(STORAGE_KEYS.pendingPilotPacket, null);
  }

  function clearPendingPilotPacket() {
    localStorage.removeItem(STORAGE_KEYS.pendingPilotPacket);
  }

  function savePendingReflectionQueuePacket(packet) {
    writeJSON(STORAGE_KEYS.pendingReflectionQueuePacket, packet || null);
  }

  function getPendingReflectionQueuePacket() {
    return readJSON(STORAGE_KEYS.pendingReflectionQueuePacket, null);
  }

  function clearPendingReflectionQueuePacket() {
    localStorage.removeItem(STORAGE_KEYS.pendingReflectionQueuePacket);
  }

  function savePendingPilotQueuePacket(packet) {
    writeJSON(STORAGE_KEYS.pendingPilotQueuePacket, packet || null);
  }

  function getPendingPilotQueuePacket() {
    return readJSON(STORAGE_KEYS.pendingPilotQueuePacket, null);
  }

  function clearPendingPilotQueuePacket() {
    localStorage.removeItem(STORAGE_KEYS.pendingPilotQueuePacket);
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

  function getMemberPracticeSignals() {
    const progress = readJSON("nla_member_progress", null);
    const days = progress?.practice?.days;
    if (!days || typeof days !== "object") return [];

    return Object.entries(days)
      .map(([day, item]) => ({
        day,
        practiceState: item?.practiceState || "",
        oneLine: String(item?.oneLine || "").trim(),
        needsHumanReflection: Boolean(item?.needsHumanReflection),
        updatedAt: item?.updatedAt || ""
      }))
      .filter((item) => item.practiceState === "human_reflection" || item.practiceState === "avoiding")
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  function getMemberProfiles() {
    const profiles = readJSON("nla_member_profiles", null);
    if (!profiles || typeof profiles !== "object") return [];

    return Object.entries(profiles).map(([email, profile]) => ({
      email,
      fullName: String(profile?.fullName || "").trim(),
      currentState: String(profile?.currentState || "").trim(),
      desiredShift: String(profile?.desiredShift || "").trim(),
      companionRhythm: String(profile?.companionRhythm || "").trim(),
      practiceTrack: String(profile?.practiceTrack || "").trim(),
      reminderIntensity: String(profile?.reminderIntensity || "").trim(),
      reminderPausedUntil: String(profile?.reminderPausedUntil || "").trim(),
      updatedAt: String(profile?.updatedAt || "").trim()
    }));
  }

  function getMemberReflectionHandoffs() {
    const handoffs = readJSON("nla_member_reflection_handoffs", null);
    if (!handoffs || typeof handoffs !== "object") return [];

    return Object.entries(handoffs)
      .map(([email, item]) => ({
        email,
        line1: String(item?.line1 || "").trim(),
        line2: String(item?.line2 || "").trim(),
        line3: String(item?.line3 || "").trim(),
        sourceState: String(item?.sourceState || "").trim(),
        sourceDay: String(item?.sourceDay || "").trim(),
        sourceOneLine: String(item?.sourceOneLine || "").trim(),
        updatedAt: String(item?.updatedAt || "").trim()
      }))
      .filter((item) => item.line1 || item.line2 || item.line3)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  function getLatestPracticeEntries() {
    const progress = readJSON("nla_member_progress", null);
    const days = progress?.practice?.days;
    if (!days || typeof days !== "object") return [];

    return Object.entries(days)
      .map(([day, item]) => ({
        day,
        practiceState: item?.practiceState || "",
        oneLine: String(item?.oneLine || "").trim(),
        needsHumanReflection: Boolean(item?.needsHumanReflection),
        updatedAt: item?.updatedAt || ""
      }))
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  function reflectionHandoffMatchesSignal(handoff, signal) {
    if (!handoff || !signal) return false;
    if (handoff.sourceDay && signal.day && handoff.sourceDay === signal.day) return true;
    if (handoff.sourceOneLine && signal.oneLine && handoff.sourceOneLine === signal.oneLine) return true;
    return false;
  }

  function getOpsSnapshot() {
    const signals = getMemberPracticeSignals();
    const handoffs = getMemberReflectionHandoffs();
    const profiles = getMemberProfiles();
    const latestPractice = getLatestPracticeEntries();
    const reflectionSignals = signals.filter((item) => item.practiceState === "human_reflection");
    const avoidingSignals = signals.filter((item) => item.practiceState === "avoiding");
    const readyProfiles = profiles.filter((item) => memberProfileIsComplete(item));
    const pausedProfiles = profiles.filter((item) => isFutureIso(item.reminderPausedUntil));
    const profilesWithHonestCheckin = readyProfiles.filter(() => {
      const latest = latestPractice[0];
      return Boolean(latest?.practiceState && latest?.oneLine);
    });
    const matchedHandoffs = handoffs.filter((handoff) =>
      signals.some((signal) => reflectionHandoffMatchesSignal(handoff, signal))
    );

    return {
      signals,
      handoffs,
      profiles,
      latestPractice,
      counts: {
        reflectionSignals: reflectionSignals.length,
        avoidingSignals: avoidingSignals.length,
        savedHandoffs: handoffs.length,
        matchedHandoffs: matchedHandoffs.length,
        readyProfiles: readyProfiles.length,
        pausedProfiles: pausedProfiles.length,
        readyProfilesWithCheckin: profilesWithHonestCheckin.length
      }
    };
  }

  function memberProfileIsComplete(profile) {
    return ["fullName", "currentState", "desiredShift", "companionRhythm", "practiceTrack", "reminderIntensity"]
      .every((key) => String(profile?.[key] || "").trim().length > 0);
  }

  function isFutureIso(value) {
    const time = new Date(value || 0).getTime();
    return Number.isFinite(time) && time > Date.now();
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
    const memberSnapshotImport = $("#member-snapshot-import");
    const memberSnapshotApply = $("#member-snapshot-apply");
    const memberSnapshotSave = $("#member-snapshot-save");
    const memberSnapshotClear = $("#member-snapshot-clear");
    const memberSnapshotStatus = $("#member-snapshot-status");
    const memberSnapshotView = $("#member-snapshot-view");
    const memberSnapshotQueue = $("#member-snapshot-queue");
    const memberSnapshotQueueRouteFilter = $("#member-snapshot-queue-route-filter");
    const memberSnapshotQueueHandoffFilter = $("#member-snapshot-queue-handoff-filter");
    const memberSnapshotQueuePriorityFilter = $("#member-snapshot-queue-priority-filter");
    const memberSnapshotQueueClearFilters = $("#member-snapshot-queue-clear-filters");
    const memberSnapshotQueueActiveFilters = $("#member-snapshot-queue-active-filters");
    const memberSnapshotQueuePacket = $("#member-snapshot-queue-packet");
    const memberSnapshotQueueCopy = $("#member-snapshot-queue-copy");
    const memberSnapshotQueueExport = $("#member-snapshot-queue-export");
    const memberSnapshotQueueMerge = $("#member-snapshot-queue-merge");
    const memberSnapshotQueueAdminKey = $("#member-snapshot-queue-admin-key");
    const memberSnapshotQueuePullD1 = $("#member-snapshot-queue-pull-d1");
    const memberSnapshotQueueReplaceFromD1 = $("#member-snapshot-queue-replace-from-d1");
    const memberSnapshotQueuePushD1 = $("#member-snapshot-queue-push-d1");
    const memberSnapshotQueueClearD1 = $("#member-snapshot-queue-clear-d1");
    const memberSnapshotQueueSyncStatus = $("#member-snapshot-queue-sync-status");
    const memberSnapshotQueueOpenReflection = $("#member-snapshot-queue-open-reflection");
    const memberSnapshotQueueOpenPilot = $("#member-snapshot-queue-open-pilot");
    const memberSnapshotQueueHandoffPreview = $("#member-snapshot-queue-handoff-preview");
    const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");

    const manifest = readJSON(STORAGE_KEYS.launchPack, null);
    const launchItems = Array.isArray(manifest) ? manifest : (manifest?.items || []);
    const openItems = Array.isArray(launchItems)
      ? launchItems.filter((item) => item?.status === "draft" || item?.status === "in_review" || item?.status === "review").length
      : 0;
    const published = Array.isArray(launchItems)
      ? launchItems.filter((item) => item?.status === "published").length
      : 0;
    const opsSnapshot = getOpsSnapshot();
    const reflectionCount = opsSnapshot.counts.reflectionSignals;
    const avoidingCount = opsSnapshot.counts.avoidingSignals;
    const savedHandoffs = opsSnapshot.counts.savedHandoffs;
    const matchedHandoffs = opsSnapshot.counts.matchedHandoffs;
    const pilotReadyCount = opsSnapshot.counts.readyProfiles;
    const pausedCount = opsSnapshot.counts.pausedProfiles;
    const readyWithCheckin = opsSnapshot.counts.readyProfilesWithCheckin;
    const importedMemberPackets = sortedMemberSnapshotQueue(getMemberSnapshotQueue());
    const queueReflectionReady = importedMemberPackets.filter((item) => item.queueRecommendedRoute === "reflection").length;
    const queuePilotReady = importedMemberPackets.filter((item) => item.queueRecommendedRoute === "pilot").length;
    const queueAlreadyRouted = importedMemberPackets.filter((item) => item.queueLastRoutedTo).length;
    const queuePriorityCounts = summarizeQueuePriorities(importedMemberPackets);
    let lastFilteredQueue = importedMemberPackets;
    let restoredFilterContext = null;
    let pendingFilterSourcePath = "";
    let lastD1QueueSummary = null;

    function queueFilterValues() {
      return {
        route: String(memberSnapshotQueueRouteFilter?.value || "all"),
        handoff: String(memberSnapshotQueueHandoffFilter?.value || "all"),
        priority: String(memberSnapshotQueuePriorityFilter?.value || "all")
      };
    }

    function getAdminOpsKeyFromInput() {
      return String(memberSnapshotQueueAdminKey?.value || getAdminOpsQueueKey()).trim();
    }

    function queueCountLabelFromSummary(summary) {
      if (!summary || typeof summary !== "object") return "";
      const total = Number(summary.total || 0);
      const reflection = Number(summary.routes?.reflection || 0);
      const pilot = Number(summary.routes?.pilot || 0);
      const routed = Number(summary.routes?.routed || 0);
      if (isEnglish) {
        return `D1 queue total ${total} (reflection ${reflection}, pilot ${pilot}, routed ${routed}).`;
      }
      return `Queue D1 tổng ${total} (reflection ${reflection}, pilot ${pilot}, đã handoff ${routed}).`;
    }

    function syncMessageWithSummary(message, summary) {
      const summaryLabel = queueCountLabelFromSummary(summary);
      if (!summaryLabel) return message;
      return `${message} ${summaryLabel}`;
    }

    function normalizedQueueItemsFromApi(items) {
      return sortedMemberSnapshotQueue((Array.isArray(items) ? items : [])
        .map((item) => normalizeQueuePacketForApi(item))
        .filter(Boolean));
    }

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
          <li>${safeText(isEnglish ? "Imported member packets" : "Member packet đã nhập")}: <strong>${importedMemberPackets.length}</strong></li>
          <li>${safeText(isEnglish ? "Queue -> reflection" : "Queue -> reflection")}: <strong>${queueReflectionReady}</strong></li>
          <li>${safeText(isEnglish ? "Queue -> pilot" : "Queue -> pilot")}: <strong>${queuePilotReady}</strong></li>
          <li>${safeText(isEnglish ? "Already routed" : "Đã handoff")}: <strong>${queueAlreadyRouted}</strong></li>
          <li>${safeText(isEnglish ? "Priority now" : "Ưu tiên hiện tại")}: <strong>${queuePriorityCounts.reflection_now}</strong> / <strong>${queuePriorityCounts.avoiding}</strong> / <strong>${queuePriorityCounts.missing_handoff}</strong> / <strong>${queuePriorityCounts.pilot_ready}</strong></li>
        </ul>
        <div class="actionsRow" style="margin-top:12px;">${renderPriorityQuickFilters(queuePriorityCounts, isEnglish)}</div>
      </article>
      <article class="panel">
        <h3>Reflection queue</h3>
        <ul class="list">
          <li>Human reflection: <strong>${reflectionCount}</strong></li>
          <li>Avoiding: <strong>${avoidingCount}</strong></li>
          <li>Saved handoffs: <strong>${savedHandoffs}</strong></li>
          <li>Signals with handoff: <strong>${matchedHandoffs}</strong></li>
          <li><a href="${location.pathname.startsWith("/en/") ? "/en/admin/reflection/" : "/admin/reflection/"}">Open reflection ops</a></li>
        </ul>
      </article>
      <article class="panel">
        <h3>Pilot readiness</h3>
        <ul class="list">
          <li>Ready profiles: <strong>${pilotReadyCount}</strong></li>
          <li>Ready + honest check-in: <strong>${readyWithCheckin}</strong></li>
          <li>Paused reminders: <strong>${pausedCount}</strong></li>
          <li><a href="${location.pathname.startsWith("/en/") ? "/en/admin/pilot/" : "/admin/pilot/"}">Open pilot ops</a></li>
        </ul>
      </article>
    </div>`;

    const progressPanel = $("#admin-progress");
    if (progressPanel) {
      const target = 10;
      const done = Math.min((published / Math.max(target, 1)) * 100, 100);
      progressPanel.innerHTML = `<div class="progressTrack" aria-hidden="true"><span style="width:${done.toFixed(0)}%"></span></div><p class="meta">Mục publish đã đạt: ${published}/${target}</p>`;
    }

    function renderImportedMemberSnapshot(packet) {
      if (!memberSnapshotView) return;
      if (!packet) {
        memberSnapshotView.innerHTML = "";
        return;
      }
      const paused = isFutureIso(packet.reminderPausedUntil);
      const latestStateLabel = packet.latestPracticeState === "human_reflection"
        ? (isEnglish ? "Human reflection" : "Cần người thật phản hồi")
        : packet.latestPracticeState === "avoiding"
          ? (isEnglish ? "Avoiding" : "Đang né")
          : packet.latestPracticeState === "smaller_step"
            ? (isEnglish ? "Smaller step" : "Bước nhỏ hơn")
            : packet.latestPracticeState === "done"
              ? (isEnglish ? "Done" : "Đã làm")
              : (isEnglish ? "No check-in yet" : "Chưa có check-in");
      memberSnapshotView.innerHTML = `<ul class="checkList">
        <li class="checkItem"><input type="checkbox" disabled ${packet.profileReady ? "checked" : ""}><div><strong>${safeText(packet.fullName || packet.email || "-")}</strong><p class="note">${safeText(isEnglish ? "Profile ready" : "Profile đã đủ")}: ${packet.profileReady ? safeText(isEnglish ? "yes" : "có") : safeText(isEnglish ? "no" : "chưa")}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${Boolean(packet.latestPracticeState && packet.latestPracticeLine) ? "checked" : ""}><div><strong>${safeText(isEnglish ? "Latest practice state" : "Trạng thái thực hành gần nhất")}</strong><p class="note">${safeText(packet.latestPracticeDay || "-")} • ${safeText(latestStateLabel)}</p><p>${safeText(packet.latestPracticeLine || (isEnglish ? "No honest line yet." : "Chưa có một dòng thật."))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${packet.hasSavedHandoff ? "checked" : ""}><div><strong>${safeText(isEnglish ? "Saved reflection handoff" : "Đã có reflection handoff")}</strong><p class="note">${safeText(packet.hasSavedHandoff ? (isEnglish ? "available" : "đã có") : (isEnglish ? "not yet" : "chưa có"))}</p></div></li>
        <li class="checkItem"><input type="checkbox" disabled ${!paused ? "checked" : ""}><div><strong>${safeText(isEnglish ? "Reminder pause" : "Pause reminder")}</strong><p class="note">${safeText(paused ? (isEnglish ? "still active" : "vẫn còn hiệu lực") : (isEnglish ? "clear" : "đã thông"))}</p></div></li>
      </ul>
      <div class="actionsRow" style="margin-top:12px;">
        <a class="ghost" href="${isEnglish ? "/en/admin/reflection/" : "/admin/reflection/"}">${safeText(isEnglish ? "Open reflection ops" : "Mở reflection ops")}</a>
        <a class="ghost" href="${isEnglish ? "/en/admin/pilot/" : "/admin/pilot/"}">${safeText(isEnglish ? "Open pilot ops" : "Mở pilot ops")}</a>
      </div>`;
    }

    function renderMemberSnapshotQueue() {
      if (!memberSnapshotQueue) return;
      const queue = sortedMemberSnapshotQueue(getMemberSnapshotQueue());
      const routeFilter = String(memberSnapshotQueueRouteFilter?.value || "all");
      const handoffFilter = String(memberSnapshotQueueHandoffFilter?.value || "all");
      const priorityFilter = String(memberSnapshotQueuePriorityFilter?.value || "all");
      const filteredQueue = queue.filter((packet) => {
        const routePass = routeFilter === "all" || packet.queueRecommendedRoute === routeFilter;
        const handoffPass = handoffFilter === "all"
          || (handoffFilter === "routed" && Boolean(packet.queueLastRoutedTo))
          || (handoffFilter === "unrouted" && !packet.queueLastRoutedTo);
        const priorityPass = priorityFilter === "all" || packet.queuePriority?.code === priorityFilter;
        return routePass && handoffPass && priorityPass;
      });
      lastFilteredQueue = filteredQueue;
      const filteredPriorityCounts = summarizeQueuePriorities(filteredQueue);
      if (memberSnapshotQueueOpenReflection) {
        memberSnapshotQueueOpenReflection.disabled = filteredQueue.length === 0;
        memberSnapshotQueueOpenReflection.textContent = isEnglish
          ? `Open reflection ops with filtered queue (${filteredQueue.length})`
          : `Mở reflection ops với phần đang lọc (${filteredQueue.length})`;
      }
      if (memberSnapshotQueueOpenPilot) {
        memberSnapshotQueueOpenPilot.disabled = filteredQueue.length === 0;
        memberSnapshotQueueOpenPilot.textContent = isEnglish
          ? `Open pilot ops with filtered queue (${filteredQueue.length})`
          : `Mở pilot ops với phần đang lọc (${filteredQueue.length})`;
      }
      if (memberSnapshotQueueHandoffPreview) {
        const scopeLabel = describeQueueFilters({ route: routeFilter, handoff: handoffFilter, priority: priorityFilter }, isEnglish);
        memberSnapshotQueueHandoffPreview.textContent = isEnglish
          ? `Batch handoff preview: ${filteredQueue.length} visible item(s) from ${scopeLabel}.`
          : `Xem trước batch handoff: ${filteredQueue.length} item đang hiện từ phạm vi ${scopeLabel}.`;
      }
      if (memberSnapshotQueueActiveFilters) {
        const hasActiveFilters = routeFilter !== "all" || handoffFilter !== "all" || priorityFilter !== "all";
        const restoredAction = restoredFilterContext && pendingFilterSourcePath
          ? `<div class="actionsRow" style="margin:6px 0 8px;"><button class="ghost" type="button" data-reopen-restored-source="true">${safeText(isEnglish ? `Open ${restoredFilterContext} again with this filtered queue` : `Mở lại ${restoredFilterContext} với phần đang lọc này`)}</button></div>`
          : "";
        if (!hasActiveFilters) {
          const restoredText = restoredFilterContext
            ? ` ${safeText(isEnglish ? `Restored from ${restoredFilterContext}.` : `Được mở lại từ ${restoredFilterContext}.`)}`
            : "";
          memberSnapshotQueueActiveFilters.innerHTML = `${safeText(isEnglish ? "Active queue filters: none." : "Bộ lọc queue đang dùng: không có.")}${restoredText}${restoredAction}`;
        } else {
          const label = isEnglish ? "Active queue filters:" : "Bộ lọc queue đang dùng:";
          const restoredText = restoredFilterContext
            ? `<p class="note" style="margin:0 0 6px;">${safeText(isEnglish ? `Restored from ${restoredFilterContext}.` : `Được mở lại từ ${restoredFilterContext}.`)}</p>`
            : "";
          const restoredActionBlock = restoredAction ? `${restoredAction}` : "";
          const chips = [
            routeFilter !== "all" ? { type: "route", value: routeFilter } : null,
            handoffFilter !== "all" ? { type: "handoff", value: handoffFilter } : null,
            priorityFilter !== "all" ? { type: "priority", value: priorityFilter } : null
          ].filter(Boolean);
          memberSnapshotQueueActiveFilters.innerHTML = `${restoredText}${restoredActionBlock}${safeText(label)} <span>${chips.map((chip) => {
            const nextFilters = {
              route: routeFilter,
              handoff: handoffFilter,
              priority: priorityFilter
            };
            nextFilters[chip.type] = "all";
            const nextCount = countQueueWithFilters(queue, nextFilters);
            return `<button class="ghost" type="button" data-clear-queue-filter="${safeText(chip.type)}">${safeText(describeSingleQueueFilter(chip.type, chip.value, isEnglish))} × (${nextCount})</button>`;
          }).join(" ")}</span>`;
        }
      }
      if (memberSnapshotQueueClearFilters) {
        memberSnapshotQueueClearFilters.disabled = routeFilter === "all" && handoffFilter === "all" && priorityFilter === "all";
      }
      if (memberSnapshotQueuePacket) {
        memberSnapshotQueuePacket.value = JSON.stringify(buildMemberSnapshotQueuePacket(), null, 2);
      }
      if (!queue.length) {
        memberSnapshotQueue.innerHTML = `<p class="note">${safeText(isEnglish ? "No imported member packet is saved yet." : "Chưa có member packet nào được lưu trong intake queue.")}</p>`;
        return;
      }
      if (!filteredQueue.length) {
        memberSnapshotQueue.innerHTML = `<div>
          <h4 style="margin:0 0 8px;">${safeText(isEnglish ? "Intake queue" : "Intake queue")}</h4>
          <p class="note">${safeText(isEnglish ? "No queue item matches the current filters." : "Không có item nào khớp bộ lọc hiện tại.")}</p>
        </div>`;
        return;
      }
      memberSnapshotQueue.innerHTML = `<div>
        <h4 style="margin:0 0 8px;">${safeText(isEnglish ? "Intake queue" : "Intake queue")}</h4>
        <p class="note">${safeText(isEnglish ? "Reflection-ready" : "Sẵn cho reflection")}: ${queue.filter((packet) => packet.queueRecommendedRoute === "reflection").length} • ${safeText(isEnglish ? "Pilot-ready" : "Sẵn cho pilot")}: ${queue.filter((packet) => packet.queueRecommendedRoute === "pilot").length} • ${safeText(isEnglish ? "Already routed" : "Đã handoff")}: ${queue.filter((packet) => packet.queueLastRoutedTo).length} • ${safeText(isEnglish ? "Visible now" : "Đang hiện")}: ${filteredQueue.length}</p>
        <p class="note">${safeText(isEnglish ? "Priority now" : "Ưu tiên hiện tại")}: ${safeText(isEnglish ? "reflection-now" : "reflection-ngay")}: ${filteredPriorityCounts.reflection_now} • ${safeText(isEnglish ? "avoiding" : "đang né")}: ${filteredPriorityCounts.avoiding} • ${safeText(isEnglish ? "missing handoff" : "thiếu handoff")}: ${filteredPriorityCounts.missing_handoff} • ${safeText(isEnglish ? "pilot-ready" : "sẵn pilot")}: ${filteredPriorityCounts.pilot_ready} • ${safeText(isEnglish ? "paused" : "pause")}: ${filteredPriorityCounts.paused}</p>
        <div class="actionsRow" style="margin:8px 0 12px;">${renderPriorityQuickFilters(filteredPriorityCounts, isEnglish)}</div>
        <ul class="checkList">${filteredQueue.map((packet) => {
          const paused = isFutureIso(packet.reminderPausedUntil);
          const latestState = packet.latestPracticeState || (isEnglish ? "no check-in yet" : "chưa có check-in");
          const routeLabel = packet.queueRecommendedRoute === "reflection"
            ? (isEnglish ? "Reflection ops" : "Reflection ops")
            : (isEnglish ? "Pilot ops" : "Pilot ops");
          const priorityLabel = isEnglish ? packet.queuePriority?.labelEn : packet.queuePriority?.labelVi;
          const routedLabel = packet.queueLastRoutedTo
            ? `${packet.queueLastRoutedTo === "reflection" ? (isEnglish ? "Reflection ops" : "Reflection ops") : (isEnglish ? "Pilot ops" : "Pilot ops")} • ${safeText(packet.queueLastRoutedAt || "-")}`
            : (isEnglish ? "not routed yet" : "chưa handoff");
          return `<li class="checkItem"><input type="checkbox" disabled ${packet.profileReady ? "checked" : ""}><div>
            <strong>${safeText(packet.fullName || packet.email || "-")}</strong>
            <p class="note">${safeText(packet.email || "-")} • ${safeText(packet.updatedAt || "-")}</p>
            <p class="note">${safeText(isEnglish ? "Latest state" : "Trạng thái gần nhất")}: ${safeText(latestState)} • ${safeText(isEnglish ? "Pause" : "Pause")}: ${safeText(paused ? (isEnglish ? "active" : "đang mở") : (isEnglish ? "clear" : "đã thông"))}</p>
            <p class="note">${safeText(isEnglish ? "Recommended route" : "Route gợi ý")}: ${safeText(routeLabel)} • ${safeText(isEnglish ? "Last handoff" : "Handoff gần nhất")}: ${safeText(routedLabel)}</p>
            <p class="note">${safeText(isEnglish ? "Priority" : "Ưu tiên")}: ${safeText(priorityLabel || "-")}</p>
            <div class="actionsRow" style="margin-top:8px;">
              <button class="ghost" type="button" data-member-queue-action="reflection" data-member-queue-email="${safeText(packet.email || "")}">${safeText(isEnglish ? "Send to reflection ops" : "Gửi sang reflection ops")}</button>
              <button class="ghost" type="button" data-member-queue-action="pilot" data-member-queue-email="${safeText(packet.email || "")}">${safeText(isEnglish ? "Send to pilot ops" : "Gửi sang pilot ops")}</button>
              <button class="ghost" type="button" data-member-queue-action="remove" data-member-queue-email="${safeText(packet.email || "")}">${safeText(isEnglish ? "Remove" : "Bỏ item này")}</button>
            </div>
          </div></li>`;
        }).join("")}</ul>
      </div>`;
    }

    const pendingFilters = getPendingDashboardFilters();
    if (pendingFilters) {
      if (memberSnapshotQueueRouteFilter && typeof pendingFilters.filters?.route === "string") {
        memberSnapshotQueueRouteFilter.value = pendingFilters.filters.route;
      }
      if (memberSnapshotQueueHandoffFilter && typeof pendingFilters.filters?.handoff === "string") {
        memberSnapshotQueueHandoffFilter.value = pendingFilters.filters.handoff;
      }
      if (memberSnapshotQueuePriorityFilter && typeof pendingFilters.filters?.priority === "string") {
        memberSnapshotQueuePriorityFilter.value = pendingFilters.filters.priority;
      }
      restoredFilterContext = pendingFilters.sourceLabel || pendingFilters.source || "";
      pendingFilterSourcePath = pendingFilters.sourcePath || "";
      clearPendingDashboardFilters();
    }

    if (memberSnapshotQueueAdminKey) {
      memberSnapshotQueueAdminKey.value = getAdminOpsQueueKey();
      memberSnapshotQueueAdminKey.addEventListener("input", () => {
        saveAdminOpsQueueKey(memberSnapshotQueueAdminKey.value || "");
      });
      memberSnapshotQueueAdminKey.addEventListener("blur", () => {
        saveAdminOpsQueueKey(memberSnapshotQueueAdminKey.value || "");
      });
    }

    memberSnapshotQueueRouteFilter?.addEventListener("change", () => {
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    memberSnapshotQueueHandoffFilter?.addEventListener("change", () => {
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    memberSnapshotQueuePriorityFilter?.addEventListener("change", () => {
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    memberSnapshotQueueClearFilters?.addEventListener("click", () => {
      if (memberSnapshotQueueRouteFilter) memberSnapshotQueueRouteFilter.value = "all";
      if (memberSnapshotQueueHandoffFilter) memberSnapshotQueueHandoffFilter.value = "all";
      if (memberSnapshotQueuePriorityFilter) memberSnapshotQueuePriorityFilter.value = "all";
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    memberSnapshotQueueActiveFilters?.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-reopen-restored-source]");
      if (!trigger || !pendingFilterSourcePath) return;
      const packet = buildFilteredMemberSnapshotQueuePacket(lastFilteredQueue, {
        route: String(memberSnapshotQueueRouteFilter?.value || "all"),
        handoff: String(memberSnapshotQueueHandoffFilter?.value || "all"),
        priority: String(memberSnapshotQueuePriorityFilter?.value || "all")
      });
      if (pendingFilterSourcePath.includes("/reflection/")) {
        savePendingReflectionQueuePacket(packet);
      } else if (pendingFilterSourcePath.includes("/pilot/")) {
        savePendingPilotQueuePacket(packet);
      }
      window.location.href = pendingFilterSourcePath;
    });

    memberSnapshotQueueActiveFilters?.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-clear-queue-filter]");
      if (!trigger) return;
      const type = String(trigger.getAttribute("data-clear-queue-filter") || "");
      if (type === "route" && memberSnapshotQueueRouteFilter) memberSnapshotQueueRouteFilter.value = "all";
      if (type === "handoff" && memberSnapshotQueueHandoffFilter) memberSnapshotQueueHandoffFilter.value = "all";
      if (type === "priority" && memberSnapshotQueuePriorityFilter) memberSnapshotQueuePriorityFilter.value = "all";
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    container.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-priority-quick-filter]");
      if (!trigger || !memberSnapshotQueuePriorityFilter) return;
      const code = String(trigger.getAttribute("data-priority-quick-filter") || "all");
      memberSnapshotQueuePriorityFilter.value = code;
      restoredFilterContext = null;
      pendingFilterSourcePath = "";
      renderMemberSnapshotQueue();
    });

    memberSnapshotApply?.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(memberSnapshotImport?.value || "{}");
        const isMemberPacket = parsed?.packet_type === "member_ops_snapshot"
          && typeof parsed?.email === "string";
        if (!isMemberPacket) {
          throw new Error("INVALID_MEMBER_SNAPSHOT");
        }
        renderImportedMemberSnapshot(parsed);
        renderStatus(memberSnapshotStatus, isEnglish ? "Loaded member snapshot packet." : "Đã nạp member snapshot packet.", "ok");
      } catch (_error) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Unable to parse member snapshot packet." : "Không parse được member snapshot packet.", "danger");
      }
    });

    memberSnapshotSave?.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(memberSnapshotImport?.value || "{}");
        const isMemberPacket = parsed?.packet_type === "member_ops_snapshot"
          && typeof parsed?.email === "string";
        if (!isMemberPacket) {
          throw new Error("INVALID_MEMBER_SNAPSHOT");
        }
        const existing = getMemberSnapshotQueue().find((item) => item.email === parsed.email) || null;
        const queue = getMemberSnapshotQueue().filter((item) => item.email !== parsed.email);
        queue.unshift(normalizeMemberSnapshotQueueItem(parsed, existing));
        saveMemberSnapshotQueue(sortedMemberSnapshotQueue(queue).slice(0, 12));
        renderMemberSnapshotQueue();
        renderStatus(memberSnapshotStatus, isEnglish ? "Saved member snapshot to intake queue." : "Đã lưu member snapshot vào intake queue.", "ok");
      } catch (_error) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Unable to save member snapshot packet." : "Không lưu được member snapshot packet.", "danger");
      }
    });

    memberSnapshotClear?.addEventListener("click", () => {
      saveMemberSnapshotQueue([]);
      renderMemberSnapshotQueue();
      renderStatus(memberSnapshotStatus, isEnglish ? "Cleared intake queue." : "Đã xóa intake queue.", "ok");
    });

    memberSnapshotQueueCopy?.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(JSON.stringify(buildMemberSnapshotQueuePacket(), null, 2));
        renderStatus(memberSnapshotStatus, isEnglish ? "Copied intake queue packet." : "Đã copy intake queue packet.", "ok");
      } catch (_error) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Unable to copy intake queue packet." : "Không copy được intake queue packet.", "danger");
      }
    });

    memberSnapshotQueueExport?.addEventListener("click", () => {
      try {
        const blob = new Blob([JSON.stringify(buildMemberSnapshotQueuePacket(), null, 2)], { type: "application/json;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `member-snapshot-queue-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        renderStatus(memberSnapshotStatus, isEnglish ? "Exported intake queue packet." : "Đã export intake queue packet.", "ok");
      } catch (_error) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Unable to export intake queue packet." : "Không export được intake queue packet.", "danger");
      }
    });

    memberSnapshotQueueMerge?.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(memberSnapshotQueuePacket?.value || "{}");
        const isQueuePacket = parsed?.packet_type === "admin_member_snapshot_queue"
          && Array.isArray(parsed?.items);
        if (!isQueuePacket) {
          throw new Error("INVALID_MEMBER_QUEUE_PACKET");
        }
        mergeMemberSnapshotQueueItems(parsed.items);
        renderMemberSnapshotQueue();
        renderStatus(memberSnapshotStatus, isEnglish ? "Merged intake queue packet." : "Đã merge intake queue packet.", "ok");
      } catch (_error) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Unable to merge intake queue packet." : "Không merge được intake queue packet.", "danger");
      }
    });

    function setQueueSyncBusy(isBusy) {
      [memberSnapshotQueuePullD1, memberSnapshotQueueReplaceFromD1, memberSnapshotQueuePushD1, memberSnapshotQueueClearD1]
        .filter(Boolean)
        .forEach((button) => {
          button.disabled = Boolean(isBusy);
        });
    }

    async function loadQueueFromD1({ replaceLocal = false } = {}) {
      const adminKey = getAdminOpsKeyFromInput();
      if (!adminKey) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? "Enter admin ops key before syncing D1 queue." : "Nhập admin ops key trước khi sync queue D1.",
          "danger"
        );
        return;
      }
      setQueueSyncBusy(true);
      try {
        const filters = queueFilterValues();
        const payload = await callAdminOpsQueue("GET", adminKey, {
          filters: { ...filters, limit: 200 }
        });
        saveAdminOpsQueueKey(adminKey);
        const normalized = normalizedQueueItemsFromApi(payload.items).slice(0, 200);
        if (replaceLocal) {
          saveMemberSnapshotQueue(normalized.slice(0, 12));
        } else {
          mergeMemberSnapshotQueueItems(normalized);
        }
        renderMemberSnapshotQueue();
        lastD1QueueSummary = payload.summary || null;
        const actionLabel = replaceLocal
          ? (isEnglish ? "Replaced local queue from D1." : "Đã replace local queue từ D1.")
          : (isEnglish ? "Merged D1 queue into local intake queue." : "Đã merge queue D1 vào intake queue local.");
        renderStatus(
          memberSnapshotQueueSyncStatus,
          syncMessageWithSummary(`${actionLabel} ${isEnglish ? "Loaded" : "Nạp"} ${normalized.length} item(s).`, lastD1QueueSummary),
          "ok"
        );
      } catch (error) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? `Unable to load queue from D1: ${error.message}` : `Không nạp được queue từ D1: ${error.message}`,
          "danger"
        );
      } finally {
        setQueueSyncBusy(false);
      }
    }

    memberSnapshotQueuePullD1?.addEventListener("click", async () => {
      await loadQueueFromD1({ replaceLocal: false });
    });

    memberSnapshotQueueReplaceFromD1?.addEventListener("click", async () => {
      await loadQueueFromD1({ replaceLocal: true });
    });

    memberSnapshotQueuePushD1?.addEventListener("click", async () => {
      const adminKey = getAdminOpsKeyFromInput();
      if (!adminKey) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? "Enter admin ops key before pushing to D1." : "Nhập admin ops key trước khi đẩy lên D1.",
          "danger"
        );
        return;
      }
      const localItems = getMemberSnapshotQueue();
      if (!localItems.length) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? "Local intake queue is empty." : "Intake queue local đang trống.",
          "danger"
        );
        return;
      }
      setQueueSyncBusy(true);
      try {
        const payload = await callAdminOpsQueue("POST", adminKey, {
          items: localItems.slice(0, 200),
          source: "admin_home_local_queue_push"
        });
        saveAdminOpsQueueKey(adminKey);
        lastD1QueueSummary = payload.summary || null;
        renderStatus(
          memberSnapshotQueueSyncStatus,
          syncMessageWithSummary(
            isEnglish
              ? `Pushed ${Math.min(localItems.length, 200)} local item(s) to D1 queue.`
              : `Đã đẩy ${Math.min(localItems.length, 200)} item local lên queue D1.`,
            lastD1QueueSummary
          ),
          "ok"
        );
      } catch (error) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? `Unable to push queue to D1: ${error.message}` : `Không đẩy được queue lên D1: ${error.message}`,
          "danger"
        );
      } finally {
        setQueueSyncBusy(false);
      }
    });

    memberSnapshotQueueClearD1?.addEventListener("click", async () => {
      const adminKey = getAdminOpsKeyFromInput();
      if (!adminKey) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? "Enter admin ops key before clearing D1 queue." : "Nhập admin ops key trước khi xóa queue D1.",
          "danger"
        );
        return;
      }
      setQueueSyncBusy(true);
      try {
        await callAdminOpsQueue("DELETE", adminKey);
        saveAdminOpsQueueKey(adminKey);
        lastD1QueueSummary = { total: 0, routes: { reflection: 0, pilot: 0, routed: 0 } };
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? "Cleared D1 queue." : "Đã xóa queue trên D1.",
          "ok"
        );
      } catch (error) {
        renderStatus(
          memberSnapshotQueueSyncStatus,
          isEnglish ? `Unable to clear D1 queue: ${error.message}` : `Không xóa được queue D1: ${error.message}`,
          "danger"
        );
      } finally {
        setQueueSyncBusy(false);
      }
    });

    memberSnapshotQueueOpenReflection?.addEventListener("click", () => {
      const packet = buildFilteredMemberSnapshotQueuePacket(lastFilteredQueue, {
        route: String(memberSnapshotQueueRouteFilter?.value || "all"),
        handoff: String(memberSnapshotQueueHandoffFilter?.value || "all"),
        priority: String(memberSnapshotQueuePriorityFilter?.value || "all")
      });
      savePendingReflectionQueuePacket(packet);
      window.location.href = isEnglish ? "/en/admin/reflection/" : "/admin/reflection/";
    });

    memberSnapshotQueueOpenPilot?.addEventListener("click", () => {
      const packet = buildFilteredMemberSnapshotQueuePacket(lastFilteredQueue, {
        route: String(memberSnapshotQueueRouteFilter?.value || "all"),
        handoff: String(memberSnapshotQueueHandoffFilter?.value || "all"),
        priority: String(memberSnapshotQueuePriorityFilter?.value || "all")
      });
      savePendingPilotQueuePacket(packet);
      window.location.href = isEnglish ? "/en/admin/pilot/" : "/admin/pilot/";
    });

    memberSnapshotQueue?.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-member-queue-action]");
      if (!trigger) return;
      const email = String(trigger.getAttribute("data-member-queue-email") || "");
      const action = String(trigger.getAttribute("data-member-queue-action") || "");
      if (action === "remove") {
        saveMemberSnapshotQueue(sortedMemberSnapshotQueue(getMemberSnapshotQueue().filter((item) => item.email !== email)));
        renderMemberSnapshotQueue();
        renderStatus(memberSnapshotStatus, isEnglish ? "Removed packet from intake queue." : "Đã bỏ packet khỏi intake queue.", "ok");
        return;
      }
      const packet = getMemberSnapshotQueue().find((item) => item.email === email);
      if (!packet) {
        renderStatus(memberSnapshotStatus, isEnglish ? "Packet not found in queue." : "Không tìm thấy packet trong queue.", "danger");
        return;
      }
      if (action === "reflection") {
        saveMemberSnapshotQueue(sortedMemberSnapshotQueue(getMemberSnapshotQueue().map((item) =>
          item.email === email
            ? { ...item, queueLastRoutedTo: "reflection", queueLastRoutedAt: new Date().toISOString() }
            : item
        )));
        renderMemberSnapshotQueue();
        savePendingReflectionPacket({
          ...packet,
          queueLastRoutedTo: "reflection",
          queueLastRoutedAt: new Date().toISOString()
        });
        window.location.href = isEnglish ? "/en/admin/reflection/" : "/admin/reflection/";
        return;
      }
      if (action === "pilot") {
        saveMemberSnapshotQueue(sortedMemberSnapshotQueue(getMemberSnapshotQueue().map((item) =>
          item.email === email
            ? { ...item, queueLastRoutedTo: "pilot", queueLastRoutedAt: new Date().toISOString() }
            : item
        )));
        renderMemberSnapshotQueue();
        savePendingPilotPacket({
          ...packet,
          queueLastRoutedTo: "pilot",
          queueLastRoutedAt: new Date().toISOString()
        });
        window.location.href = isEnglish ? "/en/admin/pilot/" : "/admin/pilot/";
      }
    });

    renderMemberSnapshotQueue();
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
      const opsSnapshot = getOpsSnapshot();
      memberLog.innerHTML = `<ul class="list"><li>Đề xuất: chuyển sang DB-driven theo sprint 2 để có real-time metrics.</li><li>Mở module reflection để xử lý tín hiệu <strong>tôi đang né</strong> và <strong>tôi cần người thật phản hồi</strong>.</li><li>Hiện có <strong>${opsSnapshot.counts.savedHandoffs}</strong> handoff 3 dòng đã được lưu local và <strong>${opsSnapshot.counts.readyProfilesWithCheckin}</strong> hồ sơ đã đủ profile + check-in để rà vào pilot.</li></ul>`;
    }
  }

  function initReflection() {
    const status = $("#reflection-status");
    const summary = $("#reflection-summary");
    const list = $("#reflection-list");
    const log = $("#reflection-log");
    const evidenceOutput = $("#reflection-evidence-output");
    const evidenceImport = $("#reflection-evidence-import");
    const evidenceStatus = $("#reflection-evidence-status");
    const d1Status = $("#reflection-evidence-d1-status");
    const d1KeyInput = $("#reflection-d1-admin-key");
    const d1HandoffFilter = $("#reflection-d1-handoff-filter");
    const d1PriorityFilter = $("#reflection-d1-priority-filter");
    const d1LimitInput = $("#reflection-d1-limit");
    const d1Load = $("#reflection-evidence-load-d1");
    const evidenceCopy = $("#reflection-evidence-copy");
    const evidenceExport = $("#reflection-evidence-export");
    const evidenceApply = $("#reflection-evidence-apply");
    const evidenceReset = $("#reflection-evidence-reset");
    if (!status && !list && !log) return;

    const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    const opsSnapshot = getOpsSnapshot();
    const signals = opsSnapshot.signals;
    const handoffs = opsSnapshot.handoffs;
    const reflectionItems = signals.filter((item) => item.practiceState === "human_reflection");
    const avoidingItems = signals.filter((item) => item.practiceState === "avoiding");
    let lastReflectionImportedFilters = null;
    const matchedHandoffs = handoffs.filter((handoff) =>
      signals.some((signal) => reflectionHandoffMatchesSignal(handoff, signal))
    );

    if (d1KeyInput) {
      d1KeyInput.value = getAdminOpsQueueKey();
      d1KeyInput.addEventListener("input", () => {
        saveAdminOpsQueueKey(d1KeyInput.value || "");
      });
      d1KeyInput.addEventListener("blur", () => {
        saveAdminOpsQueueKey(d1KeyInput.value || "");
      });
    }

    function renderReflectionView(view) {
      const items = Array.isArray(view?.signals) ? view.signals : [];
      const humanReflectionCount = Number(view?.human_reflection || 0);
      const avoidingCount = Number(view?.avoiding || 0);
      const queueTotal = Number(view?.queue_total || 0);
      const queueRelevant = Number(view?.queue_relevant || 0);
      const sourceLabel = view?.source === "imported_reflection_ops"
        ? (isEnglish ? "imported evidence packet" : "evidence packet đã import")
        : view?.source === "imported_member_reflection_handoff"
          ? (isEnglish ? "member handoff packet" : "handoff packet của thành viên")
        : view?.source === "imported_admin_intake_queue"
            ? (isEnglish ? "intake queue packet" : "intake queue packet")
          : (isEnglish ? "local browser data" : "dữ liệu local của trình duyệt");
      const queueFilterLabel = view?.source === "imported_admin_intake_queue" && view?.applied_filters
        ? describeQueueFilters(view.applied_filters, isEnglish)
        : "";
      lastReflectionImportedFilters = view?.source === "imported_admin_intake_queue"
        ? (view.applied_filters || {})
        : null;
      const queuePriorityLabel = view?.source === "imported_admin_intake_queue"
        ? formatPriorityMix(view?.priority_breakdown || {}, isEnglish, ["reflection_now", "avoiding", "missing_handoff", "routed"])
        : "";

      if (status) {
        if (view?.source === "imported_admin_intake_queue") {
          status.textContent = isEnglish
            ? `Loaded ${queueRelevant} reflection-ready entries from an intake queue packet with ${queueTotal} total items. Filter scope: ${queueFilterLabel || "all routes • all handoff states"}. Priority mix: ${queuePriorityLabel}. ${humanReflectionCount} need human reflection, ${avoidingCount} are marked avoiding, and ${matchedHandoffs.length} already include a saved 3-line handoff.`
            : `Đã nạp ${queueRelevant} entry sẵn cho reflection từ intake queue packet có tổng ${queueTotal} item. Phạm vi lọc: ${queueFilterLabel || "tất cả route • tất cả trạng thái handoff"}. Tương quan ưu tiên: ${queuePriorityLabel}. ${humanReflectionCount} tín hiệu cần người thật phản hồi, ${avoidingCount} tín hiệu đang né, và ${matchedHandoffs.length} tín hiệu đã có handoff 3 dòng.`;
        } else {
          status.textContent = isEnglish
            ? `Showing ${items.length} recent practice signals from ${sourceLabel}. ${humanReflectionCount} need human reflection, ${avoidingCount} are marked avoiding, and ${matchedHandoffs.length} already include a saved 3-line handoff.`
            : `Đang hiển thị ${items.length} tín hiệu thực hành gần đây từ ${sourceLabel}. ${humanReflectionCount} tín hiệu cần người thật phản hồi, ${avoidingCount} tín hiệu đang né, và ${matchedHandoffs.length} tín hiệu đã có handoff 3 dòng.`;
        }
      }

      if (list) {
        if (!items.length) {
          list.innerHTML = isEnglish
            ? `<p class="note">No reflection evidence is available yet. Keep using this module as the triage contract until the queue moves to D1-backed persistence.</p>`
            : `<p class="note">Chưa có reflection evidence nào. Tiếp tục dùng module này như khung triage cho tới khi hàng đợi chuyển sang persistence có D1.</p>`;
        } else {
          list.innerHTML = `${renderImportedSubsetSummary(view, isEnglish, { priorityCodes: ["reflection_now", "avoiding", "missing_handoff", "routed"] })}<ul class="checkList">${items.map((item) => {
            const handoff = handoffs.find((entry) => reflectionHandoffMatchesSignal(entry, item));
            const stateLabel = item.practiceState === "human_reflection"
              ? (isEnglish ? "Needs human reflection" : "Cần phản hồi người thật")
              : (isEnglish ? "Avoiding" : "Đang né");
            const dayLabel = isEnglish ? "Day" : "Ngày";
            const line = item.oneLine || (isEnglish ? "No honest line recorded." : "Chưa có một dòng thật.");
            const handoffBlock = handoff
              ? `<div class="note" style="margin-top:8px;">
                  <strong>${safeText(isEnglish ? "Saved 3-line handoff" : "Đã có handoff 3 dòng")}</strong>
                  <p>${safeText(handoff.line1 || "-")}</p>
                  <p>${safeText(handoff.line2 || "-")}</p>
                  <p>${safeText(handoff.line3 || "-")}</p>
                </div>`
              : "";
            return `<li class="checkItem"><input type="checkbox" disabled ${item.practiceState === "human_reflection" ? "checked" : ""}><div><strong>${safeText(stateLabel)}</strong><p class="note">${dayLabel}: ${safeText(item.day)} • ${safeText(item.updatedAt || "-")}</p><p>${safeText(line)}</p>${handoffBlock}</div></li>`;
          }).join("")}</ul>`;
        }
      }

    }

    if (log) {
      log.innerHTML = isEnglish
        ? `<ul class="list">
            <li>Respond with one grounding line, one reflected pattern, and one next small step.</li>
            <li>Escalate outside the site if the note suggests medical, mental-health, legal, or safety crisis.</li>
            <li>This queue is browser-local for now. Do not call it complete production ops until D1 or admin API persistence is added.</li>
          </ul>`
        : `<ul class="list">
            <li>Phản hồi bằng một dòng neo lại, một điều soi lại, và một bước nhỏ tiếp theo.</li>
            <li>Chuyển ra ngoài website nếu ghi chú cho thấy khủng hoảng y tế, tâm lý, pháp lý, hoặc an toàn.</li>
            <li>Queue này hiện là local theo trình duyệt. Chưa được gọi là production ops hoàn chỉnh cho tới khi có D1 hoặc admin API persistence.</li>
          </ul>`;
    }

    const evidence = {
      generatedAt: new Date().toISOString(),
      source: "browser_local_reflection_ops",
      total_signals: signals.length,
      human_reflection: reflectionItems.length,
      avoiding: avoidingItems.length,
      saved_handoffs: handoffs.length,
      matched_handoffs: matchedHandoffs.length,
      next_gate: reflectionItems.length
        ? (isEnglish ? "Human reflection signals are waiting for a short grounded reply. Prioritize the ones that already include a saved handoff." : "Các tín hiệu cần người thật phản hồi đang chờ một hồi đáp ngắn và neo lại. Hãy ưu tiên những tín hiệu đã có handoff được lưu.")
        : (isEnglish ? "No human reflection signal is waiting right now." : "Hiện chưa có tín hiệu nào đang chờ người thật phản hồi."),
      signals: signals.map((item) => ({
        day: item.day || "",
        practiceState: item.practiceState || "",
        oneLine: item.oneLine || "",
        updatedAt: item.updatedAt || ""
      })),
      handoffs
    };

    if (evidenceOutput) {
      evidenceOutput.value = JSON.stringify(evidence, null, 2);
    }

    renderReflectionView(evidence);

    function handleReflectionSubsetAction(event) {
      const trigger = event.target.closest("[data-return-dashboard-filters]");
      if (!trigger || !lastReflectionImportedFilters) return;
      savePendingDashboardFilters({
        filters: lastReflectionImportedFilters,
        source: "reflection_ops",
        sourceLabel: isEnglish ? "reflection ops" : "reflection ops",
        sourcePath: isEnglish ? "/en/admin/reflection/" : "/admin/reflection/",
        restoredAt: new Date().toISOString()
      });
      window.location.href = isEnglish ? "/en/admin/" : "/admin/";
    }

    function handleReflectionPriorityAction(event) {
      const trigger = event.target.closest("[data-return-dashboard-priority]");
      if (!trigger || !lastReflectionImportedFilters) return;
      savePendingDashboardFilters({
        filters: {
          ...lastReflectionImportedFilters,
          priority: trigger.getAttribute("data-return-dashboard-priority") || "all"
        },
        source: "reflection_ops_priority_slice",
        sourceLabel: isEnglish ? "reflection ops priority slice" : "priority slice từ reflection ops",
        sourcePath: isEnglish ? "/en/admin/reflection/" : "/admin/reflection/",
        restoredAt: new Date().toISOString()
      });
      window.location.href = isEnglish ? "/en/admin/" : "/admin/";
    }

    list?.addEventListener("click", handleReflectionSubsetAction);
    list?.addEventListener("click", handleReflectionPriorityAction);
    summary?.addEventListener("click", handleReflectionSubsetAction);
    summary?.addEventListener("click", handleReflectionPriorityAction);

    if (evidenceCopy) {
      evidenceCopy.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(evidenceOutput?.value || "");
          renderStatus(evidenceStatus, isEnglish ? "Copied reflection evidence." : "Đã copy reflection evidence.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to copy reflection evidence." : "Không copy được reflection evidence.", "danger");
        }
      });
    }

    if (evidenceExport) {
      evidenceExport.addEventListener("click", () => {
        try {
          const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `reflection-evidence-${new Date().toISOString().slice(0, 10)}.json`;
          link.click();
          URL.revokeObjectURL(link.href);
          renderStatus(evidenceStatus, isEnglish ? "Exported reflection evidence." : "Đã export reflection evidence.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to export reflection evidence." : "Không export được reflection evidence.", "danger");
        }
      });
    }

    d1Load?.addEventListener("click", async () => {
      const adminKey = String(d1KeyInput?.value || getAdminOpsQueueKey()).trim();
      if (!adminKey) {
        renderStatus(
          d1Status,
          isEnglish ? "Enter admin ops key before loading D1 queue." : "Nhập admin ops key trước khi nạp queue D1.",
          "danger"
        );
        return;
      }
      const handoff = String(d1HandoffFilter?.value || "all");
      const priority = String(d1PriorityFilter?.value || "all");
      const limit = sanitizeQueueLimit(d1LimitInput?.value, 120);
      if (d1LimitInput) d1LimitInput.value = String(limit);
      d1Load.disabled = true;
      try {
        const payload = await callAdminOpsQueue("GET", adminKey, {
          filters: { route: "reflection", handoff, priority, limit }
        });
        saveAdminOpsQueueKey(adminKey);
        const normalized = normalizedQueueItemsFromApi(payload.items, limit);
        mergeMemberSnapshotQueueItems(normalized);
        const queuePacket = buildD1QueuePacket(
          normalized,
          { route: "reflection", handoff, priority },
          "d1_admin_ops_queue_reflection"
        );
        if (evidenceImport) {
          evidenceImport.value = JSON.stringify(queuePacket, null, 2);
        }
        evidenceApply?.click();
        const summaryCounts = payload.summary && typeof payload.summary === "object"
          ? ` (${Number(payload.summary.total || 0)} total)`
          : "";
        renderStatus(
          d1Status,
          isEnglish
            ? `Loaded ${normalized.length} queue item(s) from D1 into reflection import using ${describeQueueFilters({ route: "reflection", handoff, priority }, true)} and merged them into admin home queue${summaryCounts}.`
            : `Đã nạp ${normalized.length} item từ queue D1 vào reflection import với ${describeQueueFilters({ route: "reflection", handoff, priority }, false)} và đã merge vào queue của admin home${summaryCounts}.`,
          "ok"
        );
      } catch (error) {
        renderStatus(
          d1Status,
          isEnglish ? `Unable to load D1 queue: ${error.message}` : `Không nạp được queue D1: ${error.message}`,
          "danger"
        );
      } finally {
        d1Load.disabled = false;
      }
    });

    if (evidenceApply) {
      evidenceApply.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(evidenceImport?.value || "{}");
          if (Array.isArray(parsed.signals)) {
            const imported = {
              ...parsed,
              source: "imported_reflection_ops"
            };
            renderReflectionView(imported);
            renderStatus(evidenceStatus, isEnglish ? "Loaded pasted reflection evidence." : "Đã nạp reflection evidence đã dán.", "ok");
            return;
          }

          const isQueuePacket = parsed?.packet_type === "admin_member_snapshot_queue"
            && Array.isArray(parsed?.items);
          if (isQueuePacket) {
            const relevantItems = parsed.items.filter((item) => recommendedRouteForSnapshot(item) === "reflection");
            const imported = {
              generatedAt: new Date().toISOString(),
              source: "imported_admin_intake_queue",
              applied_filters: parsed.applied_filters || null,
              queue_total: parsed.items.length,
              queue_relevant: relevantItems.length,
              priority_breakdown: summarizeQueuePriorities(relevantItems),
              total_signals: relevantItems.filter((item) => item.latestPracticeState === "human_reflection" || item.latestPracticeState === "avoiding").length,
              human_reflection: relevantItems.filter((item) => item.latestPracticeState === "human_reflection").length,
              avoiding: relevantItems.filter((item) => item.latestPracticeState === "avoiding").length,
              saved_handoffs: relevantItems.filter((item) => item.hasSavedHandoff).length,
              matched_handoffs: relevantItems.filter((item) => item.hasSavedHandoff && (item.latestPracticeState === "human_reflection" || item.latestPracticeState === "avoiding")).length,
              next_gate: isEnglish
                ? "Reflection-ready entries from the intake queue are loaded for a short grounded reply."
                : "Các entry sẵn cho reflection từ intake queue đã được nạp để phản hồi ngắn và neo lại.",
              signals: relevantItems
                .filter((item) => item.latestPracticeState === "human_reflection" || item.latestPracticeState === "avoiding")
                .map((item) => ({
                  day: item.latestPracticeDay || "",
                  practiceState: item.latestPracticeState || "",
                  oneLine: item.latestPracticeLine || "",
                  updatedAt: item.updatedAt || ""
                })),
              handoffs: relevantItems
                .filter((item) => item.hasSavedHandoff)
                .map((item) => ({
                  email: item.email || "",
                  line1: "",
                  line2: "",
                  line3: isEnglish ? "Member already saved a handoff in their own flow." : "Thành viên đã có handoff được lưu ở flow riêng.",
                  sourceState: item.latestPracticeState || "",
                  sourceDay: item.latestPracticeDay || "",
                  sourceOneLine: item.latestPracticeLine || "",
                  updatedAt: item.updatedAt || ""
                }))
            };
            renderReflectionView(imported);
            renderStatus(evidenceStatus, isEnglish ? "Loaded intake queue packet into reflection ops." : "Đã nạp intake queue packet vào reflection ops.", "ok");
            return;
          }

          const isMemberPacket = parsed?.packet_type === "member_reflection_handoff"
            && typeof parsed?.email === "string"
            && typeof parsed?.sourceState === "string";
          if (!isMemberPacket) {
            throw new Error("INVALID_REFLECTION_EVIDENCE");
          }

          const imported = {
            generatedAt: new Date().toISOString(),
            source: "imported_member_reflection_handoff",
            total_signals: parsed.sourceState ? 1 : 0,
            human_reflection: parsed.sourceState === "human_reflection" ? 1 : 0,
            avoiding: parsed.sourceState === "avoiding" ? 1 : 0,
            saved_handoffs: 1,
            matched_handoffs: parsed.sourceState === "human_reflection" || parsed.sourceState === "avoiding" ? 1 : 0,
            next_gate: isEnglish
              ? "Member handoff packet is ready for a short grounded reply."
              : "Handoff packet của thành viên đã sẵn cho một phản hồi ngắn và neo lại.",
            signals: parsed.sourceState ? [{
              day: parsed.sourceDay || "",
              practiceState: parsed.sourceState || "",
              oneLine: parsed.sourceOneLine || "",
              updatedAt: parsed.updatedAt || ""
            }] : [],
            handoffs: [{
              email: parsed.email || "",
              line1: parsed.line1 || "",
              line2: parsed.line2 || "",
              line3: parsed.line3 || "",
              sourceState: parsed.sourceState || "",
              sourceDay: parsed.sourceDay || "",
              sourceOneLine: parsed.sourceOneLine || "",
              updatedAt: parsed.updatedAt || ""
            }]
          };
          renderReflectionView(imported);
          renderStatus(evidenceStatus, isEnglish ? "Loaded member handoff packet." : "Đã nạp handoff packet của thành viên.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to parse pasted reflection evidence." : "Không parse được reflection evidence đã dán.", "danger");
        }
      });
    }

    if (evidenceReset) {
      evidenceReset.addEventListener("click", () => {
        renderReflectionView(evidence);
        renderStatus(evidenceStatus, isEnglish ? "Returned to local reflection data." : "Đã quay lại dữ liệu reflection local.", "ok");
      });
    }

    const pendingMemberSnapshot = getPendingReflectionPacket();
    const pendingQueuePacket = getPendingReflectionQueuePacket();
    if (pendingQueuePacket && evidenceImport) {
      evidenceImport.value = JSON.stringify(pendingQueuePacket, null, 2);
      evidenceApply?.click();
      clearPendingReflectionQueuePacket();
    }
    if (pendingQueuePacket) {
      clearPendingReflectionPacket();
      return;
    }
    if (pendingMemberSnapshot && evidenceImport) {
      const packet = {
        packet_type: "member_reflection_handoff",
        email: pendingMemberSnapshot.email || "",
        line1: pendingMemberSnapshot.latestPracticeState === "avoiding"
          ? (pendingMemberSnapshot.latestPracticeLine || "")
          : "",
        line2: "",
        line3: pendingMemberSnapshot.latestPracticeState === "human_reflection"
          ? (pendingMemberSnapshot.latestPracticeLine || "")
          : (pendingMemberSnapshot.hasSavedHandoff
            ? (isEnglish ? "Member already saved a handoff in their own flow." : "Thành viên đã có handoff được lưu ở flow riêng.")
            : ""),
        sourceState: pendingMemberSnapshot.latestPracticeState || "",
        sourceDay: pendingMemberSnapshot.latestPracticeDay || "",
        sourceOneLine: pendingMemberSnapshot.latestPracticeLine || "",
        updatedAt: pendingMemberSnapshot.updatedAt || ""
      };
      evidenceImport.value = JSON.stringify(packet, null, 2);
      evidenceApply?.click();
      clearPendingReflectionPacket();
    }
  }

  function initPilot() {
    const status = $("#pilot-status");
    const summary = $("#pilot-summary");
    const list = $("#pilot-list");
    const log = $("#pilot-log");
    const evidenceOutput = $("#pilot-evidence-output");
    const evidenceImport = $("#pilot-evidence-import");
    const evidenceStatus = $("#pilot-evidence-status");
    const d1Status = $("#pilot-evidence-d1-status");
    const d1KeyInput = $("#pilot-d1-admin-key");
    const d1HandoffFilter = $("#pilot-d1-handoff-filter");
    const d1PriorityFilter = $("#pilot-d1-priority-filter");
    const d1LimitInput = $("#pilot-d1-limit");
    const d1Load = $("#pilot-evidence-load-d1");
    const evidenceCopy = $("#pilot-evidence-copy");
    const evidenceExport = $("#pilot-evidence-export");
    const evidenceApply = $("#pilot-evidence-apply");
    const evidenceReset = $("#pilot-evidence-reset");
    if (!status && !summary && !list && !log) return;

    const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");
    const opsSnapshot = getOpsSnapshot();
    const profiles = opsSnapshot.profiles;
    const latestPractice = opsSnapshot.latestPractice[0] || null;
    const readyProfiles = profiles.filter((item) => memberProfileIsComplete(item));
    const pausedProfiles = profiles.filter((item) => isFutureIso(item.reminderPausedUntil));
    const gentleProfiles = readyProfiles.filter((item) => item.practiceTrack === "gentle");
    const deepProfiles = readyProfiles.filter((item) => item.practiceTrack === "deep");
    const localParticipants = profiles.map((item) => {
      const ready = memberProfileIsComplete(item);
      const paused = isFutureIso(item.reminderPausedUntil);
      const latestState = latestPractice?.practiceState || "";
      const nextTouchpoint = paused
        ? (isEnglish ? "Respect pause" : "Tôn trọng pause")
        : latestState === "human_reflection"
          ? (isEnglish ? "Day 3 human review" : "Day 3 phản hồi người thật")
          : latestState === "avoiding"
            ? (isEnglish ? "Day 3 avoidance follow-up" : "Day 3 follow-up điểm né")
            : ready
              ? (isEnglish ? "Ready for Day 1 welcome" : "Sẵn sàng welcome Day 1")
              : (isEnglish ? "Finish profile first" : "Hoàn thiện profile trước");
      return {
        email: item.email,
        fullName: item.fullName || "",
        practiceTrack: item.practiceTrack || "",
        reminderIntensity: item.reminderIntensity || "",
        reminderPausedUntil: item.reminderPausedUntil || "",
        profileReady: ready,
        updatedAt: item.updatedAt || "",
        currentState: item.currentState || "",
        latestPracticeState: latestState,
        nextTouchpoint
      };
    });
    let lastPilotImportedFilters = null;

    if (d1KeyInput) {
      d1KeyInput.value = getAdminOpsQueueKey();
      d1KeyInput.addEventListener("input", () => {
        saveAdminOpsQueueKey(d1KeyInput.value || "");
      });
      d1KeyInput.addEventListener("blur", () => {
        saveAdminOpsQueueKey(d1KeyInput.value || "");
      });
    }

    function renderPilotView(view) {
      const participants = Array.isArray(view?.participants) ? view.participants : [];
      const readyCount = Number(view?.profiles_ready || 0);
      const pausedCount = Number(view?.paused_profiles || 0);
      const gentleCount = Number(view?.tracks?.gentle || 0);
      const deepCount = Number(view?.tracks?.deep || 0);
      const queueTotal = Number(view?.queue_total || 0);
      const queueRelevant = Number(view?.queue_relevant || 0);
      const sourceLabel = view?.source === "imported_pilot_ops"
        ? (isEnglish ? "imported evidence packet" : "evidence packet đã import")
        : view?.source === "imported_member_pilot_readiness"
          ? (isEnglish ? "member readiness packet" : "readiness packet của thành viên")
        : view?.source === "imported_admin_intake_queue"
            ? (isEnglish ? "intake queue packet" : "intake queue packet")
          : (isEnglish ? "local browser data" : "dữ liệu local của trình duyệt");
      const queueFilterLabel = view?.source === "imported_admin_intake_queue" && view?.applied_filters
        ? describeQueueFilters(view.applied_filters, isEnglish)
        : "";
      lastPilotImportedFilters = view?.source === "imported_admin_intake_queue"
        ? (view.applied_filters || {})
        : null;
      const queuePriorityLabel = view?.source === "imported_admin_intake_queue"
        ? formatPriorityMix(view?.priority_breakdown || {}, isEnglish, ["pilot_ready", "paused", "pilot_later", "routed"])
        : "";

      if (status) {
        if (view?.source === "imported_admin_intake_queue") {
          status.textContent = isEnglish
            ? `Loaded ${queueRelevant} pilot-ready entries from an intake queue packet with ${queueTotal} total items. Filter scope: ${queueFilterLabel || "all routes • all handoff states"}. Priority mix: ${queuePriorityLabel}. ${readyCount} are ready for pilot review, ${pausedCount} are currently paused, and ${opsSnapshot.counts.readyProfilesWithCheckin} already have both a complete profile and an honest check-in.`
            : `Đã nạp ${queueRelevant} entry sẵn cho pilot từ intake queue packet có tổng ${queueTotal} item. Phạm vi lọc: ${queueFilterLabel || "tất cả route • tất cả trạng thái handoff"}. Tương quan ưu tiên: ${queuePriorityLabel}. ${readyCount} hồ sơ đã đủ để rà pilot, ${pausedCount} hồ sơ đang tạm dừng nhắc, và ${opsSnapshot.counts.readyProfilesWithCheckin} hồ sơ đã có cả profile đủ lẫn check-in thật.`;
        } else {
          status.textContent = isEnglish
            ? `Showing ${participants.length} participant records from ${sourceLabel}. ${readyCount} are ready for pilot review, ${pausedCount} are currently paused, and ${opsSnapshot.counts.readyProfilesWithCheckin} already have both a complete profile and an honest check-in.`
            : `Đang hiển thị ${participants.length} hồ sơ từ ${sourceLabel}. ${readyCount} hồ sơ đã đủ để rà pilot, ${pausedCount} hồ sơ đang tạm dừng nhắc, và ${opsSnapshot.counts.readyProfilesWithCheckin} hồ sơ đã có cả profile đủ lẫn check-in thật.`;
        }
      }

      if (summary) {
        summary.innerHTML = `<div class="kpiRow">
          <article class="kpi"><strong>${readyCount}</strong><span>${isEnglish ? "Ready" : "Sẵn sàng"}</span></article>
          <article class="kpi"><strong>${gentleCount}</strong><span>${isEnglish ? "Gentle" : "Nhịp nhẹ"}</span></article>
          <article class="kpi"><strong>${deepCount}</strong><span>${isEnglish ? "Deep" : "Đối diện sâu"}</span></article>
          <article class="kpi"><strong>${pausedCount}</strong><span>${isEnglish ? "Paused" : "Tạm dừng"}</span></article>
        </div>${renderImportedSubsetSummary(view, isEnglish, { priorityCodes: ["pilot_ready", "paused", "pilot_later", "routed"] })}`;
      }

      if (list) {
        if (!participants.length) {
          list.innerHTML = isEnglish
            ? `<p class="note">No participant evidence is available yet. Keep using this module as the pilot contract until D1-backed participant state is added.</p>`
            : `<p class="note">Chưa có participant evidence nào. Tiếp tục dùng module này như khung pilot cho tới khi có participant state trên D1.</p>`;
        } else {
          list.innerHTML = `<ul class="checkList">${participants.map((item) => {
            const trackLabel = item.practiceTrack === "deep"
              ? (isEnglish ? "Deep Facing" : "Đối diện sâu")
              : item.practiceTrack === "gentle"
                ? (isEnglish ? "Gentle Rhythm" : "Nhịp nhẹ")
                : (isEnglish ? "Missing track" : "Thiếu track");
            const reminderLabel = item.reminderIntensity || (isEnglish ? "missing reminder" : "thiếu mức nhắc");
            const paused = isFutureIso(item.reminderPausedUntil);
            const stateLabel = item.latestPracticeState || (isEnglish ? "no recent check-in" : "chưa có check-in gần đây");
            const nextTouchpoint = item.nextTouchpoint || (isEnglish ? "Review manually" : "Rà thủ công");
            return `<li class="checkItem"><input type="checkbox" disabled ${item.profileReady ? "checked" : ""}><div>
              <strong>${safeText(item.fullName || item.email)}</strong>
              <p class="note">${safeText(trackLabel)} • ${safeText(reminderLabel)} • ${paused ? safeText(isEnglish ? "paused" : "đang pause") : safeText(isEnglish ? "active" : "đang mở")}</p>
              <p class="note">${safeText(isEnglish ? "Latest state" : "Trạng thái gần nhất")}: ${safeText(stateLabel)} • ${safeText(isEnglish ? "Next touchpoint" : "Điểm chạm kế tiếp")}: ${safeText(nextTouchpoint)}</p>
              <p>${safeText(item.currentState || (isEnglish ? "No current state yet." : "Chưa có current state."))}</p>
            </div></li>`;
          }).join("")}</ul>`;
        }
      }

    }

    if (log) {
      log.innerHTML = isEnglish
        ? `<ul class="list">
            <li>Day 1: confirm track and reminder consent before counting someone inside the pilot.</li>
            <li>Day 3: look first at people who paused reminders, marked avoiding, or asked for human reflection.</li>
            <li>Day 7: keep the review short, practical, and tied to one next step.</li>
            <li>This module is browser-local for now. Do not call it production participant ops until D1 or admin API persistence exists.</li>
          </ul>`
        : `<ul class="list">
            <li>Day 1: chốt track và consent reminder trước khi tính một người là đã vào pilot.</li>
            <li>Day 3: nhìn trước vào người pause reminder, đánh dấu đang né, hoặc xin phản hồi người thật.</li>
            <li>Day 7: giữ phần review ngắn, thực tế, và gắn với một bước kế tiếp.</li>
            <li>Module này hiện là local theo trình duyệt. Chưa gọi là participant ops production cho tới khi có D1 hoặc admin API persistence.</li>
          </ul>`;
    }

    const recentPracticeEntries = getLatestPracticeEntries();
    const evidence = {
      generatedAt: new Date().toISOString(),
      source: "browser_local_pilot_ops",
      profiles_total: profiles.length,
      profiles_ready: readyProfiles.length,
      paused_profiles: pausedProfiles.length,
      tracks: {
        gentle: gentleProfiles.length,
        deep: deepProfiles.length
      },
      recent_practice: {
        total_entries: recentPracticeEntries.length,
        human_reflection: recentPracticeEntries.filter((item) => item.practiceState === "human_reflection").length,
        avoiding: recentPracticeEntries.filter((item) => item.practiceState === "avoiding").length
      },
      next_gate: readyProfiles.length >= 10
        ? (isEnglish ? "Enough ready profiles to review pilot invite list." : "Đã có đủ hồ sơ sẵn sàng để rà danh sách mời pilot.")
        : (isEnglish ? "Keep collecting complete profiles before opening a real pilot." : "Tiếp tục gom đủ profile hoàn chỉnh trước khi mở pilot thật."),
      shared_ops_language: {
        saved_handoffs: opsSnapshot.counts.savedHandoffs,
        matched_handoffs: opsSnapshot.counts.matchedHandoffs,
        ready_profiles_with_checkin: opsSnapshot.counts.readyProfilesWithCheckin
      },
      participants: localParticipants
    };

    if (evidenceOutput) {
      evidenceOutput.value = JSON.stringify(evidence, null, 2);
    }

    renderPilotView(evidence);

    function handlePilotSubsetAction(event) {
      const trigger = event.target.closest("[data-return-dashboard-filters]");
      if (!trigger || !lastPilotImportedFilters) return;
      savePendingDashboardFilters({
        filters: lastPilotImportedFilters,
        source: "pilot_ops",
        sourceLabel: isEnglish ? "pilot ops" : "pilot ops",
        sourcePath: isEnglish ? "/en/admin/pilot/" : "/admin/pilot/",
        restoredAt: new Date().toISOString()
      });
      window.location.href = isEnglish ? "/en/admin/" : "/admin/";
    }

    function handlePilotPriorityAction(event) {
      const trigger = event.target.closest("[data-return-dashboard-priority]");
      if (!trigger || !lastPilotImportedFilters) return;
      savePendingDashboardFilters({
        filters: {
          ...lastPilotImportedFilters,
          priority: trigger.getAttribute("data-return-dashboard-priority") || "all"
        },
        source: "pilot_ops_priority_slice",
        sourceLabel: isEnglish ? "pilot ops priority slice" : "priority slice từ pilot ops",
        sourcePath: isEnglish ? "/en/admin/pilot/" : "/admin/pilot/",
        restoredAt: new Date().toISOString()
      });
      window.location.href = isEnglish ? "/en/admin/" : "/admin/";
    }

    list?.addEventListener("click", handlePilotSubsetAction);
    list?.addEventListener("click", handlePilotPriorityAction);
    summary?.addEventListener("click", handlePilotSubsetAction);
    summary?.addEventListener("click", handlePilotPriorityAction);

    if (evidenceCopy) {
      evidenceCopy.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard) throw new Error("Clipboard unavailable");
          await navigator.clipboard.writeText(evidenceOutput?.value || "");
          renderStatus(evidenceStatus, isEnglish ? "Copied pilot evidence." : "Đã copy pilot evidence.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to copy pilot evidence." : "Không copy được pilot evidence.", "danger");
        }
      });
    }

    if (evidenceExport) {
      evidenceExport.addEventListener("click", () => {
        try {
          const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `pilot-evidence-${new Date().toISOString().slice(0, 10)}.json`;
          link.click();
          URL.revokeObjectURL(link.href);
          renderStatus(evidenceStatus, isEnglish ? "Exported pilot evidence." : "Đã export pilot evidence.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to export pilot evidence." : "Không export được pilot evidence.", "danger");
        }
      });
    }

    d1Load?.addEventListener("click", async () => {
      const adminKey = String(d1KeyInput?.value || getAdminOpsQueueKey()).trim();
      if (!adminKey) {
        renderStatus(
          d1Status,
          isEnglish ? "Enter admin ops key before loading D1 queue." : "Nhập admin ops key trước khi nạp queue D1.",
          "danger"
        );
        return;
      }
      const handoff = String(d1HandoffFilter?.value || "all");
      const priority = String(d1PriorityFilter?.value || "all");
      const limit = sanitizeQueueLimit(d1LimitInput?.value, 120);
      if (d1LimitInput) d1LimitInput.value = String(limit);
      d1Load.disabled = true;
      try {
        const payload = await callAdminOpsQueue("GET", adminKey, {
          filters: { route: "pilot", handoff, priority, limit }
        });
        saveAdminOpsQueueKey(adminKey);
        const normalized = normalizedQueueItemsFromApi(payload.items, limit);
        mergeMemberSnapshotQueueItems(normalized);
        const queuePacket = buildD1QueuePacket(
          normalized,
          { route: "pilot", handoff, priority },
          "d1_admin_ops_queue_pilot"
        );
        if (evidenceImport) {
          evidenceImport.value = JSON.stringify(queuePacket, null, 2);
        }
        evidenceApply?.click();
        const summaryCounts = payload.summary && typeof payload.summary === "object"
          ? ` (${Number(payload.summary.total || 0)} total)`
          : "";
        renderStatus(
          d1Status,
          isEnglish
            ? `Loaded ${normalized.length} queue item(s) from D1 into pilot import using ${describeQueueFilters({ route: "pilot", handoff, priority }, true)} and merged them into admin home queue${summaryCounts}.`
            : `Đã nạp ${normalized.length} item từ queue D1 vào pilot import với ${describeQueueFilters({ route: "pilot", handoff, priority }, false)} và đã merge vào queue của admin home${summaryCounts}.`,
          "ok"
        );
      } catch (error) {
        renderStatus(
          d1Status,
          isEnglish ? `Unable to load D1 queue: ${error.message}` : `Không nạp được queue D1: ${error.message}`,
          "danger"
        );
      } finally {
        d1Load.disabled = false;
      }
    });

    if (evidenceApply) {
      evidenceApply.addEventListener("click", () => {
        try {
          const parsed = JSON.parse(evidenceImport?.value || "{}");
          if (Array.isArray(parsed.participants)) {
            const imported = {
              ...parsed,
              source: "imported_pilot_ops"
            };
            renderPilotView(imported);
            renderStatus(evidenceStatus, isEnglish ? "Loaded pasted pilot evidence." : "Đã nạp pilot evidence đã dán.", "ok");
            return;
          }

          const isQueuePacket = parsed?.packet_type === "admin_member_snapshot_queue"
            && Array.isArray(parsed?.items);
          if (isQueuePacket) {
            const relevantItems = parsed.items.filter((item) => recommendedRouteForSnapshot(item) === "pilot");
            const participants = relevantItems
              .map((item) => ({
                email: item.email || "",
                fullName: item.fullName || "",
                practiceTrack: item.practiceTrack || "",
                reminderIntensity: item.reminderIntensity || "",
                reminderPausedUntil: item.reminderPausedUntil || "",
                profileReady: Boolean(item.profileReady),
                updatedAt: item.updatedAt || "",
                currentState: item.currentState || "",
                latestPracticeState: item.latestPracticeState || "",
                latestPracticeDay: item.latestPracticeDay || "",
                latestPracticeLine: item.latestPracticeLine || "",
                hasSavedHandoff: Boolean(item.hasSavedHandoff),
                nextTouchpoint: isFutureIso(item.reminderPausedUntil)
                  ? (isEnglish ? "Respect pause" : "Tôn trọng pause")
                  : item.latestPracticeState === "human_reflection"
                    ? (isEnglish ? "Day 3 human review" : "Day 3 phản hồi người thật")
                    : item.latestPracticeState === "avoiding"
                      ? (isEnglish ? "Day 3 avoidance follow-up" : "Day 3 follow-up điểm né")
                      : Boolean(item.profileReady)
                        ? (isEnglish ? "Ready for Day 1 welcome" : "Sẵn sàng welcome Day 1")
                        : (isEnglish ? "Finish profile first" : "Hoàn thiện profile trước")
              }));
            const imported = {
              generatedAt: new Date().toISOString(),
              source: "imported_admin_intake_queue",
              applied_filters: parsed.applied_filters || null,
              queue_total: parsed.items.length,
              queue_relevant: participants.length,
              priority_breakdown: summarizeQueuePriorities(relevantItems),
              profiles_total: participants.length,
              profiles_ready: participants.filter((item) => item.profileReady).length,
              paused_profiles: participants.filter((item) => isFutureIso(item.reminderPausedUntil)).length,
              tracks: {
                gentle: participants.filter((item) => item.practiceTrack === "gentle").length,
                deep: participants.filter((item) => item.practiceTrack === "deep").length
              },
              recent_practice: {
                total_entries: participants.filter((item) => item.latestPracticeState).length,
                human_reflection: participants.filter((item) => item.latestPracticeState === "human_reflection").length,
                avoiding: participants.filter((item) => item.latestPracticeState === "avoiding").length
              },
              next_gate: isEnglish
                ? "Pilot-ready entries from the intake queue are loaded for the next Day 1 / Day 3 / Day 7 review."
                : "Các entry sẵn cho pilot từ intake queue đã được nạp để rà Day 1 / Day 3 / Day 7.",
              shared_ops_language: {
                saved_handoffs: participants.filter((item) => item.hasSavedHandoff).length,
                matched_handoffs: participants.filter((item) => item.hasSavedHandoff && (item.latestPracticeState === "human_reflection" || item.latestPracticeState === "avoiding")).length,
                ready_profiles_with_checkin: participants.filter((item) => item.profileReady && item.latestPracticeState && item.latestPracticeLine).length
              },
              participants
            };
            renderPilotView(imported);
            renderStatus(evidenceStatus, isEnglish ? "Loaded intake queue packet into pilot ops." : "Đã nạp intake queue packet vào pilot ops.", "ok");
            return;
          }

          const isMemberPacket = parsed?.packet_type === "member_pilot_readiness"
            && typeof parsed?.email === "string"
            && typeof parsed?.practiceTrack === "string";
          if (!isMemberPacket) {
            throw new Error("INVALID_PILOT_EVIDENCE");
          }

          const paused = isFutureIso(parsed.reminderPausedUntil);
          const latestState = String(parsed.latestPracticeState || "");
          const profileReady = Boolean(parsed.profileReady);
          const nextTouchpoint = paused
            ? (isEnglish ? "Respect pause" : "Tôn trọng pause")
            : latestState === "human_reflection"
              ? (isEnglish ? "Day 3 human review" : "Day 3 phản hồi người thật")
              : latestState === "avoiding"
                ? (isEnglish ? "Day 3 avoidance follow-up" : "Day 3 follow-up điểm né")
                : profileReady
                  ? (isEnglish ? "Ready for Day 1 welcome" : "Sẵn sàng welcome Day 1")
                  : (isEnglish ? "Finish profile first" : "Hoàn thiện profile trước");
          const participant = {
            email: parsed.email || "",
            fullName: parsed.fullName || "",
            practiceTrack: parsed.practiceTrack || "",
            reminderIntensity: parsed.reminderIntensity || "",
            reminderPausedUntil: parsed.reminderPausedUntil || "",
            profileReady,
            updatedAt: parsed.updatedAt || "",
            currentState: parsed.currentState || "",
            latestPracticeState: latestState,
            nextTouchpoint
          };
          const imported = {
            generatedAt: new Date().toISOString(),
            source: "imported_member_pilot_readiness",
            profiles_total: 1,
            profiles_ready: profileReady ? 1 : 0,
            paused_profiles: paused ? 1 : 0,
            tracks: {
              gentle: parsed.practiceTrack === "gentle" ? 1 : 0,
              deep: parsed.practiceTrack === "deep" ? 1 : 0
            },
            recent_practice: {
              total_entries: latestState ? 1 : 0,
              human_reflection: latestState === "human_reflection" ? 1 : 0,
              avoiding: latestState === "avoiding" ? 1 : 0
            },
            next_gate: isEnglish
              ? "Member readiness packet is ready for pilot review."
              : "Readiness packet của thành viên đã sẵn để rà pilot.",
            shared_ops_language: {
              saved_handoffs: 0,
              matched_handoffs: 0,
              ready_profiles_with_checkin: profileReady && latestState && parsed.latestPracticeLine ? 1 : 0
            },
            participants: [participant]
          };
          renderPilotView(imported);
          renderStatus(evidenceStatus, isEnglish ? "Loaded member readiness packet." : "Đã nạp readiness packet của thành viên.", "ok");
        } catch (_error) {
          renderStatus(evidenceStatus, isEnglish ? "Unable to parse pasted pilot evidence." : "Không parse được pilot evidence đã dán.", "danger");
        }
      });
    }

    if (evidenceReset) {
      evidenceReset.addEventListener("click", () => {
        renderPilotView(evidence);
        renderStatus(evidenceStatus, isEnglish ? "Returned to local pilot data." : "Đã quay lại dữ liệu pilot local.", "ok");
      });
    }

    const pendingMemberSnapshot = getPendingPilotPacket();
    const pendingQueuePacket = getPendingPilotQueuePacket();
    if (pendingQueuePacket && evidenceImport) {
      evidenceImport.value = JSON.stringify(pendingQueuePacket, null, 2);
      evidenceApply?.click();
      clearPendingPilotQueuePacket();
    }
    if (pendingQueuePacket) {
      clearPendingPilotPacket();
      return;
    }
    if (pendingMemberSnapshot && evidenceImport) {
      const packet = {
        packet_type: "member_pilot_readiness",
        email: pendingMemberSnapshot.email || "",
        fullName: pendingMemberSnapshot.fullName || "",
        practiceTrack: "",
        reminderIntensity: "",
        reminderPausedUntil: pendingMemberSnapshot.reminderPausedUntil || "",
        profileReady: Boolean(pendingMemberSnapshot.profileReady),
        latestPracticeState: pendingMemberSnapshot.latestPracticeState || "",
        latestPracticeDay: pendingMemberSnapshot.latestPracticeDay || "",
        latestPracticeLine: pendingMemberSnapshot.latestPracticeLine || "",
        currentState: pendingMemberSnapshot.currentState || "",
        updatedAt: pendingMemberSnapshot.updatedAt || ""
      };
      evidenceImport.value = JSON.stringify(packet, null, 2);
      evidenceApply?.click();
      clearPendingPilotPacket();
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
    initReflection();
    initPilot();
    initCreators();
    initSettingsTextArea();
    initAccountManager();
    initCommonFooter();
  });
})();
