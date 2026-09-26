"use client";

import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/store";

export default function AuthButtons() {
  const auth = useAuth();
  const signedIn = auth.status === "signed-in" || auth.status === "guest";
  return signedIn ? (
    <Link href="/dashboard" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 sm:px-5">
      Мой кабинет <ArrowRight className="h-4 w-4" />
    </Link>
  ) : (
    <Link href="/login" className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15 sm:px-5">
      <LogIn className="h-4 w-4" /> Войти
    </Link>
  );
}
