"use client";

import { ChevronDown, GraduationCap, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge, Card } from "@/components/platform/ui";
import { fmt } from "@/lib/i18n";
import { useLang, useT } from "@/lib/i18n/client";
import { LOCALE } from "@/lib/i18n/values";
import { EMPTY_FILTERS, LANGUAGES, countryName, filtersToParams, parseFilters, worldLabels, type Filters, type WorldUniversity } from "@/lib/world";

// Поиск по всем вузам мира: фильтры слева (на телефоне — в выезжающей панели),
// результаты страницами по 24. Фильтры хранятся в адресе, ссылкой можно поделиться.

type Meta = { countries: { code: string; continent: string | null; n: number }[]; universities: number; programs: number };
type ListKey = "country" | "continent" | "field" | "control" | "degree" | "lang" | "pfield" | "format";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

function Group({ title, children, open = true, count = 0 }: { title: string; children: ReactNode; open?: boolean; count?: number }) {
  return (
    <details open={open} className="group border-b border-slate-200 py-3 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-900">
        <span>
          {title} {count > 0 && <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 grid gap-1.5">{children}</div>
    </details>
  );
}

function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: string; hint?: string | number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-blue-600" />
      <span className="flex-1">{label}</span>
      {hint !== undefined && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Radio({ value, current, onChange, options, anyLabel }: { value?: string; current: string; onChange: (v: string) => void; options: [string, string][]; anyLabel: string }) {
  return (
    <>
      {[["", anyLabel] as [string, string], ...options].map(([v, label]) => (
        <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="radio" name={value} checked={current === v} onChange={() => onChange(v)} className="h-4 w-4 accent-blue-600" />
          {label}
        </label>
      ))}
    </>
  );
}

export default function WorldSearch({ targets, onToggleTarget }: { targets: string[]; onToggleTarget: (curatedId: string) => void }) {
  const t = useT().app.uni;
  const lang = useLang();
  const { fields: FIELDS, continents: CONTINENTS, controls: CONTROLS, degrees: DEGREES, formats: FORMATS } = worldLabels(lang);
  const num = (n: number) => n.toLocaleString(LOCALE[lang]);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);
  const [q, setQ] = useState(filters.q);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [items, setItems] = useState<WorldUniversity[]>([]);
  const [total, setTotal] = useState(0);
  // страница результатов привязана к фильтрам: новые фильтры — снова с первой страницы
  const [pager, setPager] = useState({ query: "", page: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");

  const apply = (patch: Partial<Filters>) => {
    const next = filtersToParams({ ...filters, ...patch });
    if (params.get("tab")) next.set("tab", params.get("tab")!);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  const toggle = (key: ListKey, value: string) =>
    apply({ [key]: filters[key].includes(value) ? filters[key].filter((v) => v !== value) : [...filters[key], value] } as Partial<Filters>);

  // поиск по названию — с небольшой задержкой, пока человек печатает
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => {
      const next = filtersToParams({ ...filters, q });
      if (params.get("tab")) next.set("tab", params.get("tab")!);
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(t);
  }, [q, filters, params, pathname, router]);

  useEffect(() => {
    fetch("/api/universities/meta")
      .then((r) => r.json())
      .then((d) => !d.error && setMeta(d))
      .catch(() => {});
  }, []);

  const query = filtersToParams(filters).toString();
  const page = pager.query === query ? pager.page : 0;
  useEffect(() => {
    const ctrl = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/universities?${query}&page=${page}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setItems((prev) => (page === 0 ? d.items : [...prev, ...d.items]));
        setTotal(d.total);
        setError("");
      })
      .catch((e) => e.name !== "AbortError" && setError(e.message))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [query, page]);

  const countries = useMemo(() => {
    const all = (meta?.countries ?? []).map((c) => ({ ...c, name: countryName(c.code, lang) }));
    const cq = countryQuery.trim().toLowerCase();
    return all
      .filter((c) => !filters.continent.length || filters.continent.includes(c.continent ?? ""))
      .filter((c) => !cq || c.name.toLowerCase().includes(cq) || c.code.toLowerCase() === cq)
      .sort((a, b) => Number(filters.country.includes(b.code)) - Number(filters.country.includes(a.code)) || b.n - a.n);
  }, [meta, countryQuery, filters.continent, filters.country, lang]);
  const [allCountries, setAllCountries] = useState(false);

  // активные фильтры — «чипсами» над результатами
  const chips: { label: string; clear: Partial<Filters> }[] = [
    ...filters.continent.map((v) => ({ label: CONTINENTS[v] ?? v, clear: { continent: filters.continent.filter((x) => x !== v) } })),
    ...filters.country.map((v) => ({ label: countryName(v, lang), clear: { country: filters.country.filter((x) => x !== v) } })),
    ...filters.field.map((v) => ({ label: FIELDS[v] ?? v, clear: { field: filters.field.filter((x) => x !== v) } })),
    ...filters.control.map((v) => ({ label: CONTROLS[v] ?? v, clear: { control: filters.control.filter((x) => x !== v) } })),
    ...(filters.top ? [{ label: fmt(t.top, { n: filters.top }), clear: { top: "" } }] : []),
    ...(filters.est ? [{ label: t.est[filters.est as keyof typeof t.est], clear: { est: "" } }] : []),
    ...(filters.adm ? [{ label: fmt(t.chipAdmission, { n: Number(filters.adm) * 100 }), clear: { adm: "" } }] : []),
    ...(filters.tuition ? [{ label: fmt(t.chipUsCost, { n: num(Number(filters.tuition)) }), clear: { tuition: "" } }] : []),
    ...(filters.sat ? [{ label: `SAT ≤ ${filters.sat}`, clear: { sat: "" } }] : []),
    ...(filters.curated ? [{ label: t.chipCurated, clear: { curated: false } }] : []),
    ...(filters.hasPrograms ? [{ label: t.chipPrograms, clear: { hasPrograms: false } }] : []),
    ...filters.degree.map((v) => ({ label: DEGREES[v] ?? v, clear: { degree: filters.degree.filter((x) => x !== v) } })),
    ...filters.lang.map((v) => ({ label: fmt(t.chipLang, { v }), clear: { lang: filters.lang.filter((x) => x !== v) } })),
    ...filters.pfield.map((v) => ({ label: fmt(t.chipProgram, { v: FIELDS[v] ?? v }), clear: { pfield: filters.pfield.filter((x) => x !== v) } })),
    ...filters.format.map((v) => ({ label: FORMATS[v] ?? v, clear: { format: filters.format.filter((x) => x !== v) } })),
    ...(filters.ptuition ? [{ label: fmt(t.chipProgramCost, { n: num(Number(filters.ptuition)) }), clear: { ptuition: "" } }] : []),
    ...(filters.ielts ? [{ label: `IELTS ≤ ${filters.ielts}`, clear: { ielts: "" } }] : []),
    ...(filters.scholarships ? [{ label: t.chipScholarships, clear: { scholarships: false } }] : []),
  ];
  const programCount = filters.degree.length + filters.lang.length + filters.pfield.length + filters.format.length + [filters.ptuition, filters.ielts, filters.scholarships, filters.hasPrograms].filter(Boolean).length;

  const panelBody = (
    <div>
      <Group title={t.region} count={filters.continent.length}>
        {Object.entries(CONTINENTS).map(([k, v]) => (
          <Check key={k} checked={filters.continent.includes(k)} onChange={() => toggle("continent", k)} label={v} />
        ))}
      </Group>

      <Group title={t.country} count={filters.country.length}>
        <input value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder={t.findCountry} className={`${inputClass} mb-1`} />
        {(allCountries || countryQuery ? countries : countries.slice(0, 12)).map((c) => (
          <Check key={c.code} checked={filters.country.includes(c.code)} onChange={() => toggle("country", c.code)} label={c.name} hint={num(c.n)} />
        ))}
        {!countryQuery && countries.length > 12 && (
          <button type="button" onClick={() => setAllCountries((v) => !v)} className="mt-1 w-fit text-sm font-medium text-blue-700">
            {allCountries ? t.collapse : fmt(t.allCountriesN, { n: countries.length })}
          </button>
        )}
      </Group>

      <Group title={t.strongFields} count={filters.field.length} open={false}>
        {Object.entries(FIELDS).map(([k, v]) => (
          <Check key={k} checked={filters.field.includes(k)} onChange={() => toggle("field", k)} label={v} />
        ))}
      </Group>

      <Group title={t.science} count={filters.top ? 1 : 0}>
        <Radio value="top" current={filters.top} onChange={(v) => apply({ top: v })} anyLabel={t.allUnis} options={[["100", t.topWorld], ["500", fmt(t.top, { n: 500 })], ["1000", fmt(t.top, { n: 1000 })], ["5000", fmt(t.top, { n: 5000 })]]} />
        <p className="text-xs text-slate-500">{t.scienceHint}</p>
      </Group>

      <Group title={t.programs} count={programCount} open={false}>
        <Check checked={filters.hasPrograms} onChange={() => apply({ hasPrograms: !filters.hasPrograms })} label={t.onlyPrograms} hint={meta?.programs} />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.degree}</p>
        {Object.entries(DEGREES).map(([k, v]) => (
          <Check key={k} checked={filters.degree.includes(k)} onChange={() => toggle("degree", k)} label={v} />
        ))}
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.language}</p>
        {LANGUAGES.slice(0, 8).map((l) => (
          <Check key={l} checked={filters.lang.includes(l)} onChange={() => toggle("lang", l)} label={l} />
        ))}
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.format}</p>
        {Object.entries(FORMATS).map(([k, v]) => (
          <Check key={k} checked={filters.format.includes(k)} onChange={() => toggle("format", k)} label={v} />
        ))}
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.programField}</p>
        <select value={filters.pfield[0] ?? ""} onChange={(e) => apply({ pfield: e.target.value ? [e.target.value] : [] })} className={inputClass}>
          <option value="">{t.any}</option>
          {Object.entries(FIELDS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.cost}</p>
        <select value={filters.ptuition} onChange={(e) => apply({ ptuition: e.target.value })} className={inputClass}>
          <option value="">{t.anyF}</option>
          <option value="0">{t.freeCost}</option>
          {[5000, 10000, 20000, 35000].map((n) => (
            <option key={n} value={n}>
              {fmt(t.upTo, { n: num(n) })}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.myIelts}</p>
        <select value={filters.ielts} onChange={(e) => apply({ ielts: e.target.value })} className={inputClass}>
          <option value="">{t.notImportant}</option>
          {["5.5", "6.0", "6.5", "7.0", "7.5"].map((v) => (
            <option key={v} value={v}>
              {fmt(t.ieltsOption, { n: v })}
            </option>
          ))}
        </select>
        <div className="mt-2">
          <Check checked={filters.scholarships} onChange={() => apply({ scholarships: !filters.scholarships })} label={t.scholarships} />
        </div>
      </Group>

      <Group title={t.founded} count={filters.est ? 1 : 0} open={false}>
        <Radio value="est" current={filters.est} onChange={(v) => apply({ est: v })} anyLabel={t.anyM} options={Object.entries(t.est)} />
      </Group>

      <Group title={t.us} count={[filters.adm, filters.tuition, filters.sat, ...filters.control].filter(Boolean).length} open={false}>
        <p className="text-xs text-slate-500">{t.usHint}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.type}</p>
        {Object.entries(CONTROLS).map(([k, v]) => (
          <Check key={k} checked={filters.control.includes(k)} onChange={() => toggle("control", k)} label={v} />
        ))}
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.admission}</p>
        <Radio value="adm" current={filters.adm} onChange={(v) => apply({ adm: v })} anyLabel={t.anyM} options={[["0.1", t.admissionOptions[0]], ["0.25", t.admissionOptions[1]], ["0.5", t.admissionOptions[2]]]} />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.intlCost}</p>
        <Radio value="tuition" current={filters.tuition} onChange={(v) => apply({ tuition: v })} anyLabel={t.anyF} options={[15000, 30000, 45000].map((n) => [String(n), fmt(t.costUpTo, { n: num(n) })] as [string, string])} />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.satAvg}</p>
        <Radio value="sat" current={filters.sat} onChange={(v) => apply({ sat: v })} anyLabel={t.anyM} options={["1200", "1350", "1450"].map((n) => [n, fmt(t.upToN, { n })] as [string, string])} />
      </Group>

      <Group title={t.forGap} count={filters.curated ? 1 : 0} open={false}>
        <Check checked={filters.curated} onChange={() => apply({ curated: !filters.curated })} label={t.onlyCurated} />
      </Group>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">
      {/* панель фильтров */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white px-4 py-1">{panelBody}</div>
      </aside>
      {panel && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden" onClick={() => setPanel(false)}>
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white px-4 pb-24" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white py-3">
              <p className="font-semibold text-slate-900">{t.filters}</p>
              <button type="button" onClick={() => setPanel(false)} aria-label={t.collapse} className="rounded-lg p-1 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            {panelBody}
            <button type="button" onClick={() => setPanel(false)} className="fixed bottom-24 left-4 right-[16%] max-w-[calc(24rem-2rem)] rounded-xl bg-blue-600 py-3 font-semibold text-white">
              {fmt(t.show, { n: num(total) })}
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} className={`${inputClass} py-2.5 pl-9`} />
          </label>
          <button type="button" onClick={() => setPanel(true)} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> {t.filters} {chips.length > 0 && `(${chips.length})`}
          </button>
          <select value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" aria-label={t.sort}>
            {Object.entries(t.sorts).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">{loading && page === 0 ? t.searching : fmt(t.found, { n: num(total) })}</span>
          {chips.map((c) => (
            <button key={c.label} type="button" onClick={() => apply(c.clear)} className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
              {c.label} <X className="h-3 w-3" />
            </button>
          ))}
          {chips.length > 0 && (
            <button type="button" onClick={() => (setQ(""), apply({ ...EMPTY_FILTERS, sort: filters.sort }))} className="text-xs font-medium text-slate-500 hover:text-slate-800">
              {t.resetAll}
            </button>
          )}
        </div>

        {error && <Card className="mt-4 text-sm text-rose-700">{error}</Card>}

        <div className={`mt-4 grid gap-3 xl:grid-cols-2 ${loading && page === 0 ? "opacity-60" : ""}`}>
          {items.map((u) => (
            <UniversityCard key={u.id} u={u} isTarget={!!u.curatedId && targets.includes(u.curatedId)} onToggleTarget={onToggleTarget} />
          ))}
        </div>

        {!loading && !error && items.length === 0 && (
          <Card className="mt-4 text-center text-slate-500">
            <GraduationCap className="mx-auto h-8 w-8 text-slate-400" strokeWidth={1.6} />
            <p className="mt-2">{t.nothing}</p>
          </Card>
        )}

        {items.length < total && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setPager({ query, page: page + 1 })}
            className="mx-auto mt-5 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} {fmt(t.more, { n: num(total - items.length) })}
          </button>
        )}

        <p className="mt-6 text-xs text-slate-500">
          {t.sources}
        </p>
      </div>
    </div>
  );
}


