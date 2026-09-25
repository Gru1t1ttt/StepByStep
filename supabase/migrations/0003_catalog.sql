-- Каталог: возможности (олимпиады, конкурсы, летние школы…) и университеты.
-- Раньше лежали в коде (src/data), теперь их ведёт команда через /admin.
-- Читать опубликованные записи может кто угодно (сайт грузит их из браузера),
-- менять — только сервер (service role) по запросам из админки.

create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  type text not null,
  interests text[] not null default '{}',
  min_grade int not null default 7,
  max_grade int not null default 12,
  format text not null default 'Онлайн',
  location text not null default '',
  free boolean not null default true,
  deadline date not null,
  prep_weeks int not null default 4,
  url text not null default '',
  description text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.universities (
  id text primary key,
  name text not null,
  country text not null,
  city text not null default '',
  qs_rank int,
  majors text[] not null default '{}',
  tuition_usd int not null default 0,
  grants text not null default 'Нет грантов',
  ielts numeric(2, 1) not null default 6.5,
  sat int,
  gpa numeric(2, 1) not null default 4.5,
  olympiads int not null default 0,
  activities int not null default 2,
  research boolean not null default false,
  deadline date not null,
  url text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;
alter table public.universities enable row level security;

drop policy if exists "opportunities: public read" on public.opportunities;
create policy "opportunities: public read" on public.opportunities for select using (published);

drop policy if exists "universities: public read" on public.universities;
create policy "universities: public read" on public.universities for select using (published);

create index if not exists opportunities_deadline_idx on public.opportunities (deadline);
