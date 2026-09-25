// Данные анкеты школьника. Позже этот профиль будет уходить в базу и в ИИ для анализа.

export type Achievement = {
  title: string;
  level: string;
  result: string;
  year: string;
};

export type Activity = {
  role: string;
  organization: string;
  description: string;
  hoursPerWeek: string;
};

export type ExamScore = {
  exam: string;
  status: "done" | "planned";
  score: string;
};

export type Language = {
  name: string;
  level: string;
};

export type Profile = {
  fullName: string;
  birthDate: string;
  country: string;
  city: string;

  school: string;
  schoolType: string;
  grade: string;
  gpa: string;
  favoriteSubjects: string[];
  hardSubjects: string[];

  languages: Language[];
  exams: ExamScore[];

  interests: string[];
  skills: string;
  hobbies: string;

  achievements: Achievement[];
  activities: Activity[];

  targetCountries: string[];
  targetMajors: string[];
  dreamUniversities: string;
  budget: string;
  admissionYear: string;

  mbti: string;
  about: string;
};

export const emptyProfile: Profile = {
  fullName: "",
  birthDate: "",
  country: "Казахстан",
  city: "",
  school: "",
  schoolType: "",
  grade: "",
  gpa: "",
  favoriteSubjects: [],
  hardSubjects: [],
  languages: [
    { name: "Казахский", level: "" },
    { name: "Русский", level: "" },
    { name: "Английский", level: "" },
  ],
  exams: [],
  interests: [],
  skills: "",
  hobbies: "",
  achievements: [],
  activities: [],
  targetCountries: [],
  targetMajors: [],
  dreamUniversities: "",
  budget: "",
  admissionYear: "",
  mbti: "",
  about: "",
};

export const SCHOOL_TYPES = [
  "НИШ",
  "КТЛ / БИЛ",
  "РФМШ",
  "Гимназия / лицей",
  "Обычная школа",
  "Международная школа (IB / A-Level)",
  "Другое",
];

export const GRADES = ["7", "8", "9", "10", "11", "12", "Уже окончил(а) школу"];

export const SUBJECTS = [
  "Математика",
  "Физика",
  "Химия",
  "Биология",
  "Информатика",
  "История",
  "География",
  "Экономика",
  "Литература",
  "Английский язык",
  "Искусство",
  "Музыка",
];

export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Родной"];

export const EXAMS = ["IELTS", "TOEFL", "Duolingo English Test", "SAT", "ACT", "AP", "Другой"];

export const INTERESTS = [
  "Программирование",
  "Инженерия и робототехника",
  "Искусственный интеллект",
  "Наука и исследования",
  "Медицина",
  "Бизнес и предпринимательство",
  "Экономика и финансы",
  "Право и политика",
  "Экология",
  "Дизайн",
  "Архитектура",
  "Журналистика и медиа",
  "Психология",
  "Волонтёрство",
  "Спорт",
  "Музыка и искусство",
];

export const ACHIEVEMENT_LEVELS = ["Школьный", "Городской", "Областной", "Республиканский", "Международный"];

export const COUNTRIES = [
  "США",
  "Великобритания",
  "Канада",
  "Германия",
  "Нидерланды",
  "Италия",
  "Франция",
  "Южная Корея",
  "Япония",
  "Китай",
  "Гонконг",
  "Сингапур",
  "Турция",
  "Венгрия",
  "Чехия",
  "Казахстан",
];

export const MAJORS = [
  "Computer Science",
  "Engineering",
  "Data Science / AI",
  "Mathematics",
  "Physics",
  "Medicine",
  "Biology",
  "Business",
  "Economics",
  "Finance",
  "International Relations",
  "Law",
  "Psychology",
  "Architecture",
  "Design",
];

export const BUDGETS = [
  "Нужен полный грант",
  "Нужен частичный грант",
  "Можем оплатить обучение",
  "Пока не знаю",
];

export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export const MBTI_TEST_URL = "https://www.16personalities.com/ru/test-lichnosti";
