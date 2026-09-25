import { cosine, embedQuery, embeddingsEnabled } from "./embeddings";
import { getSearchable } from "./store";
import type { Chunk, KnowledgeDoc, KnowledgeKind, SearchHit } from "./types";

// Гибридный поиск: по смыслу (векторы) + по ключевым словам (BM25).
// Векторы хорошо ловят перефразировки («топовые американские вузы» ≈ «Лига плюща»),
// ключевые слова — точные названия и цифры («SAT 1450», «KAIST», «Stipendium Hungaricum»).
// Результаты сливаются через Reciprocal Rank Fusion.

const RRF_K = 60;
// Ниже этого порога чанк считается нерелевантным, если в нём нет и совпадений по словам.
// Подбирается по тесту качества (/admin → «Тест поиска»).
export const MIN_VECTOR_SCORE = 0.8;
// Если по смыслу чанк ниже порога, пропускаем его только при сильном совпадении слов (точные названия, цифры).
const MIN_KEYWORD_FALLBACK = 1.5;
// Порог для чанков без векторной оценки (на Vercel или добавленных там, где нет модели).
const MIN_KEYWORD_ONLY = 1.0;

// Служебные слова не должны влиять на поиск по ключевым словам.
const STOPWORDS = new Set(
  "меня мне мой моя мое мои тебя тебе твой твоя это этот эта эти что как для или если есть был была были быть хочу хочет можно нужно надо какие какой какая каких где когда чтобы только тоже еще ещё уже очень там тут вот так все всё они она оно его её ему них the and for with you your are was have has what how can".split(" "),
);

// Грубый стемминг: у русских слов много окончаний, поэтому сравниваем первые 6 букв
// («поступил», «поступление», «поступить» → «поступ»).
function tokenize(text: string) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => w.length > 2 && !STOPWORDS.has(w)).map((w) => (w.length > 6 ? w.slice(0, 6) : w));
}

function bm25(query: string, chunks: Chunk[]) {
  const terms = [...new Set(tokenize(query))];
  const docs = chunks.map((c) => tokenize(c.text));
  const avgLen = docs.reduce((s, d) => s + d.length, 0) / Math.max(1, docs.length);
  const df = new Map(terms.map((t) => [t, docs.filter((d) => d.includes(t)).length]));
  const k1 = 1.2;
  const b = 0.75;
  return docs.map((d) => {
    let score = 0;
    for (const t of terms) {
      const tf = d.filter((w) => w === t).length;
      if (!tf) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      score += (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.length) / avgLen));
    }
    return score;
  });
}

export type SearchOptions = {
  kinds?: KnowledgeKind[];
  limit?: number;
  perDoc?: number; // сколько кусков одного документа максимум, чтобы один длинный текст не забил всю выдачу
  filter?: (doc: KnowledgeDoc) => boolean;
};

export async function search(query: string, { kinds, limit = 6, perDoc = 2, filter }: SearchOptions = {}): Promise<SearchHit[]> {
  const { docs, chunks: all } = await getSearchable();
  const chunks = all.filter((c) => {
    const doc = docs.get(c.docId)!;
    return (!kinds || kinds.includes(doc.kind)) && (!filter || filter(doc));
  });
  if (!chunks.length || !query.trim()) return [];

  // Векторная близость — только для чанков с эмбеддингом и только там, где есть модель
  // (на Vercel её нет — там ищем по ключевым словам). Чанки без эмбеддинга участвуют только в BM25.
  const useVectors = embeddingsEnabled() && chunks.some((c) => c.embedding.length > 0);
  const q = useVectors ? await embedQuery(query) : [];
  const vector = chunks.map((c) => (useVectors && c.embedding.length ? cosine(q, c.embedding) : 0));
  const keyword = bm25(query, chunks);

  const rank = (scores: number[]) => {
    const order = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
    const r = new Array<number>(scores.length);
    order.forEach(([, i], pos) => (r[i] = pos));
    return r;
  };
  const vr = rank(vector);
  const kr = rank(keyword);

  const hits = chunks
    .map((chunk, i) => ({
      chunk,
      doc: docs.get(chunk.docId)!,
      vectorScore: vector[i],
      keywordScore: keyword[i],
      score: (vector[i] > 0 ? 1 / (RRF_K + vr[i]) : 0) + (keyword[i] > 0 ? 1 / (RRF_K + kr[i]) : 0),
    }))
    .filter((h) =>
      h.vectorScore > 0 ? h.vectorScore >= MIN_VECTOR_SCORE || h.keywordScore >= MIN_KEYWORD_FALLBACK : h.keywordScore >= MIN_KEYWORD_ONLY,
    )
    .sort((a, b) => b.score - a.score);

  const perDocCount = new Map<string, number>();
  const result: SearchHit[] = [];
  for (const h of hits) {
    const n = perDocCount.get(h.doc.id) ?? 0;
    if (n >= perDoc) continue;
    perDocCount.set(h.doc.id, n + 1);
    result.push(h);
    if (result.length >= limit) break;
  }
  return result;
}
