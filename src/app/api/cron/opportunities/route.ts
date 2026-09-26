import { runAgent } from "@/lib/opportunity-agent";
import { isAdmin } from "@/lib/rag/auth";

// Ежедневный запуск ИИ-агента возможностей (Vercel Cron, см. vercel.json).
// Vercel присылает заголовок Authorization: Bearer <CRON_SECRET>, если переменная CRON_SECRET задана.
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const fromCron = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!fromCron && !isAdmin(req)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  return Response.json({ results: await runAgent(4) });
}
