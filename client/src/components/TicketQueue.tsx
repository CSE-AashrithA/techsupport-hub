import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../api";
import { label, type Ticket } from "../types";
import { PriorityLabel, StatusPill, timeAgo } from "./TicketBadges";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; tickets: Ticket[] };

interface TicketQueueProps {
  // bump this number to reload the list (e.g. after a new ticket is created)
  refreshKey?: number;
  // this ticket gets a short glow so you can spot it
  highlightId?: number | null;
}

export default function TicketQueue({ refreshKey = 0, highlightId = null }: TicketQueueProps) {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(() => {
    // only show the loading placeholders the first time, not on every refresh
    setState((current) => (current.kind === "ready" ? current : { kind: "loading" }));
    api
      .listTickets()
      .then((tickets) => setState({ kind: "ready", tickets }))
      .catch((err: Error) => setState({ kind: "error", message: err.message }));
  }, []);

  useEffect(load, [load, refreshKey]);

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
            <li key={t.id}>
              <Link
                to={`/tickets/${t.id}`}
                className={`group -mx-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-3 py-4 transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50 ${
                  t.id === highlightId ? "motion-safe:animate-flash" : ""
                }`}
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
                <PriorityLabel priority={t.priority} />
                <StatusPill status={t.status} />
                <span
                  aria-hidden="true"
                  className="text-mist transition group-hover:translate-x-1 group-hover:text-signal"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
