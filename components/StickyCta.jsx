"use client";
import { useEffect, useState } from "react";

// Bottom bar with the price and a big button; hides while the order form is on screen.
export default function StickyCta({ price }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const el = document.getElementById("order");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setHide(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`sticky ${hide ? "hide" : ""}`}>
      <div className="wrap">
        <div className="pr">{price} درهم<small>الدفع عند الاستلام</small></div>
        <a href="#order" className="btn">اطلب دابا</a>
      </div>
    </div>
  );
}
