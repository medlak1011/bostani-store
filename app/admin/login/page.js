"use client";
import { useState } from "react";
import "../admin.css";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) { window.location.href = "/admin"; return; }
    const d = await r.json().catch(() => ({}));
    setErr(d.error === "too_many_attempts" ? "Trop de tentatives. Réessayez dans 15 minutes." :
      d.error === "admin_not_configured" ? "ADMIN_PASSWORD n'est pas configuré sur le serveur." : "Mot de passe incorrect.");
  }
  return (
    <main className="adm" dir="ltr" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <form onSubmit={go} className="adm-card" style={{ width: "min(360px, 92vw)" }}>
        <h1 style={{ margin: "0 0 4px" }}>بستاني · BOSTANI</h1>
        <p style={{ margin: "0 0 16px", color: "#7a6b6b" }}>Espace administrateur</p>
        <label className="adm-lbl" htmlFor="pw">Mot de passe</label>
        <input id="pw" type="password" className="adm-inp" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        {err ? <p style={{ color: "#b3261e", margin: "8px 0 0" }}>{err}</p> : null}
        <button className="adm-btn primary" style={{ width: "100%", marginTop: 14 }} disabled={busy}>{busy ? "…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
