// Доступ к админке базы знаний: заголовок x-admin-token должен совпадать с ADMIN_TOKEN.
// Если ADMIN_TOKEN не задан, админка открыта только при локальной разработке.
export function isAdmin(req: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return process.env.NODE_ENV !== "production";
  return req.headers.get("x-admin-token") === token;
}

export const forbidden = () => Response.json({ error: "Нет доступа" }, { status: 401 });

// Ошибка записи в базу (например, на Vercel до подключения Supabase) — понятный ответ вместо 500.
export function writeFailed(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : "Не удалось сохранить" }, { status: 503 });
}
