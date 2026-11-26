import { NextResponse } from "next/server";
import { db, TABLE } from "../../../../lib/supabase";
import { filteredOrders } from "../../../../lib/orderQuery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") || 1));
  const size = 50;
  const { data, count, error } = await filteredOrders(sp).range((page - 1) * size, page * size - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: all, error: e2 } = await db().from(TABLE).select("status, quantity, total, city");
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  const by = (k) => all.filter((o) => o.status === k).length;
  const live = all.filter((o) => !["cancelled", "returned"].includes(o.status));
  const stats = {
    total: all.length, new: by("new"), confirmed: by("confirmed"), delivered: by("delivered"),
    pending: all.filter((o) => ["new", "contacted"].includes(o.status)).length,
    cancelled: by("cancelled"),
    value: live.reduce((s, o) => s + o.total, 0),
    pieces: live.reduce((s, o) => s + o.quantity, 0),
  };
  const cities = [...new Set(all.map((o) => o.city))].sort();
  return NextResponse.json({ orders: data, count, page, pageSize: size, stats, cities });
}
