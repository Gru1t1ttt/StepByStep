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
import PlatformTabs from "@/components/landing/PlatformTabs";
import Header from "@/components/site/Header";
import Logo from "@/components/site/Logo";
import { PLANS, PLAN_FEATURES, SITE, formatTenge } from "@/lib/site";

const STAIRS = ["Интересы", "Проекты", "Олимпиады", "Портфолио", "Оффер"];

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
          <Link href="/privacy" className="font-medium text-blue-700 underline">
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
  return (
    <>
      <IntroAnimation />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section id="start" className="relative scroll-mt-16 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
            <div className="mx-auto flex h-40 max-w-xl items-end justify-center gap-2 sm:h-52 sm:gap-3">
              {STAIRS.map((s, i) => (
                <div
                  key={s}
                  className={`flex flex-1 items-start justify-center rounded-t-2xl pt-3 text-[10px] font-semibold sm:text-xs ${
                    i === STAIRS.length - 1 ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                  }`}
                  style={{ height: `${20 + i * 20}%` }}
                >
                  {s}
                </div>
              ))}
            </div>

            <h1 className="mx-auto mt-10 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">
              Поступи в университет мечты без страха
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              ИИ строит твою персональную карту развития: подбирает возможности, показывает, чего не хватает для выбранных университетов, и ведёт до
              поступления.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/onboarding" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700">
                Начать <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#platform" className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                Посмотреть платформу
              </Link>
            </div>
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
              <div key={n} className="rounded-3xl border border-slate-200 bg-white p-7">
                <span className="font-mono text-sm text-blue-600">{n}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-slate-950">{t}</h3>
                <p className="mt-2 text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section id="how" className="scroll-mt-16 bg-slate-950 py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="font-mono text-xs uppercase tracking-wider text-blue-400">— Как это работает</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">Четыре шага от анкеты до оффера</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-display text-sm font-bold">{i + 1}</span>
                  <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Платформа */}
        <section id="platform" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-slate-950 sm:text-4xl">Загляни внутрь платформы</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">Шесть инструментов, которые работают вместе и знают о тебе всё нужное.</p>
          <div className="mt-10">
            <PlatformTabs />
          </div>
        </section>

        {/* Одно место вместо десятка вкладок */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-wider text-blue-600">— Зачем Unilight</p>
            <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold text-slate-950 sm:text-4xl">Одно место вместо десятка вкладок</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Поступление за рубеж — это сотни мелких решений и дедлайнов. Когда информация разбросана, самое важное теряется в шуме.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-7">
              <p className="flex items-center gap-2 font-semibold text-slate-500">
                <Layers className="h-5 w-5" /> Как обычно
              </p>
              <ul className="mt-5 grid gap-4">
                {BEFORE.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-slate-600">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="pt-1.5">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-slate-950 p-7 text-white">
              <p className="flex items-center gap-2 font-semibold">
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
        <section id="pricing" className="scroll-mt-16 bg-slate-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-slate-950 sm:text-4xl">Выбери свой тариф</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">Во всех тарифах — полный доступ. Чем дольше срок, тем дешевле день подготовки.</p>

            <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-3xl border bg-white p-7 ${
                    p.recommended ? "border-blue-600 shadow-2xl shadow-blue-600/15 ring-4 ring-blue-600/10 lg:-my-3 lg:py-10" : "border-slate-200"
                  }`}
                >
                  {p.recommended && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                      Рекомендуем
                    </span>
                  )}
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{p.label}</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-4xl font-bold text-slate-950">{formatTenge(p.price)}</span>
                    {p.compareAt && <span className="text-lg text-slate-400 line-through">{formatTenge(p.compareAt)}</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{p.note}</p>

                  <div className="my-6 border-t border-slate-100" />

                  <p className="font-display text-3xl font-bold text-slate-950">
                    {formatTenge(Math.round(p.price / p.days))}
                    <span className="ml-1 text-base font-medium text-slate-500">/ день</span>
                  </p>
                  {p.compareAt ? (
                    <span className="mt-2 w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      Экономия {Math.round((1 - p.price / p.compareAt) * 100)}%
                    </span>
                  ) : (
                    <span className="mt-2 text-sm text-slate-500">Чтобы попробовать всё</span>
                  )}

                  <Link
                    href="/onboarding"
                    className={`mt-auto block rounded-xl py-3 text-center font-semibold ${
                      p.recommended ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                    } ${p.recommended ? "mt-8" : "mt-8"}`}
                  >
                    Выбрать
                  </Link>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-slate-200 bg-white p-7">
              <p className="font-semibold text-slate-900">Во все тарифы входит</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-slate-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
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
        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-slate-950 p-8 text-white sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-wider text-blue-400">— Для поступивших</p>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Уже поступил(а) за рубеж? Поделись опытом</h2>
              <p className="mt-3 text-slate-400">
                Честные истории — что сработало, какие были ошибки, даже отказы — помогают школьникам больше любых гайдов. ИИ-наставник Unilight опирается
                именно на них.
              </p>
            </div>
            <Link href="/share" className="shrink-0 rounded-xl bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-100">
              Рассказать свою историю
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <BookOpenCheck className="mx-auto h-8 w-8 text-blue-600" strokeWidth={1.6} />
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-950 sm:text-4xl">Частые вопросы</h2>
            <p className="mt-3 text-slate-600">Честно о том, как работает Unilight и чего от него ждать.</p>
          </div>
          <div className="mt-10 grid gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-lg open:shadow-slate-200/60">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-3 leading-relaxed text-slate-600 [&_b]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-2">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-500 sm:grid-cols-[1fr_auto_auto] sm:px-6">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs">EdTech-платформа, которая ведёт школьника к поступлению в зарубежный университет — без страха.</p>
          </div>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-slate-900">Платформа</p>
            <Link href="/onboarding" className="hover:text-slate-900">
              Начать
            </Link>
            <Link href="/login" className="hover:text-slate-900">
              Войти
            </Link>
            <Link href="/#pricing" className="hover:text-slate-900">
              Тарифы
            </Link>
          </nav>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-slate-900">Unilight</p>
            <Link href="/share" className="hover:text-slate-900">
              Поделиться опытом
            </Link>
            <Link href="/#faq" className="hover:text-slate-900">
              Вопросы
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-slate-100 py-4 text-xs text-slate-400">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <Link href="/privacy" className="hover:text-slate-700">
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="hover:text-slate-700">
            Условия использования
          </Link>
        </div>
      </footer>
    </>
  );
}
