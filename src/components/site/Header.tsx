import Link from "next/link";
import AuthButtons from "./AuthButtons";
import Logo from "./Logo";

const NAV = [
  { href: "/#platform", label: "Платформа" },
  { href: "/#how", label: "Как это работает" },
  { href: "/#pricing", label: "Тарифы" },
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
        <AuthButtons />
      </div>
    </header>
  );
}
