import { trackEvent, trackError } from "./site_logger.js";

// In-memory buffer for D1 reference (set by middleware)
let _dbRef = null;

export function setLogDbRef(db) {
  _dbRef = db;
}

export function logInfo({ route, code, msg, ...extra }) {
  const entry = { ts: new Date().toISOString(), level: "info", route, code, msg, ...extra };
  console.log(JSON.stringify(entry));
  // Persist info events only if they have a meaningful code
  if (_dbRef && code) {
    trackEvent(_dbRef, {
      level: "info",
      category: "system",
      action: String(code || "").slice(0, 60),
      path: String(route || "").slice(0, 500),
      detail: JSON.stringify({ msg, ...extra }).slice(0, 4000),
    }).catch(() => {});
  }
}

export function logWarn({ route, code, msg, ...extra }) {
  const entry = { ts: new Date().toISOString(), level: "warn", route, code, msg, ...extra };
  console.warn(JSON.stringify(entry));
  if (_dbRef && code) {
    trackEvent(_dbRef, {
      level: "warn",
      category: "system",
      action: String(code || "").slice(0, 60),
      path: String(route || "").slice(0, 500),
      detail: JSON.stringify({ msg, ...extra }).slice(0, 4000),
    }).catch(() => {});
  }
}

export function logError({ route, code, msg, error, ...extra }) {
  const entry = {
    ts: new Date().toISOString(),
    level: "error",
    route,
    code,
    msg,
    error: error?.message || error,
    ...extra
  };
  console.error(JSON.stringify(entry));
  if (_dbRef) {
    trackError(_dbRef, {
      status: 500,
      code: String(code || "ERROR").slice(0, 100),
      message: String(msg || error?.message || "").slice(0, 1000),
      path: String(route || "").slice(0, 500),
      stack: String(error?.stack || "").slice(0, 4000),
    }).catch(() => {});
  }
}
