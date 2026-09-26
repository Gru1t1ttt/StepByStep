"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Badge, Card, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import { toUsd } from "@/lib/currency";
import { DEGREES, FIELDS, FORMATS, LANGUAGES, STUDY_MODES, countryName, type Program } from "@/lib/world";

// Программы обучения: вставляешь ссылку на официальную страницу → ИИ заполняет форму →
// проверяешь, выбираешь вуз и публикуешь. Черновики на сайте не видны.

type Api = (url: string, init?: RequestInit) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Candidate = { id: string; name: string; country_code: string | null; city: string };
type Draft = Omit<Program, "id" | "checkedAt" | "universityName"> & { id?: string };

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

const empty: Draft = {
  universityId: "",
  name: "",
  degree: "bachelor",
  field: null,
  language: "English",
  durationMonths: null,
  format: "on_campus",
  studyMode: "full_time",
  tuitionAmount: null,
  tuitionCurrency: "USD",
  tuitionUsd: null,
  ieltsMin: null,
  toeflMin: null,
  satMin: null,
  requirements: "",
  deadline: null,
  deadlineNote: "",
  startMonth: "",
  scholarships: "",
  url: "",
  published: false,
};

function Field({ label, children, wide, missing }: { label: string; children: ReactNode; wide?: boolean; missing?: boolean }) {
  return (
    <label className={`grid gap-1 text-sm font-medium text-slate-700 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span>
        {label} {missing && <span className="text-xs font-normal text-amber-700">· нет на странице</span>}
      </span>
      {children}
    </label>
  );
}

const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

export default function ProgramsAdmin({ api }: { api: Api }) {
  const [items, setItems] = useState<Program[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [url, setUrl] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [notFound, setNotFound] = useState<string[]>([]);
  const [uniQuery, setUniQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setItems((await api("/api/programs")).items);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const extract = async (e: FormEvent) => {
    e.preventDefault();
    setBusy("extract");
    setError("");
    try {
      const data = await api("/api/programs/extract", { method: "POST", body: JSON.stringify({ url }) });
      setDraft({ ...empty, ...data.program, universityId: data.candidates[0]?.id ?? "" });
      setCandidates(data.candidates);
      setNotFound(data.notFound);
      setUniQuery(data.universityName ?? "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const searchUni = async () => {
    if (!uniQuery.trim()) return;
    const res = await fetch(`/api/universities?q=${encodeURIComponent(uniQuery.trim())}`);
    const data = await res.json();
    setCandidates((data.items ?? []).slice(0, 8).map((u: { id: string; name: string; countryCode: string; city: string }) => ({ id: u.id, name: u.name, country_code: u.countryCode, city: u.city })));
  };

  const save = async (published: boolean) => {
    if (!draft) return;
    if (!draft.universityId) return setError("Выбери вуз из списка.");
    setBusy("save");
    setError("");
    try {
      await api("/api/programs", { method: "POST", body: JSON.stringify({ ...draft, published }) });
      setDraft(null);
      setUrl("");
      setCandidates([]);
      setNotFound([]);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить программу?")) return;
    await api(`/api/programs/${id}`, { method: "DELETE" });
    await load();
  };

  const edit = (p: Program) => {
    setDraft({ ...p });
    setCandidates([{ id: p.universityId, name: p.universityName ?? p.universityId, country_code: null, city: "" }]);
    setNotFound([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const miss = (k: string) => notFound.includes(k);

  return (
    <div className="grid gap-5">
      <Card>
        <h2 className="font-display text-lg font-bold text-slate-950">Добавить программу</h2>
        <p className="mt-1 text-sm text-slate-600">
          Вставь ссылку на официальную страницу программы (не агрегатора). ИИ заполнит поля — проверь каждое по странице, выбери вуз и опубликуй.
        </p>
        <form onSubmit={extract} className="mt-4 flex flex-wrap gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.university.edu/…/computer-science-bsc" className={`${input} min-w-0 flex-1`} required />
          <button type="submit" disabled={!!busy} className={buttonClass}>
            <Sparkles className="mr-1.5 h-4 w-4" /> {busy === "extract" ? "Читаю страницу…" : "Заполнить с ИИ"}
          </button>
          <button type="button" onClick={() => (setDraft({ ...empty, url }), setCandidates([]), setNotFound([]))} className={ghostButtonClass}>
            Вручную
          </button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      </Card>

      {draft && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-950">{draft.id ? "Редактирование" : "Проверь и опубликуй"}</h2>
            {draft.url && (
              <a href={draft.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-700">
                Открыть страницу <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Вуз *</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidates.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set({ universityId: c.id })}
                  className={`rounded-lg border px-3 py-1.5 text-left text-sm ${draft.universityId === c.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                >
                  {c.name}
                  {c.country_code && <span className="opacity-70"> · {[c.city, countryName(c.country_code)].filter(Boolean).join(", ")}</span>}
                </button>
              ))}
              {!candidates.length && <span className="text-sm text-slate-500">Найди вуз по названию:</span>}
            </div>
            <div className="mt-2 flex max-w-md gap-2">
              <input value={uniQuery} onChange={(e) => setUniQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchUni())} placeholder="Название вуза" className={input} />
              <button type="button" onClick={searchUni} className={ghostButtonClass}>
                Найти
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Название программы *" wide missing={miss("name")}>
              <input value={draft.name} onChange={(e) => set({ name: e.target.value })} className={input} />
            </Field>
            <Field label="Степень">
              <select value={draft.degree} onChange={(e) => set({ degree: e.target.value })} className={input}>
                {Object.entries(DEGREES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Направление" missing={miss("field")}>
              <select value={draft.field ?? ""} onChange={(e) => set({ field: e.target.value || null })} className={input}>
                <option value="">—</option>
                {Object.entries(FIELDS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Язык обучения" missing={miss("language")}>
              <input list="langs" value={draft.language} onChange={(e) => set({ language: e.target.value })} className={input} />
              <datalist id="langs">
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </Field>
            <Field label="Длительность, мес." missing={miss("duration_months")}>
              <input value={draft.durationMonths ?? ""} onChange={(e) => set({ durationMonths: num(e.target.value) })} className={input} inputMode="numeric" />
            </Field>
            <Field label="Формат">
              <select value={draft.format} onChange={(e) => set({ format: e.target.value })} className={input}>
                {Object.entries(FORMATS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Занятость">
              <select value={draft.studyMode} onChange={(e) => set({ studyMode: e.target.value })} className={input}>
                {Object.entries(STUDY_MODES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Стоимость за год (для иностранцев)" missing={miss("tuition_amount")}>
              <div className="flex gap-2">
                <input
                  value={draft.tuitionAmount ?? ""}
                  onChange={(e) => {
                    const amount = num(e.target.value);
                    set({ tuitionAmount: amount, tuitionUsd: toUsd(amount, draft.tuitionCurrency) });
                  }}
                  className={input}
                  inputMode="numeric"
                />
                <input
                  value={draft.tuitionCurrency}
                  onChange={(e) => set({ tuitionCurrency: e.target.value.toUpperCase(), tuitionUsd: toUsd(draft.tuitionAmount, e.target.value) })}
                  className={`${input} w-20`}
                  maxLength={3}
                />
              </div>
              {draft.tuitionUsd != null && draft.tuitionCurrency !== "USD" && <span className="text-xs font-normal text-slate-500">≈ ${draft.tuitionUsd.toLocaleString("ru-RU")} для фильтра</span>}
            </Field>
            <Field label="IELTS мин." missing={miss("ielts_min")}>
              <input value={draft.ieltsMin ?? ""} onChange={(e) => set({ ieltsMin: num(e.target.value) })} className={input} inputMode="decimal" />
            </Field>
            <Field label="TOEFL мин." missing={miss("toefl_min")}>
              <input value={draft.toeflMin ?? ""} onChange={(e) => set({ toeflMin: num(e.target.value) })} className={input} inputMode="numeric" />
            </Field>
            <Field label="SAT мин." missing={miss("sat_min")}>
              <input value={draft.satMin ?? ""} onChange={(e) => set({ satMin: num(e.target.value) })} className={input} inputMode="numeric" />
            </Field>
            <Field label="Дедлайн" missing={miss("deadline")}>
              <input type="date" value={draft.deadline ?? ""} onChange={(e) => set({ deadline: e.target.value || null })} className={input} />
            </Field>
            <Field label="Начало обучения" missing={miss("start_month")}>
              <input value={draft.startMonth} onChange={(e) => set({ startMonth: e.target.value })} placeholder="сентябрь" className={input} />
            </Field>
            <Field label="Уточнение по дедлайнам" wide>
              <input value={draft.deadlineNote} onChange={(e) => set({ deadlineNote: e.target.value })} className={input} />
            </Field>
            <Field label="Требования" wide missing={miss("requirements")}>
              <textarea value={draft.requirements} onChange={(e) => set({ requirements: e.target.value })} rows={3} className={input} />
            </Field>
            <Field label="Стипендии и гранты" wide missing={miss("scholarships")}>
              <textarea value={draft.scholarships} onChange={(e) => set({ scholarships: e.target.value })} rows={2} className={input} />
            </Field>
            <Field label="Ссылка на официальную страницу *" wide>
              <input value={draft.url} onChange={(e) => set({ url: e.target.value })} className={input} />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={!!busy} onClick={() => save(true)} className={buttonClass}>
              {busy === "save" ? "Сохраняю…" : "Проверено — опубликовать"}
            </button>
            <button type="button" disabled={!!busy} onClick={() => save(false)} className={ghostButtonClass}>
              Сохранить черновик
            </button>
            <button type="button" onClick={() => setDraft(null)} className={ghostButtonClass}>
              Отмена
            </button>
          </div>
        </Card>
      )}

      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="font-semibold text-slate-900">Программы ({items.length})</h2>
          <span className="text-xs text-slate-500">опубликовано: {items.filter((i) => i.published).length}</span>
        </div>
        {items.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Пока пусто. Начни с вузов, куда чаще всего поступают казахстанцы.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{p.name}</p>
                  <p className="text-slate-500">
                    {p.universityName} · {DEGREES[p.degree] ?? p.degree} · {p.language}
                    {p.tuitionAmount != null && ` · ${p.tuitionAmount.toLocaleString("ru-RU")} ${p.tuitionCurrency}/год`} · проверено {p.checkedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={p.published ? "green" : "amber"}>{p.published ? "Опубликовано" : "Черновик"}</Badge>
                  <button type="button" onClick={() => edit(p)} className="text-blue-700 hover:underline">
                    Изменить
                  </button>
                  <button type="button" onClick={() => remove(p.id)} className="text-rose-600 hover:underline">
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
