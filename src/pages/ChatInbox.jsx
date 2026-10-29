import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function ChatInbox() {
  const { token } = useSession();
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.allSettled([craftad.myJobs(token), craftad.openJobs(token)]).then((results) => {
      const all = results.flatMap((result) => (result.status === "fulfilled" ? listOf(result.value, ["jobs"]) : []));
      const seen = new Set();
      setJobs(all.filter((job) => (seen.has(job._id) ? false : seen.add(job._id))));
    }).catch((err) => setError(err.message));
  }, [token]);

  const threads = jobs.filter((job) => job.status !== "open");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Chat</h1>
        <p className="mt-1 text-muted">One thread per job, once an artisan is assigned.</p>
      </div>
      {error && <p className="text-sm text-copper-deep">{error}</p>}
      {threads.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-cream px-6 py-14 text-center">
          <MessageSquare className="mx-auto text-copper" />
          <p className="mt-3 font-display text-2xl">No chats yet</p>
          <Link to="/jobs" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-cream no-underline">Go to jobs</Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {threads.map((job) => (
            <li key={job._id}>
              <Link to={`/chat/${job._id}`} className="flex items-center gap-3 rounded-card border border-line bg-cream p-4 no-underline">
                <MessageSquare size={18} className="text-copper" />
                <span className="font-medium text-ink">{job.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
