// Правила подбора, gap analysis и карты развития. Работают без ИИ,
// а ИИ-наставник получает их результаты как контекст и объясняет/дополняет.

import type { Opportunity } from "@/data/opportunities";
import type { University } from "@/data/universities";
import { fmt, getDict, type Lang } from "./i18n";
import { dateLong, tv } from "./i18n/values";
import type { Profile } from "./profile";

export const TODAY = new Date();

// Возможности и вузы из базы (src/lib/catalog.ts).
export type Catalog = { opportunities: Opportunity[]; universities: University[] };

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - TODAY.getTime()) / 86_400_000);
}

export function formatDate(iso: string, lang: Lang = "ru") {
  return dateLong(iso, lang);
}

// Тексты расчётов на нужном языке
const A = (lang: Lang) => getDict(lang).app.an;

export function gradeNumber(p: Profile) {
  const n = parseInt(p.grade, 10);
  return Number.isNaN(n) ? 12 : n;
}

// Приводим средний балл к 5-балльной шкале: «4.8 / 5», «3.9 из 4», «85%».
export function gpaOn5(p: Profile): number | null {
  const s = p.gpa.replace(",", ".");
  const nums = s.match(/\d+(\.\d+)?/g)?.map(Number);
  if (!nums?.length) return null;
  const [value, scale] = nums;
  if (s.includes("%") || value > 10) return Math.round((value / 100) * 5 * 10) / 10;
  if (scale && scale > 0) return Math.round((value / scale) * 5 * 10) / 10;
  return value <= 5 ? value : null;
}

// IELTS-эквивалент из сданных экзаменов (TOEFL и Duolingo по примерным таблицам соответствия).
export function englishScore(p: Profile): number | null {
  const scores = p.exams
    .filter((e) => e.status === "done" && e.score)
    .map((e) => {
      const v = parseFloat(e.score.replace(",", "."));
      if (Number.isNaN(v)) return null;
      if (e.exam === "IELTS") return v;
      if (e.exam === "TOEFL") return v >= 110 ? 8 : v >= 102 ? 7.5 : v >= 94 ? 7 : v >= 79 ? 6.5 : v >= 60 ? 6 : 5.5;
      if (e.exam === "Duolingo English Test") return v >= 140 ? 8 : v >= 130 ? 7.5 : v >= 120 ? 7 : v >= 110 ? 6.5 : v >= 100 ? 6 : 5.5;
      return null;
    })
    .filter((v): v is number => v !== null);
  return scores.length ? Math.max(...scores) : null;
}

export function satScore(p: Profile): number | null {
  const s = p.exams.find((e) => e.exam === "SAT" && e.status === "done" && e.score);
  const v = s ? parseInt(s.score, 10) : NaN;
  return Number.isNaN(v) ? null : v;
}

const STRONG_LEVELS = ["Областной", "Республиканский", "Международный"];

function strongAchievements(p: Profile) {
  return p.achievements.filter((a) => a.title && STRONG_LEVELS.includes(a.level)).length;
}

function activitiesCount(p: Profile) {
  return p.activities.filter((a) => a.role || a.organization).length;
}

function hasResearch(p: Profile) {
  const text = [...p.achievements.map((a) => a.title), ...p.activities.map((a) => `${a.role} ${a.description}`)]
    .join(" ")
    .toLowerCase();
  return /исслед|research|научн|статья|публикац/.test(text);
}

// ---------- Подбор возможностей ----------

export type Match = { opportunity: Opportunity; score: number; reasons: string[] };

export function matchOpportunity(p: Profile, o: Opportunity, lang: Lang = "ru"): Match {
  const a = A(lang);
  const reasons: string[] = [];
  let score = 0;

  const common = o.interests.filter((i) => p.interests.includes(i));
  if (common.length) {
    score += Math.min(55, 30 + common.length * 12);
    reasons.push(fmt(a.byInterests, { list: common.map((i) => tv(i, lang)).join(", ") }));
  }

  const grade = gradeNumber(p);
  if (grade >= o.minGrade && grade <= o.maxGrade) {
    score += 20;
    reasons.push(fmt(a.forGrade, { grade: p.grade }));
  } else if (grade < o.minGrade) {
    score += 5;
    reasons.push(fmt(a.fromGrade, { n: o.minGrade }));
  }

  if (o.free) {
    score += 5;
    reasons.push(a.free);
  }

  const days = daysUntil(o.deadline);
  if (days > 0 && days < 120) score += 10;
  if (days <= 0) score -= 30;

  // Цели: исследования ценят топ-вузы, олимпиады — технические направления.
  const wantsTech = p.targetMajors.some((m) => /Engineering|Computer|Physics|Math|Data/.test(m));
  if (wantsTech && (o.type === "Олимпиада" || o.type === "Хакатон")) {
    score += 10;
    reasons.push(a.tech);
  }
  if (o.type === "Исследование" && !hasResearch(p)) {
    score += 10;
    reasons.push(a.closesResearch);
  }

  return { opportunity: o, score: Math.max(0, Math.min(100, score)), reasons };
}

