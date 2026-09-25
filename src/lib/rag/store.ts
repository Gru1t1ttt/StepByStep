import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { SEED_DOCS } from "@/data/knowledge-seed";
import { chunkDoc } from "./chunk";
import { EMBEDDING_MODEL, embedPassages, embeddingsEnabled } from "./embeddings";
import type { Chunk, DocStatus, KnowledgeDoc, KnowledgeKind, KnowledgeMeta } from "./types";

// Хранилище базы знаний.
//
// Если задан POSTGRES_URL (Supabase) — документы и чанки лежат в Postgres (таблицы из
// supabase/migrations). Иначе — в JSON-файле .data/knowledge.json (локальная разработка без базы).
// На Vercel без базы файловая система только для чтения — там работают встроенные гайды.
//
// Поиск (search.ts) берёт все одобренные чанки через getSearchable() и считает близость в памяти:
// для тысяч документов это миллисекунды. При росте до сотен тысяч — перенести в pgvector-запрос.

export type DocInput = { id?: string; kind: KnowledgeKind; title: string; text: string; meta?: KnowledgeMeta; status?: DocStatus };
export type DocWithCount = KnowledgeDoc & { chunkCount: number };
type Searchable = { docs: Map<string, KnowledgeDoc>; chunks: Chunk[] };

export class ReadOnlyError extends Error {
  constructor() {
    super("База знаний на сервере пока только для чтения — нужно подключить Supabase (см. docs/RAG.md).");
  }
}

const DB_URL = process.env.POSTGRES_URL;
export const READ_ONLY = !DB_URL && !!process.env.VERCEL;

async function buildChunks(doc: KnowledgeDoc): Promise<Chunk[]> {
  const texts = chunkDoc(doc);
  const vectors = embeddingsEnabled() ? await embedPassages(texts) : [];
  return texts.map((text, index) => ({ id: `${doc.id}#${index}`, docId: doc.id, index, text, embedding: vectors[index] ?? [] }));
}

function newDoc(input: DocInput, existing?: KnowledgeDoc): KnowledgeDoc {
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    kind: input.kind,
    title: input.title.trim(),
    text: input.text.trim(),
    meta: input.meta ?? {},
    status: input.status ?? existing?.status ?? "pending",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------- Postgres (Supabase)

let sqlClient: postgres.Sql | null = null;
function sql() {
  // prepare: false — пул Supabase работает в transaction mode и не поддерживает prepared statements.
  sqlClient ??= postgres(DB_URL!, { ssl: "require", prepare: false, max: 3, idle_timeout: 20 });
  return sqlClient;
}

type DocRow = { id: string; kind: KnowledgeKind; title: string; text: string; meta: KnowledgeMeta; status: DocStatus; created_at: Date; updated_at: Date };
const toDoc = (r: DocRow): KnowledgeDoc => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  text: r.text,
  meta: r.meta ?? {},
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
});

// Короткий кэш одобренных чанков: наставник ищет на каждом сообщении.
let searchCache: { at: number; data: Searchable } | null = null;
const SEARCH_CACHE_MS = 30_000;

const pg = {
  async list(): Promise<DocWithCount[]> {
    const rows = await sql()<(DocRow & { chunk_count: number })[]>`
      select d.*, (select count(*)::int from knowledge_chunks c where c.doc_id = d.id) as chunk_count
      from knowledge_docs d order by d.updated_at desc`;
    return rows.map((r) => ({ ...toDoc(r), chunkCount: r.chunk_count }));
  },

  async searchable(): Promise<Searchable> {
    if (searchCache && Date.now() - searchCache.at < SEARCH_CACHE_MS) return searchCache.data;
    const docRows = await sql()<DocRow[]>`select * from knowledge_docs where status = 'approved'`;
    const chunkRows = await sql()<{ id: string; doc_id: string; idx: number; text: string; embedding: string | null }[]>`
      select c.id, c.doc_id, c.idx, c.text, c.embedding::text as embedding
      from knowledge_chunks c join knowledge_docs d on d.id = c.doc_id
      where d.status = 'approved'`;
    const data = {
      docs: new Map(docRows.map((r) => [r.id, toDoc(r)])),
      chunks: chunkRows.map((r) => ({ id: r.id, docId: r.doc_id, index: r.idx, text: r.text, embedding: r.embedding ? (JSON.parse(r.embedding) as number[]) : [] })),
    };
    searchCache = { at: Date.now(), data };
    return data;
  },

  async upsert(input: DocInput): Promise<KnowledgeDoc> {
    const [existingRow] = input.id ? await sql()<DocRow[]>`select * from knowledge_docs where id = ${input.id}` : [];
    const doc = newDoc(input, existingRow && toDoc(existingRow));
    const chunks = await buildChunks(doc);
    await sql().begin(async (tx) => {
      await tx`
        insert into knowledge_docs (id, kind, title, text, meta, status, created_at, updated_at)
        values (${doc.id}, ${doc.kind}, ${doc.title}, ${doc.text}, ${tx.json(doc.meta as postgres.JSONValue)}, ${doc.status}, ${doc.createdAt}, ${doc.updatedAt})
        on conflict (id) do update set kind = excluded.kind, title = excluded.title, text = excluded.text,
          meta = excluded.meta, status = excluded.status, updated_at = excluded.updated_at`;
      await tx`delete from knowledge_chunks where doc_id = ${doc.id}`;
      for (const c of chunks) {
        await tx`
          insert into knowledge_chunks (id, doc_id, idx, text, embedding)
          values (${c.id}, ${c.docId}, ${c.index}, ${c.text}, ${c.embedding.length ? JSON.stringify(c.embedding) : null}::extensions.vector)`;
      }
    });
    searchCache = null;
    return doc;
  },

  async setStatus(id: string, status: DocStatus) {
    const [row] = await sql()<DocRow[]>`update knowledge_docs set status = ${status}, updated_at = now() where id = ${id} returning *`;
    searchCache = null;
    return row ? toDoc(row) : null;
  },

  async remove(id: string) {
    const rows = await sql()`delete from knowledge_docs where id = ${id} returning id`;
    searchCache = null;
    return rows.length > 0;
  },

  async reindex() {
    const docs = (await sql()<DocRow[]>`select * from knowledge_docs`).map(toDoc);
    let chunkCount = 0;
    for (const doc of docs) {
      await pg.upsert(doc);
      chunkCount += chunkDoc(doc).length;
    }
    return { docs: docs.length, chunks: chunkCount };
  },
};

