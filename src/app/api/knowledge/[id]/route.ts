import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { deleteDoc, setStatus, upsertDoc, type DocInput } from "@/lib/rag/store";
import type { DocStatus } from "@/lib/rag/types";

// PATCH { status } — модерация; PATCH с полями документа — редактирование (с переиндексацией).
export async function PATCH(req: Request, ctx: RouteContext<"/api/knowledge/[id]">) {
  if (!isAdmin(req)) return forbidden();
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<DocInput> & { status?: DocStatus };
  let doc;
  try {
    doc =
      body.text !== undefined && body.title !== undefined && body.kind
        ? await upsertDoc({ ...(body as DocInput), id })
        : body.status
          ? await setStatus(id, body.status)
          : null;
  } catch (error) {
    return writeFailed(error);
  }
  if (!doc) return Response.json({ error: "Документ не найден" }, { status: 404 });
  return Response.json({ doc });
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/knowledge/[id]">) {
  if (!isAdmin(req)) return forbidden();
  const { id } = await ctx.params;
  try {
    return Response.json({ deleted: await deleteDoc(id) });
  } catch (error) {
    return writeFailed(error);
  }
}
