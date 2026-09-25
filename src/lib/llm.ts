import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";

// Единая точка вызова языковой модели для ИИ-наставника.
//
// Провайдер выбирается переменной LLM_PROVIDER (groq | anthropic). Если она не задана —
// Groq, когда есть GROQ_API_KEY, иначе Claude. Модель Groq — переменная GROQ_MODEL.
//
// Groq — бесплатные открытые модели для проверки концепции; Claude — для продакшена.

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatRequest = {
  system: string; // стабильные инструкции (кэшируются у Claude)
  context: string; // профиль ученика и найденное в базе — меняется от запроса к запросу
  messages: ChatTurn[];
};

export class LLMError extends Error {}

export function llmProvider(): "groq" | "anthropic" {
  const p = process.env.LLM_PROVIDER;
  if (p === "groq" || p === "anthropic") return p;
  return process.env.GROQ_API_KEY ? "groq" : "anthropic";
}

export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export function streamChat(req: ChatRequest): AsyncGenerator<string> {
  return llmProvider() === "groq" ? streamGroq(req) : streamAnthropic(req);
}

async function* streamGroq({ system, context, messages }: ChatRequest) {
  if (!process.env.GROQ_API_KEY) throw new LLMError("ИИ-наставник ещё не подключён: на сервере не задан ключ GROQ_API_KEY.");
  const groq = new Groq();
  // У «думающих» моделей рассуждения не должны попадать в ответ ученику.
  const reasoning = GROQ_MODEL.includes("gpt-oss")
    ? { include_reasoning: false, reasoning_effort: "medium" as const }
    : GROQ_MODEL.includes("qwen")
      ? { reasoning_format: "hidden" as const }
      : {};
  try {
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      stream: true,
      temperature: 0.5,
      max_completion_tokens: 4096,
      ...reasoning,
      messages: [{ role: "system", content: `${system}\n\n${context}` }, ...messages],
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  } catch (error) {
    if (error instanceof Groq.AuthenticationError) throw new LLMError("Неверный ключ GROQ_API_KEY.");
    if (error instanceof Groq.RateLimitError) throw new LLMError("Бесплатный лимит Groq на минуту исчерпан. Подожди минуту и попробуй снова.");
    if (error instanceof Groq.NotFoundError || error instanceof Groq.BadRequestError)
      throw new LLMError(`Groq не принял запрос (модель ${GROQ_MODEL}): ${(error as Error).message}`);
    throw error;
  }
}

async function* streamAnthropic({ system, context, messages }: ChatRequest) {
  const client = new Anthropic();
  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5",
      max_tokens: 64000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system: [
        { type: "text", text: system, cache_control: { type: "ephemeral" } },
        { type: "text", text: context },
      ],
      messages,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") yield "\n\nНа этот вопрос я ответить не могу. Попробуй переформулировать.";
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || (error instanceof Error && /auth|api key|apiKey/i.test(error.message))) {
      throw new LLMError("ИИ-наставник ещё не подключён: на сервере не задан ключ GROQ_API_KEY или ANTHROPIC_API_KEY.");
    }
    if (error instanceof Anthropic.RateLimitError) throw new LLMError("Слишком много запросов. Подожди минуту и попробуй снова.");
    throw error;
  }
}
