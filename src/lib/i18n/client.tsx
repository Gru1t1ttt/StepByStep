"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useTransition, type ReactNode } from "react";
import { DEFAULT_LANG, LANG_COOKIE, getDict, type Lang } from ".";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export const useT = () => getDict(useLang());

// Меняет язык: пишет cookie и перерисовывает страницу на сервере с новыми текстами.
export function useSetLang() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = useCallback(
    (lang: Lang) => {
      document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      start(() => router.refresh());
    },
    [router],
  );
  return [set, pending] as const;
}
