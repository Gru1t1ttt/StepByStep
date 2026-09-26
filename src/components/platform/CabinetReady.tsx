"use client";

import { useCabinetReady } from "@/components/site/CabinetLoader";
import { useAuth, usePlatform } from "@/lib/store";

// Прячет заставку входа, когда стало ясно, кто вошёл, и данные кабинета загружены.
export default function CabinetReady() {
  const auth = useAuth();
  const state = usePlatform();
  useCabinetReady(auth.status === "signed-out" || (auth.status !== "loading" && state !== null));
  return null;
}
