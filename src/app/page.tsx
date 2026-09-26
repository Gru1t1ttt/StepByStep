import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  Bot,
  CalendarX2,
  Check,
  ChevronDown,
  Compass,
  FileSpreadsheet,
  FolderOpen,
  Globe2,
  Layers,
  MessagesSquare,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import IntroAnimation from "@/components/landing/IntroAnimation";
import Orbit from "@/components/landing/Orbit";
import PlatformTabs from "@/components/landing/PlatformTabs";
import Header from "@/components/site/Header";
import Logo from "@/components/site/Logo";
import { PLANS, PLAN_FEATURES, SITE, formatTenge } from "@/lib/site";

const STEPS = [
  { title: "Расскажи о себе", text: "Одна анкета или загрузка CV, плюс тест MBTI. Интересы, предметы, достижения, активности." },
  { title: "Выбери цель", text: "Страна, университеты, направление — с реальными требованиями и дедлайнами." },
  { title: "Получи карту развития", text: "ИИ сравнит тебя с требованиями, покажет пробелы и распишет план по неделям." },
  { title: "Иди без страха", text: "Конкурсы, проекты и экзамены по плану, а достижения сами собираются в портфолио." },
];

// «Одно место вместо десятка вкладок» — главная ценность Unilight
const BEFORE: { icon: typeof X; text: string }[] = [
  { icon: MessagesSquare, text: "Десяток Telegram-каналов, где важная олимпиада тонет среди рекламы" },
  { icon: Bot, text: "ChatGPT, которому каждый раз заново объясняешь, кто ты и куда поступаешь" },
  { icon: Globe2, text: "Двадцать вкладок с сайтами вузов и разными требованиями" },
  { icon: FileSpreadsheet, text: "Таблица с дедлайнами, которую забываешь обновить" },
  { icon: CalendarX2, text: "Про конкурс узнаёшь, когда подача уже закрылась" },
];
const AFTER: { icon: typeof X; text: string }[] = [
  { icon: UserRound, text: "Один профиль: оценки, экзамены, проекты и цели — всё собрано" },
  { icon: Sparkles, text: "ИИ-наставник помнит тебя и опирается на опыт реально поступивших" },
  { icon: Target, text: "Возможности подобраны под твой класс, интересы и выбранные вузы" },
  { icon: BellRing, text: "Напоминание приходит, когда пора начинать готовиться, а не в последний день" },
  { icon: FolderOpen, text: "Каждое достижение сразу ложится в портфолио для подачи" },
];

