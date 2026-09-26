"use client";

import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import { useAuth } from "@/lib/store";
import { CabinetLink } from "./CabinetLoader";

// Кнопки в шапке: гость видит «Войти» и «Регистрация», вошедший — «Мой кабинет».
export default function AuthButtons() {
  const t = useT();
  const auth = useAuth();
  const signedIn = auth.status === "signed-in" || auth.status === "guest";
  if (signedIn)
    return (
      <CabinetLink className="flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#060a16] transition hover:bg-slate-100 sm:px-5">
        {t.auth.cabinet} <ArrowRight className="h-4 w-4" />
      </CabinetLink>
    );
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link href="/login" className="flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4">
        <LogIn className="hidden h-4 w-4 sm:block" /> {t.auth.login}
      </Link>
      <Link href="/login?mode=signup" className="hidden rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#060a16] transition hover:bg-slate-100 sm:block sm:px-5">
        {t.auth.signup}
      </Link>
    </div>
  );
}
