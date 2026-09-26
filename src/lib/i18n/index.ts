import en from "./en";
import kz from "./kz";
import ru, { type Dict, type FaqBlock } from "./ru";

export const LANGS = ["kz", "ru", "en"] as const;
export type Lang = (typeof LANGS)[number];
export type { Dict, FaqBlock };

export const LANG_COOKIE = "lang";
export const DEFAULT_LANG: Lang = "ru";
export const LANG_LABEL: Record<Lang, string> = { kz: "KZ", ru: "RU", en: "EN" };
// Для <html lang>: у казахского ISO-код kk
export const HTML_LANG: Record<Lang, string> = { kz: "kk", ru: "ru", en: "en" };

const DICTS: Record<Lang, Dict> = { kz, ru, en };

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);
export const getDict = (lang: Lang) => DICTS[lang];
