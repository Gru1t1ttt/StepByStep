import { createHash } from "node:crypto";
import type { Opportunity, OpportunityType } from "@/data/opportunities";
import { sql } from "./db";
import { completeJSON } from "./llm";
import { fetchHtml, htmlToText, telegramPosts } from "./page-text";
import { INTERESTS } from "./profile";

// ИИ-агент возможностей. Обходит источники (сайты и открытые Telegram-каналы), находит
// олимпиады, конкурсы, хакатоны и летние школы для школьников и складывает их в очередь
// «На проверку». Публикует только человек в админке: ИИ может ошибиться с датой или
// принять рекламу за конкурс.
//
// Если текст источника не изменился с прошлой проверки, ИИ не вызывается — это экономит
// бесплатный лимит Groq.

const TYPES: OpportunityType[] = ["Олимпиада", "Хакатон", "Конкурс", "Летняя школа", "Исследование", "Эссе-конкурс", "Конференция"];
const FORMATS = ["Онлайн", "Офлайн", "Гибрид"] as const;
const MAX_CHARS = 12_000; // ~4 тыс. токенов: влезает в минутный лимит бесплатного Groq

export type Source = {
  id: string;
  name: string;
  url: string;
  kind: "page" | "telegram";
  active: boolean;
  last_checked_at: string | null;
  last_hash: string | null;
  last_error: string | null;
  found_total: number;
};

type Translation = { title: string; description: string };
export type CandidateData = Omit<Opportunity, "id"> & { i18n: { kz?: Translation; en?: Translation }; deadlineGuess?: boolean };

const SYSTEM = `Ты помогаешь платформе Unilight находить возможности для школьников 7–12 классов из Казахстана:
олимпиады, конкурсы, хакатоны, летние школы, исследовательские программы, эссе-конкурсы, конференции.

Тебе дают текст сайта или последние посты Telegram-канала. Найди в нём КОНКРЕТНЫЕ возможности с открытой подачей.
Не включай: рекламу платных курсов и репетиторов, новости о прошедших событиях, общие советы, программы только для студентов вузов.

Верни ТОЛЬКО JSON: {"items": [ ... ]}, где каждый элемент:
{
  "title": string,                        // официальное название, по-русски или как в оригинале
  "type": ${TYPES.map((t) => `"${t}"`).join(" | ")},
  "interests": string[],                  // 1–3 значения ТОЛЬКО из списка: ${JSON.stringify(INTERESTS)}
  "min_grade": number, "max_grade": number, // классы 7–12
  "format": ${FORMATS.map((f) => `"${f}"`).join(" | ")},
  "location": string,                     // город/страна или "" для онлайн
  "free": boolean,
  "deadline": "YYYY-MM-DD",               // дедлайн подачи; если указан только месяц — последний день месяца;
                                          // если дедлайна нет, но есть дата события или начала — возьми её
  "deadline_is_event_date": boolean,      // true, если вместо дедлайна взята дата события
  "prep_weeks": number,                   // за сколько недель разумно начать готовиться (2–16)
  "url": string,                          // ссылка на официальную страницу, если есть в тексте, иначе ""
  "description": string,                 // 1–2 предложения по-русски: что это и чем полезно для поступления
  "kz": {"title": string, "description": string}, // перевод на казахский
  "en": {"title": string, "description": string}  // перевод на английский
}
Бери факты только из текста. Если нет ни дедлайна, ни даты события — не включай возможность. Если ничего подходящего нет — {"items": []}.`;

// «NASA Space Apps Challenge 2026» и «NASA Space Apps Challenge» — одно и то же: год из названия убираем
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b20\d\d\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export const dedupeKey = (title: string, deadline: string) => `${normalize(title)}|${deadline.slice(0, 4)}`;

async function sourceText(src: Pick<Source, "url" | "kind">) {
  const text = src.kind === "telegram" ? await telegramPosts(src.url) : htmlToText(await fetchHtml(src.url));
  return text.slice(0, MAX_CHARS);
}

