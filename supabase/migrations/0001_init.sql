-- StepByStep: начальная схема базы данных.
--
-- user_state        — всё, что ученик делает на платформе (профиль, цели, план, портфолио, чат).
--                     Каждый видит и меняет только свою строку (Row Level Security).
-- knowledge_docs    — база знаний ИИ-наставника: опыт поступивших, гайды, факты.
-- knowledge_chunks  — куски документов с эмбеддингами для поиска (RAG).
--                     Доступ к базе знаний — только с сервера (service role), из браузера закрыт.

create extension if not exists vector with schema extensions;

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "user_state: read own" on public.user_state;
create policy "user_state: read own" on public.user_state
  for select using ((select auth.uid()) = user_id);

drop policy if exists "user_state: insert own" on public.user_state;
create policy "user_state: insert own" on public.user_state
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "user_state: update own" on public.user_state;
create policy "user_state: update own" on public.user_state
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.knowledge_docs (
  id text primary key,
  kind text not null check (kind in ('experience', 'guide', 'fact')),
  title text not null,
  text text not null,
  meta jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id text primary key,
  doc_id text not null references public.knowledge_docs (id) on delete cascade,
  idx int not null,
  text text not null,
  -- multilingual-e5-small даёт 384 числа; null, если чанк добавлен там, где модели нет (Vercel)
  embedding extensions.vector(384)
);

create index if not exists knowledge_chunks_doc_id_idx on public.knowledge_chunks (doc_id);
create index if not exists knowledge_docs_status_idx on public.knowledge_docs (status);

-- RLS включён без политик: из браузера (anon key) таблицы базы знаний недоступны вовсе.
alter table public.knowledge_docs enable row level security;
alter table public.knowledge_chunks enable row level security;

create table if not exists public.schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);
alter table public.schema_migrations enable row level security;
