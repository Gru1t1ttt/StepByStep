// Загружает мировую базу университетов в Supabase (таблица world_universities).
//
// Источники (все со свободной лицензией, можно использовать в коммерческом продукте):
//   OpenAlex (CC0)            — все учебные заведения мира, сайт, город, сильные направления, цитируемость;
//   ROR (CC0)                 — год основания, названия на разных языках, континент и регион;
//   College Scorecard (public domain, правительство США) — тип вуза, процент поступивших, SAT, стоимость.
//
// Запуск: npm run db:universities   (данные кэшируются в .data/, повторный запуск просто обновляет базу)
// Обновлять раз в месяц-два: OpenAlex и ROR пополняются постоянно, Scorecard — раз в год.

import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import postgres from "postgres";

process.loadEnvFile?.(".env.local");
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) {
  console.error("Нет POSTGRES_URL — выполните `npx vercel env pull .env.local`.");
  process.exit(1);
}

const DATA = path.join(process.cwd(), ".data");
mkdirSync(DATA, { recursive: true });

// ——— загрузка файлов ———

async function download(fileUrl, dest) {
  console.log(`  скачиваю ${fileUrl}`);
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`${res.status} ${fileUrl}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function unzip(zip, dir) {
  execFileSync("unzip", ["-o", "-q", zip, "-d", dir]);
}

async function rorFile() {
  const dir = path.join(DATA, "ror");
  const have = existsSync(dir) && readdirSync(dir).find((f) => f.endsWith("ror-data.json"));
  if (have) return path.join(dir, have);
  mkdirSync(dir, { recursive: true });
  const meta = await (await fetch("https://zenodo.org/api/communities/ror-data/records?sort=newest&size=1")).json();
  const file = meta.hits.hits[0].files.find((f) => f.key.endsWith(".zip"));
  await download(file.links.self, path.join(dir, "ror.zip"));
  unzip(path.join(dir, "ror.zip"), dir);
  return path.join(dir, readdirSync(dir).find((f) => f.endsWith("ror-data.json")));
}

async function scorecardFile() {
  const dir = path.join(DATA, "scorecard");
  const csv = path.join(dir, "Most-Recent-Cohorts-Institution.csv");
  if (existsSync(csv)) return csv;
  mkdirSync(dir, { recursive: true });
  const page = await (await fetch("https://collegescorecard.ed.gov/data/")).text();
  const link = page.match(/https:\/\/[^"]*Most-Recent-Cohorts-Institution[^"]*\.zip/)?.[0];
  if (!link) throw new Error("Не нашёл ссылку на College Scorecard на collegescorecard.ed.gov/data/");
  await download(link, path.join(dir, "scorecard.zip"));
  unzip(path.join(dir, "scorecard.zip"), dir);
  return csv;
}

async function openalexInstitutions() {
  const cache = path.join(DATA, "openalex-education.json");
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  const select = "id,ror,display_name,country_code,geo,homepage_url,works_count,cited_by_count,summary_stats,topics,display_name_acronyms,display_name_alternatives";
  const all = [];
  let cursor = "*";
  while (cursor) {
    const res = await fetch(`https://api.openalex.org/institutions?filter=type:education&per-page=200&select=${select}&cursor=${encodeURIComponent(cursor)}`);
    if (!res.ok) {
      console.log(`  OpenAlex ответил ${res.status}, повторяю через 5 с`);
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    const data = await res.json();
    all.push(...data.results);
    cursor = data.meta.next_cursor;
    process.stdout.write(`\r  OpenAlex: ${all.length} из ${data.meta.count}`);
  }
  process.stdout.write("\n");
  writeFileSync(cache, JSON.stringify(all));
  return all;
}

// ——— разбор ———

