import { Link, Outlet } from "react-router";
import ApiStatus from "./components/ApiStatus";

// the frame around every page: header on top, the current page below
export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="group flex items-center gap-3">
            <span
              className="size-2.5 rotate-45 bg-signal shadow-[0_0_14px] shadow-signal transition group-hover:rotate-[135deg]"
              aria-hidden="true"
            />
            <span className="eyebrow text-sm whitespace-nowrap text-cream">TechSupport Hub</span>
          </Link>
          <ApiStatus />
        </div>
      </header>

      <Outlet />
    </div>
  );
}
