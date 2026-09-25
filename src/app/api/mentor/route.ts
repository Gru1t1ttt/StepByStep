import Anthropic from "@anthropic-ai/sdk";
import type { Profile } from "@/lib/profile";
import { retrieveForMentor, type StudentSummary } from "@/lib/rag/retrieve";

// ИИ-наставник. Клиент присылает историю чата и контекст ученика (профиль, цели,
// gap analysis, карта развития). Сервер добавляет найденное в базе знаний (RAG).
//
// Протокол ответа: первая строка — JSON со списком источников, дальше — текст ответа потоком.

const SYSTEM = `Ты — ИИ-наставник платформы StepByStep. Помогаешь школьникам из Казахстана и Центральной Азии развиваться и готовиться к поступлению в зарубежные университеты.

Честность важнее мотивации:
- Никогда не обнадёживай без оснований. Если цель очень конкурентная (Лига плюща, MIT, Stanford, Oxbridge и любые вузы с приёмом ниже ~15%), прямо скажи, что это reach для любого кандидата, и объясни, какой уровень профиля реально нужен.
- Не соглашайся с упрощениями вроде «хватит стартапа и экзаменов». Объясни, что на деле решают годы глубокой работы в одной теме, результат национального/международного уровня, эссе и рекомендации.
- Оценивай шансы по-взрослому и предлагай сбалансированный список: reach, target и safety (safety — это вуз, куда поступишь И который сможешь оплатить).

Опора на базу знаний:
- В блоке <knowledge> ниже — материалы StepByStep: реальный опыт поступивших и гайды команды. Опирайся на них в первую очередь и ссылайся на источник номером в квадратных скобках, например [2].
- Опыт поступивших (особенно отказы) — самый ценный материал: используй его, чтобы показать, как всё происходит на практике, но помни, что один случай — не правило.
- Записи с пометкой «ДЕМО» выдуманы для теста; если опираешься на них, говори, что это пример.
- Если в базе нет ответа, скажи об этом и отвечай из общих знаний, явно помечая это. Конкретные дедлайны, суммы и требования всегда советуй сверить на официальном сайте.

Как помогать:
- Опирайся на профиль ученика, его цели, gap analysis и карту развития. Не спрашивай заново то, что уже известно.
- Давай конкретный следующий шаг и объясняй, зачем он нужен для поступления.
- Идеи проектов — от простого к сложному и к настоящему исследованию, в рамках одной темы.
- Не пиши эссе и мотивационные письма за ученика: помогай с идеями, структурой и обратной связью.
- Отвечай на языке ученика (по умолчанию на русском), дружелюбно и по делу: несколько абзацев или список, без воды.`;

type Body = {
  messages: Anthropic.Beta.BetaMessageParam[];
  context: { profile?: Profile; targets?: { name: string }[] } & Record<string, unknown>;
};

function studentSummary(context: Body["context"]): StudentSummary {
  const p = context.profile;
  return {
    grade: p?.grade,
    interests: p?.interests,
    targetCountries: p?.targetCountries,
    targetMajors: p?.targetMajors,
    targets: context.targets?.map((t) => t.name),
    exams: p?.exams.filter((e) => e.exam).map((e) => `${e.exam} ${e.score}`.trim()),
    school: p?.schoolType,
  };
}

function lastUserText(messages: Body["messages"]) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return typeof last?.content === "string" ? last.content : "";
}

export async function POST(req: Request) {
  const { messages, context } = (await req.json()) as Body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Пустой запрос" }, { status: 400 });
  }

  // Поиск в базе не должен ломать чат: если он упал, отвечаем без базы.
  let knowledge = { sources: [] as Awaited<ReturnType<typeof retrieveForMentor>>["sources"], context: "База знаний временно недоступна." };
  try {
    knowledge = await retrieveForMentor(lastUserText(messages), studentSummary(context));
  } catch (error) {
    console.error("RAG retrieval failed", error);
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`${JSON.stringify({ sources: knowledge.sources })}\n`));
      try {
        const stream = client.beta.messages.stream({
          model: "claude-opus-5",
          max_tokens: 64000,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          thinking: { type: "adaptive" },
          output_config: { effort: "medium" },
          system: [
            { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
            { type: "text", text: `Контекст ученика (JSON):\n${JSON.stringify(context)}` },
            { type: "text", text: `<knowledge>\n${knowledge.context}\n</knowledge>` },
          ],
          messages: messages.slice(-30),
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nНа этот вопрос я ответить не могу. Попробуй переформулировать."));
        }
      } catch (error) {
        let message = "Не удалось получить ответ ИИ. Попробуй ещё раз чуть позже.";
        if (error instanceof Anthropic.AuthenticationError || (error instanceof Error && /auth|api key|apiKey/i.test(error.message))) {
          message = "ИИ-наставник ещё не подключён: на сервере не задан ключ ANTHROPIC_API_KEY.";
        } else if (error instanceof Anthropic.RateLimitError) {
          message = "Слишком много запросов. Подожди минуту и попробуй снова.";
        }
        controller.enqueue(encoder.encode(message));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
