// Мировая база университетов и программ: справочники, типы и разбор фильтров.
// Общий код для сервера (API) и браузера (страница поиска).

// Направления — поля науки OpenAlex (английский ключ → подпись). Одни и те же ключи
// у вузов (сильные направления) и у программ.
export const FIELDS: Record<string, string> = {
  "Computer Science": "Компьютерные науки",
  Engineering: "Инженерия",
  Mathematics: "Математика",
  "Physics and Astronomy": "Физика и астрономия",
  Chemistry: "Химия",
  "Chemical Engineering": "Химическая инженерия",
  "Materials Science": "Материаловедение",
  Energy: "Энергетика",
  "Earth and Planetary Sciences": "Науки о Земле",
  "Environmental Science": "Экология",
  "Agricultural and Biological Sciences": "Биология и агрономия",
  "Biochemistry, Genetics and Molecular Biology": "Биохимия и генетика",
  "Immunology and Microbiology": "Иммунология и микробиология",
  Neuroscience: "Нейронауки",
  Medicine: "Медицина",
  Dentistry: "Стоматология",
  Nursing: "Сестринское дело",
  "Health Professions": "Здравоохранение",
  "Pharmacology, Toxicology and Pharmaceutics": "Фармацевтика",
  Veterinary: "Ветеринария",
  Psychology: "Психология",
  "Business, Management and Accounting": "Бизнес и менеджмент",
  "Economics, Econometrics and Finance": "Экономика и финансы",
  "Decision Sciences": "Аналитика и исследование операций",
  "Social Sciences": "Социальные науки, право, политология",
  "Arts and Humanities": "Гуманитарные науки и искусство",
};

export const CONTINENTS: Record<string, string> = {
  EU: "Европа",
  AS: "Азия",
  NA: "Северная Америка",
  SA: "Южная Америка",
  AF: "Африка",
  OC: "Австралия и Океания",
};

export const CONTROLS: Record<string, string> = { public: "Государственный", private: "Частный", for_profit: "Коммерческий" };
export const DEGREES: Record<string, string> = { foundation: "Foundation", bachelor: "Бакалавриат", master: "Магистратура", phd: "PhD" };
export const FORMATS: Record<string, string> = { on_campus: "Очно", online: "Онлайн", blended: "Смешанный" };
export const STUDY_MODES: Record<string, string> = { full_time: "Полный день", part_time: "Частичная занятость" };
export const LANGUAGES = ["English", "German", "French", "Spanish", "Italian", "Dutch", "Korean", "Japanese", "Chinese", "Turkish", "Russian", "Kazakh", "Czech", "Polish", "Hungarian"];

// Подписи справочников на казахском и английском (русские — выше). Ключи те же.
const FIELDS_KZ: Record<string, string> = {
  "Computer Science": "Компьютерлік ғылымдар",
  Engineering: "Инженерия",
  Mathematics: "Математика",
  "Physics and Astronomy": "Физика және астрономия",
  Chemistry: "Химия",
  "Chemical Engineering": "Химиялық инженерия",
  "Materials Science": "Материалтану",
  Energy: "Энергетика",
  "Earth and Planetary Sciences": "Жер туралы ғылымдар",
  "Environmental Science": "Экология",
  "Agricultural and Biological Sciences": "Биология және агрономия",
  "Biochemistry, Genetics and Molecular Biology": "Биохимия және генетика",
  "Immunology and Microbiology": "Иммунология және микробиология",
  Neuroscience: "Нейроғылымдар",
  Medicine: "Медицина",
  Dentistry: "Стоматология",
  Nursing: "Мейірбике ісі",
  "Health Professions": "Денсаулық сақтау",
  "Pharmacology, Toxicology and Pharmaceutics": "Фармацевтика",
  Veterinary: "Ветеринария",
  Psychology: "Психология",
  "Business, Management and Accounting": "Бизнес және менеджмент",
  "Economics, Econometrics and Finance": "Экономика және қаржы",
  "Decision Sciences": "Талдау және операцияларды зерттеу",
  "Social Sciences": "Әлеуметтік ғылымдар, құқық, саясаттану",
  "Arts and Humanities": "Гуманитарлық ғылымдар және өнер",
};

const LABELS = {
  kz: {
    continents: { EU: "Еуропа", AS: "Азия", NA: "Солтүстік Америка", SA: "Оңтүстік Америка", AF: "Африка", OC: "Аустралия және Мұхит аралдары" },
    controls: { public: "Мемлекеттік", private: "Жекеменшік", for_profit: "Коммерциялық" },
    degrees: { foundation: "Foundation", bachelor: "Бакалавриат", master: "Магистратура", phd: "PhD" },
    formats: { on_campus: "Күндізгі", online: "Онлайн", blended: "Аралас" },
    studyModes: { full_time: "Толық күн", part_time: "Жартылай жүктеме" },
  },
  en: {
    continents: { EU: "Europe", AS: "Asia", NA: "North America", SA: "South America", AF: "Africa", OC: "Australia and Oceania" },
    controls: { public: "Public", private: "Private", for_profit: "For-profit" },
    degrees: { foundation: "Foundation", bachelor: "Bachelor’s", master: "Master’s", phd: "PhD" },
    formats: { on_campus: "On campus", online: "Online", blended: "Blended" },
    studyModes: { full_time: "Full-time", part_time: "Part-time" },
  },
};

