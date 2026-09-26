"use client";

import { useLang, useT } from "@/lib/i18n/client";
import Link from "next/link";
import { useState } from "react";
import { gapAnalysis, readiness, suggestedUniversities } from "@/lib/analysis";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

const STATUS = {
  ok: { tone: "green", bar: "bg-emerald-500", width: 100 },
  partial: { tone: "amber", bar: "bg-amber-400", width: 55 },
  missing: { tone: "rose", bar: "bg-rose-400", width: 12 },
} as const;

export default function GapPage() {
  const t = useT();
  const tc = t.cabinet;
  const g = t.app.gap;
  const lang = useLang();
  const [picked, setPicked] = useState("");

  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const options = state.targets.length
          ? catalog.universities.filter((u) => state.targets.includes(u.id))
          : suggestedUniversities(profile, catalog.universities).slice(0, 5);
        const uni = catalog.universities.find((u) => u.id === picked) ?? options[0];
        if (!uni) return <Card className="text-center text-slate-500">{t.app.common.catalogEmpty}</Card>;
        const rows = gapAnalysis(profile, uni, lang);
        const r = readiness(rows);

        return (
          <div>
            <PageHeader
              title={tc.pages.gap[0]}
              subtitle={tc.pages.gap[1]}
            />

            <div className="mb-5 flex flex-wrap gap-2">
              {options.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setPicked(u.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    u.id === uni.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
            {!state.targets.length && (
              <p className="mb-5 text-sm text-slate-500">
                {g.suggested}{" "}
                <Link href="/universities" className="font-semibold text-blue-700">
                  {g.pickOwn}
                </Link>
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <Card className="h-fit text-center">
                <p className="text-sm text-slate-500">{g.readinessFor}</p>
                <p className="font-semibold text-slate-900">{uni.name}</p>
                <div
                  className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(var(--color-blue-600) ${r * 3.6}deg, var(--color-slate-200) 0deg)` }}
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white font-display text-3xl font-bold text-slate-950">{r}%</div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {r >= 75 ? g.strong : r >= 45 ? g.good : g.weak}
                </p>
                <Link href="/mentor" className="mt-4 inline-block text-sm font-semibold text-blue-700">
                  {g.discuss}
                </Link>
              </Card>

              <div className="grid gap-3">
                {rows.map((row) => {
                  const s = STATUS[row.status];
                  return (
                    <Card key={row.key}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-900">{row.label}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-slate-500">
                            {g.you}: <b className="text-slate-800">{row.you}</b> · {g.need}: <b className="text-slate-800">{row.need}</b>
                          </span>
                          <Badge tone={s.tone}>{g[row.status]}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${s.width}%` }} />
                      </div>
                      {row.status !== "ok" && <p className="mt-3 text-sm text-blue-800">→ {row.advice}</p>}
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    </WithProfile>
  );
}
