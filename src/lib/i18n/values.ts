import type { Lang } from ".";

// Перевод значений, которые хранятся в данных по-русски: варианты ответов анкеты, типы
// возможностей, страны из каталога. В профиле остаётся русское значение (оно служит кодом,
// старые профили не ломаются), а на экране показывается перевод. Свои варианты, которые
// ученик вписал сам, показываются как есть.

const V: Record<string, [kz: string, en: string]> = {
  // типы школ
  НИШ: ["НЗМ", "NIS"],
  "КТЛ / БИЛ": ["ҚТЛ / БІЛ", "KTL / BIL"],
  РФМШ: ["РФМБ", "RPhMS"],
  "Гимназия / лицей": ["Гимназия / лицей", "Gymnasium / lyceum"],
  "Обычная школа": ["Жалпы білім беретін мектеп", "Regular school"],
  "Международная школа (IB / A-Level)": ["Халықаралық мектеп (IB / A-Level)", "International school (IB / A-Level)"],
  Другое: ["Басқа", "Other"],
  "Уже окончил(а) школу": ["Мектепті бітірдім", "Already graduated"],
  // предметы
  Математика: ["Математика", "Mathematics"],
  Физика: ["Физика", "Physics"],
  Химия: ["Химия", "Chemistry"],
  Биология: ["Биология", "Biology"],
  Информатика: ["Информатика", "Computer science"],
  История: ["Тарих", "History"],
  География: ["География", "Geography"],
  Экономика: ["Экономика", "Economics"],
  Литература: ["Әдебиет", "Literature"],
  "Английский язык": ["Ағылшын тілі", "English"],
  Искусство: ["Өнер", "Art"],
  Музыка: ["Музыка", "Music"],
  // языки и уровни
  Родной: ["Ана тілі", "Native"],
  Казахский: ["Қазақ тілі", "Kazakh"],
  Русский: ["Орыс тілі", "Russian"],
  Английский: ["Ағылшын тілі", "English"],
  Другой: ["Басқа", "Other"],
  // интересы
  Программирование: ["Бағдарламалау", "Programming"],
  "Инженерия и робототехника": ["Инженерия және робототехника", "Engineering and robotics"],
  "Искусственный интеллект": ["Жасанды интеллект", "Artificial intelligence"],
  "Наука и исследования": ["Ғылым және зерттеу", "Science and research"],
  Медицина: ["Медицина", "Medicine"],
  "Бизнес и предпринимательство": ["Бизнес және кәсіпкерлік", "Business and entrepreneurship"],
  "Экономика и финансы": ["Экономика және қаржы", "Economics and finance"],
  "Право и политика": ["Құқық және саясат", "Law and politics"],
  Экология: ["Экология", "Environment"],
  Дизайн: ["Дизайн", "Design"],
  Архитектура: ["Сәулет", "Architecture"],
  "Журналистика и медиа": ["Журналистика және медиа", "Journalism and media"],
  Психология: ["Психология", "Psychology"],
  Волонтёрство: ["Еріктілік", "Volunteering"],
  Спорт: ["Спорт", "Sports"],
  "Музыка и искусство": ["Музыка және өнер", "Music and art"],
  // уровни достижений
  Школьный: ["Мектептік", "School"],
  Городской: ["Қалалық", "City"],
  Областной: ["Облыстық", "Regional"],
  Республиканский: ["Республикалық", "National"],
  Международный: ["Халықаралық", "International"],
  // страны
  США: ["АҚШ", "USA"],
  Великобритания: ["Ұлыбритания", "United Kingdom"],
  Канада: ["Канада", "Canada"],
  Германия: ["Германия", "Germany"],
  Нидерланды: ["Нидерланд", "Netherlands"],
  Италия: ["Италия", "Italy"],
  Франция: ["Франция", "France"],
  "Южная Корея": ["Оңтүстік Корея", "South Korea"],
  Япония: ["Жапония", "Japan"],
  Китай: ["Қытай", "China"],
  Гонконг: ["Гонконг", "Hong Kong"],
  Сингапур: ["Сингапур", "Singapore"],
  Турция: ["Түркия", "Turkey"],
  Венгрия: ["Венгрия", "Hungary"],
  Чехия: ["Чехия", "Czechia"],
  Казахстан: ["Қазақстан", "Kazakhstan"],
  ОАЭ: ["БАӘ", "UAE"],
  // финансирование
  "Нужен полный грант": ["Толық грант керек", "Need a full scholarship"],
  "Нужен частичный грант": ["Жартылай грант керек", "Need a partial scholarship"],
  "Можем оплатить обучение": ["Оқу ақысын төлей аламыз", "We can pay tuition"],
  "Пока не знаю": ["Әзірге білмеймін", "Not sure yet"],
  // возможности
  Олимпиада: ["Олимпиада", "Olympiad"],
  Хакатон: ["Хакатон", "Hackathon"],
  Конкурс: ["Байқау", "Competition"],
  "Летняя школа": ["Жазғы мектеп", "Summer school"],
  Исследование: ["Зерттеу", "Research"],
  "Эссе-конкурс": ["Эссе байқауы", "Essay contest"],
  Конференция: ["Конференция", "Conference"],
  Онлайн: ["Онлайн", "Online"],
  Офлайн: ["Офлайн", "In person"],
  Гибрид: ["Аралас", "Hybrid"],
  // гранты вузов
  "Полный грант": ["Толық грант", "Full scholarship"],
  "Частичный грант": ["Жартылай грант", "Partial scholarship"],
  "Нет грантов": ["Грант жоқ", "No scholarships"],
  // портфолио
  Достижение: ["Жетістік", "Achievement"],
  Проект: ["Жоба", "Project"],
  Сертификат: ["Сертификат", "Certificate"],
  Активность: ["Белсенділік", "Activity"],
  // категории плана
  Экзамен: ["Емтихан", "Exam"],
  Возможность: ["Мүмкіндік", "Opportunity"],
  Профиль: ["Профиль", "Profile"],
  Подача: ["Өтінім", "Application"],
};

// Перевод значения; неизвестное (вписанное учеником) — как есть.
export function tv(value: string, lang: Lang): string {
  if (lang === "ru" || !value) return value;
  const hit = V[value];
  return hit ? hit[lang === "kz" ? 0 : 1] : value;
}

export const LOCALE: Record<Lang, string> = { ru: "ru-RU", kz: "kk-KZ", en: "en-GB" };

// Даты. Для казахского — свои названия месяцев: в части браузеров нет казахских данных
// и вместо «26 жел.» получается «М12 26».
const KZ_MONTHS = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];

export function dateLong(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (lang === "kz") return `${d.getFullYear()} ж. ${d.getDate()} ${KZ_MONTHS[d.getMonth()]}`;
  return d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });
}

export function dateShort(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (lang === "kz") return `${d.getDate()} ${KZ_MONTHS[d.getMonth()].slice(0, 3)}`;
  return d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" });
}

export function monthShort(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (lang === "kz") return KZ_MONTHS[d.getMonth()].slice(0, 3);
  return d.toLocaleDateString(LOCALE[lang], { month: "short" });
}

export function monthYear(iso: string, lang: Lang) {
  const d = new Date(iso);
  if (lang === "kz") return `${d.getFullYear()} ж. ${KZ_MONTHS[d.getMonth()]}`;
  const raw = d.toLocaleDateString(LOCALE[lang], { month: "long", year: "numeric" });
  return raw[0].toUpperCase() + raw.slice(1);
}
