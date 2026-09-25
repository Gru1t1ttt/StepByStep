"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase в браузере: вход/регистрация и сохранение данных ученика (таблица user_state).
// Ключ публичный (anon / publishable) — доступ ограничен политиками Row Level Security:
// каждый пользователь видит и меняет только свою строку.
//
// Если переменные не заданы (локально без Supabase), платформа работает в гостевом режиме:
// данные хранятся только в браузере.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  // PKCE — безопасный вариант для входа через Google/Apple и ссылок восстановления пароля.
  client ??= createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "sbs-auth", flowType: "pkce" } });
  return client;
}

// Сообщения Supabase Auth → понятный русский текст.
export function authErrorText(message: string) {
  if (/invalid login credentials/i.test(message)) return "Неверная почта или пароль.";
  if (/already registered|already exists/i.test(message)) return "Аккаунт с такой почтой уже есть — войдите.";
  if (/email not confirmed/i.test(message)) return "Почта не подтверждена — откройте письмо от Supabase и перейдите по ссылке.";
  if (/password should be at least|weak password/i.test(message)) return "Пароль слишком простой: минимум 6 символов.";
  if (/rate limit|too many/i.test(message)) return "Слишком много попыток. Подождите пару минут.";
  if (/invalid email|unable to validate email|email address .* is invalid/i.test(message)) return "Проверьте адрес почты.";
  if (/not authorized|error sending/i.test(message)) return "Не получилось отправить письмо — отправка писем ещё настраивается. Напишите нам, и мы поможем.";
  if (/provider is not enabled/i.test(message)) return "Этот способ входа пока не включён.";
  return message;
}

export type OAuthProvider = "google" | "apple";

// Какие способы входа включены в Supabase (Authentication → Sign In / Providers).
// Кнопки Google/Apple показываются, только когда провайдер включён.
export async function enabledProviders(): Promise<Record<OAuthProvider, boolean>> {
  const none = { google: false, apple: false };
  if (!supabaseConfigured) return none;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key! } });
    const { external } = (await res.json()) as { external: Record<string, boolean> };
    return { google: !!external.google, apple: !!external.apple };
  } catch {
    return none;
  }
}
