export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-slate-900 text-sm font-bold text-white">
              TS
            </span>
            <span className="font-semibold">TechSupport Hub</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Your tickets</h1>
        <p className="mt-1 text-sm text-slate-600">
          Report IT problems and follow them until they're fixed.
        </p>

        <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium">No tickets yet</p>
          <p className="mt-1 text-sm text-slate-500">
            When you report an issue, it will show up here with its status.
          </p>
        </div>
      </main>
    </div>
  );
}
