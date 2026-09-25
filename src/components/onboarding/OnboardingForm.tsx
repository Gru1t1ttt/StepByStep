"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ACHIEVEMENT_LEVELS,
  BUDGETS,
  COUNTRIES,
  EXAMS,
  GRADES,
  INTERESTS,
  LANGUAGE_LEVELS,
  MAJORS,
  MBTI_TEST_URL,
  MBTI_TYPES,
  SCHOOL_TYPES,
  SUBJECTS,
  emptyProfile,
  type Achievement,
  type Activity,
  type ExamScore,
  type Language,
  type Profile,
} from "@/lib/profile";
import { flushSave, updateState, useAuth } from "@/lib/store";
import { Chips, Field, RepeatList, Section, Select, TextArea, TextInput } from "./fields";

const STORAGE_KEY = "sbs-onboarding-draft";

const SECTIONS = [
  { id: "basic", title: "О себе" },
  { id: "school", title: "Учёба" },
  { id: "languages", title: "Языки и экзамены" },
  { id: "interests", title: "Интересы и навыки" },
  { id: "achievements", title: "Достижения" },
  { id: "activities", title: "Внеклассная активность" },
  { id: "goals", title: "Цели поступления" },
  { id: "mbti", title: "Тип личности (MBTI)" },
  { id: "extra", title: "Что-то ещё" },
];

const cardGrid = "grid gap-3 sm:grid-cols-2";

