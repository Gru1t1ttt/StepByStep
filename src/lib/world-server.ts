import type postgres from "postgres";
import { sql } from "./db";
import { hasProgramFilters, type Filters, type Program, type WorldUniversity, type WorldUniversityDetail } from "./world";

// Запросы к мировой базе университетов и программ (только сервер).

export const PAGE_SIZE = 24;

type Sql = postgres.Sql;
type Frag = postgres.PendingQuery<postgres.Row[]>;

const and = (db: Sql, parts: Frag[]) => parts.reduce((a, b) => db`${a} and ${b}`);

// Условия на программы: вуз попадает в выдачу, если у него есть подходящая опубликованная программа.
function programConds(db: Sql, f: Filters): Frag[] {
  const c: Frag[] = [db`p.published`];
  if (f.degree.length) c.push(db`p.degree in ${db(f.degree)}`);
  if (f.lang.length) c.push(db`p.language in ${db(f.lang)}`);
  if (f.pfield.length) c.push(db`p.field in ${db(f.pfield)}`);
  if (f.format.length) c.push(db`p.format in ${db(f.format)}`);
  if (f.ptuition) c.push(db`coalesce(p.tuition_usd, 0) <= ${Number(f.ptuition)}`);
  if (f.ielts) c.push(db`(p.ielts_min is null or p.ielts_min <= ${Number(f.ielts)})`);
  if (f.scholarships) c.push(db`p.scholarships <> ''`);
  return c;
}

function universityConds(db: Sql, f: Filters): Frag[] {
  const c: Frag[] = [db`true`];
  const q = f.q.toLowerCase();
  if (q) c.push(db`w.search_text ilike ${"%" + q + "%"}`);
  if (f.country.length) c.push(db`w.country_code in ${db(f.country)}`);
  if (f.continent.length) c.push(db`w.continent in ${db(f.continent)}`);
  if (f.field.length) c.push(db`w.fields && ${f.field}::text[]`);
  if (f.control.length) c.push(db`w.control in ${db(f.control)}`);
  if (f.top) c.push(db`w.science_rank <= ${Number(f.top)}`);
  if (f.est === "old") c.push(db`w.established < 1800`);
  if (f.est === "classic") c.push(db`w.established between 1800 and 1949`);
  if (f.est === "modern") c.push(db`w.established between 1950 and 1989`);
  if (f.est === "new") c.push(db`w.established >= 1990`);
  if (f.adm) c.push(db`w.admission_rate <= ${Number(f.adm)}`);
  if (f.tuition) c.push(db`w.tuition_out <= ${Number(f.tuition)}`);
  if (f.sat) c.push(db`w.sat_avg <= ${Number(f.sat)}`);
  if (f.curated) c.push(db`w.curated_id is not null`);
  if (hasProgramFilters(f)) c.push(db`exists (select 1 from public.programs p where p.university_id = w.id and ${and(db, programConds(db, f))})`);
  return c;
}

function order(db: Sql, f: Filters) {
  const q = f.q.toLowerCase();
  // при поиске по названию точное совпадение и начало названия — выше
  const byQuery = q ? db`(lower(w.name) = ${q}) desc, (w.search_text like ${q + "%"}) desc,` : db``;
  switch (f.sort) {
    case "name":
      return db`order by ${byQuery} w.name`;
    case "oldest":
      return db`order by ${byQuery} w.established asc nulls last, w.science_rank nulls last`;
    case "admission":
      return db`order by ${byQuery} w.admission_rate asc nulls last`;
    case "cheap":
      return db`order by ${byQuery} w.tuition_out asc nulls last`;
    default:
      return db`order by ${byQuery} w.science_rank asc nulls last, w.name`;
  }
}

type Row = Record<string, unknown>;

const toUniversity = (r: Row): WorldUniversity => ({
  id: r.id as string,
  name: r.name as string,
  nameRu: ((r.names as Record<string, string>) ?? {}).ru ?? null,
  countryCode: r.country_code as string | null,
  continent: r.continent as string | null,
  region: r.region as string,
  city: r.city as string,
  homepage: r.homepage as string,
  established: r.established as number | null,
  control: r.control as string | null,
  students: r.students as number | null,
  admissionRate: r.admission_rate == null ? null : Number(r.admission_rate),
  satAvg: r.sat_avg as number | null,
  tuitionIn: r.tuition_in as number | null,
  tuitionOut: r.tuition_out as number | null,
  scienceRank: r.science_rank as number | null,
  fields: r.fields as string[],
  curatedId: r.curated_id as string | null,
  programs: Number(r.programs ?? 0),
});

