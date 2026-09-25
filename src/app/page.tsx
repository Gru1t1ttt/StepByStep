import Link from "next/link";
import Header from "@/components/site/Header";
import Logo from "@/components/site/Logo";
import PlatformTabs from "@/components/landing/PlatformTabs";

const STAIRS = ["Интересы", "Проекты", "Олимпиады", "Портфолио", "Оффер"];

const STEPS = [
  {
    title: "Расскажи о себе",
    text: "Одна анкета или загрузка CV, плюс тест MBTI. Интересы, предметы, достижения, активности.",
  },
  {
    title: "Выбери цель",
    text: "Страна, университеты, направление. Данные берём из базы университетов со всего мира.",
  },
  {
    title: "Получи карту развития",
    text: "ИИ сравнит тебя с требованиями, покажет пробелы и распишет план с дедлайнами.",
  },
  {
    title: "Иди шаг за шагом",
    text: "Конкурсы, проекты и экзамены по плану, а достижения сами собираются в портфолио.",
  },
];

const PRICING_FEATURES = [
  "Персональная карта развития и gap analysis",
  "Подбор олимпиад, конкурсов, хакатонов и летних школ",
  "ИИ-наставник, который помнит твой прогресс",
  "Генератор идей для проектов и исследований",
  "Портфолио и календарь дедлайнов с напоминаниями",
  "База университетов с фильтрами по стране, major, грантам и рейтингам",
];

const FAQ = [
  {
    q: "Чем StepByStep отличается от обычного списка конкурсов?",
    a: "Мы не выдаём сотни мероприятий подряд. Платформа знает твои интересы, уровень и цель, поэтому подбирает только то, что двигает тебя к конкретному университету, и объясняет зачем.",
  },
  {
    q: "С какого класса имеет смысл начинать?",
    a: "Чем раньше, тем лучше: с 8–9 класса можно спокойно выстроить сильное портфолио. Но и в 11 классе платформа поможет расставить приоритеты и не упустить дедлайны.",
  },
  {
    q: "Какой ИИ используется?",
    a: "Современные языковые модели (Claude / ChatGPT) с доступом к нашей базе возможностей и университетов, поэтому ответы опираются на реальные данные и дедлайны.",
  },
  {
    q: "Можно ли отменить подписку?",
    a: "Да, в любой момент. Доступ сохранится до конца оплаченного месяца.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_65%)]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs uppercase tracking-wider text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              ИИ-платформа для поступления за рубеж
            </span>

            <div className="mx-auto mt-10 flex h-40 max-w-xl items-end justify-center gap-2 sm:h-52 sm:gap-3">
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
              Поступи в университет мечты — шаг за шагом
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              ИИ строит твою персональную карту развития: подбирает возможности, показывает, чего не хватает для
              выбранных университетов, и ведёт до поступления.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/onboarding"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              >
                Начать бесплатно →
              </Link>
              <Link
                href="#platform"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50"
              >
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
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-display text-sm font-bold">
                    {i + 1}
                  </span>
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

        {/* Генератор проектов + сообщество */}
        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:col-span-3">
            <p className="font-mono text-xs uppercase tracking-wider text-blue-600">— Генератор проектов</p>
            <h3 className="mt-3 font-display text-2xl font-bold text-slate-950">Не собирай сертификаты — прокачивай одну тему</h3>
            <p className="mt-3 text-slate-600">
              Выбери направления, например физику, программирование и экологию, и ИИ предложит проекты: от простого к
              сложному, а затем к настоящему исследованию.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {["Простой проект", "→", "Сложный проект", "→", "Исследование", "→", "Публикация / конкурс"].map((s, i) =>
                s === "→" ? (
                  <span key={i} className="text-slate-400">→</span>
                ) : (
                  <span key={i} className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-3xl bg-blue-600 p-8 text-white md:col-span-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-blue-200">— Сообщество</p>
              <p className="mt-4 font-display text-5xl font-bold">2 215</p>
              <p className="mt-2 text-blue-100">
                школьников уже читают наш Telegram-канал StepByStep с возможностями для портфолио
              </p>
            </div>
          </div>
        </section>

        {/* Тариф */}
        <section id="pricing" className="scroll-mt-16 bg-slate-100/70 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-bold text-slate-950 sm:text-4xl">Один тариф — всё включено</h2>
            <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
              <p className="font-mono text-xs uppercase tracking-wider text-blue-600">Подписка</p>
              <p className="mt-3 font-display text-5xl font-bold text-slate-950">
                9 990 ₸<span className="text-lg font-medium text-slate-500"> / месяц</span>
              </p>
              <ul className="mt-6 grid gap-3">
                {PRICING_FEATURES.map((f) => (
                  <li key={f} className="flex gap-3 text-slate-700">
                    <span className="mt-0.5 text-blue-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-8 block rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
              >
                Начать
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-16 mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold text-slate-950 sm:text-4xl">Частые вопросы</h2>
          <div className="mt-10 grid gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900">
                  {f.q}
                  <span className="text-xl text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} StepByStep</p>
        </div>
      </footer>
    </>
  );
}
