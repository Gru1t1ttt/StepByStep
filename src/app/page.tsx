import {
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
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import IntroAnimation from "@/components/landing/IntroAnimation";
import Orbit from "@/components/landing/Orbit";
import PlatformTabs from "@/components/landing/PlatformTabs";
import Header from "@/components/site/Header";
import Logo from "@/components/site/Logo";
import HeroActions from "@/components/landing/HeroActions";
import type { FaqBlock } from "@/lib/i18n";
import { getT } from "@/lib/i18n/server";
import { PLANS, SITE, formatTenge } from "@/lib/site";

// Иконки к пунктам «Как обычно» / «С Unilight» — тексты в словарях src/lib/i18n
const BEFORE_ICONS = [MessagesSquare, Bot, Globe2, FileSpreadsheet, CalendarX2];
const AFTER_ICONS = [UserRound, Sparkles, Target, BellRing, FolderOpen];

// **жирный** → <b>, [[текст]] → ссылка на политику конфиденциальности
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/).map((part, i) => {
    if (part.startsWith("**")) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith("[["))
      return (
        <Link key={i} href="/privacy" className="font-medium underline">
          {part.slice(2, -2)}
        </Link>
      );
    return part;
  });
}

function FaqAnswer({ blocks }: { blocks: FaqBlock[] }) {
  return blocks.map((b, i) =>
    typeof b === "string" ? (
      <p key={i}>{rich(b)}</p>
    ) : (
      <ul key={i}>
        {b.list.map((li) => (
          <li key={li}>{rich(li)}</li>
        ))}
      </ul>
    ),
  );
}

