// Общее для сервера и браузера: тема сайта и cookie, где хранится выбор.
export type Theme = "dark" | "light";
export const THEME_COOKIE = "theme";
export const isTheme = (v: unknown): v is Theme => v === "dark" || v === "light";
