import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-24 pb-24">
      <p className="eyebrow text-signal">Error 404</p>
      <h1 className="mt-4 font-display text-6xl leading-[0.9] font-bold tracking-tight uppercase sm:text-8xl">
        Lost
        <br />
        signal<span className="text-signal">.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-mist">
        There's nothing at this address. It may have moved, or the link has a typo.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-cream transition hover:border-signal hover:text-signal"
      >
        <span aria-hidden="true">←</span> Back to your tickets
      </Link>
    </main>
  );
}
