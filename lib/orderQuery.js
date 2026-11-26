import { db, TABLE } from "./supabase";

export function filteredOrders(sp, select = "*") {
  let q = db().from(TABLE).select(select, { count: "exact" });
  const search = (sp.get("q") || "").trim();
  if (search) {
    const s = search.replace(/[%,()]/g, " ");
    q = q.or(`full_name.ilike.%${s}%,phone.ilike.%${s.replace(/\s/g, "")}%,order_number.ilike.%${s}%`);
  }
  if (sp.get("status")) q = q.eq("status", sp.get("status"));
  if (sp.get("city")) q = q.ilike("city", `%${sp.get("city").replace(/[%,]/g, "")}%`);
  if (sp.get("from")) q = q.gte("created_at", new Date(sp.get("from") + "T00:00:00+01:00").toISOString());
  if (sp.get("to")) q = q.lte("created_at", new Date(sp.get("to") + "T23:59:59+01:00").toISOString());
  return q.order("created_at", { ascending: false });
}