const short = (id) => (id ? id.replace(/^https?:\/\/[^/]+\//, "") : null);
const domain = (u) =>
  (u || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\d?\./, "")
    .split(/[/?#]/)[0]
    .trim();
const normName = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/^the /, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

// CSV с кавычками (College Scorecard) — построчно, поля без переносов строк
function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    }
    else cur += c;
  }
  out.push(cur);
  return out;
}

async function readScorecard(file) {
  const rl = readline.createInterface({ input: createReadStream(file) });
  let head = null;
  const rows = [];
  for await (const line of rl) {
    const cells = parseCsvLine(line);
    if (!head) {
      head = Object.fromEntries(cells.map((c, i) => [c.replace(/^﻿/, ""), i]));
      continue;
    }
    const get = (k) => {
      const v = cells[head[k]];
      return v === undefined || v === "NULL" || v === "PrivacySuppressed" || v === "" ? null : v;
    };
    // только действующие вузы, где можно получить степень бакалавра и выше
    if (get("CURROPER") !== "1" || Number(get("HIGHDEG")) < 3 || Number(get("PREDDEG")) < 2) continue;
    const num = (k) => (get(k) === null ? null : Number(get(k)));
    rows.push({
      unitid: Number(get("UNITID")),
      name: get("INSTNM"),
      url: get("INSTURL"),
      city: get("CITY") ?? "",
      state: get("STABBR") ?? "",
      control: { 1: "public", 2: "private", 3: "for_profit" }[get("CONTROL")] ?? null,
      lat: num("LATITUDE"),
      lng: num("LONGITUDE"),
      admission: num("ADM_RATE"),
      sat: num("SAT_AVG"),
      tuitionIn: num("TUITIONFEE_IN"),
      tuitionOut: num("TUITIONFEE_OUT"),
      students: num("UGDS"),
    });
  }
  return rows;
}

// Сильные направления: доля публикаций по полям науки среди главных тем вуза.
function fieldsOf(topics = []) {
  const sum = {};
  let total = 0;
  for (const t of topics) {
    const f = t.field?.display_name;
    if (!f) continue;
    sum[f] = (sum[f] ?? 0) + t.count;
    total += t.count;
  }
  if (!total) return { fields: [], scores: {} };
  const scores = Object.fromEntries(
    Object.entries(sum)
      .map(([f, n]) => [f, Math.round((n / total) * 1000) / 1000])
      .sort((a, b) => b[1] - a[1]),
  );
  const fields = Object.entries(scores)
    .filter(([, s]) => s >= 0.08)
    .slice(0, 6)
    .map(([f]) => f);
  return { fields, scores };
}

// ——— основной ход ———

console.log("1/5 ROR");
const rorRaw = JSON.parse(readFileSync(await rorFile(), "utf8"));
const ror = new Map();
const continentByCountry = new Map();
for (const r of rorRaw) {
  const loc = r.locations?.[0]?.geonames_details;
  if (loc?.country_code && loc.continent_code) continentByCountry.set(loc.country_code, loc.continent_code);
  const names = {};
  for (const n of r.names ?? []) if (n.lang && n.types.includes("label") && !names[n.lang]) names[n.lang] = n.value;
  ror.set(short(r.id), {
    established: r.established ?? null,
    names,
    extraNames: (r.names ?? []).map((n) => n.value),
    continent: loc?.continent_code ?? null,
    region: loc?.country_subdivision_name ?? "",
    website: r.links?.find((l) => l.type === "website")?.value ?? "",
    status: r.status,
  });
}
console.log(`  записей: ${ror.size}`);

console.log("2/5 OpenAlex");
const oa = await openalexInstitutions();

console.log("3/5 College Scorecard");
const scorecard = await readScorecard(await scorecardFile());
console.log(`  вузов США с бакалавриатом: ${scorecard.length}`);

console.log("4/5 объединение");
const rows = [];
const byDomain = new Map();
const byName = new Map();
for (const i of oa) {
  const rorId = short(i.ror);
  const r = rorId ? ror.get(rorId) : null;
  if (r?.status && r.status !== "active") continue;
  const { fields, scores } = fieldsOf(i.topics);
  const alt = [...(i.display_name_alternatives ?? []), ...(r?.extraNames ?? [])];
  const row = {
    id: short(i.id),
    openalex_id: short(i.id),
    ror_id: rorId,
    scorecard_id: null,
    name: i.display_name,
    names: r?.names ?? {},
    acronyms: i.display_name_acronyms ?? [],
    search_text: [...new Set([i.display_name, ...alt, ...(i.display_name_acronyms ?? [])].map((s) => s.toLowerCase()))].join(" | "),
    country_code: i.country_code ?? i.geo?.country_code ?? null,
    continent: r?.continent ?? continentByCountry.get(i.country_code) ?? null,
    region: i.geo?.region ?? r?.region ?? "",
    city: i.geo?.city ?? "",
    lat: i.geo?.latitude ?? null,
    lng: i.geo?.longitude ?? null,
    homepage: i.homepage_url ?? r?.website ?? "",
    established: r?.established ?? null,
    control: null,
    students: null,
    admission_rate: null,
    sat_avg: null,
    tuition_in: null,
    tuition_out: null,
    works_count: i.works_count ?? 0,
    cited_by_count: i.cited_by_count ?? 0,
    h_index: i.summary_stats?.h_index ?? 0,
    science_rank: null,
    fields,
    field_scores: scores,
  };
  rows.push(row);
  if (row.country_code === "US") {
    const d = domain(row.homepage);
    if (d && !byDomain.has(d)) byDomain.set(d, row);
    byName.set(normName(row.name), row);
  }
}

let matched = 0;
for (const s of scorecard) {
  const row = byDomain.get(domain(s.url)) ?? byName.get(normName(s.name));
  const us = {
    scorecard_id: s.unitid,
    control: s.control,
    students: s.students,
    admission_rate: s.admission,
    sat_avg: s.sat,
    tuition_in: s.tuitionIn,
    tuition_out: s.tuitionOut,
  };
  if (row && !row.scorecard_id) {
    Object.assign(row, us);
    matched++;
  } else if (!row) {
    // вуз есть только в College Scorecard (часто небольшие колледжи без научных публикаций)
    rows.push({
      id: `US-${s.unitid}`,
      openalex_id: null,
      ror_id: null,
      name: s.name,
      names: {},
      acronyms: [],
      search_text: s.name.toLowerCase(),
      country_code: "US",
      continent: "NA",
      region: s.state,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
      homepage: s.url ? (s.url.startsWith("http") ? s.url : `https://${s.url}`) : "",
      established: null,
      works_count: 0,
      cited_by_count: 0,
      h_index: 0,
      science_rank: null,
      fields: [],
      field_scores: {},
      ...us,
    });
  }
}
console.log(`  College Scorecard: совпало с OpenAlex ${matched}, добавлено отдельно ${scorecard.length - matched}`);

// целые поля в базе — int: округляем всё, что пришло дробным или строкой
const INT = ["scorecard_id", "established", "students", "sat_avg", "tuition_in", "tuition_out", "works_count", "cited_by_count", "h_index"];
for (const r of rows) for (const k of INT) r[k] = r[k] == null || Number.isNaN(Number(r[k])) ? (k.endsWith("count") || k === "h_index" ? 0 : null) : Math.round(Number(r[k]));

rows.sort((a, b) => b.cited_by_count - a.cited_by_count);
rows.forEach((r, i) => (r.science_rank = r.cited_by_count > 0 ? i + 1 : null));
console.log(`  всего вузов: ${rows.length}`);

console.log("5/5 запись в Supabase");
const sql = postgres(url, { ssl: "require", max: 1, prepare: false, onnotice: () => {} });
const COLS = Object.keys(rows[0]);
try {
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500).map((r) => ({ ...r, names: sql.json(r.names), field_scores: sql.json(r.field_scores) }));
    await sql`
      insert into public.world_universities ${sql(batch, COLS)}
      on conflict (id) do update set ${sql(Object.fromEntries(COLS.filter((c) => c !== "id").map((c) => [c, sql`excluded.${sql(c)}`])))}, updated_at = now()`;
    process.stdout.write(`\r  ${Math.min(i + 500, rows.length)} / ${rows.length}`);
  }
  process.stdout.write("\n");

  // связь с нашими карточками вузов (требования, гранты, дедлайны) — по сайту или названию
  const curated = await sql`select id, name, url from public.universities`;
  let linked = 0;
  for (const u of curated) {
    const d = domain(u.url);
    const plain = u.name.replace(/\(.*?\)/g, "").trim().toLowerCase(); // «ELTE (Stipendium Hungaricum)» → «elte»
    let [hit] = await sql`
      select id from public.world_universities
      where (${d} <> '' and (homepage ilike ${"%" + d + "%"})) or lower(name) = ${plain}
      order by cited_by_count desc limit 1`;
    // запасной вариант — по всем названиям и сокращениям (TU Delft, KAIST, NYU Abu Dhabi)
    [hit] = hit
      ? [hit]
      : await sql`
          select id from public.world_universities
          where search_text ilike ${"%" + plain + "%"}
          order by cited_by_count desc limit 1`;
    if (hit) {
      await sql`update public.world_universities set curated_id = null where curated_id = ${u.id}`;
      await sql`update public.world_universities set curated_id = ${u.id} where id = ${hit.id}`;
      linked++;
    } else console.log(`  не нашёл в мировой базе: ${u.name}`);
  }
  console.log(`  связано с нашими карточками: ${linked} из ${curated.length}`);
} finally {
  await sql.end();
}
