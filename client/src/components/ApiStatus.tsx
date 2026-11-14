import { useEffect, useState } from "react";

type Status = "checking" | "online" | "offline";

const styles: Record<Status, { dot: string; label: string }> = {
  checking: { dot: "bg-slate-400", label: "Checking API…" },
  online: { dot: "bg-green-500", label: "API online" },
  offline: { dot: "bg-red-500", label: "API offline" },
};

// small badge in the header that pings /api/health every 30 seconds
export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

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
    const timer = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const { dot, label } = styles[status];

  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
    >
      <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
