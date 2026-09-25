import { KIND_LABELS, OUTCOME_LABELS, type KnowledgeDoc } from "./types";

const MAX_CHARS = 900;
const OVERLAP_CHARS = 150;

// Шапка с метаданными добавляется в каждый чанк: тогда запрос «отказ из Йеля с SAT 1450»
// находит нужный отзыв, даже если в самом абзаце нет ни вуза, ни баллов.
export function chunkHeader(doc: KnowledgeDoc) {
  const m = doc.meta;
  const parts = [`${KIND_LABELS[doc.kind]}: ${doc.title}`];
  if (m.university) parts.push(`Вуз: ${m.university}${m.country ? ` (${m.country})` : ""}`);
  if (m.outcome) parts.push(`Результат: ${OUTCOME_LABELS[m.outcome]}`);
  if (m.year) parts.push(`Год: ${m.year}`);
  if (m.major) parts.push(`Направление: ${m.major}`);
  if (m.school) parts.push(`Школа: ${m.school}`);
  if (m.profile) parts.push(`Профиль: ${m.profile}`);
  return parts.join(". ");
}

// Режем по абзацам, длинные абзацы — по предложениям. Соседние чанки слегка
// перекрываются, чтобы мысль на границе не терялась.
export function splitText(text: string): string[] {
  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const pieces: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= MAX_CHARS) {
      pieces.push(p);
      continue;
    }
    let current = "";
    for (const sentence of p.split(/(?<=[.!?…])\s+/)) {
      if (current && current.length + sentence.length > MAX_CHARS) {
        pieces.push(current);
        current = "";
      }
      current = current ? `${current} ${sentence}` : sentence;
    }
    if (current) pieces.push(current);
  }

  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length > MAX_CHARS) {
      chunks.push(current);
      const tail = current.slice(-OVERLAP_CHARS);
      current = `…${tail.slice(tail.indexOf(" ") + 1)}\n\n${piece}`;
    } else {
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function chunkDoc(doc: KnowledgeDoc) {
  const header = chunkHeader(doc);
  return splitText(doc.text).map((body) => `${header}\n\n${body}`);
}
