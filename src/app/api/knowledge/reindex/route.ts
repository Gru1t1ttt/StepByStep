import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { reindexAll } from "@/lib/rag/store";

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  try {
    return Response.json(await reindexAll());
  } catch (error) {
    return writeFailed(error);
  }
}
