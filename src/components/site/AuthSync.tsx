"use client";

import { useEffect } from "react";
import { startAuthSync } from "@/lib/store";

// Подписка на вход/выход в аккаунт — один раз на всё приложение.
export default function AuthSync() {
  useEffect(() => startAuthSync(), []);
  return null;
}
