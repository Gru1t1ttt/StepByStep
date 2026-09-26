"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

// Вступительная анимация Unilight: логотип собирается из частей.
//
// Сцена 1600×900 (масштабируется под экран), части — по размерам исходного логотипа:
// «Un» и «ght» — картинки, точки и ножка второй «i» — блоки, палка i/l — отдельный блок.
// Порядок: палка вырастает из центра → «Un» и «ght» съезжаются к ней → вырастает ножка «i» →
// точки падают сверху → вспышка золотого света за логотипом → подпись и кнопки.

const STAGE_W = 1600;
const STAGE_H = 900;
const CONTENT_W = 1180;

const LOGO = {
  un: { left: 261, top: 161, width: 432, height: 268 },
  ght: { left: 848, top: 399, width: 493, height: 356 },
  bar: { left: 708, top: 247, width: 50, height: 412 },
  stem2: { left: 779, top: 485, width: 49, height: 175 },
  dot1: { left: 705, top: 161, width: 56, height: 54 },
  dot2: { left: 775, top: 399, width: 56, height: 54 },
};

const DONE_MS = 2600; // когда показывать подпись и кнопки
const ease = [0.22, 1, 0.36, 1] as const;
const drop = { type: "spring", stiffness: 420, damping: 16, mass: 0.8 } as const;

function useStageScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min((el.clientWidth * 0.94) / CONTENT_W, (el.clientHeight * 0.86) / STAGE_H));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

const box = (r: { left: number; top: number; width: number; height: number }) => ({ left: r.left, top: r.top, width: r.width, height: r.height });

export default function IntroAnimation() {
  const t = useT();
  const reduced = useReducedMotion();
  const stageBox = useRef<HTMLDivElement>(null);
  const scale = useStageScale(stageBox);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDone(!!reduced);
    if (reduced) return;
    const timer = setTimeout(() => setDone(true), DONE_MS);
    return () => clearTimeout(timer);
  }, [reduced, run]);

  const replay = useCallback(() => setRun((r) => r + 1), []);
  // при «уменьшении движения» логотип сразу собран
  const from = <T extends object>(v: T) => (reduced ? false : v);

  return (
    <section ref={stageBox} className="relative flex h-[100svh] min-h-[540px] items-center justify-center overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_50%,rgba(79,110,255,0.14),transparent_70%)]" />

      <div
        key={run}
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
        aria-hidden
      >
        {/* вспышка золотого света за логотипом, когда он собрался */}
        <motion.div
          className="pointer-events-none absolute rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.45),rgba(251,191,36,0.12)_55%,transparent)]"
          style={{ left: 330, top: 110, width: 940, height: 700 }}
          initial={from({ opacity: 0, scale: 0.5 })}
          animate={{ opacity: [0, 1, 0.35], scale: [0.5, 1.1, 1] }}
          transition={{ duration: 1.6, delay: 1.75, times: [0, 0.3, 1], ease: "easeOut" }}
        />
        {/* световая полоса, пробегающая по логотипу */}
        <motion.div
          className="pointer-events-none absolute h-[3px] rounded-full bg-gradient-to-r from-transparent via-amber-200 to-transparent"
          style={{ left: 0, top: 450, width: 520 }}
          initial={from({ x: -600, opacity: 0 })}
          animate={{ x: [-600, 1700], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, delay: 1.7, ease: "easeInOut" }}
        />

        {/* палка i/l вырастает из центра */}
        <motion.div
          className="absolute bg-white"
          style={box(LOGO.bar)}
          initial={from({ scaleY: 0, opacity: 0 })}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        />

        {/* «Un» и «ght» съезжаются к палке */}
        <motion.img
          src="/intro/un.png"
          alt=""
          draggable={false}
          className="absolute"
          style={box(LOGO.un)}
          initial={from({ x: -140, opacity: 0, filter: "blur(14px)" })}
          animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.6, ease }}
        />
        <motion.img
          src="/intro/ght.png"
          alt=""
          draggable={false}
          className="absolute"
          style={box(LOGO.ght)}
          initial={from({ x: 140, opacity: 0, filter: "blur(14px)" })}
          animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.7, ease }}
        />

        {/* ножка второй «i» вырастает снизу */}
        <motion.div
          className="absolute origin-bottom bg-white"
          style={box(LOGO.stem2)}
          initial={from({ scaleY: 0 })}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.55, delay: 1.1, ease }}
        />

        {/* точки падают сверху и чуть пружинят; на миг вспыхивают золотом */}
        {(["dot1", "dot2"] as const).map((k, i) => (
          <motion.div
            key={k}
            className="absolute rounded-full"
            style={box(LOGO[k])}
            initial={from({ y: -260, opacity: 0, backgroundColor: "#fbbf24" })}
            animate={{ y: 0, opacity: 1, backgroundColor: ["#fbbf24", "#fbbf24", "#ffffff"] }}
            transition={{
              y: { ...drop, delay: 1.3 + i * 0.15 },
              opacity: { duration: 0.2, delay: 1.3 + i * 0.15 },
              backgroundColor: { duration: 1.4, delay: 1.3 + i * 0.15, times: [0, 0.5, 1] },
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-4 text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.7, ease }}
      >
        <p className="font-[family-name:var(--font-outfit)] text-sm font-medium uppercase tracking-[0.35em] text-white/60 sm:text-base">Face everything and rise</p>
        <div className="flex items-center gap-3">
          <a href="#start" className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#060a16] transition hover:bg-slate-100">
            {t.intro.start} <ChevronDown className="h-4 w-4" />
          </a>
          <button type="button" onClick={replay} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/50 transition hover:text-white" aria-label={t.intro.replayAria}>
            <RotateCcw className="h-4 w-4" /> {t.intro.replay}
          </button>
        </div>
      </motion.div>

      <h2 className="sr-only">Unilight — Face Everything And Rise</h2>
    </section>
  );
}
