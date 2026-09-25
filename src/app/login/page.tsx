"use client";

import { MailCheck } from "lucide-react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import Header from "@/components/site/Header";
import { authErrorText, enabledProviders, supabase, supabaseConfigured, type OAuthProvider } from "@/lib/supabase";
import { useAuth, usePlatform } from "@/lib/store";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type Mode = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4a10.6 10.6 0 0 0 1.4-2.8 4.3 4.3 0 0 1-2.1-4.2ZM13.9 5a4.4 4.4 0 0 0 1-3.2 4.5 4.5 0 0 0-2.9 1.5 4.2 4.2 0 0 0-1.1 3.1c1.1 0 2.2-.6 3-1.4Z" />
    </svg>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const state = usePlatform();
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<"" | "confirm" | "reset">("");
  const [providers, setProviders] = useState<Record<OAuthProvider, boolean>>({ google: false, apple: false });

  useEffect(() => {
    enabledProviders().then(setProviders);
  }, []);

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

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const oauth = async (provider: OAuthProvider) => {
    setError("");
    const next = params.get("next");
    const { error } = await supabase()!.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/login${next ? `?next=${encodeURIComponent(next)}` : ""}` },
    });
    if (error) setError(authErrorText(error.message));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const sb = supabase()!;
    setBusy(true);
    setError("");
    if (mode === "forgot") {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
      setBusy(false);
      if (error) return setError(authErrorText(error.message));
      return setSent("reset");
    }
    const { data, error } =
      mode === "signup"
        ? await sb.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } })
        : await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(authErrorText(error.message));
    // Если в Supabase включено подтверждение почты, сессии ещё нет — ждём письма.
    if (mode === "signup" && !data.session) setSent("confirm");
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-blue-600" strokeWidth={1.6} />
        <h1 className="mt-3 font-display text-xl font-bold text-slate-950">Проверь почту</h1>
        <p className="mt-2 text-slate-600">
          {sent === "reset" ? (
            <>
              Если аккаунт с адресом <b>{email}</b> существует, мы отправили письмо со ссылкой для нового пароля. Письмо может попасть в «Спам».
            </>
          ) : (
            <>
              Мы отправили письмо на <b>{email}</b>. Перейди по ссылке из него, чтобы подтвердить аккаунт, и затем войди.
            </>
          )}
        </p>
        <button type="button" onClick={() => (setSent(""), switchMode("login"))} className="mt-6 text-sm font-semibold text-blue-700">
          Ко входу
        </button>
      </div>
    );
  }

  const showOAuth = mode !== "forgot" && (providers.google || providers.apple);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      {mode === "forgot" ? (
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-slate-950">Восстановление пароля</h2>
          <p className="mt-1 text-sm text-slate-600">Укажи почту аккаунта — пришлём ссылку для нового пароля.</p>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-lg py-2 font-medium ${mode === m ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              {m === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>
      )}

      {showOAuth && (
        <>
          <div className="grid gap-2">
            {providers.google && (
              <button
                type="button"
                onClick={() => oauth("google")}
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                <GoogleIcon /> Продолжить с Google
              </button>
            )}
            {providers.apple && (
              <button
                type="button"
                onClick={() => oauth("apple")}
                className="flex items-center justify-center gap-3 rounded-xl bg-black py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <AppleIcon /> Продолжить с Apple
              </button>
            )}
          </div>
          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            или по почте
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

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
        {mode !== "forgot" && (
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            <span className="flex items-center justify-between">
              Пароль
              {mode === "login" && (
                <button type="button" onClick={() => switchMode("forgot")} className="text-xs font-medium text-blue-700 hover:underline">
                  Забыли пароль?
                </button>
              )}
            </span>
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
        )}
        {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <button type="submit" disabled={busy} className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Подождите…" : mode === "login" ? "Войти" : mode === "signup" ? "Создать аккаунт" : "Отправить ссылку"}
        </button>
      </form>

      {mode === "forgot" && (
        <button type="button" onClick={() => switchMode("login")} className="mt-4 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Назад ко входу
        </button>
      )}
      {mode === "signup" && (
        <p className="mt-4 text-center text-xs text-slate-500">
          Создавая аккаунт, ты соглашаешься с{" "}
          <Link href="/terms" className="underline">
            условиями
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
      )}
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
