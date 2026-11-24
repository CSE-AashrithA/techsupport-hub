import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { label, type Priority, type Status, type Ticket } from "../types";

const priorityStyle: Record<Priority, string> = {
  urgent: "text-signal",
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

// "3 minutes ago", "2 days ago"
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso: string) {
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

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; tickets: Ticket[] };

export default function TicketQueue() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    api
      .listTickets()
      .then((tickets) => setState({ kind: "ready", tickets }))
      .catch((err: Error) => setState({ kind: "error", message: err.message }));
  }, []);

  useEffect(load, [load]);

  const openCount =
    state.kind === "ready"
      ? state.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length
      : null;

  return (
    <section
      aria-label="Your tickets"
      aria-busy={state.kind === "loading"}
      className="rounded-2xl border border-white/10 bg-ink-800/60 p-6 backdrop-blur sm:p-10"
    >
      <p className="eyebrow text-mist">Queue · {openCount ?? "–"} open</p>

      {state.kind === "loading" && (
        <ul className="mt-6 space-y-3" aria-label="Loading tickets">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-16 rounded-xl bg-white/[0.04] motion-safe:animate-pulse" />
          ))}
        </ul>
      )}

      {state.kind === "error" && (
        <div className="mt-4">
          <p className="font-display text-2xl font-semibold">Couldn't load your tickets.</p>
          <p className="mt-2 text-mist">{state.message}</p>
          <button
            type="button"
            onClick={load}
            className="eyebrow mt-5 rounded-full border border-white/15 px-4 py-2 text-cream transition hover:border-signal hover:text-signal"
          >
            Try again
          </button>
        </div>
      )}

      {state.kind === "ready" && state.tickets.length === 0 && (
        <div className="mt-3">
          <p className="font-display text-2xl font-semibold">Nothing in your queue.</p>
          <p className="mt-2 max-w-md text-mist">
            When you report an issue it lands here, with its status and who's working on it.
          </p>
        </div>
      )}

      {state.kind === "ready" && state.tickets.length > 0 && (
        <ul className="mt-6 divide-y divide-white/5">
          {state.tickets.map((t) => (
            <li
              key={t.id}
              className="group flex flex-wrap items-center gap-x-4 gap-y-2 py-4 transition first:pt-0 last:pb-0"
            >
              <span className="w-14 shrink-0 text-sm text-mist tabular-nums">#{t.id}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cream transition group-hover:text-signal-soft">
                  {t.title}
                </p>
                <p className="mt-0.5 text-xs text-mist">
                  {label(t.category)} · {timeAgo(t.createdAt)} ·{" "}
                  {t.assigneeName ? `with ${t.assigneeName}` : "waiting for a technician"}
                </p>
              </div>
              <span className={`eyebrow text-[10px] ${priorityStyle[t.priority]}`}>
                {label(t.priority)}
              </span>
              <span
                className={`eyebrow rounded-full border px-2.5 py-1 text-[10px] ${statusStyle[t.status]}`}
              >
                {label(t.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
