"use client";

import { fmt } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/client";
import { monthShort, monthYear, tv } from "@/lib/i18n/values";
import { AlarmClock } from "lucide-react";

import Link from "next/link";
import { daysUntil, formatDate, upcomingEvents, type UpcomingEvent } from "@/lib/analysis";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

export default function CalendarPage() {
  const t = useT();
  const tc = t.cabinet;
  const c = t.app.cal;
  const lang = useLang();
  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const events = upcomingEvents(profile, state, catalog, lang);

        // Главное отличие от обычного календаря: предупреждаем, когда пора НАЧИНАТЬ, а не только о самом дедлайне.
        const startNow = events.filter((e) => e.startPrep && daysUntil(e.startPrep) <= 7);

        const byMonth = new Map<string, UpcomingEvent[]>();
        for (const e of events) {
          const m = monthYear(e.date, lang);
          byMonth.set(m, [...(byMonth.get(m) ?? []), e]);
        }

        return (
          <div>
            <PageHeader
              title={tc.pages.calendar[0]}
              subtitle={tc.pages.calendar[1]}
            />

            {events.length === 0 && (
              <Card className="text-center text-slate-500">
                {c.empty[0]}{" "}
                <Link href="/opportunities" className="font-semibold text-blue-700">
                  {c.empty[1]}
                </Link>{" "}
                {c.empty[2]}{" "}
                <Link href="/universities" className="font-semibold text-blue-700">
                  {c.empty[3]}
                </Link>
                .
              </Card>
            )}

            {startNow.length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <h2 className="flex items-center gap-2 font-semibold text-amber-900">
                  <AlarmClock className="h-5 w-5" /> {c.startNow}
                </h2>
                <ul className="mt-2 grid gap-1 text-sm text-amber-900">
                  {startNow.map((e) => (
                    <li key={e.id}>
                      <b>{e.title}</b> — {fmt(c.startNowItem, { date: formatDate(e.date, lang), n: daysUntil(e.date) })}
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
                              <p className="text-[10px] uppercase">{monthShort(e.date, lang)}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-slate-900">{e.title}</p>
                              {e.startPrep && <p className="text-xs text-slate-500">{fmt(c.prepFrom, { date: formatDate(e.startPrep, lang) })}</p>}
                            </div>
                            <Badge tone={e.kind === "Подача" ? "rose" : e.kind === "Экзамен" ? "amber" : "blue"}>{tv(e.kind, lang)}</Badge>
                            <span className="hidden w-20 text-right text-sm text-slate-500 sm:block">{fmt(t.app.common.days, { n: days })}</span>
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
