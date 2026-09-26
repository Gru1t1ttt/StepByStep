import { OPPORTUNITIES } from "@/data/opportunities";
import { UNIVERSITIES } from "@/data/universities";
import { sql } from "@/lib/db";
import { oppFromRow, uniFromRow, type OppRow, type UniRow } from "./catalog-map";

// Каталог на сервере (для админки): все записи, включая неопубликованные.
// Сайт читает опубликованные записи напрямую из браузера — см. src/lib/catalog.ts.

export type CatalogKind = "opportunities" | "universities";
export type { AdminOpportunity, AdminUniversity } from "./catalog-map";
import type { AdminOpportunity, AdminUniversity } from "./catalog-map";

export async function listCatalog(kind: CatalogKind) {
  if (kind === "opportunities") return (await sql()<OppRow[]>`select * from opportunities order by deadline`).map(oppFromRow);
  return (await sql()<UniRow[]>`select * from universities order by qs_rank nulls last, name`).map(uniFromRow);
}

// Кириллица (русская и казахская) → латиница для id.
const TRANSLIT: Record<string, string> = {
  а: "a", ә: "a", б: "b", в: "v", г: "g", ғ: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "i", і: "i", к: "k", қ: "q",
  л: "l", м: "m", н: "n", ң: "n", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ұ: "u", ү: "u", ф: "f", х: "h", һ: "h",
  ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

// Человекочитаемый id из названия: «Олимпиада по физике» → «olimpiada-po-fizike».
export function slugify(text: string) {
  const s = [...text.toLowerCase()]
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || crypto.randomUUID();
}

export async function upsertOpportunity(o: AdminOpportunity) {
  const id = o.id || slugify(o.title);
  await sql()`
    insert into opportunities (id, title, type, interests, min_grade, max_grade, format, location, free, deadline, prep_weeks, url, description, i18n, published, updated_at)
    values (${id}, ${o.title}, ${o.type}, ${o.interests}, ${o.minGrade}, ${o.maxGrade}, ${o.format}, ${o.location}, ${o.free}, ${o.deadline},
            ${o.prepWeeks}, ${o.url}, ${o.description}, ${sql().json(o.i18n ?? {})}, ${o.published}, now())
    on conflict (id) do update set title = excluded.title, type = excluded.type, interests = excluded.interests,
      min_grade = excluded.min_grade, max_grade = excluded.max_grade, format = excluded.format, location = excluded.location,
      free = excluded.free, deadline = excluded.deadline, prep_weeks = excluded.prep_weeks, url = excluded.url,
      description = excluded.description, i18n = excluded.i18n, published = excluded.published, updated_at = now()`;
  return id;
}

export async function upsertUniversity(u: AdminUniversity) {
  const id = u.id || slugify(u.name);
  await sql()`
    insert into universities (id, name, country, city, qs_rank, majors, tuition_usd, grants, ielts, sat, gpa, olympiads, activities, research, deadline, url, published, updated_at)
    values (${id}, ${u.name}, ${u.country}, ${u.city}, ${u.qsRank || null}, ${u.majors}, ${u.tuitionUsd}, ${u.grants}, ${u.ielts}, ${u.sat},
            ${u.gpa}, ${u.olympiads}, ${u.activities}, ${u.research}, ${u.deadline}, ${u.url ?? ""}, ${u.published}, now())
    on conflict (id) do update set name = excluded.name, country = excluded.country, city = excluded.city, qs_rank = excluded.qs_rank,
      majors = excluded.majors, tuition_usd = excluded.tuition_usd, grants = excluded.grants, ielts = excluded.ielts, sat = excluded.sat,
      gpa = excluded.gpa, olympiads = excluded.olympiads, activities = excluded.activities, research = excluded.research,
      deadline = excluded.deadline, url = excluded.url, published = excluded.published, updated_at = now()`;
  return id;
}

export async function deleteCatalogItem(kind: CatalogKind, id: string) {
  const rows =
    kind === "opportunities" ? await sql()`delete from opportunities where id = ${id} returning id` : await sql()`delete from universities where id = ${id} returning id`;
  return rows.length > 0;
}

// Стартовые демо-данные из src/data — чтобы каталог не был пустым, пока команда не внесёт реальные.
export async function seedCatalog() {
  for (const o of OPPORTUNITIES) await upsertOpportunity({ ...o, published: true });
  for (const u of UNIVERSITIES) await upsertUniversity({ ...u, published: true });
  return { opportunities: OPPORTUNITIES.length, universities: UNIVERSITIES.length };
}
