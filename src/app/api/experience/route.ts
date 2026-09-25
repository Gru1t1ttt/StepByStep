import { ReadOnlyError, upsertDoc } from "@/lib/rag/store";
import type { Outcome } from "@/lib/rag/types";

// Публичная анкета выпускника. Отзыв попадает в базу со статусом «на модерации»
// и не используется ИИ, пока его не одобрят в /admin.

type Body = {
  university: string;
  country: string;
  year: string;
  outcome: Outcome;
  major: string;
  school: string;
  profile: string;
  story: string;
  whatWorked: string;
  mistakes: string;
  advice: string;
  contact: string;
  consent: boolean;
};

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  if (!b.consent) return Response.json({ error: "Нужно согласие на использование отзыва" }, { status: 400 });
  const university = clip(b.university, 120);
  const story = clip(b.story, 6000);
  if (!university || story.length < 100) {
    return Response.json({ error: "Укажи университет и расскажи историю подробнее (от 100 символов)" }, { status: 400 });
  }

  const sections = [
    story,
    clip(b.whatWorked, 3000) && `Что сработало:\n${clip(b.whatWorked, 3000)}`,
    clip(b.mistakes, 3000) && `Ошибки и что сделал(а) бы иначе:\n${clip(b.mistakes, 3000)}`,
    clip(b.advice, 3000) && `Совет школьникам:\n${clip(b.advice, 3000)}`,
  ].filter(Boolean);

  const year = parseInt(b.year, 10);
  const outcomes: Outcome[] = ["admitted", "enrolled", "waitlisted", "rejected"];
  try {
    await upsertDoc({
      kind: "experience",
      status: "pending",
      title: `${university}${b.outcome === "rejected" ? " — отказ" : ""}${year ? `, ${year}` : ""}`,
      text: sections.join("\n\n"),
      meta: {
        source: "Анкета выпускника",
        university,
        country: clip(b.country, 60),
        year: Number.isNaN(year) ? undefined : year,
        outcome: outcomes.includes(b.outcome) ? b.outcome : "",
        major: clip(b.major, 120),
        school: clip(b.school, 120),
        profile: clip(b.profile, 600),
        // Контакт нужен только команде для уточнений — в текст для ИИ он не попадает.
        ...(clip(b.contact, 120) && { contact: clip(b.contact, 120) }),
      },
    });
  } catch (error) {
    const message =
      error instanceof ReadOnlyError ? "Приём историй скоро откроется — мы подключаем базу данных. Попробуй через пару дней!" : "Не удалось сохранить. Попробуй ещё раз.";
    return Response.json({ error: message }, { status: 503 });
  }
  return Response.json({ ok: true });
}
