"use client";

import { BarChart3, CalendarDays, Compass, FolderOpen, GraduationCap, Menu, MessageCircle, Target, UserRound } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/site/Logo";
import { signOut, useAuth } from "@/lib/store";

export const NAV = [
  { href: "/dashboard", label: "Карта развития", short: "Карта", icon: Compass },
  { href: "/opportunities", label: "Возможности", short: "Возможности", icon: Target },
  { href: "/universities", label: "Университеты", short: "Вузы", icon: GraduationCap },
  { href: "/mentor", label: "ИИ-наставник", short: "Наставник", icon: MessageCircle },
  { href: "/gap", label: "Gap analysis", short: "Gap analysis", icon: BarChart3 },
  { href: "/portfolio", label: "Портфолио", short: "Портфолио", icon: FolderOpen },
  { href: "/calendar", label: "Дедлайны", short: "Дедлайны", icon: CalendarDays },
  { href: "/onboarding", label: "Мой профиль", short: "Профиль", icon: UserRound },
];

// На телефоне внизу — 4 главных раздела и «Ещё» с остальными.
const MOBILE_MAIN = NAV.slice(0, 4);
const MOBILE_MORE = NAV.slice(4);

function Account() {
  const auth = useAuth();
  if (auth.status !== "signed-in") return null;
  const name = (auth.user.user_metadata?.full_name as string | undefined) || auth.user.email;
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
      <span className="min-w-0 truncate text-slate-700" title={auth.user.email}>
        {name}
      </span>
      <button type="button" onClick={() => signOut()} className="shrink-0 text-xs font-medium text-slate-500 hover:text-rose-600">
        Выйти
      </button>
    </div>
  );
}

export default function Sidebar() {
  const path = usePathname();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <Logo tone="light" className="h-11 w-auto" />
        <nav className="mt-8 grid gap-1">
          {NAV.map((n) => {
            const active = path === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  active ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <n.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-3">
          <Account />
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Бета-версия: данные о возможностях и вузах демонстрационные.
          </p>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <Logo tone="light" className="h-9 w-auto" />
        <div className="max-w-[60%]">
          <Account />
        </div>
      </div>
      <MobileNav path={path} />
    </>
  );
}

function MobileNav({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const moreActive = MOBILE_MORE.some((n) => n.href === path);
  const item = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "font-semibold text-blue-700" : "text-slate-500"}`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {MOBILE_MORE.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${path === n.href ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700"}`}
              >
                <n.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE_MAIN.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={item(path === n.href)}>
            <n.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            {n.short}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen((v) => !v)} className={item(open || moreActive)} aria-expanded={open}>
          <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          Ещё
        </button>
      </nav>
    </>
  );
}
