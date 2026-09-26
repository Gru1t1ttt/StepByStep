"use client";

import { AnimatePresence, motion } from "motion/react";
import { Award, BarChart3, CalendarDays, Check, Code2, Compass, FolderOpen, HeartHandshake, MessageCircle, Target, Trophy, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Dict } from "@/lib/i18n";
import { useT } from "@/lib/i18n/client";

// Макеты экранов платформы для главной. Данные в них — пример, не реальные пользователи.

type P = Dict["platform"];

function RoadmapScreen({ t }: { t: P }) {
  const done = [true, true, false, false, false];
  return (
    <div>
      <p className="text-sm text-slate-500">{t.roadmap.goal}</p>
      <ol className="mt-4 grid gap-3">
        {t.roadmap.steps.map(([title, when], i) => (
          <li key={title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done[i] ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {done[i] ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">{title}</span>
            <span className="hidden text-xs text-slate-500 sm:block">{when}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OpportunitiesScreen({ t }: { t: P }) {
  const match = [94, 88, 81, 76];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {t.opportunities.items.map(([title, type, deadline], i) => (
        <div key={title} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{type}</span>
            <span className="text-xs font-semibold text-emerald-600">
              {match[i]}% {t.opportunities.match}
            </span>
          </div>
          <p className="mt-3 font-medium text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t.opportunities.deadline}: {deadline}
          </p>
        </div>
      ))}
    </div>
  );
}

function GapScreen({ t }: { t: P }) {
  const rows = [
    { you: "6.5", need: "7.0", pct: 85 },
    { you: "4.7", need: "4.5", pct: 100 },
    { you: "1", need: "3+", pct: 35 },
    { you: "0", need: "1–2", pct: 10 },
    { you: "2", need: "4+", pct: 50 },
  ];
  return (
    <div>
      <p className="text-sm text-slate-500">{t.gap.title}</p>
      <div className="mt-4 grid gap-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-800">{t.gap.rows[i]}</span>
              <span className="text-slate-500">
                {r.you} / {r.need}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${r.pct >= 80 ? "bg-emerald-500" : r.pct >= 40 ? "bg-amber-400" : "bg-rose-400"}`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MentorScreen({ t }: { t: P }) {
  const [q1, a1, q2] = t.mentor;
  return (
    <div className="grid gap-3 text-sm">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white">{q1}</div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2.5 text-slate-800">{a1}</div>
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white">{q2}</div>
    </div>
  );
}

function PortfolioScreen({ t }: { t: P }) {
  const icons = [Trophy, Code2, Award, HeartHandshake];
  return (
    <div className="grid gap-3">
      {t.portfolio.items.map(([title, tag], i) => {
        const Icon = icons[i];
        return (
          <div key={title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">{title}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
          </div>
        );
      })}
      <p className="text-xs text-slate-500">{t.portfolio.note}</p>
    </div>
  );
}

function CalendarScreen({ t }: { t: P }) {
  return (
    <div className="grid gap-3">
      {t.calendar.items.map(([date, title, note], i) => (
        <div key={title} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span
            className={`w-16 shrink-0 rounded-lg py-1 text-center text-xs font-semibold ${
              i === 0 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {date}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">{title}</p>
            {note && (
              <p className="text-xs text-blue-600">
                {t.calendar.ai}: {note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS: { icon: LucideIcon; Screen: (props: { t: P }) => ReactNode }[] = [
  { icon: Compass, Screen: RoadmapScreen },
  { icon: Target, Screen: OpportunitiesScreen },
  { icon: BarChart3, Screen: GapScreen },
  { icon: MessageCircle, Screen: MentorScreen },
  { icon: FolderOpen, Screen: PortfolioScreen },
  { icon: CalendarDays, Screen: CalendarScreen },
];

export default function PlatformTabs() {
  const t = useT().platform;
  const [active, setActive] = useState(0);
  const tab = { ...TABS[active], ...t.tabs[active] };
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-6">
      {/* список разделов: вертикально на компьютере, прокруткой на телефоне */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:content-start lg:overflow-visible lg:px-0">
        {TABS.map(({ icon: Icon }, i) => {
          const on = active === i;
          const { label, hint } = t.tabs[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition lg:w-full ${
                on ? "border-white bg-white text-[#060a16] shadow-lg shadow-blue-500/10" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${on ? "bg-[#060a16]/5 text-blue-600" : "bg-white/5 text-amber-300"}`}>
                <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`hidden text-xs lg:block ${on ? "text-slate-500" : "text-slate-500"}`}>{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="keep-light relative min-h-[420px] rounded-3xl border border-white/10 bg-gradient-to-br from-white to-slate-100 p-5 shadow-[0_0_80px_rgba(59,108,255,0.18)] sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <tab.icon className="h-4 w-4 text-blue-600" strokeWidth={2} /> {tab.label}
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">{t.example}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <tab.Screen t={t} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
