"use client";

import { LANGS, LANG_LABEL } from "@/lib/i18n";
import { useLang, useSetLang } from "@/lib/i18n/client";

// Переключатель языка KZ · RU · EN в шапке.
export default function LangSwitch() {
  const lang = useLang();
  const [setLang, pending] = useSetLang();
  return (
    <div className={`flex items-center rounded-full bg-white/5 p-0.5 text-[11px] font-semibold tracking-wide sm:text-xs ${pending ? "opacity-60" : ""}`} role="group" aria-label="Язык / Тіл / Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== lang && setLang(l)}
          aria-pressed={l === lang}
          className={`rounded-full px-2 py-1 transition sm:px-2.5 ${l === lang ? "bg-white text-[#060a16]" : "text-slate-400 hover:text-white"}`}
        >
          {LANG_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
