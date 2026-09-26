"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Logo from "@/components/site/Logo";
import CatalogAdmin from "./CatalogAdmin";
import AgentAdmin from "./AgentAdmin";
import ProgramsAdmin from "./ProgramsAdmin";
import { Badge, Card, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import { KIND_LABELS, OUTCOME_LABELS, type KnowledgeDoc, type KnowledgeKind, type Outcome } from "@/lib/rag/types";

type Doc = KnowledgeDoc & { chunkCount: number };
type Stats = {
  storage: "supabase" | "file" | "readonly";
  embeddingModel: string;
  needsReindex: boolean;
  docs: number;
  chunks: number;
  pending: number;
  approved: Record<KnowledgeKind, number>;
};

const TABS = ["ИИ-агент", "Возможности", "Вузы", "Программы", "Обзор", "Добавить", "Модерация", "Все документы", "Проверка поиска", "Тест качества"] as const;
type Tab = (typeof TABS)[number];

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const TOKEN_KEY = "sbs-admin-token";

function useApi() {
  const [token, setToken] = useState("");
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(sessionStorage.getItem(TOKEN_KEY) ?? "");
    } catch {}
  }, []);
  const api = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", "x-admin-token": token, ...(init.headers ?? {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Ошибка ${res.status}`);
      return data;
    },
    [token],
  );
  const saveToken = (t: string) => {
    setToken(t);
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch {}
  };
  return { api, token, saveToken };
}

export default function AdminPage() {
  const { api, token, saveToken } = useApi();
  const [tab, setTab] = useState<Tab>("Возможности");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/knowledge");
      setDocs(data.docs);
      setStats(data.stats);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy("");
  };

  const pending = docs.filter((d) => d.status === "pending");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo className="h-10 w-auto" />
          <div>
            <h1 className="font-display text-xl font-bold text-slate-950">Админка Unilight</h1>
            <p className="text-sm text-slate-500">Возможности и вузы для учеников · база знаний ИИ-наставника</p>
          </div>
        </div>
        <input
          type="password"
          defaultValue={token}
          onBlur={(e) => saveToken(e.target.value)}
          placeholder="Админ-токен (если задан)"
          className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
      </header>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm ${tab === t ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
          >
            {t}
            {t === "Модерация" && pending.length > 0 && <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 text-xs text-white">{pending.length}</span>}
          </button>
        ))}
      </nav>

      {error && <Card className="mb-4 border-rose-200 bg-rose-50 text-sm text-rose-800">{error}</Card>}

      {tab === "Возможности" && <CatalogAdmin kind="opportunities" api={api} />}
      {tab === "Вузы" && <CatalogAdmin kind="universities" api={api} />}
      {tab === "Программы" && <ProgramsAdmin api={api} />}
      {tab === "ИИ-агент" && <AgentAdmin api={api} />}
      {tab === "Обзор" && <Overview stats={stats} busy={busy} run={run} api={api} />}
      {tab === "Добавить" && <AddDoc api={api} onAdded={refresh} />}
      {tab === "Модерация" && <DocList docs={pending} api={api} onChange={refresh} empty="Новых отзывов на модерации нет." />}
      {tab === "Все документы" && <DocList docs={docs} api={api} onChange={refresh} empty="База пуста — загрузите стартовые данные во вкладке «Обзор»." filterable />}
      {tab === "Проверка поиска" && <SearchTest api={api} />}
      {tab === "Тест качества" && <EvalTest api={api} />}
    </div>
  );
}

type Api = ReturnType<typeof useApi>["api"];

