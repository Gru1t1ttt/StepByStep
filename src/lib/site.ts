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
  id: "month" | "quarter" | "year";
  label: string;
  price: number; // ₸ за весь срок
  days: number;
  note: string;
  // Сколько стоил бы тот же срок при помесячной оплате — честное сравнение, а не выдуманная «старая цена»
  compareAt?: number;
  recommended?: boolean;
};

const MONTH_PRICE = 13_990;

export const PLANS: Plan[] = [
  { id: "month", label: "1 месяц", price: MONTH_PRICE, days: 30, note: "Оплата каждый месяц" },
  { id: "quarter", label: "3 месяца", price: 17_990, days: 90, note: "Для серьёзной подготовки к сезону подачи", compareAt: MONTH_PRICE * 3, recommended: true },
  { id: "year", label: "12 месяцев", price: 47_990, days: 365, note: "Полный цикл: от выбора направления до оффера", compareAt: MONTH_PRICE * 12 },
];

export const PLAN_FEATURES = [
  "ИИ-наставник, который помнит твой профиль и прогресс",
  "Персональная карта развития и gap analysis для выбранных вузов",
  "Подбор олимпиад, конкурсов, хакатонов и летних школ",
  "База университетов с требованиями, грантами и дедлайнами",
  "Портфолио для подачи и календарь дедлайнов",
  "Опыт реально поступивших студентов в ответах наставника",
];

export const formatTenge = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} ₸`;
