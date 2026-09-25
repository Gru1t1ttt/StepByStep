// Применяет SQL-миграции из supabase/migrations по порядку (каждую один раз).
// Запуск: npm run db:migrate  (берёт POSTGRES_URL_NON_POOLING или POSTGRES_URL из .env.local)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

process.loadEnvFile?.(".env.local");
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) {
  console.error("Нет POSTGRES_URL — сначала подключите Supabase и выполните `npx vercel env pull .env.local`.");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, prepare: false, onnotice: () => {} });
const dir = path.join(process.cwd(), "supabase", "migrations");

try {
  await sql`create table if not exists public.schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const applied = new Set((await sql`select name from public.schema_migrations`).map((r) => r.name));
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(file)) {
      console.log(`✓ ${file} (уже применена)`);
      continue;
    }
    const body = await readFile(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into public.schema_migrations (name) values (${file})`;
    });
    console.log(`✓ ${file}`);
  }
} finally {
  await sql.end();
}
