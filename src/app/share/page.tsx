"use client";

import { HeartHandshake } from "lucide-react";

import { useState, type FormEvent } from "react";
import Header from "@/components/site/Header";
import { OUTCOME_LABELS, type Outcome } from "@/lib/rag/types";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const empty = {
  university: "",
  country: "",
  year: "",
  outcome: "" as Outcome,
  major: "",
  school: "",
  profile: "",
  story: "",
  whatWorked: "",
  mistakes: "",
  advice: "",
  contact: "",
  consent: false,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export default function SharePage() {
  const [f, setF] = useState(empty);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/experience", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (res.ok) {
      setState("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError((await res.json().catch(() => ({}))).error ?? "Не удалось отправить. Попробуй ещё раз.");
      setState("idle");
    }
  };

  return (
    <>
      <Header />
      <main className="cabinet mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        {state === "done" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-blue-600" strokeWidth={1.6} />
            <h1 className="mt-3 font-display text-2xl font-bold text-slate-950">Спасибо!</h1>
            <p className="mt-2 text-slate-600">
              Твоя история поможет сотням школьников. После проверки командой она станет частью базы знаний ИИ-наставника Unilight.
            </p>
            <button type="button" onClick={() => (setF(empty), setState("idle"))} className="mt-6 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Рассказать ещё про один вуз
            </button>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-wider text-blue-600">— Для поступивших</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Расскажи, как ты поступал(а)</h1>
            <p className="mt-3 text-slate-600">
              Школьникам больше всего нужен честный опыт: что реально сработало, какие были ошибки, сколько на самом деле пришлось работать. Отказы тоже очень ценны: они
              показывают реальную картину. ИИ-наставник Unilight будет опираться на такие истории, отвечая ученикам.
            </p>

            <form onSubmit={submit} className="mt-8 grid gap-6">
              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <h2 className="font-display text-lg font-bold text-slate-950">Куда подавал(а)</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Университет *">
                    <input value={f.university} onChange={set("university")} placeholder="Yale University" className={input} required />
                  </Field>
                  <Field label="Страна">
                    <input value={f.country} onChange={set("country")} placeholder="США" className={input} />
                  </Field>
                  <Field label="Год подачи">
                    <input value={f.year} onChange={set("year")} placeholder="2025" inputMode="numeric" className={input} />
                  </Field>
                  <Field label="Результат">
                    <select value={f.outcome} onChange={set("outcome")} className={input}>
                      <option value="">Выбери…</option>
                      {Object.entries(OUTCOME_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Направление">
                    <input value={f.major} onChange={set("major")} placeholder="Computer Science" className={input} />
                  </Field>
                  <Field label="Школа">
                    <input value={f.school} onChange={set("school")} placeholder="НИШ, РФМШ, обычная школа…" className={input} />
                  </Field>
                </div>
                <Field label="Твой профиль на момент подачи" hint="GPA, экзамены (IELTS, SAT), главные олимпиады и активности">
                  <textarea value={f.profile} onChange={set("profile")} rows={2} placeholder="GPA 4.8/5, IELTS 7.5, SAT 1480, призёр республиканской олимпиады по физике…" className={input} />
                </Field>
              </section>

              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <h2 className="font-display text-lg font-bold text-slate-950">Твоя история</h2>
                <Field label="Как всё было? *" hint="С какого класса начал(а) готовиться, что делал(а), сколько времени и сил это заняло. Минимум 100 символов.">
                  <textarea value={f.story} onChange={set("story")} rows={7} className={input} required minLength={100} />
                </Field>
                <Field label="Что, по-твоему, сработало больше всего?">
                  <textarea value={f.whatWorked} onChange={set("whatWorked")} rows={3} className={input} />
                </Field>
                <Field label="Какие были ошибки? Что сделал(а) бы иначе?">
                  <textarea value={f.mistakes} onChange={set("mistakes")} rows={3} className={input} />
                </Field>
                <Field label="Совет школьникам, которые хотят туда же">
                  <textarea value={f.advice} onChange={set("advice")} rows={3} className={input} />
                </Field>
              </section>

              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <Field label="Контакт для уточнений (необязательно)" hint="Telegram или почта. Видит только команда, в ответах ИИ не показывается.">
                  <input value={f.contact} onChange={set("contact")} placeholder="@username" className={input} />
                </Field>
                <label className="flex items-start gap-3 text-sm text-slate-700">
                  <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-1" required />
                  <span>
                    Я согласен(на), что Unilight использует мою историю в обезличенном виде (без имени и контактов) для ответов ИИ-наставника и материалов для школьников.
                  </span>
                </label>
              </section>

              {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
              <button type="submit" disabled={state === "sending"} className="w-fit rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {state === "sending" ? "Отправляю…" : "Отправить историю"}
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}
