"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/client";

// Вступительная анимация Unilight.
//
// Сцена 1600×900 (масштабируется под экран). Логотип собран из частей по размерам исходного
// логотипа: «Un» и «ght» — картинки, точки и ножка второй «i» — блоки, а палка i/l — это ОДНА
// SVG-линия со скруглёнными углами. Толстая палка логотипа сужается в эту линию, линия плавно
// изгибается в лесенку и обратно (морфинг пути), а в конце снова наливается в палку.
//
// Сценарий: логотип → палка изгибается в лесенку вниз → FEAR: Forget Everything And Run →
// лесенка переворачивается вверх → Face Everything And Rise (золото — «свет» из названия) →
// лесенка выпрямляется обратно в палку, логотип собирается.

const STAGE_W = 1600;
const STAGE_H = 900;
const CONTENT_W = 1180;

const LOGO = {
  un: { left: 261, top: 161, width: 432, height: 268 },
  ght: { left: 848, top: 399, width: 493, height: 356 },
  dot1: { left: 705, top: 161, width: 56, height: 54 },
  dot2: { left: 775, top: 399, width: 56, height: 54 },
  stem2: { left: 779, top: 485, width: 49, height: 175 },
};
const BAR = { x: 733, top: 247, bottom: 659, width: 50 }; // центр палки i/l

const LETTERS = ["F", "E", "A", "R"] as const;
const RUN_WORDS = ["orget", "verything", "nd", "un"];
const RISE_WORDS = ["ace", "verything", "nd", "ise"];
const LETTER_SIZE = 128;
const WORD_SIZE = 84;

// Лесенка: 4 ступеньки по 125px, буква стоит на своей ступеньке
const STEP_X = [405, 530, 655, 780, 905];
const DOWN_Y = [250, 395, 540, 685]; // базовые линии букв
const UP_Y = [700, 555, 410, 265];
const TREAD_GAP = 28; // ступенька чуть ниже базовой линии
const LINE_W = 16; // толщина линии-лесенки

// Путь из 4 ступенек: M x0 y0 H x1 V y1 H x2 V y2 H x3 V y3 H x4 — одна и та же структура
// для палки и для лесенок, поэтому линия может плавно перетекать из формы в форму.
const stairsPath = (ys: number[]) => {
  const t = ys.map((y) => y + TREAD_GAP);
  return `M ${STEP_X[0]} ${t[0]} H ${STEP_X[1]} V ${t[1]} H ${STEP_X[2]} V ${t[2]} H ${STEP_X[3]} V ${t[3]} H ${STEP_X[4]}`;
};
const barPath = () => {
  const s = (BAR.bottom - BAR.top) / 3;
  const y = [BAR.top, BAR.top + s, BAR.top + 2 * s, BAR.bottom];
  return `M ${BAR.x} ${y[0]} H ${BAR.x} V ${y[1]} H ${BAR.x} V ${y[2]} H ${BAR.x} V ${y[3]} H ${BAR.x}`;
};
const PATH = { bar: barPath(), down: stairsPath(DOWN_Y), up: stairsPath(UP_Y) };

// Фазы и время их начала (мс)
const TIMELINE: [number, number][] = [
  [0, 0], // логотип
  [1100, 1], // палка изгибается в лесенку вниз
  [1650, 2], // F E A R падают на ступеньки
  [2150, 3], // Forget Everything And Run
  [3700, 4], // слова срываются, лесенка переворачивается вверх
  [4400, 5], // Face Everything And Rise
  [6300, 6], // слова и буквы уходят
  [6750, 7], // лесенка выпрямляется в палку, логотип собирается
  [7600, 8], // подпись и кнопки
];
const FINAL = 8;

const RED = "#f87171";
const GOLD = "#fbbf24";
const ease = [0.22, 1, 0.36, 1] as const;
const spring = { type: "spring", stiffness: 170, damping: 22, mass: 0.9 } as const;

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

