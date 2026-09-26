import { universityDetail } from "@/lib/world-server";

// Карточка вуза: все данные и опубликованные программы.
export async function GET(_req: Request, ctx: RouteContext<"/api/universities/[id]">) {
  const { id } = await ctx.params;
  try {
    const u = await universityDetail(id);
    if (!u) return Response.json({ error: "Вуз не найден" }, { status: 404 });
    return Response.json(u, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "База университетов недоступна" }, { status: 503 });
  }
}
