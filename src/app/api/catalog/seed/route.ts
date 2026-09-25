import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";
import { seedCatalog } from "@/lib/catalog-server";

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  try {
    return Response.json(await seedCatalog());
  } catch (error) {
    return writeFailed(error);
  }
}
