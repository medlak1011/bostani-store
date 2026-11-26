import { supabaseServiceKey } from "./env";

// Admin session: an HMAC-signed, httpOnly cookie. Works in Node and Edge (middleware).
export const COOKIE = "bostani_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function secret() {
  // Prefer a dedicated secret; otherwise derive from the (already secret) Supabase service key.
  const s = process.env.ADMIN_SESSION_SECRET || (supabaseServiceKey() ? `bostani-admin:${supabaseServiceKey()}` : "");
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET / SUPABASE_SERVICE_ROLE_KEY missing");
  return s;
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${await hmac(secret(), payload)}`, maxAge: MAX_AGE };
}

export async function verifySession(value) {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [who, exp, sig] = parts;
  if (who !== "admin" || Number(exp) < Date.now() / 1000) return false;
  let expected;
  try { expected = await hmac(secret(), `${who}.${exp}`); } catch { return false; }
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function safeEqual(a, b) {
  a = String(a || ""); b = String(b || "");
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
