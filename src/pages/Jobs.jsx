import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Briefcase, Plus, MapPin } from "lucide-react";
import { craftad, listOf } from "../api";
import { ShareBar } from "../components/ShareBar";
import { useSession } from "../session";

export function Jobs() {
    const { token, user } = useSession();
    const [params, setParams] = useSearchParams();
    const view = params.get("view") === "assigned" ? "assigned" : params.get("view") === "all" ? "all" : "board";
    const [jobs, setJobs] = useState([]);
    const [q, setQ] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !user) return;
        setLoading(true);
        const load =
            view === "all"
                ? Promise.allSettled([craftad.myJobs(token), craftad.openJobs(token)]).then((results) => {
                    const merged = results.flatMap((result) => (result.status === "fulfilled" ? listOf(result.value, ["jobs"]) : []));
                    const seen = new Set();
                    return merged.filter((job) => (seen.has(job._id) ? false : seen.add(job._id)));
                })
                : (view === "assigned" || user.role !== "artisan" ? craftad.myJobs(token) : craftad.openJobs(token)).then((data) =>
                    listOf(data, ["jobs"]),
                );
        load
            .then((data) => setJobs(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token, user, view]);

    const shown = useMemo(() => {
        const base = view === "assigned" ? jobs.filter((job) => job.status && job.status !== "open") : jobs;
        const needle = q.trim().toLowerCase();
        if (!needle) return base;
        return base.filter((job) => [job.title, job.description, job.location, job.category].some((v) => v?.toLowerCase().includes(needle)));
    }, [jobs, q, view]);

    const title = view === "all" ? "All marketplace jobs" : view === "assigned" ? "Assigned contract jobs" : user?.role === "artisan" ? "Open available jobs" : "Your posted jobs";

    const pill = (active) => `inline-flex min-h-11 items-center rounded-full px-5 text-xs font-semibold tracking-wider uppercase transition-all shadow-sm ${
        active
            ? "bg-ink text-cream shadow-md"
            : "border border-line bg-cream text-muted hover:border-copper hover:text-ink"
    }`;

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-12">

            {/* Top Header & View Filter Tabs */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <Link
                        to="/dashboard"
                        aria-label="Back"
                        className="mb-3 inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper"
                    >
                        <ArrowLeft size={16} />
                        Back to dashboard
                    </Link>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">WORKSPACE DIRECTORY</p>
                    <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">{title}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button type="button" className={pill(view === "board")} onClick={() => setParams({})}>
                        {user?.role === "artisan" ? "Open jobs" : "Your jobs"}
                    </button>
                    <button type="button" className={pill(view === "all")} onClick={() => setParams({ view: "all" })}>
                        All jobs
                    </button>
                    <button type="button" className={pill(view === "assigned")} onClick={() => setParams({ view: "assigned" })}>
                        Assigned
                    </button>
                    {user?.role === "customer" && (
                        <Link
                            to="/jobs/new"
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-6 text-xs font-semibold uppercase tracking-wider text-cream no-underline transition-all hover:bg-copper-deep shadow-md"
                        >
                            <Plus size={16} />
                            Post a job
                        </Link>
                    )}
                </div>
            </div>

            {/* Search Input Bar */}
            <label className="relative block">
                <span className="sr-only">Search jobs</span>
                <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by trade, location, or project title..."
                    className="min-h-13 w-full rounded-2xl border border-line bg-cream py-3 pl-12 pr-5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 shadow-sm"
                />
            </label>

            {/* Error State Banner */}
            {error && (
                <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {error}
                </div>
            )}

            {/* Jobs List / States */}
            {loading ? (
                <div className="rounded-[1.75rem] border border-line bg-cream p-12 text-center text-muted">
                    Loading workspace jobs...
                </div>
            ) : shown.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-line bg-cream px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-copper mb-4">
                        <Briefcase size={22} />
                    </div>
                    <p className="font-display text-2xl text-ink">No matching jobs found</p>
                    <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
                        Try adjusting your search criteria or browse another view from the options above.
                    </p>
                </div>
            ) : (
                <ul className="grid gap-4">
                    {shown.map((job) => (
                        <li
                            key={job._id}
                            className="group rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:shadow-md"
                        >
                            <Link to={`/jobs/${job._id}`} className="block no-underline">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="font-display text-xl text-ink transition-colors group-hover:text-copper">
                                        {job.title}
                                    </h2>
                                    <span className="rounded-full bg-paper px-3.5 py-1 text-xs font-semibold capitalize text-muted border border-line/60">
                    {job.status?.replaceAll("_", " ")}
                  </span>
                                </div>

                                <p className="mt-2.5 text-sm leading-relaxed text-muted line-clamp-2">
                                    {job.description || "No description provided."}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink">
                  <span className="rounded-full bg-paper px-3 py-1 border border-line/60 text-copper">
                    {job.category || "General service"}
                  </span>
                                    <span className="inline-flex items-center gap-1.5 text-muted">
                    <MapPin size={14} className="text-copper" />
                                        {job.location || "Location not specified"}
                  </span>
                                    <span className="ml-auto font-display text-base font-bold text-ink">
                    ₦{(job.budget || 0).toLocaleString()}
                  </span>
                                </div>
                            </Link>

                            <div className="mt-5 border-t border-line/80 pt-4 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Project Share</span>
                                <ShareBar title="Share" text={`${job.title} in ${job.location} on Craftad`} url={`/jobs/${job._id}`} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}