import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { deleteCatalogItem, type CatalogKind } from "@/lib/catalog-server";

export async function DELETE(req: Request, ctx: RouteContext<"/api/catalog/[kind]/[id]">) {
  if (!isAdmin(req)) return forbidden();
  const { kind, id } = await ctx.params;
  if (kind !== "opportunities" && kind !== "universities") return Response.json({ error: "Неизвестный раздел" }, { status: 404 });
  try {
    return Response.json({ deleted: await deleteCatalogItem(kind as CatalogKind, decodeURIComponent(id)) });
  } catch (error) {
    return writeFailed(error);
  }
}