export function rankOpportunities(p: Profile, opportunities: Opportunity[], lang: Lang = "ru") {
  return opportunities.map((o) => matchOpportunity(p, o, lang))
    .filter((m) => daysUntil(m.opportunity.deadline) > 0)
    .sort((a, b) => b.score - a.score);
}

// ---------- Gap analysis ----------

export type GapStatus = "ok" | "partial" | "missing";
export type GapRow = {
  key: string;
  label: string;
  you: string;
  need: string;
  status: GapStatus;
  advice: string;
};

export function gapAnalysis(p: Profile, u: University, lang: Lang = "ru"): GapRow[] {
  const a = A(lang);
  const rows: GapRow[] = [];
  const eng = englishScore(p);
  const plannedEnglish = p.exams.some((e) => ["IELTS", "TOEFL", "Duolingo English Test"].includes(e.exam) && e.status === "planned");
  rows.push({
    key: "english",
    label: a.english,
    you: eng ? String(eng) : plannedEnglish ? a.planned : a.none,
    need: `${u.ielts}+`,
    status: eng === null ? "missing" : eng >= u.ielts ? "ok" : eng >= u.ielts - 0.5 ? "partial" : "missing",
    advice:
      eng === null
        ? fmt(a.englishPlan, { need: u.ielts })
        : eng >= u.ielts
          ? a.done
          : fmt(a.englishMore, { n: (u.ielts - eng).toFixed(1) }),
  });

  if (u.sat) {
    const sat = satScore(p);
    rows.push({
      key: "sat",
      label: "SAT",
      you: sat ? String(sat) : a.none,
      need: `${u.sat}+`,
      status: sat === null ? "missing" : sat >= u.sat ? "ok" : sat >= u.sat - 60 ? "partial" : "missing",
      advice:
        sat === null
          ? fmt(a.satPlan, { need: u.sat })
          : sat >= u.sat
            ? a.done
            : fmt(a.satMore, { n: u.sat - sat }),
    });
  }

  const gpa = gpaOn5(p);
  rows.push({
    key: "gpa",
    label: a.gpa,
    you: gpa ? String(gpa) : a.notSet,
    need: `${u.gpa}+`,
    status: gpa === null ? "partial" : gpa >= u.gpa ? "ok" : gpa >= u.gpa - 0.3 ? "partial" : "missing",
    advice: gpa === null ? a.gpaSet : gpa >= u.gpa ? a.done : a.gpaMore,
  });

  const ol = strongAchievements(p);
  rows.push({
    key: "olympiads",
    label: a.olympiads,
    you: String(ol),
    need: `${u.olympiads}+`,
    status: ol >= u.olympiads ? "ok" : ol > 0 ? "partial" : u.olympiads === 0 ? "ok" : "missing",
    advice: ol >= u.olympiads ? a.olympiadsOk : fmt(a.olympiadsMore, { n: u.olympiads - ol }),
  });

  const act = activitiesCount(p);
  rows.push({
    key: "activities",
    label: a.activities,
    you: String(act),
    need: `${u.activities}+`,
    status: act >= u.activities ? "ok" : act > 0 ? "partial" : "missing",
    advice: act >= u.activities ? a.activitiesOk : a.activitiesMore,
  });

  if (u.research) {
    const r = hasResearch(p);
    rows.push({
      key: "research",
      label: a.research,
      you: r ? a.has : a.none,
      need: a.wanted,
      status: r ? "ok" : "missing",
      advice: r ? a.researchOk : a.researchMore,
    });
  }

  const majorFit = p.targetMajors.filter((m) => u.majors.includes(m));
  if (p.targetMajors.length) {
    rows.push({
      key: "major",
      label: a.major,
      you: majorFit.length ? majorFit.join(", ") : a.majorNone,
      need: a.has,
      status: majorFit.length ? "ok" : "missing",
      advice: majorFit.length ? a.majorOk : a.majorMiss,
    });
  }

  return rows;
}

export function readiness(rows: GapRow[]) {
  if (!rows.length) return 0;
  const pts = rows.reduce((s, r) => s + (r.status === "ok" ? 1 : r.status === "partial" ? 0.5 : 0), 0);
  return Math.round((pts / rows.length) * 100);
}

// ---------- Подбор университетов ----------

export function universityFit(p: Profile, u: University) {
  let score = 0;
  if (p.targetCountries.includes(u.country)) score += 40;
  if (p.targetMajors.some((m) => u.majors.includes(m))) score += 30;
  if (p.budget === "Нужен полный грант" && u.grants === "Полный грант") score += 20;
  else if (p.budget === "Нужен частичный грант" && u.grants !== "Нет грантов") score += 15;
  else if (p.budget === "Можем оплатить обучение" || p.budget === "Пока не знаю" || !p.budget) score += 10;
  score += Math.round(readiness(gapAnalysis(p, u)) / 10);
  return score;
}