const toProgram = (r: Row): Program => ({
  id: r.id as string,
  universityId: r.university_id as string,
  universityName: (r.university_name as string) ?? undefined,
  name: r.name as string,
  degree: r.degree as string,
  field: r.field as string | null,
  language: r.language as string,
  durationMonths: r.duration_months as number | null,
  format: r.format as string,
  studyMode: r.study_mode as string,
  tuitionAmount: r.tuition_amount as number | null,
  tuitionCurrency: r.tuition_currency as string,
  tuitionUsd: r.tuition_usd as number | null,
  ieltsMin: r.ielts_min == null ? null : Number(r.ielts_min),
  toeflMin: r.toefl_min as number | null,
  satMin: r.sat_min as number | null,
  requirements: r.requirements as string,
  deadline: r.deadline ? new Date(r.deadline as string).toISOString().slice(0, 10) : null,
  deadlineNote: r.deadline_note as string,
  startMonth: r.start_month as string,
  scholarships: r.scholarships as string,
  url: r.url as string,
  checkedAt: r.checked_at ? new Date(r.checked_at as string).toISOString().slice(0, 10) : "",
  published: r.published as boolean,
});

export async function searchUniversities(f: Filters, page: number) {
  const db = sql();
  const where = and(db, universityConds(db, f));
  const progWhere = hasProgramFilters(f) ? and(db, programConds(db, f)) : db`p.published`;
  const [rows, [{ total }]] = await Promise.all([
    db`
      select w.id, w.name, w.names, w.country_code, w.continent, w.region, w.city, w.homepage, w.established, w.control,
             w.students, w.admission_rate, w.sat_avg, w.tuition_in, w.tuition_out, w.science_rank, w.fields, w.curated_id,
             (select count(*) from public.programs p where p.university_id = w.id and ${progWhere}) as programs
      from public.world_universities w
      where ${where}
      ${order(db, f)}
      limit ${PAGE_SIZE} offset ${page * PAGE_SIZE}`,
    db`select count(*)::int as total from public.world_universities w where ${where}`,
  ]);
  return { items: rows.map(toUniversity), total: total as number };
}

// Для панели фильтров: страны с числом вузов и сколько есть программ.
export async function worldMeta() {
  const db = sql();
  const [countries, [stats]] = await Promise.all([
    db`select country_code as code, continent, count(*)::int as n from public.world_universities where country_code is not null group by 1, 2 order by n desc`,
    db`select (select count(*)::int from public.world_universities) as universities, (select count(*)::int from public.programs where published) as programs`,
  ]);
  // у страны может встретиться несколько континентов (Россия, Турция) — берём самый частый
  const byCode = new Map<string, { code: string; continent: string | null; n: number }>();
  for (const c of countries) {
    const prev = byCode.get(c.code);
    if (prev) prev.n += c.n;
    else byCode.set(c.code, { code: c.code, continent: c.continent, n: c.n });
  }
  return { countries: [...byCode.values()], universities: stats.universities as number, programs: stats.programs as number };
}

export async function universityDetail(id: string, withHidden = false): Promise<WorldUniversityDetail | null> {
  const db = sql();
  const [r] = await db`select * from public.world_universities where id = ${id}`;
  if (!r) return null;
  const programs = await db`
    select * from public.programs where university_id = ${id} ${withHidden ? db`` : db`and published`}
    order by degree, name`;
  return {
    ...toUniversity({ ...r, programs: programs.length }),
    names: r.names,
    acronyms: r.acronyms,
    lat: r.lat,
    lng: r.lng,
    worksCount: r.works_count,
    citedByCount: Number(r.cited_by_count),
    hIndex: r.h_index,
    fieldScores: r.field_scores,
    rorId: r.ror_id,
    openalexId: r.openalex_id,
    scorecardId: r.scorecard_id,
    programList: programs.map(toProgram),
  };
}

// ——— программы (админка) ———

export async function listPrograms() {
  const db = sql();
  const rows = await db`
    select p.*, w.name as university_name from public.programs p
    join public.world_universities w on w.id = p.university_id
    order by p.updated_at desc`;
  return rows.map(toProgram);
}

export type ProgramInput = Omit<Program, "id" | "universityName" | "checkedAt"> & { id?: string };

export async function saveProgram(p: ProgramInput) {
  const db = sql();
  const row = {
    university_id: p.universityId,
    name: p.name.trim(),
    degree: p.degree,
    field: p.field || null,
    language: p.language || "English",
    duration_months: p.durationMonths || null,
    format: p.format,
    study_mode: p.studyMode,
    tuition_amount: p.tuitionAmount ?? null,
    tuition_currency: (p.tuitionCurrency || "USD").toUpperCase(),
    tuition_usd: p.tuitionUsd ?? null,
    ielts_min: p.ieltsMin ?? null,
    toefl_min: p.toeflMin ?? null,
    sat_min: p.satMin ?? null,
    requirements: p.requirements ?? "",
    deadline: p.deadline || null,
    deadline_note: p.deadlineNote ?? "",
    start_month: p.startMonth ?? "",
    scholarships: p.scholarships ?? "",
    url: p.url.trim(),
    published: p.published,
  };
  if (p.id) {
    await db`update public.programs set ${db(row)}, checked_at = current_date, updated_at = now() where id = ${p.id}`;
    return p.id;
  }
  const [{ id }] = await db`insert into public.programs ${db(row)} returning id`;
  return id as string;
}

export async function deleteProgram(id: string) {
  await sql()`delete from public.programs where id = ${id}`;
}