// ---------------------------------------------------------------- JSON-файл (локально без базы)

type FileDB = { embeddingModel: string; docs: KnowledgeDoc[]; chunks: Chunk[] };
const FILE = path.join(process.cwd(), ".data", "knowledge.json");
let fileCache: FileDB | null = null;
let queue: Promise<unknown> = Promise.resolve();

function seedDb(): FileDB {
  const docs = SEED_DOCS.map((d) => newDoc({ ...d, status: d.status ?? "approved" }));
  const chunks = docs.flatMap((doc) => chunkDoc(doc).map((text, index) => ({ id: `${doc.id}#${index}`, docId: doc.id, index, text, embedding: [] })));
  return { embeddingModel: "none", docs, chunks };
}

async function loadFile(): Promise<FileDB> {
  if (fileCache) return fileCache;
  try {
    fileCache = JSON.parse(await fs.readFile(FILE, "utf8")) as FileDB;
  } catch {
    fileCache = READ_ONLY ? seedDb() : { embeddingModel: EMBEDDING_MODEL, docs: [], chunks: [] };
  }
  return fileCache;
}

// Все изменения идут по очереди, чтобы параллельные запросы не затёрли файл.
function mutateFile<T>(fn: (db: FileDB) => Promise<T>): Promise<T> {
  if (READ_ONLY) return Promise.reject(new ReadOnlyError());
  const run = queue.then(async () => {
    const db = await loadFile();
    const result = await fn(db);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(`${FILE}.tmp`, JSON.stringify(db));
    await fs.rename(`${FILE}.tmp`, FILE);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

const file = {
  async list(): Promise<DocWithCount[]> {
    const db = await loadFile();
    return db.docs
      .map((d) => ({ ...d, chunkCount: db.chunks.filter((c) => c.docId === d.id).length }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async searchable(): Promise<Searchable> {
    const db = await loadFile();
    const approved = new Map(db.docs.filter((d) => d.status === "approved").map((d) => [d.id, d]));
    return { docs: approved, chunks: db.chunks.filter((c) => approved.has(c.docId)) };
  },
  upsert: (input: DocInput) =>
    mutateFile(async (db) => {
      const doc = newDoc(input, input.id ? db.docs.find((d) => d.id === input.id) : undefined);
      const chunks = await buildChunks(doc);
      db.docs = [...db.docs.filter((d) => d.id !== doc.id), doc];
      db.chunks = [...db.chunks.filter((c) => c.docId !== doc.id), ...chunks];
      return doc;
    }),
  setStatus: (id: string, status: DocStatus) =>
    mutateFile(async (db) => {
      const doc = db.docs.find((d) => d.id === id);
      if (!doc) return null;
      doc.status = status;
      doc.updatedAt = new Date().toISOString();
      return doc;
    }),
  remove: (id: string) =>
    mutateFile(async (db) => {
      const before = db.docs.length;
      db.docs = db.docs.filter((d) => d.id !== id);
      db.chunks = db.chunks.filter((c) => c.docId !== id);
      return db.docs.length < before;
    }),
  reindex: () =>
    mutateFile(async (db) => {
      const chunks: Chunk[] = [];
      for (const doc of db.docs) chunks.push(...(await buildChunks(doc)));
      db.chunks = chunks;
      db.embeddingModel = EMBEDDING_MODEL;
      return { docs: db.docs.length, chunks: chunks.length };
    }),
};

// ---------------------------------------------------------------- публичный API

const backend = DB_URL ? pg : file;
export const STORAGE = DB_URL ? "supabase" : READ_ONLY ? "readonly" : "file";

export const listDocs = () => backend.list();
export const getSearchable = () => backend.searchable();
export const upsertDoc = (input: DocInput) => backend.upsert(input);
export const setStatus = (id: string, status: DocStatus) => backend.setStatus(id, status);
export const deleteDoc = (id: string) => backend.remove(id);
export const reindexAll = () => backend.reindex();

export async function stats() {
  const docs = await listDocs();
  const count = (kind: KnowledgeKind) => docs.filter((d) => d.kind === kind && d.status === "approved").length;
  return {
    storage: STORAGE,
    embeddingModel: embeddingsEnabled() ? EMBEDDING_MODEL : "нет (поиск по ключевым словам)",
    needsReindex: false,
    readOnly: READ_ONLY,
    vectorSearch: embeddingsEnabled(),
    docs: docs.length,
    chunks: docs.reduce((s, d) => s + d.chunkCount, 0),
    pending: docs.filter((d) => d.status === "pending").length,
    approved: { experience: count("experience"), guide: count("guide"), fact: count("fact") },
  };
}
