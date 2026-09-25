"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Header from "@/components/site/Header";
import { useAuth } from "@/lib/store";
import { authErrorText, supabase } from "@/lib/supabase";

// Сюда ведёт ссылка из письма «Восстановление пароля». Supabase сам обменивает код
// из адреса на временную сессию, после чего можно задать новый пароль.
export default function ResetPasswordPage() {
  const auth = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== repeat) return setError("Пароли не совпадают.");
    setBusy(true);
    setError("");
    const { error } = await supabase()!.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(authErrorText(error.message));
    router.replace("/dashboard");
  };

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="mb-8 text-center font-display text-3xl font-bold tracking-tight text-slate-950">Новый пароль</h1>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {auth.status === "loading" ? (
            <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ) : auth.status !== "signed-in" ? (
            <div className="text-center">
              <p className="text-slate-600">Ссылка недействительна или устарела. Запроси новую.</p>
              <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-blue-700">
                Ко входу
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <p className="text-sm text-slate-600">
                Аккаунт: <b>{auth.user.email}</b>
              </p>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Новый пароль" minLength={6} required className={input} autoComplete="new-password" />
              <input type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} placeholder="Повтори пароль" minLength={6} required className={input} autoComplete="new-password" />
              {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
              <button type="submit" disabled={busy} className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {busy ? "Сохраняю…" : "Сохранить пароль"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
