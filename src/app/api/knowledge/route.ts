import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { listDocs, stats, upsertDoc, type DocInput } from "@/lib/rag/store";

export async function GET(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const [docs, s] = await Promise.all([listDocs(), stats()]);
  return Response.json({ docs: docs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), stats: s });
}

// Документы, добавленные командой, сразу одобрены; отзывы выпускников идут через /api/experience.
export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const body = (await req.json()) as DocInput;
  if (!body.title?.trim() || !body.text?.trim() || !body.kind) {
    return Response.json({ error: "Нужны тип, заголовок и текст" }, { status: 400 });
  }
  try {
    const doc = await upsertDoc({ ...body, status: body.status ?? "approved" });
    return Response.json({ doc });
  } catch (error) {
    return writeFailed(error);
  }
}
