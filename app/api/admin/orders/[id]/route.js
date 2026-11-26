import { NextResponse } from "next/server";
import { db, TABLE } from "../../../../../lib/supabase";
import { normalizeMoroccanPhone } from "../../../../../lib/validate";
import { STATUSES, MAX_QTY } from "../../../../../lib/product";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f-]{36}$/i;
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

export async function PATCH(req, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const patch = {};

  if (b.status !== undefined) {
    if (!STATUSES.some((s) => s.key === b.status)) return NextResponse.json({ error: "bad_status" }, { status: 400 });
    patch.status = b.status;
  }
  for (const [k, col, max] of [["fullName", "full_name", 80], ["city", "city", 60], ["address", "address", 250], ["notes", "notes", 1000]]) {
    if (b[k] !== undefined) patch[col] = str(b[k], max);
  }
  if (b.phone !== undefined) {
    const p = normalizeMoroccanPhone(b.phone);
    if (!p) return NextResponse.json({ error: "bad_phone" }, { status: 400 });
    patch.phone = p;
  }
  if (b.quantity !== undefined) {
    const q = Number(b.quantity);
    if (!Number.isInteger(q) || q < 1 || q > MAX_QTY) return NextResponse.json({ error: "bad_quantity" }, { status: 400 });
    patch.quantity = q;
  }
  if (b.total !== undefined) {
    const t = Number(b.total);
    if (!Number.isInteger(t) || t < 0 || t > 100000) return NextResponse.json({ error: "bad_total" }, { status: 400 });
    patch.total = t;
    patch.subtotal = t;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  patch.updated_at = new Date().toISOString();

  const { data, error } = await db().from(TABLE).update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, order: data });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "bad_id" }, { status: 400 });
  const { error } = await db().from(TABLE).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
