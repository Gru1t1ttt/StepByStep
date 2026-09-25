"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Chips } from "@/components/onboarding/fields";
import { Badge, Card, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import type { OpportunityType } from "@/data/opportunities";
import { daysUntil, formatDate } from "@/lib/analysis";
import type { AdminOpportunity, AdminUniversity } from "@/lib/catalog-map";
import { COUNTRIES, INTERESTS, MAJORS } from "@/lib/profile";

type Api = (url: string, init?: RequestInit) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const OPP_TYPES: OpportunityType[] = ["Олимпиада", "Хакатон", "Конкурс", "Летняя школа", "Исследование", "Эссе-конкурс", "Конференция"];
const GRANTS: AdminUniversity["grants"][] = ["Полный грант", "Частичный грант", "Нет грантов"];

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`grid gap-1 text-sm font-medium text-slate-700 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      {label}
      {children}
    </label>
  );
}

const emptyOpp: AdminOpportunity = {
  id: "",
  title: "",
  type: "Олимпиада",
  interests: [],
  minGrade: 8,
  maxGrade: 11,
  format: "Онлайн",
  location: "",
  free: true,
  deadline: "",
  prepWeeks: 4,
  url: "",
  description: "",
  published: true,
};

const emptyUni: AdminUniversity = {
  id: "",
  name: "",
  country: "",
  city: "",
  qsRank: 0,
  majors: [],
  tuitionUsd: 0,
  grants: "Частичный грант",
  ielts: 6.5,
  sat: null,
  gpa: 4.5,
  olympiads: 0,
  activities: 2,
  research: false,
  deadline: "",
  url: "",
  published: true,
};

function OpportunityForm({ value, onChange }: { value: AdminOpportunity; onChange: (v: AdminOpportunity) => void }) {
  const set = <K extends keyof AdminOpportunity>(k: K, v: AdminOpportunity[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Название *" wide>
        <input value={value.title} onChange={(e) => set("title", e.target.value)} className={input} required />
      </Field>
      <Field label="Тип">
        <select value={value.type} onChange={(e) => set("type", e.target.value as OpportunityType)} className={input}>
          {OPP_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Дедлайн подачи *">
        <input type="date" value={value.deadline} onChange={(e) => set("deadline", e.target.value)} className={input} required />
      </Field>
      <Field label="Начать готовиться за (недель)">
        <input type="number" min={0} value={value.prepWeeks} onChange={(e) => set("prepWeeks", Number(e.target.value))} className={input} />
      </Field>
      <Field label="Классы: с">
        <input type="number" min={1} max={12} value={value.minGrade} onChange={(e) => set("minGrade", Number(e.target.value))} className={input} />
      </Field>
      <Field label="Классы: по">
        <input type="number" min={1} max={12} value={value.maxGrade} onChange={(e) => set("maxGrade", Number(e.target.value))} className={input} />
      </Field>
      <Field label="Формат">
        <select value={value.format} onChange={(e) => set("format", e.target.value as AdminOpportunity["format"])} className={input}>
          <option>Онлайн</option>
          <option>Офлайн</option>
          <option>Гибрид</option>
        </select>
      </Field>
      <Field label="Где проходит">
        <input value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="Онлайн / Астана / США" className={input} />
      </Field>
      <Field label="Ссылка на официальный сайт">
        <input value={value.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" className={input} />
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
        <input type="checkbox" checked={value.free} onChange={(e) => set("free", e.target.checked)} /> Бесплатно
      </label>
      <Field label="Описание (2–3 предложения: что это и чем полезно для поступления)" wide>
        <textarea value={value.description} onChange={(e) => set("description", e.target.value)} rows={3} className={input} />
      </Field>
      <div className="grid gap-1 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
        Направления (по ним идёт подбор ученикам)
        <Chips options={INTERESTS} value={value.interests} onChange={(v) => set("interests", v)} allowCustom={false} />
      </div>
    </div>
  );
}

function UniversityForm({ value, onChange }: { value: AdminUniversity; onChange: (v: AdminUniversity) => void }) {
  const set = <K extends keyof AdminUniversity>(k: K, v: AdminUniversity[K]) => onChange({ ...value, [k]: v });
  const num = (v: string) => (v === "" ? 0 : Number(v));
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Название *" wide>
        <input value={value.name} onChange={(e) => set("name", e.target.value)} className={input} required />
      </Field>
      <Field label="Страна *">
        <input value={value.country} onChange={(e) => set("country", e.target.value)} list="countries" className={input} required />
        <datalist id="countries">
          {COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <Field label="Город">
        <input value={value.city} onChange={(e) => set("city", e.target.value)} className={input} />
      </Field>
      <Field label="Дедлайн подачи *">
        <input type="date" value={value.deadline} onChange={(e) => set("deadline", e.target.value)} className={input} required />
      </Field>
      <Field label="Место в QS (0 — нет в рейтинге)">
        <input type="number" min={0} value={value.qsRank} onChange={(e) => set("qsRank", num(e.target.value))} className={input} />
      </Field>
      <Field label="Стоимость, $ в год (0 — бесплатно)">
        <input type="number" min={0} value={value.tuitionUsd} onChange={(e) => set("tuitionUsd", num(e.target.value))} className={input} />
      </Field>
      <Field label="Гранты">
        <select value={value.grants} onChange={(e) => set("grants", e.target.value as AdminUniversity["grants"])} className={input}>
          {GRANTS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </Field>
      <Field label="IELTS минимум">
        <input type="number" step={0.5} min={0} max={9} value={value.ielts} onChange={(e) => set("ielts", num(e.target.value))} className={input} />
      </Field>
      <Field label="SAT минимум (пусто — не нужен)">
        <input type="number" min={400} max={1600} value={value.sat ?? ""} onChange={(e) => set("sat", e.target.value ? Number(e.target.value) : null)} className={input} />
      </Field>
      <Field label="Средний балл, из 5">
        <input type="number" step={0.1} min={0} max={5} value={value.gpa} onChange={(e) => set("gpa", num(e.target.value))} className={input} />
      </Field>
      <Field label="Желательно олимпиад/конкурсов">
        <input type="number" min={0} value={value.olympiads} onChange={(e) => set("olympiads", num(e.target.value))} className={input} />
      </Field>
      <Field label="Желательно активностей">
        <input type="number" min={0} value={value.activities} onChange={(e) => set("activities", num(e.target.value))} className={input} />
      </Field>
      <Field label="Ссылка на страницу приёма">
        <input value={value.url ?? ""} onChange={(e) => set("url", e.target.value)} placeholder="https://…" className={input} />
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
        <input type="checkbox" checked={value.research} onChange={(e) => set("research", e.target.checked)} /> Ценится исследование
      </label>
      <div className="grid gap-1 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
        Направления
        <Chips options={MAJORS} value={value.majors} onChange={(v) => set("majors", v)} />
      </div>
    </div>
  );
}

export default function CatalogAdmin({ kind, api }: { kind: "opportunities" | "universities"; api: Api }) {
  type Item = AdminOpportunity | AdminUniversity;
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const isOpp = kind === "opportunities";
  const title = (i: Item) => ("title" in i ? i.title : i.name);

  const refresh = useCallback(async () => {
    try {
      setItems((await api(`/api/catalog/${kind}`)).items);
    } catch (e) {
      setStatus((e as Error).message);
    }
  }, [api, kind]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setStatus("Сохраняю…");
    try {
      await api(`/api/catalog/${kind}`, { method: "POST", body: JSON.stringify(editing) });
      setStatus("✓ Сохранено — ученики увидят изменения при следующем открытии платформы");
      setEditing(null);
      refresh();
    } catch (err) {
      setStatus((err as Error).message);
    }
  };

  const togglePublished = async (i: Item) => {
    await api(`/api/catalog/${kind}`, { method: "POST", body: JSON.stringify({ ...i, published: !i.published }) });
    refresh();
  };

  const remove = async (i: Item) => {
    if (!confirm(`Удалить «${title(i)}»? Это нельзя отменить. Если нужно временно убрать — лучше «Скрыть».`)) return;
    await api(`/api/catalog/${kind}/${encodeURIComponent(i.id)}`, { method: "DELETE" });
    refresh();
  };

  const seed = async () => {
    if (!confirm("Загрузить демо-записи из кода? Существующие записи с теми же id будут перезаписаны.")) return;
    await api("/api/catalog/seed", { method: "POST" });
    refresh();
  };

  const list = (items ?? []).filter((i) => title(i).toLowerCase().includes(query.toLowerCase()));
  const expired = (items ?? []).filter((i) => daysUntil(i.deadline) <= 0).length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => (setEditing(isOpp ? { ...emptyOpp } : { ...emptyUni }), setStatus(""))} className={buttonClass}>
          + {isOpp ? "Добавить возможность" : "Добавить вуз"}
        </button>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по названию" className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
        {items?.length === 0 && (
          <button type="button" onClick={seed} className={ghostButtonClass}>
            Загрузить демо-записи
          </button>
        )}
        <span className="ml-auto text-sm text-slate-500">
          Всего: {items?.length ?? "…"}
          {expired > 0 && <span className="ml-2 font-medium text-rose-600">· с прошедшим дедлайном: {expired}</span>}
        </span>
      </div>

      {status && <p className="text-sm text-slate-600">{status}</p>}

      {editing && (
        <Card className="border-blue-200">
          <form onSubmit={save} className="grid gap-4">
            <h3 className="font-display text-lg font-bold text-slate-950">{editing.id ? "Редактирование" : isOpp ? "Новая возможность" : "Новый вуз"}</h3>
            {isOpp ? (
              <OpportunityForm value={editing as AdminOpportunity} onChange={setEditing} />
            ) : (
              <UniversityForm value={editing as AdminUniversity} onChange={setEditing} />
            )}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Показывать ученикам
            </label>
            <div className="flex gap-2">
              <button type="submit" className={buttonClass}>
                Сохранить
              </button>
              <button type="button" onClick={() => setEditing(null)} className={ghostButtonClass}>
                Отмена
              </button>
            </div>
          </form>
        </Card>
      )}

      {!items && <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />}
      {items && list.length === 0 && <Card className="text-center text-slate-500">Пока ничего нет.</Card>}

      {list.map((i) => {
        const days = daysUntil(i.deadline);
        return (
          <Card key={i.id} className={`flex flex-wrap items-center gap-3 ${i.published ? "" : "opacity-60"}`}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-slate-900">{title(i)}</span>
                {"type" in i && <Badge tone="blue">{i.type}</Badge>}
                {"country" in i && <Badge>{i.country}</Badge>}
                {!i.published && <Badge tone="amber">Скрыто</Badge>}
              </div>
              <p className={`mt-0.5 text-xs ${days <= 0 ? "font-semibold text-rose-600" : "text-slate-500"}`}>
                Дедлайн: {formatDate(i.deadline)}
                {days <= 0 ? " — прошёл, обновите дату или скройте" : ` (через ${days} дн.)`}
              </p>
            </div>
            <div className="flex gap-1 text-sm">
              <button type="button" onClick={() => (setEditing({ ...i }), setStatus(""), window.scrollTo({ top: 0, behavior: "smooth" }))} className="rounded-lg px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50">
                Изменить
              </button>
              <button type="button" onClick={() => togglePublished(i)} className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100">
                {i.published ? "Скрыть" : "Показать"}
              </button>
              <button type="button" onClick={() => remove(i)} className="rounded-lg px-3 py-1.5 text-rose-600 hover:bg-rose-50">
                Удалить
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
