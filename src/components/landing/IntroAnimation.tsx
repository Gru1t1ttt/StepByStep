"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Вступительная анимация Unilight.
//
// Сцена 1600×900 (масштабируется под экран). Логотип собран из частей, координаты
// сняты с исходного логотипа: «Un», «ght» — картинки, палка i/l, точки и ножка второй «i» — блоки.
//
// Сценарий: логотип → палка i/l распадается на ступеньки лесенки вниз → FEAR:
// Forget Everything And Run (красный) → слова рассыпаются → лесенка переворачивается вверх →
// Face Everything And Rise (золото, «свет» — как в названии) → всё собирается обратно в логотип.

const STAGE_W = 1600;
const STAGE_H = 900;
const CONTENT_W = 1180; // ширина, которую нужно уместить на экране (логотип и самые длинные слова)

// Части логотипа на сцене
const LOGO = {
  un: { left: 261, top: 161, width: 432, height: 268 },
  ght: { left: 848, top: 399, width: 493, height: 341 },
  dot1: { left: 705, top: 161, width: 56, height: 54 },
  dot2: { left: 775, top: 399, width: 56, height: 54 },
  stem2: { left: 779, top: 485, width: 49, height: 175 },
  bar: { left: 708, top: 247, width: 50, height: 413 },
};

const LETTERS = ["F", "E", "A", "R"] as const;
const RUN_WORDS = ["orget", "verything", "nd", "un"];
const RISE_WORDS = ["ace", "verything", "nd", "ise"];

const LETTER_SIZE = 128;
const WORD_SIZE = 84;

// Позиции букв (левый край, базовая линия) для лесенки вниз и вверх
const DOWN = [
  { x: 440, y: 250 },
  { x: 540, y: 395 },
  { x: 640, y: 540 },
  { x: 740, y: 685 },
];
const UP = [
  { x: 420, y: 700 },
  { x: 545, y: 555 },
  { x: 670, y: 410 },
  { x: 795, y: 265 },
];

// Ступенька — полоска под буквой
const tread = (p: { x: number; y: number }) => ({ left: p.x - 12, top: p.y + 22, width: 150, height: 22 });
// Исходное положение ступенек — четыре куска палки i/l
const barPiece = (i: number) => {
  // нахлёст в 3px, чтобы в собранном логотипе не было видно швов между кусками
  const h = LOGO.bar.height / 4;
  const top = LOGO.bar.top + h * i - (i > 0 ? 3 : 0);
  return { left: LOGO.bar.left, top, width: LOGO.bar.width, height: LOGO.bar.top + h * (i + 1) - top };
};

// Фазы анимации и когда они начинаются (мс)
const TIMELINE = [
  [0, 0], // логотип
  [1300, 1], // палка распадается на лесенку вниз
  [2100, 2], // появляются F E A R
  [2800, 3], // Forget Everything And Run
  [4600, 4], // слова рассыпаются
  [5200, 5], // лесенка переворачивается вверх
  [6000, 6], // Face Everything And Rise
  [8200, 7], // всё уходит
  [8900, 8], // логотип собирается обратно
  [9800, 9], // подпись и подсказка листать
] as const;
const FINAL = 9;

const RED = "#ef4444";
const GOLD = "#fbbf24";
const ease = [0.22, 1, 0.36, 1] as const;

function useStageScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min((el.clientWidth * 0.94) / CONTENT_W, (el.clientHeight * 0.9) / STAGE_H));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

