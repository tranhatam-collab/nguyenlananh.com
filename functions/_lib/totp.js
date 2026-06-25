// TOTP (Time-based One-Time Password) implementation using Web Crypto API
// Compatible with Google Authenticator, Authy, 1Password, etc.
// Based on RFC 6238

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const SHA1 = "SHA-1";
const PERIOD = 30; // seconds
const DIGITS = 6;
const BACKUP_CODE_COUNT = 10;

// ============================================================
// Base32 encoding/decoding
// ============================================================

export function base32Encode(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(str) {
  const cleaned = str.replace(/=+$/, "").replace(/\s/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const output = [];
  for (const char of cleaned) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base32 character: ${char}`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

// ============================================================
// HMAC-SHA1 using Web Crypto
// ============================================================

async function hmacSha1(keyBytes, messageBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: SHA1 },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, messageBytes);
  return new Uint8Array(sig);
}

// ============================================================
// TOTP generation
// ============================================================

export async function generateTOTP(secretBytes, timestamp = Date.now(), period = PERIOD, digits = DIGITS) {
  const counter = Math.floor(timestamp / 1000 / period);
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  // Write counter as big-endian 64-bit
  const safeCounter = counter > 0x7fffffff ? counter : counter;
  view.setUint32(0, 0); // high 32 bits (counter won't exceed 32 bits in practice)
  view.setUint32(4, counter >>> 0); // low 32 bits

  const hmac = await hmacSha1(secretBytes, new Uint8Array(counterBytes));

  // Dynamic truncation (RFC 4226)
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = code % Math.pow(10, digits);
  return String(otp).padStart(digits, "0");
}

// ============================================================
// TOTP verification (allows ±1 window for clock skew)
// ============================================================

export async function verifyTOTP(secretBytes, token, timestamp = Date.now(), period = PERIOD, digits = DIGITS) {
  if (!token || typeof token !== "string") return false;
  const cleanToken = String(token).replace(/\s/g, "");
  if (cleanToken.length !== digits) return false;

  // Check current window and ±1 window
  for (let offset = -1; offset <= 1; offset++) {
    const ts = timestamp + offset * period * 1000;
    const expected = await generateTOTP(secretBytes, ts, period, digits);
    if (timingSafeEqual(cleanToken, expected)) return true;
  }
  return false;
}

// ============================================================
// Secret generation
// ============================================================

export function generateSecret(bytes = 20) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return arr;
}

export function generateSecretBase32(bytes = 20) {
  return base32Encode(generateSecret(bytes));
}

// ============================================================
// OTP Auth URI (for QR code)
// ============================================================

export function buildOtpAuthUri({ issuer, account, secretBase32 }) {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer: issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// ============================================================
// Backup codes
// ============================================================

export function generateBackupCodes(count = BACKUP_CODE_COUNT) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    // Format: XXXX-XXXX-XXXX (12 chars, alphanumeric, no ambiguous chars)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let j = 0; j < 12; j++) {
      code += chars[arr[j % arr.length] % chars.length];
      if (j === 3 || j === 7) code += "-";
    }
    codes.push(code);
  }
  return codes;
}

// Hash backup codes for storage (SHA-256)
export async function hashBackupCode(code) {
  const data = new TextEncoder().encode(code.replace(/\s/g, "").toUpperCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash);
}

export async function hashBackupCodes(codes) {
  return Promise.all(codes.map(hashBackupCode));
}

// Verify a backup code against stored hashes
export async function verifyBackupCode(input, storedHashes) {
  const hash = await hashBackupCode(input);
  return storedHashes.includes(hash);
}

// ============================================================
// Utilities
// ============================================================

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export const TOTP_PERIOD = PERIOD;
export const TOTP_DIGITS = DIGITS;
