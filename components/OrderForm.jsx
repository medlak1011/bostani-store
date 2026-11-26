"use client";
import { useEffect, useRef, useState } from "react";
import { PRICES, MAX_QTY, CITIES, PRODUCT, totalFor } from "../lib/product";
import { validateOrder } from "../lib/validate";

const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ (Math.random() * 16) >> (c / 4)).toString(16));

const track = (ev, data, opts) => { try { window.fbq && window.fbq("track", ev, data, opts); } catch {} };

const SRC_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
function readSource() {
  try {
    const qs = new URLSearchParams(window.location.search);
    const fromUrl = {};
    SRC_KEYS.forEach((k) => { const v = qs.get(k); if (v) fromUrl[k] = v.slice(0, 200); });
    if (Object.keys(fromUrl).length) { sessionStorage.setItem("bs_src", JSON.stringify(fromUrl)); return fromUrl; }
    return JSON.parse(sessionStorage.getItem("bs_src") || "{}");
  } catch { return {}; }
}

export default function OrderForm() {
  const [qty, setQty] = useState(1);
  const [f, setF] = useState({ fullName: "", phone: "", city: "", address: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [result, setResult] = useState(null);
  const submissionId = useRef(null);
  const started = useRef(false);
  const top = useRef(null);

  useEffect(() => { submissionId.current = uuid(); readSource(); }, []);

  const total = totalFor(qty);
  const begin = () => {
    if (!started.current) { started.current = true; track("InitiateCheckout", { value: total, currency: "MAD" }); }
  };
  const setField = (k, v) => { begin(); setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  async function submit(e) {
    e.preventDefault();
    if (status !== "idle") return;
    setServerMsg("");
    const payload = { ...f, quantity: qty, submissionId: submissionId.current, source: readSource() };
    const v = validateOrder(payload);
    if (!v.ok) {
      setErrors(v.errors);
      setTimeout(() => document.querySelector("[data-err='1']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResult(data.order);
        setStatus("done");
        if (!data.duplicate) track("Purchase", { value: data.order.total, currency: "MAD", num_items: data.order.quantity, content_ids: [PRODUCT.sku], content_type: "product" }, { eventID: data.order.orderNumber });
        setTimeout(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        return;
      }
      setStatus("idle");
      if (res.status === 422 && data.fields) setErrors(data.fields);
      else if (res.status === 429) setServerMsg("بزاف ديال الطلبات من هاد التيليفون. عاود من بعد شوية.");
      else setServerMsg("وقع مشكل صغير. عاود ضغط على الزر عافاك.");
    } catch {
      setStatus("idle");
      setServerMsg("الأنترنت ضعيفة وما وصلاتناش الطلبية. عاود ضغط على الزر.");
    }
  }

  if (status === "done" && result) {
    return (
      <div className="form done" ref={top} role="status" aria-live="polite">
        <div className="big">✅</div>
        <h2>الطلبية ديالك تسجلات. بارك الله فيك</h2>
        <p className="hint">رقم الطلبية:</p>
        <div className="num">{result.orderNumber}</div>
        <div className="total"><span>{result.quantity} × منشار</span><b>{result.total} درهم</b></div>
        <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>📞 غادي نعيطو ليك قريب باش نأكدو.<br />خلي التيليفون مشعول عافاك.</p>
      </div>
    );
  }

  const err = (k) => errors[k] ? <div className="err" data-err="1">⚠ {errors[k]}</div> : null;

  return (
    <form className="form" onSubmit={submit} noValidate ref={top}>
      <h2>اطلب المنشار ديالك</h2>
      <p className="hint">عمر هاد المعلومات وغادي نعيطو ليك</p>

      <label className="lbl" htmlFor="fullName">👤 السمية</label>
      <input id="fullName" className={`inp ${errors.fullName ? "bad" : ""}`} autoComplete="name" placeholder="السمية الكاملة"
        value={f.fullName} onChange={(e) => setField("fullName", e.target.value)} />
      {err("fullName")}

      <label className="lbl" htmlFor="phone">📞 نمرة التيليفون</label>
      <input id="phone" className={`inp ${errors.phone ? "bad" : ""}`} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="06 00 00 00 00"
        style={{ textAlign: "right", letterSpacing: 1 }} value={f.phone} onChange={(e) => setField("phone", e.target.value)} />
      {err("phone")}

      <label className="lbl" htmlFor="city">🏙 المدينة ولا الدوار</label>
      <input id="city" className={`inp ${errors.city ? "bad" : ""}`} list="cities" autoComplete="address-level2" placeholder="مثلاً: تاونات"
        value={f.city} onChange={(e) => setField("city", e.target.value)} />
      <datalist id="cities">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
      {err("city")}

      <label className="lbl" htmlFor="address">📍 العنوان</label>
      <input id="address" className={`inp ${errors.address ? "bad" : ""}`} autoComplete="street-address" placeholder="الحي ولا الدوار، رقم الدار"
        value={f.address} onChange={(e) => setField("address", e.target.value)} />
      {err("address")}

      <span className="lbl">🔢 شحال من منشار؟</span>
      <div className="qty">
        <button type="button" aria-label="زيد واحد" onClick={() => { begin(); setQty((q) => Math.min(MAX_QTY, q + 1)); }} disabled={qty >= MAX_QTY}>+</button>
        <output aria-live="polite">{qty}<small>{qty === 1 ? "منشار واحد" : `${qty} منشارات`}</small></output>
        <button type="button" aria-label="نقص واحد" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
      </div>
      {err("quantity")}

      <div className="hp" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setField("website", e.target.value)} /></label>
      </div>

      <div className="total"><span>المجموع</span><b>{total} درهم</b></div>

      {serverMsg ? <div className="err" role="alert" style={{ marginBottom: 12 }}>⚠ {serverMsg}</div> : null}

      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "صبر شوية…" : "✔ أكد الطلبية"}
      </button>
      <p className="reassure">💵 ما كتخلص حتى يوصلك المنشار<br />{PRICES.unit} درهم للمنشار الواحد</p>
    </form>
  );
}
