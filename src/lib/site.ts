// Название, контакты и тарифы Unilight — меняются здесь, в одном месте.
export const SITE = {
  name: "Unilight",
  tagline: "Face everything and rise",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://step-by-step-tau.vercel.app",
  domain: "unilight.kz",
  contactEmail: "", // почта для вопросов о данных и поддержки — показывается в политике конфиденциальности
  updatedAt: "26 сентября 2026",
};

export type Plan = {
  id: "month" | "quarter" | "year"; // название и подпись тарифа — в словарях src/lib/i18n (pricing.plans)
  price: number; // ₸ за весь срок
  days: number;
  // Сколько стоил бы тот же срок при помесячной оплате — честное сравнение, а не выдуманная «старая цена»
  compareAt?: number;
  recommended?: boolean;
};

const MONTH_PRICE = 13_990;

export const PLANS: Plan[] = [
  { id: "month", price: MONTH_PRICE, days: 30 },
  { id: "quarter", price: 17_990, days: 90, compareAt: MONTH_PRICE * 3, recommended: true },
  { id: "year", price: 47_990, days: 365, compareAt: MONTH_PRICE * 12 },
];

export const formatTenge = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} ₸`;
