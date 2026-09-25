"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/site/Logo";
import { signOut, useAuth } from "@/lib/store";

export const NAV = [
  { href: "/dashboard", label: "Карта развития", icon: "🧭" },
  { href: "/opportunities", label: "Возможности", icon: "🎯" },
  { href: "/universities", label: "Университеты", icon: "🎓" },
  { href: "/gap", label: "Gap analysis", icon: "📊" },
  { href: "/mentor", label: "ИИ-наставник", icon: "💬" },
  { href: "/portfolio", label: "Портфолио", icon: "📁" },
  { href: "/calendar", label: "Дедлайны", icon: "📅" },
  { href: "/onboarding", label: "Мой профиль", icon: "👤" },
];

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
        <Logo className="h-11 w-auto" />
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
                <span aria-hidden>{n.icon}</span>
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

      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <Logo className="h-9 w-auto" />
          <div className="max-w-[60%]">
            <Account />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${
                path === n.href ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600"
              }`}
            >
              {n.icon} {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
