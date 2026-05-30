import { describe, it } from "node:test";
import assert from "node:assert";
import { signJwt, verifyJwt, sessionCookieHeaders } from "../functions/_lib/session.js";

describe("session.js — JWT and cookies", () => {
  const SECRET = "test-secret-32-bytes-long!!!!!";

  describe("signJwt + verifyJwt", () => {
    it("roundtrips a payload", async () => {
      const payload = { sub: "user-123", email: "a@b.com", iat: 1000, exp: 9999999999 };
      const token = await signJwt(SECRET, payload);
      assert.ok(typeof token === "string");
      assert.strictEqual(token.split(".").length, 3);

      const decoded = await verifyJwt(SECRET, token);
      assert.ok(decoded);
      assert.strictEqual(decoded.sub, "user-123");
      assert.strictEqual(decoded.email, "a@b.com");
    });

    it("rejects tampered token", async () => {
      const payload = { sub: "user-123", iat: 1000, exp: 9999999999 };
      const token = await signJwt(SECRET, payload);
      const tampered = token.slice(0, -5) + "XXXXX";
      const decoded = await verifyJwt(SECRET, tampered);
      assert.strictEqual(decoded, null);
    });

    it("rejects wrong secret", async () => {
      const payload = { sub: "user-123", iat: 1000, exp: 9999999999 };
      const token = await signJwt(SECRET, payload);
      const decoded = await verifyJwt("wrong-secret", token);
      assert.strictEqual(decoded, null);
    });

    it("rejects expired token", async () => {
      const payload = { sub: "user-123", iat: 1000, exp: 1001 }; // expired in 1970
      const token = await signJwt(SECRET, payload);
      const decoded = await verifyJwt(SECRET, token);
      assert.strictEqual(decoded, null);
    });

    it("rejects malformed token", async () => {
      assert.strictEqual(await verifyJwt(SECRET, ""), null);
      assert.strictEqual(await verifyJwt(SECRET, "not.a.token"), null);
      assert.strictEqual(await verifyJwt(SECRET, "only.two.parts"), null);
      assert.strictEqual(await verifyJwt(SECRET, null), null);
    });
  });

  describe("sessionCookieHeaders", () => {
    it("returns Set-Cookie header with defaults", () => {
      const headers = sessionCookieHeaders("my-token");
      const cookie = headers["Set-Cookie"];
      assert.ok(cookie.includes("__nla_session=my-token"));
      assert.ok(cookie.includes("HttpOnly"));
      assert.ok(cookie.includes("Secure"));
      assert.ok(cookie.includes("SameSite=Lax"));
      assert.ok(cookie.includes("Path=/"));
      assert.ok(cookie.includes("Max-Age="));
    });

    it("allows disabling Secure", () => {
      const headers = sessionCookieHeaders("t", { secure: false });
      assert.ok(!headers["Set-Cookie"].includes("Secure"));
    });

    it("allows custom SameSite", () => {
      const headers = sessionCookieHeaders("t", { sameSite: "Strict" });
      assert.ok(headers["Set-Cookie"].includes("SameSite=Strict"));
    });
  });
});
