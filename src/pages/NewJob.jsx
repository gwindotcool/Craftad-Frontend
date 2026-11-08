import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle, Sparkles } from "lucide-react";
import { craftad } from "../api";
import { useSession } from "../session";

const CATEGORIES = ["electrician", "plumber", "carpenter", "mechanic", "welder", "painter", "cleaner"];

export function NewJob() {
    const { token } = useSession();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", description: "", category: "plumber", budget: "", location: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const field = "mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10 shadow-sm";

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
        <div className="mx-auto max-w-2xl space-y-8 pb-12">

            {/* Top Back Link & Heading */}
            <div>
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted no-underline transition hover:text-copper mb-3"
                >
                    <ArrowLeft size={16} /> Back to jobs directory
                </Link>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">CUSTOMER WORKSPACE</p>
                <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl text-ink">Post a new job</h1>
                <p className="mt-1 text-sm text-muted">Create a detailed service request to connect with verified professional artisans.</p>
            </div>

            {/* Main Form Container */}
            <form onSubmit={onSubmit} className="grid gap-6 rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10">

                {error && (
                    <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                        {error}
                    </div>
                )}

                <label className="block text-sm font-semibold text-ink">
                    Project title
                    <input
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Residential 3-phase wiring repair"
                        className={field}
                    />
                </label>

                <label className="block text-sm font-semibold text-ink">
                    What needs doing (Description)
                    <textarea
                        required
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Provide clear specifications of the service required..."
                        className={field}
                    />
                </label>

                <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-ink">
                        Required trade category
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className={`${field} capitalize`}
                        >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>

                    <label className="block text-sm font-semibold text-ink">
                        Project budget (₦)
                        <input
                            required
                            type="number"
                            min={0}
                            value={form.budget}
                            onChange={(e) => setForm({ ...form, budget: e.target.value })}
                            placeholder="e.g. 75000"
                            className={field}
                        />
                    </label>
                </div>

                <label className="block text-sm font-semibold text-ink">
                    Service location / Address
                    <input
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="e.g. Ikeja, Lagos"
                        className={field}
                    />
                </label>

                <div className="pt-2">
                    <button
                        disabled={busy}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-copper px-8 text-sm font-semibold text-cream shadow-md transition-all hover:bg-copper-deep disabled:opacity-60"
                    >
                        <PlusCircle size={18} />
                        <span>{busy ? "Publishing job listing..." : "Publish job to marketplace"}</span>
                    </button>
                </div>

            </form>
        </div>
    );
}