"use client";

import { LANGS, LANG_LABEL } from "@/lib/i18n";
import { useLang, useSetLang } from "@/lib/i18n/client";

// Переключатель языка KZ · RU · EN в шапке.
// variant="site" — для тёмной шапки главной, "cabinet" — для кабинета (обе темы).
export default function LangSwitch({ variant = "site" }: { variant?: "site" | "cabinet" }) {
  const cabinet = variant === "cabinet";
  const lang = useLang();
  const [setLang, pending] = useSetLang();
  return (
    <div className={`flex items-center rounded-full p-0.5 ${cabinet ? "bg-slate-100" : "bg-white/5"} text-[11px] font-semibold tracking-wide sm:text-xs ${pending ? "opacity-60" : ""}`} role="group" aria-label="Язык / Тіл / Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== lang && setLang(l)}
          aria-pressed={l === lang}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${
            cabinet
              ? l === lang
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
              : l === lang
                ? "bg-white text-[#060a16]"
                : "text-slate-400 hover:text-white"
          }`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
