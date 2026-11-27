import { useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";

const styles: Record<Status, { dot: string; label: string }> = {
  checking: { dot: "bg-mist", label: "Connecting" },
  online: { dot: "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400", label: "IT desk online" },
  offline: { dot: "bg-urgent shadow-[0_0_8px] shadow-urgent", label: "IT desk offline" },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

// header pill: live clock + whether the api answers /api/health
export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/health");
        if (!cancelled) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    check();
    const healthTimer = setInterval(check, 30_000);
    const clockTimer = setInterval(() => setTime(formatTime(new Date())), 10_000);
    return () => {
      cancelled = true;
      clearInterval(healthTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const { dot, label } = styles[status];

  return (
    <span
      role="status"
      className="eyebrow inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-mist backdrop-blur"
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span className="text-cream tabular-nums">{time}</span>
      {/* on phones only the dot and time show; screen readers still hear the status */}
      <span aria-hidden="true" className="hidden sm:inline">
        ·
      </span>
      <span className="sr-only sm:not-sr-only">{label}</span>
    </span>
  );
}
