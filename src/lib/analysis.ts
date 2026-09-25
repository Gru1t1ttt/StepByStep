// Правила подбора, gap analysis и карты развития. Работают без ИИ,
// а ИИ-наставник получает их результаты как контекст и объясняет/дополняет.

import { OPPORTUNITIES, type Opportunity } from "@/data/opportunities";
import { UNIVERSITIES, type University } from "@/data/universities";
import type { Profile } from "./profile";

export const TODAY = new Date();

export function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - TODAY.getTime()) / 86_400_000);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

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

export function matchOpportunity(p: Profile, o: Opportunity): Match {
  const reasons: string[] = [];
  let score = 0;

  const common = o.interests.filter((i) => p.interests.includes(i));
  if (common.length) {
    score += Math.min(55, 30 + common.length * 12);
    reasons.push(`по твоим интересам: ${common.join(", ")}`);
  }

  const grade = gradeNumber(p);
  if (grade >= o.minGrade && grade <= o.maxGrade) {
    score += 20;
    reasons.push(`подходит для ${p.grade} класса`);
  } else if (grade < o.minGrade) {
    score += 5;
    reasons.push(`станет доступно с ${o.minGrade} класса`);
  }

  if (o.free) {
    score += 5;
    reasons.push("бесплатно");
  }

  const days = daysUntil(o.deadline);
  if (days > 0 && days < 120) score += 10;
  if (days <= 0) score -= 30;

  // Цели: исследования ценят топ-вузы, олимпиады — технические направления.
  const wantsTech = p.targetMajors.some((m) => /Engineering|Computer|Physics|Math|Data/.test(m));
  if (wantsTech && (o.type === "Олимпиада" || o.type === "Хакатон")) {
    score += 10;
    reasons.push("усиливает заявку на технические направления");
  }
  if (o.type === "Исследование" && !hasResearch(p)) {
    score += 10;
    reasons.push("закроет пробел «исследовательский проект»");
  }

  return { opportunity: o, score: Math.max(0, Math.min(100, score)), reasons };
}

