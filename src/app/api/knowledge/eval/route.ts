import { EVAL_SET } from "@/data/knowledge-seed";
import { forbidden, isAdmin } from "@/lib/rag/auth";
import { search } from "@/lib/rag/search";

// Тест качества поиска: для каждого вопроса проверяем, попал ли нужный документ в топ-5.
// hit rate — доля вопросов, где нашёлся нужный документ; MRR — насколько высоко он стоит.
export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const results = [];
  for (const { question, expected } of EVAL_SET) {
    const hits = await search(question, { limit: 5 });
    const pos = hits.findIndex((h) => h.doc.id === expected);
    results.push({ question, expected, found: pos >= 0, rank: pos >= 0 ? pos + 1 : null, top: hits.map((h) => h.doc.title) });
  }
  const hitRate = results.filter((r) => r.found).length / results.length;
  const mrr = results.reduce((s, r) => s + (r.rank ? 1 / r.rank : 0), 0) / results.length;
  return Response.json({ hitRate, mrr, results });
}
