// ДЕМО-ДАННЫЕ — стартовое наполнение каталога. Рабочие данные живут в Supabase
// (таблицы opportunities / universities) и редактируются в /admin; этот файл нужен
// только для кнопки «Загрузить демо-записи» и для локальной разработки без базы.
// Программы реальные, но даты и условия примерные — перед запуском
// заменить базой, которую ведёт команда (из Telegram-канала / админки).

export type OpportunityType =
  | "Олимпиада"
  | "Хакатон"
  | "Конкурс"
  | "Летняя школа"
  | "Исследование"
  | "Эссе-конкурс"
  | "Конференция";

export type Opportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  interests: string[]; // совпадают со значениями INTERESTS из анкеты
  minGrade: number;
  maxGrade: number;
  format: "Онлайн" | "Офлайн" | "Гибрид";
  location: string;
  free: boolean;
  deadline: string; // ISO-дата
  prepWeeks: number; // за сколько недель стоит начать готовиться
  url: string;
  description: string;
  // переводы названия и описания (их делает ИИ-агент или админка); без перевода — русский текст
  i18n?: { kz?: { title: string; description: string }; en?: { title: string; description: string } };
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "nasa-space-apps",
    title: "NASA Space Apps Challenge",
    type: "Хакатон",
    interests: ["Программирование", "Наука и исследования", "Инженерия и робототехника", "Экология"],
    minGrade: 8, maxGrade: 12,
    format: "Гибрид", location: "Онлайн и локальные площадки",
    free: true, deadline: "2026-10-02", prepWeeks: 2,
    url: "https://www.spaceappschallenge.org",
    description: "Международный хакатон: 48 часов на решение задач NASA по данным о Земле и космосе.",
  },
  {
    id: "john-locke",
    title: "John Locke Institute Essay Competition",
    type: "Эссе-конкурс",
    interests: ["Право и политика", "Экономика и финансы", "Психология", "Журналистика и медиа"],
    minGrade: 9, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-06-30", prepWeeks: 8,
    url: "https://www.johnlockeinstitute.com/essay-competition",
    description: "Престижный конкурс эссе по философии, политике, экономике, истории, психологии и праву.",
  },
  {
    id: "technovation",
    title: "Technovation Girls",
    type: "Конкурс",
    interests: ["Программирование", "Бизнес и предпринимательство", "Искусственный интеллект"],
    minGrade: 7, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-03-15", prepWeeks: 12,
    url: "https://technovationchallenge.org",
    description: "Команды девушек создают мобильное приложение или AI-проект для решения проблемы своего города.",
  },
  {
    id: "conrad",
    title: "Conrad Challenge",
    type: "Конкурс",
    interests: ["Инженерия и робототехника", "Бизнес и предпринимательство", "Экология", "Медицина"],
    minGrade: 8, maxGrade: 12,
    format: "Онлайн", location: "Онлайн + финал в США",
    free: true, deadline: "2026-11-15", prepWeeks: 6,
    url: "https://www.conradchallenge.org",
    description: "Инновационный конкурс: команда придумывает продукт в сферах энергетики, здоровья, космоса, экологии.",
  },
  {
    id: "rsi",
    title: "Research Science Institute (RSI, MIT)",
    type: "Исследование",
    interests: ["Наука и исследования", "Программирование", "Медицина", "Инженерия и робототехника"],
    minGrade: 11, maxGrade: 11,
    format: "Офлайн", location: "MIT, США",
    free: true, deadline: "2027-01-15", prepWeeks: 10,
    url: "https://www.cee.org/programs/research-science-institute",
    description: "Одна из самых сильных летних исследовательских программ в мире, полностью бесплатная.",
  },
  {
    id: "yygs",
    title: "Yale Young Global Scholars",
    type: "Летняя школа",
    interests: ["Право и политика", "Наука и исследования", "Экономика и финансы", "Психология"],
    minGrade: 10, maxGrade: 11,
    format: "Офлайн", location: "Yale, США",
    free: false, deadline: "2027-01-10", prepWeeks: 8,
    url: "https://globalscholars.yale.edu",
    description: "Двухнедельная академическая программа Йеля. Есть финансовая помощь до 100%.",
  },
  {
    id: "isef",
    title: "Regeneron ISEF (через национальный отбор)",
    type: "Конференция",
    interests: ["Наука и исследования", "Медицина", "Инженерия и робототехника", "Экология"],
    minGrade: 9, maxGrade: 12,
    format: "Офлайн", location: "США",
    free: true, deadline: "2027-02-01", prepWeeks: 16,
    url: "https://www.societyforscience.org/isef",
    description: "Крупнейшая международная выставка научных проектов школьников.",
  },
  {
    id: "mit-think",
    title: "MIT THINK Scholars",
    type: "Исследование",
    interests: ["Наука и исследования", "Инженерия и робототехника", "Программирование"],
    minGrade: 9, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-01-01", prepWeeks: 8,
    url: "https://think.mit.edu",
    description: "Подаёшь исследовательский proposal — финалисты получают финансирование и менторство от студентов MIT.",
  },
  {
    id: "immerse-essay",
    title: "Immerse Education Essay Competition",
    type: "Эссе-конкурс",
    interests: ["Медицина", "Бизнес и предпринимательство", "Архитектура", "Право и политика", "Психология"],
    minGrade: 8, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-03-31", prepWeeks: 4,
    url: "https://www.immerse.education/essay-competition",
    description: "Эссе по выбранному направлению; победители получают стипендию на летнюю программу в Оксфорде/Кембридже.",
  },
  {
    id: "kaggle",
    title: "Kaggle: соревнования по Data Science",
    type: "Конкурс",
    interests: ["Искусственный интеллект", "Программирование"],
    minGrade: 9, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2026-12-01", prepWeeks: 4,
    url: "https://www.kaggle.com/competitions",
    description: "Реальные ML-задачи с публичным рейтингом — хороший способ показать навыки в портфолио.",
  },
  {
    id: "ioi-kz",
    title: "Республиканская олимпиада по информатике",
    type: "Олимпиада",
    interests: ["Программирование"],
    minGrade: 8, maxGrade: 11,
    format: "Офлайн", location: "Казахстан",
    free: true, deadline: "2026-11-20", prepWeeks: 10,
    url: "https://www.daryn.kz",
    description: "Путь к международной олимпиаде IOI. Отбор: школьный → городской → областной → республиканский этапы.",
  },
  {
    id: "physics-kz",
    title: "Республиканская олимпиада по физике",
    type: "Олимпиада",
    interests: ["Наука и исследования", "Инженерия и робототехника"],
    minGrade: 8, maxGrade: 11,
    format: "Офлайн", location: "Казахстан",
    free: true, deadline: "2026-11-20", prepWeeks: 10,
    url: "https://www.daryn.kz",
    description: "Отбор на IPhO и APhO. Хорошо смотрится в заявке на инженерные и физические направления.",
  },
  {
    id: "harvard-mun",
    title: "Model United Nations (школьные и городские конференции)",
    type: "Конференция",
    interests: ["Право и политика", "Журналистика и медиа", "Экономика и финансы"],
    minGrade: 7, maxGrade: 12,
    format: "Офлайн", location: "Казахстан / зарубеж",
    free: false, deadline: "2026-12-10", prepWeeks: 4,
    url: "https://www.un.org/en/mun",
    description: "Дебаты в формате ООН: развивает публичные выступления и лидерство.",
  },
  {
    id: "wolfram",
    title: "Wolfram Emerging Leaders Program",
    type: "Исследование",
    interests: ["Программирование", "Наука и исследования", "Искусственный интеллект"],
    minGrade: 9, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-04-01", prepWeeks: 6,
    url: "https://education.wolfram.com/programs",
    description: "Собственный исследовательский проект под руководством ментора Wolfram.",
  },
  {
    id: "volunteer",
    title: "Долгосрочный волонтёрский проект",
    type: "Конкурс",
    interests: ["Волонтёрство", "Экология", "Медицина", "Психология"],
    minGrade: 7, maxGrade: 12,
    format: "Офлайн", location: "Твой город",
    free: true, deadline: "2026-10-31", prepWeeks: 2,
    url: "https://www.volunteer.kz",
    description: "Регулярное волонтёрство 3–6 месяцев с измеримым результатом ценится выше разовых акций.",
  },
  {
    id: "design-contest",
    title: "Конкурс дизайна и архитектуры для школьников",
    type: "Конкурс",
    interests: ["Дизайн", "Архитектура", "Музыка и искусство"],
    minGrade: 8, maxGrade: 12,
    format: "Онлайн", location: "Онлайн",
    free: true, deadline: "2027-02-15", prepWeeks: 6,
    url: "https://www.behance.net",
    description: "Портфолио творческих работ — основа заявки на дизайн и архитектуру.",
  },
];
