// Single source of truth for the product and price. Prices are enforced on the server.

export const BRAND = { name: "BOSTANI", nameAr: "بستاني" };

export const PRODUCT = {
  sku: "P4",
  name: "منشار التقليم القابل للطي",
  shortName: "منشار التقليم",
};

export const PRICES = { unit: 199, shipping: 0 };
export const MAX_QTY = 3;
export const totalFor = (qty) => PRICES.unit * qty + PRICES.shipping;

export const STATUSES = [
  { key: "new", label: "Nouvelle" },
  { key: "contacted", label: "Contactée" },
  { key: "confirmed", label: "Confirmée" },
  { key: "preparing", label: "En préparation" },
  { key: "shipped", label: "Expédiée" },
  { key: "delivered", label: "Livrée" },
  { key: "cancelled", label: "Annulée" },
  { key: "returned", label: "Retournée" },
];

export const CITIES = [
  "الدار البيضاء", "الرباط", "سلا", "تمارة", "القنيطرة", "المحمدية", "فاس", "مكناس", "طنجة", "تطوان",
  "مراكش", "أكادير", "إنزكان", "آيت ملول", "وجدة", "الناظور", "بني ملال", "خريبكة", "سطات", "برشيد",
  "الجديدة", "آسفي", "الصويرة", "العرائش", "القصر الكبير", "تازة", "الحسيمة", "خنيفرة", "الراشيدية",
  "ورزازات", "تارودانت", "تيزنيت", "كلميم", "العيون", "الداخلة", "سيدي قاسم", "سيدي سليمان", "الخميسات",
  "بركان", "تاوريرت", "إفران", "أزرو", "الفقيه بن صالح", "قلعة السراغنة", "اليوسفية", "بنسليمان", "الصخيرات",
  "وزان", "شفشاون", "ميدلت", "زاكورة", "تنغير", "الحاجب", "صفرو", "تاونات", "جرسيف", "أولاد تايمة",
];
