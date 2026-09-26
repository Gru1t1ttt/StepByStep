import { Award, BookOpenCheck, Compass, FileText, GraduationCap, Landmark, Lightbulb, Medal, Plane, Target, Trophy, type LucideIcon } from "lucide-react";

// Орбита на первом экране: в центре — суть Unilight, вокруг вращается всё, из чего
// складывается поступление. Вращение на CSS (keyframes в globals.css), подписи
// поворачиваются в обратную сторону, чтобы оставаться ровными.

type Item = { icon: LucideIcon; label: number; angle: number }; // label — номер подписи в t.orbit.items

const RINGS: { size: number; duration: number; items: Item[] }[] = [
  {
    size: 420,
    duration: 60,
    items: [
      { icon: Target, label: 0, angle: 20 },
      { icon: Compass, label: 1, angle: 140 },
      { icon: FileText, label: 2, angle: 260 },
    ],
  },
  {
    size: 600,
    duration: 90,
    items: [
      { icon: Trophy, label: 3, angle: 70 },
      { icon: BookOpenCheck, label: 4, angle: 170 },
      { icon: Lightbulb, label: 5, angle: 250 },
      { icon: Landmark, label: 6, angle: 330 },
    ],
  },
  {
    size: 780,
    duration: 120,
    items: [
      { icon: Plane, label: 7, angle: 10 },
      { icon: Medal, label: 8, angle: 110 },
      { icon: Award, label: 9, angle: 200 },
      { icon: GraduationCap, label: 10, angle: 290 },
    ],
  },
];

export default function Orbit({ labels, center, centerText }: { labels: string[]; center: string; centerText: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[780px] [--orbit-scale:0.4] sm:[--orbit-scale:0.72] lg:[--orbit-scale:1]" aria-hidden>
      <div className="absolute left-1/2 top-1/2 h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 scale-[var(--orbit-scale)]">
        {RINGS.map((ring, r) => (
          <div
            key={ring.size}
            className="orbit-spin absolute left-1/2 top-1/2 rounded-full border border-white/[0.07]"
            style={{
              width: ring.size,
              height: ring.size,
              marginLeft: -ring.size / 2,
              marginTop: -ring.size / 2,
              animationDuration: `${ring.duration}s`,
              animationDirection: r % 2 ? "reverse" : "normal",
            }}
          >
            {ring.items.map(({ icon: Icon, label, angle }) => (
              <div
                key={angle}
                className="absolute left-1/2 top-1/2"
                style={{ transform: `rotate(${angle}deg) translateY(${-ring.size / 2}px) rotate(${-angle}deg)` }}
              >
                <div
                  className="orbit-spin -translate-x-1/2 -translate-y-1/2"
                  style={{ animationDuration: `${ring.duration}s`, animationDirection: r % 2 ? "normal" : "reverse" }}
                >
                  <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-[#0d1428]/90 px-4 py-2 text-sm font-medium text-slate-200 shadow-lg shadow-black/30 backdrop-blur">
                    <Icon className="h-4 w-4 text-amber-300" strokeWidth={1.8} />
                    {labels[label]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* центр */}
        <div className="absolute left-1/2 top-1/2 flex h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle_at_50%_30%,#16213f,#080d1c_70%)] text-center shadow-[0_0_80px_rgba(79,110,255,0.25)]">
          <span className="font-display text-6xl font-bold text-amber-300">{center}</span>
          <span className="mt-3 max-w-[210px] text-base text-slate-300">{centerText}</span>
        </div>
      </div>
    </div>
  );
}
