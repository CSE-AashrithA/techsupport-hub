import { label, type Priority, type Status } from "../types";

// shared by the queue and the ticket page so tickets look the same everywhere

const priorityStyle: Record<Priority, string> = {
  urgent: "text-urgent",
  high: "text-amber-300",
  medium: "text-sky-300",
  low: "text-mist",
};

const statusStyle: Record<Status, string> = {
  open: "border-sky-400/40 text-sky-200",
  in_progress: "border-amber-300/40 text-amber-200",
  resolved: "border-emerald-400/40 text-emerald-200",
  closed: "border-white/15 text-mist",
};

export function PriorityLabel({ priority }: { priority: Priority }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-1.5 text-[10px] ${priorityStyle[priority]}`}>
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full bg-current ${priority === "urgent" ? "shadow-[0_0_8px] shadow-current" : ""}`}
      />
      {label(priority)}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`eyebrow rounded-full border px-2.5 py-1 text-[10px] ${statusStyle[status]}`}>
      {label(status)}
    </span>
  );
}

// "3 minutes ago", "2 days ago"
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function timeAgo(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

// "Nov 25, 2026, 10:36 PM"
export function fullDate(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}
