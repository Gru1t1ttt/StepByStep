"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import AuthButtons from "./AuthButtons";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";

// Плавающее меню-«капсула» на тёмном стекле — одинаковое на всех страницах сайта.
export default function Header() {
  const t = useT();
  const nav = [
    { href: "/#platform", label: t.nav.platform },
    { href: "/#how", label: t.nav.how },
    { href: "/#pricing", label: t.nav.pricing },
    { href: "/#faq", label: t.nav.faq },
  ];
  return (
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 rounded-full border border-white/15 bg-[#0a0f1f]/75 pl-4 pr-2 shadow-lg shadow-black/20 backdrop-blur-xl sm:h-16 sm:gap-4 sm:pl-7">
        <Logo tone="light" className="h-7 w-auto sm:h-9" />
        <nav className="hidden items-center gap-6 text-[15px] text-slate-300 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap transition hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <LangSwitch />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
