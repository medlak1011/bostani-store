import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { db, TABLE } from "../../../lib/supabase";
import { validateOrder } from "../../../lib/validate";
import { PRICES } from "../../../lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function orderNumber() {
  const d = new Date();
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  let r = "";
  for (let i = 0; i < 4; i++) r += ALPHA[randomInt(ALPHA.length)];
  return `BS-${ymd}-${r}`;
}

function ipHash(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  return createHash("sha256").update(ip + (process.env.ADMIN_SESSION_SECRET || "bostani")).digest("hex").slice(0, 32);
}

const pub = (o) => ({ orderNumber: o.order_number, quantity: o.quantity, total: o.total });

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  if (body?.website) return NextResponse.json({ error: "rejected" }, { status: 400 });

  const v = validateOrder(body);
  if (!v.ok) return NextResponse.json({ error: "validation", fields: v.errors }, { status: 422 });

  const submissionId = UUID_RE.test(body?.submissionId || "") ? body.submissionId : null;
  const supabase = db();
  const hash = ipHash(req);

  if (submissionId) {
    const { data: existing } = await supabase.from(TABLE).select("*").eq("submission_id", submissionId).maybeSingle();
    if (existing) return NextResponse.json({ ok: true, duplicate: true, order: pub(existing) });
  }

  // Same phone + same quantity in the last 15 minutes = the same order.
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: recent } = await supabase.from(TABLE).select("*").eq("phone", v.data.phone).gte("created_at", since).limit(5);
  const same = (recent || []).find((o) => o.quantity === v.data.quantity);
  if (same) return NextResponse.json({ ok: true, duplicate: true, order: pub(same) });

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from(TABLE).select("id", { count: "exact", head: true }).eq("ip_hash", hash).gte("created_at", hourAgo);
  if ((count || 0) >= 6) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const subtotal = PRICES.unit * v.data.quantity;
  const src = body?.source && typeof body.source === "object" ? body.source : {};
  const source = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) {
    if (typeof src[k] === "string" && src[k]) source[k] = src[k].replace(/[<>]/g, "").slice(0, 200);
  }
  const row = {
    submission_id: submissionId,
    full_name: v.data.fullName, phone: v.data.phone, city: v.data.city, address: v.data.address,
    quantity: v.data.quantity, subtotal, shipping: PRICES.shipping, total: subtotal + PRICES.shipping,
    source, ip_hash: hash, user_agent: (req.headers.get("user-agent") || "").slice(0, 200),
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from(TABLE).insert({ ...row, order_number: orderNumber() }).select().single();
    if (!error) return NextResponse.json({ ok: true, order: pub(data) }, { status: 201 });
    if (error.code === "23505" && String(error.message).includes("submission_id")) {
      const { data: existing } = await supabase.from(TABLE).select("*").eq("submission_id", submissionId).maybeSingle();
      if (existing) return NextResponse.json({ ok: true, duplicate: true, order: pub(existing) });
    }
    if (error.code !== "23505") {
      console.error("order insert failed", error);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }
  }
  return NextResponse.json({ error: "server" }, { status: 500 });
}
