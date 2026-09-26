"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/platform/ui";
import CuratedMatch from "@/components/universities/CuratedMatch";
import WorldSearch from "@/components/universities/WorldSearch";
import { useT } from "@/lib/i18n/client";
import { toggleIn, updateState, usePlatform } from "@/lib/store";

// Университеты: поиск по всем вузам мира и подбор из вузов с требованиями (для gap analysis).
function Universities() {
  const tab = useSearchParams().get("tab") === "match" ? "match" : "world";
  const state = usePlatform();
  const tc = useT().cabinet;
  const tabClass = (on: boolean) => `rounded-lg px-4 py-2 text-sm font-medium ${on ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`;
  return (
    <div>
      <PageHeader title={tc.pages.universities[0]} subtitle={tc.pages.universities[1]} />
      <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-1">
        <Link href="/universities" className={tabClass(tab === "world")}>
          {tc.uniTabs[0]}
        </Link>
        <Link href="/universities?tab=match" className={tabClass(tab === "match")}>
          {tc.uniTabs[1]}
        </Link>
      </div>
      {tab === "world" ? (
        <WorldSearch targets={state?.targets ?? []} onToggleTarget={(id) => updateState((s) => ({ targets: toggleIn(s.targets, id) }))} />
      ) : (
        <CuratedMatch />
      )}
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}>
      <Universities />
    </Suspense>
  );
}
