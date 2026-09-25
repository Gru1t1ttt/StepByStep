"use client";

import { AlarmClock } from "lucide-react";

import Link from "next/link";
import { buildRoadmap, daysUntil, formatDate } from "@/lib/analysis";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

type Event = { id: string; date: string; title: string; kind: string; startPrep?: string; href: string };

function minusWeeks(iso: string, weeks: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() - weeks * 7);
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const events: Event[] = [
          ...catalog.opportunities.filter((o) => state.savedOpportunities.includes(o.id)).map((o) => ({
            id: o.id,
            date: o.deadline,
            title: o.title,
            kind: o.type,
            startPrep: minusWeeks(o.deadline, o.prepWeeks),
            href: "/opportunities",
          })),
          ...catalog.universities.filter((u) => state.targets.includes(u.id)).map((u) => ({
            id: `uni-${u.id}`,
            date: u.deadline,
            title: `Подача: ${u.name}`,
            kind: "Подача",
            startPrep: minusWeeks(u.deadline, 12),
            href: "/universities",
          })),
          ...buildRoadmap(profile, state.targets, catalog)
            .filter((s) => s.category === "Экзамен" && s.due)
            .map((s) => ({ id: s.id, date: s.due!, title: s.title, kind: "Экзамен", startPrep: minusWeeks(s.due!, 10), href: "/gap" })),
        ]
          .filter((e) => daysUntil(e.date) > 0)
          .sort((a, b) => a.date.localeCompare(b.date));

        // Главное отличие от обычного календаря: предупреждаем, когда пора НАЧИНАТЬ, а не только о самом дедлайне.
        const startNow = events.filter((e) => e.startPrep && daysUntil(e.startPrep) <= 7);

        const byMonth = new Map<string, Event[]>();
        for (const e of events) {
          const raw = new Date(e.date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
          const m = raw[0].toUpperCase() + raw.slice(1);
          byMonth.set(m, [...(byMonth.get(m) ?? []), e]);
        }

        return (
          <div>
            <PageHeader
              title="Дедлайны"
              subtitle="Конкурсы из твоего плана, экзамены и подачи в университеты. Напомним не только о дедлайне, но и о том, когда пора начинать готовиться."
            />

            {events.length === 0 && (
              <Card className="text-center text-slate-500">
                Пока пусто. Добавь возможности в план в разделе{" "}
                <Link href="/opportunities" className="font-semibold text-blue-700">
                  «Возможности»
                </Link>{" "}
                и выбери{" "}
                <Link href="/universities" className="font-semibold text-blue-700">
                  университеты-цели
                </Link>
                .
              </Card>
            )}

            {startNow.length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <h2 className="flex items-center gap-2 font-semibold text-amber-900">
                  <AlarmClock className="h-5 w-5" /> Пора начинать
                </h2>
                <ul className="mt-2 grid gap-1 text-sm text-amber-900">
                  {startNow.map((e) => (
                    <li key={e.id}>
                      <b>{e.title}</b> — дедлайн {formatDate(e.date)}, осталось {daysUntil(e.date)} дн.
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="grid gap-6">
              {[...byMonth].map(([month, list]) => (
                <section key={month}>
                  <h2 className="mb-3 font-display text-lg font-bold text-slate-950">{month}</h2>
                  <div className="grid gap-2">
                    {list.map((e) => {
                      const days = daysUntil(e.date);
                      return (
                        <Link key={e.id} href={e.href} className="block min-w-0">
                          <Card padded={false} className="flex items-center gap-3 px-4 py-3 hover:border-blue-300 sm:gap-4 sm:px-5">
                            <div className={`w-14 shrink-0 rounded-lg py-1.5 text-center ${days <= 14 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                              <p className="font-display text-lg font-bold leading-none">{new Date(e.date).getDate()}</p>
                              <p className="text-[10px] uppercase">{new Date(e.date).toLocaleDateString("ru-RU", { month: "short" })}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-slate-900">{e.title}</p>
                              {e.startPrep && <p className="text-xs text-slate-500">Начать подготовку: {formatDate(e.startPrep)}</p>}
                            </div>
                            <Badge tone={e.kind === "Подача" ? "rose" : e.kind === "Экзамен" ? "amber" : "blue"}>{e.kind}</Badge>
                            <span className="hidden w-20 text-right text-sm text-slate-500 sm:block">{days} дн.</span>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        );
      }}
    </WithProfile>
  );
}
