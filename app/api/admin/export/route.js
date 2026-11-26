import { filteredOrders } from "../../../../lib/orderQuery";
import { STATUSES } from "../../../../lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const esc = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req) {
  const { data, error } = await filteredOrders(req.nextUrl.searchParams).limit(10000);
  if (error) return new Response(error.message, { status: 500 });
  const head = ["N° commande", "Date", "Nom", "Téléphone", "Ville", "Adresse", "Quantité", "Total (MAD)", "Statut", "Notes", "Pub (utm_content)", "Campagne"];
  const rows = data.map((o) => [
    o.order_number, new Date(o.created_at).toLocaleString("fr-MA", { timeZone: "Africa/Casablanca" }),
    o.full_name, o.phone, o.city, o.address, o.quantity, o.total,
    STATUSES.find((s) => s.key === o.status)?.label || o.status, o.notes || "",
    o.source?.utm_content || "", o.source?.utm_campaign || "",
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bostani-commandes-${date}.csv"` },
  });
}
