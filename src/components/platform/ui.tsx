"use client";

import { Hand, Lock } from "lucide-react";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Profile } from "@/lib/profile";
import type { Catalog } from "@/lib/analysis";
import { useCatalog } from "@/lib/catalog";
import { useLang, useT } from "@/lib/i18n/client";
import { useAuth, usePlatform, type PlatformState } from "@/lib/store";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  const lang = useLang();
  const t = useT().cabinet;
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-slate-600">{subtitle}</p>}
        {lang !== "ru" && <p className="mt-1 text-xs text-slate-400">{t.note}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "", padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  // Фон и отступы по умолчанию — только если их не задали снаружи, иначе классы Tailwind конфликтуют.
  const bg = /(^|\s)bg-/.test(className) ? "" : "bg-white";
  const pad = padded && !/(^|\s)p-\d/.test(className) ? "p-5" : "";
  return <div className={`rounded-2xl border border-slate-200 ${bg} ${pad} ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "blue" | "green" | "amber" | "rose" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const buttonClass =
  "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";
export const ghostButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

// Показывает страницу только вошедшему пользователю с заполненным профилем.
export function WithProfile({ children }: { children: (profile: Profile, state: PlatformState, catalog: Catalog) => ReactNode }) {
  const t = useT();
  const auth = useAuth();
  const state = usePlatform();
  const catalog = useCatalog();
  if (auth.status === "signed-out")
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <Lock className="mx-auto h-9 w-9 text-slate-400" strokeWidth={1.6} />
        <h2 className="mt-3 font-display text-xl font-bold text-slate-950">{t.cabinet.gate.loginTitle}</h2>
        <p className="mt-2 text-slate-600">{t.cabinet.gate.loginText}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/login" className={ghostButtonClass}>
            {t.auth.login}
          </Link>
          <Link href="/login?mode=signup" className={buttonClass}>
            {t.hero.create}
          </Link>
        </div>
      </Card>
    );
  if (!state || !catalog) return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
  if (!state.profile)
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <Hand className="mx-auto h-9 w-9 text-slate-400" strokeWidth={1.6} />
        <h2 className="mt-3 font-display text-xl font-bold text-slate-950">{t.cabinet.gate.profileTitle}</h2>
        <p className="mt-2 text-slate-600">{t.cabinet.gate.profileText}</p>
        <Link href="/onboarding" className={`${buttonClass} mt-6`}>
          {t.cabinet.gate.fillProfile}
        </Link>
      </Card>
    );
  return <>{children(state.profile, state, catalog)}</>;
}
