"use client";

import type { User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import type { Profile } from "./profile";
import { supabase, supabaseConfigured } from "./supabase";

// Состояние платформы (профиль, цели, план, портфолио, чат).
//
// Компоненты читают его через usePlatform() и меняют через updateState() — синхронно,
// из локальной копии в браузере. Если пользователь вошёл в аккаунт, изменения
// с небольшой задержкой сохраняются в Supabase (таблица user_state), а при входе
// с другого устройства загружаются оттуда.

export type PortfolioItem = {
  id: string;
  kind: "Достижение" | "Проект" | "Сертификат" | "Активность" | "Исследование";
  title: string;
  description: string;
  link: string;
  date: string;
  fileName: string;
};

export type ChatSource = { n: number; title: string; kind: string; university?: string; outcome?: string; year?: number; sourceUrl?: string; demo?: boolean };
export type ChatMessage = { role: "user" | "assistant"; content: string; sources?: ChatSource[] };

export type PlatformState = {
  profile: Profile | null;
  targets: string[]; // id университетов
  savedOpportunities: string[];
  doneSteps: string[];
  doneLog?: Record<string, string>; // шаг → дата выполнения (для серии недель на дашборде)
  portfolio: PortfolioItem[];
  chat: ChatMessage[];
};

const KEY = "sbs-state";
const SAVE_DELAY_MS = 800;

const initial: PlatformState = {
  profile: null,
  targets: [],
  savedOpportunities: [],
  doneSteps: [],
  doneLog: {},
  portfolio: [],
  chat: [],
};

// ---------------------------------------------------------------- аккаунт

export type AuthState =
  | { status: "loading" }
  | { status: "guest" } // Supabase не настроен — работаем только в браузере
  | { status: "signed-out" }
  | { status: "signed-in"; user: User };

let auth: AuthState = supabaseConfigured ? { status: "loading" } : { status: "guest" };
let remoteLoaded = !supabaseConfigured;

// ---------------------------------------------------------------- локальная копия

let cache: PlatformState | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function read(): PlatformState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    cache = initial;
  }
  return cache!;
}

function writeLocal(next: PlatformState) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

// ---------------------------------------------------------------- сохранение в Supabase

let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function saveRemote() {
  const sb = supabase();
  if (!sb || auth.status !== "signed-in") return;
  const { error } = await sb.from("user_state").upsert({ user_id: auth.user.id, state: read(), updated_at: new Date().toISOString() });
  if (error) console.error("Не удалось сохранить данные в аккаунт", error);
}

function scheduleSave() {
  if (auth.status !== "signed-in" || !remoteLoaded) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveRemote, SAVE_DELAY_MS);
}

// Сохранить сразу, не дожидаясь задержки (например, перед переходом на другую страницу).
export async function flushSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = null;
  await saveRemote();
}

async function loadRemote(user: User) {
  const sb = supabase()!;
  const { data, error } = await sb.from("user_state").select("state").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("Не удалось загрузить данные аккаунта", error);
  } else if (data?.state && Object.keys(data.state).length) {
    writeLocal({ ...initial, ...(data.state as Partial<PlatformState>) });
  } else if (read().profile) {
    // Первый вход: переносим в аккаунт то, что заполнено до регистрации (например, анкету).
    await saveRemote();
  }
  remoteLoaded = true;
  notify();
}

let authStarted = false;

// Вызывается один раз при загрузке приложения (компонент AuthSync в layout).
export function startAuthSync() {
  const sb = supabase();
  if (!sb || authStarted) return;
  authStarted = true;
  sb.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    const prevId = auth.status === "signed-in" ? auth.user.id : null;
    if (user) {
      auth = { status: "signed-in", user };
      if (user.id !== prevId) {
        remoteLoaded = false;
        notify();
        // Запросы к Supabase нельзя делать прямо внутри этого колбэка — откладываем.
        setTimeout(() => loadRemote(user), 0);
        return;
      }
    } else {
      if (prevId) writeLocal(initial); // выход: не оставляем чужие данные на общем устройстве
      auth = { status: "signed-out" };
      remoteLoaded = true;
    }
    notify();
  });
}

export async function signOut() {
  await flushSave();
  await supabase()?.auth.signOut();
}

// ---------------------------------------------------------------- API для компонентов

export function updateState(patch: Partial<PlatformState> | ((s: PlatformState) => Partial<PlatformState>)) {
  const current = read();
  writeLocal({ ...current, ...(typeof patch === "function" ? patch(current) : patch) });
  notify();
  scheduleSave();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// null — ещё не готово (серверный рендер или загрузка данных аккаунта).
function readReady() {
  return remoteLoaded && auth.status !== "loading" ? read() : null;
}

export function usePlatform(): PlatformState | null {
  return useSyncExternalStore(subscribe, readReady, () => null);
}

const serverAuth: AuthState = { status: "loading" };
export function useAuth(): AuthState {
  return useSyncExternalStore(
    subscribe,
    () => auth,
    () => serverAuth,
  );
}

export function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

// Отметить шаг плана выполненным (или снять отметку) — с датой, чтобы считать серию недель.
export function toggleStep(id: string) {
  updateState((s) => {
    const log = { ...(s.doneLog ?? {}) };
    if (s.doneSteps.includes(id)) delete log[id];
    else log[id] = new Date().toISOString().slice(0, 10);
    return { doneSteps: toggleIn(s.doneSteps, id), doneLog: log };
  });
}

// Сколько недель подряд (включая текущую или прошлую) ученик отмечал шаги плана.
export function weekStreak(log: Record<string, string> = {}) {
  const week = (d: Date) => {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = (t.getUTCDay() + 6) % 7; // понедельник = 0
    t.setUTCDate(t.getUTCDate() - day);
    return t.toISOString().slice(0, 10);
  };
  const weeks = new Set(Object.values(log).map((d) => week(new Date(d))));
  const cursor = new Date();
  if (!weeks.has(week(cursor))) cursor.setDate(cursor.getDate() - 7); // эта неделя ещё не закончилась
  let n = 0;
  while (weeks.has(week(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return n;
}
