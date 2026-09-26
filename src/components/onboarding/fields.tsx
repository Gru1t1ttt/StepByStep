"use client";

import { X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useLang, useT } from "@/lib/i18n/client";
import { tv } from "@/lib/i18n/values";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function Section({
  id,
  number,
  title,
  hint,
  children,
}: {
  id: string;
  number: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
        </div>
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

// group — для полей с несколькими кнопками внутри (Chips, списки): <label> вокруг них
// переключал бы первую кнопку при клике по заголовку.
export function Field({
  label,
  hint,
  required,
  group,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  group?: boolean;
  children: ReactNode;
}) {
  const Wrapper = group ? "div" : "label";
  return (
    <Wrapper className="block" {...(group && { role: "group", "aria-label": label })}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </Wrapper>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputClass} resize-y`} />;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const lang = useLang();
  const choose = useT().app.onb.choose;
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">{placeholder ?? choose}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {tv(o, lang)}
        </option>
      ))}
    </select>
  );
}

// Выбор нескольких вариантов «таблетками» + возможность добавить свой вариант.
export function Chips({
  options,
  value,
  onChange,
  allowCustom = true,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  allowCustom?: boolean;
}) {
  const [custom, setCustom] = useState("");
  const lang = useLang();
  const t = useT().app;
  const all = [...options, ...value.filter((v) => !options.includes(v))];

  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item]);

  const addCustom = () => {
    const item = custom.trim();
    if (item && !value.includes(item)) onChange([...value, item]);
    setCustom("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((item) => {
          const active = value.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
              }`}
            >
              {tv(item, lang)}
            </button>
          );
        })}
      </div>
      {allowCustom && (
        <div className="mt-2 flex max-w-sm gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder={t.onb.custom}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustom}
            className="shrink-0 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            {t.common.add}
          </button>
        </div>
      )}
    </div>
  );
}

// Повторяющийся список карточек (достижения, активности, экзамены).
export function RepeatList<T>({
  items,
  onChange,
  empty,
  addLabel,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  const deleteLabel = useT().app.common.delete;
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 pr-10">
          {render(item, (patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it))))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label={deleteLabel}
            className="absolute right-2 top-2 rounded-md px-2 py-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...empty }])}
        className="w-fit rounded-lg border border-dashed border-blue-400 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
      >
        + {addLabel}
      </button>
    </div>
  );
}
