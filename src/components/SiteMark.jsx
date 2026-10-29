import { Link } from "react-router-dom";

export function SiteMark({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-copper text-sm font-semibold text-cream">C</span>
      <span className={`font-display text-xl tracking-tight ${light ? "text-cream" : "text-ink"}`}>Craftad</span>
    </Link>
  );
}
