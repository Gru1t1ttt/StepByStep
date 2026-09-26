import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { deleteProgram } from "@/lib/world-server";

export async function DELETE(req: Request, ctx: RouteContext<"/api/programs/[id]">) {
  if (!isAdmin(req)) return forbidden();
  const { id } = await ctx.params;
  try {
    await deleteProgram(id);
    return Response.json({ ok: true });
  } catch (error) {
    return writeFailed(error);
  }
}
