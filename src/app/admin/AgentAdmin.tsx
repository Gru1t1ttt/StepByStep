"use client";

import { Bot, ExternalLink, Languages, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge, Card, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import type { OpportunityType } from "@/data/opportunities";
import { formatDate } from "@/lib/analysis";
import type { CandidateData, Source } from "@/lib/opportunity-agent";

// ИИ-агент возможностей: список источников и очередь находок на проверку.
// Агент сам проверяет источники раз в день (Vercel Cron); здесь можно проверить вручную.

type Api = (url: string, init?: RequestInit) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Candidate = { id: string; source_url: string; data: CandidateData; created_at: string };

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const TYPES: OpportunityType[] = ["Олимпиада", "Хакатон", "Конкурс", "Летняя школа", "Исследование", "Эссе-конкурс", "Конференция"];

function CandidateCard({ c, api, onDone }: { c: Candidate; api: Api; onDone: () => void }) {
  const [d, setD] = useState(c.data);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<CandidateData>) => setD((x) => ({ ...x, ...patch }));
  const act = async (op: "approve" | "reject") => {
    setBusy(true);
    setError("");
    try {
      const data = { ...d }; // служебную пометку в карточку не сохраняем
      delete data.deadlineGuess;
      await api("/api/agent", { method: "POST", body: JSON.stringify({ op, id: c.id, data }) });
      onDone();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input value={d.title} onChange={(e) => set({ title: e.target.value })} className={`${input} font-medium sm:col-span-2 lg:col-span-4`} />
        <select value={d.type} onChange={(e) => set({ type: e.target.value as OpportunityType })} className={input}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input type="date" value={d.deadline} onChange={(e) => set({ deadline: e.target.value })} className={input} />
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <input type="number" min={7} max={12} value={d.minGrade} onChange={(e) => set({ minGrade: Number(e.target.value) })} className={`${input} w-16`} />–
          <input type="number" min={7} max={12} value={d.maxGrade} onChange={(e) => set({ maxGrade: Number(e.target.value) })} className={`${input} w-16`} /> кл.
        </div>
        <div className="flex items-center gap-3 text-sm">
          <select value={d.format} onChange={(e) => set({ format: e.target.value as CandidateData["format"] })} className={input}>
            <option>Онлайн</option>
            <option>Офлайн</option>
            <option>Гибрид</option>
          </select>
          <label className="flex shrink-0 items-center gap-1.5 text-slate-700">
            <input type="checkbox" checked={d.free} onChange={(e) => set({ free: e.target.checked })} /> бесплатно
          </label>
        </div>
        <textarea value={d.description} onChange={(e) => set({ description: e.target.value })} rows={2} className={`${input} sm:col-span-2 lg:col-span-4`} />
        <input value={d.url} onChange={(e) => set({ url: e.target.value })} className={`${input} sm:col-span-2 lg:col-span-4`} placeholder="Ссылка на официальную страницу" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        {d.interests.map((i) => (
          <Badge key={i}>{i}</Badge>
        ))}
        {d.i18n?.kz && <Badge tone="blue">KZ: {d.i18n.kz.title}</Badge>}
        {d.i18n?.en && <Badge tone="blue">EN: {d.i18n.en.title}</Badge>}
      </div>
      {d.deadlineGuess && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">Точного дедлайна в источнике нет — взята дата события. Проверь на официальном сайте.</p>
      )}
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
        <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-500 hover:text-blue-700">
          Источник <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <div className="flex gap-2">
          <button type="button" disabled={busy} onClick={() => act("reject")} className={ghostButtonClass}>
            Отклонить
          </button>
          <button type="button" disabled={busy} onClick={() => act("approve")} className={buttonClass}>
            Проверено — опубликовать
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function AgentAdmin({ api }: { api: Api }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [untranslated, setUntranslated] = useState(0);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api("/api/agent");
      setSources(data.sources);
      setCandidates(data.candidates);
      setUntranslated(data.untranslated);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const post = async (label: string, body: object) => {
    setBusy(label);
    setMessage("");
    try {
      const res = await api("/api/agent", { method: "POST", body: JSON.stringify(body) });
      await load();
      return res;
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (await post("add", { op: "addSource", url })) setUrl("");
  };

  const check = async (s: Source) => {
    const res = await post(s.id, { op: "checkSource", id: s.id });
    if (res)
      setMessage(
        res.error
          ? `${s.name}: ${res.error}`
          : `${s.name}: ИИ нашёл ${res.total ?? 0}, новых — ${res.found}, уже есть в каталоге — ${res.duplicates ?? 0}, без дедлайна или прошедших — ${res.invalid ?? 0}`,
      );
  };

  return (
    <div className="grid gap-5">
      <Card className="border-blue-200 bg-blue-50">
        <p className="flex items-center gap-2 font-semibold text-blue-950">
          <Bot className="h-5 w-5" /> Как работает агент
        </p>
        <p className="mt-1 text-sm text-blue-900/80">
          Каждый день в 9:00 по Астане агент проверяет 4 источника, которые дольше всего не проверялись. Если страница не изменилась, ИИ не вызывается. Новые
          конкурсы и олимпиады попадают сюда — проверь дату и ссылку и опубликуй. Переводы на казахский и английский ИИ делает сам.
        </p>
      </Card>

      {message && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{message}</p>}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-slate-950">На проверку ({candidates.length})</h2>
        {candidates.length ? (
          <div className="grid gap-3">
            {candidates.map((c) => (
              <CandidateCard key={c.id} c={c} api={api} onDone={load} />
            ))}
          </div>
        ) : (
          <Card className="text-sm text-slate-500">Новых находок нет. Добавь источники ниже и нажми «Проверить».</Card>
        )}
      </section>

      <Card padded={false}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-slate-950">Источники ({sources.length})</h2>
          <p className="mt-1 text-sm text-slate-500">
            Официальные сайты олимпиад и программ или открытые Telegram-каналы (ссылка вида https://t.me/название). Instagram и закрытые каналы агент читать не
            может.
          </p>
          <form onSubmit={add} className="mt-3 flex flex-wrap gap-2">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://t.me/channel или https://olympiad.example.kz" className={`${input} min-w-0 flex-1`} required />
            <button type="submit" disabled={!!busy} className={buttonClass}>
              <Plus className="mr-1 h-4 w-4" /> Добавить
            </button>
          </form>
        </div>
        {sources.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Источников пока нет.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    {s.name} <Badge tone={s.kind === "telegram" ? "blue" : "slate"}>{s.kind === "telegram" ? "Telegram" : "Сайт"}</Badge>
                  </p>
                  <p className="truncate text-slate-500">
                    {s.last_checked_at ? `проверен ${formatDate(s.last_checked_at)}` : "ещё не проверялся"} · найдено всего: {s.found_total}
                  </p>
                  {s.last_error && <p className="text-rose-600">{s.last_error}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-slate-600">
                    <input type="checkbox" checked={s.active} onChange={(e) => post(`t${s.id}`, { op: "toggleSource", id: s.id, active: e.target.checked })} /> активен
                  </label>
                  <button type="button" disabled={!!busy} onClick={() => check(s)} className={ghostButtonClass}>
                    <RefreshCw className={`mr-1.5 h-4 w-4 ${busy === s.id ? "animate-spin" : ""}`} /> {busy === s.id ? "Проверяю…" : "Проверить"}
                  </button>
                  <button
                    type="button"
                    aria-label="Удалить источник"
                    onClick={() => confirm(`Удалить источник ${s.name}?`) && post(`d${s.id}`, { op: "deleteSource", id: s.id })}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-slate-900">
            <Languages className="h-5 w-5" /> Переводы каталога
          </p>
          <p className="mt-1 text-sm text-slate-500">Опубликованных возможностей без перевода на казахский и английский: {untranslated}. ИИ переводит по 3 за раз.</p>
        </div>
        <button type="button" disabled={!!busy || !untranslated} onClick={() => post("translate", { op: "translate" })} className={ghostButtonClass}>
          {busy === "translate" ? "Перевожу…" : "Перевести 3"}
        </button>
      </Card>
    </div>
  );
}
