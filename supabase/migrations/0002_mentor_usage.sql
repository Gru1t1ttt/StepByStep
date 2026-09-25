-- Лимит сообщений ИИ-наставнику: сколько сообщений пользователь отправил за день.
-- Пишет и читает только сервер (service role); из браузера таблица закрыта.

create table if not exists public.mentor_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

alter table public.mentor_usage enable row level security;

-- Атомарно увеличивает счётчик и возвращает новое значение.
create or replace function public.bump_mentor_usage(p_user uuid)
returns int
language sql
security definer
set search_path = public
as $$
  insert into public.mentor_usage (user_id, day, count)
  values (p_user, current_date, 1)
  on conflict (user_id, day) do update set count = public.mentor_usage.count + 1
  returning count;
$$;

revoke all on function public.bump_mentor_usage(uuid) from public, anon, authenticated;