type Faq = { q: string; a: ReactNode };
const FAQ: Faq[] = [
  {
    q: "Чем Unilight отличается от ChatGPT и бесплатных Telegram-каналов?",
    a: (
      <>
        <p>
          ChatGPT знает много, но ничего не знает о тебе: каждый разговор начинается с нуля, а советы получаются общими. Каналы дают поток возможностей, но
          не говорят, какие из них нужны именно тебе и когда за них браться.
        </p>
        <p>Unilight соединяет это в одну систему:</p>
        <ul>
          <li>наставник видит твой профиль, цели, пробелы и план — и не спрашивает одно и то же дважды;</li>
          <li>ответы опираются на нашу базу: требования вузов, актуальные возможности и честные истории поступивших;</li>
          <li>всё, что ты делаешь, сохраняется: план, дедлайны и портфолио растут вместе с тобой.</li>
        </ul>
      </>
    ),
  },
  {
    q: "Насколько можно доверять советам ИИ?",
    a: (
      <>
        <p>
          Мы специально настроили наставника быть честным, а не мотивирующим любой ценой. Если твоя цель — вуз с приёмом 4%, он прямо скажет, что это
          reach, объяснит, какой профиль реально нужен, и предложит сбалансированный список: reach, target и safety.
        </p>
        <p>
          Каждый ответ, который опирается на нашу базу, помечен ссылкой на источник. Но ИИ может ошибаться, поэтому конкретные дедлайны, суммы и требования
          мы всегда советуем сверить на официальном сайте вуза или программы — наставник и сам об этом напоминает.
        </p>
      </>
    ),
  },
  {
    q: "Я в 11 классе — не поздно? А если в 8-м — не рано?",
    a: (
      <>
        <p>Не поздно и не рано — меняется только стратегия.</p>
        <ul>
          <li>
            <b>8–9 класс:</b> лучшее время, чтобы найти своё направление и начать долгую историю — проект, исследование, олимпиадный путь. Именно глубина за
            3–4 года сильнее всего выделяет заявку.
          </li>
          <li>
            <b>10 класс:</b> экзамены (IELTS, SAT), первые серьёзные результаты, летние школы.
          </li>
          <li>
            <b>11 класс:</b> приоритеты и дедлайны. Платформа поможет выбрать вузы с реальными шансами, не упустить сроки подачи и собрать то, что уже есть,
            в сильное портфолио.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "Я пока не знаю, куда хочу поступать. Платформа поможет?",
    a: (
      <>
        <p>
          Да, это нормальная точка старта. В анкете ты отмечаешь интересы, любимые предметы и проходишь тест типа личности — по ним платформа предложит
          направления и страны, с которых стоит начать.
        </p>
        <p>
          Дальше лучше пробовать на практике: наставник подберёт небольшие проекты и конкурсы в 2–3 интересных тебе сферах. Через пару месяцев станет
          понятно, что по-настоящему нравится, — и под это уже строится карта развития.
        </p>
      </>
    ),
  },
  {
    q: "Можно ли учиться за рубежом бесплатно, если семья не может оплатить учёбу?",
    a: (
      <>
        <p>Да, но к этому нужно готовиться отдельно. Основные пути:</p>
        <ul>
          <li>государственные стипендии других стран — например, Венгрии, Кореи, Турции, Китая;</li>
          <li>финансовая помощь университетов США, которая может покрыть всю стоимость, но с очень высокой конкуренцией;</li>
          <li>гранты вузов Европы и Азии и казахстанские программы.</li>
        </ul>
        <p>
          Укажи в профиле, что нужен полный грант, — подбор вузов и план будут учитывать это с самого начала, а не когда уже поздно.
        </p>
      </>
    ),
  },
  {
    q: "Что будет с моими данными?",
    a: (
      <>
        <p>
          Твой профиль видишь только ты: доступ к данным каждого ученика закрыт на уровне базы данных. Мы не продаём данные и не используем их для рекламы.
          ИИ-наставник получает только то, что нужно для ответа.
        </p>
        <p>
          Можно в любой момент попросить удалить аккаунт и все данные. Подробнее — в{" "}
          <Link href="/privacy" className="font-medium underline">
            политике конфиденциальности
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: "Как работает подписка и можно ли её отменить?",
    a: (
      <>
        <p>
          Все тарифы дают одинаково полный доступ — различается только срок. Длинные тарифы выгоднее: за 3 месяца ты платишь как за один с небольшим, а
          год обходится в несколько раз дешевле помесячной оплаты.
        </p>
        <p>Отменить можно в любой момент — доступ сохранится до конца оплаченного периода. Пока идёт бета-версия, все функции открыты бесплатно.</p>
      </>
    ),
  },
];

export default function Home() {
  const eyebrow = "font-mono text-xs uppercase tracking-[0.2em] text-amber-300/80";
  const h2 = "font-display text-3xl font-bold tracking-tight text-white sm:text-4xl";
  const card = "rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm";

  return (
    <div className="relative overflow-x-clip bg-[#060a16] text-slate-300">
      {/* мягкие световые пятна — плавные переходы между секциями вместо резких блоков */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-[70vh] h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,108,255,0.18),transparent)]" />
        <div className="absolute -left-60 top-[210vh] h-[800px] w-[800px] rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.08),transparent)]" />
        <div className="absolute -right-60 top-[330vh] h-[900px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(59,108,255,0.14),transparent)]" />
        <div className="absolute left-1/2 top-[470vh] h-[900px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.07),transparent)]" />
      </div>

      <IntroAnimation />
      <Header />

      <main className="relative flex-1">
        {/* Первый экран */}
        <section id="start" className="relative scroll-mt-24 px-4 pt-16 text-center sm:px-6 sm:pt-24">
          <p className={eyebrow}>Unilight · EdTech-платформа</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Поступи в университет мечты <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">без страха</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            ИИ строит твою персональную карту развития: подбирает возможности, показывает, чего не хватает для выбранных университетов, и ведёт до
            поступления.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/onboarding" className="flex items-center gap-2 rounded-full bg-blue-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
              Начать <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#platform" className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">
              Посмотреть платформу
            </Link>
          </div>
          <div className="mt-6 sm:mt-10">
            <Orbit />
          </div>
        </section>

        {/* Где ты / куда / что делать */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "Где ты сейчас", "Навыки, оценки, языки и достижения в одном профиле, который растёт вместе с тобой."],
              ["02", "Куда хочешь прийти", "Университет, страна и направление с реальными требованиями и шансами."],
              ["03", "Что делать дальше", "Понятный следующий шаг каждую неделю, а не хаос из сотни конкурсов."],
            ].map(([n, t, d]) => (
              <div key={n} className={`${card} p-7`}>
                <span className="font-mono text-sm text-amber-300">{n}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-white">{t}</h3>
                <p className="mt-2 text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section id="how" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className={eyebrow}>— Как это работает</p>
            <h2 className={`mt-3 max-w-2xl ${h2}`}>Четыре шага от анкеты до оффера</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className={`${card} p-6`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 font-display text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Платформа */}
        <section id="platform" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className={`text-center ${eyebrow}`}>— Платформа</p>
          <h2 className={`mt-3 text-center ${h2}`}>Загляни внутрь</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">Шесть инструментов, которые работают вместе и знают о тебе всё нужное.</p>
          <div className="mt-10">
            <PlatformTabs />
          </div>
        </section>

        {/* Одно место вместо десятка вкладок */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <p className={eyebrow}>— Зачем Unilight</p>
            <h2 className={`mx-auto mt-3 max-w-3xl ${h2}`}>Одно место вместо десятка вкладок</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Поступление за рубеж — это сотни мелких решений и дедлайнов. Когда информация разбросана, самое важное теряется в шуме.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className={`${card} p-7`}>
              <p className="flex items-center gap-2 font-semibold text-slate-400">
                <Layers className="h-5 w-5" /> Как обычно
              </p>
              <ul className="mt-5 grid gap-4">
                {BEFORE.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-slate-400">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-500">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-amber-300/25 bg-[linear-gradient(145deg,rgba(59,108,255,0.18),rgba(251,191,36,0.08))] p-7 shadow-[0_0_60px_rgba(251,191,36,0.08)]">
              <p className="flex items-center gap-2 font-semibold text-white">
                <Compass className="h-5 w-5 text-amber-300" /> С Unilight
              </p>
              <ul className="mt-5 grid gap-4">
                {AFTER.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-slate-200">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Тарифы */}
        <section id="pricing" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className={`text-center ${eyebrow}`}>— Тарифы</p>
            <h2 className={`mt-3 text-center ${h2}`}>Выбери свой тариф</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">Во всех тарифах — полный доступ. Чем дольше срок, тем дешевле день подготовки.</p>

            <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-3xl border p-7 ${
                    p.recommended
                      ? "border-blue-400/60 bg-[linear-gradient(160deg,rgba(59,108,255,0.22),rgba(6,10,22,0.6))] shadow-[0_0_70px_rgba(59,108,255,0.25)] lg:-my-3 lg:py-10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      Рекомендуем
                    </span>
                  )}
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{p.label}</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-4xl font-bold text-white">{formatTenge(p.price)}</span>
                    {p.compareAt && <span className="text-lg text-slate-500 line-through">{formatTenge(p.compareAt)}</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{p.note}</p>

                  <div className="my-6 border-t border-white/10" />

                  <p className="font-display text-3xl font-bold text-amber-300">
                    {formatTenge(Math.round(p.price / p.days))}
                    <span className="ml-1 text-base font-medium text-slate-400">/ день</span>
                  </p>
                  {p.compareAt ? (
                    <span className="mt-2 w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      Экономия {Math.round((1 - p.price / p.compareAt) * 100)}%
                    </span>
                  ) : (
                    <span className="mt-2 text-sm text-slate-500">Чтобы попробовать всё</span>
                  )}

                  <Link
                    href="/onboarding"
                    className={`mt-8 block rounded-full py-3 text-center font-semibold transition ${
                      p.recommended ? "bg-blue-500 text-white hover:bg-blue-400" : "border border-white/15 text-white hover:bg-white/5"
                    }`}
                  >
                    Выбрать
                  </Link>
                </div>
              ))}
            </div>

            <div className={`mx-auto mt-10 max-w-4xl ${card} p-7`}>
              <p className="font-semibold text-white">Во все тарифы входит</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-slate-300">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-center text-sm text-slate-500">
              Зачёркнутая цена — сколько стоил бы тот же срок при помесячной оплате. Отмена в любой момент. Пока идёт бета — все функции бесплатно.
            </p>
          </div>
        </section>

        {/* Для поступивших */}
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-[linear-gradient(120deg,rgba(251,191,36,0.10),rgba(59,108,255,0.12))] p-8 sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className={eyebrow}>— Для поступивших</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">Уже поступил(а) за рубеж? Поделись опытом</h2>
              <p className="mt-3 text-slate-400">
                Честные истории — что сработало, какие были ошибки, даже отказы — помогают школьникам больше любых гайдов. ИИ-наставник Unilight опирается
                именно на них.
              </p>
            </div>
            <Link href="/share" className="shrink-0 rounded-full bg-white px-6 py-3 font-semibold text-[#060a16] transition hover:bg-slate-100">
              Рассказать свою историю
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <BookOpenCheck className="mx-auto h-8 w-8 text-amber-300" strokeWidth={1.6} />
            <h2 className={`mt-3 ${h2}`}>Частые вопросы</h2>
            <p className="mt-3 text-slate-400">Честно о том, как работает Unilight и чего от него ждать.</p>
          </div>
          <div className="mt-10 grid gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition open:border-white/20 open:bg-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-3 leading-relaxed text-slate-400 [&_a]:text-amber-300 [&_b]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-2">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-400 sm:grid-cols-[1fr_auto_auto] sm:px-6">
          <div>
            <Logo tone="light" />
            <p className="mt-3 max-w-xs">EdTech-платформа, которая ведёт школьника к поступлению в зарубежный университет — без страха.</p>
          </div>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-white">Платформа</p>
            <Link href="/onboarding" className="hover:text-white">
              Начать
            </Link>
            <Link href="/login" className="hover:text-white">
              Войти
            </Link>
            <Link href="/#pricing" className="hover:text-white">
              Тарифы
            </Link>
          </nav>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-white">Unilight</p>
            <Link href="/share" className="hover:text-white">
              Поделиться опытом
            </Link>
            <Link href="/#faq" className="hover:text-white">
              Вопросы
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/5 py-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <Link href="/privacy" className="hover:text-slate-300">
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            Условия использования
          </Link>
        </div>
      </footer>
    </div>
  );
}
