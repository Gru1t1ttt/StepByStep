import postgres from "postgres";

// Подключение к Postgres (Supabase) с сервера. POSTGRES_URL задаёт интеграция Supabase в Vercel.
export const DB_URL = process.env.POSTGRES_URL;

let client: postgres.Sql | null = null;

export function sql() {
  if (!DB_URL) throw new Error("POSTGRES_URL не задан");
  // prepare: false — пул Supabase работает в transaction mode и не поддерживает prepared statements.
  client ??= postgres(DB_URL, { ssl: "require", prepare: false, max: 3, idle_timeout: 20 });
  return client;
}
