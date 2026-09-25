import { search } from "./search";
import { KIND_LABELS, OUTCOME_LABELS, type SearchHit } from "./types";

// Что ИИ-наставник получает из базы на каждый вопрос.
//
// Два отдельных поиска:
//  1. Гайды и факты — по тексту вопроса.
//  2. Опыт поступивших — по вопросу + профилю ученика, чтобы находились истории людей
//     с похожим профилем и похожими целями (в том числе отказы — они самые честные).

export type StudentSummary = {
  grade?: string;
  interests?: string[];
  targetCountries?: string[];
  targetMajors?: string[];
  targets?: string[]; // названия вузов-целей
  exams?: string[]; // «IELTS 6.5», «SAT 1450»
  school?: string;
};

export type Source = {
  n: number;
  docId: string;
  title: string;
  kind: string;
  university?: string;
  outcome?: string;
  year?: number;
  source?: string;
  sourceUrl?: string;
  demo?: boolean;
};

function summaryText(s: StudentSummary) {
  return [
    s.targets?.length && `Цели: ${s.targets.join(", ")}`,
    s.targetCountries?.length && `Страны: ${s.targetCountries.join(", ")}`,
    s.targetMajors?.length && `Направления: ${s.targetMajors.join(", ")}`,
    s.exams?.length && `Экзамены: ${s.exams.join(", ")}`,
    s.school && `Школа: ${s.school}`,
    s.interests?.length && `Интересы: ${s.interests.join(", ")}`,
  ]
    .filter(Boolean)
    .join(". ");
}

export async function retrieveForMentor(question: string, student: StudentSummary) {
  const [knowledge, experience] = await Promise.all([
    search(question, { kinds: ["guide", "fact"], limit: 5 }),
    search(`${question}\n${summaryText(student)}`, { kinds: ["experience"], limit: 4, perDoc: 1 }),
  ]);
  const hits = [...experience, ...knowledge];

  const byDoc = new Map<string, number>();
  const sources: Source[] = [];
  for (const h of hits) {
    if (byDoc.has(h.doc.id)) continue;
    const n = sources.length + 1;
    byDoc.set(h.doc.id, n);
    sources.push({
      n,
      docId: h.doc.id,
      title: h.doc.title,
      kind: KIND_LABELS[h.doc.kind],
      university: h.doc.meta.university,
      outcome: h.doc.meta.outcome ? OUTCOME_LABELS[h.doc.meta.outcome] : undefined,
      year: h.doc.meta.year,
      source: h.doc.meta.source,
      sourceUrl: h.doc.meta.sourceUrl,
      demo: h.doc.meta.demo,
    });
  }

  return { hits, sources, context: formatForPrompt(hits, byDoc) };
}

function formatForPrompt(hits: SearchHit[], numbers: Map<string, number>) {
  if (!hits.length) return "В базе знаний StepByStep по этому вопросу ничего не найдено.";
  return hits
    .map((h) => {
      const m = h.doc.meta;
      const attrs = [
        KIND_LABELS[h.doc.kind],
        m.university,
        m.outcome && OUTCOME_LABELS[m.outcome],
        m.year,
        m.source && `источник: ${m.source}`,
        m.verifiedAt && `проверено: ${m.verifiedAt}`,
        m.demo && "ДЕМО-запись, не реальный человек",
      ]
        .filter(Boolean)
        .join(" · ");
      return `<source id="${numbers.get(h.doc.id)}" meta="${attrs}">\n${h.chunk.text}\n</source>`;
    })
    .join("\n\n");
}
