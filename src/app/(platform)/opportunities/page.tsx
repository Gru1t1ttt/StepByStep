"use client";

import { Check, ExternalLink } from "lucide-react";

import { useState } from "react";
import type { OpportunityType } from "@/data/opportunities";
import { daysUntil, formatDate, matchOpportunity } from "@/lib/analysis";
import { INTERESTS } from "@/lib/profile";
import { toggleIn, updateState } from "@/lib/store";
import { Badge, Card, PageHeader, WithProfile } from "@/components/platform/ui";

const selectClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

export default function OpportunitiesPage() {
  const [type, setType] = useState("");
  const [interest, setInterest] = useState("");
  const [format, setFormat] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);

  return (
    <WithProfile>
      {(profile, state, catalog) => {
        const TYPES = [...new Set(catalog.opportunities.map((o) => o.type))] as OpportunityType[];
        const list = catalog.opportunities.map((o) => matchOpportunity(profile, o))
          .filter(({ opportunity: o }) => daysUntil(o.deadline) > 0)
          .filter(({ opportunity: o }) => !type || o.type === type)
          .filter(({ opportunity: o }) => !interest || o.interests.includes(interest))
          .filter(({ opportunity: o }) => !format || o.format === format)
          .filter(({ opportunity: o }) => !onlyFree || o.free)
          .filter(({ opportunity: o }) => !onlySaved || state.savedOpportunities.includes(o.id))
          .sort((a, b) => b.score - a.score);

        return (
          <div>
            <PageHeader
              title="Возможности"
              subtitle="Олимпиады, хакатоны, конкурсы, летние школы и исследования, отсортированные по тому, насколько они подходят именно тебе."
            />

            <div className="mb-5 flex flex-wrap gap-2">
              <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                <option value="">Все типы</option>
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select value={interest} onChange={(e) => setInterest(e.target.value)} className={selectClass}>
                <option value="">Все направления</option>
                {INTERESTS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className={selectClass}>
                <option value="">Любой формат</option>
                <option>Онлайн</option>
                <option>Офлайн</option>
                <option>Гибрид</option>
              </select>
              <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} /> Бесплатные
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <input type="checkbox" checked={onlySaved} onChange={(e) => setOnlySaved(e.target.checked)} /> В моём плане
              </label>
            </div>

            {list.length === 0 && <Card className="text-center text-slate-500">Ничего не найдено — попробуй убрать фильтры.</Card>}

            <div className="grid gap-4 xl:grid-cols-2">
              {list.map(({ opportunity: o, score, reasons }) => {
                const saved = state.savedOpportunities.includes(o.id);
                const days = daysUntil(o.deadline);
                return (
                  <Card key={o.id} className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{o.type}</Badge>
                      <Badge>{o.format}</Badge>
                      {o.free ? <Badge tone="green">Бесплатно</Badge> : <Badge tone="amber">Платно / есть финпомощь</Badge>}
                      <span className={`ml-auto text-sm font-bold ${score >= 70 ? "text-emerald-600" : score >= 45 ? "text-amber-600" : "text-slate-400"}`}>
                        {score}%
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-950">{o.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{o.description}</p>
                    {reasons.length > 0 && <p className="mt-3 text-sm text-blue-700">Почему тебе: {reasons.join(" · ")}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm">
                      <span className={days <= 30 ? "font-semibold text-rose-600" : "text-slate-500"}>
                        Дедлайн: {formatDate(o.deadline)} ({days} дн.)
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Начать готовиться за {o.prepWeeks} нед.</span>
                      <div className="ml-auto flex gap-2">
                        <a href={o.url} target="_blank" rel="noopener noreferrer" className="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
                          <span className="flex items-center gap-1">
                            Сайт <ExternalLink className="h-3.5 w-3.5" />
                          </span>
                        </a>
                        <button
                          type="button"
                          onClick={() => updateState((s) => ({ savedOpportunities: toggleIn(s.savedOpportunities, o.id) }))}
                          className={`rounded-lg px-3 py-1.5 font-semibold ${saved ? "bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                        >
                          {saved ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-4 w-4" /> В плане
                            </span>
                          ) : (
                            "+ В план"
                          )}
                        </button>
                      </div>
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
