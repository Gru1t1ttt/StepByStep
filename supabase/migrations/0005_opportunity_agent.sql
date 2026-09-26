-- ИИ-агент возможностей: источники, которые он проверяет, и находки, ждущие проверки человеком.
-- Плюс переводы карточек возможностей на казахский и английский.

alter table public.opportunities add column if not exists i18n jsonb not null default '{}'; -- {"kz": {"title", "description"}, "en": {...}}
alter table public.opportunities add column if not exists source_url text not null default '';

create table if not exists public.opportunity_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  kind text not null default 'page', -- page | telegram
  active boolean not null default true,
  last_checked_at timestamptz,
  last_hash text, -- если страница не изменилась, ИИ не вызываем
  last_error text,
  found_total int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_candidates (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.opportunity_sources (id) on delete set null,
  source_url text not null default '',
  data jsonb not null, -- поля карточки + переводы, как их понял ИИ
  dedupe_key text not null unique, -- нормализованное название + год дедлайна
  status text not null default 'pending', -- pending | approved | rejected
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists opportunity_candidates_status_idx on public.opportunity_candidates (status, created_at desc);

-- Только сервер (админка и агент): публичного доступа нет.
alter table public.opportunity_sources enable row level security;
alter table public.opportunity_candidates enable row level security;
