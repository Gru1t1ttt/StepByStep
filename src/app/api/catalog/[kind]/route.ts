import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { listCatalog, upsertOpportunity, upsertUniversity, type AdminOpportunity, type AdminUniversity, type CatalogKind } from "@/lib/catalog-server";

const KINDS: CatalogKind[] = ["opportunities", "universities"];

// Админка: список всех записей (включая скрытые) и сохранение записи.
export async function GET(req: Request, ctx: RouteContext<"/api/catalog/[kind]">) {
  if (!isAdmin(req)) return forbidden();
  const { kind } = await ctx.params;
  if (!KINDS.includes(kind as CatalogKind)) return Response.json({ error: "Неизвестный раздел" }, { status: 404 });
  return Response.json({ items: await listCatalog(kind as CatalogKind) });
}

export async function POST(req: Request, ctx: RouteContext<"/api/catalog/[kind]">) {
  if (!isAdmin(req)) return forbidden();
  const { kind } = await ctx.params;
  const body = await req.json();
  try {
    if (kind === "opportunities") {
      const o = body as AdminOpportunity;
      if (!o.title?.trim() || !o.deadline) return Response.json({ error: "Нужны название и дедлайн" }, { status: 400 });
      return Response.json({ id: await upsertOpportunity(o) });
    }
    if (kind === "universities") {
      const u = body as AdminUniversity;
      if (!u.name?.trim() || !u.country?.trim() || !u.deadline) return Response.json({ error: "Нужны название, страна и дедлайн" }, { status: 400 });
      return Response.json({ id: await upsertUniversity(u) });
    }
    return Response.json({ error: "Неизвестный раздел" }, { status: 404 });
  } catch (error) {
    return writeFailed(error);
  }
}