export function suggestedUniversities(p: Profile, universities: University[]) {
  return [...universities].sort((a, b) => universityFit(p, b) - universityFit(p, a));
}

// ---------- Карта развития ----------

export type RoadmapStep = {
  id: string;
  title: string;
  detail: string;
  due?: string;
  category: "Экзамен" | "Возможность" | "Проект" | "Профиль" | "Подача";
  href: string;
};

export function buildRoadmap(p: Profile, targetIds: string[], catalog: Catalog, lang: Lang = "ru"): RoadmapStep[] {
  const a = A(lang);
  const steps: RoadmapStep[] = [];
  const targets = catalog.universities.filter((u) => targetIds.includes(u.id));

  if (!targets.length) {
    steps.push({
      id: "pick-target",
      title: a.pickTargets,
      detail: a.pickTargetsText,
      category: "Профиль",
      href: "/universities",
    });
  }

  // Берём самые строгие требования среди выбранных вузов.
  const worst = new Map<string, { row: GapRow; uni: University }>();
  for (const u of targets) {
    for (const row of gapAnalysis(p, u, lang)) {
      if (row.status === "ok") continue;
      const prev = worst.get(row.key);
      if (!prev || (row.status === "missing" && prev.row.status !== "missing")) worst.set(row.key, { row, uni: u });
    }
  }

  const next = new Date(TODAY);
  const inMonths = (m: number) => {
    const d = new Date(next);
    d.setMonth(d.getMonth() + m);
    return d.toISOString().slice(0, 10);
  };

  const english = worst.get("english");
  if (english) steps.push({ id: "english", title: `IELTS ${english.row.need}`, detail: english.row.advice, due: inMonths(3), category: "Экзамен", href: "/gap" });
  const sat = worst.get("sat");
  if (sat) steps.push({ id: "sat", title: `SAT ${sat.row.need}`, detail: sat.row.advice, due: inMonths(4), category: "Экзамен", href: "/gap" });
  const research = worst.get("research");
  if (research)
    steps.push({ id: "research", title: a.researchStep, detail: research.row.advice, due: inMonths(5), category: "Проект", href: "/mentor" });
  const act = worst.get("activities");
  if (act) steps.push({ id: "activity", title: a.activityStep, detail: act.row.advice, category: "Проект", href: "/portfolio" });

  for (const m of rankOpportunities(p, catalog.opportunities, lang).slice(0, 4)) {
    steps.push({
      id: `opp-${m.opportunity.id}`,
      title: m.opportunity.title,
      detail: `${tv(m.opportunity.type, lang)} · ${m.reasons.slice(0, 2).join(" · ")}`,
      due: m.opportunity.deadline,
      category: "Возможность",
      href: "/opportunities",
    });
  }

  for (const u of targets) {
    steps.push({ id: `apply-${u.id}`, title: fmt(a.applyTo, { uni: u.name }), detail: `${tv(u.country, lang)}, ${u.city}`, due: u.deadline, category: "Подача", href: "/universities" });
  }

  // Шаги без даты («выбери цели», «начни активность») — первыми: с них всё начинается.
  return steps.sort((a, b) => (a.due ?? "0000").localeCompare(b.due ?? "0000"));
}

// ---------- Ближайшие события: дедлайны возможностей из плана, подачи в вузы-цели, экзамены ----------

export type UpcomingEvent = { id: string; date: string; title: string; kind: string; startPrep?: string; href: string; uni?: string };

function minusWeeks(iso: string, weeks: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() - weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function upcomingEvents(
  p: Profile,
  state: { targets: string[]; savedOpportunities: string[] },
  catalog: Catalog,
  lang: Lang = "ru",
): UpcomingEvent[] {
  const apply = getDict(lang).app.cal.apply;
  return [
    ...catalog.opportunities
      .filter((o) => state.savedOpportunities.includes(o.id))
      .map((o) => ({ id: o.id, date: o.deadline, title: o.title, kind: o.type, startPrep: minusWeeks(o.deadline, o.prepWeeks), href: "/opportunities" })),
    ...catalog.universities
      .filter((u) => state.targets.includes(u.id))
      .map((u) => ({ id: `uni-${u.id}`, date: u.deadline, title: fmt(apply, { uni: u.name }), uni: u.name, kind: "Подача", startPrep: minusWeeks(u.deadline, 12), href: "/universities" })),
    ...buildRoadmap(p, state.targets, catalog, lang)
      .filter((s) => s.category === "Экзамен" && s.due)
      .map((s) => ({ id: s.id, date: s.due!, title: s.title, kind: "Экзамен", startPrep: minusWeeks(s.due!, 10), href: "/gap" })),
  ]
    .filter((e) => daysUntil(e.date) > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}