export default function IntroAnimation() {
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
    setPhase(0);
    const timers = TIMELINE.map(([at, p]) => setTimeout(() => setPhase(p), at));
    return () => timers.forEach(clearTimeout);
  }, [reduced, run]);

  const replay = useCallback(() => setRun((r) => r + 1), []);

  const logoShown = phase === 0 || phase >= 8;
  const stairs = phase >= 1 && phase <= 7;
  const up = phase >= 5;
  const positions = up ? UP : DOWN;
  const lettersShown = phase >= 2 && phase <= 6;

  const logoPart = (key: keyof typeof LOGO, src?: string) => {
    const r = LOGO[key];
    const common = {
      className: "absolute",
      style: { left: r.left, top: r.top, width: r.width, height: r.height },
      initial: { opacity: 0, y: 12 },
      animate: logoShown ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: -8, filter: "blur(6px)" },
      transition: { duration: 0.6, ease },
    };
    return src ? (
      <motion.img key={key} src={src} alt="" draggable={false} {...common} />
    ) : (
      <motion.div key={key} {...common} className={`absolute bg-white ${key.startsWith("dot") ? "rounded-full" : ""}`} />
    );
  };

  return (
    <section ref={box} className="relative flex h-[100svh] min-h-[520px] items-center justify-center overflow-hidden bg-[#07080b] text-white">
      {/* мягкое свечение фона: красное в фазе страха, золотое в фазе подъёма */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background:
            phase >= 3 && phase <= 4
              ? "radial-gradient(60% 50% at 45% 45%, rgba(239,68,68,0.16), transparent 70%)"
              : phase >= 6 && phase <= 7
                ? "radial-gradient(60% 50% at 50% 55%, rgba(251,191,36,0.16), transparent 70%)"
                : "radial-gradient(60% 50% at 50% 50%, rgba(255,255,255,0.05), transparent 70%)",
        }}
        transition={{ duration: 1 }}
      />

      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center" }}
        aria-hidden
      >
        {/* логотип */}
        {logoPart("un", "/intro/un.png")}
        {logoPart("ght", "/intro/ght.png")}
        {logoPart("dot1")}
        {logoPart("dot2")}
        {logoPart("stem2")}

        {/* палка i/l → четыре ступеньки */}
        {LETTERS.map((_, i) => {
          const target = stairs ? tread(positions[i]) : barPiece(i);
          return (
            <motion.div
              key={`tread-${i}`}
              className="absolute bg-white"
              initial={barPiece(i)}
              animate={{
                ...target,
                borderRadius: stairs ? 6 : 0,
                backgroundColor: phase >= 3 && phase <= 4 ? "#fecaca" : phase >= 6 && phase <= 7 ? "#fde68a" : "#ffffff",
                opacity: phase === 7 ? 0.9 : 1,
              }}
              transition={{ duration: stairs ? 0.75 : 0.7, ease, delay: stairs && phase === 1 ? i * 0.08 : phase === 5 ? (3 - i) * 0.06 : 0 }}
            />
          );
        })}

        {/* буквы F E A R и слова */}
        {LETTERS.map((letter, i) => {
          const p = positions[i];
          return (
            <motion.div
              key={`row-${i}`}
              className="absolute flex items-baseline whitespace-nowrap font-[family-name:var(--font-outfit)] font-bold leading-none"
              style={{ left: 0, top: 0 }}
              initial={false}
              animate={{ x: p.x, y: p.y - LETTER_SIZE * 0.78, opacity: lettersShown ? 1 : 0 }}
              transition={{
                x: { duration: 0.8, ease },
                y: { duration: 0.8, ease },
                opacity: { duration: 0.4, delay: phase === 2 ? i * 0.12 : 0 },
              }}
            >
              <motion.span
                style={{ fontSize: LETTER_SIZE }}
                animate={{ scale: phase === 2 ? [0.6, 1.08, 1] : 1 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                {letter}
              </motion.span>
              <span className="relative" style={{ fontSize: WORD_SIZE }}>
                <motion.span
                  className="absolute left-0 top-0"
                  style={{ color: RED }}
                  initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
                  animate={
                    phase === 3
                      ? { clipPath: "inset(0 0% 0 0)", opacity: 1, x: 0, filter: "blur(0px)" }
                      : phase === 4
                        ? { clipPath: "inset(0 0% 0 0)", opacity: 0, x: 40, filter: "blur(10px)" }
                        : { clipPath: "inset(0 100% 0 0)", opacity: 0, x: 0, filter: "blur(0px)" }
                  }
                  transition={{ duration: phase === 4 ? 0.55 : 0.5, delay: phase === 3 ? 0.25 * i : 0.05 * i, ease }}
                >
                  {RUN_WORDS[i]}
                </motion.span>
                <motion.span
                  className="block"
                  style={{ color: GOLD, textShadow: "0 0 28px rgba(251,191,36,0.55)" }}
                  initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                  animate={phase === 6 ? { clipPath: "inset(0 0% 0 0)", opacity: 1 } : { clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                  transition={{ duration: 0.55, delay: phase === 6 ? 0.28 * i : 0, ease }}
                >
                  {RISE_WORDS[i]}
                </motion.span>
              </span>
            </motion.div>
          );
        })}

        {/* световой след, когда лесенка поднимается */}
        <motion.div
          className="absolute h-3 rounded-full"
          style={{ left: 380, top: 760, width: 620, background: "linear-gradient(90deg, transparent, #fbbf24, #fff7d6)", rotate: -38, transformOrigin: "left center" }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={phase === 5 ? { opacity: [0, 1, 0], scaleX: [0, 1, 1] } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.9, ease }}
        />
        <motion.div
          className="absolute h-10 w-10 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 35%, #fff7d6, #fbbf24 55%, #b45309)", boxShadow: "0 0 40px 10px rgba(251,191,36,0.45)" }}
          initial={{ opacity: 0, left: 380, top: 760 }}
          animate={phase === 6 ? { opacity: 1, left: [380, 1120, 1180], top: [760, 250, 230] } : { opacity: 0 }}
          transition={{ duration: phase === 6 ? 1.6 : 0.4, ease }}
        />
      </div>

      {/* подпись и подсказка */}
      <motion.div
        className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4 px-4 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={phase >= FINAL ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.7, ease }}
      >
        <p className="font-[family-name:var(--font-outfit)] text-sm font-medium uppercase tracking-[0.35em] text-white/70 sm:text-base">
          Face everything and rise
        </p>
        <div className="flex items-center gap-3">
          <a href="#start" className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100">
            Начать путь <ChevronDown className="h-4 w-4" />
          </a>
          <button type="button" onClick={replay} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-white/60 hover:text-white" aria-label="Повторить анимацию">
            <RotateCcw className="h-4 w-4" /> Ещё раз
          </button>
        </div>
      </motion.div>

      {/* текст для скринридеров */}
      <h2 className="sr-only">Unilight — Face Everything And Rise</h2>
    </section>
  );
}
