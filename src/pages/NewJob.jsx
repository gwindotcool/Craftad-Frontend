import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { craftad } from "../api";
import { useSession } from "../session";

const CATEGORIES = ["electrician", "plumber", "carpenter", "mechanic", "welder", "painter", "cleaner"];

export function NewJob() {
  const { token } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "plumber", budget: "", location: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const field = "mt-1.5 w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none focus:border-copper";

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await craftad.createJob(token, { ...form, budget: Number(form.budget) });
      navigate("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the job");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link to="/jobs" className="text-sm text-muted no-underline">Back to jobs</Link>
      <h1 className="mt-3 font-display text-4xl">Post a job</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && <p className="text-sm text-copper-deep">{error}</p>}
        <label className="block text-sm font-medium">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} /></label>
        <label className="block text-sm font-medium">What needs doing<textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={field} /></label>
        <label className="block text-sm font-medium">Trade
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Budget (₦)<input required type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={field} /></label>
        <label className="block text-sm font-medium">Where<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={field} /></label>
        <button disabled={busy} className="min-h-12 w-full rounded-full bg-copper font-medium text-cream disabled:opacity-60">{busy ? "Posting…" : "Publish job"}</button>
      </form>
    </div>
  );
}
