import Link from "next/link";
import Logo from "./Logo";

const NAV = [
  { href: "/#platform", label: "Платформа" },
  { href: "/#how", label: "Как это работает" },
  { href: "/#pricing", label: "Тариф" },
  { href: "/#faq", label: "Вопросы" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-slate-900">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block">
            Войти
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Начать →
          </Link>
        </div>
      </div>
    </header>
  );
}
