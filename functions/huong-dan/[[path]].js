/**
 * Pages function for /huong-dan/* — serves the static HTML hub.
 *
 * This function exists ONLY because the production www.nguyenlananh.com
 * static asset routing was returning 404 for /huong-dan/* paths despite
 * the files being present in every deployment. The function intercepts
 * the request and asks the same deployment's ASSETS binding to serve the
 * static file directly, which bypasses whatever platform-level rule was
 * intercepting top-level /huong-dan/ requests.
 *
 * The function is a thin pass-through:
 *   /huong-dan/                                  → /huong-dan/index.html
 *   /huong-dan/<slug>/                           → /huong-dan/<slug>/index.html
 *   /huong-dan/<slug>/index.html                 → same
 *
 * Boundary: this is a routing fix only. It does not modify backend logic,
 * payment, auth, DB, or legal mapping per the human text protocol.
 */

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let pathname = url.pathname;

  // Trailing slash on a directory → append index.html so the assets binding
  // can resolve a real file. Asset binding does not auto-resolve directory
  // index files when called from a function.
  if (pathname.endsWith("/")) {
    pathname = `${pathname}index.html`;
  }

  // Build a request against the same origin pointed at the resolved file.
  const target = new URL(pathname, url.origin);
  const assetRequest = new Request(target.toString(), context.request);

  const response = await context.env.ASSETS.fetch(assetRequest);

  // If the asset binding also fails to resolve, surface a clean 404 instead
  // of leaking platform internals.
  if (response.status === 404) {
    return new Response("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return response;
}
