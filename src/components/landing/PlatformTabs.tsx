"use client";

import { AnimatePresence, motion } from "motion/react";
import { Award, BarChart3, CalendarDays, Check, Code2, Compass, FolderOpen, HeartHandshake, MessageCircle, Target, Trophy, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

// Макеты экранов платформы для главной. Данные в них — пример, не реальные пользователи.

function RoadmapScreen() {
  const steps = [
    { title: "Подтянуть немецкий до B2", when: "до марта", done: true },
    { title: "Исследовательский проект по возобновляемой энергетике", when: "до мая", done: true },
    { title: "Инженерный конкурс для школьников", when: "дедлайн 15 апреля", done: false },
    { title: "Летняя инженерная школа в Германии", when: "подача до 1 мая", done: false },
    { title: "IELTS 7.0", when: "сдать в сентябре", done: false },
  ];
  return (
    <div>
      <p className="text-sm text-slate-500">Цель: Mechanical Engineering · Германия · 2027</p>
      <ol className="mt-4 grid gap-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                s.done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {s.done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-slate-800">{s.title}</span>
            <span className="hidden text-xs text-slate-500 sm:block">{s.when}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function OpportunitiesScreen() {
  const items = [
    { title: "Хакатон по AI для школьников", type: "Хакатон", match: 94, deadline: "12 окт" },
    { title: "Республиканская олимпиада по физике", type: "Олимпиада", match: 88, deadline: "3 ноя" },
    { title: "Летняя школа по инженерии", type: "Летняя школа", match: 81, deadline: "1 фев" },
    { title: "Конференция молодых исследователей", type: "Конференция", match: 76, deadline: "20 дек" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((o) => (
        <div key={o.title} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{o.type}</span>
            <span className="text-xs font-semibold text-emerald-600">{o.match}% совпадение</span>
          </div>
          <p className="mt-3 font-medium text-slate-900">{o.title}</p>
          <p className="mt-1 text-xs text-slate-500">Дедлайн: {o.deadline}</p>
        </div>
      ))}
    </div>
  );
}

function GapScreen() {
  const rows = [
    { label: "Английский (IELTS)", you: "6.5", need: "7.0", pct: 85 },
    { label: "Средний балл", you: "4.7", need: "4.5", pct: 100 },
    { label: "Олимпиады и конкурсы", you: "1", need: "3+", pct: 35 },
    { label: "Исследовательские проекты", you: "0", need: "1–2", pct: 10 },
    { label: "Внеклассная активность", you: "2", need: "4+", pct: 50 },
  ];
  return (
    <div>
      <p className="text-sm text-slate-500">Ты vs требования: ETH Zürich · Mechanical Engineering</p>
      <div className="mt-4 grid gap-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-800">{r.label}</span>
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

function MentorScreen() {
  return (
    <div className="grid gap-3 text-sm">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white">
        Я сделал бота на Python для школы. Что дальше, чтобы усилить портфолио на Computer Science?
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2.5 text-slate-800">
        Отлично, помню, что ты уже знаешь Python и основы SQL. Следующий шаг — проект с реальными пользователями:
        выложи бота на GitHub, собери 50+ пользователей и измерь результат. Параллельно подай на школьный хакатон до
        12 октября — это закроет пробел «командные проекты» в твоём gap analysis.
      </div>
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-white">
        А какие идеи для исследовательского проекта?
      </div>
    </div>
  );
}

function PortfolioScreen() {
  const items = [
    { icon: Trophy, title: "Призёр областной олимпиады по физике", tag: "Достижение" },
    { icon: Code2, title: "Telegram-бот расписания для школы", tag: "Проект · GitHub" },
    { icon: Award, title: "IELTS 6.5", tag: "Сертификат" },
    { icon: HeartHandshake, title: "Волонтёр благотворительного фонда, 120 часов", tag: "Активность" },
  ];
  return (
    <div className="grid gap-3">
      {items.map((i) => (
        <div key={i.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <i.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
          <span className="flex-1 text-sm font-medium text-slate-800">{i.title}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{i.tag}</span>
        </div>
      ))}
      <p className="text-xs text-slate-500">ИИ сортирует загруженные файлы и собирает из них портфолио для подачи.</p>
    </div>
  );
}

function CalendarScreen() {
  const items = [
    { date: "12 окт", title: "Хакатон — подача заявки", note: "Пора собирать команду", urgent: true },
    { date: "3 ноя", title: "Олимпиада по физике — отборочный тур", note: "Начни решать прошлые задачи", urgent: false },
    { date: "15 ноя", title: "IELTS — регистрация на экзамен", note: "", urgent: false },
    { date: "1 фев", title: "Летняя школа — мотивационное письмо", note: "Черновик лучше начать сейчас", urgent: false },
  ];
  return (
    <div className="grid gap-3">
      {items.map((d) => (
        <div key={d.title} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <span
            className={`w-16 shrink-0 rounded-lg py-1 text-center text-xs font-semibold ${
              d.urgent ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {d.date}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">{d.title}</p>
            {d.note && <p className="text-xs text-blue-600">ИИ: {d.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS: { label: string; hint: string; icon: LucideIcon; screen: ReactNode }[] = [
  { label: "Карта развития", hint: "План по неделям до поступления", icon: Compass, screen: <RoadmapScreen /> },
  { label: "Возможности", hint: "Олимпиады и школы под твой профиль", icon: Target, screen: <OpportunitiesScreen /> },
  { label: "Gap analysis", hint: "Чего не хватает до выбранного вуза", icon: BarChart3, screen: <GapScreen /> },
  { label: "ИИ-наставник", hint: "Помнит тебя и отвечает честно", icon: MessageCircle, screen: <MentorScreen /> },
  { label: "Портфолио", hint: "Все достижения в одном месте", icon: FolderOpen, screen: <PortfolioScreen /> },
  { label: "Дедлайны", hint: "Напомним, когда пора начинать", icon: CalendarDays, screen: <CalendarScreen /> },
];

export default function PlatformTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-6">
      {/* список разделов: вертикально на компьютере, прокруткой на телефоне */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:content-start lg:overflow-visible lg:px-0">
        {TABS.map((t, i) => {
          const on = active === i;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition lg:w-full ${
                on ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-900/10" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${on ? "bg-white/10" : "bg-slate-100"}`}>
                <t.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className={`hidden text-xs lg:block ${on ? "text-white/60" : "text-slate-500"}`}>{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[420px] rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <tab.icon className="h-4 w-4 text-blue-600" strokeWidth={2} /> {tab.label}
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">пример</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            {tab.screen}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
