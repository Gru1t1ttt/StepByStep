import { worldMeta } from "@/lib/world-server";

// Справочные данные для фильтров: страны с числом вузов, общее число вузов и программ.
export async function GET() {
  try {
    return Response.json(await worldMeta(), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "База университетов недоступна" }, { status: 503 });
  }
}
