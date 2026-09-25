import { createClient, type User } from "@supabase/supabase-js";

// Проверка пользователя на сервере по токену из заголовка Authorization: Bearer <access_token>.
// Если Supabase не настроен (локально без базы), проверка отключена и возвращается { guest: true }.

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export const authConfigured = Boolean(url && serviceKey);

const admin = authConfigured ? createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

export async function getRequestUser(req: Request): Promise<{ user: User } | { guest: true } | null> {
  if (!admin) return { guest: true };
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error || !data.user ? null : { user: data.user };
}
