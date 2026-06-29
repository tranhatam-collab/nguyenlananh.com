import fs from "node:fs";

let failures = 0;

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

function expectIncludes(source, needle, message) {
  if (source.includes(needle)) pass(message);
  else fail(message);
}

const payments = read("functions/_lib/payments.js");
const proLayer = read("assets/pro-layer.js");
const productCheckout = read("assets/products-checkout.js");

expectIncludes(payments, "let sessionUserId = null;", "checkout stores session user id");
expectIncludes(payments, "sessionUserId = String(session.sub || \"\").trim() || null;", "checkout extracts session sub");
expectIncludes(payments, "user_id: sessionUserId,", "payment order is bound to session user_id");

expectIncludes(proLayer, "function checkoutUrlFor(slug, plan)", "pro layer has explicit checkout URL helper");
expectIncludes(proLayer, "link.href = checkoutUrlFor(slug, plan);", "logged-in non-entitled Pro users go to checkout URL");
expectIncludes(proLayer, "encodeURIComponent(checkoutUrlFor(slug, plan))", "anonymous Pro users return to checkout after login");
expectIncludes(proLayer, "next_path: contentUrlFor(slug),", "Pro checkout returns to purchased content path");

expectIncludes(productCheckout, "email: sessionEmail ? undefined : email,", "logged-in product checkout does not send duplicate email field");

if (failures) {
  console.error(`checkout account binding guard failed: ${failures}`);
  process.exit(1);
}

console.log("checkout account binding guard passed");
