import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
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

  const title = view === "all" ? "All jobs" : view === "assigned" ? "Assigned jobs" : user?.role === "artisan" ? "Open jobs" : "Your jobs";
  const pill = (active) => `min-h-11 rounded-full px-4 text-sm font-medium ${active ? "bg-ink text-cream" : "border border-line bg-cream"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/dashboard" aria-label="Back" className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink no-underline">
            <ArrowLeft size={18} />
            Back
          </Link>
          <h1 className="font-display text-4xl">{title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={pill(view === "board")} onClick={() => setParams({})}>
            {user?.role === "artisan" ? "Open jobs" : "Your jobs"}
          </button>
          <button type="button" className={pill(view === "all")} onClick={() => setParams({ view: "all" })}>
            All jobs
          </button>
          <button type="button" className={pill(view === "assigned")} onClick={() => setParams({ view: "assigned" })}>
            Assigned jobs
          </button>
          {user?.role === "customer" && (
            <Link to="/jobs/new" className="inline-flex min-h-11 items-center rounded-full bg-copper px-4 text-sm font-medium text-cream no-underline">
              Post a job
            </Link>
          )}
        </div>
      </div>
      <label className="relative block max-w-xl">
        <span className="sr-only">Search jobs</span>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by trade, place, or title"
          className="min-h-12 w-full rounded-full border border-line bg-cream py-3 pl-11 pr-4 outline-none focus:border-copper"
        />
      </label>
      {error && <p className="text-sm text-copper-deep">{error}</p>}
      {loading ? <p className="text-muted">Loading jobs…</p> : shown.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-cream px-6 py-14 text-center">
          <p className="font-display text-2xl">No matching jobs</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {shown.map((job) => (
            <li key={job._id} className="rounded-card border border-line bg-cream p-5">
              <Link to={`/jobs/${job._id}`} className="block no-underline">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-2xl text-ink">{job.title}</h2>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs capitalize">{job.status?.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{job.description}</p>
                <p className="mt-3 text-sm">{job.category} · {job.location} · ₦{(job.budget || 0).toLocaleString()}</p>
              </Link>
              <div className="mt-4 border-t border-line pt-4">
                <ShareBar title="Share" text={`${job.title} in ${job.location} on Craftad`} url={`/jobs/${job._id}`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