export function rankOpportunities(p: Profile) {
  return OPPORTUNITIES.map((o) => matchOpportunity(p, o))
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

export function gapAnalysis(p: Profile, u: University): GapRow[] {
  const rows: GapRow[] = [];
  const eng = englishScore(p);
  const plannedEnglish = p.exams.some((e) => ["IELTS", "TOEFL", "Duolingo English Test"].includes(e.exam) && e.status === "planned");
  rows.push({
    key: "english",
    label: "Английский (IELTS или эквивалент)",
    you: eng ? String(eng) : plannedEnglish ? "запланирован" : "нет",
    need: `${u.ielts}+`,
    status: eng === null ? "missing" : eng >= u.ielts ? "ok" : eng >= u.ielts - 0.5 ? "partial" : "missing",
    advice:
      eng === null
        ? `Запланируй IELTS: цель ${u.ielts}+. На подготовку обычно нужно 2–4 месяца.`
        : eng >= u.ielts
          ? "Требование закрыто."
          : `Не хватает ${(u.ielts - eng).toFixed(1)} балла — сфокусируйся на самой слабой секции и пересдай.`,
  });

  if (u.sat) {
    const sat = satScore(p);
    rows.push({
      key: "sat",
      label: "SAT",
      you: sat ? String(sat) : "нет",
      need: `${u.sat}+`,
      status: sat === null ? "missing" : sat >= u.sat ? "ok" : sat >= u.sat - 60 ? "partial" : "missing",
      advice:
        sat === null
          ? `Сдай SAT с целью ${u.sat}+ (для многих вузов test-optional, но сильный балл помогает).`
          : sat >= u.sat
            ? "Требование закрыто."
            : `Нужно ещё ${u.sat - sat} баллов — пересдача через 2–3 месяца подготовки.`,
    });
  }

  const gpa = gpaOn5(p);
  rows.push({
    key: "gpa",
    label: "Средний балл (из 5)",
    you: gpa ? String(gpa) : "не указан",
    need: `${u.gpa}+`,
    status: gpa === null ? "partial" : gpa >= u.gpa ? "ok" : gpa >= u.gpa - 0.3 ? "partial" : "missing",
    advice: gpa === null ? "Укажи средний балл в профиле." : gpa >= u.gpa ? "Требование закрыто." : "Подтяни оценки в оставшиеся четверти — последние годы важнее всего.",
  });

  const ol = strongAchievements(p);
  rows.push({
    key: "olympiads",
    label: "Олимпиады и конкурсы (от областного уровня)",
    you: String(ol),
    need: `${u.olympiads}+`,
    status: ol >= u.olympiads ? "ok" : ol > 0 ? "partial" : u.olympiads === 0 ? "ok" : "missing",
    advice: ol >= u.olympiads ? "Хороший уровень — держи темп." : `Нужно ещё ${u.olympiads - ol}. Смотри олимпиады и конкурсы в разделе «Возможности».`,
  });

  const act = activitiesCount(p);
  rows.push({
    key: "activities",
    label: "Внеклассная активность",
    you: String(act),
    need: `${u.activities}+`,
    status: act >= u.activities ? "ok" : act > 0 ? "partial" : "missing",
    advice: act >= u.activities ? "Достаточно — теперь важна глубина и результат." : "Добавь долгосрочную активность: клуб, волонтёрство, свой проект.",
  });

  if (u.research) {
    const r = hasResearch(p);
    rows.push({
      key: "research",
      label: "Исследовательский проект",
      you: r ? "есть" : "нет",
      need: "желательно",
      status: r ? "ok" : "missing",
      advice: r ? "Отлично — оформи результат в портфолио." : "Сделай исследование по своей теме — идеи даст ИИ-наставник.",
    });
  }

  const majorFit = p.targetMajors.filter((m) => u.majors.includes(m));
  if (p.targetMajors.length) {
    rows.push({
      key: "major",
      label: "Твоё направление в этом вузе",
      you: majorFit.length ? majorFit.join(", ") : "нет совпадений",
      need: "есть",
      status: majorFit.length ? "ok" : "missing",
      advice: majorFit.length ? "Направление есть." : "В этом вузе нет выбранного направления — проверь альтернативы.",
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

export function suggestedUniversities(p: Profile) {
  return [...UNIVERSITIES].sort((a, b) => universityFit(p, b) - universityFit(p, a));
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

export function buildRoadmap(p: Profile, targetIds: string[]): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const targets = UNIVERSITIES.filter((u) => targetIds.includes(u.id));

  if (!targets.length) {
    steps.push({
      id: "pick-target",
      title: "Выбери 3–5 университетов-целей",
      detail: "Без цели карта будет общей. Отметь вузы в разделе «Университеты» — план подстроится под их требования.",
      category: "Профиль",
      href: "/universities",
    });
  }

  // Берём самые строгие требования среди выбранных вузов.
  const worst = new Map<string, { row: GapRow; uni: University }>();
  for (const u of targets) {
    for (const row of gapAnalysis(p, u)) {
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
    steps.push({ id: "research", title: "Исследовательский проект по своей теме", detail: research.row.advice, due: inMonths(5), category: "Проект", href: "/mentor" });
  const act = worst.get("activities");
  if (act) steps.push({ id: "activity", title: "Долгосрочная внеклассная активность", detail: act.row.advice, category: "Проект", href: "/portfolio" });

  for (const m of rankOpportunities(p).slice(0, 4)) {
    steps.push({
      id: `opp-${m.opportunity.id}`,
      title: m.opportunity.title,
      detail: `${m.opportunity.type} · ${m.reasons.slice(0, 2).join(" · ")}`,
      due: m.opportunity.deadline,
      category: "Возможность",
      href: "/opportunities",
    });
  }

  for (const u of targets) {
    steps.push({ id: `apply-${u.id}`, title: `Подача в ${u.name}`, detail: `${u.country}, ${u.city}`, due: u.deadline, category: "Подача", href: "/universities" });
  }

  // Шаги без даты («выбери цели», «начни активность») — первыми: с них всё начинается.
  return steps.sort((a, b) => (a.due ?? "0000").localeCompare(b.due ?? "0000"));
}