export default function OnboardingForm() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [cvName, setCvName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const auth = useAuth();

  // Черновик хранится в браузере, чтобы ответы не пропали при перезагрузке.
  useEffect(() => {
    try {
      // Черновик, а если его нет — уже сохранённый профиль (режим редактирования).
      const saved = localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(JSON.parse(localStorage.getItem("sbs-state") ?? "{}").profile ?? null);
      // Читаем только после монтирования: при серверном рендере localStorage недоступен.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && saved !== "null") setProfile({ ...emptyProfile, ...JSON.parse(saved) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }, [profile, loaded]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const text = (key: keyof Profile) => ({
    value: profile[key] as string,
    onChange: (e: { target: { value: string } }) => set(key, e.target.value as never),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!profile.fullName.trim()) missing.push("Имя и фамилия");
    if (!profile.grade) missing.push("Класс");
    if (profile.interests.length === 0) missing.push("Хотя бы один интерес");
    if (profile.targetCountries.length === 0) missing.push("Хотя бы одна страна для поступления");
    setErrors(missing);
    if (missing.length === 0) {
      updateState({ profile });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      // Без аккаунта — сначала регистрация: анкета перенесётся в аккаунт автоматически.
      if (auth.status === "signed-out") return router.push("/login?mode=signup&next=/dashboard");
      flushSave().finally(() => router.push("/dashboard"));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav className="hidden lg:block">
        <ol className="sticky top-6 grid gap-1 text-sm">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-md px-3 py-1.5 text-slate-600 hover:bg-white hover:text-blue-700"
              >
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
          <h2 className="font-semibold text-blue-950">Есть резюме (CV)? Загрузи его</h2>
          <p className="mt-1 text-sm text-blue-900/80">
            ИИ заполнит анкету по резюме, а тебе останется только проверить. Нет резюме — просто заполни поля ниже.
          </p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-200 hover:bg-blue-100">
            {cvName ? `📄 ${cvName}` : "Выбрать файл (PDF, DOCX)"}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setCvName(e.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>

        <Section id="basic" number={1} title="О себе">
          <div className={cardGrid}>
            <Field label="Имя и фамилия" required>
              <TextInput {...text("fullName")} placeholder="Айгерим Серикова" />
            </Field>
            <Field label="Дата рождения">
              <TextInput type="date" {...text("birthDate")} />
            </Field>
            <Field label="Страна">
              <TextInput {...text("country")} />
            </Field>
            <Field label="Город">
              <TextInput {...text("city")} placeholder="Астана" />
            </Field>
          </div>
        </Section>

        <Section id="school" number={2} title="Учёба">
          <div className={cardGrid}>
            <Field label="Школа">
              <TextInput {...text("school")} placeholder="НИШ ФМН Астана" />
            </Field>
            <Field label="Тип школы">
              <Select value={profile.schoolType} onChange={(v) => set("schoolType", v)} options={SCHOOL_TYPES} />
            </Field>
            <Field label="Класс" required>
              <Select value={profile.grade} onChange={(v) => set("grade", v)} options={GRADES} />
            </Field>
            <Field label="Средний балл (GPA)" hint="В любой системе: 4.8 из 5, 3.9 из 4, 85%">
              <TextInput {...text("gpa")} placeholder="4.8 / 5" />
            </Field>
          </div>
          <Field group label="Любимые предметы">
            <Chips options={SUBJECTS} value={profile.favoriteSubjects} onChange={(v) => set("favoriteSubjects", v)} />
          </Field>
          <Field group label="Какие предметы даются сложнее всего?">
            <Chips options={SUBJECTS} value={profile.hardSubjects} onChange={(v) => set("hardSubjects", v)} />
          </Field>
        </Section>

        <Section id="languages" number={3} title="Языки и экзамены" hint="Укажи уровень каждого языка и сданные или запланированные экзамены">
          <Field group label="Языки">
            <RepeatList<Language>
              items={profile.languages}
              onChange={(v) => set("languages", v)}
              empty={{ name: "", level: "" }}
              addLabel="Добавить язык"
              render={(item, update) => (
                <div className={cardGrid}>
                  <TextInput value={item.name} onChange={(e) => update({ name: e.target.value })} placeholder="Немецкий" />
                  <Select value={item.level} onChange={(v) => update({ level: v })} options={LANGUAGE_LEVELS} placeholder="Уровень" />
                </div>
              )}
            />
          </Field>
          <Field group label="Экзамены (IELTS, SAT и др.)">
            <RepeatList<ExamScore>
              items={profile.exams}
              onChange={(v) => set("exams", v)}
              empty={{ exam: "", status: "planned", score: "" }}
              addLabel="Добавить экзамен"
              render={(item, update) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select value={item.exam} onChange={(v) => update({ exam: v })} options={EXAMS} placeholder="Экзамен" />
                  <Select
                    value={item.status === "done" ? "Уже сдан" : "Планирую"}
                    onChange={(v) => update({ status: v === "Уже сдан" ? "done" : "planned" })}
                    options={["Уже сдан", "Планирую"]}
                    placeholder="Статус"
                  />
                  <TextInput
                    value={item.score}
                    onChange={(e) => update({ score: e.target.value })}
                    placeholder={item.status === "done" ? "Балл" : "Целевой балл"}
                  />
                </div>
              )}
            />
          </Field>
        </Section>

        <Section id="interests" number={4} title="Интересы и навыки" hint="Выбери всё, что тебе действительно интересно — от этого зависят подобранные возможности">
          <Field group label="Что тебе интересно?" required>
            <Chips options={INTERESTS} value={profile.interests} onChange={(v) => set("interests", v)} />
          </Field>
          <Field label="Что ты уже умеешь?" hint="Языки программирования, инструменты, soft skills: Python, Figma, публичные выступления…">
            <TextArea {...text("skills")} />
          </Field>
          <Field label="Хобби и увлечения">
            <TextArea {...text("hobbies")} placeholder="Чем занимаешься в свободное время?" />
          </Field>
        </Section>

        <Section id="achievements" number={5} title="Достижения" hint="Олимпиады, конкурсы, хакатоны, научные проекты, сертификаты">
          <RepeatList<Achievement>
            items={profile.achievements}
            onChange={(v) => set("achievements", v)}
            empty={{ title: "", level: "", result: "", year: "" }}
            addLabel="Добавить достижение"
            render={(item, update) => (
              <div className={cardGrid}>
                <TextInput value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="Название (олимпиада по физике)" />
                <Select value={item.level} onChange={(v) => update({ level: v })} options={ACHIEVEMENT_LEVELS} placeholder="Уровень" />
                <TextInput value={item.result} onChange={(e) => update({ result: e.target.value })} placeholder="Результат (2 место, финалист…)" />
                <TextInput value={item.year} onChange={(e) => update({ year: e.target.value })} placeholder="Год" inputMode="numeric" />
              </div>
            )}
          />
        </Section>

        <Section id="activities" number={6} title="Внеклассная активность" hint="Клубы, волонтёрство, работа, свои проекты, спорт — всё, чем ты занимаешься вне уроков">
          <RepeatList<Activity>
            items={profile.activities}
            onChange={(v) => set("activities", v)}
            empty={{ role: "", organization: "", description: "", hoursPerWeek: "" }}
            addLabel="Добавить активность"
            render={(item, update) => (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <TextInput value={item.role} onChange={(e) => update({ role: e.target.value })} placeholder="Роль (основатель, участник…)" />
                  <TextInput value={item.organization} onChange={(e) => update({ organization: e.target.value })} placeholder="Где (клуб, организация)" />
                  <TextInput value={item.hoursPerWeek} onChange={(e) => update({ hoursPerWeek: e.target.value })} placeholder="Часов в неделю" inputMode="numeric" />
                </div>
                <TextArea value={item.description} onChange={(e) => update({ description: e.target.value })} rows={2} placeholder="Что ты там делаешь и чего добился(ась)?" />
              </div>
            )}
          />
        </Section>

        <Section id="goals" number={7} title="Цели поступления">
          <Field group label="В каких странах хочешь учиться?" required>
            <Chips options={COUNTRIES} value={profile.targetCountries} onChange={(v) => set("targetCountries", v)} />
          </Field>
          <Field group label="Какие направления рассматриваешь?">
            <Chips options={MAJORS} value={profile.targetMajors} onChange={(v) => set("targetMajors", v)} />
          </Field>
          <Field label="Университеты мечты" hint="Если уже есть на примете — через запятую">
            <TextInput {...text("dreamUniversities")} placeholder="TU Munich, NUS, University of Toronto" />
          </Field>
          <div className={cardGrid}>
            <Field label="Финансирование">
              <Select value={profile.budget} onChange={(v) => set("budget", v)} options={BUDGETS} />
            </Field>
            <Field label="Год поступления">
              <Select
                value={profile.admissionYear}
                onChange={(v) => set("admissionYear", v)}
                options={["2027", "2028", "2029", "2030", "2031"]}
              />
            </Field>
          </div>
        </Section>

        <Section id="mbti" number={8} title="Тип личности (MBTI)" hint="Помогает ИИ подобрать подходящие направления и формат активностей">
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Не знаешь свой тип? Пройди бесплатный тест (~10 минут) и вернись сюда:{" "}
            <a
              href={MBTI_TEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
            >
              пройти тест на 16personalities.com ↗
            </a>
            <p className="mt-1 text-xs text-slate-500">Ответы в этой анкете сохраняются автоматически, так что ничего не пропадёт.</p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {MBTI_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("mbti", profile.mbti === t ? "" : t)}
                className={`rounded-lg border py-2 font-mono text-sm transition ${
                  profile.mbti === t
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        <Section id="extra" number={9} title="Что-то ещё">
          <Field label="Что ещё нам стоит о тебе знать?" hint="Мечты, сомнения, вопросы о поступлении — всё, что поможет ИИ лучше тебя понять">
            <TextArea {...text("about")} rows={4} />
          </Field>
        </Section>

        {errors.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            Заполни, пожалуйста: {errors.join(", ")}.
          </div>
        )}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Черновик сохраняется автоматически.</p>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Сохранить и перейти к карте развития →
          </button>
        </div>
      </form>
    </div>
  );
}
