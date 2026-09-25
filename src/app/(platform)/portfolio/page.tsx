"use client";

import { useState, type FormEvent } from "react";
import { updateState, type PortfolioItem } from "@/lib/store";
import { Badge, Card, PageHeader, WithProfile, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import type { Profile } from "@/lib/profile";

const KINDS: PortfolioItem["kind"][] = ["Достижение", "Проект", "Исследование", "Сертификат", "Активность"];
const ICONS: Record<PortfolioItem["kind"], string> = { Достижение: "🏆", Проект: "💻", Исследование: "🔬", Сертификат: "📜", Активность: "🤝" };
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

const emptyItem = { kind: "Достижение" as PortfolioItem["kind"], title: "", description: "", link: "", date: "", fileName: "" };

// Переносит достижения и активности из анкеты, чтобы не вводить их дважды.
function fromProfile(p: Profile): PortfolioItem[] {
  return [
    ...p.achievements
      .filter((a) => a.title)
      .map((a, i) => ({
        id: `profile-ach-${i}`,
        kind: "Достижение" as const,
        title: a.title,
        description: [a.level, a.result].filter(Boolean).join(" · "),
        link: "",
        date: a.year,
        fileName: "",
      })),
    ...p.activities
      .filter((a) => a.role || a.organization)
      .map((a, i) => ({
        id: `profile-act-${i}`,
        kind: "Активность" as const,
        title: [a.role, a.organization].filter(Boolean).join(", "),
        description: a.description,
        link: "",
        date: "",
        fileName: "",
      })),
    ...p.exams
      .filter((e) => e.status === "done" && e.exam)
      .map((e, i) => ({
        id: `profile-exam-${i}`,
        kind: "Сертификат" as const,
        title: `${e.exam} ${e.score}`.trim(),
        description: "",
        link: "",
        date: "",
        fileName: "",
      })),
  ];
}

export default function PortfolioPage() {
  const [draft, setDraft] = useState(emptyItem);
  const [open, setOpen] = useState(false);

  return (
    <WithProfile>
      {(profile, state) => {
        const imported = fromProfile(profile).filter((i) => !state.portfolio.some((p) => p.id === i.id));

        const add = (e: FormEvent) => {
          e.preventDefault();
          if (!draft.title.trim()) return;
          updateState((s) => ({ portfolio: [{ ...draft, id: crypto.randomUUID() }, ...s.portfolio] }));
          setDraft(emptyItem);
          setOpen(false);
        };

        return (
          <div>
            <PageHeader
              title="Портфолио"
              subtitle="Все дипломы, проекты, сертификаты и активности в одном месте. Отсюда собирается портфолио для поступления."
              action={
                <div className="flex gap-2 print:hidden">
                  <button type="button" onClick={() => window.print()} className={ghostButtonClass}>
                    Версия для печати / PDF
                  </button>
                  <button type="button" onClick={() => setOpen((v) => !v)} className={buttonClass}>
                    + Добавить
                  </button>
                </div>
              }
            />

            {imported.length > 0 && (
              <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-blue-200 bg-blue-50 print:hidden">
                <p className="text-sm text-blue-900">В анкете есть {imported.length} достижений и активностей, которых нет в портфолио.</p>
                <button type="button" onClick={() => updateState((s) => ({ portfolio: [...s.portfolio, ...imported] }))} className={buttonClass}>
                  Перенести из анкеты
                </button>
              </Card>
            )}

            {open && (
              <Card className="mb-5 print:hidden">
                <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
                  <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as PortfolioItem["kind"] })} className={input}>
                    {KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Название *" className={input} required />
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Что сделал(а) и какой результат? Цифры приветствуются"
                    className={`${input} sm:col-span-2`}
                    rows={2}
                  />
                  <input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="Ссылка (GitHub, сайт, публикация)" className={input} />
                  <input value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} placeholder="Когда (например, май 2026)" className={input} />
                  <label className={`${ghostButtonClass} cursor-pointer sm:col-span-2`}>
                    {draft.fileName ? `📎 ${draft.fileName}` : "Прикрепить файл (диплом, сертификат)"}
                    <input type="file" className="hidden" onChange={(e) => setDraft({ ...draft, fileName: e.target.files?.[0]?.name ?? "" })} />
                  </label>
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="submit" className={buttonClass}>
                      Сохранить
                    </button>
                    <button type="button" onClick={() => setOpen(false)} className={ghostButtonClass}>
                      Отмена
                    </button>
                  </div>
                </form>
              </Card>
            )}

            {state.portfolio.length === 0 ? (
              <Card className="text-center text-slate-500">Портфолио пока пустое. Добавь первое достижение или проект.</Card>
            ) : (
              <div className="grid gap-6">
                {KINDS.map((kind) => {
                  const items = state.portfolio.filter((i) => i.kind === kind);
                  if (!items.length) return null;
                  return (
                    <section key={kind}>
                      <h2 className="mb-3 font-display text-lg font-bold text-slate-950">
                        {ICONS[kind]} {kind} <span className="text-slate-400">({items.length})</span>
                      </h2>
                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((i) => (
                          <Card key={i.id} className="relative">
                            <p className="pr-8 font-medium text-slate-900">{i.title}</p>
                            {i.description && <p className="mt-1 text-sm text-slate-600">{i.description}</p>}
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              {i.date && <Badge>{i.date}</Badge>}
                              {i.fileName && <Badge tone="blue">📎 {i.fileName}</Badge>}
                              {i.link && (
                                <a href={i.link} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">
                                  ссылка ↗
                                </a>
                              )}
                            </div>
                            <button
                              type="button"
                              aria-label="Удалить"
                              onClick={() => updateState((s) => ({ portfolio: s.portfolio.filter((p) => p.id !== i.id) }))}
                              className="absolute right-3 top-3 rounded px-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 print:hidden"
                            >
                              ✕
                            </button>
                          </Card>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        );
      }}
    </WithProfile>
  );
}
