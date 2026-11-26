import { MAX_QTY } from "./product";

// Accepts 06/07/05 numbers, with +212 / 00212 / 212 prefixes, spaces, dashes and dots.
export function normalizeMoroccanPhone(input) {
  if (typeof input !== "string") return null;
  let p = input.replace(/[\s.\-()]/g, "");
  p = p.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  if (p.startsWith("+212")) p = "0" + p.slice(4);
  else if (p.startsWith("00212")) p = "0" + p.slice(5);
  else if (p.startsWith("212") && p.length === 12) p = "0" + p.slice(3);
  return /^0[567]\d{8}$/.test(p) ? p : null;
}

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max) : "";

export function validateOrder(body) {
  const errors = {};
  const fullName = clean(body?.fullName, 80);
  const city = clean(body?.city, 60);
  const address = clean(body?.address, 250);
  const phone = normalizeMoroccanPhone(body?.phone || "");
  const quantity = Number(body?.quantity);

  if (fullName.length < 3) errors.fullName = "كتب سميتك عافاك";
  if (!phone) errors.phone = "النمرة ماشي صحيحة — خاصها تبدا ب 06 ولا 07 ولا 05 وفيها 10 أرقام";
  if (city.length < 2) errors.city = "كتب المدينة ولا الدوار ديالك";
  if (address.length < 3) errors.address = "كتب العنوان باش يوصلك المنشار";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) errors.quantity = "ختار شحال من منشار";

  return { ok: Object.keys(errors).length === 0, errors, data: { fullName, phone, city, address, quantity } };
}
