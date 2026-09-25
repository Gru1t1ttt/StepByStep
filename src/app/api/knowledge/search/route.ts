import { forbidden, isAdmin } from "@/lib/rag/auth";
import { search } from "@/lib/rag/search";
import type { KnowledgeKind } from "@/lib/rag/types";

// Проверка поиска из админки: что найдёт RAG по вопросу и с какими баллами.
export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const { query, kinds } = (await req.json()) as { query: string; kinds?: KnowledgeKind[] };
  const hits = await search(query, { kinds: kinds?.length ? kinds : undefined, limit: 8 });
  return Response.json({
    hits: hits.map((h) => ({
      docId: h.doc.id,
      title: h.doc.title,
      kind: h.doc.kind,
      demo: h.doc.meta.demo,
      text: h.chunk.text,
      score: h.score,
      vectorScore: h.vectorScore,
      keywordScore: h.keywordScore,
    })),
  });
}