// Все подписи справочников на нужном языке
export function worldLabels(lang: "ru" | "kz" | "en") {
  if (lang === "ru") return { fields: FIELDS, continents: CONTINENTS, controls: CONTROLS, degrees: DEGREES, formats: FORMATS, studyModes: STUDY_MODES };
  const l = LABELS[lang];
  const fields = lang === "en" ? Object.fromEntries(Object.keys(FIELDS).map((k) => [k, k])) : FIELDS_KZ;
  return { fields, continents: l.continents as Record<string, string>, controls: l.controls as Record<string, string>, degrees: l.degrees as Record<string, string>, formats: l.formats as Record<string, string>, studyModes: l.studyModes as Record<string, string> };
}

export type WorldUniversity = {
  id: string;
  name: string;
  nameRu: string | null;
  countryCode: string | null;
  continent: string | null;
  region: string;
  city: string;
  homepage: string;
  established: number | null;
  control: string | null;
  students: number | null;
  admissionRate: number | null;
  satAvg: number | null;
  tuitionIn: number | null;
  tuitionOut: number | null;
  scienceRank: number | null;
  fields: string[];
  curatedId: string | null;
  programs: number; // опубликованных программ (подходящих под фильтры программ, если они заданы)
};

export type WorldUniversityDetail = WorldUniversity & {
  names: Record<string, string>;
  acronyms: string[];
  lat: number | null;
  lng: number | null;
  worksCount: number;
  citedByCount: number;
  hIndex: number;
  fieldScores: Record<string, number>;
  rorId: string | null;
  openalexId: string | null;
  scorecardId: number | null;
  programList: Program[];
};

export type Program = {
  id: string;
  universityId: string;
  universityName?: string;
  name: string;
  degree: string;
  field: string | null;
  language: string;
  durationMonths: number | null;
  format: string;
  studyMode: string;
  tuitionAmount: number | null;
  tuitionCurrency: string;
  tuitionUsd: number | null;
  ieltsMin: number | null;
  toeflMin: number | null;
  satMin: number | null;
  requirements: string;
  deadline: string | null;
  deadlineNote: string;
  startMonth: string;
  scholarships: string;
  url: string;
  checkedAt: string;
  published: boolean;
};

// ——— фильтры поиска (те же ключи в адресе страницы и в запросе к API) ———

export const SORTS: Record<string, string> = {
  rank: "Научный вес",
  name: "По названию",
  oldest: "Старейшие",
  admission: "Самый низкий % приёма",
  cheap: "Дешевле (США)",
};

export type Filters = {
  q: string;
  country: string[];
  continent: string[];
  field: string[];
  control: string[];
  top: string; // 100 | 500 | 1000 | 5000 — место по научному весу
  est: string; // old (до 1800) | classic (1800–1950) | modern (1950–1990) | new (после 1990)
  adm: string; // максимальная доля принятых (США): 0.1 | 0.25 | 0.5
  tuition: string; // максимальная стоимость в год для иностранцев (США)
  sat: string; // максимальный средний SAT поступивших (США)
  curated: boolean; // есть требования Unilight (работает gap analysis)
  // программы
  hasPrograms: boolean;
  degree: string[];
  lang: string[];
  pfield: string[];
  format: string[];
  ptuition: string; // максимум $ в год
  ielts: string; // максимальный требуемый IELTS
  scholarships: boolean;
  sort: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  country: [],
  continent: [],
  field: [],
  control: [],
  top: "",
  est: "",
  adm: "",
  tuition: "",
  sat: "",
  curated: false,
  hasPrograms: false,
  degree: [],
  lang: [],
  pfield: [],
  format: [],
  ptuition: "",
  ielts: "",
  scholarships: false,
  sort: "rank",
};

const LIST_KEYS = ["country", "continent", "field", "control", "degree", "lang", "pfield", "format"] as const;
const TEXT_KEYS = ["q", "top", "est", "adm", "tuition", "sat", "ptuition", "ielts", "sort"] as const;
const BOOL_KEYS = ["curated", "hasPrograms", "scholarships"] as const;

export function parseFilters(p: URLSearchParams): Filters {
  const f: Filters = structuredClone(EMPTY_FILTERS);
  for (const k of LIST_KEYS) f[k] = (p.get(k) ?? "").split(",").filter(Boolean);
  for (const k of TEXT_KEYS) f[k] = (p.get(k) ?? "").trim().slice(0, 120) || EMPTY_FILTERS[k];
  for (const k of BOOL_KEYS) f[k] = p.get(k) === "1";
  if (!SORTS[f.sort]) f.sort = "rank";
  return f;
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  for (const k of LIST_KEYS) if (f[k].length) p.set(k, f[k].join(","));
  for (const k of TEXT_KEYS) if (f[k] && f[k] !== EMPTY_FILTERS[k]) p.set(k, f[k]);
  for (const k of BOOL_KEYS) if (f[k]) p.set(k, "1");
  return p;
}

export const hasProgramFilters = (f: Filters) =>
  f.hasPrograms || f.degree.length > 0 || f.lang.length > 0 || f.pfield.length > 0 || f.format.length > 0 || !!f.ptuition || !!f.ielts || f.scholarships;

// Название страны по коду на нужном языке (Intl знает все страны мира)
export function countryName(code: string | null, lang = "ru") {
  if (!code) return "";
  try {
    return new Intl.DisplayNames([lang === "kz" ? "kk" : lang], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const money = (n: number | null, currency = "USD") =>
  n == null ? "" : currency === "USD" ? `$${n.toLocaleString("ru-RU")}` : `${n.toLocaleString("ru-RU")} ${currency}`;
