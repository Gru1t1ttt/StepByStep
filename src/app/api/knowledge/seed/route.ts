import { SEED_DOCS } from "@/data/knowledge-seed";
import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { upsertDoc } from "@/lib/rag/store";

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  try {
    for (const doc of SEED_DOCS) await upsertDoc(doc);
    return Response.json({ added: SEED_DOCS.length });
  } catch (error) {
    return writeFailed(error);
  }
}
