export function logInfo({ route, code, msg, ...extra }) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level: "info", route, code, msg, ...extra }));
}

export function logWarn({ route, code, msg, ...extra }) {
  console.warn(JSON.stringify({ ts: new Date().toISOString(), level: "warn", route, code, msg, ...extra }));
}

export function logError({ route, code, msg, error, ...extra }) {
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      route,
      code,
      msg,
      error: error?.message || error,
      ...extra
    })
  );
}
