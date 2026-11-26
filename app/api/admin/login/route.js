import { NextResponse } from "next/server";
import { COOKIE, createSession, safeEqual } from "../../../../lib/auth";

export const runtime = "nodejs";

// Small in-memory brake on password guessing (per server instance).
const attempts = new Map();

export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "x";
  const now = Date.now();
  const a = attempts.get(ip) || { n: 0, t: now };
  if (now - a.t > 15 * 60 * 1000) { a.n = 0; a.t = now; }
  if (a.n >= 8) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 10) return NextResponse.json({ error: "admin_not_configured" }, { status: 500 });

  if (!safeEqual(password, expected)) {
    a.n++; attempts.set(ip, a);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }
  attempts.delete(ip);
  const s = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: s.maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
