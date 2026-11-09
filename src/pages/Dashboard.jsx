import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { SocialLinksForm } from "../components/SocialLinksForm";

export function Dashboard() {
    const { token, user } = useSession();

    const [jobs, setJobs] = useState([]);
    const [balance, setBalance] = useState(null);
    const [note, setNote] = useState("");

    const [skills, setSkills] = useState("");
    const [years, setYears] = useState("1");
    const [bio, setBio] = useState("");
    const [profileNote, setProfileNote] = useState("");

    useEffect(() => {
        if (!token || !user) return;

        const load =
            user.role === "artisan"
                ? craftad.openJobs(token)
                : craftad.myJobs(token);

        load
            .then((data) => setJobs(listOf(data, ["jobs"])))
            .catch((err) => setNote(err.message));

        craftad
            .wallet(token)
            .then((data) => setBalance(data.wallet?.balance ?? null))
            .catch(() => setBalance(null));

    }, [token, user]);

    return (
        <div className="space-y-10 pb-12">
            {/* Premium Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1714] via-[#241d17] to-copper-deep p-8 text-[#f4efe6] shadow-xl sm:p-10">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl" />
                <div className="absolute -left-12 -bottom-16 h-48 w-48 rounded-full border border-copper/20 bg-copper/10 blur-xl" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-copper backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-copper animate-pulse" />
                            {user?.role} Workspace
                        </div>

                        <h1 className="font-display text-3xl tracking-tight sm:text-5xl text-white">
                            Welcome back, {user?.fullName?.split(" ")[0] || "there"}.
                        </h1>

                        <p className="max-w-xl text-sm leading-relaxed text-[#f4efe6]/80">
                            {user?.role === "artisan"
                                ? "Your next high-value project is waiting. Explore open opportunities and manage your deliverables seamlessly."
                                : "Monitor active escrow projects, track your wallet liquidity, and collaborate with verified professionals."}
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-3">
                        {user?.role === "customer" && (
                            <Link
                                to="/jobs/new"
                                className="inline-flex min-h-12 items-center rounded-full bg-copper px-6 text-sm font-semibold text-white shadow-lg shadow-copper/25 transition-all hover:bg-copper-deep hover:shadow-xl hover:-translate-y-0.5 no-underline"
                            >
                                + Post a new job
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid gap-5 sm:grid-cols-3">
                <StatCard
                    label={user?.role === "artisan" ? "Open workspace jobs" : "Active projects"}
                    value={String(jobs.length)}
                    description="Total jobs currently tracked"
                    trend="Live sync"
                />

                <StatCard
                    label="Escrow Wallet balance"
                    value={balance === null ? "—" : `₦${balance.toLocaleString()}`}
                    description="Available withdrawable funds"
                    trend="Secure"
                />

                <StatCard
                    label="Account status"
                    value="Verified"
                    description={user?.role === "customer" ? "Customer account active" : "Artisan profile live"}
                    trend="Trusted"
                />
            </div>

            {note && (
                <div className="rounded-2xl border border-copper/30 bg-copper/5 px-5 py-4 text-sm text-copper-deep shadow-sm">
                    {note}
                </div>
            )}

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-cream p-4 backdrop-blur-sm transition-colors duration-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted px-2">Quick filters:</span>

                <Link
                    to="/jobs?view=all"
                    className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-xs font-medium text-ink no-underline transition-all hover:border-copper hover:bg-cream hover:shadow-sm"
                >
                    Browse all marketplace jobs
                </Link>

                <Link
                    to="/jobs?view=assigned"
                    className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-xs font-medium text-ink no-underline transition-all hover:border-copper hover:bg-cream hover:shadow-sm"
                >
                    Assigned jobs view
                </Link>

                <Link
                    to="/wallet"
                    className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-xs font-medium text-ink no-underline transition-all hover:border-copper hover:bg-cream hover:shadow-sm ml-auto"
                >
                    View detailed ledger →
                </Link>
            </div>

            {/* Artisan Profile Section (If artisan) */}
            {user?.role === "artisan" && (
                <form
                    className="grid gap-6 rounded-[2rem] border border-line bg-cream p-8 shadow-sm transition-all sm:p-10"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setProfileNote("");

                        const body = {
                            skills: skills
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            yearsOfExperience: Number(years),
                            bio,
                            location: {
                                type: "Point",
                                coordinates: [3.3792, 6.5244],
                            },
                        };

                        try {
                            try {
                                await craftad.updateArtisan(token, body);
                            } catch {
                                await craftad.createArtisan(token, body);
                            }

                            setProfileNote("Artisan profile saved successfully.");
                        } catch (err) {
                            setProfileNote(
                                err instanceof Error
                                    ? err.message
                                    : "Could not save the profile"
                            );
                        }
                    }}
                >
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            PROFESSIONAL CREDENTIALS
                        </p>
                        <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                            Artisan portfolio profile
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                            Update your public expertise so customers can evaluate your craftsmanship.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <input
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="Skills (e.g. Carpentry, Plumbing, UI Design)"
                            className="min-h-12 rounded-xl border border-line bg-paper text-ink placeholder:text-muted px-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                            required
                        />

                        <input
                            type="number"
                            min={0}
                            value={years}
                            onChange={(e) => setYears(e.target.value)}
                            placeholder="Years of experience"
                            className="min-h-12 rounded-xl border border-line bg-paper text-ink placeholder:text-muted px-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                            required
                        />
                    </div>

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        placeholder="Write a compelling professional summary..."
                        className="rounded-xl border border-line bg-paper text-ink placeholder:text-muted p-4 text-sm outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/10"
                    />

                    <div className="flex items-center gap-4">
                        <button className="min-h-11 rounded-full bg-copper text-white px-7 text-sm font-semibold transition-all hover:bg-copper-deep hover:shadow-md">
                            Save changes
                        </button>
                        {profileNote && (
                            <span className="text-sm font-medium text-copper-deep">{profileNote}</span>
                        )}
                    </div>
                </form>
            )}

            {/* Social Links Modular Card */}
            <div className="grid gap-6 rounded-[2rem] border border-line bg-cream p-8 shadow-sm sm:p-10 transition-colors duration-200">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                        NETWORKING CHANNELS
                    </p>
                    <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                        Social links & handles
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                        Connect your digital profiles for direct client communication.
                    </p>
                </div>
                <SocialLinksForm />
            </div>

            {/* Recent Activity Feed */}
            <section className="space-y-5">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper">
                            WORKSPACE STREAM
                        </p>
                        <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                            Recent jobs ledger
                        </h2>
                    </div>
                    <Link to="/jobs" className="text-xs font-semibold text-copper hover:underline">
                        View all activity →
                    </Link>
                </div>

                <div className="grid gap-3.5">
                    {jobs.slice(0, 4).map((job) => (
                        <Link
                            key={job._id}
                            to={`/jobs/${job._id}`}
                            className="group flex flex-col justify-between gap-4 rounded-2xl border border-line bg-cream p-6 no-underline transition-all hover:-translate-y-0.5 hover:border-copper/50 hover:shadow-lg sm:flex-row sm:items-center"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-ink transition-colors group-hover:text-copper">
                                        {job.title}
                                    </h3>
                                    <span className="rounded-full bg-paper px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-muted border border-line/60">
                                        {job.category || "General"}
                                    </span>
                                </div>
                                <p className="text-xs text-muted">
                                    📍 {job.location || "Remote / Standard"}
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-left sm:text-right">
                                    <p className="font-display text-lg font-bold text-ink">
                                        ₦{(job.budget || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs capitalize text-copper font-medium">
                                        {job.status?.replaceAll("_", " ")}
                                    </p>
                                </div>
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper border border-line text-muted transition-colors group-hover:border-copper group-hover:text-copper">
                                    →
                                </span>
                            </div>
                        </Link>
                    ))}

                    {jobs.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-line bg-cream p-12 text-center">
                            <p className="font-display text-xl text-ink">No recent job activity found.</p>
                            <p className="mt-1 text-sm text-muted">
                                Your active pipeline will populate here automatically once work begins.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value, description, trend }) {
    return (
        <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-md sm:p-7">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
                <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-bold text-copper border border-line">
                    {trend}
                </span>
            </div>

            <p className="mt-4 break-words font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {value}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-muted">
                {description}
            </p>
        </div>
    );
}