export default function IntroAnimation() {
  const t = useT();
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const scale = useStageScale(box);
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase(FINAL);
      return;
    }
    // ?intro=5 — остановить анимацию на нужной фазе (для проверки отдельных кадров)
    const frozen = Number(new URLSearchParams(window.location.search).get("intro"));
    if (frozen >= 0 && frozen <= FINAL && window.location.search.includes("intro=")) {
      setPhase(frozen);
      return;
    }
    setPhase(0);
    const timers = TIMELINE.map(([at, p]) => setTimeout(() => setPhase(p), at));
    return () => timers.forEach(clearTimeout);
  }, [reduced, run]);

  const replay = useCallback(() => setRun((r) => r + 1), []);

  const logoShown = phase === 0 || phase >= 7;
  const up = phase >= 4 && phase <= 6;
  const shape = phase === 0 || phase >= 7 ? "bar" : up ? "up" : "down";
  const ys = up ? UP_Y : DOWN_Y;
  const lettersShown = phase >= 2 && phase <= 5;
  const fear = phase === 3;
  const rise = phase === 5;

  // толстая палка видна только в логотипе; всё остальное время — тонкая линия
  const barSolid = phase === 0 || phase >= 8;
  const lineShown = (phase >= 1 && phase <= 4) || phase === 7;

  const lineColor = fear ? RED : phase >= 4 && phase <= 6 ? GOLD : "#ffffff";

  const logoPart = (key: keyof typeof LOGO, src?: string) => {
    const r = LOGO[key];
    const props = {
      className: `absolute ${src ? "" : "bg-white"} ${key.startsWith("dot") ? "rounded-full" : ""}`,
      style: { left: r.left, top: r.top, width: r.width, height: r.height },
      initial: { opacity: 0, scale: 0.96 },
      animate: logoShown ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.94, filter: "blur(8px)" },
      transition: { duration: logoShown ? 0.7 : 0.45, ease, delay: logoShown && phase >= 7 ? 0.25 : 0 },
    };
    return src ? <motion.img key={key} src={src} alt="" draggable={false} {...props} /> : <motion.div key={key} {...props} />;
  };

  return (
    <section ref={box} className="relative flex h-[100svh] min-h-[540px] items-center justify-center overflow-hidden text-white">
      {/* свечение: красное в фазе страха, золотое в фазе подъёма */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          opacity: 1,
          background: fear
            ? "radial-gradient(55% 45% at 45% 45%, rgba(248,113,113,0.20), transparent 70%)"
            : phase >= 4 && phase <= 6
              ? "radial-gradient(55% 45% at 50% 55%, rgba(251,191,36,0.20), transparent 70%)"
              : "radial-gradient(55% 45% at 50% 50%, rgba(79,110,255,0.14), transparent 70%)",
        }}
        transition={{ duration: 1.1, ease }}
      />

      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
        aria-hidden
      >
        {logoPart("un", "/intro/un.png")}
        {logoPart("ght", "/intro/ght.png")}
        {logoPart("dot1")}
        {logoPart("dot2")}
        {logoPart("stem2")}

        {/* палка i/l — сплошной блок, как в логотипе. Когда она «гнётся», блок сужается до толщины
            линии и растворяется, а дальше работает тонкая линия со скруглёнными углами. */}
        <motion.div
          className="absolute bg-white"
          style={{ left: BAR.x - BAR.width / 2, top: BAR.top, width: BAR.width, height: BAR.bottom - BAR.top }}
          initial={false}
          animate={barSolid ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: LINE_W / BAR.width }}
          transition={
            barSolid
              ? { duration: 0.55, ease }
              : { opacity: { duration: 0.3, delay: 0.15 }, scaleX: { duration: 0.35, ease } }
          }
        />

        {/* палка ⇄ лесенка — одна тонкая линия */}
        <svg className="absolute inset-0 overflow-visible" width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth={LINE_W}
            filter="url(#glow)"
            initial={{ d: PATH.bar, stroke: "#ffffff", opacity: 0 }}
            animate={{ d: PATH[shape], stroke: lineColor, opacity: lineShown ? 1 : 0 }}
            transition={{
              d: { duration: shape === "bar" ? 0.8 : 0.75, ease: [0.65, 0, 0.25, 1], delay: phase === 1 ? 0.12 : 0 },
              stroke: { duration: 0.6 },
              // пока видны Face Everything And Rise — линия гаснет, чтобы не резать слова
              opacity: { duration: lineShown ? 0.25 : phase >= 8 ? 0.4 : 0.35 },
            }}
          />
        </svg>

        {/* F E A R и слова */}
        {LETTERS.map((letter, i) => (
          <motion.div
            key={letter}
            className="absolute left-0 top-0 flex items-baseline whitespace-nowrap font-[family-name:var(--font-outfit)] font-bold leading-none"
            initial={{ x: STEP_X[i] + 14, y: DOWN_Y[i] - LETTER_SIZE * 0.78 - 60, opacity: 0 }}
            animate={{
              x: STEP_X[i] + 14,
              y: ys[i] - LETTER_SIZE * 0.78 - (lettersShown ? 0 : 60),
              opacity: lettersShown ? 1 : 0,
            }}
            transition={{
              y: phase === 2 ? { ...spring, delay: i * 0.07 } : { duration: 0.75, ease: [0.65, 0, 0.25, 1] },
              x: { duration: 0.6, ease },
              opacity: { duration: 0.3, delay: phase === 2 ? i * 0.07 : 0 },
            }}
          >
            <span style={{ fontSize: LETTER_SIZE }}>{letter}</span>
            <span className="relative" style={{ fontSize: WORD_SIZE }}>
              <motion.span
                className="absolute left-0 top-0"
                style={{ color: RED, textShadow: "0 0 24px rgba(248,113,113,0.45)" }}
                initial={{ opacity: 0, x: -18, filter: "blur(10px)" }}
                animate={
                  fear
                    ? { opacity: 1, x: 0, filter: "blur(0px)" }
                    : phase === 4
                      ? { opacity: 0, x: 60, filter: "blur(12px)" }
                      : { opacity: 0, x: -18, filter: "blur(10px)" }
                }
                transition={{ duration: fear ? 0.42 : 0.35, delay: fear ? 0.14 * i : 0.04 * i, ease }}
              >
                {RUN_WORDS[i]}
              </motion.span>
              <motion.span
                className="block"
                style={{ color: GOLD, textShadow: "0 0 30px rgba(251,191,36,0.55)" }}
                initial={{ opacity: 0, x: -18, filter: "blur(10px)" }}
                animate={rise ? { opacity: 1, x: 0, filter: "blur(0px)" } : { opacity: 0, x: -18, filter: "blur(10px)" }}
                transition={{ duration: 0.45, delay: rise ? 0.16 * i : 0, ease }}
              >
                {RISE_WORDS[i]}
              </motion.span>
            </span>
          </motion.div>
        ))}

      </div>

      <motion.div
        className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-4 text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={phase >= FINAL ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
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
