// ============================================================
// Admin RBAC client — server-side auth bridge
// nguyenlananh.com
// ============================================================

(function (global) {
  "use strict";

  var ADMIN_AUTH_KEY = "nla_admin_session_v3";
  var LOGIN_PATH = "/admin/login/";

  function getStored() {
    try {
      var raw = sessionStorage.getItem(ADMIN_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  }

  function setStored(data) {
    try {
      sessionStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(data));
    } catch (_e) {}
  }

  function clearStored() {
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (_e) {}
  }

  function fetchMe() {
    return fetch("/api/admin/me", { credentials: "include" })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false }; });
  }

  function login(email, password) {
    return fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) { return r.json(); });
  }

  function logout() {
    return fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include"
    }).then(function (r) { return r.json(); })
      .catch(function () { return { ok: true }; });
  }

  function changePassword(currentPassword, newPassword) {
    return fetch("/api/admin/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    }).then(function (r) { return r.json(); });
  }

  function hasPermission(perms, perm) {
    if (!Array.isArray(perms)) return false;
    return perms.indexOf(perm) !== -1;
  }

  function redirectToLogin() {
    if (window.location.pathname.indexOf(LOGIN_PATH) === -1) {
      window.location.href = LOGIN_PATH;
    }
  }

  // Ensure admin session is valid; redirect to login if not.
  // Returns a Promise that resolves to the session object or null.
  function ensureSession() {
    return fetchMe().then(function (data) {
      if (data.ok && data.admin_user) {
        setStored({
          admin_user: data.admin_user,
          permissions: data.permissions || []
        });
        return {
          admin_user: data.admin_user,
          permissions: data.permissions || []
        };
      }
      clearStored();
      redirectToLogin();
      return null;
    });
  }

  // Gate UI elements based on permissions
  function applyPermissionGates(session) {
    if (!session || !session.permissions) return;
    var els = document.querySelectorAll("[data-requires-perm]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var perm = el.getAttribute("data-requires-perm");
      if (!hasPermission(session.permissions, perm)) {
        el.style.display = "none";
      } else {
        el.style.display = "";
      }
    }
  }

  // Admin Users API (super_admin only)
  function listUsers() {
    return fetch("/api/admin/users", { credentials: "include" })
      .then(function (r) { return r.json(); });
  }

  function createUser(data) {
    return fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function updateUser(id, data) {
    return fetch("/api/admin/users/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function deleteUser(id) {
    return fetch("/api/admin/users/" + id, {
      method: "DELETE",
      credentials: "include"
    }).then(function (r) { return r.json(); });
  }

  function listAuditLog(params) {
    var qs = "";
    if (params) {
      var parts = [];
      if (params.limit) parts.push("limit=" + encodeURIComponent(params.limit));
      if (params.action) parts.push("action=" + encodeURIComponent(params.action));
      if (parts.length) qs = "?" + parts.join("&");
    }
    return fetch("/api/admin/audit" + qs, { credentials: "include" })
      .then(function (r) { return r.json(); });
  }

  global.AdminAuth = {
    getStored: getStored,
    setStored: setStored,
    clearStored: clearStored,
    fetchMe: fetchMe,
    login: login,
    logout: logout,
    changePassword: changePassword,
    hasPermission: hasPermission,
    ensureSession: ensureSession,
    applyPermissionGates: applyPermissionGates,
    redirectToLogin: redirectToLogin,
    // Users CRUD
    listUsers: listUsers,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    // Audit
    listAuditLog: listAuditLog,
    // Constants
    LOGIN_PATH: LOGIN_PATH
  };
})(window);
