import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router";
import { api, ApiError } from "../api";
import { fullDate, PriorityLabel, StatusPill, timeAgo } from "../components/TicketBadges";
import { label, type Comment, type TicketWithComments } from "../types";

type State =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "ready"; ticket: TicketWithComments };

export default function TicketDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(() => {
    const ticketId = Number(id);
    if (!Number.isSafeInteger(ticketId) || ticketId <= 0) {
      setState({ kind: "not-found" });
      return;
    }
    setState({ kind: "loading" });
    api
      .getTicket(ticketId)
      .then((ticket) => setState({ kind: "ready", ticket }))
      .catch((err: Error) =>
        setState(
          err instanceof ApiError && err.status === 404
            ? { kind: "not-found" }
            : { kind: "error", message: err.message },
        ),
      );
  }, [id]);

  useEffect(load, [load]);

  // show a new update right away, without reloading the whole ticket
  function handleCommentAdded(comment: Comment) {
    setState((current) =>
      current.kind === "ready"
        ? {
            kind: "ready",
            ticket: {
              ...current.ticket,
              comments: [...current.ticket.comments, comment],
              updatedAt: comment.createdAt,
            },
          }
        : current,
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 pt-10 pb-24">
      <Link
        to="/"
        className="eyebrow inline-flex items-center gap-2 text-mist transition hover:text-signal"
      >
        <span aria-hidden="true">←</span> All tickets
      </Link>

      {state.kind === "loading" && (
        <div aria-label="Loading ticket" className="mt-10 space-y-4">
          <div className="h-4 w-40 rounded bg-white/[0.06] motion-safe:animate-pulse" />
          <div className="h-14 w-3/4 rounded-xl bg-white/[0.06] motion-safe:animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/[0.04] motion-safe:animate-pulse" />
        </div>
      )}

      {state.kind === "not-found" && (
        <div className="mt-12">
          <h1 className="font-display text-5xl leading-[0.9] font-bold tracking-tight uppercase sm:text-7xl">
            Ticket not found<span className="text-signal">.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-mist">
            There's no ticket #{id}. It may have been removed, or the link has a typo.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mt-12">
          <p className="font-display text-3xl font-semibold">Couldn't load this ticket.</p>
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

      {state.kind === "ready" && (
        <TicketView ticket={state.ticket} onCommentAdded={handleCommentAdded} />
      )}
    </main>
  );
}

function TicketView({
  ticket,
  onCommentAdded,
}: {
  ticket: TicketWithComments;
  onCommentAdded: (comment: Comment) => void;
}) {
  return (
    <>
      <header className="mt-8 motion-safe:animate-rise">
        <p className="eyebrow text-mist">
          #{ticket.id} · {label(ticket.category)}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
          {ticket.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <StatusPill status={ticket.status} />
          <PriorityLabel priority={ticket.priority} />
          <span className="text-sm text-mist">
            Opened {timeAgo(ticket.createdAt)} by {ticket.requesterName}
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section
            aria-labelledby="details-heading"
            className="rounded-2xl border border-white/10 bg-ink-800/60 p-6 backdrop-blur motion-safe:animate-rise [animation-delay:90ms] sm:p-8"
          >
            <h2 id="details-heading" className="eyebrow text-mist">
              What's going on
            </h2>
            <p className="mt-4 text-lg leading-relaxed whitespace-pre-wrap text-cream">
              {ticket.description}
            </p>
          </section>

          <section
            aria-labelledby="updates-heading"
            className="motion-safe:animate-rise [animation-delay:180ms]"
          >
            <h2 id="updates-heading" className="eyebrow text-mist">
              Updates · {ticket.comments.length}
            </h2>
            {ticket.comments.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-mist">
                No updates yet. The IT team will post here as they work on it.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {ticket.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </ol>
            )}

            <ReplyBox ticketId={ticket.id} onAdded={onCommentAdded} />
          </section>
        </div>

        <aside
          aria-label="Ticket info"
          className="h-fit rounded-2xl border border-white/10 bg-ink-800/60 p-6 backdrop-blur motion-safe:animate-rise [animation-delay:240ms]"
        >
          <dl className="space-y-5">
            <Info term="Status">
              <StatusPill status={ticket.status} />
            </Info>
            <Info term="Priority">
              <PriorityLabel priority={ticket.priority} />
            </Info>
            <Info term="Category">{label(ticket.category)}</Info>
            <Info term="Reported by">{ticket.requesterName}</Info>
            <Info term="Assigned to">
              {ticket.assigneeName ?? <span className="text-mist">Not assigned yet</span>}
            </Info>
            <Info term="Opened">{fullDate(ticket.createdAt)}</Info>
            <Info term="Last update">{timeAgo(ticket.updatedAt)}</Info>
            {ticket.resolvedAt && <Info term="Resolved">{fullDate(ticket.resolvedAt)}</Info>}
          </dl>
        </aside>
      </div>
    </>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const isIt = comment.authorRole === "admin";
  const initials = comment.authorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <li className="flex gap-4 rounded-2xl border border-white/10 bg-ink-800/40 p-5 motion-safe:animate-rise">
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
          isIt ? "bg-signal text-ink-950" : "bg-white/10 text-cream"
        }`}
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-cream">{comment.authorName}</span>
          {isIt && (
            <span className="eyebrow rounded-full bg-signal/15 px-2 py-0.5 text-[9px] text-signal">
              IT team
            </span>
          )}
          <span className="text-mist">· {timeAgo(comment.createdAt)}</span>
        </p>
        <p className="mt-2 whitespace-pre-wrap text-cream/90">{comment.body}</p>
      </div>
    </li>
  );
}

function Info({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow text-[10px] text-mist">{term}</dt>
      <dd className="mt-1.5 text-cream">{children}</dd>
    </div>
  );
}

function ReplyBox({
  ticketId,
  onAdded,
}: {
  ticketId: number;
  onAdded: (comment: Comment) => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function post(event?: FormEvent) {
    event?.preventDefault();
    if (!body.trim()) {
      setError("Write something first");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      const comment = await api.addComment(ticketId, body);
      setBody("");
      onAdded(comment);
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.body ?? err.message) : (err as Error).message);
    } finally {
      setPosting(false);
    }
  }

  // cmd+enter (mac) or ctrl+enter posts, like most chat apps
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) post();
  }

  return (
    <form onSubmit={post} className="mt-4">
      <label htmlFor="reply" className="sr-only">
        Add an update
      </label>
      <textarea
        id="reply"
        rows={3}
        maxLength={5000}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Add an update or more details…"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "reply-error" : undefined}
        className="block w-full resize-y rounded-2xl border border-white/10 bg-ink-900/80 px-5 py-4 text-cream placeholder:text-mist/50 transition focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/30"
      />
      <div className="mt-3 flex items-center justify-between gap-4">
        <p id="reply-error" className="text-sm text-signal-soft" role={error ? "alert" : undefined}>
          {error ?? <span className="text-xs text-mist/60">⌘ + Enter to post</span>}
        </p>
        <button
          type="submit"
          disabled={posting}
          className="shrink-0 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-[0_0_24px_-6px] shadow-signal transition hover:bg-signal-soft disabled:opacity-60"
        >
          {posting ? "Posting…" : "Post update"}
        </button>
      </div>
    </form>
  );
}
