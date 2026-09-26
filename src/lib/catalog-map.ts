import type { Opportunity } from "@/data/opportunities";
import type { University } from "@/data/universities";

// Строки таблиц opportunities / universities → объекты, с которыми работает платформа.
// Используется и на сервере (postgres), и в браузере (supabase-js).

export type AdminOpportunity = Opportunity & { published: boolean };
export type AdminUniversity = University & { published: boolean };

const iso = (d: Date | string) => (typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10));

export type OppRow = {
  id: string; title: string; type: string; interests: string[]; min_grade: number; max_grade: number; format: string; location: string;
  free: boolean; deadline: Date | string; prep_weeks: number; url: string; description: string; published: boolean; i18n?: Opportunity["i18n"];
};
export type UniRow = {
  id: string; name: string; country: string; city: string; qs_rank: number | null; majors: string[]; tuition_usd: number; grants: string;
  ielts: string | number; sat: number | null; gpa: string | number; olympiads: number; activities: number; research: boolean; deadline: Date | string; url: string; published: boolean;
};

export const oppFromRow = (r: OppRow): AdminOpportunity => ({
  id: r.id,
  title: r.title,
  type: r.type as Opportunity["type"],
  interests: r.interests,
  minGrade: r.min_grade,
  maxGrade: r.max_grade,
  format: r.format as Opportunity["format"],
  location: r.location,
  free: r.free,
  deadline: iso(r.deadline),
  prepWeeks: r.prep_weeks,
  url: r.url,
  description: r.description,
  i18n: r.i18n ?? {},
  published: r.published,
});

export const uniFromRow = (r: UniRow): AdminUniversity => ({
  id: r.id,
  name: r.name,
  country: r.country,
  city: r.city,
  qsRank: r.qs_rank ?? 0,
  majors: r.majors,
  tuitionUsd: r.tuition_usd,
  grants: r.grants as University["grants"],
  ielts: Number(r.ielts),
  sat: r.sat,
  gpa: Number(r.gpa),
  olympiads: r.olympiads,
  activities: r.activities,
  research: r.research,
  deadline: iso(r.deadline),
  url: r.url,
  published: r.published,
});

