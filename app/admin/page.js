"use client";
import { useCallback, useEffect, useState } from "react";
import "./admin.css";
import { STATUSES, MAX_QTY, totalFor } from "../../lib/product";

const stLabel = (k) => STATUSES.find((s) => s.key === k)?.label || k;
const fmt = (d) => new Date(d).toLocaleString("fr-MA", { timeZone: "Africa/Casablanca", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const EMPTY = { q: "", status: "", city: "", from: "", to: "" };

export default function Admin() {
  const [filters, setFilters] = useState(EMPTY);
  const [applied, setApplied] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(null);

  const qs = useCallback((extra = {}) => {
    const p = new URLSearchParams();
    Object.entries({ ...applied, ...extra }).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [applied]);

  const load = useCallback(async () => {
    setErr("");
    const r = await fetch(`/api/admin/orders?${qs({ page })}`, { cache: "no-store" });
    if (r.status === 401) { window.location.href = "/admin/login"; return; }
    const d = await r.json();
    if (!r.ok) { setErr(d.error || "Erreur"); return; }
    setData(d);
  }, [qs, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  async function setStatus(o, status) {
    const r = await fetch(`/api/admin/orders/${o.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (r.ok) load(); else alertBox("Impossible de changer le statut");
  }
  const alertBox = (m) => setErr(m);

  async function logout() { await fetch("/api/admin/login", { method: "DELETE" }); window.location.href = "/admin/login"; }

  const s = data?.stats;
  const pages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1;

  return (
    <div className="adm" dir="ltr">
      <div className="adm-top">
        <h1>بستاني · BOSTANI — Commandes (scie P4)</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="adm-btn" href={`/api/admin/export?${qs()}`}>⬇ Export CSV / Excel</a>
          <button className="adm-btn" onClick={load}>↻ Actualiser</button>
          <button className="adm-btn" onClick={logout}>Déconnexion</button>
        </div>
      </div>
      <main className="adm-main">
        {err ? <div className="adm-card" style={{ color: "#b3261e", marginBottom: 12 }}>{err}</div> : null}
        <div className="adm-stats">
          {[["Total commandes", s?.total], ["Nouvelles", s?.new], ["Confirmées", s?.confirmed], ["En attente", s?.pending],
            ["Annulées", s?.cancelled], ["Livrées", s?.delivered], ["Valeur totale", s ? `${s.value.toLocaleString("fr-MA")} MAD` : null], ["Pièces", s?.pieces]].map(([l, v]) => (
            <div className="adm-stat" key={l}><small>{l}</small><b>{v ?? "—"}</b></div>
          ))}
        </div>

        <form className="adm-filters" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filters); }}>
          <div style={{ flex: "2 1 200px" }}><span className="adm-lbl">Recherche (nom, tél, N°)</span>
            <input className="adm-inp" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Nom ou 06…" /></div>
          <div><span className="adm-lbl">Statut</span>
            <select className="adm-inp" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Tous</option>{STATUSES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></div>
          <div><span className="adm-lbl">Ville</span>
            <select className="adm-inp" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
              <option value="">Toutes</option>{(data?.cities || []).map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><span className="adm-lbl">Du</span><input type="date" className="adm-inp" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></div>
          <div><span className="adm-lbl">Au</span><input type="date" className="adm-inp" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></div>
          <button className="adm-btn primary">Filtrer</button>
          <button type="button" className="adm-btn" onClick={() => { setFilters(EMPTY); setApplied(EMPTY); setPage(1); }}>Réinitialiser</button>
        </form>

        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead><tr>
              <th>N°</th><th>Date</th><th>Client</th><th>Téléphone</th><th>Ville</th><th>Adresse</th><th>Pub</th><th>Qté</th><th>Total</th><th>Statut</th>
            </tr></thead>
            <tbody>
              {!data ? <tr><td colSpan={10}>Chargement…</td></tr> :
                data.orders.length === 0 ? <tr><td colSpan={10} style={{ padding: 24, textAlign: "center", color: "#7a6b6b" }}>Aucune commande pour le moment.</td></tr> :
                data.orders.map((o) => (
                  <tr key={o.id} onClick={() => setOpen(o)}>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{o.order_number}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(o.created_at)}</td>
                    <td className="ar">{o.full_name}</td>
                    <td style={{ whiteSpace: "nowrap" }}><a href={`tel:${o.phone}`} onClick={(e) => e.stopPropagation()}>{o.phone}</a></td>
                    <td className="ar">{o.city}</td>
                    <td className="ar" style={{ maxWidth: 220 }}>{o.address}</td>
                    <td style={{ fontSize: 12, color: "#5d4a4c", maxWidth: 140 }}>{o.source?.utm_content || (o.source?.fbclid ? "Facebook" : "—")}</td>
                    <td>{o.quantity}</td>
                    <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{o.total} MAD</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select className={`adm-inp pill st-${o.status}`} style={{ minWidth: 0, width: "auto" }} value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                        {STATUSES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pages > 1 ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <button className="adm-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
            <span style={{ alignSelf: "center" }}>Page {page} / {pages}</span>
            <button className="adm-btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>→</button>
          </div>
        ) : null}
      </main>
      {open ? <OrderModal order={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); }} /> : null}
    </div>
  );
}

function OrderModal({ order, onClose, onSaved }) {
  const [o, setO] = useState({
    fullName: order.full_name, phone: order.phone, city: order.city, address: order.address,
    status: order.status, quantity: order.quantity, total: order.total, notes: order.notes || "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k, v) => setO((p) => ({ ...p, [k]: v }));
  async function save() {
    setBusy(true); setMsg("");
    const r = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...o, total: Number(o.total) }) });
    setBusy(false);
    if (r.ok) onSaved(); else { const d = await r.json().catch(() => ({})); setMsg(d.error === "bad_phone" ? "Numéro de téléphone invalide" : `Erreur: ${d.error || r.status}`); }
  }
  async function del() {
    setBusy(true);
    const r = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) onSaved(); else setMsg("Suppression impossible");
  }

  return (
    <div className="adm-modal" onClick={onClose}>
      <div className="adm-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>{order.order_number}</h1>
          <button className="adm-btn" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: "#7a6b6b", margin: "4px 0 12px" }}>Reçue le {fmt(order.created_at)}{order.updated_at !== order.created_at ? ` · modifiée le ${fmt(order.updated_at)}` : ""}</p>
        <div className="adm-grid2">
          <div><span className="adm-lbl">Nom</span><input className="adm-inp ar" value={o.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
          <div><span className="adm-lbl">Téléphone</span><input className="adm-inp" value={o.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><span className="adm-lbl">Ville</span><input className="adm-inp ar" value={o.city} onChange={(e) => set("city", e.target.value)} /></div>
          <div><span className="adm-lbl">Statut</span>
            <select className="adm-inp" value={o.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></div>
        </div>
        <div style={{ marginTop: 10 }}><span className="adm-lbl">Adresse</span><textarea className="adm-inp ar" rows={2} value={o.address} onChange={(e) => set("address", e.target.value)} /></div>
        <div className="adm-grid2" style={{ marginTop: 10 }}>
          <div><span className="adm-lbl">Quantité</span>
            <select className="adm-inp" value={o.quantity} onChange={(e) => { const q = Number(e.target.value); setO((p) => ({ ...p, quantity: q, total: totalFor(q) })); }}>
              {Array.from({ length: MAX_QTY }, (_, i) => i + 1).map((q) => <option key={q} value={q}>{q}</option>)}</select></div>
          <div><span className="adm-lbl">Total (MAD)</span><input className="adm-inp" type="number" value={o.total} onChange={(e) => set("total", e.target.value)} /></div>
        </div>
        <div style={{ marginTop: 10 }}><span className="adm-lbl">Notes internes</span><textarea className="adm-inp" rows={2} value={o.notes} onChange={(e) => set("notes", e.target.value)} /></div>
        {msg ? <p style={{ color: "#b3261e" }}>{msg}</p> : null}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 14, flexWrap: "wrap" }}>
          {confirmDel ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>Supprimer définitivement ?</span>
              <button className="adm-btn danger" onClick={del} disabled={busy}>Oui, supprimer</button>
              <button className="adm-btn" onClick={() => setConfirmDel(false)}>Non</button>
            </div>
          ) : <button className="adm-btn danger" onClick={() => setConfirmDel(true)}>Supprimer</button>}
          <div style={{ display: "flex", gap: 8 }}>
            <a className="adm-btn" href={`https://wa.me/212${o.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <button className="adm-btn primary" onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
