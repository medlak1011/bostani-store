import "./globals.css";
import Script from "next/script";
import { BRAND, PRODUCT, PRICES } from "../lib/product";

export const metadata = {
  title: `${PRODUCT.name} · ${BRAND.nameAr}`,
  description: `${PRODUCT.name} بشفرة من الفولاذ المقوى — ${PRICES.unit} درهم، الدفع عند الاستلام.`,
  openGraph: { images: ["/images/hero.jpg"] },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#111214" };

// Set NEXT_PUBLIC_META_PIXEL_ID in Vercel once the new pixel exists.
const PIXEL = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "").replace(/\D/g, "");

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {PIXEL ? (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${PIXEL}');fbq('track','PageView');
          `}</Script>
        ) : null}
      </body>
    </html>
  );
}
