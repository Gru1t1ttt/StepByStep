import { sql } from "@/lib/db";
import { toUsd } from "@/lib/currency";
import { LLMError, completeJSON } from "@/lib/llm";
import { fetchHtml, htmlToText, safeUrl } from "@/lib/page-text";
import { forbidden, isAdmin } from "@/lib/rag/auth";
import { DEGREES, FIELDS, FORMATS } from "@/lib/world";

// Админка: ИИ читает официальную страницу программы и заполняет поля формы.
// Ничего не сохраняет — человек проверяет результат и публикует сам.

const MAX_CHARS = 18_000; // ~5 тыс. токенов: влезает в бесплатный лимит Groq

const SYSTEM = `Ты извлекаешь данные об учебной программе вуза из текста официальной страницы.
Верни ТОЛЬКО JSON-объект с ключами:
{
  "university_name": string | null,       // официальное название вуза на английском
  "name": string | null,                  // название программы, как на странице
  "degree": ${Object.keys(DEGREES).map((d) => `"${d}"`).join(" | ")},
  "field": одно из ${JSON.stringify(Object.keys(FIELDS))} или null,
  "language": string,                     // язык обучения по-английски: "English", "German"…
  "duration_months": number | null,
  "format": ${Object.keys(FORMATS).map((d) => `"${d}"`).join(" | ")},
  "study_mode": "full_time" | "part_time",
  "tuition_amount": number | null,        // стоимость за ОДИН учебный год для ИНОСТРАННЫХ студентов
  "tuition_currency": string,             // код валюты ISO: USD, EUR, GBP…
  "ielts_min": number | null,
  "toefl_min": number | null,
  "sat_min": number | null,
  "requirements": string,                 // 1–3 предложения по-русски: что нужно для поступления
  "deadline": "YYYY-MM-DD" | null,        // ближайший дедлайн подачи для иностранных абитуриентов
  "deadline_note": string,                // по-русски, если дедлайнов несколько или есть уточнения
  "start_month": string,                  // месяц начала обучения по-русски, например "сентябрь"
  "scholarships": string,                 // по-русски кратко о стипендиях и грантах, "" если нет
  "not_found": string[]                   // ключи, которых нет на странице
}
Правила: бери данные только из текста страницы, ничего не придумывай. Если данных нет — null (или "" для строк)
и добавь ключ в not_found. Если стоимость указана за весь срок или за семестр — пересчитай за год и упомяни это в requirements.`;

type Extracted = {
  university_name: string | null;
  name: string | null;
  degree: string;
  field: string | null;
  language: string;
  duration_months: number | null;
  format: string;
  study_mode: string;
  tuition_amount: number | null;
  tuition_currency: string;
  ielts_min: number | null;
  toefl_min: number | null;
  sat_min: number | null;
  requirements: string;
  deadline: string | null;
  deadline_note: string;
  start_month: string;
  scholarships: string;
  not_found: string[];
};

export async function POST(req: Request) {
  if (!isAdmin(req)) return forbidden();
  const { url } = (await req.json()) as { url?: string };
  let target: URL;
  try {
    target = safeUrl(url);
  } catch {
    return Response.json({ error: "Нужна ссылка на страницу программы (https://…)" }, { status: 400 });
  }

  let text = "";
  try {
    text = htmlToText(await fetchHtml(target)).slice(0, MAX_CHARS);
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith("Сайт") ? error.message : "Не удалось открыть страницу (сайт не отвечает или блокирует роботов).";
    return Response.json({ error: message }, { status: 502 });
  }
  if (text.length < 200) return Response.json({ error: "На странице почти нет текста — возможно, она собирается скриптами. Попробуй другую страницу." }, { status: 422 });

  let data: Extracted;
  try {
    data = await completeJSON<Extracted>(SYSTEM, `Адрес страницы: ${target.href}\n\nТекст страницы:\n${text}`);
  } catch (error) {
    const message = error instanceof LLMError ? error.message : "ИИ не смог разобрать страницу";
    return Response.json({ error: message }, { status: 502 });
  }

  // Какой это вуз в мировой базе: по домену сайта и по названию
  const host = target.hostname.replace(/^www\d?\./, "");
  const base = host.split(".").slice(-2).join("."); // cs.stanford.edu → stanford.edu
  const name = (data.university_name ?? "").toLowerCase();
  const candidates = await sql()`
    select id, name, country_code, city from public.world_universities
    where homepage ilike ${"%" + base + "%"} ${name ? sql()`or search_text ilike ${"%" + name + "%"}` : sql()``}
    order by (homepage ilike ${"%" + base + "%"}) desc, science_rank asc nulls last
    limit 6`;

  const currency = (data.tuition_currency || "USD").toUpperCase();
  return Response.json({
    program: {
      name: data.name ?? "",
      degree: data.degree in DEGREES ? data.degree : "bachelor",
      field: data.field && data.field in FIELDS ? data.field : null,
      language: data.language || "English",
      durationMonths: data.duration_months,
      format: data.format in FORMATS ? data.format : "on_campus",
      studyMode: data.study_mode === "part_time" ? "part_time" : "full_time",
      tuitionAmount: data.tuition_amount,
      tuitionCurrency: currency,
      tuitionUsd: toUsd(data.tuition_amount, currency),
      ieltsMin: data.ielts_min,
      toeflMin: data.toefl_min,
      satMin: data.sat_min,
      requirements: data.requirements ?? "",
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(data.deadline ?? "") ? data.deadline : null,
      deadlineNote: data.deadline_note ?? "",
      startMonth: data.start_month ?? "",
      scholarships: data.scholarships ?? "",
      url: target.href,
      published: false,
    },
    universityName: data.university_name,
    candidates,
    notFound: data.not_found ?? [],
  });
}
