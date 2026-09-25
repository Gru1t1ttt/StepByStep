// ДЕМО-ДАННЫЕ — стартовое наполнение каталога. Рабочие данные живут в Supabase
// (таблицы opportunities / universities) и редактируются в /admin; этот файл нужен
// только для кнопки «Загрузить демо-записи» и для локальной разработки без базы.
// Требования, стоимость и рейтинги примерные — перед запуском
// заменить базой университетов (ориентир — Bachelorsportal, QS, THE).

export type University = {
  id: string;
  name: string;
  country: string; // совпадает со значениями COUNTRIES из анкеты
  city: string;
  qsRank: number;
  majors: string[]; // совпадают с MAJORS из анкеты
  tuitionUsd: number; // в год, для иностранцев
  grants: "Полный грант" | "Частичный грант" | "Нет грантов";
  ielts: number;
  sat: number | null; // null — не требуется
  gpa: number; // минимальный средний балл по 5-балльной шкале
  olympiads: number; // желательное число значимых олимпиад/конкурсов
  activities: number; // желательное число внеклассных активностей
  research: boolean; // ценится ли исследовательский проект
  deadline: string; // ISO-дата основной подачи
  url?: string; // официальный сайт / страница приёма
};

export const UNIVERSITIES: University[] = [
  { id: "mit", name: "Massachusetts Institute of Technology", country: "США", city: "Кембридж", qsRank: 1, majors: ["Computer Science", "Engineering", "Mathematics", "Physics", "Data Science / AI", "Economics"], tuitionUsd: 62000, grants: "Полный грант", ielts: 7.0, sat: 1540, gpa: 4.9, olympiads: 3, activities: 5, research: true, deadline: "2027-01-01" },
  { id: "stanford", name: "Stanford University", country: "США", city: "Стэнфорд", qsRank: 6, majors: ["Computer Science", "Engineering", "Business", "Economics", "Biology", "Data Science / AI"], tuitionUsd: 65000, grants: "Полный грант", ielts: 7.0, sat: 1530, gpa: 4.9, olympiads: 3, activities: 5, research: true, deadline: "2027-01-05" },
  { id: "nyu-abu-dhabi", name: "NYU Abu Dhabi", country: "США", city: "Абу-Даби / Нью-Йорк", qsRank: 38, majors: ["Computer Science", "Engineering", "Economics", "International Relations", "Psychology"], tuitionUsd: 60000, grants: "Полный грант", ielts: 7.0, sat: 1470, gpa: 4.8, olympiads: 2, activities: 4, research: false, deadline: "2027-01-01" },
  { id: "oxford", name: "University of Oxford", country: "Великобритания", city: "Оксфорд", qsRank: 4, majors: ["Mathematics", "Physics", "Law", "Economics", "Medicine", "Computer Science"], tuitionUsd: 50000, grants: "Частичный грант", ielts: 7.5, sat: 1470, gpa: 4.9, olympiads: 2, activities: 3, research: true, deadline: "2026-10-15" },
  { id: "ucl", name: "University College London", country: "Великобритания", city: "Лондон", qsRank: 9, majors: ["Architecture", "Economics", "Law", "Psychology", "Computer Science", "Medicine"], tuitionUsd: 40000, grants: "Частичный грант", ielts: 7.0, sat: 1400, gpa: 4.6, olympiads: 1, activities: 3, research: false, deadline: "2027-01-14" },
  { id: "toronto", name: "University of Toronto", country: "Канада", city: "Торонто", qsRank: 25, majors: ["Computer Science", "Engineering", "Business", "Psychology", "Biology", "Economics"], tuitionUsd: 45000, grants: "Полный грант", ielts: 6.5, sat: null, gpa: 4.6, olympiads: 1, activities: 3, research: false, deadline: "2027-01-15" },
  { id: "tum", name: "Technical University of Munich", country: "Германия", city: "Мюнхен", qsRank: 28, majors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Data Science / AI"], tuitionUsd: 5000, grants: "Частичный грант", ielts: 6.5, sat: null, gpa: 4.5, olympiads: 1, activities: 2, research: false, deadline: "2027-05-31" },
  { id: "rwth", name: "RWTH Aachen University", country: "Германия", city: "Ахен", qsRank: 99, majors: ["Engineering", "Computer Science", "Physics"], tuitionUsd: 1000, grants: "Частичный грант", ielts: 6.5, sat: null, gpa: 4.3, olympiads: 0, activities: 2, research: false, deadline: "2027-03-01" },
  { id: "tudelft", name: "TU Delft", country: "Нидерланды", city: "Делфт", qsRank: 47, majors: ["Engineering", "Architecture", "Computer Science", "Design"], tuitionUsd: 18000, grants: "Частичный грант", ielts: 6.5, sat: null, gpa: 4.5, olympiads: 1, activities: 2, research: false, deadline: "2027-01-15" },
  { id: "polimi", name: "Politecnico di Milano", country: "Италия", city: "Милан", qsRank: 111, majors: ["Engineering", "Architecture", "Design"], tuitionUsd: 4500, grants: "Полный грант", ielts: 6.0, sat: 1200, gpa: 4.3, olympiads: 0, activities: 2, research: false, deadline: "2027-02-28" },
  { id: "kaist", name: "KAIST", country: "Южная Корея", city: "Тэджон", qsRank: 53, majors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Data Science / AI"], tuitionUsd: 8000, grants: "Полный грант", ielts: 6.5, sat: null, gpa: 4.5, olympiads: 1, activities: 2, research: true, deadline: "2026-12-10" },
  { id: "nus", name: "National University of Singapore", country: "Сингапур", city: "Сингапур", qsRank: 8, majors: ["Computer Science", "Engineering", "Business", "Economics", "Medicine", "Data Science / AI"], tuitionUsd: 30000, grants: "Частичный грант", ielts: 6.5, sat: 1450, gpa: 4.8, olympiads: 2, activities: 3, research: false, deadline: "2027-02-20" },
  { id: "hku", name: "University of Hong Kong", country: "Гонконг", city: "Гонконг", qsRank: 17, majors: ["Business", "Law", "Medicine", "Engineering", "Finance", "Economics"], tuitionUsd: 25000, grants: "Полный грант", ielts: 6.5, sat: 1400, gpa: 4.6, olympiads: 1, activities: 3, research: false, deadline: "2027-01-06" },
  { id: "koc", name: "Koç University", country: "Турция", city: "Стамбул", qsRank: 400, majors: ["Engineering", "Business", "Economics", "International Relations", "Psychology", "Medicine"], tuitionUsd: 25000, grants: "Полный грант", ielts: 6.5, sat: 1300, gpa: 4.4, olympiads: 0, activities: 2, research: false, deadline: "2027-03-15" },
  { id: "elte", name: "Eötvös Loránd University (Stipendium Hungaricum)", country: "Венгрия", city: "Будапешт", qsRank: 590, majors: ["Computer Science", "Psychology", "Biology", "International Relations", "Mathematics"], tuitionUsd: 0, grants: "Полный грант", ielts: 6.0, sat: null, gpa: 4.2, olympiads: 0, activities: 1, research: false, deadline: "2027-01-15" },
  { id: "nu", name: "Nazarbayev University", country: "Казахстан", city: "Астана", qsRank: 350, majors: ["Engineering", "Computer Science", "Medicine", "Economics", "Business", "Biology"], tuitionUsd: 0, grants: "Полный грант", ielts: 6.5, sat: 1200, gpa: 4.3, olympiads: 1, activities: 2, research: false, deadline: "2027-03-01" },
];
