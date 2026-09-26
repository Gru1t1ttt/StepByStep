"use client";

import { Check } from "lucide-react";

import { useState } from "react";
import { formatDate, gapAnalysis, readiness, universityFit } from "@/lib/analysis";
import { MAJORS } from "@/lib/profile";
import { toggleIn, updateState } from "@/lib/store";
import { Badge, Card, WithProfile } from "@/components/platform/ui";

const selectClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

// Подбор из вузов с требованиями Unilight: готовность по gap analysis и добавление в цели.
export default function CuratedMatch() {
  const [country, setCountry] = useState("");
  const [major, setMajor] = useState("");
  const [grant, setGrant] = useState("");
  const [maxTuition, setMaxTuition] = useState("");
  const [topOnly, setTopOnly] = useState("");

  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const COUNTRIES = [...new Set(catalog.universities.map((u) => u.country))].sort();
        const list = catalog.universities.filter((u) => !country || u.country === country)
          .filter((u) => !major || u.majors.includes(major))
          .filter((u) => !grant || (grant === "full" ? u.grants === "Полный грант" : u.grants !== "Нет грантов"))
          .filter((u) => !maxTuition || u.tuitionUsd <= Number(maxTuition))
          .filter((u) => !topOnly || (u.qsRank > 0 && u.qsRank <= Number(topOnly)))
          .sort((a, b) => universityFit(profile, b) - universityFit(profile, a));

        return (
          <div>
            <p className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              Вузы, для которых мы собрали требования: по ним считается готовность и строится карта развития. Добавь 3–5 в цели.
              <Badge tone="blue">В целях: {state.targets.length}</Badge>
            </p>

            <div className="mb-5 flex flex-wrap gap-2">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
                <option value="">Все страны</option>
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select value={major} onChange={(e) => setMajor(e.target.value)} className={selectClass}>
                <option value="">Все направления</option>
                {MAJORS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <select value={grant} onChange={(e) => setGrant(e.target.value)} className={selectClass}>
                <option value="">Гранты: любые</option>
                <option value="full">Только полный грант</option>
                <option value="any">Есть хоть какой-то грант</option>
              </select>
              <select value={maxTuition} onChange={(e) => setMaxTuition(e.target.value)} className={selectClass}>
                <option value="">Стоимость: любая</option>
                <option value="5000">до $5 000 / год</option>
                <option value="20000">до $20 000 / год</option>
                <option value="40000">до $40 000 / год</option>
              </select>
              <select value={topOnly} onChange={(e) => setTopOnly(e.target.value)} className={selectClass}>
                <option value="">Рейтинг QS: любой</option>
                <option value="10">Топ-10</option>
                <option value="50">Топ-50</option>
                <option value="100">Топ-100</option>
              </select>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {list.map((u) => {
                const isTarget = state.targets.includes(u.id);
                const r = readiness(gapAnalysis(profile, u));
                const majorsMatch = u.majors.filter((m) => profile.targetMajors.includes(m));
                return (
                  <Card key={u.id} className={isTarget ? "border-blue-300 ring-2 ring-blue-100" : ""}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-slate-950">{u.name}</h3>
                        <p className="text-sm text-slate-500">
                          {[u.country, u.city].filter(Boolean).join(", ")}
                          {u.qsRank > 0 && ` · QS #${u.qsRank}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-xl font-bold ${r >= 75 ? "text-emerald-600" : r >= 45 ? "text-amber-600" : "text-rose-500"}`}>{r}%</p>
                        <p className="text-xs text-slate-500">готовность</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={u.grants === "Полный грант" ? "green" : u.grants === "Частичный грант" ? "amber" : "slate"}>{u.grants}</Badge>
                      <Badge>{u.tuitionUsd ? `$${u.tuitionUsd.toLocaleString("ru-RU")} / год` : "Бесплатно"}</Badge>
                      <Badge>IELTS {u.ielts}+</Badge>
                      {u.sat ? <Badge>SAT {u.sat}+</Badge> : <Badge>SAT не нужен</Badge>}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Направления: {u.majors.map((m) => (majorsMatch.includes(m) ? `✓ ${m}` : m)).join(", ")}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
                      <span className="text-slate-500">Подача до {formatDate(u.deadline)}</span>
                      <button
                        type="button"
                        onClick={() => updateState((s) => ({ targets: toggleIn(s.targets, u.id) }))}
                        className={`rounded-lg px-3 py-1.5 font-semibold ${isTarget ? "bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                      >
                        {isTarget ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-4 w-4" /> В целях
                          </span>
                        ) : (
                          "+ В цели"
                        )}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      }}
    </WithProfile>
  );
}
