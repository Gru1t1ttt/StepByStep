"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CabinetLink } from "@/components/site/CabinetLoader";
import { useT } from "@/lib/i18n/client";
import { useAuth } from "@/lib/store";

// Кнопки первого экрана: новичку — регистрация, вошедшему — сразу в кабинет.
export default function HeroActions() {
  const t = useT();
  const auth = useAuth();
  const signedIn = auth.status === "signed-in" || auth.status === "guest";
  const primary = "flex items-center gap-2 rounded-full bg-blue-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400";
  return (
    <div className="mt-9 flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {signedIn ? (
          <CabinetLink className={primary}>
            {t.hero.cabinet} <ArrowRight className="h-4 w-4" />
          </CabinetLink>
        ) : (
          <Link href="/login?mode=signup" className={primary}>
            {t.hero.create} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link href="#platform" className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10">
          {t.hero.see}
        </Link>
      </div>
      <p className="h-5 text-sm text-slate-500">
        {!signedIn && auth.status !== "loading" && (
          <>
            {t.hero.haveAccount}{" "}
            <Link href="/login" className="font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline">
              {t.auth.login}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
