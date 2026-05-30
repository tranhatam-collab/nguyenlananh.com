import { describe, it } from "node:test";
import assert from "node:assert";
import {
  normalizeEmail,
  getLocale,
  safeJsonParse,
  timingSafeEqualHex,
  base64UrlEncodeJson,
  base64UrlDecodeJson,
  json,
  errorResponse,
  normalizeNextPath,
  nowIso,
  randomToken,
  toHex
} from "../functions/_lib/utils.js";

describe("utils.js — pure functions", () => {
  describe("normalizeEmail", () => {
    it("trims and lowercases", () => {
      assert.strictEqual(normalizeEmail("  HELLO@EXAMPLE.COM  "), "hello@example.com");
    });
    it("handles empty/null/falsy", () => {
      assert.strictEqual(normalizeEmail(""), "");
      assert.strictEqual(normalizeEmail(null), "");
      assert.strictEqual(normalizeEmail(undefined), "");
    });
  });

  describe("getLocale", () => {
    it("returns en-US for English variants", () => {
      assert.strictEqual(getLocale("en"), "en-US");
      assert.strictEqual(getLocale("EN-US"), "en-US");
      assert.strictEqual(getLocale("english"), "en-US");
    });
    it("returns vi for everything else", () => {
      assert.strictEqual(getLocale("vi"), "vi");
      assert.strictEqual(getLocale("fr"), "vi");
      assert.strictEqual(getLocale(""), "vi");
      assert.strictEqual(getLocale(null), "vi");
    });
  });

  describe("safeJsonParse", () => {
    it("parses valid JSON", () => {
      assert.deepStrictEqual(safeJsonParse('{"a":1}'), { a: 1 });
    });
    it("returns fallback for invalid JSON", () => {
      assert.strictEqual(safeJsonParse("not json", "fallback"), "fallback");
    });
    it("returns fallback for null/undefined", () => {
      assert.strictEqual(safeJsonParse(null, "fallback"), "fallback");
      assert.strictEqual(safeJsonParse(undefined, "fallback"), "fallback");
    });
    it("returns null default fallback", () => {
      assert.strictEqual(safeJsonParse("bad"), null);
    });
  });

  describe("timingSafeEqualHex", () => {
    it("returns true for identical strings", () => {
      assert.strictEqual(timingSafeEqualHex("abc123", "abc123"), true);
    });
    it("returns false for different strings", () => {
      assert.strictEqual(timingSafeEqualHex("abc123", "abc124"), false);
    });
    it("returns false for different lengths", () => {
      assert.strictEqual(timingSafeEqualHex("abc", "abcd"), false);
    });
    it("handles null/undefined", () => {
      assert.strictEqual(timingSafeEqualHex(null, null), true);
      assert.strictEqual(timingSafeEqualHex(null, "a"), false);
    });
  });

  describe("base64UrlEncodeJson + base64UrlDecodeJson", () => {
    it("roundtrips a simple object", () => {
      const original = { hello: "world", num: 42 };
      const encoded = base64UrlEncodeJson(original);
      assert.strictEqual(typeof encoded, "string");
      assert.ok(!encoded.includes("+"));
      assert.ok(!encoded.includes("/"));
      const decoded = base64UrlDecodeJson(encoded);
      assert.deepStrictEqual(decoded, original);
    });
    it("returns null for invalid input", () => {
      assert.strictEqual(base64UrlDecodeJson("!!!"), null);
      assert.strictEqual(base64UrlDecodeJson(""), null);
      assert.strictEqual(base64UrlDecodeJson(null), null);
    });
  });

  describe("json", () => {
    it("returns a Response with JSON body", async () => {
      const res = json({ ok: true });
      assert.ok(res instanceof Response);
      assert.strictEqual(res.headers.get("content-type"), "application/json; charset=utf-8");
      assert.strictEqual(res.headers.get("cache-control"), "no-store");
      const body = await res.json();
      assert.deepStrictEqual(body, { ok: true });
    });
    it("allows custom status", async () => {
      const res = json({ ok: true }, { status: 201 });
      assert.strictEqual(res.status, 201);
    });
  });

  describe("errorResponse", () => {
    it("returns shaped error response", async () => {
      const res = errorResponse(400, "BAD_REQUEST", "Invalid input");
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.ok, false);
      assert.strictEqual(body.code, "BAD_REQUEST");
      assert.strictEqual(body.message, "Invalid input");
    });
    it("includes extra fields", async () => {
      const res = errorResponse(422, "INVALID", "Bad", { field: "email" });
      const body = await res.json();
      assert.strictEqual(body.field, "email");
    });
  });

  describe("normalizeNextPath", () => {
    it("allows members paths", () => {
      assert.strictEqual(normalizeNextPath("/members/"), "/members/");
      assert.strictEqual(normalizeNextPath("/en/members/"), "/en/members/");
      assert.strictEqual(normalizeNextPath("/members/dashboard/"), "/members/dashboard/");
    });
    it("rejects non-members paths", () => {
      assert.strictEqual(normalizeNextPath("/admin/"), "/members/dashboard/");
      assert.strictEqual(normalizeNextPath("https://evil.com"), "/members/dashboard/");
    });
    it("rejects paths not starting with /", () => {
      assert.strictEqual(normalizeNextPath("members/"), "/members/dashboard/");
    });
    it("uses locale fallback", () => {
      assert.strictEqual(normalizeNextPath("", "en"), "/en/members/dashboard/");
    });
  });

  describe("nowIso", () => {
    it("returns an ISO string", () => {
      const ts = nowIso();
      assert.ok(typeof ts === "string");
      assert.ok(/\d{4}-\d{2}-\d{2}T/.test(ts));
    });
  });

  describe("randomToken", () => {
    it("returns hex string of requested length", () => {
      const t16 = randomToken(16);
      assert.strictEqual(t16.length, 32); // 16 bytes = 32 hex chars
      assert.ok(/^[0-9a-f]+$/.test(t16));

      const t32 = randomToken(32);
      assert.strictEqual(t32.length, 64);
    });
  });

  describe("toHex", () => {
    it("converts ArrayBuffer to hex", () => {
      const buf = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer;
      assert.strictEqual(toHex(buf), "deadbeef");
    });
  });
});
