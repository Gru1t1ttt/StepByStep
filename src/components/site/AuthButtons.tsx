"use client";

import Link from "next/link";
import { useAuth } from "@/lib/store";

export default function AuthButtons() {
  const auth = useAuth();
  const signedIn = auth.status === "signed-in";
  return (
    <div className="flex items-center gap-2">
      {!signedIn && auth.status !== "guest" && (
        <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block">
          Войти
        </Link>
      )}
      <Link
        href={signedIn || auth.status === "guest" ? "/dashboard" : "/login?mode=signup"}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        {signedIn ? "Мой кабинет →" : "Начать →"}
      </Link>
    </div>
  );
}
