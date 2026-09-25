import path from "node:path";

// Эмбеддинги («числовые отпечатки смысла»).
//
// Сейчас — бесплатная модель multilingual-e5-small, работает прямо на сервере, без ключей,
// понимает русский, казахский и английский. Модель скачивается один раз (~120 МБ) в .cache/models.
//
// Чтобы перейти на OpenAI / Voyage: реализовать embedTexts() через их API и поменять
// EMBEDDING_MODEL — после смены модели базу нужно переиндексировать (POST /api/knowledge/reindex).

export const EMBEDDING_MODEL = "Xenova/multilingual-e5-small";

// На Vercel локальная модель не помещается в лимит функции (250 МБ), поэтому там поиск идёт
// только по ключевым словам. RAG_EMBEDDINGS=local|off переопределяет поведение явно.
export function embeddingsEnabled() {
  const mode = process.env.RAG_EMBEDDINGS;
  if (mode) return mode === "local";
  return !process.env.VERCEL;
}

type Extractor = (texts: string[], opts: { pooling: "mean"; normalize: boolean }) => Promise<{ tolist(): number[][] }>;

let extractor: Promise<Extractor> | null = null;

async function getExtractor() {
  if (!extractor) {
    extractor = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.cacheDir = path.join(process.cwd(), ".cache", "models");
      return (await pipeline("feature-extraction", EMBEDDING_MODEL, { dtype: "q8" })) as unknown as Extractor;
    })();
    extractor.catch(() => (extractor = null));
  }
  return extractor;
}

// e5 требует префиксы: «query:» для вопросов и «passage:» для текстов базы.
async function embedTexts(texts: string[], prefix: "query" | "passage") {
  if (!texts.length) return [];
  const extract = await getExtractor();
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16).map((t) => `${prefix}: ${t}`);
    const result = await extract(batch, { pooling: "mean", normalize: true });
    out.push(...result.tolist().map((v) => v.map((x) => Math.round(x * 1e5) / 1e5)));
  }
  return out;
}

export const embedPassages = (texts: string[]) => embedTexts(texts, "passage");
export const embedQuery = async (text: string) => (await embedTexts([text], "query"))[0];

// Векторы нормализованы, поэтому косинусная близость = скалярное произведение.
export function cosine(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
