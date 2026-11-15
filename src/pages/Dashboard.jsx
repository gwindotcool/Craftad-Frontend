import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Eye,
    EyeOff,
    MapPin,
    Plus,
    ShieldCheck,
    Wallet,
} from "lucide-react";

import { craftad, listOf } from "../api";
import { useSession } from "../session";
import { SocialLinksForm } from "../components/SocialLinksForm";

const ACTIVE_JOB_STATUSES = ["open", "assigned", "in_progress"];

function formatNaira(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "—";

    return `₦${value.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

function getJobAmountLabel(job) {
    if (job.agreedPrice != null) {
        return formatNaira(job.agreedPrice);
    }

    if (job.budget != null) {
        return formatNaira(job.budget);
    }

    return "Open budget";
}

function formatJobStatus(status) {
    if (!status) return "Status unavailable";

    return status.replaceAll("_", " ");
}

export function Dashboard() {
    const { token, user } = useSession();

    const [jobs, setJobs] = useState([]);
    const [balance, setBalance] = useState(null);
    const [note, setNote] = useState("");
    const [jobsLoading, setJobsLoading] = useState(true);

    const [skills, setSkills] = useState("");
    const [years, setYears] = useState("1");
    const [bio, setBio] = useState("");
    const [profileNote, setProfileNote] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);
    const [balanceVisible, setBalanceVisible] = useState(true);

    useEffect(() => {
        if (!token || !user) return;

        let cancelled = false;

        async function loadDashboard() {
            setJobsLoading(true);
            setNote("");

            const jobsRequest =
                user.role === "artisan"
                    ? craftad.openJobs(token)
                    : craftad.myJobs(token);

            const [jobsResult, walletResult] = await Promise.allSettled([
                jobsRequest,
                craftad.wallet(token),
            ]);

            if (cancelled) return;

            if (jobsResult.status === "fulfilled") {
                setJobs(listOf(jobsResult.value, ["jobs"]));
            } else {
                setJobs([]);
                setNote(
                    jobsResult.reason?.message ||
                    "Unable to load your jobs. Please try again."
                );
            }

            if (walletResult.status === "fulfilled") {
                setBalance(
                    walletResult.value?.wallet?.balance ?? null
                );
            } else {
                setBalance(null);
            }

            setJobsLoading(false);
        }

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [token, user]);

    const isArtisan = user?.role === "artisan";

    const activeJobs = isArtisan
        ? jobs.filter((job) => job.status === "open")
        : jobs.filter((job) =>
            ACTIVE_JOB_STATUSES.includes(job.status)
        );

    async function handleProfileSubmit(event) {
        event.preventDefault();
        setProfileNote("");
        setProfileSaving(true);

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
        } catch (error) {
            setProfileNote(
                error instanceof Error
                    ? error.message
                    : "Could not save your profile."
            );
        } finally {
            setProfileSaving(false);
        }
    }

    return (
        <div className="space-y-8 pb-12 sm:space-y-10">

            {/* Welcome Banner */}
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1714] via-[#241d17] to-copper-deep p-6 text-[#f4efe6] shadow-xl sm:p-9 lg:p-10">

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl"
                />

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border border-copper/20 bg-copper/10 blur-2xl"
                />

                <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">

                    <div className="max-w-2xl space-y-4">

                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-copper backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                            {isArtisan ? "Artisan Workspace" : "Customer Workspace"}
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Welcome back,{" "}
                                {user?.fullName?.split(" ")[0] || "there"}.
                            </h1>

                            <p className="max-w-xl text-sm leading-relaxed text-[#f4efe6]/75 sm:text-base">
                                {isArtisan
                                    ? "Discover new opportunities, manage your applications, and keep your projects moving."
                                    : "Manage your projects, follow job progress, and stay on top of your Craftad activity."}
                            </p>
                        </div>
                    </div>

                    {user?.role === "customer" && (
                        <Link
                            to="/jobs/new"
                            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white no-underline shadow-lg shadow-copper/20 transition-all hover:-translate-y-0.5 hover:bg-copper-deep hover:shadow-xl"
                        >
                            <Plus size={17} />
                            Post a Job
                        </Link>
                    )}

                    {isArtisan && (
                        <Link
                            to="/jobs?view=all"
                            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-copper px-6 text-sm font-semibold text-white no-underline shadow-lg shadow-copper/20 transition-all hover:-translate-y-0.5 hover:bg-copper-deep hover:shadow-xl"
                        >
                            Explore Jobs
                            <ArrowUpRight size={17} />
                        </Link>
                    )}
                </div>
            </section>

            {/* Account Overview */}
            <section className="space-y-5">

                <div className="flex flex-col gap-1">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                        Account Overview
                    </h2>

                    <p className="text-sm text-muted">
                        A quick look at your jobs, wallet, and account.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    <StatCard
                        label={isArtisan ? "Open Opportunities" : "Active Jobs"}
                        value={
                            jobsLoading
                                ? "..."
                                : String(activeJobs.length)
                        }
                        description={
                            isArtisan
                                ? "Available jobs you can explore"
                                : "Jobs that are open or currently in progress"
                        }
                        icon={BriefcaseBusiness}
                    />


                    <StatCard
                        label="Wallet Balance"
                        value={
                            balance === null
                                ? "—"
                                : balanceVisible
                                    ? formatNaira(balance)
                                    : "₦ ••••••"
                        }
                        description="Current wallet balance"
                        icon={Wallet}
                        action={
                            balance !== null && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setBalanceVisible((visible) => !visible)
                                    }
                                    aria-label={
                                        balanceVisible
                                            ? "Hide wallet balance"
                                            : "Show wallet balance"
                                    }
                                    title={
                                        balanceVisible
                                            ? "Hide balance"
                                            : "Show balance"
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-copper/10 hover:text-copper focus:outline-none focus:ring-2 focus:ring-copper/30"
                                >
                                    {balanceVisible ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>
                            )
                        }
                    />

                    <StatCard
                        label="Account Status"
                        value="Active"
                        description="Your Craftad account is currently accessible"
                        icon={ShieldCheck}
                        status
                    />


                </div>
            </section>

            {/* Dashboard Error */}
            {note && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-600"
                >
                    {note}
                </div>
            )}

            {/* Quick Navigation */}
            <section className="rounded-2xl border border-line bg-cream p-4 sm:p-5">

                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-ink">
                            Quick Access
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                            Jump straight to what you need.
                        </p>
                    </div>

                    <ArrowUpRight size={18} className="text-muted" />
                </div>

                <div className="flex flex-wrap gap-2.5">

                    <QuickLink to="/jobs?view=all">
                        Browse Marketplace
                    </QuickLink>

                    <QuickLink to="/jobs?view=assigned">
                        Assigned Jobs
                    </QuickLink>

                    <Link
                        to="/wallet"
                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-copper px-4 text-xs font-semibold text-white no-underline transition-colors hover:bg-copper-deep sm:ml-auto"
                    >
                        View Wallet
                        <ArrowRight size={14} />
                    </Link>

                </div>
            </section>

            {/* Artisan Profile */}
            {isArtisan && (
                <section className="rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm sm:p-8">

                    <div className="mb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-copper">
                            PROFESSIONAL PROFILE
                        </p>

                        <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                            Your Artisan Profile
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                            Share your experience and professional skills
                            so customers can better understand your services.
                        </p>
                    </div>

                    <form
                        className="grid gap-5"
                        onSubmit={handleProfileSubmit}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">

                            <div className="space-y-2">
                                <label
                                    htmlFor="artisan-skills"
                                    className="text-xs font-semibold text-ink"
                                >
                                    Professional Skills
                                </label>

                                <input
                                    id="artisan-skills"
                                    value={skills}
                                    onChange={(event) =>
                                        setSkills(event.target.value)
                                    }
                                    placeholder="e.g. Carpentry, Plumbing"
                                    className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/10"
                                    required
                                />

                                <p className="text-[11px] text-muted">
                                    Separate multiple skills with commas.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="artisan-years"
                                    className="text-xs font-semibold text-ink"
                                >
                                    Years of Experience
                                </label>

                                <input
                                    id="artisan-years"
                                    type="number"
                                    min="0"
                                    max="80"
                                    value={years}
                                    onChange={(event) =>
                                        setYears(event.target.value)
                                    }
                                    className="min-h-12 w-full rounded-xl border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="artisan-bio"
                                className="text-xs font-semibold text-ink"
                            >
                                Professional Summary
                            </label>

                            <textarea
                                id="artisan-bio"
                                value={bio}
                                onChange={(event) =>
                                    setBio(event.target.value)
                                }
                                rows={4}
                                maxLength={1000}
                                placeholder="Tell customers about your experience, services, and the quality of your work..."
                                className="w-full resize-y rounded-xl border border-line bg-paper p-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/10"
                            />

                            <p className="text-right text-[11px] text-muted">
                                {bio.length}/1000
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                type="submit"
                                disabled={profileSaving}
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-copper px-7 text-sm font-semibold text-white transition-all hover:bg-copper-deep hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {profileSaving ? "Saving..." : "Save Profile"}
                            </button>

                            {profileNote && (
                                <p
                                    role="status"
                                    className="text-sm font-medium text-copper-deep"
                                >
                                    {profileNote}
                                </p>
                            )}
                        </div>
                    </form>
                </section>
            )}

            {/* Social Links */}
            <section className="rounded-[1.75rem] border border-line bg-cream p-6 shadow-sm sm:p-8">

                <div className="mb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-copper">
                        CONNECT
                    </p>

                    <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                        Social Links
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-muted">
                        Add your professional social profiles to help
                        customers learn more about your work.
                    </p>
                </div>

                <SocialLinksForm />
            </section>

            {/* Recent Jobs */}
            <section className="space-y-5">

                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-copper">
                            YOUR WORKSPACE
                        </p>

                        <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                            {isArtisan ? "Available Jobs" : "Recent Jobs"}
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            {isArtisan
                                ? "Explore opportunities currently available on Craftad."
                                : "Keep track of your latest projects and their progress."}
                        </p>
                    </div>

                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-copper no-underline transition-colors hover:text-copper-deep"
                    >
                        View All
                        <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid gap-3">

                    {jobsLoading ? (
                        <div className="rounded-2xl border border-line bg-cream p-10 text-center">
                            <p className="text-sm text-muted">
                                Loading your jobs...
                            </p>
                        </div>
                    ) : jobs.length > 0 ? (
                        jobs.slice(0, 4).map((job) => (
                            <Link
                                key={job._id}
                                to={`/jobs/${job._id}`}
                                className="group flex flex-col justify-between gap-4 rounded-2xl border border-line bg-cream p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md sm:flex-row sm:items-center sm:p-6"
                            >
                                <div className="min-w-0 space-y-2">

                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="truncate font-semibold text-ink transition-colors group-hover:text-copper">
                                            {job.title || "Untitled Job"}
                                        </h3>

                                        <span className="rounded-full border border-line bg-paper px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                                            {job.category || "General"}
                                        </span>
                                    </div>

                                    <p className="flex items-center gap-1.5 text-xs text-muted">
                                        <MapPin size={13} />
                                        {job.location || "Location not specified"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between gap-4 sm:justify-end">

                                    <div className="sm:text-right">
                                        <p className="font-display text-lg font-semibold text-ink">
                                            {getJobAmountLabel(job)}
                                        </p>

                                        <p className="mt-1 text-xs font-medium capitalize text-copper">
                                            {formatJobStatus(job.status)}
                                        </p>
                                    </div>

                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-muted transition-all group-hover:border-copper group-hover:text-copper">
                                        <ArrowUpRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-line bg-cream px-6 py-12 text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper text-muted">
                                <BriefcaseBusiness size={21} />
                            </div>

                            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                                {isArtisan
                                    ? "No open opportunities yet"
                                    : "No job activity yet"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                                {isArtisan
                                    ? "New opportunities will appear here when customers post jobs."
                                    : "Your projects will appear here once you create or receive a job."}
                            </p>

                            <Link
                                to={isArtisan ? "/jobs?view=all" : "/jobs/new"}
                                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-copper px-5 text-xs font-semibold text-white no-underline transition-colors hover:bg-copper-deep"
                            >
                                {isArtisan ? "Explore Jobs" : "Post Your First Job"}
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}

                </div>
            </section>
        </div>
    );
}

function StatCard({
                      label,
                      value,
                      description,
                      icon: Icon,
                      status = false,
                      action,
                  }) {
    return (

        <article className="group relative overflow-hidden rounded-2xl border border-line bg-cream p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-copper/40 hover:shadow-md sm:p-6">

            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted">
                        {label}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <p className="break-words font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {value}
                        </p>

                        {action}
                    </div>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-copper/15 bg-copper/10 text-copper transition-colors group-hover:bg-copper/15">
                    <Icon size={20} strokeWidth={1.8} />
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-4">
                <p className="text-xs leading-relaxed text-muted">
                    {description}
                </p>

                {status && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
            </span>
                )}
            </div>
        </article>

    );
}

function QuickLink({ to, children }) {
    return (
        <Link
            to={to}
            className="inline-flex min-h-10 items-center rounded-full border border-line bg-paper px-4 text-xs font-medium text-ink no-underline transition-all hover:border-copper hover:bg-cream hover:shadow-sm"
        >
            {children}
        </Link>
    );
}
