"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Ответы ИИ приходят в Markdown (заголовки, списки, таблицы) — рисуем их аккуратно.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="grid gap-2 leading-relaxed [&_a]:text-blue-700 [&_a]:underline [&_strong]:font-semibold [&_strong]:text-slate-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="mt-2 font-display text-base font-bold text-slate-950">{children}</h3>,
          h2: ({ children }) => <h3 className="mt-2 font-display text-base font-bold text-slate-950">{children}</h3>,
          h3: ({ children }) => <h4 className="mt-1 font-semibold text-slate-950">{children}</h4>,
          h4: ({ children }) => <h4 className="mt-1 font-semibold text-slate-950">{children}</h4>,
          ul: ({ children }) => <ul className="grid list-disc gap-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="grid list-decimal gap-1 pl-5">{children}</ol>,
          hr: () => <hr className="my-1 border-slate-200" />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-slate-300 px-2 py-1.5 font-semibold text-slate-900">{children}</th>,
          td: ({ children }) => <td className="border-b border-slate-100 px-2 py-1.5 align-top">{children}</td>,
          code: ({ children }) => <code className="rounded bg-slate-200/70 px-1 font-mono text-[0.9em]">{children}</code>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
