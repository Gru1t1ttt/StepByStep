// Модель данных базы знаний (RAG).
//
// Документ — то, что загружает команда или присылает выпускник: один отзыв, одна статья, один факт.
// Чанк — кусок документа (1–2 абзаца) со своим эмбеддингом; поиск идёт по чанкам.

export type KnowledgeKind =
  | "experience" // опыт поступивших: главная ценность базы
  | "guide" // гайды и объяснения от команды
  | "fact"; // проверяемые факты: требования, дедлайны, гранты

export type DocStatus = "pending" | "approved" | "rejected";

export type Outcome = "admitted" | "rejected" | "waitlisted" | "enrolled" | "";

export type KnowledgeMeta = {
  // Общие
  source?: string; // «Анкета выпускника», «Интервью», «Команда Unilight», название сайта
  sourceUrl?: string;
  language?: string;
  demo?: boolean; // демонстрационная запись — удалить перед запуском

  // Для опыта поступивших
  university?: string;
  country?: string;
  year?: number;
  outcome?: Outcome;
  major?: string;
  school?: string; // тип школы: НИШ, РФМШ, обычная…
  profile?: string; // краткий профиль автора: GPA, экзамены, активности

  // Для фактов — когда последний раз проверяли
  verifiedAt?: string;

  // Контакт автора отзыва — только для команды, в промпт ИИ не передаётся
  contact?: string;
};

export type KnowledgeDoc = {
  id: string;
  kind: KnowledgeKind;
  title: string;
  text: string;
  meta: KnowledgeMeta;
  status: DocStatus;
  createdAt: string;
  updatedAt: string;
};

export type Chunk = {
  id: string;
  docId: string;
  index: number;
  text: string; // то, что видит модель
  embedding: number[];
};

export type SearchHit = {
  chunk: Chunk;
  doc: KnowledgeDoc;
  score: number; // итоговый балл после слияния векторного и текстового поиска
  vectorScore: number;
  keywordScore: number;
};

export const KIND_LABELS: Record<KnowledgeKind, string> = {
  experience: "Опыт поступивших",
  guide: "Гайд",
  fact: "Факт",
};

export const OUTCOME_LABELS: Record<Exclude<Outcome, "">, string> = {
  admitted: "Поступил(а)",
  enrolled: "Поступил(а) и учится",
  waitlisted: "Лист ожидания",
  rejected: "Отказ",
};