function Overview({ stats, busy, run, api }: { stats: Stats | null; busy: string; run: (l: string, fn: () => Promise<unknown>) => void; api: Api }) {
  if (!stats) return <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />;
  const tiles = [
    ["Опыт поступивших", stats.approved.experience],
    ["Гайды", stats.approved.guide],
    ["Факты", stats.approved.fact],
    ["На модерации", stats.pending],
    ["Кусков (чанков)", stats.chunks],
  ] as const;
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>
      <p className="text-sm text-slate-600">
        Хранилище:{" "}
        <b>{stats.storage === "supabase" ? "Supabase (Postgres)" : stats.storage === "file" ? "локальный файл .data/knowledge.json" : "только чтение (встроенные гайды)"}</b> · Эмбеддинги:{" "}
        <b>{stats.embeddingModel}</b>
      </p>
      <Card>
        <h2 className="font-semibold text-slate-900">Как это работает</h2>
        <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm text-slate-600">
          <li>Документ (отзыв, гайд, факт) режется на куски по 1–2 абзаца.</li>
          <li>Каждый кусок превращается в эмбеддинг — числовой «отпечаток смысла» (где доступна модель; иначе ищем по ключевым словам).</li>
          <li>На вопрос ученика ищутся ближайшие куски: по смыслу и по ключевым словам. Опыт поступивших ищется с учётом профиля ученика.</li>
          <li>Найденное передаётся ИИ-наставнику, и он отвечает со ссылками на источники [1], [2]…</li>
          <li>Отзывы из анкеты выпускников (/share) попадают в «Модерацию» и используются только после одобрения.</li>
        </ol>
      </Card>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!!busy} onClick={() => run("seed", () => api("/api/knowledge/seed", { method: "POST" }))} className={buttonClass}>
          {busy === "seed" ? "Загружаю… (первый раз скачивается модель, до пары минут)" : "Загрузить стартовые гайды и демо-истории"}
        </button>
        <button type="button" disabled={!!busy} onClick={() => run("reindex", () => api("/api/knowledge/reindex", { method: "POST" }))} className={ghostButtonClass}>
          {busy === "reindex" ? "Переиндексирую…" : "Переиндексировать всё"}
        </button>
      </div>
      {stats.needsReindex && <p className="text-sm text-amber-700">Модель эмбеддингов изменилась — нажмите «Переиндексировать всё».</p>}
    </div>
  );
}

const emptyForm = {
  kind: "experience" as KnowledgeKind,
  title: "",
  text: "",
  university: "",
  country: "",
  year: "",
  outcome: "" as Outcome,
  major: "",
  school: "",
  profile: "",
  source: "",
  sourceUrl: "",
  verifiedAt: "",
};

