"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { THEME_COOKIE, type Theme } from "./theme-config";

// Тема сайта: тёмная (по умолчанию) или светлая. Хранится в cookie, чтобы сервер сразу
// отдавал страницу в нужной теме и не было вспышки; на <html> — атрибут data-theme.


const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ initial, children }: { initial: Theme; children: ReactNode }) {
  const [theme, set] = useState<Theme>(initial);
  const setTheme = useCallback((t: Theme) => {
    set(t);
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
    document.cookie = `${THEME_COOKIE}=${t}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Кнопка «солнце / луна». className — внешний вид под место, где стоит кнопка.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? "Светлая тема" : "Тёмная тема";
  return (
    <button type="button" onClick={() => setTheme(next)} aria-label={label} title={label} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${className}`}>
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