function clean(raw: Record<string, unknown>, sourceUrl: string): CandidateData | null {
  const title = String(raw.title ?? "").trim();
  const deadline = String(raw.deadline ?? "");
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(deadline) || new Date(deadline) < new Date()) return null;
  const grade = (v: unknown, d: number) => Math.min(12, Math.max(7, Number(v) || d));
  const tr = (v: unknown): Translation | undefined => {
    const o = v as Translation | undefined;
    return o?.title ? { title: String(o.title), description: String(o.description ?? "") } : undefined;
  };
  return {
    title,
    type: TYPES.includes(raw.type as OpportunityType) ? (raw.type as OpportunityType) : "Конкурс",
    interests: (Array.isArray(raw.interests) ? raw.interests : []).filter((i): i is string => INTERESTS.includes(i as string)).slice(0, 3),
    minGrade: grade(raw.min_grade, 8),
    maxGrade: grade(raw.max_grade, 11),
    format: FORMATS.includes(raw.format as (typeof FORMATS)[number]) ? (raw.format as Opportunity["format"]) : "Онлайн",
    location: String(raw.location ?? ""),
    free: raw.free !== false,
    deadline,
    prepWeeks: Math.min(16, Math.max(2, Number(raw.prep_weeks) || 4)),
    url: /^https?:\/\//.test(String(raw.url ?? "")) ? String(raw.url) : sourceUrl,
    description: String(raw.description ?? ""),
    i18n: { kz: tr(raw.kz), en: tr(raw.en) },
    deadlineGuess: raw.deadline_is_event_date === true,
  };
}

// Проверить один источник: вернуть число новых находок.
export async function checkSource(src: Source, force = false) {
  const db = sql();
  try {
    const text = await sourceText(src);
    const hash = createHash("sha256").update(text).digest("hex");
    if (!force && hash === src.last_hash) {
      await db`update opportunity_sources set last_checked_at = now(), last_error = null where id = ${src.id}`;
      return { found: 0, unchanged: true };
    }
    if (text.length < 100) throw new Error("На странице почти нет текста (возможно, она собирается скриптами)");

    const { items = [] } = await completeJSON<{ items?: Record<string, unknown>[] }>(SYSTEM, `Источник: ${src.url}\n\n${text}`);
    const existing = new Set((await db`select title, deadline from opportunities`).map((o) => dedupeKey(o.title, new Date(o.deadline).toISOString())));
    let found = 0;
    let duplicates = 0;
    let invalid = 0;
    for (const raw of items) {
      const c = clean(raw, src.url);
      if (!c) {
        invalid++; // без дедлайна или дедлайн уже прошёл
        continue;
      }
      const key = dedupeKey(c.title, c.deadline);
      if (existing.has(key)) {
        duplicates++;
        continue;
      }
      const inserted = await db`
        insert into opportunity_candidates (source_id, source_url, data, dedupe_key)
        values (${src.id}, ${src.url}, ${db.json(c)}, ${key})
        on conflict (dedupe_key) do nothing returning id`;
      found += inserted.length;
      if (!inserted.length) duplicates++;
    }
    await db`
      update opportunity_sources set last_checked_at = now(), last_hash = ${hash}, last_error = null, found_total = found_total + ${found}
      where id = ${src.id}`;
    return { found, unchanged: false, total: items.length, duplicates, invalid };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка";
    await db`update opportunity_sources set last_checked_at = now(), last_error = ${message.slice(0, 300)} where id = ${src.id}`;
    return { found: 0, unchanged: false, error: message };
  }
}

// Проверить несколько источников, которые дольше всего не проверялись (для ежедневного запуска).
export async function runAgent(limit = 4) {
  const sources = (await sql()`
    select * from opportunity_sources where active
    order by last_checked_at asc nulls first limit ${limit}`) as unknown as Source[];
  const results = [];
  for (const [i, s] of sources.entries()) {
    // пауза между вызовами ИИ — чтобы не упереться в минутный лимит Groq
    if (i > 0) await new Promise((r) => setTimeout(r, 20_000));
    results.push({ source: s.name, ...(await checkSource(s)) });
  }
  return results;
}

// Карточки без перевода или с плохим переводом (кириллица в английском, казахский совпадает с русским)
export const NEEDS_TRANSLATION = `published and (not (i18n ? 'en') or i18n->'en'->>'title' ~ '[А-Яа-яЁё]' or i18n->'en'->>'description' ~ '[А-Яа-яЁё]'
  or i18n->'kz'->>'description' = description)`;

// Перевести карточку возможности на казахский и английский (для уже опубликованных без перевода).
export async function translateOpportunity(title: string, description: string) {
  const res = await completeJSON<{ kz?: Translation; en?: Translation }>(
    'Переведи карточку конкурса для школьников на казахский и английский. Верни ТОЛЬКО JSON: {"kz": {"title", "description"}, "en": {"title", "description"}}. ' +
      "Переводи всё, что написано по-русски, в том числе в названии и в скобках. Оставляй как есть только имена собственные латиницей (NASA, Regeneron ISEF, MIT). " +
      "В английском переводе не должно остаться ни одной кириллической буквы.",
    JSON.stringify({ title, description }),
  );
  return { kz: res.kz, en: res.en };
}