export default async function Home() {
  const t = await getT();
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
          <p className={eyebrow}>{t.hero.eyebrow}</p>
          <h1 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            {t.hero.title} <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">{t.hero.accent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">{t.hero.text}</p>
          <HeroActions />
          <div className="mt-2 sm:mt-6">
            <Orbit labels={t.orbit.items} center={t.orbit.center} centerText={t.orbit.centerText} />
          </div>
        </section>

        {/* Где ты / куда / что делать */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {t.pillars.map(([title, d], i) => (
              <div key={i} className={`${card} p-7`}>
                <span className="font-mono text-sm text-amber-300">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Как это работает */}
        <section id="how" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className={eyebrow}>{t.how.eyebrow}</p>
            <h2 className={`mt-3 max-w-2xl ${h2}`}>{t.how.title}</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {t.how.steps.map((s, i) => (
                <div key={i} className={`${card} p-6`}>
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
          <p className={`text-center ${eyebrow}`}>{t.platform.eyebrow}</p>
          <h2 className={`mt-3 text-center ${h2}`}>{t.platform.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">{t.platform.text}</p>
          <div className="mt-10">
            <PlatformTabs />
          </div>
        </section>

        {/* Одно место вместо десятка вкладок */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <p className={eyebrow}>{t.why.eyebrow}</p>
            <h2 className={`mx-auto mt-3 max-w-3xl ${h2}`}>{t.why.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">{t.why.text}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className={`${card} p-7`}>
              <p className="flex items-center gap-2 font-semibold text-slate-400">
                <Layers className="h-5 w-5" /> {t.why.before}
              </p>
              <ul className="mt-5 grid gap-4">
                {t.why.beforeItems.map((text, i) => {
                  const Icon = BEFORE_ICONS[i];
                  return (
                    <li key={text} className="flex gap-3 text-slate-400">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-500">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </span>
                      <span className="pt-1.5">{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-3xl border border-amber-300/25 bg-[linear-gradient(145deg,rgba(59,108,255,0.18),rgba(251,191,36,0.08))] p-7 shadow-[0_0_60px_rgba(251,191,36,0.08)]">
              <p className="flex items-center gap-2 font-semibold text-white">
                <Compass className="h-5 w-5 text-amber-300" /> {t.why.after}
              </p>
              <ul className="mt-5 grid gap-4">
                {t.why.afterItems.map((text, i) => {
                  const Icon = AFTER_ICONS[i];
                  return (
                    <li key={text} className="flex gap-3 text-slate-200">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                      </span>
                      <span className="pt-1.5">{text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* Тарифы */}
        <section id="pricing" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className={`text-center ${eyebrow}`}>{t.pricing.eyebrow}</p>
            <h2 className={`mt-3 text-center ${h2}`}>{t.pricing.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">{t.pricing.text}</p>

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
                      {t.pricing.recommended}
                    </span>
                  )}
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t.pricing.plans[p.id].label}</p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-4xl font-bold text-white">{formatTenge(p.price)}</span>
                    {p.compareAt && <span className="text-lg text-slate-500 line-through">{formatTenge(p.compareAt)}</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{t.pricing.plans[p.id].note}</p>

                  <div className="my-6 border-t border-white/10" />

                  <p className="font-display text-3xl font-bold text-amber-300">
                    {formatTenge(Math.round(p.price / p.days))}
                    <span className="ml-1 text-base font-medium text-slate-400">{t.pricing.perDay}</span>
                  </p>
                  {p.compareAt ? (
                    <span className="mt-2 w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      {t.pricing.save} {Math.round((1 - p.price / p.compareAt) * 100)}%
                    </span>
                  ) : (
                    <span className="mt-2 text-sm text-slate-500">{t.pricing.tryAll}</span>
                  )}

                  <Link
                    href="/login?mode=signup"
                    className={`mt-8 block rounded-full py-3 text-center font-semibold transition ${
                      p.recommended ? "bg-blue-500 text-white hover:bg-blue-400" : "border border-white/15 text-white hover:bg-white/5"
                    }`}
                  >
                    {t.pricing.choose}
                  </Link>
                </div>
              ))}
            </div>

            <div className={`mx-auto mt-10 max-w-4xl ${card} p-7`}>
              <p className="font-semibold text-white">{t.pricing.includes}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {t.pricing.features.map((f) => (
                  <li key={f} className="flex gap-3 text-slate-300">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-center text-sm text-slate-500">{t.pricing.note}</p>
          </div>
        </section>

        {/* Для поступивших */}
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-[linear-gradient(120deg,rgba(251,191,36,0.10),rgba(59,108,255,0.12))] p-8 sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className={eyebrow}>{t.alumni.eyebrow}</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{t.alumni.title}</h2>
              <p className="mt-3 text-slate-400">{t.alumni.text}</p>
            </div>
            <Link href="/share" className="shrink-0 rounded-full bg-white px-6 py-3 font-semibold text-[#060a16] transition hover:bg-slate-100">
              {t.alumni.cta}
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <BookOpenCheck className="mx-auto h-8 w-8 text-amber-300" strokeWidth={1.6} />
            <h2 className={`mt-3 ${h2}`}>{t.faq.title}</h2>
            <p className="mt-3 text-slate-400">{t.faq.text}</p>
          </div>
          <div className="mt-10 grid gap-3">
            {t.faq.items.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition open:border-white/20 open:bg-white/[0.05]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                  {f.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-3 leading-relaxed text-slate-400 [&_a]:text-amber-300 [&_b]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-2">
                  <FaqAnswer blocks={f.a} />
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
            <p className="mt-3 max-w-xs">{t.footer.about}</p>
          </div>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-white">{t.footer.platform}</p>
            <Link href="/login?mode=signup" className="hover:text-white">
              {t.auth.signup}
            </Link>
            <Link href="/login" className="hover:text-white">
              {t.auth.login}
            </Link>
            <Link href="/#pricing" className="hover:text-white">
              {t.nav.pricing}
            </Link>
          </nav>
          <nav className="grid content-start gap-2">
            <p className="font-semibold text-white">Unilight</p>
            <Link href="/share" className="hover:text-white">
              {t.footer.share}
            </Link>
            <Link href="/#faq" className="hover:text-white">
              {t.nav.faq}
            </Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/5 py-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>
          <Link href="/privacy" className="hover:text-slate-300">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="hover:text-slate-300">
            {t.footer.terms}
          </Link>
        </div>
      </footer>
    </div>
  );
}
