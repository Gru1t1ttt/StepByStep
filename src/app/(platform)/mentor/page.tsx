"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { UNIVERSITIES } from "@/data/universities";
import { buildRoadmap, gapAnalysis, rankOpportunities } from "@/lib/analysis";
import type { Profile } from "@/lib/profile";
import { updateState, type ChatMessage, type ChatSource, type PlatformState } from "@/lib/store";
import Markdown from "@/components/platform/Markdown";
import { Card, PageHeader, WithProfile, buttonClass, ghostButtonClass } from "@/components/platform/ui";

const SUGGESTIONS = [
  "Что мне сделать на этой неделе?",
  "Предложи идеи проектов по моим интересам — от простого к исследованию",
  "Чего мне больше всего не хватает для поступления?",
  "Как подготовиться к IELTS за 3 месяца?",
];

// Всё, что ИИ должен знать об ученике, чтобы не начинать каждый раз с нуля.
function buildContext(profile: Profile, state: PlatformState) {
  const targets = UNIVERSITIES.filter((u) => state.targets.includes(u.id));
  return {
    today: new Date().toISOString().slice(0, 10),
    profile,
    targets: targets.map((u) => ({
      name: u.name,
      country: u.country,
      deadline: u.deadline,
      gap: gapAnalysis(profile, u).map(({ label, you, need, status }) => ({ label, you, need, status })),
    })),
    roadmap: buildRoadmap(profile, state.targets).map((s) => ({ title: s.title, due: s.due, done: state.doneSteps.includes(s.id) })),
    topOpportunities: rankOpportunities(profile)
      .slice(0, 6)
      .map((m) => ({ title: m.opportunity.title, type: m.opportunity.type, deadline: m.opportunity.deadline })),
    portfolio: state.portfolio.map((p) => ({ kind: p.kind, title: p.title, description: p.description })),
  };
}

function Sources({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="mt-1.5 grid gap-1 pl-1 text-xs text-slate-500">
      {sources.map((s) => (
        <div key={s.n}>
          <span className="font-semibold text-slate-700">[{s.n}]</span> {s.kind}: {s.title}
          {s.outcome && ` · ${s.outcome}`}
          {s.year && ` · ${s.year}`}
          {s.demo && <span className="ml-1 rounded bg-amber-100 px-1 text-amber-800">демо</span>}
          {s.sourceUrl && (
            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-700 underline">
              ссылка
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function Chat({ profile, state }: { profile: Profile; state: PlatformState }) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [streamingSources, setStreamingSources] = useState<ChatSource[]>([]);
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const history = state.chat;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, streaming]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    const messages: ChatMessage[] = [...history, { role: "user", content: question }];
    updateState({ chat: messages });
    setInput("");
    setBusy(true);
    let answer = "";
    let sources: ChatSource[] = [];
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Источники из прошлых ответов модели не нужны — отправляем только текст.
        body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })), context: buildContext(profile, state) }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      let headerParsed = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        // Первая строка ответа — JSON с источниками из базы знаний.
        if (!headerParsed) {
          const nl = raw.indexOf("\n");
          if (nl === -1) continue;
          try {
            sources = JSON.parse(raw.slice(0, nl)).sources ?? [];
          } catch {}
          setStreamingSources(sources);
          raw = raw.slice(nl + 1);
          headerParsed = true;
        }
        answer = raw;
        setStreaming(answer);
      }
    } catch {
      answer = "Нет соединения с сервером. Проверь интернет и попробуй снова.";
    }
    // Показываем только те источники, на которые ИИ действительно сослался.
    const cited = sources.filter((src) => answer.includes(`[${src.n}]`));
    updateState({ chat: [...messages, { role: "assistant", content: answer, sources: cited }] });
    setStreaming("");
    setStreamingSources([]);
    setBusy(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const shown: ChatMessage[] = streaming ? [...history, { role: "assistant", content: streaming, sources: streamingSources.filter((src) => streaming.includes(`[${src.n}]`)) }] : history;

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[420px] flex-col">
      <Card className="flex-1 overflow-y-auto">
        {shown.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-4xl">💬</p>
            <p className="mt-3 max-w-md text-slate-600">
              Я знаю твой профиль, цели и карту развития. Спроси, что делать дальше, попроси идеи проектов или разбор пробелов.
            </p>
            <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-400">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {shown.map((m, i) => (
              <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "whitespace-pre-wrap rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
                </div>
                {m.sources && m.sources.length > 0 && <Sources sources={m.sources} />}
              </div>
            ))}
            {busy && !streaming && <div className="w-fit rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">Думаю…</div>}
            <div ref={bottom} />
          </div>
        )}
      </Card>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси наставника…"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" disabled={busy || !input.trim()} className={buttonClass}>
          Отправить
        </button>
      </form>
    </div>
  );
}

export default function MentorPage() {
  return (
    <WithProfile>
      {(profile, state) => (
        <div>
          <PageHeader
            title="ИИ-наставник"
            subtitle="Помнит, что ты уже умеешь, и помогает двигаться в выбранном направлении."
            action={
              state.chat.length > 0 && (
                <button type="button" onClick={() => updateState({ chat: [] })} className={ghostButtonClass}>
                  Новый диалог
                </button>
              )
            }
          />
          <Chat profile={profile} state={state} />
        </div>
      )}
    </WithProfile>
  );
}
