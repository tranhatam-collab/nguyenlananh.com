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
const lifeResetHtml = read("products/life-reset-mini/index.html");
const enLifeResetHtml = read("en/products/life-reset-mini/index.html");
const rhythmDesignHtml = read("programs/rhythm-design-lab/index.html");

expectIncludes(payments, "let sessionUserId = null;", "checkout stores session user id");
expectIncludes(payments, "sessionUserId = String(session.sub || \"\").trim() || null;", "checkout extracts session sub");
expectIncludes(payments, "user_id: sessionUserId,", "payment order is bound to session user_id");

expectIncludes(proLayer, "function checkoutUrlFor(slug, plan)", "pro layer has explicit checkout URL helper");
expectIncludes(proLayer, "link.href = checkoutUrlFor(slug, plan);", "logged-in non-entitled Pro users go to checkout URL");
expectIncludes(proLayer, "encodeURIComponent(checkoutUrlFor(slug, plan))", "anonymous Pro users return to checkout after login");
expectIncludes(proLayer, "next_path: contentUrlFor(slug),", "Pro checkout returns to purchased content path");

expectIncludes(productCheckout, "email: sessionEmail ? undefined : email,", "logged-in product checkout does not send duplicate email field");
expectIncludes(productCheckout, "function setupCheckoutModal()", "product checkout opens in an in-page modal");
expectIncludes(productCheckout, "id = \"productCheckoutOverlay\"", "product checkout modal overlay is created");
expectIncludes(productCheckout, "function isQrImageUrl(value)", "product checkout distinguishes QR image URLs from hosted checkout URLs");
expectIncludes(productCheckout, "qrImage.removeAttribute(\"src\");", "product checkout clears broken QR image src when no QR image exists");
expectIncludes(productCheckout, "qrImage.onerror = function()", "product checkout hides QR image when browser image load fails");
expectIncludes(productCheckout, "Mở cửa sổ thanh toán VietQR", "product checkout exposes hosted VietQR payment window link");
expectIncludes(productCheckout, "Đã tạo thanh toán. Hãy bấm mở cổng thanh toán để lấy mã VietQR trực tiếp.", "product checkout clearly explains hosted VietQR fallback");
if (productCheckout.includes("vi.src = body.manual_transfer.qr_url || \"\"")) {
  fail("product checkout still renders manual_transfer.qr_url blindly into an image");
} else {
  pass("product checkout no longer blindly renders manual_transfer.qr_url as an image");
}

expectIncludes(proLayer, "function isQrImageUrl(value)", "Pro checkout distinguishes QR image URLs from hosted checkout URLs");
expectIncludes(proLayer, "Open VietQR checkout", "Pro checkout exposes hosted VietQR payment window link");
if (proLayer.includes("'<img src=\"' + data.checkout_url")) {
  fail("Pro checkout still renders checkout_url blindly into an image");
} else {
  pass("Pro checkout no longer blindly renders checkout_url as an image");
}

expectIncludes(payments, "function isLikelyQrImageUrl(value)", "backend distinguishes QR image URLs from hosted checkout URLs");
expectIncludes(payments, "function hydrateVietQrManualTransfer(env, order, checkout)", "backend hydrates VietQR manual transfer payload");
expectIncludes(payments, "buildFallbackVietQrQuickLink(env, order, transferNote)", "backend builds fallback VietQR image from env values");
expectIncludes(payments, "body.manual_transfer = hydrateVietQrManualTransfer(env, order, checkout);", "checkout response uses hydrated VietQR payload");
expectIncludes(payments, "const manualTransfer = hydrateVietQrManualTransfer(context.env, order, checkout);", "VietQR DB row uses hydrated VietQR payload");
expectIncludes(payments, "isLikelyQrImageUrl(checkoutUrl) ? String(checkoutUrl) : \"\"", "backend only maps hosted checkout_url to qr_url when it is an image URL");
if (payments.includes("qr_url: String(checkoutUrl)")) {
  fail("backend still maps every checkout_url to raw.qr_url");
} else {
  pass("backend no longer maps every checkout_url to raw.qr_url");
}
if (payments.includes("checkout.raw?.qr_url || checkout.checkout_url")) {
  fail("backend still falls back from raw qr_url to hosted checkout_url");
} else {
  pass("backend no longer falls back from raw qr_url to hosted checkout_url");
}

expectIncludes(lifeResetHtml, "/assets/products-checkout.js?v=20260630a", "VI life reset page cache-busts product checkout JS");
expectIncludes(enLifeResetHtml, "/assets/products-checkout.js?v=20260630a", "EN life reset page cache-busts product checkout JS");
expectIncludes(rhythmDesignHtml, "/assets/products-checkout.js?v=20260630a", "rhythm design checkout page cache-busts product checkout JS");

if (failures) {
  console.error(`checkout account binding guard failed: ${failures}`);
  process.exit(1);
}

console.log("checkout account binding guard passed");