function AddDoc({ api, onAdded }: { api: Api; onAdded: () => void }) {
  const [f, setF] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const set = (k: keyof typeof emptyForm) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("Сохраняю и индексирую…");
    try {
      const year = parseInt(f.year, 10);
      await api("/api/knowledge", {
        method: "POST",
        body: JSON.stringify({
          kind: f.kind,
          title: f.title,
          text: f.text,
          meta: {
            source: f.source || "Команда Unilight",
            sourceUrl: f.sourceUrl || undefined,
            university: f.university || undefined,
            country: f.country || undefined,
            year: Number.isNaN(year) ? undefined : year,
            outcome: f.outcome || undefined,
            major: f.major || undefined,
            school: f.school || undefined,
            profile: f.profile || undefined,
            verifiedAt: f.verifiedAt || undefined,
          },
        }),
      });
      setF({ ...emptyForm, kind: f.kind });
      setStatus("✓ Добавлено — ИИ уже может это использовать");
      onAdded();
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const loadFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setF((prev) => ({ ...prev, text, title: prev.title || file.name.replace(/\.\w+$/, "") }));
  };

  return (
    <Card>
      <form onSubmit={submit} className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(KIND_LABELS) as KnowledgeKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setF({ ...f, kind: k })}
              className={`rounded-full border px-3 py-1.5 text-sm ${f.kind === k ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-700"}`}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
        <input value={f.title} onChange={set("title")} placeholder="Заголовок *" className={input} required />

        {f.kind === "experience" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={f.university} onChange={set("university")} placeholder="Университет" className={input} />
            <input value={f.country} onChange={set("country")} placeholder="Страна" className={input} />
            <input value={f.year} onChange={set("year")} placeholder="Год поступления" inputMode="numeric" className={input} />
            <select value={f.outcome} onChange={set("outcome")} className={input}>
              <option value="">Результат…</option>
              {Object.entries(OUTCOME_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <input value={f.major} onChange={set("major")} placeholder="Направление" className={input} />
            <input value={f.school} onChange={set("school")} placeholder="Школа (НИШ, РФМШ…)" className={input} />
            <input value={f.profile} onChange={set("profile")} placeholder="Профиль: GPA, экзамены, главные активности" className={`${input} sm:col-span-3`} />
          </div>
        )}
        {f.kind === "fact" && (
          <input value={f.verifiedAt} onChange={set("verifiedAt")} type="date" className={`${input} w-fit`} title="Когда проверено" />
        )}

        <textarea value={f.text} onChange={set("text")} placeholder="Текст * — абзацы разделяйте пустой строкой" rows={12} className={input} required />
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={f.source} onChange={set("source")} placeholder="Источник (Интервью, Анкета, название сайта)" className={input} />
          <input value={f.sourceUrl} onChange={set("sourceUrl")} placeholder="Ссылка на источник" className={input} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={buttonClass}>
            Добавить в базу
          </button>
          <label className={`${ghostButtonClass} cursor-pointer`}>
            Загрузить из .txt / .md
            <input type="file" accept=".txt,.md" className="hidden" onChange={(e) => loadFile(e.target.files?.[0])} />
          </label>
          {status && <span className="text-sm text-slate-600">{status}</span>}
        </div>
      </form>
    </Card>
  );
}

