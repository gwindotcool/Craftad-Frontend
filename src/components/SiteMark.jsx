import { Link } from "react-router-dom";

export function SiteMark({ light = false, to = "/" }) {
    return (
        <Link
            to={to}
            className="inline-flex items-center gap-2.5 no-underline transition-opacity hover:opacity-85"
        >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-copper text-sm font-semibold text-white shadow-sm">
        C
      </span>
            <span
                className={`font-display text-xl font-semibold tracking-tight ${
                    light ? "text-[#FAF6EF]" : "text-ink"
                }`}
            >
        Craftad
      </span>
        </Link>
    );
}