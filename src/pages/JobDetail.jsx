import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { craftad, listOf } from "../api";
import { useSession } from "../session";

export function JobDetail() {
  const { jobId } = useParams();
  const { token, user } = useSession();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [mine, open] = await Promise.allSettled([craftad.myJobs(token), craftad.openJobs(token)]);
    const all = [
      ...(mine.status === "fulfilled" ? listOf(mine.value, ["jobs"]) : []),
      ...(open.status === "fulfilled" ? listOf(open.value, ["jobs"]) : []),
    ];
    const found = all.find((item) => item._id === jobId) || null;
    setJob(found);
    if (found && user?.role === "customer") {
      try {
        const data = await craftad.applications(token, jobId);
        setApps(listOf(data, ["applications"]));
      } catch {
        setApps([]);
      }
    }
  }

  useEffect(() => {
    if (!token) return;
    load().catch((err) => setError(err.message));
  }, [token, jobId, user?.role]);

  async function run(action, ok) {
    setError("");
    try {
      await action();
      setNote(ok);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t work");
    }
  }

  if (!job) {
    return (
      <div>
        <Link to="/jobs" className="text-sm text-muted no-underline">Back to jobs</Link>
        <p className="mt-6 text-muted">{error || "Looking up this job…"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/jobs" className="text-sm text-muted no-underline">Back to jobs</Link>
      {error && <p className="text-sm text-copper-deep">{error}</p>}
      {note && <p className="text-sm text-pine">{note}</p>}
      <article className="rounded-card border border-line bg-cream p-6">
        <p className="text-sm capitalize text-muted">{job.category} · {job.status?.replaceAll("_", " ")}</p>
        <h1 className="mt-2 font-display text-4xl">{job.title}</h1>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted">{job.description}</p>
        <p className="mt-4 text-sm">{job.location} · Budget ₦{(job.budget || 0).toLocaleString()}{job.agreedPrice ? ` · Agreed ₦${job.agreedPrice.toLocaleString()}` : ""}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {job.status !== "open" && <Link to={`/chat/${jobId}`} className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-cream no-underline">Open chat</Link>}
          {user?.role === "artisan" && job.status === "assigned" && <button className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => run(() => craftad.startJob(token, jobId), "Job started")}>Start work</button>}
          {user?.role === "artisan" && job.status === "in_progress" && <button className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => run(() => craftad.completeJob(token, jobId), "Marked complete")}>Mark complete</button>}
          {user?.role === "artisan" && job.status === "assigned" && <button className="min-h-11 rounded-full border border-line px-4 text-sm text-copper-deep" onClick={() => run(() => craftad.rejectJob(token, jobId), "You declined this job")}>Decline job</button>}
          {user?.role === "customer" && job.status === "completed" && <button className="min-h-11 rounded-full bg-copper px-4 text-sm text-cream" onClick={() => run(() => craftad.confirmJob(token, jobId), "You confirmed the job")}>Confirm it’s done</button>}
        </div>
      </article>
      {user?.role === "artisan" && job.status === "open" && (
        <form className="rounded-card border border-line bg-cream p-6" onSubmit={(e) => { e.preventDefault(); run(() => craftad.apply(token, jobId, { message, proposedPrice: Number(price) }), "Application sent"); }}>
          <h2 className="font-display text-2xl">Apply</h2>
          <textarea required rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-4 w-full rounded-2xl border border-line px-4 py-3" placeholder="Why you’re a fit" />
          <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-3 w-full rounded-2xl border border-line px-4 py-3" placeholder="Your price (₦)" />
          <button className="mt-4 min-h-11 rounded-full bg-copper px-5 text-sm font-medium text-cream">Send application</button>
        </form>
      )}
      {user?.role === "customer" && apps.length > 0 && (
        <section className="rounded-card border border-line bg-cream p-6">
          <h2 className="font-display text-2xl">Applications</h2>
          <ul className="mt-4 space-y-3">
            {apps.map((app) => (
              <li key={app._id} className="rounded-2xl bg-paper p-4">
                <p className="text-sm">{app.message}</p>
                <p className="mt-1 text-sm font-medium">₦{(app.proposedPrice || 0).toLocaleString()} · {app.status}</p>
                {app.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button className="min-h-10 rounded-full bg-ink px-4 text-sm text-cream" onClick={() => run(() => craftad.acceptApplication(token, app._id), "Application accepted")}>Accept</button>
                    <button className="min-h-10 rounded-full border border-line px-4 text-sm" onClick={() => run(() => craftad.rejectApplication(token, app._id), "Application rejected")}>Reject</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {user?.role === "customer" && (job.status === "customer_confirmed" || job.status === "paid") && (
        <form
          className="rounded-card border border-line bg-cream p-6"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => craftad.review(token, jobId, { rating: Number(rating), comment }), "Review saved");
          }}
        >
          <h2 className="font-display text-2xl">Review the work</h2>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="mt-4 w-full rounded-2xl border border-line px-4 py-3">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="How did the job go?" className="mt-3 w-full rounded-2xl border border-line px-4 py-3" />
          <button className="mt-4 min-h-11 rounded-full bg-ink px-5 text-sm font-medium text-cream">Send review</button>
        </form>
      )}
    </div>
  );
}
