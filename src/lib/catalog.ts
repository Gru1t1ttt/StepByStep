"use client";

import { useSyncExternalStore } from "react";
import { OPPORTUNITIES } from "@/data/opportunities";
import { UNIVERSITIES } from "@/data/universities";
import type { Catalog } from "./analysis";
import { oppFromRow, uniFromRow, type OppRow, type UniRow } from "./catalog-map";
import { supabase } from "./supabase";

// Каталог возможностей и вузов для платформы: опубликованные записи из Supabase
// (их ведёт команда в /admin). Без Supabase — демо-данные из src/data.
// Загружается один раз за визит; обновить после правок в админке — refreshCatalog().

let data: Catalog | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

async function load() {
  const sb = supabase();
  if (!sb) {
    data = { opportunities: OPPORTUNITIES, universities: UNIVERSITIES };
  } else {
    const [opps, unis] = await Promise.all([sb.from("opportunities").select("*"), sb.from("universities").select("*")]);
    if (opps.error || unis.error) {
      console.error("Не удалось загрузить каталог", opps.error ?? unis.error);
      data = { opportunities: OPPORTUNITIES, universities: UNIVERSITIES };
    } else {
      data = {
        opportunities: (opps.data as OppRow[]).map(oppFromRow),
        universities: (unis.data as UniRow[]).map(uniFromRow),
      };
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  loading ??= load().finally(() => (loading = null));
  return () => listeners.delete(listener);
}

export function useCatalog(): Catalog | null {
  return useSyncExternalStore(
    subscribe,
    () => data,
    () => null,
  );
}

export function refreshCatalog() {
  loading = load().finally(() => (loading = null));
  return loading;
}
