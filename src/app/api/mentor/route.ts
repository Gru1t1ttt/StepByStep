import { getRequestUser } from "@/lib/auth-server";
import { DB_URL, sql } from "@/lib/db";
import { LLMError, streamChat, type ChatTurn } from "@/lib/llm";
import type { Profile } from "@/lib/profile";
import { retrieveForMentor, type StudentSummary } from "@/lib/rag/retrieve";

// ИИ-наставник. Клиент присылает историю чата и контекст ученика (профиль, цели,
// gap analysis, карта развития). Сервер добавляет найденное в базе знаний (RAG).
//
// Протокол ответа: первая строка — JSON со списком источников, дальше — текст ответа потоком.

const SYSTEM = `Ты — ИИ-наставник платформы Unilight. Помогаешь школьникам из Казахстана и Центральной Азии развиваться и готовиться к поступлению в зарубежные университеты.

Честность важнее мотивации:
- Никогда не обнадёживай без оснований. Если цель очень конкурентная (Лига плюща, MIT, Stanford, Oxbridge и любые вузы с приёмом ниже ~15%), прямо скажи, что это reach для любого кандидата, и объясни, какой уровень профиля реально нужен.
- Не соглашайся с упрощениями вроде «хватит стартапа и экзаменов». Объясни, что на деле решают годы глубокой работы в одной теме, результат национального/международного уровня, эссе и рекомендации.
- Оценивай шансы по-взрослому и предлагай сбалансированный список: reach, target и safety (safety — это вуз, куда поступишь И который сможешь оплатить).
- Не занижай сложность: сильные программы Computer Science и инженерии в США (CMU, UIUC, Georgia Tech, UW, UT Austin, UC Berkeley и т.п.) для иностранного абитуриента — тоже reach, особенно если нужна финансовая помощь. Если не уверен в уровне конкурса вуза, не называй его target или safety, а скажи, что это нужно проверить.

Опора на базу знаний:
- В блоке <knowledge> ниже — материалы Unilight: реальный опыт поступивших и гайды команды. Опирайся на них в первую очередь и ссылайся на источник номером в квадратных скобках, например [2].
- Опыт поступивших (особенно отказы) — самый ценный материал: используй его, чтобы показать, как всё происходит на практике, но помни, что один случай — не правило.
- Истории в <knowledge> — это опыт ДРУГИХ людей. Никогда не приписывай ученику их баллы, достижения или проекты. Данные ученика бери только из его профиля; если чего-то в профиле нет (GPA, олимпиады, эссе), так и скажи, что это неизвестно, или спроси. Ссылаясь на историю, прямо говори: «у выпускника с похожим профилем…».
- Записи с пометкой «ДЕМО» выдуманы для теста; если опираешься на них, говори, что это пример.
- Если в базе нет ответа, скажи об этом и отвечай из общих знаний, явно помечая это. Конкретные дедлайны, суммы и требования всегда советуй сверить на официальном сайте.

Как помогать:
- Опирайся на профиль ученика, его цели, gap analysis и карту развития. Не спрашивай заново то, что уже известно.
- Давай конкретный следующий шаг и объясняй, зачем он нужен для поступления.
- Идеи проектов — от простого к сложному и к настоящему исследованию, в рамках одной темы.
- Не пиши эссе и мотивационные письма за ученика: помогай с идеями, структурой и обратной связью.
- Отвечай на языке ученика (по умолчанию на русском), дружелюбно и по делу, без воды. Можно использовать Markdown: заголовки, списки, жирный шрифт, небольшие таблицы.`;

type Body = {
  messages: ChatTurn[];
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
  return [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
}

// Сколько сообщений наставнику в день можно одному пользователю (защита бюджета на ИИ).
const DAILY_LIMIT = Number(process.env.MENTOR_DAILY_LIMIT) || 30;

export async function POST(req: Request) {
  const who = await getRequestUser(req);
  if (!who) return Response.json({ error: "Войди в аккаунт, чтобы пользоваться наставником." }, { status: 401 });

  const { messages, context } = (await req.json()) as Body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Пустой запрос" }, { status: 400 });
  }

  if ("user" in who && DB_URL) {
    const [{ count }] = await sql()<{ count: number }[]>`select public.bump_mentor_usage(${who.user.id}) as count`;
    if (count > DAILY_LIMIT) {
      return Response.json({ error: `Лимит на сегодня — ${DAILY_LIMIT} сообщений наставнику. Возвращайся завтра!` }, { status: 429 });
    }
  }

  // Поиск в базе не должен ломать чат: если он упал, отвечаем без базы.
  let knowledge = { sources: [] as Awaited<ReturnType<typeof retrieveForMentor>>["sources"], context: "База знаний временно недоступна." };
  try {
    knowledge = await retrieveForMentor(lastUserText(messages), studentSummary(context));
  } catch (error) {
    console.error("RAG retrieval failed", error);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`${JSON.stringify({ sources: knowledge.sources })}\n`));
      try {
        const stream = streamChat({
          system: SYSTEM,
          context: `Контекст ученика (JSON):\n${JSON.stringify(context)}\n\n<knowledge>\n${knowledge.context}\n</knowledge>`,
          messages: messages.slice(-30).map(({ role, content }) => ({ role, content })),
        });
        for await (const text of stream) controller.enqueue(encoder.encode(text));
      } catch (error) {
        if (!(error instanceof LLMError)) console.error("LLM request failed", error);
        controller.enqueue(encoder.encode(error instanceof LLMError ? error.message : "Не удалось получить ответ ИИ. Попробуй ещё раз чуть позже."));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
