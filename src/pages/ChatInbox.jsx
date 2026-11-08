import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function ChatInbox() {
    const { token } = useSession();
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        Promise.allSettled([craftad.myJobs(token), craftad.openJobs(token)])
            .then((results) => {
                const all = results.flatMap((result) => (result.status === "fulfilled" ? listOf(result.value, ["jobs"]) : []));
                const seen = new Set();
                setJobs(all.filter((job) => (seen.has(job._id) ? false : seen.add(job._id))));
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const threads = jobs.filter((job) => job.status !== "open");

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-12">
            {/* Header section */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">WORKSPACE COMMUNICATIONS</p>
                <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">Chat Inbox</h1>
                <p className="mt-1 text-sm text-muted">Secure messaging channels linked directly to your active project assignments.</p>
            </div>

            {error && (
                <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-[1.75rem] border border-line bg-cream p-12 text-center text-muted">
                    Loading conversation threads...
                </div>
            ) : threads.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-line bg-cream px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper border border-line text-copper mb-4">
                        <MessageSquare size={22} />
                    </div>
                    <p className="font-display text-2xl text-ink">No active chats yet</p>
                    <p className="mt-1 text-sm text-muted max-w-sm mx-auto">
                        Conversations open automatically once an artisan is assigned and work begins on a job.
                    </p>
                    <Link
                        to="/jobs"
                        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-cream no-underline transition-all hover:bg-copper shadow-sm"
                    >
                        Explore available jobs
                    </Link>
                </div>
            ) : (
                <ul className="grid gap-3.5">
                    {threads.map((job) => (
                        <li key={job._id}>
                            <Link
                                to={`/chat/${job._id}`}
                                className="group flex items-center justify-between rounded-2xl border border-line bg-cream p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper border border-line text-copper transition-colors group-hover:border-copper group-hover:bg-copper/5">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                    <span className="font-semibold text-ink transition-colors group-hover:text-copper block">
                      {job.title}
                    </span>
                                        <span className="text-xs capitalize text-muted">
                      Status: {job.status?.replaceAll("_", " ")} {job.category ? `· ${job.category}` : ""}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold text-muted transition-colors group-hover:text-copper">
                                    <span className="hidden sm:inline">Open thread</span>
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}