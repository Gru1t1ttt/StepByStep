"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import Header from "@/components/site/Header";
import { authErrorText, supabase, supabaseConfigured } from "@/lib/supabase";
import { useAuth, usePlatform } from "@/lib/store";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const state = usePlatform();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  // После входа — туда, откуда пришли; без анкеты — сначала анкета.
  useEffect(() => {
    if (auth.status !== "signed-in" || !state) return;
    const next = params.get("next");
    router.replace(next && next.startsWith("/") ? next : state.profile ? "/dashboard" : "/onboarding");
  }, [auth.status, state, params, router]);

  if (!supabaseConfigured) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Аккаунты ещё не подключены (нет настроек Supabase). Платформа работает в гостевом режиме —{" "}
        <Link href="/dashboard" className="font-semibold underline">
          перейти в кабинет
        </Link>
        .
      </p>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const sb = supabase()!;
    setBusy(true);
    setError("");
    const { data, error } =
      mode === "signup"
        ? await sb.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } })
        : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(authErrorText(error.message));
    // Если в Supabase включено подтверждение почты, сессии ещё нет — ждём письма.
    if (mode === "signup" && !data.session) setCheckEmail(true);
  };

  if (checkEmail) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-4xl">📬</p>
        <h1 className="mt-3 font-display text-xl font-bold text-slate-950">Проверь почту</h1>
        <p className="mt-2 text-slate-600">
          Мы отправили письмо на <b>{email}</b>. Перейди по ссылке из него, чтобы подтвердить аккаунт, и затем войди.
        </p>
        <button type="button" onClick={() => (setCheckEmail(false), setMode("login"))} className="mt-6 text-sm font-semibold text-blue-700">
          Ко входу
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => (setMode(m), setError(""))}
            className={`rounded-lg py-2 font-medium ${mode === m ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
          >
            {m === "login" ? "Вход" : "Регистрация"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {mode === "signup" && (
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Имя
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как к тебе обращаться" className={input} autoComplete="name" />
          </label>
        )}
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Почта
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} autoComplete="email" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={input}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Подождите…" : mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </form>
      {mode === "signup" && state?.profile && (
        <p className="mt-4 text-center text-xs text-slate-500">Анкета, которую ты уже заполнил(а), сохранится в аккаунте.</p>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md px-4 py-12">
        <h1 className="mb-2 text-center font-display text-3xl font-bold tracking-tight text-slate-950">Добро пожаловать</h1>
        <p className="mb-8 text-center text-slate-600">Аккаунт хранит твой профиль, план и портфолио — на любом устройстве.</p>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-100" />}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
