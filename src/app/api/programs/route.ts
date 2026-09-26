import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { listPrograms, saveProgram, type ProgramInput } from "@/lib/world-server";

// Админка: все программы (включая черновики) и сохранение программы.
export async function GET(req: Request) {
  if (!isAdmin(req)) return forbidden();
  return Response.json({ items: await listPrograms() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const p = (await req.json()) as ProgramInput;
  if (!p.universityId || !p.name?.trim() || !p.url?.trim()) return Response.json({ error: "Нужны вуз, название программы и ссылка на источник" }, { status: 400 });
  try {
    return Response.json({ id: await saveProgram(p) });
  } catch (error) {
    return writeFailed(error);
  }
}
