"use client";

import { ArrowLeft, CalendarDays, Clock, ExternalLink, Globe2, GraduationCap, Languages, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge, Card, buttonClass, ghostButtonClass } from "@/components/platform/ui";
import { formatDate, gapAnalysis, readiness } from "@/lib/analysis";
import { useCatalog } from "@/lib/catalog";
import { toggleIn, updateState, usePlatform } from "@/lib/store";
import { fmt } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/client";
import { LOCALE, tv } from "@/lib/i18n/values";
import { countryName, worldLabels, type Program, type WorldUniversityDetail } from "@/lib/world";

function useMoney() {
  const locale = LOCALE[useLang()];
  return (n: number | null, currency = "USD") => (n == null ? "" : currency === "USD" ? `$${n.toLocaleString(locale)}` : `${n.toLocaleString(locale)} ${currency}`);
}

function Fact({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-display text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ProgramCard({ p }: { p: Program }) {
  const t = useT().app.uni;
  const lang = useLang();
  const money = useMoney();
  const { fields: FIELDS, degrees: DEGREES, formats: FORMATS, studyModes: STUDY_MODES } = worldLabels(lang);
  const years = p.durationMonths ? (p.durationMonths % 12 === 0 ? fmt(t.years, { n: p.durationMonths / 12 }) : fmt(t.months, { n: p.durationMonths })) : null;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-950">{p.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="blue">{DEGREES[p.degree] ?? p.degree}</Badge>
            {p.field && <Badge>{FIELDS[p.field] ?? p.field}</Badge>}
            <Badge>{FORMATS[p.format] ?? p.format}</Badge>
            {p.studyMode !== "full_time" && <Badge>{STUDY_MODES[p.studyMode]}</Badge>}
          </div>
        </div>
        {p.tuitionAmount != null && (
          <div className="text-right">
            <p className="font-display text-lg font-bold text-slate-950">{money(p.tuitionAmount, p.tuitionCurrency)}</p>
            <p className="text-xs text-slate-500">{t.perYearShort}{p.tuitionCurrency !== "USD" && p.tuitionUsd ? ` · ≈ ${money(p.tuitionUsd)}` : ""}</p>
          </div>
        )}
      </div>
      <div className="mt-3 grid gap-1.5 text-sm text-slate-600 sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-slate-400" /> {p.language}
        </span>
        {years && (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" /> {years}
            {p.startMonth && fmt(t.starts, { m: p.startMonth })}
          </span>
        )}
        {(p.ieltsMin || p.toeflMin || p.satMin) && (
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            {[p.ieltsMin && `IELTS ${p.ieltsMin}+`, p.toeflMin && `TOEFL ${p.toeflMin}+`, p.satMin && `SAT ${p.satMin}+`].filter(Boolean).join(" · ")}
          </span>
        )}
        {(p.deadline || p.deadlineNote) && (
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" /> {p.deadline ? fmt(t.applyUntil, { date: formatDate(p.deadline, lang) }) : p.deadlineNote}
          </span>
        )}
      </div>
      {p.deadline && p.deadlineNote && <p className="mt-2 text-sm text-slate-500">{p.deadlineNote}</p>}
      {p.requirements && <p className="mt-3 text-sm text-slate-700">{p.requirements}</p>}
      {p.scholarships && (
        <p className="mt-2 flex gap-2 text-sm text-emerald-700">
          <Wallet className="mt-0.5 h-4 w-4 shrink-0" /> {p.scholarships}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>{fmt(t.checked, { date: formatDate(p.checkedAt, lang) })}</span>
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-blue-700">
          {t.programPage} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}

// Наши требования (если вуз есть в каталоге Unilight): готовность по gap analysis и «В цели».
function CuratedBlock({ curatedId }: { curatedId: string }) {
  const t = useT().app.uni;
  const lang = useLang();
  const state = usePlatform();
  const catalog = useCatalog();
  const cu = catalog?.universities.find((x) => x.id === curatedId);
  if (!cu) return null;
  const isTarget = !!state?.targets.includes(cu.id);
  const r = state?.profile ? readiness(gapAnalysis(state.profile, cu, lang)) : null;
  return (
    <Card className="border-blue-200 bg-blue-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-blue-900">{t.curated}</p>
          <p className="mt-1 text-sm text-blue-900/80">
            IELTS {cu.ielts}+{cu.sat ? ` · SAT ${cu.sat}+` : ""} · {tv(cu.grants, lang)} · {fmt(t.applyBy, { date: formatDate(cu.deadline, lang) })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {r !== null && (
            <span className="text-right">
              <span className={`block font-display text-xl font-bold ${r >= 75 ? "text-emerald-600" : r >= 45 ? "text-amber-600" : "text-rose-500"}`}>{r}%</span>
              <span className="text-xs text-slate-500">{t.readiness}</span>
            </span>
          )}
          {state && (
            <button type="button" onClick={() => updateState((s) => ({ targets: toggleIn(s.targets, cu.id) }))} className={isTarget ? ghostButtonClass : buttonClass}>
              {isTarget ? `${t.inTargets} ✓` : t.toTargets}
            </button>
          )}
          {isTarget && (
            <Link href="/gap" className="text-sm font-medium text-blue-700">
              {t.toGap}
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function UniversityDetailView({ u }: { u: WorldUniversityDetail }) {
  const t = useT().app.uni;
  const lang = useLang();
  const money = useMoney();
  const num = (n: number) => n.toLocaleString(LOCALE[lang]);
  const { fields: FIELDS, controls: CONTROLS } = worldLabels(lang);
  const place = [u.city, u.region && u.region !== u.city ? u.region : "", countryName(u.countryCode, lang)].filter(Boolean).join(", ");
  const otherNames = [...new Set(Object.entries(u.names).filter(([lang]) => ["ru", "kk", "en"].includes(lang)).map(([, n]) => n))].filter((n) => n !== u.name);
  const fields = Object.entries(u.fieldScores).slice(0, 8);
  return (
    <div className="grid gap-5">
      <Link href="/universities" className="flex w-fit items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" /> {t.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{u.name}</h1>
          {otherNames.length > 0 && <p className="mt-1 text-slate-500">{otherNames.join(" · ")}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" /> {place}
            {u.lat != null && u.lng != null && (
              <a href={`https://www.openstreetmap.org/?mlat=${u.lat}&mlon=${u.lng}#map=14/${u.lat}/${u.lng}`} target="_blank" rel="noopener noreferrer" className="ml-1 text-sm font-medium text-blue-700">
                {t.onMap}
              </a>
            )}
          </p>
        </div>
        {u.homepage && (
          <a href={u.homepage} target="_blank" rel="noopener noreferrer" className={ghostButtonClass}>
            <Globe2 className="mr-1.5 h-4 w-4" /> {t.website}
          </a>
        )}
      </div>

      {u.curatedId && <CuratedBlock curatedId={u.curatedId} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Fact label={t.facts.founded} value={u.established} />
        <Fact label={t.facts.type} value={u.control ? CONTROLS[u.control] : null} />
        <Fact label={t.facts.students} value={u.students != null ? num(u.students) : null} />
        <Fact label={t.facts.rank} value={u.scienceRank ? `#${num(u.scienceRank)}` : null} />
        <Fact label={t.facts.admission} value={u.admissionRate != null ? `${Math.round(u.admissionRate * 100)}%` : null} />
        <Fact label={t.facts.sat} value={u.satAvg} />
        <Fact label={t.facts.cost} value={u.tuitionOut != null ? money(u.tuitionOut) : null} />
        <Fact label={t.facts.works} value={u.worksCount ? num(u.worksCount) : null} />
      </div>

      {fields.length > 0 && (
        <Card>
          <h2 className="font-display text-lg font-bold text-slate-950">{t.strongFields}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.fieldsHint}</p>
          <div className="mt-4 grid gap-2.5">
            {fields.map(([f, share]) => (
              <div key={f} className="grid grid-cols-[minmax(0,12rem)_1fr_3rem] items-center gap-3 text-sm">
                <span className="truncate text-slate-700">{FIELDS[f] ?? f}</span>
                <span className="h-2 rounded-full bg-slate-100">
                  <span className="block h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(4, share * 100)}%` }} />
                </span>
                <span className="text-right text-slate-500">{Math.round(share * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-slate-950">{t.programs} {u.programList.length > 0 && <span className="text-slate-400">({u.programList.length})</span>}</h2>
        {u.programList.length ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {u.programList.map((p) => (
              <ProgramCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <Card className="text-sm text-slate-600">
            {t.noPrograms[0]}{" "}
            {u.homepage ? (
              <a href={u.homepage} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">
                {t.noPrograms[1]}
              </a>
            ) : (
              t.noPrograms[1]
            )}{" "}
            {t.noPrograms[2]}
          </Card>
        )}
      </section>

      <p className="text-xs text-slate-500">
        {t.sourcesLabel}{" "}
        {u.openalexId && (
          <a href={`https://openalex.org/institutions/${u.openalexId}`} target="_blank" rel="noopener noreferrer" className="underline">
            OpenAlex
          </a>
        )}
        {u.rorId && (
          <>
            {" · "}
            <a href={`https://ror.org/${u.rorId}`} target="_blank" rel="noopener noreferrer" className="underline">
              ROR
            </a>
          </>
        )}
        {u.scorecardId && (
          <>
            {" · "}
            <a href={`https://collegescorecard.ed.gov/school/?${u.scorecardId}`} target="_blank" rel="noopener noreferrer" className="underline">
              College Scorecard
            </a>
          </>
        )}
        {t.checkSite}
      </p>
    </div>
  );
}
