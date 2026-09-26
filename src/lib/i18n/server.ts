import { cookies } from "next/headers";
import { THEME_COOKIE, isTheme, type Theme } from "@/lib/theme-config";
import { DEFAULT_LANG, LANG_COOKIE, getDict, isLang, type Lang } from ".";

// Язык выбирается переключателем в шапке и хранится в cookie, чтобы сервер сразу отдавал нужный текст.
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}

export async function getT() {
  return getDict(await getLang());
}

export async function getTheme(): Promise<Theme> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(v) ? v : "dark";
}
