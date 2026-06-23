// Block public access to /docs/* — internal dev docs must not be served.
// Pages _redirects 404 does not override static file serving, so we use
// a Functions catch-all to return 404 for any /docs/* request.
// Local scripts read /docs/ from the filesystem directly — not affected.
export async function onRequest() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
