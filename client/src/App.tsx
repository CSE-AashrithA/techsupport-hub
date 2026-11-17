import ApiStatus from "./components/ApiStatus";
import DeskPulse from "./components/DeskPulse";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span
              className="size-2.5 rotate-45 bg-signal shadow-[0_0_14px] shadow-signal"
              aria-hidden="true"
            />
            <span className="eyebrow text-sm text-cream">TechSupport Hub</span>
          </div>
          <ApiStatus />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="eyebrow inline-block rounded-full bg-signal motion-safe:animate-rise px-3 py-1.5 text-ink-950">
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
          </div>

          <div className="motion-safe:animate-rise [animation-delay:240ms]">
            <DeskPulse />
          </div>
        </div>

        <section
          aria-label="Your tickets"
          className="mt-14 motion-safe:animate-rise [animation-delay:300ms] rounded-2xl border border-white/10 bg-ink-800/60 p-10 backdrop-blur sm:p-14"
        >
          <p className="eyebrow text-mist">Queue · 0 open</p>
          <p className="mt-3 font-display text-2xl font-semibold">Nothing in your queue.</p>
          <p className="mt-2 max-w-md text-mist">
            When you report an issue it lands here, with its status and who's working on it.
          </p>
        </section>
      </main>
    </div>
  );
}
