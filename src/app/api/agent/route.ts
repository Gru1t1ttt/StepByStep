import { upsertOpportunity } from "@/lib/catalog-server";
import { sql } from "@/lib/db";
import { LLMError } from "@/lib/llm";
import { NEEDS_TRANSLATION, checkSource, translateOpportunity, type CandidateData, type Source } from "@/lib/opportunity-agent";
import { safeUrl } from "@/lib/page-text";
import { forbidden, isAdmin, writeFailed } from "@/lib/rag/auth";

// Админка ИИ-агента возможностей: источники, очередь находок, переводы каталога.
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const db = sql();
  const [sources, candidates, [{ untranslated }]] = await Promise.all([
    db`select * from opportunity_sources order by created_at`,
    db`select id, source_url, data, created_at from opportunity_candidates where status = 'pending' order by created_at desc limit 100`,
    db`select count(*)::int as untranslated from opportunities where ${db.unsafe(NEEDS_TRANSLATION)}`,
  ]);
  return Response.json({ sources, candidates, untranslated });
}

type Body =
  | { op: "addSource"; url: string; name?: string }
  | { op: "toggleSource"; id: string; active: boolean }
  | { op: "deleteSource"; id: string }
  | { op: "checkSource"; id: string }
  | { op: "approve"; id: string; data: CandidateData }
  | { op: "reject"; id: string }
  | { op: "translate" };

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const body = (await req.json()) as Body;
  const db = sql();
  try {
    switch (body.op) {
      case "addSource": {
        let url: URL;
        try {
          url = safeUrl(body.url.trim());
        } catch {
          return Response.json({ error: "Нужна ссылка: сайт (https://…) или Telegram-канал (https://t.me/…)" }, { status: 400 });
        }
        const kind = /^(t\.me|telegram\.me)$/.test(url.hostname) ? "telegram" : "page";
        const name = body.name?.trim() || (kind === "telegram" ? `@${url.pathname.replace(/^\/(s\/)?/, "").split("/")[0]}` : url.hostname.replace(/^www\./, ""));
        await db`insert into opportunity_sources (name, url, kind) values (${name}, ${url.href}, ${kind}) on conflict (url) do update set active = true`;
        return Response.json({ ok: true });
      }
      case "toggleSource":
        await db`update opportunity_sources set active = ${body.active} where id = ${body.id}`;
        return Response.json({ ok: true });
      case "deleteSource":
        await db`delete from opportunity_sources where id = ${body.id}`;
        return Response.json({ ok: true });
      case "checkSource": {
        const [src] = (await db`select * from opportunity_sources where id = ${body.id}`) as unknown as Source[];
        if (!src) return Response.json({ error: "Источник не найден" }, { status: 404 });
        return Response.json(await checkSource(src, true));
      }
      case "approve": {
        const [c] = await db`select source_url from opportunity_candidates where id = ${body.id} and status = 'pending'`;
        if (!c) return Response.json({ error: "Находка уже обработана" }, { status: 409 });
        const id = await upsertOpportunity({ ...body.data, id: "", published: true });
        await db`update opportunities set source_url = ${c.source_url} where id = ${id}`;
        await db`update opportunity_candidates set status = 'approved', data = ${db.json(body.data)}, reviewed_at = now() where id = ${body.id}`;
        return Response.json({ ok: true, id });
      }
      case "reject":
        await db`update opportunity_candidates set status = 'rejected', reviewed_at = now() where id = ${body.id}`;
        return Response.json({ ok: true });
      case "translate": {
        // по 3 карточки за раз — чтобы уложиться в минутный лимит бесплатного Groq
        const rows = await db`select id, title, description from opportunities where ${db.unsafe(NEEDS_TRANSLATION)} limit 3`;
        for (const r of rows) {
          const i18n = await translateOpportunity(r.title, r.description);
          await db`update opportunities set i18n = ${db.json(i18n)} where id = ${r.id}`;
        }
        return Response.json({ translated: rows.length });
      }
    }
    return Response.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (error) {
    if (error instanceof LLMError) return Response.json({ error: error.message }, { status: 502 });
    return writeFailed(error);
  }
}
