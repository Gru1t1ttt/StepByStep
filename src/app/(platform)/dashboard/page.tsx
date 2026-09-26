"use client";

import { Check, ChevronDown, Flame, Send, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge, Card, PageHeader, WithProfile, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import { buildRoadmap, daysUntil, gapAnalysis, readiness, upcomingEvents, type RoadmapStep } from "@/lib/analysis";
import { fmt } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/client";
import { dateShort, tv } from "@/lib/i18n/values";
import { toggleStep, weekStreak, type PlatformState } from "@/lib/store";

// Дашборд отвечает на три вопроса: что делать сейчас, насколько я близко к цели и что горит.
// Всё остальное — ссылками в разделы. Полный план спрятан под «Весь план».

const CATEGORY_TONE: Record<RoadmapStep["category"], "blue" | "green" | "amber" | "rose" | "slate"> = {
  Экзамен: "amber",
  Возможность: "blue",
  Проект: "green",
  Профиль: "slate",
  Подача: "rose",
};

function StepCheck({ done, id }: { done: boolean; id: string }) {
  const d = useT().app.dash;
  return (
    <button
      type="button"
      aria-label={done ? d.markUndone : d.markDone}
      onClick={() => toggleStep(id)}
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-blue-500"}`}
    >
      {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

function StepRow({ s, done }: { s: RoadmapStep; done: boolean }) {
  const lang = useLang();
  const c = useT().app.common;
  const days = s.due ? daysUntil(s.due) : null;
  return (
    <li className="flex items-start gap-3 py-3">
      <StepCheck done={done} id={s.id} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={s.href} className={`font-medium hover:text-blue-700 ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>
            {s.title}
          </Link>
          <Badge tone={CATEGORY_TONE[s.category]}>{tv(s.category, lang)}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{s.detail}</p>
      </div>
      {s.due && (
        <div className="shrink-0 text-right text-xs">
          <p className="text-slate-500">{dateShort(s.due, lang)}</p>
          {days !== null && days <= 30 && !done && <p className="font-semibold text-rose-600">{fmt(c.inDays, { n: days })}</p>}
        </div>
      )}
    </li>
  );
}

function Setup({ state }: { state: PlatformState }) {
  const d = useT().app.dash;
  const steps = [
    { done: state.targets.length > 0, href: "/universities" },
    { done: state.savedOpportunities.length > 0, href: "/opportunities" },
    { done: state.chat.length > 0, href: "/mentor" },
    { done: state.portfolio.length > 0, href: "/portfolio" },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="font-medium text-slate-900">
        {d.setup} · {done}/{steps.length}
      </span>
      {steps.map((s, i) => (
        <Link
          key={s.href}
          href={s.href}
          className={`flex items-center gap-1 rounded-full px-3 py-1 ${s.done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"}`}
        >
          {s.done && <Check className="h-3.5 w-3.5" />} {d.setupSteps[i]}
        </Link>
      ))}
    </div>
  );
}

function Metric({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-sm text-slate-500">
        {icon} {label}
      </p>
      <p className="mt-1 truncate font-display text-2xl font-bold text-slate-950">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const t = useT();
  const lang = useLang();
  const d = t.app.dash;
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [showPlan, setShowPlan] = useState(false);

  const ask = (e: FormEvent) => {
    e.preventDefault();
    router.push(question.trim() ? `/mentor?q=${encodeURIComponent(question.trim())}` : "/mentor");
  };

  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const roadmap = buildRoadmap(profile, state.targets, catalog, lang);
        const isDone = (id: string) => state.doneSteps.includes(id);
        const undone = roadmap.filter((s) => !isDone(s.id));
        const focus = undone[0];
        const next = undone.slice(1, 4);

        const targets = state.targets.map((id) => catalog.universities.find((u) => u.id === id)).filter((u) => !!u);
        const goals = targets.map((u) => {
          const rows = gapAnalysis(profile, u, lang);
          const main = rows.find((r) => r.status === "missing") ?? rows.find((r) => r.status === "partial");
          return { u, rows, r: readiness(rows), main };
        });
        const primary = goals[0];

        const events = upcomingEvents(profile, state, catalog, lang);
        const nearest = events[0];
        const application = events.find((e) => e.kind === "Подача");
        const streak = weekStreak(state.doneLog);
        const firstName = profile.fullName.split(" ")[0];

        return (
          <div className="grid gap-5">
            <PageHeader
              title={t.cabinet.hello.replace("{name}", firstName)}
              subtitle={application ? fmt(d.toSubmit, { uni: application.uni ?? "", n: daysUntil(application.date) }) : t.cabinet.pages.dashboard}
            />

            <Setup state={state} />

            {/* главное сейчас */}
            <div className="rounded-2xl border-2 border-blue-500 bg-white p-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Target className="h-4 w-4" /> {d.focus}
              </p>
              {focus ? (
                <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 max-w-2xl">
                    <p className="font-display text-xl font-bold text-slate-950">{focus.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {focus.detail}
                      {focus.due && daysUntil(focus.due) > 0 && <span className="font-semibold text-rose-600"> · {fmt(d.daysLeft, { n: daysUntil(focus.due) })}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={focus.href} className={ghostButtonClass}>
                      {t.app.common.open}
                    </Link>
                    <button type="button" onClick={() => toggleStep(focus.id)} className={buttonClass}>
                      <Check className="mr-1.5 h-4 w-4" /> {d.focusDone}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-slate-600">{d.focusEmpty}</p>
              )}
            </div>

            {/* три цифры */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Metric
                label={primary ? fmt(d.readiness, { uni: primary.u.name }) : d.readinessNoTarget}
                value={primary ? `${primary.r}%` : "—"}
                hint={primary ? fmt(d.closed, { ok: primary.rows.filter((r) => r.status === "ok").length, all: primary.rows.length }) : d.pickTarget}
              />
              <Metric
                label={d.nearest}
                value={nearest ? fmt(t.app.common.days, { n: daysUntil(nearest.date) }) : d.noDeadlines}
                hint={nearest?.title}
              />
              <Metric label={d.streak} value={String(streak)} hint={d.streakHint} icon={streak > 0 ? <Flame className="h-4 w-4 text-amber-500" /> : undefined} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              {/* цели */}
              <Card>
                <h2 className="font-display text-lg font-bold text-slate-950">{d.goals}</h2>
                {goals.length ? (
                  <ul className="mt-3 grid gap-4">
                    {goals.map(({ u, r, main }) => (
                      <li key={u.id} className="text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="min-w-0 truncate font-medium text-slate-900">{u.name}</span>
                          <span className="shrink-0 font-semibold text-slate-700">{r}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full ${r >= 75 ? "bg-emerald-500" : r >= 45 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${Math.max(r, 3)}%` }} />
                        </div>
                        <p className="mt-1 text-slate-500">{main ? fmt(d.mainGap, { gap: main.label.replace(/\s*\(.*\)$/, "") }) : d.allClosed}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 text-sm text-slate-600">
                    <p>{d.goalsEmpty}</p>
                    <Link href="/universities" className="mt-2 inline-block font-semibold text-blue-700">
                      {d.goalsPick}
                    </Link>
                  </div>
                )}
              </Card>

              {/* скоро */}
              <Card>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-950">{d.soon}</h2>
                  <Link href="/calendar" className="text-sm font-semibold text-blue-700">
                    {d.calendarAll}
                  </Link>
                </div>
                {events.length ? (
                  <ul className="mt-3 grid gap-2.5 text-sm">
                    {events.slice(0, 4).map((e) => {
                      const days = daysUntil(e.date);
                      return (
                        <li key={e.id}>
                          <Link href={e.href} className="flex gap-3 hover:text-blue-700">
                            <span className={`w-16 shrink-0 ${days <= 14 ? "font-semibold text-rose-600" : "text-slate-500"}`}>
                              {dateShort(e.date, lang)}
                            </span>
                            <span className="min-w-0 truncate text-slate-800">{e.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">{d.soonEmpty}</p>
                )}
              </Card>
            </div>

            {/* дальше в плане и весь план */}
            {(next.length > 0 || roadmap.length > 1) && (
              <Card>
                <h2 className="font-display text-lg font-bold text-slate-950">{d.next}</h2>
                <ul className="divide-y divide-slate-100">
                  {(showPlan ? roadmap.filter((s) => s.id !== focus?.id) : next).map((s) => (
                    <StepRow key={s.id} s={s} done={isDone(s.id)} />
                  ))}
                </ul>
                <button type="button" onClick={() => setShowPlan((v) => !v)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-700">
                  {showPlan ? d.planHide : fmt(d.plan, { n: roadmap.length })}
                  <ChevronDown className={`h-4 w-4 transition ${showPlan ? "rotate-180" : ""}`} />
                </button>
              </Card>
            )}

            {/* вопрос наставнику */}
            <form onSubmit={ask} className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={d.ask}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button type="submit" className={buttonClass}>
                <Send className="mr-1.5 h-4 w-4" /> {d.askBtn}
              </button>
            </form>
          </div>
        );
      }}
    </WithProfile>
  );
}
