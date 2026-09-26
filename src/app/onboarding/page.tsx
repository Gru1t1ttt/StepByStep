import type { Metadata } from "next";
import CabinetReady from "@/components/platform/CabinetReady";
import Header from "@/components/site/Header";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).app.onb.title };
}

export default async function OnboardingPage() {
  const o = (await getT()).app.onb;
  return (
    <>
      <Header />
      <main className="cabinet mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <CabinetReady />
        <header className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-blue-600">{o.step}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{o.title}</h1>
          <p className="mt-3 text-slate-600">{o.intro}</p>
        </header>
        <OnboardingForm />
      </main>
    </>
  );
}
