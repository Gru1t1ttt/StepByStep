"use client";

import Link from "next/link";
import { buildRoadmap, daysUntil, formatDate, gapAnalysis, rankOpportunities, readiness } from "@/lib/analysis";
import { toggleIn, updateState } from "@/lib/store";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

// Первые шаги нового ученика: пропадают, когда всё сделано.
function FirstSteps({ state }: { state: { targets: string[]; savedOpportunities: string[]; chat: unknown[]; portfolio: unknown[] } }) {
  const steps = [
    { done: state.targets.length > 0, title: "Выбери 3–5 университетов-целей", text: "Под них построится карта развития и gap analysis.", href: "/universities" },
    { done: state.savedOpportunities.length > 0, title: "Добавь в план 1–2 возможности", text: "Олимпиады, хакатоны, летние школы — дедлайны попадут в календарь.", href: "/opportunities" },
    { done: state.chat.length > 0, title: "Задай вопрос ИИ-наставнику", text: "Например: «Что мне сделать на этой неделе?»", href: "/mentor" },
    { done: state.portfolio.length > 0, title: "Начни портфолио", text: "Перенеси достижения из анкеты одним нажатием.", href: "/portfolio" },
  ];
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-slate-950">С чего начать</h2>
        <span className="text-sm text-slate-500">
          {done} из {steps.length}
        </span>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className={`flex h-full gap-3 rounded-xl border p-3 ${s.done ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"}`}
              >
                {s.done ? "✓" : i + 1}
              </span>
              <span>
                <span className={`block text-sm font-medium ${s.done ? "text-slate-500 line-through" : "text-slate-900"}`}>{s.title}</span>
                <span className="block text-xs text-slate-500">{s.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

const CATEGORY_TONE = { Экзамен: "amber", Возможность: "blue", Проект: "green", Профиль: "slate", Подача: "rose" } as const;

export default function DashboardPage() {
  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const roadmap = buildRoadmap(profile, state.targets, catalog);
        const done = roadmap.filter((s) => state.doneSteps.includes(s.id)).length;
        const nextStep = roadmap.find((s) => !state.doneSteps.includes(s.id));
        const targets = catalog.universities.filter((u) => state.targets.includes(u.id));
        const matches = rankOpportunities(profile, catalog.opportunities).slice(0, 3);
        const firstName = profile.fullName.split(" ")[0];

        return (
          <div className="grid gap-6">
            <PageHeader
              title={`Привет, ${firstName}!`}
              subtitle="Твоя карта развития: где ты сейчас, куда идёшь и что делать дальше."
            />

            <FirstSteps state={state} />

            {/* Где ты / куда / что дальше */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Где ты сейчас</p>
                <p className="mt-2 font-display text-lg font-bold text-slate-950">
                  {profile.grade && /\d/.test(profile.grade) ? `${profile.grade} класс` : profile.grade}
                  {profile.mbti && ` · ${profile.mbti}`}
                </p>
                <p className="mt-1 text-sm text-slate-600">{profile.interests.slice(0, 3).join(", ")}</p>
                <p className="mt-3 text-sm text-slate-500">
                  Выполнено шагов: {done} из {roadmap.length}
                </p>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${roadmap.length ? (done / roadmap.length) * 100 : 0}%` }} />
                </div>
              </Card>
              <Card>
                <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Куда идёшь</p>
                {targets.length ? (
                  <ul className="mt-2 grid gap-2">
                    {targets.slice(0, 3).map((u) => {
                      const r = readiness(gapAnalysis(profile, u));
                      return (
                        <li key={u.id} className="text-sm">
                          <div className="flex justify-between gap-2">
                            <span className="min-w-0 truncate font-medium text-slate-900">{u.name}</span>
                            <span className="shrink-0 text-slate-500">{r}%</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full ${r >= 75 ? "bg-emerald-500" : r >= 45 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${r}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-slate-600">Цели ещё не выбраны.</p>
                    <Link href="/universities" className="mt-3 inline-block text-sm font-semibold text-blue-700">
                      Выбрать университеты →
                    </Link>
                  </>
                )}
              </Card>
              <div className="rounded-2xl bg-blue-600 p-5 text-white">
                <p className="font-mono text-xs uppercase tracking-wider text-blue-100">Следующий шаг</p>
                {nextStep ? (
                  <>
                    <p className="mt-2 font-display text-lg font-bold">{nextStep.title}</p>
                    <p className="mt-1 text-sm text-blue-100">{nextStep.detail}</p>
                    <Link href={nextStep.href} className="mt-4 inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-700">
                      Перейти →
                    </Link>
                  </>
                ) : (
                  <p className="mt-2">Все шаги выполнены 🎉</p>
                )}
              </div>
            </div>

            {/* Карта развития */}
            <Card padded={false}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-slate-950">Карта развития</h2>
                <Link href="/mentor" className="text-sm font-semibold text-blue-700">
                  Обсудить с ИИ →
                </Link>
              </div>
              <ol className="divide-y divide-slate-100">
                {roadmap.map((s) => {
                  const isDone = state.doneSteps.includes(s.id);
                  const days = s.due ? daysUntil(s.due) : null;
                  return (
                    <li key={s.id} className="flex items-start gap-3 px-5 py-4">
                      <button
                        type="button"
                        aria-label={isDone ? "Отметить как невыполненное" : "Отметить как выполненное"}
                        onClick={() => updateState((st) => ({ doneSteps: toggleIn(st.doneSteps, s.id) }))}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                          isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-blue-500"
                        }`}
                      >
                        {isDone && "✓"}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={s.href} className={`font-medium hover:text-blue-700 ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                            {s.title}
                          </Link>
                          <Badge tone={CATEGORY_TONE[s.category]}>{s.category}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-500">{s.detail}</p>
                        {s.due && (
                          <p className="mt-1 text-xs text-slate-500 sm:hidden">
                            {formatDate(s.due)}
                            {days !== null && days <= 30 && !isDone && <span className="ml-1 font-semibold text-rose-600">· через {days} дн.</span>}
                          </p>
                        )}
                      </div>
                      {s.due && (
                        <div className="hidden shrink-0 text-right text-xs sm:block">
                          <p className="text-slate-500">{formatDate(s.due)}</p>
                          {days !== null && days <= 30 && !isDone && <p className="font-semibold text-rose-600">через {days} дн.</p>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Card>

            {/* Лучшие совпадения */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-slate-950">Подобрано для тебя</h2>
                <Link href="/opportunities" className="text-sm font-semibold text-blue-700">
                  Все возможности →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {matches.map((m) => (
                  <Card key={m.opportunity.id}>
                    <div className="flex items-center justify-between">
                      <Badge tone="blue">{m.opportunity.type}</Badge>
                      <span className="text-xs font-semibold text-emerald-600">{m.score}%</span>
                    </div>
                    <p className="mt-3 font-medium text-slate-900">{m.opportunity.title}</p>
                    <p className="mt-1 text-xs text-slate-500">до {formatDate(m.opportunity.deadline)}</p>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        );
      }}
    </WithProfile>
  );
}
