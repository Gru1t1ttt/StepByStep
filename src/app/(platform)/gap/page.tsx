"use client";

import Link from "next/link";
import { useState } from "react";
import { gapAnalysis, readiness, suggestedUniversities } from "@/lib/analysis";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

const STATUS = {
  ok: { label: "Готово", tone: "green", bar: "bg-emerald-500", width: 100 },
  partial: { label: "Почти", tone: "amber", bar: "bg-amber-400", width: 55 },
  missing: { label: "Не хватает", tone: "rose", bar: "bg-rose-400", width: 12 },
} as const;

export default function GapPage() {
  const [picked, setPicked] = useState("");

  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const options = state.targets.length
          ? catalog.universities.filter((u) => state.targets.includes(u.id))
          : suggestedUniversities(profile, catalog.universities).slice(0, 5);
        const uni = catalog.universities.find((u) => u.id === picked) ?? options[0];
        if (!uni) return <Card className="text-center text-slate-500">Каталог университетов пока пуст.</Card>;
        const rows = gapAnalysis(profile, uni);
        const r = readiness(rows);

        return (
          <div>
            <PageHeader
              title="Gap analysis"
              subtitle="Сравнение твоего профиля с требованиями университета: что уже есть, а что нужно подтянуть."
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
                Показаны вузы, подходящие под твой профиль.{" "}
                <Link href="/universities" className="font-semibold text-blue-700">
                  Выбрать свои цели →
                </Link>
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <Card className="h-fit text-center">
                <p className="text-sm text-slate-500">Готовность к</p>
                <p className="font-semibold text-slate-900">{uni.name}</p>
                <div
                  className="mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full"
                  style={{ background: `conic-gradient(#2563eb ${r * 3.6}deg, #e2e8f0 0deg)` }}
                >
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white font-display text-3xl font-bold text-slate-950">{r}%</div>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {r >= 75 ? "Сильная позиция — работай над глубиной и эссе." : r >= 45 ? "Хорошая база, но есть пробелы." : "Есть над чем поработать — начни с красных пунктов."}
                </p>
                <Link href="/mentor" className="mt-4 inline-block text-sm font-semibold text-blue-700">
                  Разобрать с ИИ-наставником →
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
                            ты: <b className="text-slate-800">{row.you}</b> · нужно: <b className="text-slate-800">{row.need}</b>
                          </span>
                          <Badge tone={s.tone}>{s.label}</Badge>
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
