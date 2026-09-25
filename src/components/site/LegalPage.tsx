import type { ReactNode } from "react";
import Header from "./Header";
import { SITE } from "@/lib/site";

export function Contact() {
  return SITE.contactEmail ? (
    <a href={`mailto:${SITE.contactEmail}`} className="text-blue-700 underline">
      {SITE.contactEmail}
    </a>
  ) : (
    <span>через Telegram-канал StepByStep</span>
  );
}

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Обновлено: {SITE.updatedAt}</p>
        <div className="mt-8 grid gap-6 leading-relaxed text-slate-700 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1">
          {children}
        </div>
      </main>
    </>
  );
}