function DocList({ docs, api, onChange, empty, filterable }: { docs: Doc[]; api: Api; onChange: () => void; empty: string; filterable?: boolean }) {
  const [kind, setKind] = useState<KnowledgeKind | "">("");
  const [open, setOpen] = useState<string | null>(null);
  const list = docs.filter((d) => !kind || d.kind === kind);

  const act = async (id: string, init: RequestInit) => {
    await api(`/api/knowledge/${encodeURIComponent(id)}`, init);
    onChange();
  };

  return (
    <div className="grid gap-3">
      {filterable && (
        <div className="flex gap-2">
          {(["", "experience", "guide", "fact"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-full border px-3 py-1 text-sm ${kind === k ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-600"}`}>
              {k ? KIND_LABELS[k] : "Все"}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 && <Card className="text-center text-slate-500">{empty}</Card>}
      {list.map((d) => (
        <Card key={d.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">{KIND_LABELS[d.kind]}</Badge>
                <Badge tone={d.status === "approved" ? "green" : d.status === "pending" ? "amber" : "rose"}>
                  {d.status === "approved" ? "Используется ИИ" : d.status === "pending" ? "На модерации" : "Отклонён"}
                </Badge>
                {d.meta.demo && <Badge tone="amber">Демо</Badge>}
                <span className="text-xs text-slate-400">{d.chunkCount} кусков</span>
              </div>
              <button type="button" onClick={() => setOpen(open === d.id ? null : d.id)} className="mt-2 text-left font-medium text-slate-900 hover:text-blue-700">
                {d.title}
              </button>
              <p className="text-xs text-slate-500">
                {[d.meta.university, d.meta.outcome && OUTCOME_LABELS[d.meta.outcome], d.meta.year, d.meta.profile, d.meta.source, d.meta.contact && `контакт: ${d.meta.contact}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2 text-sm">
              {d.status !== "approved" && (
                <button type="button" onClick={() => act(d.id, { method: "PATCH", body: JSON.stringify({ status: "approved" }) })} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white">
                  Одобрить
                </button>
              )}
              {d.status !== "rejected" && (
                <button type="button" onClick={() => act(d.id, { method: "PATCH", body: JSON.stringify({ status: "rejected" }) })} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700">
                  Отклонить
                </button>
              )}
              <button
                type="button"
                onClick={() => confirm(`Удалить «${d.title}» из базы?`) && act(d.id, { method: "DELETE" })}
                className="rounded-lg px-3 py-1.5 text-rose-600 hover:bg-rose-50"
              >
                Удалить
              </button>
            </div>
          </div>
          {open === d.id && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{d.text}</p>}
        </Card>
      ))}
    </div>
  );
}

type Hit = { docId: string; title: string; kind: KnowledgeKind; demo?: boolean; text: string; score: number; vectorScore: number; keywordScore: number };

function SearchTest({ api }: { api: Api }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setHits((await api("/api/knowledge/search", { method: "POST", body: JSON.stringify({ query }) })).hits);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <form onSubmit={submit} className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Вопрос ученика, например: хватит ли стартапа для Гарварда?" className={input} />
        <button type="submit" disabled={busy || !query.trim()} className={buttonClass}>
          {busy ? "Ищу…" : "Найти"}
        </button>
      </form>
      <p className="text-sm text-slate-500">Показывает, какие куски базы получит ИИ на этот вопрос. «Смысл» — близость по эмбеддингам, «слова» — совпадение ключевых слов.</p>
      {hits?.length === 0 && <Card className="text-center text-slate-500">Ничего релевантного не найдено — ИИ ответит из общих знаний.</Card>}
      {hits?.map((h, i) => (
        <Card key={`${h.docId}-${i}`}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-slate-400">#{i + 1}</span>
            <Badge tone="blue">{KIND_LABELS[h.kind]}</Badge>
            {h.demo && <Badge tone="amber">Демо</Badge>}
            <span className="font-medium text-slate-900">{h.title}</span>
            <span className="ml-auto font-mono text-xs text-slate-500">
              смысл {h.vectorScore.toFixed(3)} · слова {h.keywordScore.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{h.text}</p>
        </Card>
      ))}
    </div>
  );
}

type EvalResult = { hitRate: number; mrr: number; results: { question: string; expected: string; found: boolean; rank: number | null; top: string[] }[] };

function EvalTest({ api }: { api: Api }) {
  const [result, setResult] = useState<EvalResult | null>(null);
  const [busy, setBusy] = useState(false);
  const runEval = async () => {
    setBusy(true);
    try {
      setResult(await api("/api/knowledge/eval", { method: "POST" }));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-4">
      <Card>
        <p className="text-sm text-slate-600">
          Набор контрольных вопросов (src/data/knowledge-seed.ts → EVAL_SET): для каждого известно, какой документ должен найтись. Пополняйте его реальными вопросами учеников
          и прогоняйте после каждого изменения базы или настроек поиска.
        </p>
        <button type="button" onClick={runEval} disabled={busy} className={`${buttonClass} mt-4`}>
          {busy ? "Прогоняю…" : "Запустить тест"}
        </button>
      </Card>
      {result && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-sm text-slate-500">Нашёл нужный документ в топ-5</p>
              <p className={`font-display text-3xl font-bold ${result.hitRate >= 0.9 ? "text-emerald-600" : "text-amber-600"}`}>{Math.round(result.hitRate * 100)}%</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-500">MRR (1.0 = всегда на первом месте)</p>
              <p className="font-display text-3xl font-bold text-slate-950">{result.mrr.toFixed(2)}</p>
            </Card>
          </div>
          {result.results.map((r) => (
            <Card key={r.question} className={r.found ? "" : "border-rose-200 bg-rose-50"}>
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="font-medium text-slate-900">{r.question}</span>
                <span className={r.found ? "text-emerald-600" : "font-semibold text-rose-600"}>{r.found ? `✓ место ${r.rank}` : "✗ не найден"}</span>
              </div>
              {!r.found && <p className="mt-1 text-xs text-slate-500">Ожидался: {r.expected}. Нашлось: {r.top.join(" | ") || "ничего"}</p>}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
