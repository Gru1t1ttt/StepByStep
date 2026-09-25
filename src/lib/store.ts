"use client";

import { useSyncExternalStore } from "react";
import type { Profile } from "./profile";

// Всё состояние платформы пока живёт в браузере (localStorage).
// Когда появятся регистрация и база данных, этот модуль заменится запросами к серверу,
// а компоненты останутся теми же.

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
  portfolio: PortfolioItem[];
  chat: ChatMessage[];
};

const KEY = "sbs-state";

const initial: PlatformState = {
  profile: null,
  targets: [],
  savedOpportunities: [],
  doneSteps: [],
  portfolio: [],
  chat: [],
};

let cache: PlatformState | null = null;
const listeners = new Set<() => void>();

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

export function updateState(patch: Partial<PlatformState> | ((s: PlatformState) => Partial<PlatformState>)) {
  const current = read();
  const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
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

// На сервере состояния нет — отдаём null, и страницы показывают заглушку до гидрации.
export function usePlatform(): PlatformState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function toggleIn(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