function UniversityCard({ u, isTarget, onToggleTarget }: { u: WorldUniversity; isTarget: boolean; onToggleTarget: (id: string) => void }) {
  const t = useT().app.uni;
  const lang = useLang();
  const { fields: FIELDS, controls: CONTROLS } = worldLabels(lang);
  const num = (n: number) => n.toLocaleString(LOCALE[lang]);
  const place = [u.city, countryName(u.countryCode, lang)].filter(Boolean).join(", ");
  return (
    <Card className="flex flex-col">
      <Link href={`/universities/${u.id}`} className="group">
        <h3 className="font-display text-base font-bold leading-snug text-slate-950 group-hover:text-blue-700">{u.name}</h3>
        {lang === "ru" && u.nameRu && u.nameRu !== u.name && <p className="text-sm text-slate-500">{u.nameRu}</p>}
        <p className="mt-0.5 text-sm text-slate-500">{place}</p>
      </Link>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {u.scienceRank && u.scienceRank <= 5000 && <Badge tone="blue">{fmt(t.scienceBadge, { n: u.scienceRank })}</Badge>}
        {u.established && <Badge>{fmt(t.foundedShort, { n: u.established })}</Badge>}
        {u.control && <Badge>{CONTROLS[u.control]}</Badge>}
        {u.admissionRate != null && <Badge tone={u.admissionRate < 0.15 ? "rose" : u.admissionRate < 0.4 ? "amber" : "green"}>{fmt(t.admissionBadge, { n: Math.round(u.admissionRate * 100) })}</Badge>}
        {u.tuitionOut != null && <Badge>{fmt(t.perYear, { sum: `$${num(u.tuitionOut)}` })}</Badge>}
        {u.programs > 0 && <Badge tone="green">{fmt(t.programsBadge, { n: u.programs })}</Badge>}
      </div>
      {u.fields.length > 0 && <p className="mt-3 text-xs text-slate-500">{fmt(t.strongShort, { list: u.fields.slice(0, 3).map((f) => FIELDS[f] ?? f).join(" · ") })}</p>}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
        <Link href={`/universities/${u.id}`} className="font-medium text-blue-700 hover:underline">
          {t.details}
        </Link>
        {u.curatedId && (
          <button
            type="button"
            onClick={() => onToggleTarget(u.curatedId!)}
            className={`rounded-lg px-3 py-1.5 font-semibold ${isTarget ? "bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {isTarget ? t.inTargets : t.toTargets}
          </button>
        )}
      </div>
    </Card>
  );
}
