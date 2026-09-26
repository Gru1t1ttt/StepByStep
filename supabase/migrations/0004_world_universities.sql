-- Мировая база университетов и каталог программ.
--
-- world_universities — все вузы мира из открытых источников (свободная лицензия CC0 / public domain):
--   OpenAlex — список, город, координаты, сайт, сильные направления и научные показатели;
--   ROR — год основания, названия на разных языках, регион;
--   College Scorecard (правительство США) — тип вуза, процент поступивших, SAT, стоимость, число студентов.
-- Заполняется скриптом scripts/import-world-universities.mjs, сайт только читает.
--
-- programs — программы обучения (бакалавриат, магистратура…), их вносит команда через админку:
-- ИИ достаёт поля с официальной страницы программы, человек проверяет и публикует.

create extension if not exists pg_trgm with schema extensions;

create table if not exists public.world_universities (
  id text primary key, -- OpenAlex ID (I27837315) или US-<UNITID> для вузов только из College Scorecard
  openalex_id text,
  ror_id text,
  scorecard_id int,
  name text not null,
  names jsonb not null default '{}', -- названия по языкам: {"ru": "...", "kk": "..."}
  acronyms text[] not null default '{}',
  search_text text not null default '', -- все названия и сокращения в нижнем регистре — для поиска
  country_code char(2),
  continent text, -- AF AN AS EU NA OC SA
  region text not null default '',
  city text not null default '',
  lat double precision,
  lng double precision,
  homepage text not null default '',
  established int,
  control text, -- public | private | for_profit (пока только США)
  students int, -- студенты бакалавриата (пока только США)
  admission_rate numeric(5, 4), -- доля принятых, 0–1 (США)
  sat_avg int,
  tuition_in int, -- $/год для жителей штата (США)
  tuition_out int, -- $/год для остальных, в том числе иностранцев (США)
  works_count int not null default 0,
  cited_by_count bigint not null default 0,
  h_index int not null default 0,
  science_rank int, -- место по цитируемости среди всех вузов базы
  fields text[] not null default '{}', -- сильные направления (поля OpenAlex, английские ключи)
  field_scores jsonb not null default '{}', -- доля публикаций по направлениям, 0–1
  curated_id text references public.universities (id) on delete set null, -- наша карточка с требованиями
  updated_at timestamptz not null default now()
);

create index if not exists world_universities_search_idx on public.world_universities using gin (search_text extensions.gin_trgm_ops);
create index if not exists world_universities_country_idx on public.world_universities (country_code);
create index if not exists world_universities_continent_idx on public.world_universities (continent);
create index if not exists world_universities_fields_idx on public.world_universities using gin (fields);
create index if not exists world_universities_rank_idx on public.world_universities (science_rank);

alter table public.world_universities enable row level security;
drop policy if exists "world_universities: public read" on public.world_universities;
create policy "world_universities: public read" on public.world_universities for select using (true);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id text not null references public.world_universities (id) on delete cascade,
  name text not null,
  degree text not null default 'bachelor', -- foundation | bachelor | master | phd
  field text, -- направление (те же ключи, что world_universities.fields)
  language text not null default 'English',
  duration_months int,
  format text not null default 'on_campus', -- on_campus | online | blended
  study_mode text not null default 'full_time', -- full_time | part_time
  tuition_amount int, -- за год, в валюте вуза
  tuition_currency text not null default 'USD',
  tuition_usd int, -- за год, пересчитано в доллары — для фильтра
  ielts_min numeric(2, 1),
  toefl_min int,
  sat_min int,
  requirements text not null default '', -- кратко: документы, экзамены, средний балл
  deadline date,
  deadline_note text not null default '',
  start_month text not null default '',
  scholarships text not null default '',
  url text not null, -- официальная страница — источник данных
  checked_at date not null default current_date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programs_university_idx on public.programs (university_id);
create index if not exists programs_filter_idx on public.programs (published, degree, field);

alter table public.programs enable row level security;
drop policy if exists "programs: public read" on public.programs;
create policy "programs: public read" on public.programs for select using (published);
