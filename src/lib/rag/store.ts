import { promises as fs } from "node:fs";
import path from "node:path";
import { chunkDoc } from "./chunk";
import { SEED_DOCS } from "@/data/knowledge-seed";
import { EMBEDDING_MODEL, embedPassages, embeddingsEnabled } from "./embeddings";
import type { Chunk, DocStatus, KnowledgeDoc, KnowledgeKind, KnowledgeMeta } from "./types";

// Хранилище базы знаний: один JSON-файл .data/knowledge.json.
//
// Этого хватает на десятки тысяч чанков (поиск перебором занимает миллисекунды).
// Для продакшена заменить на Postgres + pgvector (например, Supabase) — функции ниже
// становятся SQL-запросами, остальной код RAG не меняется.

type DB = { embeddingModel: string; docs: KnowledgeDoc[]; chunks: Chunk[] };

const FILE = path.join(process.cwd(), ".data", "knowledge.json");

// На Vercel файловая система только для чтения: база собирается в памяти из встроенных
// гайдов (src/data/knowledge-seed.ts), а добавление и модерация включатся после переезда
// на Postgres/Supabase (docs/RAG.md).
export const READ_ONLY = !!process.env.VERCEL;

export class ReadOnlyError extends Error {
  constructor() {
    super("База знаний на сервере пока только для чтения — нужно подключить Supabase (см. docs/RAG.md).");
  }
}

function seedDb(): DB {
  const now = new Date().toISOString();
  const docs: KnowledgeDoc[] = SEED_DOCS.map((d) => ({
    id: d.id!,
    kind: d.kind,
    title: d.title,
    text: d.text,
    meta: d.meta ?? {},
    status: d.status ?? "approved",
    createdAt: now,
    updatedAt: now,
  }));
  const chunks = docs.flatMap((doc) => chunkDoc(doc).map((text, index) => ({ id: `${doc.id}#${index}`, docId: doc.id, index, text, embedding: [] })));
  return { embeddingModel: "none", docs, chunks };
}

let cache: DB | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as DB;
  } catch {
    cache = READ_ONLY ? seedDb() : { embeddingModel: EMBEDDING_MODEL, docs: [], chunks: [] };
  }
  return cache;
}

async function save(db: DB) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, FILE);
}

// Все изменения идут по очереди, чтобы параллельные запросы не затёрли файл.
function mutate<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  if (READ_ONLY) return Promise.reject(new ReadOnlyError());
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

async function buildChunks(doc: KnowledgeDoc): Promise<Chunk[]> {
  const texts = chunkDoc(doc);
  const vectors = embeddingsEnabled() ? await embedPassages(texts) : [];
  return texts.map((text, index) => ({ id: `${doc.id}#${index}`, docId: doc.id, index, text, embedding: vectors[index] ?? [] }));
}

export type DocInput = { id?: string; kind: KnowledgeKind; title: string; text: string; meta?: KnowledgeMeta; status?: DocStatus };

export async function listDocs() {
  const db = await load();
  return db.docs.map((d) => ({ ...d, chunkCount: db.chunks.filter((c) => c.docId === d.id).length }));
}

export async function getSearchable() {
  const db = await load();
  const approved = new Map(db.docs.filter((d) => d.status === "approved").map((d) => [d.id, d]));
  return { docs: approved, chunks: db.chunks.filter((c) => approved.has(c.docId)) };
}

export function upsertDoc(input: DocInput) {
  return mutate(async (db) => {
    const now = new Date().toISOString();
    const existing = input.id ? db.docs.find((d) => d.id === input.id) : undefined;
    const doc: KnowledgeDoc = {
      id: existing?.id ?? input.id ?? crypto.randomUUID(),
      kind: input.kind,
      title: input.title.trim(),
      text: input.text.trim(),
      meta: input.meta ?? {},
      status: input.status ?? existing?.status ?? "pending",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const chunks = await buildChunks(doc);
    db.docs = [...db.docs.filter((d) => d.id !== doc.id), doc];
    db.chunks = [...db.chunks.filter((c) => c.docId !== doc.id), ...chunks];
    return doc;
  });
}

export function setStatus(id: string, status: DocStatus) {
  return mutate(async (db) => {
    const doc = db.docs.find((d) => d.id === id);
    if (!doc) return null;
    doc.status = status;
    doc.updatedAt = new Date().toISOString();
    return doc;
  });
}

export function deleteDoc(id: string) {
  return mutate(async (db) => {
    const before = db.docs.length;
    db.docs = db.docs.filter((d) => d.id !== id);
    db.chunks = db.chunks.filter((c) => c.docId !== id);
    return db.docs.length < before;
  });
}

// Пересчитать все эмбеддинги — нужно после смены модели эмбеддингов.
export function reindexAll() {
  return mutate(async (db) => {
    const chunks: Chunk[] = [];
    for (const doc of db.docs) chunks.push(...(await buildChunks(doc)));
    db.chunks = chunks;
    db.embeddingModel = EMBEDDING_MODEL;
    return { docs: db.docs.length, chunks: chunks.length };
  });
}

export async function stats() {
  const db = await load();
  const count = (kind: KnowledgeKind) => db.docs.filter((d) => d.kind === kind && d.status === "approved").length;
  return {
    embeddingModel: db.embeddingModel,
    needsReindex: embeddingsEnabled() && db.embeddingModel !== EMBEDDING_MODEL,
    readOnly: READ_ONLY,
    vectorSearch: embeddingsEnabled(),
    docs: db.docs.length,
    chunks: db.chunks.length,
    pending: db.docs.filter((d) => d.status === "pending").length,
    approved: { experience: count("experience"), guide: count("guide"), fact: count("fact") },
  };
}
