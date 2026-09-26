"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type ComponentProps } from "react";
import { useT } from "@/lib/i18n/client";
import { useTheme } from "@/lib/theme";

// Переход в кабинет. Логотип Unilight на тёмном фоне: палка i/l сворачивается в кольцо,
// точки и ножка второй «i» втягиваются в него, кольцо крутится, пока кабинет загружается.
//
// Экран живёт в корневом layout, поэтому не пропадает при смене страницы: главная его
// показывает (enterCabinet), а кабинет прячет, когда данные готовы (useCabinetReady).

const MIN_SHOW_MS = 1500; // анимация успевает доиграть до кольца
const MAX_SHOW_MS = 8000; // на всякий случай — если кабинет так и не сообщил о готовности

let shownAt = 0;
let visible = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l));

function show() {
  shownAt = Date.now();
  visible = true;
  emit();
  setTimeout(hide, MAX_SHOW_MS);
}
function hide() {
  if (!visible) return;
  visible = false;
  emit();
}

// Показать заставку, не уходя со страницы (например, после входа по паролю).
export function showCabinetLoader() {
  if (!visible) show();
}

// Показать заставку и перейти в кабинет, когда кольцо сложится.
export function enterCabinet(router: ReturnType<typeof useRouter>, href = "/dashboard") {
  if (visible) return;
  router.prefetch(href);
  show();
  setTimeout(() => router.push(href), 900);
}

// Вызывается в кабинете: когда вход и данные загружены, заставка плавно исчезает.
export function useCabinetReady(ready: boolean) {
  useEffect(() => {
    if (!ready || !visible) return;
    const t = setTimeout(hide, Math.max(0, MIN_SHOW_MS - (Date.now() - shownAt)));
    return () => clearTimeout(t);
  }, [ready]);
}

// Ссылка в кабинет с заставкой вместо резкого перехода.
export function CabinetLink({ href = "/dashboard", onClick, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href?: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        enterCabinet(router, href);
      }}
      {...props}
    />
  );
}

// ——— сама заставка ———

const GOLD = "#fbbf24";
const ease = [0.65, 0, 0.25, 1] as const;
const R = 72; // радиус кольца в координатах сцены
const CX = 800;
const CY = 450;

const BAR = { left: 708, top: 247, width: 50, height: 412 };
const DOTS = [
  { left: 705, top: 161, size: 56 },
  { left: 775, top: 399, size: 56 },
];
const STEM2 = { left: 779, top: 485, width: 49, height: 175 };

function useScale() {
  const [scale, setScale] = useState(0.4);
  useLayoutEffect(() => {
    const update = () => setScale(Math.min((window.innerWidth * 0.62) / 1080, (window.innerHeight * 0.42) / 600, 0.55));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

function Scene() {
  const t = useT();
  const scale = useScale();
  const light = useTheme().theme === "light";
  const ink = light ? "#0b1324" : "#ffffff"; // цвет логотипа
  const track = light ? "rgba(11,19,36,0.1)" : "rgba(255,255,255,0.12)";
  const [phase, setPhase] = useState(0); // 0 логотип · 1 сворачивается · 2 кольцо крутится

  useEffect(() => {
    const a = setTimeout(() => setPhase(1), 380);
    const b = setTimeout(() => setPhase(2), 1100);
    return () => (clearTimeout(a), clearTimeout(b));
  }, []);

  const ring = phase >= 1;
  const faded = { opacity: 0, scale: 0.94, filter: "blur(10px)" };
  const shown = { opacity: 1, scale: 1, filter: "blur(0px)" };

  return (
    <motion.div
      className={`ink fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${light ? "bg-[#f5f7fb]" : "bg-[#060a16]"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_35%_at_50%_50%,rgba(59,108,255,0.18),transparent_70%)]" />

      <div className="absolute left-1/2 top-1/2 h-[900px] w-[1600px]" style={{ transform: `translate(-50%, -50%) scale(${scale})` }} aria-hidden>
        <motion.img
          src={`/intro/un${light ? "-dark" : ""}.png`}
          alt=""
          className="absolute"
          style={{ left: 261, top: 161, width: 432, height: 268 }}
          initial={faded}
          animate={ring ? faded : shown}
          transition={{ duration: ring ? 0.5 : 0.35, ease }}
        />
        <motion.img
          src={`/intro/ght${light ? "-dark" : ""}.png`}
          alt=""
          className="absolute"
          style={{ left: 848, top: 399, width: 493, height: 356 }}
          initial={faded}
          animate={ring ? faded : shown}
          transition={{ duration: ring ? 0.5 : 0.35, ease }}
        />
        <motion.div
          className="absolute"
          style={{ ...STEM2, backgroundColor: ink }}
          initial={{ opacity: 0 }}
          animate={ring ? { opacity: 0, scaleY: 0.2, y: -40 } : { opacity: 1, scaleY: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        />
        {DOTS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
            initial={{ opacity: 0 }}
            animate={
              ring
                ? { x: CX - d.size / 2 - d.left, y: CY - d.size / 2 - d.top, scale: 0.2, opacity: 0, backgroundColor: GOLD }
                : { x: 0, y: 0, scale: 1, opacity: 1, backgroundColor: ink }
            }
            transition={{ duration: 0.6, ease, delay: i * 0.06 }}
          />
        ))}

        {/* палка i/l → кольцо: сплошной блок из толстой рамки плавно скругляется в окружность */}
        <motion.div
          className="absolute"
          style={{ borderStyle: "solid" }}
          initial={{
            left: BAR.left,
            top: BAR.top,
            width: BAR.width,
            height: BAR.height,
            borderRadius: 0,
            borderWidth: BAR.width / 2,
            borderTopColor: ink,
            borderRightColor: ink,
            borderBottomColor: ink,
            borderLeftColor: ink,
            boxShadow: "0 0 0px rgba(251,191,36,0)",
            opacity: 0,
            rotate: 0,
          }}
          animate={
            ring
              ? {
                  left: CX - R,
                  top: CY - R,
                  width: 2 * R,
                  height: 2 * R,
                  borderRadius: R,
                  borderWidth: 12,
                  borderTopColor: GOLD,
                  borderRightColor: "rgba(251,191,36,0.55)",
                  borderBottomColor: track,
                  borderLeftColor: track,
                  boxShadow: "0 0 60px rgba(251,191,36,0.25)",
                  opacity: 1,
                  rotate: phase === 2 ? 360 : 0,
                }
              : { opacity: 1 }
          }
          transition={{
            default: { duration: 0.75, ease },
            opacity: { duration: 0.3 },
            rotate: phase === 2 ? { duration: 0.9, ease: "linear", repeat: Infinity } : { duration: 0 },
          }}
        />
      </div>

      <motion.p
        className="absolute left-0 right-0 text-center font-[family-name:var(--font-outfit)] text-sm font-medium uppercase tracking-[0.3em] text-white/60"
        style={{ top: `calc(50% + ${R * scale + 36}px)` }}
        initial={{ opacity: 0, y: 8 }}
        animate={ring ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        {t.loader.text}
      </motion.p>
    </motion.div>
  );
}

// Ставится один раз в корневом layout.
export default function CabinetLoaderHost() {
  const on = useSyncExternalStore(subscribe, () => visible, () => false);
  return <AnimatePresence>{on && <Scene />}</AnimatePresence>;
}
