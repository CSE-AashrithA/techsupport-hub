import { useRef, useState } from "react";
import DeskPulse from "../components/DeskPulse";
import ReportIssueDialog from "../components/ReportIssueDialog";
import TicketQueue from "../components/TicketQueue";
import type { Ticket } from "../types";

export default function HomePage() {
  const [reportOpen, setReportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTicketId, setNewTicketId] = useState<number | null>(null);
  const queueRef = useRef<HTMLDivElement>(null);

  function handleCreated(ticket: Ticket) {
    setReportOpen(false);
    setNewTicketId(ticket.id);
    setRefreshKey((key) => key + 1);
    queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow inline-block rounded-full bg-signal-strong motion-safe:animate-rise px-3 py-1.5 text-white">
              IT Support · Help desk
            </span>

            <h1 className="mt-6 motion-safe:animate-rise [animation-delay:90ms] font-display text-6xl leading-[0.9] font-bold tracking-tight uppercase sm:text-8xl">
              Your
              <br />
              tickets<span className="text-signal">.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-mist motion-safe:animate-rise [animation-delay:180ms]">
              Report an IT problem in seconds and follow it until it's fixed. No email chains, no
              guessing who's on it.
            </p>

            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-signal-strong px-6 py-3 font-semibold text-white shadow-[0_0_30px_-6px] shadow-signal transition hover:bg-signal motion-safe:animate-rise [animation-delay:220ms]"
            >
              Report an issue <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="motion-safe:animate-rise [animation-delay:240ms]">
            <DeskPulse />
          </div>
        </div>

        <div
          ref={queueRef}
          className="mt-14 scroll-mt-6 motion-safe:animate-rise [animation-delay:300ms]"
        >
          <TicketQueue refreshKey={refreshKey} highlightId={newTicketId} />
        </div>
      </main>

      <ReportIssueDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
