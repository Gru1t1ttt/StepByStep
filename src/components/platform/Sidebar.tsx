"use client";

import { BarChart3, CalendarDays, Compass, FolderOpen, GraduationCap, Menu, MessageCircle, Target, UserRound } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LangSwitch from "@/components/site/LangSwitch";
import Logo from "@/components/site/Logo";
import { useT } from "@/lib/i18n/client";
import { signOut, useAuth } from "@/lib/store";
import { ThemeToggle } from "@/lib/theme";

// Подписи разделов — в словарях (cabinet.nav), в том же порядке.
const NAV_ITEMS = [
  { href: "/dashboard", icon: Compass },
  { href: "/opportunities", icon: Target },
  { href: "/universities", icon: GraduationCap },
  { href: "/mentor", icon: MessageCircle },
  { href: "/gap", icon: BarChart3 },
  { href: "/portfolio", icon: FolderOpen },
  { href: "/calendar", icon: CalendarDays },
  { href: "/onboarding", icon: UserRound },
];

function useNav() {
  const t = useT().cabinet;
  return NAV_ITEMS.map((n, i) => ({ ...n, label: t.nav[i][0], short: t.nav[i][1] }));
}

// Раздел открыт, если адрес совпадает или вложен (/universities/123)
const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

// Язык и тема — сверху в кабинете
function Controls() {
  return (
    <div className="flex items-center gap-1.5">
      <LangSwitch variant="cabinet" />
      <ThemeToggle className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
    </div>
  );
}

function Account() {
  const t = useT().cabinet;
  const auth = useAuth();
  if (auth.status !== "signed-in") return null;
  const name = (auth.user.user_metadata?.full_name as string | undefined) || auth.user.email;
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
      <span className="min-w-0 truncate text-slate-700" title={auth.user.email}>
        {name}
      </span>
      <button type="button" onClick={() => signOut()} className="shrink-0 text-xs font-medium text-slate-500 hover:text-rose-600">
        {t.logout}
      </button>
    </div>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const t = useT().cabinet;
  const nav = useNav();
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <Logo tone="light" className="h-11 w-auto" />
        <div className="mt-5">
          <Controls />
        </div>
        <nav className="mt-6 grid gap-1">
          {nav.map((n) => {
            const active = isActive(path, n.href);
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
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{t.beta}</p>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur lg:hidden">
        <Logo tone="light" className="h-9 w-auto" />
        <Controls />
      </div>
      <MobileNav path={path} />
    </>
  );
}

// На телефоне внизу — 4 главных раздела и «Ещё» с остальными и аккаунтом.
function MobileNav({ path }: { path: string }) {
  const t = useT().cabinet;
  const nav = useNav();
  const MOBILE_MAIN = nav.slice(0, 4);
  const MOBILE_MORE = nav.slice(4);
  const [open, setOpen] = useState(false);
  const moreActive = MOBILE_MORE.some((n) => isActive(path, n.href));
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isActive(path, n.href) ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-700"}`}
              >
                <n.icon className="h-4.5 w-4.5" strokeWidth={1.8} aria-hidden />
                {n.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-slate-100 pt-2">
              <Account />
            </div>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {MOBILE_MAIN.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={item(isActive(path, n.href))}>
            <n.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            {n.short}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen((v) => !v)} className={item(open || moreActive)} aria-expanded={open}>
          <Menu className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          {t.more}
        </button>
      </nav>
    </>
  );
}
