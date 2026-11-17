import { useEffect, useState } from "react";

// sample numbers for now, these get replaced with real stats once tickets live in the database
const stats = [
  { label: "Open", value: 12, decimals: 0, suffix: "", accent: false },
  { label: "Urgent", value: 3, decimals: 0, suffix: "", accent: true },
  { label: "Avg fix", value: 1.8, decimals: 1, suffix: "h", accent: false },
];

const resolvedPerDay = [4, 6, 5, 9, 8, 12, 14];
const days = ["M", "T", "W", "T", "F", "S", "S"];

const recent = [
  { id: 1044, title: "Wi-Fi down in Lab B", status: "Urgent", color: "text-signal" },
  { id: 1043, title: "New laptop setup", status: "In progress", color: "text-amber-300" },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// counts from 0 up to the target when the component first shows up
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

function Stat({ label, value, decimals, suffix, accent }: (typeof stats)[number]) {
  const current = useCountUp(value);
  return (
    <div>
      <p
        className={`font-display text-3xl font-semibold tabular-nums ${accent ? "text-signal" : "text-cream"}`}
      >
        {current.toFixed(decimals)}
        {suffix}
      </p>
      <p className="eyebrow mt-1 text-[10px] text-mist">{label}</p>
    </div>
  );
}

// turns the daily numbers into svg coordinates inside a 300x90 box
function chartPoints(values: number[], width = 300, height = 90, pad = 6) {
  const max = Math.max(...values);
  const step = width / (values.length - 1);
  return values.map((v, i) => [i * step, height - pad - (v / max) * (height - pad * 2)] as const);
}

export default function DeskPulse() {
  const points = chartPoints(resolvedPerDay);
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,90 ${line} 300,90`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <aside
      aria-label="Help desk activity (sample data)"
      className="rounded-2xl border border-white/10 bg-ink-800/70 p-6 shadow-[0_30px_80px_-30px] shadow-signal/30 backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <p className="eyebrow text-mist">Desk pulse · today</p>
        <span className="eyebrow flex items-center gap-2 text-emerald-300">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Live
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-7 border-t border-white/5 pt-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-mist">Resolved this week</p>
          <p className="text-sm font-medium text-emerald-300">↑ 18%</p>
        </div>

        <svg viewBox="0 0 300 90" className="mt-3 h-24 w-full overflow-visible" role="img"
          aria-label="Tickets resolved per day this week, rising from 4 on Monday to 14 on Sunday"
        >
          <defs>
            <linearGradient id="pulse-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#pulse-fill)" className="motion-safe:animate-rise [animation-delay:1.2s]" />
          <polyline
            points={line}
            pathLength={1}
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="motion-safe:animate-draw motion-safe:[stroke-dasharray:1]"
          />
          <circle cx={lastX} cy={lastY} r="4" fill="var(--color-signal)"
            className="motion-safe:animate-rise [animation-delay:1.9s]"
          />
        </svg>

        <div className="mt-2 flex justify-between text-[10px] text-mist/70">
          {days.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>

      <ul className="mt-6 space-y-2 border-t border-white/5 pt-5">
        {recent.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-cream">
              <span className="text-mist tabular-nums">#{t.id}</span> {t.title}
            </span>
            <span className={`eyebrow shrink-0 text-[10px] ${t.color}`}>{t.status}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[11px] text-mist/60">Sample data. Live numbers arrive with the ticket system.</p>
    </aside>
  );
}
