import Link from "next/link";
import AuthButtons from "./AuthButtons";
import Logo from "./Logo";

const NAV = [
  { href: "/#platform", label: "Платформа" },
  { href: "/#how", label: "Как это работает" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#faq", label: "Вопросы" },
];

// Плавающее меню-«капсула» на тёмном стекле — одинаковое на всех страницах сайта.
export default function Header() {
  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/15 bg-[#0a0f1f]/75 pl-5 pr-2 shadow-lg shadow-black/20 backdrop-blur-xl sm:h-16 sm:pl-7">
        <Logo tone="light" className="h-8 w-auto sm:h-9" />
        <nav className="hidden items-center gap-8 text-[15px] text-slate-300 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="transition hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <AuthButtons />
      </div>
    </header>
  );
}
