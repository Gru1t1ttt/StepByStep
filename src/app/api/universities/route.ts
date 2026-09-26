import { parseFilters } from "@/lib/world";
import { searchUniversities } from "@/lib/world-server";

// Поиск по мировой базе университетов с фильтрами (параметры — как в адресе страницы /universities).
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const page = Math.max(0, Math.min(400, Number(params.get("page")) || 0));
  try {
    const data = await searchUniversities(parseFilters(params), page);
    return Response.json(data, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "База университетов недоступна" }, { status: 503 });
  }
}
