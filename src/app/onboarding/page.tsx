import type { Metadata } from "next";
import Header from "@/components/site/Header";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Расскажи о себе — StepByStep",
};

export default function OnboardingPage() {
  return (
    <>
    <Header />
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-blue-600">Шаг 1 из 3 · Профиль</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Расскажи о себе</h1>
        <p className="mt-3 text-slate-600">
          Все вопросы на одной странице. Отвечай на то, что знаешь, остальное можно дополнить позже. Чем подробнее
          ответы, тем точнее ИИ подберёт возможности и составит твою карту развития.
        </p>
      </header>
      <OnboardingForm />
    </main>
    </>
  );
}
